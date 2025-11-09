/**
 * Test script for AnomalyDetector
 */

import { Lattice } from './core/Lattice.js';
import { Simulation } from './core/Simulation.js';
import { Physics } from './core/Physics.js';

console.log('🧪 Testing TDS Anomaly Detection...\n');

// Create small lattice
const lattice = new Lattice(10, 10, 1);
console.log('✓ Created 10x10 lattice');

// Create some initial anomalies
lattice.createAnomaly(5, 5, 0, 2);
console.log('✓ Created initial anomaly at center');

// Create simulation
const simulation = new Simulation(lattice, {
  symmetryStrength: 0.3,
  anomalyProbability: 0.4,
  energyThreshold: 1.5,
  timeStep: 1.0
});
console.log('✓ Created simulation');

// Initialize anomaly detector
Physics.initializeAnomalyDetector(50, 30, 0.5);
console.log('✓ Initialized anomaly detector');
console.log('  - History depth: 50 steps');
console.log('  - Persistence threshold: 30 steps');
console.log('  - E_asym threshold: 0.5\n');

// Run simulation and track anomalies
console.log('📊 Running simulation for 60 steps...');
const detector = Physics.getAnomalyDetector();

for (let i = 0; i < 60; i++) {
  simulation.step();
  
  // Detect anomalies every 10 steps
  if ((i + 1) % 10 === 0) {
    const report = Physics.detectAnomalies(lattice);
    const stats = lattice.getStatistics();
    
    console.log(
      `Step ${i + 1}: ` +
      `detected=${report.detectedAnomalies.length}, ` +
      `anomalous=${stats.anomalous}, ` +
      `broken=${stats.broken}, ` +
      `vacuum=${stats.vacuum}`
    );
    
    // Show details of newly detected anomalies
    if (report.detectedAnomalies.length > 0) {
      for (const anomaly of report.detectedAnomalies) {
        console.log(
          `  → Anomaly at (${anomaly.position.x}, ${anomaly.position.y}): ` +
          `ω₀=${anomaly.omega.toFixed(2)}, ` +
          `M=${anomaly.mass.toFixed(2)}, ` +
          `persistence=${anomaly.persistenceDuration}`
        );
      }
    }
  }
}

// Get final statistics
const finalStats = detector.getStatistics();
console.log('\n📈 Anomaly Detection Statistics:');
console.log(`  Total detected: ${finalStats.totalDetected}`);
console.log(`  Average ω₀: ${finalStats.avgOmega.toFixed(3)}`);
console.log(`  Average mass M: ${finalStats.avgMass.toFixed(3)}`);
console.log(`  Average persistence: ${finalStats.avgPersistence.toFixed(1)} steps`);
console.log(`  ω₀ range: ${finalStats.minOmega.toFixed(2)} - ${finalStats.maxOmega.toFixed(2)}`);

// Check lattice state
const latticeStats = lattice.getStatistics();
console.log('\n🔍 Final Lattice State:');
console.log(`  Vacuum nodes: ${latticeStats.vacuum}`);
console.log(`  Broken nodes: ${latticeStats.broken}`);
console.log(`  Anomalous nodes: ${latticeStats.anomalous}`);
console.log(`  Anomaly density: ${(latticeStats.anomalous / latticeStats.total * 100).toFixed(1)}%`);

// Verify anomalous nodes have ω₀ > 0
let nodesWithOmega = 0;
for (const node of lattice.nodes) {
  if (node.state === 'anomalous' && node.omega > 0) {
    nodesWithOmega++;
  }
}
console.log(`  Anomalous nodes with ω₀ > 0: ${nodesWithOmega}/${latticeStats.anomalous}`);

if (finalStats.totalDetected > 0) {
  console.log('\n✅ Anomaly detection working! Persistent broken nodes identified and marked.');
  console.log(`   Detected ${finalStats.totalDetected} anomalies with ω₀ calculated.`);
} else {
  console.log('\n⚠️  No anomalies detected. Try running longer or adjusting thresholds.');
}

console.log('\n✅ Anomaly detection test complete!');
