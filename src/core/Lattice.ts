import { Node, NodeState, PhysicsParams, NodeData } from './Node.js';

export interface LatticeStatistics {
  total: number;
  vacuum: number;
  broken: number;
  anomalous: number;
  totalE_sym: number;
  totalE_asym: number;
  totalE_0: number;
  avgE_sym: number;
  avgE_asym: number;
  T_info: number;
  phaseCoherence: number;
  // Backward compatibility
  symmetric?: number;
  asymmetric?: number;
  anomalies?: number;
  totalEnergy?: number;
  avgEnergy?: number;
  maxEnergy?: number;
  minEnergy?: number;
}

export interface MiniMapCell {
  x: number;
  y: number;
  state: NodeState;
  energy: number;
}

export interface MiniMapData {
  width: number;
  height: number;
  data: MiniMapCell[];
}

export interface LatticeData {
  width: number;
  height: number;
  depth: number;
  nodes: NodeData[];
}

/**
 * Lattice class representing the TDS lattice structure
 * Manages a grid of nodes and their interactions
 */
export class Lattice {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly is3D: boolean;
  nodes: Node[];
  
  private miniMapData: MiniMapData | null = null;
  private miniMapDirty: boolean = true;

  /**
   * Create a new Lattice
   * @param width - Width of the lattice
   * @param height - Height of the lattice
   * @param depth - Depth of the lattice (default 1 for 2D)
   */
  constructor(width: number, height: number, depth: number = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.is3D = depth > 1;
    this.nodes = [];
    
    this.initialize();
  }

  /**
   * Initialize the lattice with nodes
   */
  initialize(): void {
    this.nodes = [];
    
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const node = new Node(x, y, z);
          this.nodes.push(node);
        }
      }
    }
    
    this.miniMapDirty = true;
  }

  /**
   * Get a node at specific coordinates
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate (default 0)
   * @returns Node at the specified position or null if out of bounds
   */
  getNode(x: number, y: number, z: number = 0): Node | null {
    if (x < 0 || x >= this.width || 
        y < 0 || y >= this.height || 
        z < 0 || z >= this.depth) {
      return null;
    }
    
    const index = z * (this.width * this.height) + y * this.width + x;
    return this.nodes[index] || null;
  }

  /**
   * Get all neighboring nodes of a given node
   * @param node - The node to find neighbors for
   * @param range - Neighborhood range (default 1 for immediate neighbors)
   * @returns Array of neighboring nodes
   */
  getNeighbors(node: Node, range: number = 1): Node[] {
    const neighbors: Node[] = [];
    const { x, y, z } = node.position;
    
    for (let dz = -range; dz <= range; dz++) {
      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          if (!this.is3D && dz !== 0) continue;
          
          const neighbor = this.getNode(x + dx, y + dy, z + dz);
          if (neighbor) {
            neighbors.push(neighbor);
          }
        }
      }
    }
    
    return neighbors;
  }

  /**
   * Get nodes in a specific region
   * @param x1 - Start X coordinate
   * @param y1 - Start Y coordinate
   * @param x2 - End X coordinate
   * @param y2 - End Y coordinate
   * @param z1 - Start Z coordinate (default 0)
   * @param z2 - End Z coordinate (default 0)
   * @returns Array of nodes in the region
   */
  getRegion(x1: number, y1: number, x2: number, y2: number, z1: number = 0, z2: number = 0): Node[] {
    const region: Node[] = [];
    
    const minX = Math.max(0, Math.min(x1, x2));
    const maxX = Math.min(this.width - 1, Math.max(x1, x2));
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(this.height - 1, Math.max(y1, y2));
    const minZ = Math.max(0, Math.min(z1, z2));
    const maxZ = Math.min(this.depth - 1, Math.max(z1, z2));
    
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const node = this.getNode(x, y, z);
          if (node) {
            region.push(node);
          }
        }
      }
    }
    
    return region;
  }

  /**
   * Update all nodes in the lattice
   * @param params - Physics parameters for state updates
   * @param deltaTime - Time step for the update
   */
  update(params: PhysicsParams, _deltaTime: number = 1): void {
    for (const node of this.nodes) {
      const neighbors = this.getNeighbors(node);
      node.calculateEnergy(neighbors);
    }
    
    for (const node of this.nodes) {
      const neighbors = this.getNeighbors(node);
      node.updateState(neighbors, params);
    }
    
    this.miniMapDirty = true;
  }

  /**
   * Generate mini-map data for visualization
   * @param resolution - Resolution of the mini-map (default 100)
   * @returns Mini-map data with state distribution
   */
  generateMiniMapData(resolution: number = 100): MiniMapData {
    if (!this.miniMapDirty && this.miniMapData) {
      return this.miniMapData;
    }
    
    const miniMap: MiniMapData = {
      width: Math.min(resolution, this.width),
      height: Math.min(resolution, this.height),
      data: []
    };
    
    const stepX = this.width / miniMap.width;
    const stepY = this.height / miniMap.height;
    
    for (let my = 0; my < miniMap.height; my++) {
      for (let mx = 0; mx < miniMap.width; mx++) {
        const x = Math.floor(mx * stepX);
        const y = Math.floor(my * stepY);
        const node = this.getNode(x, y, 0);
        
        if (node) {
          miniMap.data.push({
            x: mx,
            y: my,
            state: node.state,
            energy: node.energy
          });
        }
      }
    }
    
    this.miniMapData = miniMap;
    this.miniMapDirty = false;
    
    return miniMap;
  }

  /**
   * Get statistics about the current lattice state with TDS metrics
   * @returns Statistics object with E_sym, E_asym, T_info
   */
  getStatistics(): LatticeStatistics {
    const stats: LatticeStatistics = {
      total: this.nodes.length,
      vacuum: 0,
      broken: 0,
      anomalous: 0,
      totalE_sym: 0,
      totalE_asym: 0,
      totalE_0: 0,
      avgE_sym: 0,
      avgE_asym: 0,
      T_info: 0,
      phaseCoherence: 0
    };
    
    // Count states and sum energies
    for (const node of this.nodes) {
      switch (node.state) {
        case 'vacuum':
          stats.vacuum++;
          break;
        case 'broken':
          stats.broken++;
          break;
        case 'anomalous':
          stats.anomalous++;
          break;
      }
      
      stats.totalE_sym += node.E_sym;
      stats.totalE_asym += node.E_asym;
      stats.totalE_0 += node.getTotalEnergy();
    }
    
    stats.avgE_sym = stats.totalE_sym / stats.total;
    stats.avgE_asym = stats.totalE_asym / stats.total;
    
    // Calculate T_info (informational tension)
    stats.T_info = this.calculateT_info(1.0);
    
    // Calculate phase coherence
    stats.phaseCoherence = this.calculatePhaseCoherence();
    
    // Backward compatibility
    stats.symmetric = stats.vacuum;
    stats.asymmetric = stats.broken;
    stats.anomalies = stats.anomalous;
    stats.totalEnergy = stats.totalE_0;
    stats.avgEnergy = stats.totalE_0 / stats.total;
    stats.maxEnergy = Math.max(...this.nodes.map(n => n.getTotalEnergy()));
    stats.minEnergy = Math.min(...this.nodes.map(n => n.getTotalEnergy()));
    
    return stats;
  }

  /**
   * Reset all nodes to vacuum state (E_asym = 0, E_sym = E_0)
   */
  reset(): void {
    for (const node of this.nodes) {
      node.setState('vacuum');
      node.phase = 0;
    }
    this.miniMapDirty = true;
  }

  /**
   * Create an anomaly at a specific position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate (default 0)
   * @param radius - Radius of anomaly effect (default 1)
   */
  createAnomaly(x: number, y: number, z: number = 0, radius: number = 1): void {
    const centerNode = this.getNode(x, y, z);
    if (!centerNode) return;
    
    centerNode.setState('anomalous');
    
    if (radius > 1) {
      const region = this.getRegion(
        x - radius, y - radius,
        x + radius, y + radius,
        z - radius, z + radius
      );
      
      for (const node of region) {
        const dx = node.position.x - x;
        const dy = node.position.y - y;
        const dz = node.position.z - z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance <= radius && distance > 0) {
          const probability = 1 - (distance / radius);
          if (Math.random() < probability) {
            node.setState('broken');
          }
        }
      }
    }
    
    this.miniMapDirty = true;
  }

  /**
   * Get all nodes in a specific state
   * @param state - State to filter by
   * @returns Array of nodes in the specified state
   */
  getNodesByState(state: NodeState): Node[] {
    return this.nodes.filter(node => node.state === state);
  }

  /**
   * Serialize the lattice to JSON
   * @returns Serialized lattice data
   */
  toJSON(): LatticeData {
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      nodes: this.nodes.map(node => node.toJSON())
    };
  }

  /**
   * Restore lattice from JSON data
   * @param data - Serialized lattice data
   */
  fromJSON(data: LatticeData): void {
    this.nodes = [];
    for (const nodeData of data.nodes) {
      const node = new Node(
        nodeData.position.x,
        nodeData.position.y,
        nodeData.position.z
      );
      node.fromJSON(nodeData);
      this.nodes.push(node);
    }
    
    this.miniMapDirty = true;
  }

  /**
   * Get the total number of nodes
   * @returns Total node count
   */
  getNodeCount(): number {
    return this.nodes.length;
  }

  /**
   * Iterate over all nodes with a callback
   * @param callback - Function to call for each node
   */
  forEachNode(callback: (node: Node, index: number) => void): void {
    this.nodes.forEach(callback);
  }
  
  /**
   * Calculate total energy components {E_sym, E_asym, E_0}
   * @returns Object with energy components
   */
  calculateTotalEnergy(): { E_sym: number; E_asym: number; E_0: number } {
    let E_sym = 0;
    let E_asym = 0;
    
    for (const node of this.nodes) {
      E_sym += node.E_sym;
      E_asym += node.E_asym;
    }
    
    return {
      E_sym,
      E_asym,
      E_0: E_sym + E_asym
    };
  }
  
  /**
   * Calculate informational tension T_info = J × Σ(1 - s_i × s_j)
   * Measures the "cost" of spin misalignment across the lattice
   * @param J - Coupling strength
   * @returns Informational tension value
   */
  calculateT_info(J: number = 1.0): number {
    let tension = 0;
    const counted = new Set<string>();
    
    for (const node of this.nodes) {
      const neighbors = this.getNeighbors(node, 1);
      
      for (const neighbor of neighbors) {
        // Create unique pair identifier to avoid double-counting
        const pairKey = [
          Math.min(node.position.x, neighbor.position.x),
          Math.min(node.position.y, neighbor.position.y),
          Math.min(node.position.z, neighbor.position.z),
          Math.max(node.position.x, neighbor.position.x),
          Math.max(node.position.y, neighbor.position.y),
          Math.max(node.position.z, neighbor.position.z)
        ].join(',');
        
        if (!counted.has(pairKey)) {
          counted.add(pairKey);
          // T_info contribution: J × (1 - s_i × s_j)
          const spinProduct = node.spin * neighbor.spin;
          tension += J * (1 - spinProduct);
        }
      }
    }
    
    return tension;
  }
  
  /**
   * Calculate phase coherence across the lattice
   * @returns Coherence value (0-1, where 1 is perfect coherence)
   */
  calculatePhaseCoherence(): number {
    if (this.nodes.length === 0) return 0;
    
    let sumCos = 0;
    let sumSin = 0;
    
    for (const node of this.nodes) {
      sumCos += Math.cos(node.phase);
      sumSin += Math.sin(node.phase);
    }
    
    const avgCos = sumCos / this.nodes.length;
    const avgSin = sumSin / this.nodes.length;
    
    // Coherence is the magnitude of the average phase vector
    return Math.sqrt(avgCos * avgCos + avgSin * avgSin);
  }
  
  /**
   * Check energy conservation: E_sym + E_asym = E_0 for all nodes
   * @param tolerance - Allowed deviation (default 1e-6)
   * @returns Object with conservation status and violations
   */
  checkConservation(tolerance: number = 1e-6): {
    isConserved: boolean;
    violations: number;
    maxDeviation: number;
    avgDeviation: number;
  } {
    let violations = 0;
    let maxDeviation = 0;
    let totalDeviation = 0;
    
    for (const node of this.nodes) {
      const E_0_expected = 1.0; // Default E_0 per node
      const E_0_actual = node.E_sym + node.E_asym;
      const deviation = Math.abs(E_0_actual - E_0_expected);
      
      if (deviation > tolerance) {
        violations++;
      }
      
      maxDeviation = Math.max(maxDeviation, deviation);
      totalDeviation += deviation;
    }
    
    return {
      isConserved: violations === 0,
      violations,
      maxDeviation,
      avgDeviation: totalDeviation / this.nodes.length
    };
  }
}
