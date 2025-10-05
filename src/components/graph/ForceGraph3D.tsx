/**
 * ForceGraph3D Component
 *
 * Core 3D force-directed graph visualization with visual encoding.
 * Uses react-force-graph-3d and applies our visual encoding system.
 */

import { useRef, useEffect, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { createNodeShape, getLinkColor, getLinkWidth, getLinkOpacity } from '@/lib/nodeShapes';
import type { GraphData, Node, Link } from '@/types';

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
  const nodeThreeObject = (node: any) => {
    return createNodeShape(node as Node);
  };

  // Get link color based on relationship type
  const linkColor = (link: any) => {
    const l = link as Link;
    return getLinkColor(l.type);
  };

  // Get link width
  const linkWidth = () => {
    return getLinkWidth();
  };

  // Get link opacity based on connected nodes
  const linkOpacity = (link: any) => {
    const l = link as Link;
    const sourceNode = nodeMap.get(typeof l.source === 'string' ? l.source : (l.source as any).id);
    const targetNode = nodeMap.get(typeof l.target === 'string' ? l.target : (l.target as any).id);

    if (sourceNode && targetNode) {
      return getLinkOpacity(sourceNode, targetNode);
    }
    return 0.6;
  };

  // Dim nodes that are not highlighted (when selection is active)
  const nodeOpacity = (node: any) => {
    const activeHighlights = highlightedNodeIds.size > 0 ? highlightedNodeIds : computedHighlightedIds;
    if (activeHighlights.size === 0) {
      return 1.0; // No selection, show all nodes normally
    }
    return activeHighlights.has((node as Node).id) ? 1.0 : 0.2;
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
    <div className="w-full h-full">
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        nodeThreeObject={nodeThreeObject}
        nodeOpacity={nodeOpacity as any}
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
