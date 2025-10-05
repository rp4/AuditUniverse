/**
 * Visual Encoding Unit Tests
 *
 * Tests for the core visual encoding functions that map risk metrics
 * to visual properties (color, size, opacity).
 */

import { describe, it, expect } from 'vitest';
import {
  getLikelihoodColor,
  getSeveritySize,
  getConfidenceOpacity,
  getDiscreteLikelihoodColor,
  calculateRiskRating,
  interpolateColor,
  LIKELIHOOD_COLORS
} from '../visualEncoding';

describe('getLikelihoodColor', () => {
  it('returns a valid hex color', () => {
    const color = getLikelihoodColor(5);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('handles edge cases (min/max)', () => {
    const min = getLikelihoodColor(1);
    const max = getLikelihoodColor(10);

    expect(min).toMatch(/^#[0-9a-f]{6}$/i);
    expect(max).toMatch(/^#[0-9a-f]{6}$/i);
    expect(min).not.toBe(max); // Should be different colors
  });

  it('clamps values outside 1-10 range', () => {
    const tooLow = getLikelihoodColor(0);
    const tooHigh = getLikelihoodColor(15);
    const min = getLikelihoodColor(1);
    const max = getLikelihoodColor(10);

    expect(tooLow).toBe(min);
    expect(tooHigh).toBe(max);
  });

  it('returns continuous gradient (no duplicates for different values)', () => {
    const colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(getLikelihoodColor);
    const uniqueColors = new Set(colors);

    // All 10 values should produce unique colors
    expect(uniqueColors.size).toBe(10);
  });

  it('returns consistent colors for same input', () => {
    const color1 = getLikelihoodColor(5);
    const color2 = getLikelihoodColor(5);
    expect(color1).toBe(color2);
  });
});

describe('LIKELIHOOD_COLORS discrete palette', () => {
  it('has colors for all 10 likelihood levels', () => {
    const keys = Object.keys(LIKELIHOOD_COLORS).map(Number);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('all colors are valid hex', () => {
    Object.values(LIKELIHOOD_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('colors progress from blue to red', () => {
    // Blue has high B component, low R
    // Red has high R component, low B
    const lowColor = LIKELIHOOD_COLORS[1];
    const highColor = LIKELIHOOD_COLORS[10];

    // Parse hex
    const lowR = parseInt(lowColor.slice(1, 3), 16);
    const lowB = parseInt(lowColor.slice(5, 7), 16);
    const highR = parseInt(highColor.slice(1, 3), 16);
    const highB = parseInt(highColor.slice(5, 7), 16);

    // Low likelihood should be more blue
    expect(lowB).toBeGreaterThan(lowR);
    // High likelihood should be more red
    expect(highR).toBeGreaterThan(highB);
  });
});

describe('getSeveritySize', () => {
  it('returns larger sizes for higher severity', () => {
    const sizes = [1, 5, 10].map(getSeveritySize);

    // Monotonically increasing
    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);
  });

  it('returns minimum size for severity 1', () => {
    const size = getSeveritySize(1);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(5); // Should be small
  });

  it('returns maximum size for severity 10', () => {
    const size = getSeveritySize(10);
    expect(size).toBeGreaterThan(10); // Should be noticeably large
  });

  it('clamps values outside 1-10 range', () => {
    const tooLow = getSeveritySize(0);
    const tooHigh = getSeveritySize(15);
    const min = getSeveritySize(1);
    const max = getSeveritySize(10);

    expect(tooLow).toBe(min);
    expect(tooHigh).toBe(max);
  });

  it('uses exponential scaling (non-linear)', () => {
    const size1 = getSeveritySize(1);
    const size5 = getSeveritySize(5);
    const size10 = getSeveritySize(10);

    const diff1to5 = size5 - size1;
    const diff5to10 = size10 - size5;

    // Exponential: second half difference should be larger
    expect(diff5to10).toBeGreaterThan(diff1to5);
  });

  it('returns consistent sizes for same input', () => {
    const size1 = getSeveritySize(7);
    const size2 = getSeveritySize(7);
    expect(size1).toBe(size2);
  });
});

describe('getConfidenceOpacity', () => {
  it('returns 1.0 for nodes with no confidence data', () => {
    const opacity = getConfidenceOpacity({});
    expect(opacity).toBe(1.0);
  });

  it('uses direct confidence value when provided', () => {
    const opacity = getConfidenceOpacity({ confidence: 0.7 });
    expect(opacity).toBe(0.7);
  });

  it('clamps confidence to 0.3-1.0 range', () => {
    const tooLow = getConfidenceOpacity({ confidence: 0.1 });
    const tooHigh = getConfidenceOpacity({ confidence: 1.5 });

    expect(tooLow).toBe(0.3);
    expect(tooHigh).toBe(1.0);
  });

  it('calculates opacity from age (recent = opaque)', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 30); // 30 days ago

    const opacity = getConfidenceOpacity({
      last_assessment: recent.toISOString()
    });

    expect(opacity).toBeGreaterThan(0.9); // Should be nearly opaque
  });

  it('calculates opacity from age (old = transparent)', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 3); // 3 years ago

    const opacity = getConfidenceOpacity({
      last_assessment: old.toISOString()
    });

    expect(opacity).toBe(0.3); // Should be clamped to minimum
  });

  it('fades gradually over 2 years', () => {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const opacity = getConfidenceOpacity({
      last_assessment: oneYearAgo.toISOString()
    });

    // After 1 year, should be around 0.65 opacity
    expect(opacity).toBeGreaterThan(0.6);
    expect(opacity).toBeLessThan(0.8);
  });
});

describe('getDiscreteLikelihoodColor', () => {
  it('returns discrete color for integer values', () => {
    const color = getDiscreteLikelihoodColor(5);
    expect(color).toBe(LIKELIHOOD_COLORS[5]);
  });

  it('rounds to nearest integer', () => {
    const color1 = getDiscreteLikelihoodColor(4.4);
    const color2 = getDiscreteLikelihoodColor(4.6);

    expect(color1).toBe(LIKELIHOOD_COLORS[4]);
    expect(color2).toBe(LIKELIHOOD_COLORS[5]);
  });

  it('handles edge cases', () => {
    const min = getDiscreteLikelihoodColor(1);
    const max = getDiscreteLikelihoodColor(10);

    expect(min).toBe(LIKELIHOOD_COLORS[1]);
    expect(max).toBe(LIKELIHOOD_COLORS[10]);
  });
});

describe('calculateRiskRating', () => {
  it('calculates average of likelihood and severity', () => {
    const rating = calculateRiskRating(6, 8);
    expect(rating).toBe(7);
  });

  it('handles equal values', () => {
    const rating = calculateRiskRating(5, 5);
    expect(rating).toBe(5);
  });

  it('handles min values', () => {
    const rating = calculateRiskRating(1, 1);
    expect(rating).toBe(1);
  });

  it('handles max values', () => {
    const rating = calculateRiskRating(10, 10);
    expect(rating).toBe(10);
  });
});

describe('interpolateColor', () => {
  it('returns first color at factor 0', () => {
    const result = interpolateColor('#ff0000', '#0000ff', 0);
    expect(result).toBe('#ff0000');
  });

  it('returns second color at factor 1', () => {
    const result = interpolateColor('#ff0000', '#0000ff', 1);
    expect(result).toBe('#0000ff');
  });

  it('returns intermediate color at factor 0.5', () => {
    const result = interpolateColor('#000000', '#ffffff', 0.5);
    // Midpoint between black and white should be gray (#808080)
    expect(result.toLowerCase()).toBe('#808080');
  });

  it('handles invalid hex gracefully', () => {
    const result = interpolateColor('invalid', '#0000ff', 0.5);
    expect(result).toBe('invalid'); // Falls back to first color
  });
});
