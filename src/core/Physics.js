/**
 * Physics class implementing TDS (Theory of Dynamic Symmetry) calculations
 * Handles symmetry transitions, energy gradients, anomaly propagation, and reversible dynamics
 */
export class Physics {
  /**
   * Calculate symmetry transition probability for a node
   * @param {Node} node - The node to calculate transition for
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @param {Object} params - Physics parameters
   * @param {number} params.symmetryStrength - Strength of symmetry influence (0-1)
   * @param {number} params.anomalyProbability - Probability of anomaly formation (0-1)
   * @returns {number} Transition probability
   */
  static calculateSymmetryTransition(node, neighbors, params) {
    const localSymmetry = this.calculateLocalSymmetry(neighbors);
    const energyGradient = this.calculateEnergyGradient(node, neighbors);
    
    // TDS core law: transition probability based on local symmetry and energy gradient
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    return Math.max(0, Math.min(1, transitionProbability));
  }

  /**
   * Calculate local symmetry based on neighbor states
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @returns {number} Local symmetry value (0-1)
   */
  static calculateLocalSymmetry(neighbors) {
    if (neighbors.length === 0) return 1.0;
    
    const symmetricCount = neighbors.filter(n => n.state === 'symmetric').length;
    const asymmetricCount = neighbors.filter(n => n.state === 'asymmetric').length;
    const anomalyCount = neighbors.filter(n => n.state === 'anomaly').length;
    
    // Weighted symmetry calculation
    // Symmetric nodes contribute positively, anomalies negatively
    const symmetryScore = 
      (symmetricCount * 1.0 + asymmetricCount * 0.5 + anomalyCount * 0.0) / neighbors.length;
    
    return symmetryScore;
  }

  /**
   * Calculate energy gradient between a node and its neighbors
   * @param {Node} node - The node to calculate gradient for
   * @param {Array<Node>} neighbors - Array of neighboring nodes
   * @returns {number} Energy gradient value
   */
  static calculateEnergyGradient(node, neighbors) {
    if (neighbors.length === 0) return 0;
    
    const avgEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
    const gradient = Math.abs(node.energy - avgEnergy);
    
    // Normalize gradient to [0, 1] range
    return Math.min(1.0, gradient / 10.0);
  }

  /**
   * Propagate anomaly from a source node with wave effects
   * @param {Node} anomalyNode - The source anomaly node
   * @param {Lattice} lattice - The lattice containing the nodes
   * @param {Object} params - Physics parameters
   * @param {number} params.interactionRange - Range of anomaly influence
   * @param {number} params.anomalyProbability - Base probability of anomaly spread
   * @param {number} params.waveSpeed - Speed of anomaly wave propagation
   * @returns {Array<Node>} Array of affected nodes
   */
  static propagateAnomaly(anomalyNode, lattice, params) {
    const affectedNodes = [];
    const { x, y, z } = anomalyNode.position;
    const range = Math.ceil(params.interactionRange || 3);
    
    // Get nodes in the interaction range
    const region = lattice.getRegion(
      x - range, y - range,
      x + range, y + range,
      z - range, z + range
    );
    
    for (const node of region) {
      // Skip the anomaly node itself
      if (node === anomalyNode) continue;
      
      // Calculate distance from anomaly
      const distance = this.calculateDistance(anomalyNode, node);
      
      // Wave effect: influence decreases with distance
      const waveAmplitude = Math.exp(-distance / params.interactionRange);
      
      // Phase-based wave propagation
      const wavePhase = distance * (params.waveSpeed || 0.5);
      const waveEffect = waveAmplitude * (0.5 + 0.5 * Math.cos(wavePhase));
      
      // Probability of affecting this node
      const influenceProbability = params.anomalyProbability * waveEffect;
      
      if (Math.random() < influenceProbability) {
        // Determine effect based on distance
        if (distance < params.interactionRange * 0.3) {
          // Close nodes become anomalies
          node.setState('anomaly');
        } else if (distance < params.interactionRange * 0.7) {
          // Medium distance nodes become asymmetric
          if (node.state === 'symmetric') {
            node.setState('asymmetric');
          }
        } else {
          // Far nodes get energy boost
          node.energy += waveEffect * 2.0;
        }
        
        affectedNodes.push(node);
      }
    }
    
    return affectedNodes;
  }

  /**
   * Calculate Euclidean distance between two nodes
   * @param {Node} node1 - First node
   * @param {Node} node2 - Second node
   * @returns {number} Distance between nodes
   */
  static calculateDistance(node1, node2) {
    const dx = node1.position.x - node2.position.x;
    const dy = node1.position.y - node2.position.y;
    const dz = node1.position.z - node2.position.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate reversible dynamics for time reversibility
   * @param {Object} currentState - Current simulation state
   * @param {Object} previousState - Previous simulation state
   * @returns {Object} Reversibility analysis
   */
  static calculateReversibleDynamics(currentState, previousState) {
    const reversibility = {
      forward: currentState,
      backward: previousState,
      isReversible: true,
      reversibilityScore: 1.0,
      violations: []
    };
    
    // Check if we have both states
    if (!currentState || !previousState) {
      reversibility.isReversible = false;
      reversibility.reversibilityScore = 0;
      return reversibility;
    }
    
    // Compare energy conservation
    const energyDiff = Math.abs(currentState.totalEnergy - previousState.totalEnergy);
    const energyConservation = 1.0 - Math.min(1.0, energyDiff / currentState.totalEnergy);
    
    // Compare state transitions
    let stateMatches = 0;
    let totalNodes = 0;
    
    if (currentState.nodes && previousState.nodes) {
      totalNodes = Math.min(currentState.nodes.length, previousState.nodes.length);
      
      for (let i = 0; i < totalNodes; i++) {
        const curr = currentState.nodes[i];
        const prev = previousState.nodes[i];
        
        // Check if state transition is physically reversible
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
    
    // Calculate overall reversibility score
    reversibility.reversibilityScore = (energyConservation + stateReversibility) / 2;
    reversibility.isReversible = reversibility.reversibilityScore > 0.95;
    
    // Add detailed metrics
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
   * @private
   * @param {string} fromState - Initial state
   * @param {string} toState - Final state
   * @returns {boolean} True if transition is reversible
   */
  static _isReversibleTransition(fromState, toState) {
    // All transitions in TDS should be reversible
    // Symmetric <-> Asymmetric <-> Anomaly
    const validTransitions = {
      'symmetric': ['symmetric', 'asymmetric'],
      'asymmetric': ['symmetric', 'asymmetric', 'anomaly'],
      'anomaly': ['asymmetric', 'anomaly']
    };
    
    return validTransitions[fromState]?.includes(toState) ?? false;
  }

  /**
   * Calculate phase coherence across a region
   * @param {Array<Node>} nodes - Array of nodes to analyze
   * @returns {number} Phase coherence value (0-1)
   */
  static calculatePhaseCoherence(nodes) {
    if (nodes.length === 0) return 0;
    
    // Calculate average phase vector
    let sumCos = 0;
    let sumSin = 0;
    
    for (const node of nodes) {
      sumCos += Math.cos(node.phase);
      sumSin += Math.sin(node.phase);
    }
    
    const avgCos = sumCos / nodes.length;
    const avgSin = sumSin / nodes.length;
    
    // Coherence is the magnitude of the average phase vector
    const coherence = Math.sqrt(avgCos * avgCos + avgSin * avgSin);
    
    return coherence;
  }

  /**
   * Calculate entropy of the lattice
   * @param {Lattice} lattice - The lattice to analyze
   * @returns {number} Entropy value
   */
  static calculateEntropy(lattice) {
    const stats = lattice.getStatistics();
    const total = stats.total;
    
    if (total === 0) return 0;
    
    // Calculate probabilities for each state
    const pSymmetric = stats.symmetric / total;
    const pAsymmetric = stats.asymmetric / total;
    const pAnomaly = stats.anomalies / total;
    
    // Shannon entropy
    let entropy = 0;
    
    if (pSymmetric > 0) {
      entropy -= pSymmetric * Math.log2(pSymmetric);
    }
    if (pAsymmetric > 0) {
      entropy -= pAsymmetric * Math.log2(pAsymmetric);
    }
    if (pAnomaly > 0) {
      entropy -= pAnomaly * Math.log2(pAnomaly);
    }
    
    return entropy;
  }

  /**
   * Calculate correlation length in the lattice
   * @param {Lattice} lattice - The lattice to analyze
   * @returns {number} Correlation length
   */
  static calculateCorrelationLength(lattice) {
    // Sample nodes for correlation calculation
    const sampleSize = Math.min(100, lattice.getNodeCount());
    const correlations = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * lattice.nodes.length);
      const node = lattice.nodes[randomIndex];
      
      // Calculate correlation with neighbors at different distances
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
    
    // Find distance where correlation drops below threshold
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
   * @param {Array<Node>} nodes - Nodes to apply field to
   * @param {Object} field - Field parameters
   * @param {number} field.strength - Field strength
   * @param {string} field.type - Field type ('energy', 'phase', 'symmetry')
   */
  static applyExternalField(nodes, field) {
    for (const node of nodes) {
      switch (field.type) {
        case 'energy':
          node.energy += field.strength;
          break;
        case 'phase':
          node.phase += field.strength;
          node.phase = node.phase % (2 * Math.PI);
          break;
        case 'symmetry':
          if (field.strength > 0.5) {
            node.setState('symmetric');
          } else if (field.strength < -0.5) {
            node.setState('anomaly');
          }
          break;
      }
    }
  }
}
