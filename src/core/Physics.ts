import { Node, NodeState, PhysicsParams } from './Node.js';
import { Lattice } from './Lattice.js';
import { ConservationEnforcer, ConservationReport } from './ConservationEnforcer.js';
import { AnomalyDetector, AnomalyReport } from './AnomalyDetector.js';

interface ReversibilityMetrics {
  energyConservation: number;
  stateReversibility: number;
  energyDifference: number;
  violationCount: number;
}

interface StateViolation {
  nodeIndex: number;
  from: NodeState;
  to: NodeState;
}

interface SimulationState {
  totalEnergy: number;
  nodes?: Array<{ state: NodeState }>;
}

interface ReversibilityAnalysis {
  forward: SimulationState;
  backward: SimulationState;
  isReversible: boolean;
  reversibilityScore: number;
  violations: StateViolation[];
  metrics?: ReversibilityMetrics;
}

interface ExternalField {
  strength: number;
  type: 'energy' | 'phase' | 'symmetry';
}

/**
 * Physics class implementing TDS (Theory of Dynamic Symmetry) calculations
 * Handles symmetry transitions, energy gradients, anomaly propagation, and reversible dynamics
 */
export class Physics {
  private static conservationEnforcer: ConservationEnforcer | null = null;
  private static anomalyDetector: AnomalyDetector | null = null;

  /**
   * Initialize conservation enforcer
   */
  static initializeConservationEnforcer(tolerance: number = 1e-6, E_0_ref: number = 1.0): void {
    this.conservationEnforcer = new ConservationEnforcer({
      tolerance,
      E_0_ref,
      logViolations: true,
      autoCorrect: true
    });
  }

  /**
   * Get conservation enforcer (creates if not exists)
   */
  static getConservationEnforcer(): ConservationEnforcer {
    if (!this.conservationEnforcer) {
      this.initializeConservationEnforcer();
    }
    return this.conservationEnforcer!;
  }

  /**
   * Enforce energy conservation on lattice
   */
  static enforceConservation(lattice: Lattice): ConservationReport {
    return this.getConservationEnforcer().enforceConservation(lattice);
  }

  /**
   * Initialize anomaly detector
   */
  static initializeAnomalyDetector(
    historyDepth: number = 50,
    persistenceThreshold: number = 30,
    E_asym_threshold: number = 0.5
  ): void {
    this.anomalyDetector = new AnomalyDetector({
      historyDepth,
      persistenceThreshold,
      E_asym_threshold,
      autoMark: true
    });
  }

  /**
   * Get anomaly detector (creates if not exists)
   */
  static getAnomalyDetector(): AnomalyDetector {
    if (!this.anomalyDetector) {
      this.initializeAnomalyDetector();
    }
    return this.anomalyDetector!;
  }

  /**
   * Detect anomalies in lattice
   */
  static detectAnomalies(lattice: Lattice): AnomalyReport {
    return this.getAnomalyDetector().detectAnomalies(lattice);
  }
  /**
   * Calculate symmetry transition probability for a node
   */
  static calculateSymmetryTransition(node: Node, neighbors: Node[], params: PhysicsParams): number {
    const localSymmetry = this.calculateLocalSymmetry(neighbors);
    const energyGradient = this.calculateEnergyGradient(node, neighbors);
    
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    return Math.max(0, Math.min(1, transitionProbability));
  }

  /**
   * Calculate local symmetry based on neighbor states (vacuum ratio)
   */
  static calculateLocalSymmetry(neighbors: Node[]): number {
    if (neighbors.length === 0) return 1.0;
    
    const vacuumCount = neighbors.filter(n => n.state === 'vacuum').length;
    const brokenCount = neighbors.filter(n => n.state === 'broken').length;
    const anomalousCount = neighbors.filter(n => n.state === 'anomalous').length;
    
    const symmetryScore = 
      (vacuumCount * 1.0 + brokenCount * 0.5 + anomalousCount * 0.0) / neighbors.length;
    
    return symmetryScore;
  }

  /**
   * Calculate energy gradient between a node and its neighbors (E_asym gradient)
   */
  static calculateEnergyGradient(node: Node, neighbors: Node[]): number {
    if (neighbors.length === 0) return 0;
    
    const avgE_asym = neighbors.reduce((sum, n) => sum + n.E_asym, 0) / neighbors.length;
    const gradient = Math.abs(node.E_asym - avgE_asym);
    
    return Math.min(1.0, gradient / 10.0);
  }

  /**
   * Propagate anomaly from a source node with wave effects
   */
  static propagateAnomaly(anomalyNode: Node, lattice: Lattice, params: PhysicsParams): Node[] {
    const affectedNodes: Node[] = [];
    const { x, y, z } = anomalyNode.position;
    const range = Math.ceil(params.interactionRange || 3);
    
    const region = lattice.getRegion(
      x - range, y - range,
      x + range, y + range,
      z - range, z + range
    );
    
    for (const node of region) {
      if (node === anomalyNode) continue;
      
      const distance = this.calculateDistance(anomalyNode, node);
      const waveAmplitude = Math.exp(-distance / (params.interactionRange || 3));
      const wavePhase = distance * (params.waveSpeed || 0.5);
      const waveEffect = waveAmplitude * (0.5 + 0.5 * Math.cos(wavePhase));
      const influenceProbability = params.anomalyProbability * waveEffect;
      
      if (Math.random() < influenceProbability) {
        if (distance < (params.interactionRange || 3) * 0.3) {
          node.setState('anomalous');
        } else if (distance < (params.interactionRange || 3) * 0.7) {
          if (node.state === 'vacuum') {
            node.setState('broken');
          }
        } else {
          // Increase energy by adding to E_asym (symmetry breaking)
          const currentE0 = node.getTotalEnergy();
          const boost = waveEffect * 2.0;
          node.E_asym = Math.min(currentE0, node.E_asym + boost);
          node.E_sym = currentE0 - node.E_asym;
        }
        
        affectedNodes.push(node);
      }
    }
    
    return affectedNodes;
  }

  /**
   * Calculate Euclidean distance between two nodes
   */
  static calculateDistance(node1: Node, node2: Node): number {
    const dx = node1.position.x - node2.position.x;
    const dy = node1.position.y - node2.position.y;
    const dz = node1.position.z - node2.position.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate reversible dynamics for time reversibility
   */
  static calculateReversibleDynamics(
    currentState: SimulationState, 
    previousState: SimulationState
  ): ReversibilityAnalysis {
    const reversibility: ReversibilityAnalysis = {
      forward: currentState,
      backward: previousState,
      isReversible: true,
      reversibilityScore: 1.0,
      violations: []
    };
    
    if (!currentState || !previousState) {
      reversibility.isReversible = false;
      reversibility.reversibilityScore = 0;
      return reversibility;
    }
    
    const energyDiff = Math.abs(currentState.totalEnergy - previousState.totalEnergy);
    const energyConservation = 1.0 - Math.min(1.0, energyDiff / currentState.totalEnergy);
    
    let stateMatches = 0;
    let totalNodes = 0;
    
    if (currentState.nodes && previousState.nodes) {
      totalNodes = Math.min(currentState.nodes.length, previousState.nodes.length);
      
      for (let i = 0; i < totalNodes; i++) {
        const curr = currentState.nodes[i];
        const prev = previousState.nodes[i];
        
        if (this._isReversibleTransition(prev.state, curr.state)) {
          stateMatches++;
        } else {
          reversibility.violations.push({
            nodeIndex: i,
            from: prev.state,
            to: curr.state
          });
        }
      }
    }
    
    const stateReversibility = totalNodes > 0 ? stateMatches / totalNodes : 1.0;
    
    reversibility.reversibilityScore = (energyConservation + stateReversibility) / 2;
    reversibility.isReversible = reversibility.reversibilityScore > 0.95;
    
    reversibility.metrics = {
      energyConservation,
      stateReversibility,
      energyDifference: energyDiff,
      violationCount: reversibility.violations.length
    };
    
    return reversibility;
  }

  /**
   * Check if a state transition is reversible
   */
  private static _isReversibleTransition(fromState: NodeState, toState: NodeState): boolean {
    const validTransitions: Record<NodeState, NodeState[]> = {
      'vacuum': ['vacuum', 'broken'],
      'broken': ['vacuum', 'broken', 'anomalous'],
      'anomalous': ['broken', 'anomalous']
    };
    
    return validTransitions[fromState]?.includes(toState) ?? false;
  }

  /**
   * Calculate phase coherence across a region
   */
  static calculatePhaseCoherence(nodes: Node[]): number {
    if (nodes.length === 0) return 0;
    
    let sumCos = 0;
    let sumSin = 0;
    
    for (const node of nodes) {
      sumCos += Math.cos(node.phase);
      sumSin += Math.sin(node.phase);
    }
    
    const avgCos = sumCos / nodes.length;
    const avgSin = sumSin / nodes.length;
    
    const coherence = Math.sqrt(avgCos * avgCos + avgSin * avgSin);
    
    return coherence;
  }

  /**
   * Calculate entropy of the lattice
   */
  static calculateEntropy(lattice: Lattice): number {
    const stats = lattice.getStatistics();
    const total = stats.total;
    
    if (total === 0) return 0;
    
    const pVacuum = stats.vacuum / total;
    const pBroken = stats.broken / total;
    const pAnomalous = stats.anomalous / total;
    
    let entropy = 0;
    
    if (pVacuum > 0) {
      entropy -= pVacuum * Math.log2(pVacuum);
    }
    if (pBroken > 0) {
      entropy -= pBroken * Math.log2(pBroken);
    }
    if (pAnomalous > 0) {
      entropy -= pAnomalous * Math.log2(pAnomalous);
    }
    
    return entropy;
  }

  /**
   * Calculate correlation length in the lattice
   */
  static calculateCorrelationLength(lattice: Lattice): number {
    const sampleSize = Math.min(100, lattice.getNodeCount());
    const correlations: number[][] = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * lattice.nodes.length);
      const node = lattice.nodes[randomIndex];
      
      for (let distance = 1; distance <= 5; distance++) {
        const neighbors = lattice.getNeighbors(node, distance);
        if (neighbors.length > 0) {
          const sameStateCount = neighbors.filter(n => n.state === node.state).length;
          const correlation = sameStateCount / neighbors.length;
          
          if (!correlations[distance]) {
            correlations[distance] = [];
          }
          correlations[distance].push(correlation);
        }
      }
    }
    
    const threshold = 0.5;
    for (let d = 1; d < correlations.length; d++) {
      if (correlations[d] && correlations[d].length > 0) {
        const avgCorrelation = correlations[d].reduce((a, b) => a + b, 0) / correlations[d].length;
        if (avgCorrelation < threshold) {
          return d;
        }
      }
    }
    
    return correlations.length;
  }

  /**
   * Apply external field to a region
   */
  static applyExternalField(nodes: Node[], field: ExternalField): void {
    for (const node of nodes) {
      switch (field.type) {
        case 'energy': {
          // Add energy by increasing E_asym (symmetry breaking)
          const currentE0 = node.getTotalEnergy();
          const boost = field.strength;
          node.E_asym = Math.min(currentE0, node.E_asym + boost);
          node.E_sym = currentE0 - node.E_asym;
          break;
        }
        case 'phase':
          node.phase += field.strength;
          node.phase = node.phase % (2 * Math.PI);
          break;
        case 'symmetry':
          if (field.strength > 0.5) {
            node.setState('vacuum');
          } else if (field.strength < -0.5) {
            node.setState('anomalous');
          }
          break;
      }
    }
  }
}
