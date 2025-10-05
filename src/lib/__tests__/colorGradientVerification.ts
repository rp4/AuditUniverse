/**
 * Color Gradient Verification
 *
 * Manual verification script to check that likelihood colors
 * progress from blue → yellow → red
 */

import { getLikelihoodColor, LIKELIHOOD_COLORS } from '../visualEncoding';

console.log('=== Continuous Gradient (getLikelihoodColor) ===\n');
for (let i = 1; i <= 10; i++) {
  const color = getLikelihoodColor(i);
  console.log(`Likelihood ${i}: ${color}`);
}

console.log('\n=== Discrete Palette (LIKELIHOOD_COLORS) ===\n');
for (let i = 1; i <= 10; i++) {
  const color = LIKELIHOOD_COLORS[i as keyof typeof LIKELIHOOD_COLORS];
  console.log(`Likelihood ${i}: ${color}`);
}

console.log('\n=== Color Component Analysis ===\n');
console.log('Low (1):  Should be blue (high B, low R)');
const low = getLikelihoodColor(1);
console.log(`  ${low}`);

console.log('\nMedium (5): Should be yellow (high R+G, low B)');
const med = getLikelihoodColor(5);
console.log(`  ${med}`);

console.log('\nHigh (10): Should be red (high R, low B)');
const high = getLikelihoodColor(10);
console.log(`  ${high}`);

console.log('\n✓ Gradient verification complete');
