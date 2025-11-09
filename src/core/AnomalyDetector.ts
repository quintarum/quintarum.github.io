/**
 * AnomalyDetector - TDS anomaly detection algorithm
 * 
 * Identifies persistent broken nodes that should be marked as anomalous.
 * Tracks node states over configurable history depth and calculates ω₀
 * (internal oscillation frequency) for detected anomalies.
 */

import { Lattice } from './Lattice.js';
import { Node, NodeState } from './Node.js';

export interface DetectedAnomaly {
  nodeIndex: number;
  position: { x: number; y: number; z: number };
  persistenceDuration: number;
  omega: number;
  mass: number;
  E_asym_avg: number;
  detectionTimestamp: number;
}

export interface AnomalyDetectionConfig {
  historyDepth?: number;
  persistenceThreshold?: number;
  E_asym_threshold?: number;
  autoMark?: boolean;
}

export interface AnomalyReport {
  totalNodes: number;
  detectedAnomalies: DetectedAnomaly[];
  anomalyDensity: number;
  timestamp: number;
}

export class AnomalyDetector {
  private readonly historyDepth: number;
  private readonly persistenceThreshold: number;
  private readonly E_asym_threshold: number;
  private readonly autoMark: boolean;
  
  // History tracking: nodeIndex -> array of states
  private stateHistory: Map<number, NodeState[]> = new Map();
  private E_asym_history: Map<number, number[]> = new Map();
  private detectedAnomalies: DetectedAnomaly[] = [];
  
  private readonly HBAR = 1.0; // ℏ in simulation units

  /**
   * Create a new AnomalyDetector
   * @param config - Configuration options
   */
  constructor(config: AnomalyDetectionConfig = {}) {
    this.historyDepth = config.historyDepth ?? 50;
    this.persistenceThreshold = config.persistenceThreshold ?? 30;
    this.E_asym_threshold = config.E_asym_threshold ?? 0.5;
    this.autoMark = config.autoMark ?? true;
  }

  /**
   * Update history and detect anomalies
   * @param lattice - Current lattice state
   * @returns Anomaly detection report
   */
  detectAnomalies(lattice: Lattice): AnomalyReport {
    const newAnomalies: DetectedAnomaly[] = [];

    for (let i = 0; i < lattice.nodes.length; i++) {
      const node = lattice.nodes[i];
      
      // Update history
      this._updateNodeHistory(i, node);
      
      // Check if node should be marked as anomalous
      if (this._isPersistentBroken(i, node)) {
        const anomaly = this._createAnomalyRecord(i, node);
        newAnomalies.push(anomaly);
        
        // Auto-mark if enabled
        if (this.autoMark && node.state !== 'anomalous') {
          node.setState('anomalous');
          node.omega = anomaly.omega;
        }
      }
    }

    // Add to detected anomalies list
    this.detectedAnomalies.push(...newAnomalies);

    const report: AnomalyReport = {
      totalNodes: lattice.nodes.length,
      detectedAnomalies: newAnomalies,
      anomalyDensity: newAnomalies.length / lattice.nodes.length,
      timestamp: Date.now()
    };

    return report;
  }

  /**
   * Update state history for a node
   */
  private _updateNodeHistory(nodeIndex: number, node: Node): void {
    // Initialize if needed
    if (!this.stateHistory.has(nodeIndex)) {
      this.stateHistory.set(nodeIndex, []);
      this.E_asym_history.set(nodeIndex, []);
    }

    const states = this.stateHistory.get(nodeIndex)!;
    const energies = this.E_asym_history.get(nodeIndex)!;

    // Add current state
    states.push(node.state);
    energies.push(node.E_asym);

    // Limit history depth
    if (states.length > this.historyDepth) {
      states.shift();
      energies.shift();
    }
  }

  /**
   * Check if node is persistently broken
   */
  private _isPersistentBroken(nodeIndex: number, node: Node): boolean {
    const states = this.stateHistory.get(nodeIndex);
    const energies = this.E_asym_history.get(nodeIndex);

    if (!states || states.length < this.persistenceThreshold) {
      return false;
    }

    // Count how many recent states are 'broken' or 'anomalous'
    let brokenCount = 0;
    let anomalousCount = 0;
    
    for (const state of states) {
      if (state === 'broken') brokenCount++;
      if (state === 'anomalous') anomalousCount++;
    }

    // Check if E_asym has been consistently high
    const avgE_asym = energies!.reduce((sum, e) => sum + e, 0) / energies!.length;
    const hasHighE_asym = avgE_asym > this.E_asym_threshold;

    // Criteria: mostly broken/anomalous states AND high E_asym
    const persistenceRatio = (brokenCount + anomalousCount) / states.length;
    
    return persistenceRatio > 0.8 && hasHighE_asym && node.state !== 'vacuum';
  }

  /**
   * Create anomaly record with calculated ω₀
   */
  private _createAnomalyRecord(nodeIndex: number, node: Node): DetectedAnomaly {
    const states = this.stateHistory.get(nodeIndex)!;
    const energies = this.E_asym_history.get(nodeIndex)!;

    // Calculate persistence duration
    let persistenceDuration = 0;
    for (let i = states.length - 1; i >= 0; i--) {
      if (states[i] === 'broken' || states[i] === 'anomalous') {
        persistenceDuration++;
      } else {
        break;
      }
    }

    // Calculate average E_asym
    const E_asym_avg = energies.reduce((sum, e) => sum + e, 0) / energies.length;

    // Calculate ω₀ based on persistence and E_asym
    // Higher persistence and E_asym → higher ω₀
    const omega = this._calculateOmega(persistenceDuration, E_asym_avg);

    // Calculate mass M = ℏω₀
    const mass = this.HBAR * omega;

    return {
      nodeIndex,
      position: { ...node.position },
      persistenceDuration,
      omega,
      mass,
      E_asym_avg,
      detectionTimestamp: Date.now()
    };
  }

  /**
   * Calculate ω₀ based on persistence and E_asym
   */
  private _calculateOmega(persistenceDuration: number, E_asym_avg: number): number {
    // ω₀ increases with persistence and E_asym
    // Normalize to reasonable range (0.5 to 5.0)
    const persistenceFactor = Math.min(persistenceDuration / this.historyDepth, 1.0);
    const energyFactor = Math.min(E_asym_avg, 1.0);
    
    const omega = 0.5 + 4.5 * persistenceFactor * energyFactor;
    
    return omega;
  }

  /**
   * Get all detected anomalies
   */
  getDetectedAnomalies(): DetectedAnomaly[] {
    return [...this.detectedAnomalies];
  }

  /**
   * Get anomaly count
   */
  getAnomalyCount(): number {
    return this.detectedAnomalies.length;
  }

  /**
   * Clear detection history
   */
  clearHistory(): void {
    this.stateHistory.clear();
    this.E_asym_history.clear();
    this.detectedAnomalies = [];
  }

  /**
   * Get statistics about detected anomalies
   */
  getStatistics(): {
    totalDetected: number;
    avgOmega: number;
    avgMass: number;
    avgPersistence: number;
    maxOmega: number;
    minOmega: number;
  } {
    if (this.detectedAnomalies.length === 0) {
      return {
        totalDetected: 0,
        avgOmega: 0,
        avgMass: 0,
        avgPersistence: 0,
        maxOmega: 0,
        minOmega: 0
      };
    }

    const omegas = this.detectedAnomalies.map(a => a.omega);
    const masses = this.detectedAnomalies.map(a => a.mass);
    const persistences = this.detectedAnomalies.map(a => a.persistenceDuration);

    return {
      totalDetected: this.detectedAnomalies.length,
      avgOmega: omegas.reduce((sum, o) => sum + o, 0) / omegas.length,
      avgMass: masses.reduce((sum, m) => sum + m, 0) / masses.length,
      avgPersistence: persistences.reduce((sum, p) => sum + p, 0) / persistences.length,
      maxOmega: Math.max(...omegas),
      minOmega: Math.min(...omegas)
    };
  }

  /**
   * Export detected anomalies to CSV
   */
  exportToCSV(): string {
    let csv = 'nodeIndex,x,y,z,persistenceDuration,omega,mass,E_asym_avg,timestamp\n';
    
    for (const a of this.detectedAnomalies) {
      csv += `${a.nodeIndex},${a.position.x},${a.position.y},${a.position.z},`;
      csv += `${a.persistenceDuration},${a.omega},${a.mass},${a.E_asym_avg},${a.detectionTimestamp}\n`;
    }
    
    return csv;
  }

  /**
   * Get configuration
   */
  getConfig(): {
    historyDepth: number;
    persistenceThreshold: number;
    E_asym_threshold: number;
    autoMark: boolean;
  } {
    return {
      historyDepth: this.historyDepth,
      persistenceThreshold: this.persistenceThreshold,
      E_asym_threshold: this.E_asym_threshold,
      autoMark: this.autoMark
    };
  }
}
