import { Node, NodeState, PhysicsParams, NodeData } from './Node.js';

export interface LatticeStatistics {
  total: number;
  symmetric: number;
  asymmetric: number;
  anomalies: number;
  totalEnergy: number;
  avgEnergy: number;
  maxEnergy: number;
  minEnergy: number;
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
   * Get statistics about the current lattice state
   * @returns Statistics object
   */
  getStatistics(): LatticeStatistics {
    const stats: LatticeStatistics = {
      total: this.nodes.length,
      symmetric: 0,
      asymmetric: 0,
      anomalies: 0,
      totalEnergy: 0,
      avgEnergy: 0,
      maxEnergy: 0,
      minEnergy: Infinity
    };
    
    for (const node of this.nodes) {
      switch (node.state) {
        case 'symmetric':
          stats.symmetric++;
          break;
        case 'asymmetric':
          stats.asymmetric++;
          break;
        case 'anomaly':
          stats.anomalies++;
          break;
      }
      
      stats.totalEnergy += node.energy;
      stats.maxEnergy = Math.max(stats.maxEnergy, node.energy);
      stats.minEnergy = Math.min(stats.minEnergy, node.energy);
    }
    
    stats.avgEnergy = stats.totalEnergy / stats.total;
    
    return stats;
  }

  /**
   * Reset all nodes to symmetric state
   */
  reset(): void {
    for (const node of this.nodes) {
      node.setState('symmetric');
      node.energy = 1.0;
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
    
    centerNode.setState('anomaly');
    
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
            node.setState('asymmetric');
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
}
