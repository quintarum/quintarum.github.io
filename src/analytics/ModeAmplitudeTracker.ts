/**
 * ModeAmplitudeTracker - Fourier mode amplitude tracking
 * 
 * Calculates the amplitude of a specific Fourier mode A_kx and tracks
 * its RMS value over time.
 */

import { Lattice } from '../core/Lattice.js';

export interface AmplitudeMetrics {
  currentAmplitude: number;
  rmsAmplitude: number;
  sampleCount: number;
  kx: number;
}

export class ModeAmplitudeTracker {
  private kx: number;
  private N: number;
  private cosLUT: Float32Array;
  private akSumSq = 0;
  private n = 0;
  private lastAmplitude = 0;

  /**
   * Create a new ModeAmplitudeTracker
   * @param kx - Wave number (mode index)
   * @param N - Lattice size
   */
  constructor(kx: number, N: number) {
    this.kx = kx;
    this.N = N;
    this.cosLUT = new Float32Array(N);
    this.rebuildLUT();
  }

  /**
   * Rebuild cosine lookup table when kx changes
   */
  private rebuildLUT(): void {
    for (let x = 0; x < this.N; x++) {
      this.cosLUT[x] = Math.cos(2 * Math.PI * (this.kx * x) / this.N);
    }
  }

  /**
   * Update wave number and rebuild LUT
   * @param kx - New wave number
   */
  setKx(kx: number): void {
    this.kx = kx;
    this.rebuildLUT();
  }

  /**
   * Calculate current mode amplitude A_kx
   * @param lattice - The lattice to analyze
   * @returns Current amplitude
   */
  calculateAmplitude(lattice: Lattice): number {
    let proj = 0;
    
    // Project spins onto cosine basis
    for (const node of lattice.nodes) {
      proj += node.spin * this.cosLUT[node.position.x];
    }
    
    // Normalize by total number of nodes
    const amplitude = Math.abs(proj) / (this.N * this.N * this.N);
    
    // Update RMS accumulator
    this.akSumSq += amplitude * amplitude;
    this.n++;
    this.lastAmplitude = amplitude;
    
    return amplitude;
  }

  /**
   * Get RMS amplitude over all samples
   */
  getRMS(): number {
    return this.n > 0 ? Math.sqrt(this.akSumSq / this.n) : 0;
  }

  /**
   * Get last calculated amplitude
   */
  getLastAmplitude(): number {
    return this.lastAmplitude;
  }

  /**
   * Get number of samples
   */
  getSampleCount(): number {
    return this.n;
  }

  /**
   * Get current wave number
   */
  getKx(): number {
    return this.kx;
  }

  /**
   * Get complete amplitude metrics
   */
  getMetrics(): AmplitudeMetrics {
    return {
      currentAmplitude: this.lastAmplitude,
      rmsAmplitude: this.getRMS(),
      sampleCount: this.n,
      kx: this.kx
    };
  }

  /**
   * Reset all tracking
   */
  reset(): void {
    this.akSumSq = 0;
    this.n = 0;
    this.lastAmplitude = 0;
  }

  /**
   * Export metrics to CSV format
   */
  toCSV(): string {
    const metrics = this.getMetrics();
    return `kx,sampleCount,currentAmplitude,rmsAmplitude\n${metrics.kx},${metrics.sampleCount},${metrics.currentAmplitude},${metrics.rmsAmplitude}`;
  }
}
