/**
 * DriftMonitor - Energy conservation drift tracking
 * 
 * Monitors deviations from the reference energy E_0_ref to detect
 * conservation law violations.
 */

export interface DriftMetrics {
  meanDrift: number;
  maxDrift: number;
  sampleCount: number;
  lastDrift: number;
}

export class DriftMonitor {
  private driftSumAbs = 0;
  private driftMaxAbs = 0;
  private lastDrift = 0;
  private n = 0;
  private readonly E_0_ref: number;

  /**
   * Create a new DriftMonitor
   * @param E_0_ref - Reference energy value (default 1.0 for normalized energy)
   */
  constructor(E_0_ref: number = 1.0) {
    this.E_0_ref = E_0_ref;
  }

  /**
   * Update drift metrics with current E_0 value
   * @param E_0_current - Current total energy
   */
  update(E_0_current: number): void {
    const drift = Math.abs(E_0_current - this.E_0_ref);
    this.lastDrift = drift;
    this.driftSumAbs += drift;
    this.driftMaxAbs = Math.max(this.driftMaxAbs, drift);
    this.n++;
  }

  /**
   * Get mean drift over all samples
   */
  getMeanDrift(): number {
    return this.n > 0 ? this.driftSumAbs / this.n : 0;
  }

  /**
   * Get maximum drift observed
   */
  getMaxDrift(): number {
    return this.driftMaxAbs;
  }

  /**
   * Get last drift value
   */
  getLastDrift(): number {
    return this.lastDrift;
  }

  /**
   * Get number of samples
   */
  getSampleCount(): number {
    return this.n;
  }

  /**
   * Check if drift exceeds threshold
   * @param threshold - Maximum acceptable drift
   */
  isViolated(threshold: number = 1e-6): boolean {
    return this.driftMaxAbs > threshold;
  }

  /**
   * Get complete drift metrics
   */
  getMetrics(): DriftMetrics {
    return {
      meanDrift: this.getMeanDrift(),
      maxDrift: this.getMaxDrift(),
      sampleCount: this.n,
      lastDrift: this.lastDrift
    };
  }

  /**
   * Format metrics for display
   */
  formatMetrics(): string {
    const mean = this.getMeanDrift().toFixed(6);
    const max = this.getMaxDrift().toFixed(6);
    return `${mean} / ${max}`;
  }

  /**
   * Reset all drift tracking
   */
  reset(): void {
    this.driftSumAbs = 0;
    this.driftMaxAbs = 0;
    this.lastDrift = 0;
    this.n = 0;
  }

  /**
   * Export drift history to CSV format
   * Note: This only exports summary statistics, not full history
   */
  toCSV(): string {
    const metrics = this.getMetrics();
    return `sampleCount,meanDrift,maxDrift,lastDrift\n${metrics.sampleCount},${metrics.meanDrift},${metrics.maxDrift},${metrics.lastDrift}`;
  }
}
