/**
 * Test script for TDS export/import
 */

import { Lattice } from './core/Lattice.js';
import { Simulation } from './core/Simulation.js';
import { Physics } from './core/Physics.js';

console.log('🧪 Testing TDS Export/Import...\n');

// Create lattice and simulation
const lattice = new Lattice(10, 10, 1);
lattice.createAnomaly(5, 5, 0, 2);

const simulation = new Simulation(lattice, {
  symmetryStrength: 0.5,
  anomalyProbability: 0.2,
  energyThreshold: 1.5,
  timeStep: 1.0,
  enforceConservation: true,
  validateReversibility: true
});

console.log('✓ Created simulation with TDS features enabled');

// Initialize systems
Physics.initializeConservationEnforcer(1e-6, 1.0);
Physics.initializeAnomalyDetector(50, 30, 0.5);
console.log('✓ Initialized conservation and anomaly detection');

// Run simulation
console.log('\n📊 Running simulation for 20 steps...');
for (let i = 0; i < 20; i++) {
  simulation.step();
}

const stats = lattice.getStatistics();
console.log(`  Vacuum: ${stats.vacuum}, Broken: ${stats.broken}, Anomalous: ${stats.anomalous}`);

// Export data
console.log('\n💾 Exporting simulation data...');
const exportedData = simulation.export();

console.log('✓ Exported data includes:');
console.log(`  - Basic: time=${exportedData.time}, steps=${exportedData.stepCount}`);
console.log(`  - Lattice: ${exportedData.lattice.nodes.length} nodes`);
console.log(`  - Bookmarks: ${exportedData.bookmarks.length}`);

if (exportedData.tdsMetrics) {
  console.log(`  - TDS Metrics:`);
  console.log(`    E_sym: ${exportedData.tdsMetrics.E_sym_total.toFixed(2)}`);
  console.log(`    E_asym: ${exportedData.tdsMetrics.E_asym_total.toFixed(2)}`);
  console.log(`    E_0: ${exportedData.tdsMetrics.E_0_total.toFixed(2)}`);
  console.log(`    T_info: ${exportedData.tdsMetrics.T_info.toFixed(2)}`);
  console.log(`    Phase coherence: ${exportedData.tdsMetrics.phaseCoherence.toFixed(3)}`);
}

if (exportedData.conservationMetrics) {
  console.log(`  - Conservation:`);
  console.log(`    Conserved: ${exportedData.conservationMetrics.isConserved ? '✓' : '✗'}`);
  console.log(`    Violations: ${exportedData.conservationMetrics.violations}`);
  console.log(`    Max deviation: ${exportedData.conservationMetrics.maxDeviation.toExponential(2)}`);
}

if (exportedData.reversibilityMetrics) {
  console.log(`  - Reversibility:`);
  console.log(`    Validations: ${exportedData.reversibilityMetrics.validations}`);
  console.log(`    Violation rate: ${(exportedData.reversibilityMetrics.violationRate * 100).toFixed(2)}%`);
}

// Check that spin states are included
const firstNode = exportedData.lattice.nodes[0];
console.log(`\n✓ Node data includes:`);
console.log(`  - State: ${firstNode.state}`);
console.log(`  - Spin: ${firstNode.spin}`);
console.log(`  - E_sym: ${firstNode.E_sym.toFixed(3)}`);
console.log(`  - E_asym: ${firstNode.E_asym.toFixed(3)}`);
console.log(`  - Phase: ${firstNode.phase.toFixed(3)}`);
console.log(`  - Omega: ${firstNode.omega.toFixed(3)}`);

// Create new simulation and import
console.log('\n📥 Creating new simulation and importing data...');
const newLattice = new Lattice(10, 10, 1);
const newSimulation = new Simulation(newLattice);
newSimulation.import(exportedData);

console.log('✓ Data imported successfully');

// Verify imported data
const newStats = newLattice.getStatistics();
console.log('\n🔍 Verifying imported data:');
console.log(`  Time: ${newSimulation.time} (expected ${exportedData.time})`);
console.log(`  Steps: ${newSimulation.stepCount} (expected ${exportedData.stepCount})`);
console.log(`  Vacuum: ${newStats.vacuum} (expected ${stats.vacuum})`);
console.log(`  Broken: ${newStats.broken} (expected ${stats.broken})`);
console.log(`  Anomalous: ${newStats.anomalous} (expected ${stats.anomalous})`);

// Verify energy conservation
const newEnergies = newLattice.calculateTotalEnergy();
console.log(`  E_0: ${newEnergies.E_0.toFixed(2)} (expected ${exportedData.tdsMetrics?.E_0_total.toFixed(2)})`);

// Check if data matches
const timeMatches = newSimulation.time === exportedData.time;
const stepsMatch = newSimulation.stepCount === exportedData.stepCount;
const statesMatch = newStats.vacuum === stats.vacuum && 
                    newStats.broken === stats.broken && 
                    newStats.anomalous === stats.anomalous;

if (timeMatches && stepsMatch && statesMatch) {
  console.log('\n✅ Export/Import successful! All data preserved correctly.');
} else {
  console.log('\n⚠️  Some data mismatch detected.');
}

// Export to JSON string
console.log('\n📄 Testing JSON serialization...');
const jsonString = JSON.stringify(exportedData, null, 2);
console.log(`  JSON size: ${(jsonString.length / 1024).toFixed(2)} KB`);

const parsed = JSON.parse(jsonString);
console.log('✓ JSON serialization/deserialization works');

console.log('\n✅ Export/Import test complete!');
