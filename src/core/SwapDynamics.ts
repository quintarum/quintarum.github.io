/**
 * SwapDynamics - Margolus neighborhood swap-based evolution
 * 
 * Implements deterministic, perfectly reversible dynamics using
 * 6-phase swap algorithm. Each phase swaps spins with neighbors
 * based on axis and parity.
 * 
 * Based on the author's reference implementation.
 */

import { Lattice } from './Lattice.js';

export enum SwapPhase {
  X_EVEN = 0,  // x-axis, even parity
  Y_ODD = 1,   // y-axis, odd parity
  Z_EVEN = 2,  // z-axis, even parity
  X_ODD = 3,   // x-axis, odd parity
  Y_EVEN = 4,  // y-axis, even parity
  Z_ODD = 5    // z-axis, odd parity
}

interface PhaseConfig {
  axis: 'x' | 'y' | 'z';
  parity: 0 | 1;
}

export class SwapDynamics {
  private phaseStep = 0;
  private readonly phases: PhaseConfig[] = [
    { axis: 'x', parity: 0 },
    { axis: 'y', parity: 1 },
    { axis: 'z', parity: 0 },
    { axis: 'x', parity: 1 },
    { axis: 'y', parity: 0 },
    { axis: 'z', parity: 1 }
  ];

  /**
   * Perform one forward step
   * @param lattice - Lattice to evolve
   */
  step(lattice: Lattice): void {
    const phase = this.phases[this.phaseStep];
    this.doSwap(lattice, phase);
    this.phaseStep = (this.phaseStep + 1) % 6;
  }

  /**
   * Perform one backward step (reverse)
   * @param lattice - Lattice to evolve backward
   */
  reverseStep(lattice: Lattice): void {
    this.phaseStep = (this.phaseStep + 5) % 6;  // -1 mod 6
    const phase = this.phases[this.phaseStep];
    this.doSwap(lattice, phase);
  }

  /**
   * Perform swap operation for a given phase
   */
  private doSwap(lattice: Lattice, phase: PhaseConfig): void {
    const { axis, parity } = phase;
    const { width, height, depth } = lattice;
    
    // Create temporary array for new spins
    const newSpins = new Int8Array(lattice.nodes.length);
    
    // Copy current spins
    for (let i = 0; i < lattice.nodes.length; i++) {
      newSpins[i] = lattice.nodes[i].spin;
    }
    
    // Perform swaps
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Check parity
          if (((x + y + z) & 1) !== parity) continue;
          
          // Get neighbor position based on axis
          let nx = x, ny = y, nz = z;
          if (axis === 'x') {
            nx = (x + 1) % width;
          } else if (axis === 'y') {
            ny = (y + 1) % height;
          } else {
            nz = (z + 1) % depth;
          }
          
          // Get nodes
          const node = lattice.getNode(x, y, z);
          const neighbor = lattice.getNode(nx, ny, nz);
          
          if (!node || !neighbor) continue;
          
          // Get indices
          const nodeIdx = lattice.nodes.indexOf(node);
          const neighborIdx = lattice.nodes.indexOf(neighbor);
          
          // Swap spins in temporary array
          const temp = newSpins[nodeIdx];
          newSpins[nodeIdx] = newSpins[neighborIdx];
          newSpins[neighborIdx] = temp;
        }
      }
    }
    
    // Apply new spins to lattice
    for (let i = 0; i < lattice.nodes.length; i++) {
      lattice.nodes[i].spin = newSpins[i];
    }
  }

  /**
   * Get current phase step
   */
  getPhaseStep(): number {
    return this.phaseStep;
  }

  /**
   * Set phase step (for state restoration)
   */
  setPhaseStep(step: number): void {
    this.phaseStep = step % 6;
  }

  /**
   * Get current phase configuration
   */
  getCurrentPhase(): PhaseConfig {
    return this.phases[this.phaseStep];
  }

  /**
   * Reset to initial phase
   */
  reset(): void {
    this.phaseStep = 0;
  }

  /**
   * Get phase name for display
   */
  getPhaseName(): string {
    const phase = this.phases[this.phaseStep];
    const parityName = phase.parity === 0 ? 'even' : 'odd';
    return `${phase.axis.toUpperCase()}_${parityName.toUpperCase()}`;
  }

  /**
   * Check if dynamics are at a complete cycle
   */
  isCompleteCycle(): boolean {
    return this.phaseStep === 0;
  }

  /**
   * Get number of steps in a complete cycle
   */
  getCycleLength(): number {
    return 6;
  }
}
