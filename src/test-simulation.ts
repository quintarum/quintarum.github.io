/**
 * Test file to verify TypeScript migration
 * Run with: npm run dev and check browser console
 */

/* eslint-disable no-console */

import { Node } from './core/Node.js';
import { Lattice } from './core/Lattice.js';
import { Physics } from './core/Physics.js';
import { Simulation } from './core/Simulation.js';

// Test Node creation
const node = new Node(0, 0, 0);
console.log('✓ Node created:', node.position);

// Test Lattice creation
const lattice = new Lattice(10, 10, 1);
console.log('✓ Lattice created:', lattice.getNodeCount(), 'nodes');

// Test Physics calculations
const entropy = Physics.calculateEntropy(lattice);
console.log('✓ Physics entropy calculated:', entropy);

// Test Simulation
const simulation = new Simulation(lattice, {
  symmetryStrength: 0.7,
  anomalyProbability: 0.1,
  energyThreshold: 2.0
});
console.log('✓ Simulation created:', simulation.getState());

// Run a few steps
for (let i = 0; i < 5; i++) {
  simulation.step();
}
console.log('✓ Simulation stepped 5 times');

const stats = lattice.getStatistics();
console.log('✓ Final statistics:', {
  symmetric: stats.symmetric,
  asymmetric: stats.asymmetric,
  anomalies: stats.anomalies,
  avgEnergy: stats.avgEnergy.toFixed(2)
});

console.log('✅ All TypeScript core modules working correctly!');
