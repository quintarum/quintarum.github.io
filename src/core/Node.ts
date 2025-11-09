/**
 * Node class representing a single lattice point in the TDS simulation
 * Manages state, energy components (E_sym, E_asym), spin, phase, and visual properties
 * 
 * TDS States:
 * - vacuum: E_asym = 0, E_sym = E_0 (symmetric ground state)
 * - broken: E_asym > 0, transitional state with symmetry breaking
 * - anomalous: E_asym persistent, topological defect with mass M = ℏω₀
 */

export type NodeState = 'vacuum' | 'broken' | 'anomalous';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface VisualProperties {
  color: string;
  glow: number;
  pulse: number;
  pulseSpeed: number;
  opacity: number;
}

export interface PhysicsParams {
  symmetryStrength: number;
  anomalyProbability: number;
  energyThreshold: number;
  interactionRange?: number;
  waveSpeed?: number;
  timeStep?: number;
  E_0?: number; // Total conserved energy per node
}

export interface NodeData {
  position: Position;
  state: NodeState;
  spin: number;
  E_sym: number;
  E_asym: number;
  phase: number;
  omega: number;
  visual: VisualProperties;
}

export class Node {
  readonly position: Position;
  state: NodeState;
  spin: number; // s_i ∈ {-1, +1}
  E_sym: number; // Symmetric energy component
  E_asym: number; // Asymmetric energy component
  phase: number; // Phase φ
  omega: number; // Internal oscillation frequency ω₀
  visual: VisualProperties;
  
  private previousState: NodeState | null = null;
  private previousSpin: number = 1;
  private previousE_sym: number = 0;
  private previousE_asym: number = 0;
  private previousPhase: number = 0;
  private previousOmega: number = 0;
  
  // Constants for TDS physics
  private static readonly HBAR = 1.0; // ℏ in simulation units

  /**
   * Create a new Node in vacuum state
   * @param x - X coordinate in lattice
   * @param y - Y coordinate in lattice
   * @param z - Z coordinate in lattice (default 0 for 2D)
   * @param E_0 - Total conserved energy (default 1.0)
   */
  constructor(x: number, y: number, z: number = 0, E_0: number = 1.0) {
    this.position = { x, y, z };
    this.state = 'vacuum';
    this.spin = Math.random() < 0.5 ? -1 : 1; // Random initial spin
    this.E_sym = E_0; // Vacuum state: all energy is symmetric
    this.E_asym = 0; // No asymmetric energy in vacuum
    this.phase = 0;
    this.omega = 0; // No oscillation in vacuum
    
    this.visual = {
      color: '#4CAF50',
      glow: 0,
      pulse: 0,
      pulseSpeed: 0.05,
      opacity: 1.0
    };
  }

  /**
   * Update node state based on neighbors and physics parameters
   * Implements TDS dynamics with E_sym ↔ E_asym energy exchange
   * @param neighbors - Array of neighboring nodes
   * @param params - Physics parameters
   */
  updateState(neighbors: Node[], params: PhysicsParams): void {
    // Save previous state for reversibility
    this.previousState = this.state;
    this.previousSpin = this.spin;
    this.previousE_sym = this.E_sym;
    this.previousE_asym = this.E_asym;
    this.previousPhase = this.phase;
    this.previousOmega = this.omega;
    
    const localSymmetry = this._calculateLocalSymmetry(neighbors);
    const energyGradient = this._calculateEnergyGradient(neighbors);
    
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    // State transitions based on TDS physics
    if (this.state === 'vacuum') {
      // Vacuum can break symmetry if conditions are right
      if (Math.random() > transitionProbability) {
        if (energyGradient > params.energyThreshold) {
          this.state = 'anomalous';
          this._transitionToAnomalous();
        } else {
          this.state = 'broken';
          this._transitionToBroken();
        }
      }
    } else if (this.state === 'broken') {
      // Broken state can restore to vacuum or become anomalous
      if (localSymmetry > 0.7) {
        this.state = 'vacuum';
        this._transitionToVacuum();
      } else if (energyGradient > params.energyThreshold * 1.5) {
        this.state = 'anomalous';
        this._transitionToAnomalous();
      }
    } else if (this.state === 'anomalous') {
      // Anomalous state is persistent but can decay
      if (Math.random() < 0.1 && localSymmetry > 0.5) {
        this.state = 'broken';
        this._transitionToBroken();
      }
    }
    
    this._updatePhase(neighbors);
    this.visual.pulse = (this.visual.pulse + this.visual.pulseSpeed) % 1.0;
  }

  /**
   * Calculate E_sym and E_asym based on neighbors and spin alignment
   * Implements TDS energy dynamics with conservation E_sym + E_asym = E_0
   * @param neighbors - Array of neighboring nodes
   * @param _J - Coupling strength (reserved for future use)
   * @param E_0 - Total conserved energy
   */
  calculateEnergy(neighbors: Node[] = [], _J: number = 1.0, E_0: number = 1.0): void {
    // Calculate E_sym based on spin alignment with neighbors
    let spinAlignment = 0;
    if (neighbors.length > 0) {
      for (const neighbor of neighbors) {
        spinAlignment += this.spin * neighbor.spin; // s_i × s_j
      }
      spinAlignment /= neighbors.length;
    } else {
      spinAlignment = 1.0; // Isolated node is aligned with itself
    }
    
    // E_sym increases with spin alignment
    // Perfect alignment (spinAlignment = 1) → E_sym = E_0, E_asym = 0
    // Perfect anti-alignment (spinAlignment = -1) → E_sym = 0, E_asym = E_0
    const alignmentFactor = (1 + spinAlignment) / 2; // Map [-1,1] to [0,1]
    
    // Calculate E_sym and E_asym maintaining conservation
    this.E_sym = E_0 * alignmentFactor;
    this.E_asym = E_0 * (1 - alignmentFactor);
    
    // Add phase-dependent modulation
    const phaseModulation = Math.sin(this.phase) * 0.1 * E_0;
    this.E_sym += phaseModulation;
    this.E_asym -= phaseModulation; // Maintain conservation
    
    // Ensure non-negative energies
    if (this.E_sym < 0) {
      this.E_asym += this.E_sym;
      this.E_sym = 0;
    }
    if (this.E_asym < 0) {
      this.E_sym += this.E_asym;
      this.E_asym = 0;
    }
    
    // Update visual glow based on total energy
    const totalEnergy = this.E_sym + this.E_asym;
    this.visual.glow = Math.min(1.0, totalEnergy / (2 * E_0));
  }
  
  /**
   * Get total energy E_0 = E_sym + E_asym
   * @returns Total energy
   */
  getTotalEnergy(): number {
    return this.E_sym + this.E_asym;
  }
  
  /**
   * Get mass for anomalous nodes: M = ℏω₀
   * @returns Mass (0 for non-anomalous nodes)
   */
  getMass(): number {
    if (this.state === 'anomalous') {
      return Node.HBAR * this.omega;
    }
    return 0;
  }

  /**
   * Calculate local symmetry based on neighbors (vacuum state ratio)
   */
  private _calculateLocalSymmetry(neighbors: Node[]): number {
    if (neighbors.length === 0) return 1.0;
    
    const vacuumCount = neighbors.filter(n => n.state === 'vacuum').length;
    return vacuumCount / neighbors.length;
  }

  /**
   * Calculate energy gradient with neighbors (E_asym gradient)
   */
  private _calculateEnergyGradient(neighbors: Node[]): number {
    if (neighbors.length === 0) return 0;
    
    const avgE_asym = neighbors.reduce((sum, n) => sum + n.E_asym, 0) / neighbors.length;
    return Math.abs(this.E_asym - avgE_asym);
  }
  
  /**
   * Transition to vacuum state: E_asym → 0, E_sym → E_0
   */
  private _transitionToVacuum(): void {
    const E_0 = this.E_sym + this.E_asym;
    this.E_sym = E_0;
    this.E_asym = 0;
    this.omega = 0;
    this._updateVisualForVacuum();
  }
  
  /**
   * Transition to broken state: E_asym > 0, transitional
   */
  private _transitionToBroken(): void {
    const E_0 = this.E_sym + this.E_asym;
    this.E_asym = E_0 * 0.3; // 30% asymmetric energy
    this.E_sym = E_0 * 0.7;
    this.omega = 0.5; // Low frequency oscillation
    this._updateVisualForBroken();
  }
  
  /**
   * Transition to anomalous state: persistent E_asym, high ω₀
   */
  private _transitionToAnomalous(): void {
    const E_0 = this.E_sym + this.E_asym;
    this.E_asym = E_0 * 0.7; // 70% asymmetric energy
    this.E_sym = E_0 * 0.3;
    this.omega = 2.0 + Math.random() * 3.0; // High frequency oscillation
    this._updateVisualForAnomalous();
  }

  /**
   * Update phase based on neighbors
   */
  private _updatePhase(neighbors: Node[]): void {
    if (neighbors.length === 0) return;
    
    const avgPhase = neighbors.reduce((sum, n) => sum + n.phase, 0) / neighbors.length;
    const phaseDiff = avgPhase - this.phase;
    this.phase += phaseDiff * 0.1;
    
    this.phase = this.phase % (2 * Math.PI);
    if (this.phase < 0) this.phase += 2 * Math.PI;
  }

  /**
   * Update visual properties for vacuum state
   */
  private _updateVisualForVacuum(): void {
    this.visual.color = '#4CAF50'; // Green
    this.visual.glow = 0.2;
    this.visual.pulseSpeed = 0.05;
  }

  /**
   * Update visual properties for broken state
   */
  private _updateVisualForBroken(): void {
    this.visual.color = '#FFC107'; // Yellow
    this.visual.glow = 0.4;
    this.visual.pulseSpeed = 0.08;
  }

  /**
   * Update visual properties for anomalous state
   */
  private _updateVisualForAnomalous(): void {
    this.visual.color = '#F44336'; // Red
    this.visual.glow = 0.8;
    this.visual.pulseSpeed = 0.15 * (this.omega / 5.0); // Pulse speed based on ω₀
  }

  /**
   * Revert to previous state (for time reversibility)
   */
  revertToPreviousState(): void {
    if (this.previousState !== null) {
      this.state = this.previousState;
      this.spin = this.previousSpin;
      this.E_sym = this.previousE_sym;
      this.E_asym = this.previousE_asym;
      this.phase = this.previousPhase;
      this.omega = this.previousOmega;
      
      switch (this.state) {
        case 'vacuum':
          this._updateVisualForVacuum();
          break;
        case 'broken':
          this._updateVisualForBroken();
          break;
        case 'anomalous':
          this._updateVisualForAnomalous();
          break;
      }
    }
  }

  /**
   * Force set the state of the node (for manual state creation)
   * @param newState - New state
   */
  setState(newState: NodeState): void {
    this.previousState = this.state;
    this.previousSpin = this.spin;
    this.previousE_sym = this.E_sym;
    this.previousE_asym = this.E_asym;
    this.previousOmega = this.omega;
    
    this.state = newState;
    
    switch (newState) {
      case 'vacuum':
        this._transitionToVacuum();
        break;
      case 'broken':
        this._transitionToBroken();
        break;
      case 'anomalous':
        this._transitionToAnomalous();
        break;
    }
  }
  
  /**
   * Flip spin state
   */
  flipSpin(): void {
    this.spin = -this.spin;
  }

  /**
   * Get a serializable representation of the node
   * @returns Node data with TDS properties
   */
  toJSON(): NodeData {
    return {
      position: { ...this.position },
      state: this.state,
      spin: this.spin,
      E_sym: this.E_sym,
      E_asym: this.E_asym,
      phase: this.phase,
      omega: this.omega,
      visual: { ...this.visual }
    };
  }

  /**
   * Restore node from serialized data
   * @param data - Serialized node data
   */
  fromJSON(data: NodeData): void {
    this.state = data.state;
    this.spin = data.spin;
    this.E_sym = data.E_sym;
    this.E_asym = data.E_asym;
    this.phase = data.phase;
    this.omega = data.omega;
    this.visual = { ...data.visual };
  }
  
  /**
   * Get backward compatibility energy value (E_sym + E_asym)
   * @deprecated Use E_sym and E_asym separately
   */
  get energy(): number {
    return this.E_sym + this.E_asym;
  }
  
  /**
   * Set backward compatibility energy value
   * @deprecated Use E_sym and E_asym separately
   */
  set energy(value: number) {
    // Distribute energy based on current state
    const ratio = this.E_asym / (this.E_sym + this.E_asym + 1e-10);
    this.E_asym = value * ratio;
    this.E_sym = value * (1 - ratio);
  }
}
