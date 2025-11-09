/**
 * OnlineStatistics - Real-time correlation and statistical tracking
 * 
 * Uses Welford's online algorithm for numerically stable computation of
 * mean, variance, and correlation without storing all data points.
 * 
 * Based on the author's reference implementation.
 */

export interface StatisticsSnapshot {
  n: number;
  meanEs: number;
  meanEa: number;
  correlation: number;
  varianceEs: number;
  varianceEa: number;
}

export class OnlineStatistics {
  private n = 0;
  private meanEs = 0;
  private meanEa = 0;
  private Ccov = 0;      // Covariance accumulator
  private varEs = 0;     // Variance accumulator for E_sym
  private varEa = 0;     // Variance accumulator for E_asym

  /**
   * Update statistics with new E_sym and E_asym values
   * Uses Welford's algorithm for numerical stability
   */
  update(E_sym: number, E_asym: number): void {
    this.n++;
    
    // Update means and accumulators
    const dEs = E_sym - this.meanEs;
    const dEa = E_asym - this.meanEa;
    
    this.meanEs += dEs / this.n;
    this.meanEa += dEa / this.n;
    
    // Update covariance and variance accumulators
    this.Ccov += dEs * (E_asym - this.meanEa);
    this.varEs += dEs * (E_sym - this.meanEs);
    this.varEa += dEa * (E_asym - this.meanEa);
  }

  /**
   * Get correlation coefficient ρ(E_sym, E_asym)
   * Returns value in range [-1, 1]
   */
  getCorrelation(): number {
    if (this.n < 2) return 0;
    
    const cov = this.Ccov / (this.n - 1);
    const vEs = this.varEs / (this.n - 1);
    const vEa = this.varEa / (this.n - 1);
    
    if (vEs > 0 && vEa > 0) {
      return cov / Math.sqrt(vEs * vEa);
    }
    
    return 0;
  }

  /**
   * Get variance of E_sym
   */
  getVarianceEs(): number {
    return this.n > 1 ? this.varEs / (this.n - 1) : 0;
  }

  /**
   * Get variance of E_asym
   */
  getVarianceEa(): number {
    return this.n > 1 ? this.varEa / (this.n - 1) : 0;
  }

  /**
   * Get mean of E_sym
   */
  getMeanEs(): number {
    return this.meanEs;
  }

  /**
   * Get mean of E_asym
   */
  getMeanEa(): number {
    return this.meanEa;
  }

  /**
   * Get number of samples
   */
  getSampleCount(): number {
    return this.n;
  }

  /**
   * Get complete statistics snapshot
   */
  getSnapshot(): StatisticsSnapshot {
    return {
      n: this.n,
      meanEs: this.meanEs,
      meanEa: this.meanEa,
      correlation: this.getCorrelation(),
      varianceEs: this.getVarianceEs(),
      varianceEa: this.getVarianceEa()
    };
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.n = 0;
    this.meanEs = 0;
    this.meanEa = 0;
    this.Ccov = 0;
    this.varEs = 0;
    this.varEa = 0;
  }

  /**
   * Export statistics to CSV format
   */
  toCSV(): string {
    const snapshot = this.getSnapshot();
    return `n,meanEs,meanEa,correlation,varianceEs,varianceEa\n${snapshot.n},${snapshot.meanEs},${snapshot.meanEa},${snapshot.correlation},${snapshot.varianceEs},${snapshot.varianceEa}`;
  }
}
