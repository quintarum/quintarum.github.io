/**
 * ReversibilityValidator - TDS reversibility validation
 * 
 * Validates E_sym + E_asym = E_0 throughout history and calculates
 * reversibility scores for forward-backward cycles.
 */

import { Simulation } from './Simulation.js';
import { Lattice } from './Lattice.js';

export interface ReversibilityScore {
  energyConservation: number;
  stateConsistency: number;
  spinConsistency: number;
  overallScore: number;
  isPerfectlyReversible: boolean;
}

export interface ValidationResult {
  timestamp: number;
  step: number;
  E_0_total: number;
  E_0_expected: number;
  deviation: number;
  isValid: boolean;
}

export interface CycleTestResult {
  forwardSteps: number;
  backwardSteps: number;
  initialState: string;
  finalState: string;
  score: ReversibilityScore;
  violations: ValidationResult[];
  success: boolean;
}

export class ReversibilityValidator {
  private validationHistory: ValidationResult[] = [];
  private readonly MAX_HISTORY = 1000;
  private continuousMode = false;
  private readonly tolerance: number;

  constructor(tolerance: number = 1e-6) {
    this.tolerance = tolerance;
  }

  /**
   * Validate E_sym + E_asym = E_0 for entire lattice
   */
  validateConservation(lattice: Lattice, step: number, E_0_expected: number = 1.0): ValidationResult {
    const energies = lattice.calculateTotalEnergy();
    const E_0_total = energies.E_0;
    const E_0_per_node = E_0_total / lattice.getNodeCount();
    const deviation = Math.abs(E_0_per_node - E_0_expected);

    const result: ValidationResult = {
      timestamp: Date.now(),
      step,
      E_0_total,
      E_0_expected: E_0_expected * lattice.getNodeCount(),
      deviation,
      isValid: deviation < this.tolerance
    };

    // Add to history
    if (this.validationHistory.length >= this.MAX_HISTORY) {
      this.validationHistory.shift();
    }
    this.validationHistory.push(result);

    return result;
  }

  /**
   * Run forward-backward cycle test
   */
  async testReversibilityCycle(
    simulation: Simulation,
    steps: number = 100
  ): Promise<CycleTestResult> {
    // Capture initial state
    const initialLattice = simulation.lattice.toJSON();
    const initialHash = this._hashLatticeState(initialLattice);

    // Run forward
    for (let i = 0; i < steps; i++) {
      simulation.step();
      
      if (this.continuousMode) {
        this.validateConservation(simulation.lattice, i, 1.0);
      }
    }

    // Run backward
    simulation.setDirection(-1);
    for (let i = 0; i < steps; i++) {
      simulation.step();
      
      if (this.continuousMode) {
        this.validateConservation(simulation.lattice, steps + i, 1.0);
      }
    }
    simulation.setDirection(1);

    // Capture final state
    const finalLattice = simulation.lattice.toJSON();
    const finalHash = this._hashLatticeState(finalLattice);

    // Calculate reversibility score
    const score = this._calculateReversibilityScore(initialLattice, finalLattice);

    // Get violations
    const violations = this.validationHistory.filter(v => !v.isValid);

    return {
      forwardSteps: steps,
      backwardSteps: steps,
      initialState: initialHash,
      finalState: finalHash,
      score,
      violations,
      success: score.isPerfectlyReversible
    };
  }

  /**
   * Calculate reversibility score comparing two lattice states
   */
  private _calculateReversibilityScore(
    initial: any,
    final: any
  ): ReversibilityScore {
    let energyMatches = 0;
    let stateMatches = 0;
    let spinMatches = 0;
    const totalNodes = initial.nodes.length;

    for (let i = 0; i < totalNodes; i++) {
      const initNode = initial.nodes[i];
      const finalNode = final.nodes[i];

      // Check energy conservation
      const initE0 = initNode.E_sym + initNode.E_asym;
      const finalE0 = finalNode.E_sym + finalNode.E_asym;
      if (Math.abs(initE0 - finalE0) < this.tolerance) {
        energyMatches++;
      }

      // Check state consistency
      if (initNode.state === finalNode.state) {
        stateMatches++;
      }

      // Check spin consistency
      if (initNode.spin === finalNode.spin) {
        spinMatches++;
      }
    }

    const energyConservation = energyMatches / totalNodes;
    const stateConsistency = stateMatches / totalNodes;
    const spinConsistency = spinMatches / totalNodes;
    const overallScore = (energyConservation + stateConsistency + spinConsistency) / 3;

    return {
      energyConservation,
      stateConsistency,
      spinConsistency,
      overallScore,
      isPerfectlyReversible: overallScore > 0.99
    };
  }

  /**
   * Hash lattice state for comparison
   */
  private _hashLatticeState(latticeData: any): string {
    const nodes = latticeData.nodes;
    let hash = '';
    
    for (const node of nodes) {
      hash += `${node.state}${node.spin}${node.E_sym.toFixed(6)}${node.E_asym.toFixed(6)}`;
    }
    
    // Simple hash
    let hashValue = 0;
    for (let i = 0; i < hash.length; i++) {
      hashValue = ((hashValue << 5) - hashValue) + hash.charCodeAt(i);
      hashValue = hashValue & hashValue;
    }
    
    return hashValue.toString(16);
  }

  /**
   * Enable continuous validation mode
   */
  enableContinuousMode(): void {
    this.continuousMode = true;
  }

  /**
   * Disable continuous validation mode
   */
  disableContinuousMode(): void {
    this.continuousMode = false;
  }

  /**
   * Check if continuous mode is enabled
   */
  isContinuousModeEnabled(): boolean {
    return this.continuousMode;
  }

  /**
   * Get validation history
   */
  getValidationHistory(): ValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Get validation statistics
   */
  getStatistics(): {
    totalValidations: number;
    violations: number;
    violationRate: number;
    avgDeviation: number;
    maxDeviation: number;
  } {
    if (this.validationHistory.length === 0) {
      return {
        totalValidations: 0,
        violations: 0,
        violationRate: 0,
        avgDeviation: 0,
        maxDeviation: 0
      };
    }

    const violations = this.validationHistory.filter(v => !v.isValid).length;
    const deviations = this.validationHistory.map(v => v.deviation);
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);

    return {
      totalValidations: this.validationHistory.length,
      violations,
      violationRate: violations / this.validationHistory.length,
      avgDeviation,
      maxDeviation
    };
  }

  /**
   * Clear validation history
   */
  clearHistory(): void {
    this.validationHistory = [];
  }

  /**
   * Export validation history to CSV
   */
  exportToCSV(): string {
    let csv = 'timestamp,step,E_0_total,E_0_expected,deviation,isValid\n';
    
    for (const v of this.validationHistory) {
      csv += `${v.timestamp},${v.step},${v.E_0_total},${v.E_0_expected},${v.deviation},${v.isValid}\n`;
    }
    
    return csv;
  }

  /**
   * Get conservation status for display
   */
  getConservationStatus(): {
    status: 'good' | 'warning' | 'error';
    message: string;
    color: string;
  } {
    const stats = this.getStatistics();
    
    if (stats.totalValidations === 0) {
      return {
        status: 'good',
        message: 'No validation data',
        color: 'gray'
      };
    }

    if (stats.violationRate === 0) {
      return {
        status: 'good',
        message: `✓ Perfect conservation (${stats.totalValidations} checks)`,
        color: 'green'
      };
    }

    if (stats.violationRate < 0.01) {
      return {
        status: 'warning',
        message: `⚠ Minor violations (${(stats.violationRate * 100).toFixed(2)}%)`,
        color: 'yellow'
      };
    }

    return {
      status: 'error',
      message: `✗ Conservation violated (${(stats.violationRate * 100).toFixed(1)}%)`,
      color: 'red'
    };
  }
}
