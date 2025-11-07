/**
 * Node class representing a single lattice point in the TDS simulation
 * Manages state, energy, phase, and visual properties for rendering
 */
export class Node {
  /**
   * Create a new Node
   * @param {number} x - X coordinate in lattice
   * @param {number} y - Y coordinate in lattice
   * @param {number} z - Z coordinate in lattice (default 0 for 2D)
   */
  constructor(x, y, z = 0) {
    // Position in lattice
    this.position = { x, y, z };
    
    // Physical state: 'symmetric', 'asymmetric', 'anomaly'
    this.state = 'symmetric';
    
    // Energy level of the node
    this.energy = 0;
    
    // Phase value (0 to 2π)
    this.phase = 0;
    
    // Visual properties for rendering
    this.visual = {
      color: '#4CAF50',      // Default green for symmetric
      glow: 0,               // Glow intensity (0-1)
      pulse: 0,              // Pulse animation phase (0-1)
      pulseSpeed: 0.05,      // Speed of pulse animation
      opacity: 1.0           // Node opacity
    };
    
    // Previous state for reversibility
    this.previousState = null;
    this.previousEnergy = 0;
    this.previousPhase = 0;
  }

  /**
   * Update node state based on neighbors and physics parameters
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @param {Object} params - Physics parameters
   * @param {number} params.symmetryStrength - Strength of symmetry influence
   * @param {number} params.anomalyProbability - Probability of anomaly formation
   * @param {number} params.energyThreshold - Energy threshold for state transitions
   */
  updateState(neighbors, params) {
    // Save current state for reversibility
    this.previousState = this.state;
    this.previousEnergy = this.energy;
    this.previousPhase = this.phase;
    
    // Calculate local symmetry from neighbors
    const localSymmetry = this._calculateLocalSymmetry(neighbors);
    
    // Calculate energy gradient
    const energyGradient = this._calculateEnergyGradient(neighbors);
    
    // Determine state transition based on TDS rules
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    // State transition logic
    if (this.state === 'symmetric') {
      // Symmetric nodes can become asymmetric or anomalous
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
      // Asymmetric nodes can return to symmetric or become anomalous
      if (localSymmetry > 0.7) {
        this.state = 'symmetric';
        this._updateVisualForSymmetric();
      } else if (energyGradient > params.energyThreshold * 1.5) {
        this.state = 'anomaly';
        this._updateVisualForAnomaly();
      }
    } else if (this.state === 'anomaly') {
      // Anomalies can decay back to asymmetric
      if (Math.random() < 0.1 && localSymmetry > 0.5) {
        this.state = 'asymmetric';
        this._updateVisualForAsymmetric();
      }
    }
    
    // Update phase based on neighbors
    this._updatePhase(neighbors);
    
    // Update pulse animation
    this.visual.pulse = (this.visual.pulse + this.visual.pulseSpeed) % 1.0;
  }

  /**
   * Calculate the energy of this node based on its state and neighbors
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @returns {number} Calculated energy value
   */
  calculateEnergy(neighbors = []) {
    let energy = 0;
    
    // Base energy depends on state
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
    
    // Add interaction energy with neighbors
    if (neighbors.length > 0) {
      const avgNeighborEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
      const interactionEnergy = Math.abs(energy - avgNeighborEnergy) * 0.5;
      energy += interactionEnergy;
    }
    
    // Add phase contribution
    energy += Math.sin(this.phase) * 0.3;
    
    this.energy = energy;
    
    // Update glow based on energy
    this.visual.glow = Math.min(1.0, this.energy / 10.0);
    
    return energy;
  }

  /**
   * Calculate local symmetry based on neighbors
   * @private
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @returns {number} Local symmetry value (0-1)
   */
  _calculateLocalSymmetry(neighbors) {
    if (neighbors.length === 0) return 1.0;
    
    const symmetricCount = neighbors.filter(n => n.state === 'symmetric').length;
    return symmetricCount / neighbors.length;
  }

  /**
   * Calculate energy gradient with neighbors
   * @private
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @returns {number} Energy gradient value
   */
  _calculateEnergyGradient(neighbors) {
    if (neighbors.length === 0) return 0;
    
    const avgEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
    return Math.abs(this.energy - avgEnergy);
  }

  /**
   * Update phase based on neighbors
   * @private
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   */
  _updatePhase(neighbors) {
    if (neighbors.length === 0) return;
    
    // Average phase of neighbors
    const avgPhase = neighbors.reduce((sum, n) => sum + n.phase, 0) / neighbors.length;
    
    // Phase coupling
    const phaseDiff = avgPhase - this.phase;
    this.phase += phaseDiff * 0.1;
    
    // Keep phase in [0, 2π]
    this.phase = this.phase % (2 * Math.PI);
    if (this.phase < 0) this.phase += 2 * Math.PI;
  }

  /**
   * Update visual properties for symmetric state
   * @private
   */
  _updateVisualForSymmetric() {
    this.visual.color = '#4CAF50';  // Green
    this.visual.glow = 0.2;
    this.visual.pulseSpeed = 0.05;
  }

  /**
   * Update visual properties for asymmetric state
   * @private
   */
  _updateVisualForAsymmetric() {
    this.visual.color = '#FFC107';  // Amber
    this.visual.glow = 0.4;
    this.visual.pulseSpeed = 0.08;
  }

  /**
   * Update visual properties for anomaly state
   * @private
   */
  _updateVisualForAnomaly() {
    this.visual.color = '#F44336';  // Red
    this.visual.glow = 0.8;
    this.visual.pulseSpeed = 0.15;
  }

  /**
   * Revert to previous state (for time reversibility)
   */
  revertToPreviousState() {
    if (this.previousState !== null) {
      this.state = this.previousState;
      this.energy = this.previousEnergy;
      this.phase = this.previousPhase;
      
      // Update visuals based on reverted state
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
   * @param {string} newState - New state ('symmetric', 'asymmetric', 'anomaly')
   */
  setState(newState) {
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
   * @returns {Object} Node data
   */
  toJSON() {
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
   * @param {Object} data - Serialized node data
   */
  fromJSON(data) {
    this.position = { ...data.position };
    this.state = data.state;
    this.energy = data.energy;
    this.phase = data.phase;
    this.visual = { ...data.visual };
  }
}
