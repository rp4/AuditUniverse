/**
 * ForceGraph3D Component
 *
 * Core 3D force-directed graph visualization with visual encoding.
 * Uses react-force-graph-3d and applies our visual encoding system.
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { createNodeShape, getLinkColor, getLinkWidth, getLinkOpacity } from '@/lib/nodeShapes';
import { useGraphStore } from '@/store/graphStore';
import type { GraphData, Node, Link } from '@/types';

// Make THREE and SpriteText available globally for the component
if (typeof window !== 'undefined') {
  (window as any).THREE = THREE;
  (window as any).SpriteText = SpriteText;
}

interface ForceGraph3DProps {
  data: GraphData;
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  selectedNodeId?: string | null;
  highlightedNodeIds?: Set<string>;
}

export function ForceGraph3DComponent({
  data,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  highlightedNodeIds = new Set()
}: ForceGraph3DProps) {
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const riskViewMode = useGraphStore(state => state.riskViewMode);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Build node ID to node map for quick lookups
  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>();
    data.nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [data.nodes]);

  // Build link map for connected nodes lookup
  const linkMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      if (!map.has(sourceId)) map.set(sourceId, new Set());
      if (!map.has(targetId)) map.set(targetId, new Set());

      map.get(sourceId)!.add(targetId);
      map.get(targetId)!.add(sourceId);
    });
    return map;
  }, [data.links]);

  // Get highlighted node IDs (selected + connected)
  const computedHighlightedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();

    const highlighted = new Set<string>();
    highlighted.add(selectedNodeId);

    // Add connected nodes
    const connected = linkMap.get(selectedNodeId);
    if (connected) {
      connected.forEach(id => highlighted.add(id));
    }

    return highlighted;
  }, [selectedNodeId, linkMap]);

  // Track container dimensions for responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for efficient resize tracking
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Fallback to window resize event
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Configure camera on mount
  useEffect(() => {
    if (graphRef.current) {
      const graph = graphRef.current;

      // Set camera distance
      graph.cameraPosition({ z: 1000 });

      // Configure controls
      const controls = graph.controls();
      if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
      }
    }
  }, []);

  // Update node materials when selection changes
  useEffect(() => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const scene = graph.scene();
    if (!scene) return;

    const activeHighlights = highlightedNodeIds.size > 0 ? highlightedNodeIds : computedHighlightedIds;
    const hasSelection = activeHighlights.size > 0;

    // Find and update all node meshes in the scene
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.__nodeData) {
        const node = obj.__nodeData as Node;
        const material = obj.material as THREE.MeshPhongMaterial;
        const isSelected = selectedNodeId === node.id;
        const isHighlighted = activeHighlights.has(node.id);

        // Update emissive intensity, scale, and opacity
        if (isSelected) {
          material.emissiveIntensity = 0.8;
          material.opacity = 1.0;
          material.transparent = false;
          obj.scale.setScalar(1.3);
        } else if (isHighlighted) {
          material.emissiveIntensity = 0.5;
          material.opacity = 1.0;
          material.transparent = false;
          obj.scale.setScalar(1.15);
        } else if (hasSelection) {
          // Dim non-highlighted nodes when there's a selection
          material.emissiveIntensity = 0.1;
          material.opacity = 0.25;
          material.transparent = true;
          material.needsUpdate = true;
          obj.scale.setScalar(1.0);
        } else {
          // No selection - normal state
          material.emissiveIntensity = 0.2;
          material.opacity = 1.0;
          material.transparent = false;
          obj.scale.setScalar(1.0);
        }
      }
      // Also handle labels for Risk nodes (SpriteText as children of groups)
      if (obj.isSprite && obj.parent && (obj.parent.isGroup || obj.parent.isMesh)) {
        // Check if parent group or grandparent has node data
        const parentData = obj.parent.__nodeData;
        if (parentData) {
          const node = parentData as Node;
          const isSelected = selectedNodeId === node.id;
          const isHighlighted = activeHighlights.has(node.id);

          // Adjust label opacity based on selection state
          if (obj.material) {
            if (hasSelection && !isSelected && !isHighlighted) {
              obj.material.opacity = 0.25;
            } else {
              obj.material.opacity = 1.0;
            }
            obj.material.needsUpdate = true;
          }
        }
      }
    });

    // Debug sprite count only
    let spriteCount = 0;
    scene.traverse((obj: any) => {
      if (obj.isSprite) {
        spriteCount++;
      }
    });
    console.log('🏷️ Label Debug - Found sprites:', spriteCount);
  }, [selectedNodeId, computedHighlightedIds, highlightedNodeIds]);

  // Handle node clicks
  const handleNodeClick = (node: any) => {
    if (onNodeClick) {
      onNodeClick(node as Node);
    }
  };

  // Handle node hover
  const handleNodeHover = (node: any) => {
    if (onNodeHover) {
      onNodeHover(node as Node | null);
    }
  };

  // Create node Three.js object with visual encoding
  // Recreate nodes when riskViewMode changes
  const nodeThreeObject = useMemo(() => {
    return (node: any) => {
      const n = node as Node;
      const nodeObj = createNodeShape(n, false, false, riskViewMode);

      // For Risk nodes, wrap in a group and add label
      if (n.type === 'risk') {
        const group = new (window as any).THREE.Group();
        group.add(nodeObj);

        // Import SpriteText dynamically
        const SpriteText = (window as any).SpriteText;
        if (SpriteText) {
          const label = new SpriteText(n.name);
          label.color = '#00ffcc';
          label.textHeight = 15; // Much larger text
          label.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          label.padding = 6;
          label.borderRadius = 5;
          label.fontFace = 'Arial, sans-serif';
          label.fontWeight = 'bold';

          const size = (nodeObj as any).geometry?.parameters?.radius || 10;
          label.position.set(0, size + 20, 0); // Position above node

          group.add(label);
          console.log('🏷️ Added label:', {
            name: n.name,
            position: label.position,
            textHeight: label.textHeight,
            visible: label.visible
          });
        }

        // Store node data on group
        (group as any).__nodeData = n;
        return group;
      }

      return nodeObj;
    };
  }, [riskViewMode]); // Recreate when risk view mode changes

  // Get link color based on relationship type
  const linkColor = (link: any) => {
    const l = link as Link;
    return getLinkColor(l.type);
  };

  // Get link width - highlight connected edges
  const linkWidth = (link: any) => {
    if (!selectedNodeId) return getLinkWidth();

    const l = link as Link;
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
    const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;

    // Make connected edges thicker
    if (sourceId === selectedNodeId || targetId === selectedNodeId) {
      return 3.0; // 3x thicker for connected edges
    }
    return getLinkWidth();
  };

  // Get link opacity based on connected nodes and selection
  const linkOpacity = (link: any) => {
    const l = link as Link;
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
    const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    // If a node is selected, highlight connected edges
    if (selectedNodeId) {
      if (sourceId === selectedNodeId || targetId === selectedNodeId) {
        return 0.9; // High opacity for connected edges
      }
      return 0.05; // Heavily dim other edges
    }

    // Default opacity based on node confidence
    if (sourceNode && targetNode) {
      return getLinkOpacity(sourceNode, targetNode);
    }
    return 0.6;
  };

  // Highlight links connected to selected node
  const linkDirectionalParticleWidth = (link: any) => {
    if (!selectedNodeId) return 2;

    const l = link as Link;
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
    const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;

    // Highlight if link connects to selected node
    if (sourceId === selectedNodeId || targetId === selectedNodeId) {
      return 4; // Thicker particles for connected links
    }
    return 0; // No particles for unconnected links when selection active
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeThreeObject={nodeThreeObject}
        linkColor={linkColor as any}
        linkWidth={linkWidth as any}
        linkOpacity={linkOpacity as any}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={linkDirectionalParticleWidth as any}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={() => onNodeClick?.(null as any)}
        backgroundColor="#0c0c1a"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={1000}
      />
    </div>
  );
}
