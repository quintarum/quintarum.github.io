/**
 * PhotonWindowTest - Rigorous reversibility validation
 * 
 * Tests perfect reversibility by running N forward steps followed by N backward steps
 * and comparing the final state with the initial state using Hamming distance.
 * 
 * Based on the author's reference implementation from PhotonWindow_RSL_Simulation.
 */

import { Simulation } from '../core/Simulation.js';
import { Lattice } from '../core/Lattice.js';

export interface PhotonWindowResult {
  hammingDistance: number;
  reversibilityRatio: number;
  passed: boolean;
  message: string;
  steps: number;
  timestamp: number;
}

export class PhotonWindowTest {
  private readonly PASS_THRESHOLD = 0.001; // 0.1% tolerance

  /**
   * Run Photon Window test
   * @param simulation - The simulation to test
   * @param steps - Number of forward/backward steps (default 300)
   * @returns Test result with Hamming distance and pass/fail status
   */
  async run(simulation: Simulation, steps: number = 300): Promise<PhotonWindowResult> {
    const startTime = Date.now();
    
    // Save initial state
    const initialSpins = this.captureSpins(simulation.lattice);
    
    // Pause simulation if running
    const wasRunning = simulation.isRunning;
    if (wasRunning) {
      simulation.pause();
    }
    
    // Forward evolution
    for (let i = 0; i < steps; i++) {
      simulation.step();
    }
    
    // Backward evolution
    simulation.setDirection(-1);
    for (let i = 0; i < steps; i++) {
      simulation.step();
    }
    simulation.setDirection(1);
    
    // Calculate Hamming distance
    const finalSpins = this.captureSpins(simulation.lattice);
    const hammingDistance = this.calculateHammingDistance(initialSpins, finalSpins);
    const ratio = hammingDistance / initialSpins.length;
    const passed = ratio < this.PASS_THRESHOLD;
    
    // Restore running state
    if (wasRunning) {
      simulation.resume();
    }
    
    return {
      hammingDistance,
      reversibilityRatio: ratio,
      passed,
      message: passed ? `OK ${ratio.toFixed(6)}` : `LOST ${ratio.toFixed(6)}`,
      steps,
      timestamp: Date.now() - startTime
    };
  }

  /**
   * Capture spin states from lattice
   */
  private captureSpins(lattice: Lattice): Int8Array {
    const spins = new Int8Array(lattice.nodes.length);
    for (let i = 0; i < lattice.nodes.length; i++) {
      spins[i] = lattice.nodes[i].spin;
    }
    return spins;
  }

  /**
   * Calculate Hamming distance between two spin arrays
   */
  private calculateHammingDistance(a: Int8Array, b: Int8Array): number {
    let distance = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        distance++;
      }
    }
    return distance;
  }

  /**
   * Format result for display
   */
  formatResult(result: PhotonWindowResult): string {
    const status = result.passed ? '✓' : '✗';
    return `${status} Reversibility: ${result.message} (${result.hammingDistance}/${result.hammingDistance + (result.steps * 2)} nodes changed)`;
  }
  
  /**
   * Get color for result display
   */
  getResultColor(result: PhotonWindowResult): string {
    return result.passed ? 'green' : 'red';
  }
}
