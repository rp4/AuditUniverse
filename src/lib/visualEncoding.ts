/**
 * Visual Encoding Library
 *
 * Core functions for encoding risk metrics into visual properties.
 * This is the foundation of AuditVerse's visual paradigm.
 *
 * CRITICAL: These functions encode data in VISUAL properties, not positions.
 * The force simulation handles positioning based on relationships.
 */

import { scaleSequential } from 'd3-scale';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import type { Node } from '@/types';

/**
 * Maps risk likelihood (1-10) to color using a blue → yellow → red gradient
 *
 * Uses D3's RdYlBu (Red-Yellow-Blue) color scheme, reversed so:
 * - Low likelihood (1-3): Blue (#0044ff to #00aaff)
 * - Medium likelihood (4-7): Yellow-Green to Yellow (#00ffaa to #ffcc00)
 * - High likelihood (8-10): Orange to Red (#ff8800 to #ff0044)
 *
 * @param likelihood - Risk likelihood value (1 = very low, 10 = very high)
 * @returns Hex color string
 *
 * @example
 * getLikelihoodColor(1)  // '#313695' (deep blue)
 * getLikelihoodColor(5)  // '#ffffbf' (yellow)
 * getLikelihoodColor(10) // '#a50026' (red)
 */
export function getLikelihoodColor(likelihood: number): string {
  // Clamp to valid range
  const clamped = Math.max(1, Math.min(10, likelihood));

  // Reverse the interpolation (RdYlBu goes red→yellow→blue, we want blue→yellow→red)
  const scale = scaleSequential()
    .domain([10, 1])  // Reversed: high values = red, low = blue
    .interpolator(interpolateRdYlBu);

  const color = scale(clamped);

  // D3 returns rgb() format, convert to hex
  return rgbStringToHex(color);
}

/**
 * Discrete color mapping for likelihood (alternative to gradient)
 * Can be used for legend or when discrete colors are preferred
 */
export const LIKELIHOOD_COLORS = {
  1: '#0044ff',   // Deep Blue - Very Low
  2: '#0088ff',   // Blue
  3: '#00aaff',   // Light Blue
  4: '#00ccff',   // Cyan - Low
  5: '#00ffaa',   // Teal
  6: '#88ff00',   // Yellow-Green
  7: '#ffcc00',   // Yellow - Medium
  8: '#ff8800',   // Orange
  9: '#ff4400',   // Red-Orange
  10: '#ff0044'   // Red - Very High
} as const;

/**
 * Maps risk severity (1-10) to node radius using exponential scaling
 *
 * Uses exponential scaling for visual impact - the difference between
 * severity 9 and 10 should be more dramatic than between 1 and 2.
 *
 * Formula: baseSize * (severity/10)^scaleFactor * 10
 *
 * @param severity - Risk severity value (1 = minor, 10 = catastrophic)
 * @returns Node radius in pixels
 *
 * @example
 * getSeveritySize(1)  // ~3px  (tiny)
 * getSeveritySize(5)  // ~8px  (medium)
 * getSeveritySize(10) // ~13px (large)
 */
export function getSeveritySize(severity: number): number {
  // Clamp to valid range
  const clamped = Math.max(1, Math.min(10, severity));

  const baseSize = 3;
  const scaleFactor = 1.3;

  // Exponential scaling for visual impact
  return baseSize + Math.pow(clamped / 10, scaleFactor) * 10;
}

/**
 * Maps data confidence or age to node opacity
 *
 * Two modes:
 * 1. Direct confidence score (0-1): Directly used as opacity
 * 2. Age-based: Older data becomes more transparent over 2 years
 *
 * @param node - Node with optional confidence or last_assessment date
 * @returns Opacity value (0.3 to 1.0)
 *
 * @example
 * // Direct confidence
 * getConfidenceOpacity({ confidence: 0.8 }) // 0.8
 *
 * // Age-based (1 year old)
 * getConfidenceOpacity({ last_assessment: '2024-01-01' }) // ~0.65
 *
 * // Age-based (3 years old - clamped)
 * getConfidenceOpacity({ last_assessment: '2022-01-01' }) // 0.3
 */
export function getConfidenceOpacity(node: Partial<Node>): number {
  // Option 1: Direct confidence score
  if (node.confidence !== undefined) {
    return Math.max(0.3, Math.min(1.0, node.confidence));
  }

  // Option 2: Age-based opacity
  if (node.last_assessment) {
    const daysSince = getDaysSince(node.last_assessment);
    const ageInYears = daysSince / 365;

    // Fade over 2 years: year 0 = 1.0 opacity, year 2+ = 0.3 opacity
    const opacity = Math.max(0.3, 1 - (ageInYears / 2) * 0.7);
    return opacity;
  }

  // Default: fully opaque if no confidence data
  return 1.0;
}

/**
 * Helper: Calculate days since a date
 */
function getDaysSince(date: string | Date): number {
  const past = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get a color for a specific likelihood value from the discrete palette
 * Falls back to gradient if exact match not found
 */
export function getDiscreteLikelihoodColor(likelihood: number): string {
  const rounded = Math.round(Math.max(1, Math.min(10, likelihood))) as keyof typeof LIKELIHOOD_COLORS;
  return LIKELIHOOD_COLORS[rounded] || getLikelihoodColor(likelihood);
}

/**
 * Calculate risk rating from likelihood and severity
 * Simple average - organizations can customize this formula
 */
export function calculateRiskRating(likelihood: number, severity: number): number {
  return (likelihood + severity) / 2;
}

/**
 * Interpolate between two colors based on a value (0-1)
 * Useful for custom color gradients
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return rgbToHex(r, g, b);
}

/**
 * Helper: Convert rgb(r, g, b) string to hex
 */
function rgbStringToHex(rgb: string): string {
  // If already hex, return as is
  if (rgb.startsWith('#')) return rgb;

  // Parse rgb(r, g, b) format
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb; // Fallback if format doesn't match

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return rgbToHex(r, g, b);
}

/**
 * Helper: Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Helper: Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
