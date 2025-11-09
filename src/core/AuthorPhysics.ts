/**
 * AuthorPhysics - Exact implementation from author's reference
 * 
 * This is the CORRECT physics model extracted from:
 * PhotonWindow_RSL_Simulation Color v4.html
 * 
 * Key differences from our previous implementation:
 * 1. Uses swap-based dynamics (Margolus neighborhood)
 * 2. Energy is calculated from spin alignment, not abstract values
 * 3. Photon Window Test is the primary validation method
 */

import { Lattice } from './Lattice.js';

export interface SwapPhase {
  axis: 'x' | 'y' | 'z';
  parity: 0 | 1;
}

export interface EnergyMetrics {
  E_sym: number;      // Symmetric energy (aligned spins)
  E_asym: number;     // Asymmetric energy (misaligned spins)
  E_0: number;        // Total energy (should be constant)
  E_sym_norm: number; // Normalized E_sym
  E_asym_norm: number;// Normalized E_asym
  E_0_norm: number;   // Normalized E_0 (should ≈ 1)
}

export interface FourierMode {
  k_x: number;        // Wave number
  amplitude: number;  // |Σ s_i × cos(2π k_x x / N)|
  normalized: number; // amplitude / (N³)
}

/**
 * AuthorPhysics implements the exact algorithm from the reference
 */
export class AuthorPhysics {
  private readonly phases: SwapPhase[] = [
    { axis: 'x', parity: 0 },
    { axis: 'y', parity: 1 },
    { axis: 'z', parity: 0 },
    { axis: 'x', parity: 1 },
    { axis: 'y', parity: 0 },
    { axis: 'z', parity: 1 }
  ];

  private phaseStep: number = 0;
  private cosLUT: Float32Array;
  private k_x: number;
  private N: number;
  private E_0_REF: number;

  constructor(latticeSize: number, k_x: number = 6) {
    this.N = latticeSize;
    this.k_x = k_x;
    this.E_0_REF = 3 * this.N * this.N * this.N;
    this.cosLUT = new Float32Array(this.N);
    this.rebuildCosLUT();
  }

  /**
   * Rebuild cosine lookup table for Fourier calculation
   */
  private rebuildCosLUT(): void {
    for (let x = 0; x < this.N; x++) {
      this.cosLUT[x] = Math.cos(2 * Math.PI * (this.k_x * x) / this.N);
    }
  }

  /**
   * Set wave number and rebuild LUT
   */
  setKx(k_x: number): void {
    this.k_x = k_x;
    this.rebuildCosLUT();
  }

  /**
   * Initialize lattice with cosine wave pattern
   */
  initializeLattice(lattice: Lattice): void {
    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;

          const u = Math.cos(2 * Math.PI * (this.k_x * x) / this.N);
          node.spin = u >= 0 ? 1 : -1;
        }
      }
    }
    this.phaseStep = 0;
  }

  /**
   * Execute one swap phase (core dynamics)
   */
  private doSwapPhase(lattice: Lattice, phase: SwapPhase): void {
    const { axis, parity } = phase;
    
    // Create temporary array to store new spins
    const newSpins = new Map<string, number>();

    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          // Only process nodes matching parity
          if (((x + y + z) & 1) !== parity) continue;

          const node = lattice.getNode(x, y, z);
          if (!node) continue;

          // Find neighbor based on axis
          let xn = x, yn = y, zn = z;
          if (axis === 'x') xn = (x + 1) % this.N;
          else if (axis === 'y') yn = (y + 1) % this.N;
          else zn = (z + 1) % this.N;

          const neighbor = lattice.getNode(xn, yn, zn);
          if (!neighbor) continue;

          // Swap spins
          const key1 = `${x},${y},${z}`;
          const key2 = `${xn},${yn},${zn}`;
          newSpins.set(key1, neighbor.spin);
          newSpins.set(key2, node.spin);
        }
      }
    }

    // Apply swaps
    newSpins.forEach((spin, key) => {
      const [x, y, z] = key.split(',').map(Number);
      const node = lattice.getNode(x, y, z);
      if (node) node.spin = spin;
    });
  }

  /**
   * Step forward one time step
   */
  step(lattice: Lattice): void {
    this.doSwapPhase(lattice, this.phases[this.phaseStep]);
    this.phaseStep = (this.phaseStep + 1) % 6;
  }

  /**
   * Step backward one time step (for reversibility)
   */
  reverseStep(lattice: Lattice): void {
    this.phaseStep = (this.phaseStep + 5) % 6;
    this.doSwapPhase(lattice, this.phases[this.phaseStep]);
  }

  /**
   * Calculate energy metrics (EXACT author's formula)
   */
  calculateEnergy(lattice: Lattice): EnergyMetrics {
    let sym = 0;
    let asym = 0;

    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;

          const sx = node.spin;

          // Get neighbors (periodic boundary)
          const nx = lattice.getNode((x + 1) % this.N, y, z)?.spin ?? 0;
          const ny = lattice.getNode(x, (y + 1) % this.N, z)?.spin ?? 0;
          const nz = lattice.getNode(x, y, (z + 1) % this.N)?.spin ?? 0;

          // Count aligned and misaligned
          if (sx === nx) sym++; else asym++;
          if (sx === ny) sym++; else asym++;
          if (sx === nz) sym++; else asym++;
        }
      }
    }

    return {
      E_sym: sym,
      E_asym: asym,
      E_0: sym + asym,
      E_sym_norm: sym / this.E_0_REF,
      E_asym_norm: asym / this.E_0_REF,
      E_0_norm: (sym + asym) / this.E_0_REF
    };
  }

  /**
   * Calculate Fourier mode amplitude (EXACT author's formula)
   */
  calculateFourierMode(lattice: Lattice): FourierMode {
    let proj = 0;

    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;

          proj += node.spin * this.cosLUT[x];
        }
      }
    }

    const amplitude = Math.abs(proj);
    const totalNodes = this.N * this.N * this.N;

    return {
      k_x: this.k_x,
      amplitude,
      normalized: amplitude / totalNodes
    };
  }

  /**
   * Photon Window Test (EXACT author's implementation)
   * 
   * This is THE validation method for TDS physics
   */
  async photonWindowTest(
    lattice: Lattice,
    steps: number = 100
  ): Promise<{
    hammingDistance: number;
    ratio: number;
    passed: boolean;
    message: string;
  }> {
    // Save initial state
    const initialSpins = new Map<string, number>();
    const initialPhase = this.phaseStep;

    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const node = lattice.getNode(x, y, z);
          if (node) {
            initialSpins.set(`${x},${y},${z}`, node.spin);
          }
        }
      }
    }

    // Forward steps
    for (let i = 0; i < steps; i++) {
      this.step(lattice);
    }

    // Reverse steps
    for (let i = 0; i < steps; i++) {
      this.reverseStep(lattice);
    }

    // Calculate Hamming distance
    let hammingDistance = 0;
    const totalNodes = this.N * this.N * this.N;

    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const node = lattice.getNode(x, y, z);
          const key = `${x},${y},${z}`;
          const initialSpin = initialSpins.get(key) ?? 0;
          
          if (node && node.spin !== initialSpin) {
            hammingDistance++;
          }
        }
      }
    }

    const ratio = hammingDistance / totalNodes;
    const passed = ratio < 0.001; // Author's threshold

    // Restore phase
    this.phaseStep = initialPhase;

    return {
      hammingDistance,
      ratio,
      passed,
      message: passed 
        ? `OK ${ratio.toFixed(6)}` 
        : `LOST ${ratio.toFixed(6)}`
    };
  }

  /**
   * Get current phase step
   */
  getPhaseStep(): number {
    return this.phaseStep;
  }

  /**
   * Reset phase step
   */
  resetPhase(): void {
    this.phaseStep = 0;
  }
}
