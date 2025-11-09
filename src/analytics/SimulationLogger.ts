/**
 * SimulationLogger - Step-by-step simulation logging
 * 
 * Maintains a scrollable log of simulation state at each step
 * with automatic size limiting.
 */

export interface LogEntry {
  t: number;
  E0: number;
  E_sym: number;
  E_asym: number;
  A_kx: number;
  timestamp: number;
}

export class SimulationLogger {
  private entries: LogEntry[] = [];
  private readonly MAX_ENTRIES: number;

  /**
   * Create a new SimulationLogger
   * @param maxEntries - Maximum number of log entries to keep (default 1500)
   */
  constructor(maxEntries: number = 1500) {
    this.MAX_ENTRIES = maxEntries;
  }

  /**
   * Add a new log entry
   * @param t - Simulation time step
   * @param E0 - Total energy
   * @param E_sym - Symmetric energy
   * @param E_asym - Asymmetric energy
   * @param A_kx - Mode amplitude
   */
  log(t: number, E0: number, E_sym: number, E_asym: number, A_kx: number): void {
    const entry: LogEntry = {
      t,
      E0,
      E_sym,
      E_asym,
      A_kx,
      timestamp: Date.now()
    };

    // Remove oldest entry if at capacity
    if (this.entries.length >= this.MAX_ENTRIES) {
      this.entries.shift();
    }

    this.entries.push(entry);
  }

  /**
   * Get all log entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get last N entries
   * @param n - Number of entries to retrieve
   */
  getLastEntries(n: number): LogEntry[] {
    return this.entries.slice(-n);
  }

  /**
   * Get entry count
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Format entry as string
   */
  private formatEntry(entry: LogEntry): string {
    return `t=${entry.t} | E0=${entry.E0.toFixed(3)} | E_sym=${entry.E_sym.toFixed(3)} | E_asym=${entry.E_asym.toFixed(3)} | A_kx=${entry.A_kx.toFixed(3)}`;
  }

  /**
   * Export log to plain text
   */
  exportToText(): string {
    return this.entries.map(entry => this.formatEntry(entry)).join('\n');
  }

  /**
   * Export log to CSV
   */
  exportToCSV(): string {
    let csv = 't,E0,E_sym,E_asym,A_kx,timestamp\n';
    for (const entry of this.entries) {
      csv += `${entry.t},${entry.E0},${entry.E_sym},${entry.E_asym},${entry.A_kx},${entry.timestamp}\n`;
    }
    return csv;
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get formatted log for display (last N entries)
   * @param n - Number of entries to display (default 50)
   */
  getDisplayText(n: number = 50): string {
    const displayEntries = this.getLastEntries(n);
    return displayEntries.map(entry => this.formatEntry(entry)).join('\n');
  }

  /**
   * Search log entries by time range
   * @param startTime - Start time (inclusive)
   * @param endTime - End time (inclusive)
   */
  searchByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.entries.filter(entry => entry.t >= startTime && entry.t <= endTime);
  }

  /**
   * Get statistics from log
   */
  getStatistics(): {
    avgE0: number;
    avgE_sym: number;
    avgE_asym: number;
    avgA_kx: number;
    minE0: number;
    maxE0: number;
  } {
    if (this.entries.length === 0) {
      return {
        avgE0: 0,
        avgE_sym: 0,
        avgE_asym: 0,
        avgA_kx: 0,
        minE0: 0,
        maxE0: 0
      };
    }

    let sumE0 = 0, sumEs = 0, sumEa = 0, sumAk = 0;
    let minE0 = Infinity, maxE0 = -Infinity;

    for (const entry of this.entries) {
      sumE0 += entry.E0;
      sumEs += entry.E_sym;
      sumEa += entry.E_asym;
      sumAk += entry.A_kx;
      minE0 = Math.min(minE0, entry.E0);
      maxE0 = Math.max(maxE0, entry.E0);
    }

    const n = this.entries.length;
    return {
      avgE0: sumE0 / n,
      avgE_sym: sumEs / n,
      avgE_asym: sumEa / n,
      avgA_kx: sumAk / n,
      minE0,
      maxE0
    };
  }
}
