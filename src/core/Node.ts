/**
 * Node class representing a single lattice point in the TDS simulation
 * Manages state, energy, phase, and visual properties for rendering
 */

export type NodeState = 'symmetric' | 'asymmetric' | 'anomaly';

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
}

export interface NodeData {
  position: Position;
  state: NodeState;
  energy: number;
  phase: number;
  visual: VisualProperties;
}

export class Node {
  readonly position: Position;
  state: NodeState;
  energy: number;
  phase: number;
  visual: VisualProperties;
  
  private previousState: NodeState | null = null;
  private previousEnergy: number = 0;
  private previousPhase: number = 0;

  /**
   * Create a new Node
   * @param x - X coordinate in lattice
   * @param y - Y coordinate in lattice
   * @param z - Z coordinate in lattice (default 0 for 2D)
   */
  constructor(x: number, y: number, z: number = 0) {
    this.position = { x, y, z };
    this.state = 'symmetric';
    this.energy = 0;
    this.phase = 0;
    
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
   * @param neighbors - Array of neighboring nodes
   * @param params - Physics parameters
   */
  updateState(neighbors: Node[], params: PhysicsParams): void {
    this.previousState = this.state;
    this.previousEnergy = this.energy;
    this.previousPhase = this.phase;
    
    const localSymmetry = this._calculateLocalSymmetry(neighbors);
    const energyGradient = this._calculateEnergyGradient(neighbors);
    
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    if (this.state === 'symmetric') {
      if (Math.random() > transitionProbability) {
        if (energyGradient > params.energyThreshold) {
          this.state = 'anomaly';
          this._updateVisualForAnomaly();
        } else {
          this.state = 'asymmetric';
          this._updateVisualForAsymmetric();
        }
      }
    } else if (this.state === 'asymmetric') {
      if (localSymmetry > 0.7) {
        this.state = 'symmetric';
        this._updateVisualForSymmetric();
      } else if (energyGradient > params.energyThreshold * 1.5) {
        this.state = 'anomaly';
        this._updateVisualForAnomaly();
      }
    } else if (this.state === 'anomaly') {
      if (Math.random() < 0.1 && localSymmetry > 0.5) {
        this.state = 'asymmetric';
        this._updateVisualForAsymmetric();
      }
    }
    
    this._updatePhase(neighbors);
    this.visual.pulse = (this.visual.pulse + this.visual.pulseSpeed) % 1.0;
  }

  /**
   * Calculate the energy of this node based on its state and neighbors
   * @param neighbors - Array of neighboring nodes
   * @returns Calculated energy value
   */
  calculateEnergy(neighbors: Node[] = []): number {
    let energy = 0;
    
    switch (this.state) {
      case 'symmetric':
        energy = 1.0;
        break;
      case 'asymmetric':
        energy = 2.0;
        break;
      case 'anomaly':
        energy = 5.0;
        break;
    }
    
    if (neighbors.length > 0) {
      const avgNeighborEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
      const interactionEnergy = Math.abs(energy - avgNeighborEnergy) * 0.5;
      energy += interactionEnergy;
    }
    
    energy += Math.sin(this.phase) * 0.3;
    
    this.energy = energy;
    this.visual.glow = Math.min(1.0, this.energy / 10.0);
    
    return energy;
  }

  /**
   * Calculate local symmetry based on neighbors
   */
  private _calculateLocalSymmetry(neighbors: Node[]): number {
    if (neighbors.length === 0) return 1.0;
    
    const symmetricCount = neighbors.filter(n => n.state === 'symmetric').length;
    return symmetricCount / neighbors.length;
  }

  /**
   * Calculate energy gradient with neighbors
   */
  private _calculateEnergyGradient(neighbors: Node[]): number {
    if (neighbors.length === 0) return 0;
    
    const avgEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
    return Math.abs(this.energy - avgEnergy);
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
   * Update visual properties for symmetric state
   */
  private _updateVisualForSymmetric(): void {
    this.visual.color = '#4CAF50';
    this.visual.glow = 0.2;
    this.visual.pulseSpeed = 0.05;
  }

  /**
   * Update visual properties for asymmetric state
   */
  private _updateVisualForAsymmetric(): void {
    this.visual.color = '#FFC107';
    this.visual.glow = 0.4;
    this.visual.pulseSpeed = 0.08;
  }

  /**
   * Update visual properties for anomaly state
   */
  private _updateVisualForAnomaly(): void {
    this.visual.color = '#F44336';
    this.visual.glow = 0.8;
    this.visual.pulseSpeed = 0.15;
  }

  /**
   * Revert to previous state (for time reversibility)
   */
  revertToPreviousState(): void {
    if (this.previousState !== null) {
      this.state = this.previousState;
      this.energy = this.previousEnergy;
      this.phase = this.previousPhase;
      
      switch (this.state) {
        case 'symmetric':
          this._updateVisualForSymmetric();
          break;
        case 'asymmetric':
          this._updateVisualForAsymmetric();
          break;
        case 'anomaly':
          this._updateVisualForAnomaly();
          break;
      }
    }
  }

  /**
   * Force set the state of the node (for manual anomaly creation)
   * @param newState - New state
   */
  setState(newState: NodeState): void {
    this.previousState = this.state;
    this.state = newState;
    
    switch (newState) {
      case 'symmetric':
        this._updateVisualForSymmetric();
        break;
      case 'asymmetric':
        this._updateVisualForAsymmetric();
        break;
      case 'anomaly':
        this._updateVisualForAnomaly();
        break;
    }
  }

  /**
   * Get a serializable representation of the node
   * @returns Node data
   */
  toJSON(): NodeData {
    return {
      position: { ...this.position },
      state: this.state,
      energy: this.energy,
      phase: this.phase,
      visual: { ...this.visual }
    };
  }

  /**
   * Restore node from serialized data
   * @param data - Serialized node data
   */
  fromJSON(data: NodeData): void {
    this.state = data.state;
    this.energy = data.energy;
    this.phase = data.phase;
    this.visual = { ...data.visual };
  }
}
