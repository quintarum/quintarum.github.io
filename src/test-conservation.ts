/**
 * Test script for ConservationEnforcer
 */

import { Lattice } from './core/Lattice.js';
import { Simulation } from './core/Simulation.js';
import { Physics } from './core/Physics.js';

console.log('🧪 Testing TDS Energy Conservation Enforcement...\n');

// Create small lattice
const lattice = new Lattice(10, 10, 1);
console.log('✓ Created 10x10 lattice');

// Create simulation with conservation enforcement enabled
const simulation = new Simulation(lattice, {
  symmetryStrength: 0.5,
  anomalyProbability: 0.2,
  energyThreshold: 1.5,
  timeStep: 1.0,
  enforceConservation: true,
  conservationTolerance: 1e-6
});
console.log('✓ Created simulation with conservation enforcement enabled');

// Initialize conservation enforcer
Physics.initializeConservationEnforcer(1e-6, 1.0);
console.log('✓ Initialized conservation enforcer');

// Run simulation for 10 steps
console.log('\n📊 Running simulation for 10 steps...');
for (let i = 0; i < 10; i++) {
  const result = simulation.step();
  
  if ('success' in result) {
    console.log(`Step ${i + 1}: ${result.reason}`);
    break;
  }
  
  const stats = result;
  const report = stats.conservationReport;
  
  if (report) {
    console.log(
      `Step ${i + 1}: ` +
      `E_0=${stats.totalE_0.toFixed(2)}, ` +
      `violations=${report.violations.length}, ` +
      `maxDev=${report.maxDeviation.toExponential(2)}, ` +
      `conserved=${report.isConserved ? '✓' : '✗'}`
    );
  }
}

// Get conservation statistics
const enforcer = Physics.getConservationEnforcer();
const conservationStats = enforcer.getStatistics();

console.log('\n📈 Conservation Statistics:');
console.log(`  Total violations: ${conservationStats.totalViolations}`);
console.log(`  Max deviation: ${conservationStats.maxDeviation.toExponential(2)}`);
console.log(`  Avg deviation: ${conservationStats.avgDeviation.toExponential(2)}`);
console.log(`  Recent violations: ${conservationStats.recentViolations}`);

// Check lattice conservation
const finalReport = Physics.enforceConservation(lattice);
console.log('\n🔍 Final Conservation Check:');
console.log(`  Total nodes: ${finalReport.totalNodes}`);
console.log(`  Violations: ${finalReport.violations.length}`);
console.log(`  Max deviation: ${finalReport.maxDeviation.toExponential(2)}`);
console.log(`  Avg deviation: ${finalReport.avgDeviation.toExponential(2)}`);
console.log(`  Is conserved: ${finalReport.isConserved ? '✓ YES' : '✗ NO'}`);

if (finalReport.isConserved) {
  console.log('\n✅ Energy conservation verified! E_sym + E_asym = E_0 for all nodes.');
} else {
  console.log('\n⚠️  Conservation violations detected. Auto-correction applied.');
}

console.log('\n✅ Conservation enforcement test complete!');
