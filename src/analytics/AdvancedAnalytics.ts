/**
 * AdvancedAnalytics - Integrated analytics system
 * 
 * Combines all advanced analytics components:
 * - Photon Window Test
 * - Online Statistics (correlation)
 * - Drift Monitor
 * - Mode Amplitude Tracker
 * - Simulation Logger
 */

import { Simulation } from '../core/Simulation.js';
import { PhotonWindowTest, PhotonWindowResult } from './PhotonWindowTest.js';
import { OnlineStatistics, StatisticsSnapshot } from './OnlineStatistics.js';
import { DriftMonitor, DriftMetrics } from './DriftMonitor.js';
import { ModeAmplitudeTracker, AmplitudeMetrics } from './ModeAmplitudeTracker.js';
import { SimulationLogger } from './SimulationLogger.js';

export interface AdvancedMetrics {
  statistics: StatisticsSnapshot;
  drift: DriftMetrics;
  amplitude: AmplitudeMetrics;
  logEntryCount: number;
}

export interface AdvancedAnalyticsConfig {
  kx?: number;
  latticeSize?: number;
  E_0_ref?: number;
  maxLogEntries?: number;
}

export class AdvancedAnalytics {
  private photonWindow: PhotonWindowTest;
  private statistics: OnlineStatistics;
  private driftMonitor: DriftMonitor;
  private amplitudeTracker: ModeAmplitudeTracker;
  private logger: SimulationLogger;
  private E_0_ref: number;

  constructor(config: AdvancedAnalyticsConfig = {}) {
    const {
      kx = 6,
      latticeSize = 64,
      E_0_ref = 1.0,
      maxLogEntries = 1500
    } = config;

    this.E_0_ref = E_0_ref;
    this.photonWindow = new PhotonWindowTest();
    this.statistics = new OnlineStatistics();
    this.driftMonitor = new DriftMonitor(E_0_ref);
    this.amplitudeTracker = new ModeAmplitudeTracker(kx, latticeSize);
    this.logger = new SimulationLogger(maxLogEntries);
  }

  /**
   * Update all analytics with current simulation state
   */
  update(simulation: Simulation): void {
    const lattice = simulation.lattice;
    const energies = lattice.calculateTotalEnergy();
    
    // Update statistics
    this.statistics.update(energies.E_sym, energies.E_asym);
    
    // Update drift monitor
    const E_0_normalized = energies.E_0 / (lattice.getNodeCount());
    this.driftMonitor.update(E_0_normalized);
    
    // Update amplitude tracker
    const amplitude = this.amplitudeTracker.calculateAmplitude(lattice);
    
    // Log current state
    this.logger.log(
      simulation.time,
      energies.E_0,
      energies.E_sym,
      energies.E_asym,
      amplitude
    );
  }

  /**
   * Run Photon Window test
   */
  async runPhotonWindowTest(simulation: Simulation, steps?: number): Promise<PhotonWindowResult> {
    return this.photonWindow.run(simulation, steps);
  }

  /**
   * Get current metrics
   */
  getMetrics(): AdvancedMetrics {
    return {
      statistics: this.statistics.getSnapshot(),
      drift: this.driftMonitor.getMetrics(),
      amplitude: this.amplitudeTracker.getMetrics(),
      logEntryCount: this.logger.getEntryCount()
    };
  }

  /**
   * Get formatted stats panel data
   */
  getStatsPanelData(): {
    rho: string;
    drift: string;
    rmsAkx: string;
  } {
    const stats = this.statistics.getSnapshot();
    const drift = this.driftMonitor.getMetrics();
    const amplitude = this.amplitudeTracker.getMetrics();

    return {
      rho: stats.correlation.toFixed(3),
      drift: `${drift.meanDrift.toFixed(5)} / ${drift.maxDrift.toFixed(5)}`,
      rmsAkx: amplitude.rmsAmplitude.toFixed(4)
    };
  }

  /**
   * Export all statistics to CSV
   */
  exportStatsToCSV(): string {
    const metrics = this.getMetrics();
    let csv = 't,rho,drift_mean,drift_max,Akx_rms\n';
    
    // Note: This exports current snapshot, not full time series
    // For full time series, use logger.exportToCSV()
    csv += `${metrics.logEntryCount},${metrics.statistics.correlation},${metrics.drift.meanDrift},${metrics.drift.maxDrift},${metrics.amplitude.rmsAmplitude}\n`;
    
    return csv;
  }

  /**
   * Export simulation log
   */
  exportLogToText(): string {
    return this.logger.exportToText();
  }

  /**
   * Export simulation log to CSV
   */
  exportLogToCSV(): string {
    return this.logger.exportToCSV();
  }

  /**
   * Get log display text
   */
  getLogDisplayText(lines?: number): string {
    return this.logger.getDisplayText(lines);
  }

  /**
   * Update wave number for amplitude tracking
   */
  setKx(kx: number): void {
    this.amplitudeTracker.setKx(kx);
  }

  /**
   * Reset all analytics
   */
  reset(): void {
    this.statistics.reset();
    this.driftMonitor.reset();
    this.amplitudeTracker.reset();
    this.logger.clear();
  }

  /**
   * Get E_0 reference value for normalization
   */
  getE0Ref(): number {
    return this.E_0_ref;
  }

  /**
   * Get individual components for advanced usage
   */
  getComponents() {
    return {
      photonWindow: this.photonWindow,
      statistics: this.statistics,
      driftMonitor: this.driftMonitor,
      modeAmplitude: this.amplitudeTracker,
      logger: this.logger
    };
  }
}
