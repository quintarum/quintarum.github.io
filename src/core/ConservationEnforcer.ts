/**
 * ConservationEnforcer - TDS energy conservation law enforcement
 * 
 * Ensures E_sym + E_asym = E_0 throughout simulation evolution.
 * Logs violations and redistributes energy when deviations exceed tolerance.
 * Enforces dE_sym/dt = -dE_asym/dt during evolution.
 */

import { Lattice } from './Lattice.js';
import { Node } from './Node.js';

export interface ConservationViolation {
  timestamp: number;
  nodeIndex: number;
  nodePosition: { x: number; y: number; z: number };
  E_sym: number;
  E_asym: number;
  E_0_expected: number;
  E_0_actual: number;
  deviation: number;
}

export interface ConservationReport {
  totalNodes: number;
  violations: ConservationViolation[];
  maxDeviation: number;
  avgDeviation: number;
  isConserved: boolean;
  timestamp: number;
}

export interface ConservationConfig {
  tolerance?: number;
  E_0_ref?: number;
  logViolations?: boolean;
  autoCorrect?: boolean;
}

export class ConservationEnforcer {
  private readonly tolerance: number;
  private readonly E_0_ref: number;
  private readonly logViolations: boolean;
  private readonly autoCorrect: boolean;
  private violations: ConservationViolation[] = [];
  private readonly MAX_VIOLATIONS = 1000;

  /**
   * Create a new ConservationEnforcer
   * @param config - Configuration options
   */
  constructor(config: ConservationConfig = {}) {
    this.tolerance = config.tolerance ?? 1e-6;
    this.E_0_ref = config.E_0_ref ?? 1.0;
    this.logViolations = config.logViolations ?? true;
    this.autoCorrect = config.autoCorrect ?? true;
  }

  /**
   * Check and enforce conservation for entire lattice
   * @param lattice - Lattice to check
   * @returns Conservation report
   */
  enforceConservation(lattice: Lattice): ConservationReport {
    const violations: ConservationViolation[] = [];
    let totalDeviation = 0;
    let maxDeviation = 0;

    for (let i = 0; i < lattice.nodes.length; i++) {
      const node = lattice.nodes[i];
      const E_0_actual = node.E_sym + node.E_asym;
      const deviation = Math.abs(E_0_actual - this.E_0_ref);

      if (deviation > this.tolerance) {
        const violation: ConservationViolation = {
          timestamp: Date.now(),
          nodeIndex: i,
          nodePosition: { ...node.position },
          E_sym: node.E_sym,
          E_asym: node.E_asym,
          E_0_expected: this.E_0_ref,
          E_0_actual,
          deviation
        };

        violations.push(violation);
        
        if (this.logViolations) {
          this._logViolation(violation);
        }

        if (this.autoCorrect) {
          this._correctNode(node);
        }
      }

      totalDeviation += deviation;
      maxDeviation = Math.max(maxDeviation, deviation);
    }

    const report: ConservationReport = {
      totalNodes: lattice.nodes.length,
      violations,
      maxDeviation,
      avgDeviation: totalDeviation / lattice.nodes.length,
      isConserved: violations.length === 0,
      timestamp: Date.now()
    };

    return report;
  }

  /**
   * Correct a single node to satisfy E_sym + E_asym = E_0
   * Redistributes energy proportionally
   */
  private _correctNode(node: Node): void {
    const E_0_actual = node.E_sym + node.E_asym;
    
    if (E_0_actual === 0) {
      // Special case: no energy, set to reference
      node.E_sym = this.E_0_ref;
      node.E_asym = 0;
      return;
    }

    // Redistribute proportionally
    const ratio_sym = node.E_sym / E_0_actual;
    const ratio_asym = node.E_asym / E_0_actual;

    node.E_sym = this.E_0_ref * ratio_sym;
    node.E_asym = this.E_0_ref * ratio_asym;
  }

  /**
   * Log conservation violation
   */
  private _logViolation(violation: ConservationViolation): void {
    // Add to violations history
    if (this.violations.length >= this.MAX_VIOLATIONS) {
      this.violations.shift();
    }
    this.violations.push(violation);

    // Console log for debugging
    if (violation.deviation > this.tolerance * 10) {
      console.warn(
        `Conservation violation at node (${violation.nodePosition.x}, ${violation.nodePosition.y}, ${violation.nodePosition.z}): ` +
        `E_0 = ${violation.E_0_actual.toFixed(6)} (expected ${violation.E_0_expected.toFixed(6)}), ` +
        `deviation = ${violation.deviation.toFixed(6)}`
      );
    }
  }

  /**
   * Verify dE_sym/dt = -dE_asym/dt relationship
   * @param lattice - Current lattice state
   * @param previousLattice - Previous lattice state
   * @param dt - Time step
   * @returns True if relationship holds within tolerance
   */
  verifyEnergyRateRelationship(
    lattice: Lattice,
    previousLattice: Lattice,
    dt: number
  ): { isValid: boolean; maxDeviation: number; violations: number } {
    let violations = 0;
    let maxDeviation = 0;

    for (let i = 0; i < lattice.nodes.length; i++) {
      const node = lattice.nodes[i];
      const prevNode = previousLattice.nodes[i];

      const dE_sym = (node.E_sym - prevNode.E_sym) / dt;
      const dE_asym = (node.E_asym - prevNode.E_asym) / dt;

      // Check if dE_sym/dt = -dE_asym/dt
      const deviation = Math.abs(dE_sym + dE_asym);

      if (deviation > this.tolerance) {
        violations++;
        maxDeviation = Math.max(maxDeviation, deviation);
      }
    }

    return {
      isValid: violations === 0,
      maxDeviation,
      violations
    };
  }

  /**
   * Get all logged violations
   */
  getViolations(): ConservationViolation[] {
    return [...this.violations];
  }

  /**
   * Get violation count
   */
  getViolationCount(): number {
    return this.violations.length;
  }

  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Get conservation statistics
   */
  getStatistics(): {
    totalViolations: number;
    maxDeviation: number;
    avgDeviation: number;
    recentViolations: number;
  } {
    if (this.violations.length === 0) {
      return {
        totalViolations: 0,
        maxDeviation: 0,
        avgDeviation: 0,
        recentViolations: 0
      };
    }

    const maxDeviation = Math.max(...this.violations.map(v => v.deviation));
    const avgDeviation = this.violations.reduce((sum, v) => sum + v.deviation, 0) / this.violations.length;
    
    // Recent violations (last 100)
    const recentCount = Math.min(100, this.violations.length);
    const recentViolations = this.violations.slice(-recentCount).length;

    return {
      totalViolations: this.violations.length,
      maxDeviation,
      avgDeviation,
      recentViolations
    };
  }

  /**
   * Export violations to CSV
   */
  exportViolationsToCSV(): string {
    let csv = 'timestamp,nodeIndex,x,y,z,E_sym,E_asym,E_0_expected,E_0_actual,deviation\n';
    
    for (const v of this.violations) {
      csv += `${v.timestamp},${v.nodeIndex},${v.nodePosition.x},${v.nodePosition.y},${v.nodePosition.z},`;
      csv += `${v.E_sym},${v.E_asym},${v.E_0_expected},${v.E_0_actual},${v.deviation}\n`;
    }
    
    return csv;
  }

  /**
   * Get tolerance threshold
   */
  getTolerance(): number {
    return this.tolerance;
  }

  /**
   * Get reference energy E_0
   */
  getE0Reference(): number {
    return this.E_0_ref;
  }

  /**
   * Check if auto-correction is enabled
   */
  isAutoCorrectionEnabled(): boolean {
    return this.autoCorrect;
  }
}
