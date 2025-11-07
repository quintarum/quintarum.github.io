import { Node } from './Node.js';

/**
 * Lattice class representing the TDS lattice structure
 * Manages a grid of nodes and their interactions
 */
export class Lattice {
  /**
   * Create a new Lattice
   * @param {number} width - Width of the lattice
   * @param {number} height - Height of the lattice
   * @param {number} depth - Depth of the lattice (default 1 for 2D)
   */
  constructor(width, height, depth = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.nodes = [];
    this.is3D = depth > 1;
    
    // Mini-map data cache
    this.miniMapData = null;
    this.miniMapDirty = true;
    
    this.initialize();
  }

  /**
   * Initialize the lattice with nodes
   */
  initialize() {
    this.nodes = [];
    
    // Create nodes for each position in the lattice
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
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate (default 0)
   * @returns {Node|null} Node at the specified position or null if out of bounds
   */
  getNode(x, y, z = 0) {
    // Check bounds
    if (x < 0 || x >= this.width || 
        y < 0 || y >= this.height || 
        z < 0 || z >= this.depth) {
      return null;
    }
    
    // Calculate index in flat array
    const index = z * (this.width * this.height) + y * this.width + x;
    return this.nodes[index] || null;
  }

  /**
   * Get all neighboring nodes of a given node
   * @param {Node} node - The node to find neighbors for
   * @param {number} range - Neighborhood range (default 1 for immediate neighbors)
   * @returns {Array<Node>} Array of neighboring nodes
   */
  getNeighbors(node, range = 1) {
    const neighbors = [];
    const { x, y, z } = node.position;
    
    // Iterate through neighborhood
    for (let dz = -range; dz <= range; dz++) {
      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          // Skip the node itself
          if (dx === 0 && dy === 0 && dz === 0) continue;
          
          // Skip if out of range in 2D mode
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
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {number} z1 - Start Z coordinate (default 0)
   * @param {number} z2 - End Z coordinate (default 0)
   * @returns {Array<Node>} Array of nodes in the region
   */
  getRegion(x1, y1, x2, y2, z1 = 0, z2 = 0) {
    const region = [];
    
    // Ensure coordinates are in order
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
   * @param {Object} params - Physics parameters for state updates
   * @param {number} deltaTime - Time step for the update
   */
  update(params, deltaTime = 1) {
    // First pass: calculate energy for all nodes
    for (const node of this.nodes) {
      const neighbors = this.getNeighbors(node);
      node.calculateEnergy(neighbors);
    }
    
    // Second pass: update states based on neighbors
    for (const node of this.nodes) {
      const neighbors = this.getNeighbors(node);
      node.updateState(neighbors, params);
    }
    
    this.miniMapDirty = true;
  }

  /**
   * Generate mini-map data for visualization
   * @param {number} resolution - Resolution of the mini-map (default 100)
   * @returns {Object} Mini-map data with state distribution
   */
  generateMiniMapData(resolution = 100) {
    if (!this.miniMapDirty && this.miniMapData) {
      return this.miniMapData;
    }
    
    const miniMap = {
      width: Math.min(resolution, this.width),
      height: Math.min(resolution, this.height),
      data: []
    };
    
    // Calculate sampling step
    const stepX = this.width / miniMap.width;
    const stepY = this.height / miniMap.height;
    
    // Sample the lattice
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
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const stats = {
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
      // Count states
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
      
      // Energy statistics
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
  reset() {
    for (const node of this.nodes) {
      node.setState('symmetric');
      node.energy = 1.0;
      node.phase = 0;
    }
    this.miniMapDirty = true;
  }

  /**
   * Create an anomaly at a specific position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate (default 0)
   * @param {number} radius - Radius of anomaly effect (default 1)
   */
  createAnomaly(x, y, z = 0, radius = 1) {
    const centerNode = this.getNode(x, y, z);
    if (!centerNode) return;
    
    // Set center node as anomaly
    centerNode.setState('anomaly');
    
    // Affect nearby nodes based on radius
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
          // Probability decreases with distance
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
   * @param {string} state - State to filter by ('symmetric', 'asymmetric', 'anomaly')
   * @returns {Array<Node>} Array of nodes in the specified state
   */
  getNodesByState(state) {
    return this.nodes.filter(node => node.state === state);
  }

  /**
   * Serialize the lattice to JSON
   * @returns {Object} Serialized lattice data
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      nodes: this.nodes.map(node => node.toJSON())
    };
  }

  /**
   * Restore lattice from JSON data
   * @param {Object} data - Serialized lattice data
   */
  fromJSON(data) {
    this.width = data.width;
    this.height = data.height;
    this.depth = data.depth;
    this.is3D = this.depth > 1;
    
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
   * @returns {number} Total node count
   */
  getNodeCount() {
    return this.nodes.length;
  }

  /**
   * Iterate over all nodes with a callback
   * @param {Function} callback - Function to call for each node
   */
  forEachNode(callback) {
    this.nodes.forEach(callback);
  }
}
