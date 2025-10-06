/**
 * Node Shapes Library
 *
 * Creates Three.js meshes for each entity type with visual encoding applied:
 * - Color: Based on likelihood (risk) or entity type
 * - Size: Based on severity (risk) or fixed size
 * - Opacity: Based on confidence or age
 * - Shape: Unique geometry for each entity type
 */

import * as THREE from 'three';
import { getLikelihoodColor, getSeveritySize, getConfidenceOpacity } from './visualEncoding';
import type { Node } from '@/types';

/**
 * Entity type color palette
 * Used for non-risk nodes
 */
export const ENTITY_COLORS = {
  risk: '#ff0044',        // Red (but risk nodes use likelihood color)
  control: '#00ccff',     // Cyan
  audit: '#ff6600',       // Orange
  issue: '#ffff00',       // Yellow
  incident: '#ff0099',    // Magenta
  standard: '#9966ff',    // Purple
  businessUnit: '#00ff99' // Mint
} as const;

/**
 * Relationship type color palette
 */
export const RELATIONSHIP_COLORS = {
  mitigates: '#00ccff',      // Cyan (control → risk)
  assessed_by: '#ff6600',    // Orange (audit → risk)
  owned_by: '#00ff99',       // Mint (businessUnit → risk)
  requires: '#9966ff',       // Purple (standard → risk)
  causes: '#ff0099',         // Magenta (incident → risk)
  reports: '#ffff00',        // Yellow (issue → control/risk)
  monitors: '#00ccff',       // Cyan (control → standard)
  supports: '#00ff99'        // Mint (businessUnit → audit)
} as const;

/**
 * Get base color for a node
 */
function getNodeColor(node: Node): string {
  if (node.type === 'risk') {
    // Risk nodes use likelihood-based color
    return getLikelihoodColor((node as any).residual_likelihood || 5);
  }
  return ENTITY_COLORS[node.type];
}

/**
 * Get base size for a node
 */
function getNodeSize(node: Node): number {
  if (node.type === 'risk') {
    // Risk nodes use severity-based size
    return getSeveritySize((node as any).residual_severity || 5);
  }
  // Other nodes use fixed size
  return 8;
}

/**
 * Create Three.js mesh for a node
 *
 * Applies visual encoding:
 * - Shape: Sphere for all entity types
 * - Color based on likelihood (risk) or entity type
 * - Size based on severity (risk) or fixed
 * - Opacity based on confidence or age
 */
export function createNodeShape(
  node: Node,
  isSelected: boolean = false,
  isHighlighted: boolean = false
): THREE.Object3D {
  const size = getNodeSize(node);
  const color = getNodeColor(node);
  const opacity = getConfidenceOpacity(node);

  // All nodes are spheres
  const geometry = new THREE.SphereGeometry(size, 32, 32);

  // Determine emissive intensity based on selection/highlight state
  let emissiveIntensity = 0.2;
  let scale = 1.0;

  if (isSelected) {
    emissiveIntensity = 0.8; // Strong glow for selected node
    scale = 1.3; // Make it larger
  } else if (isHighlighted) {
    emissiveIntensity = 0.5; // Medium glow for connected nodes
    scale = 1.15; // Slightly larger
  }

  // Create material with visual encoding
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: emissiveIntensity,
    transparent: opacity < 1.0,
    opacity: opacity,
    shininess: 30
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(scale);

  // Store node data for later reference
  (mesh as any).__nodeData = node;

  return mesh;
}

/**
 * Update node appearance when selected
 */
export function updateNodeSelection(mesh: THREE.Mesh, isSelected: boolean): void {
  const material = mesh.material as THREE.MeshPhongMaterial;

  if (isSelected) {
    // Brighten selected node
    material.emissiveIntensity = 0.6;

    // Add white outline (scale up slightly)
    mesh.scale.setScalar(1.2);
  } else {
    // Reset to normal
    material.emissiveIntensity = 0.2;
    mesh.scale.setScalar(1.0);
  }
}

/**
 * Update node appearance when hovered
 */
export function updateNodeHover(mesh: THREE.Mesh, isHovered: boolean): void {
  const material = mesh.material as THREE.MeshPhongMaterial;

  if (isHovered) {
    // Slight glow on hover
    material.emissiveIntensity = 0.4;
  } else {
    // Reset to normal (unless selected)
    material.emissiveIntensity = 0.2;
  }
}

/**
 * Get link color based on relationship type
 */
export function getLinkColor(linkType: string): string {
  return RELATIONSHIP_COLORS[linkType as keyof typeof RELATIONSHIP_COLORS] || '#666666';
}

/**
 * Get link width based on relationship strength
 * Default to 1.0 for now (can be enhanced later)
 */
export function getLinkWidth(): number {
  return 1.0;
}

/**
 * Get link opacity based on node confidence
 * Links inherit the minimum opacity of their connected nodes
 */
export function getLinkOpacity(sourceNode: Node, targetNode: Node): number {
  const sourceOpacity = getConfidenceOpacity(sourceNode);
  const targetOpacity = getConfidenceOpacity(targetNode);
  return Math.min(sourceOpacity, targetOpacity);
}
