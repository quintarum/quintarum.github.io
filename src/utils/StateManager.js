/**
 * StateManager class for enhanced state persistence and management
 * Handles saving, loading, compression, and snapshot management
 */
export class StateManager {
  /**
   * Create a new StateManager
   * @param {Object} options - Configuration options
   * @param {number} options.maxHistoryDepth - Maximum number of states to keep
   * @param {boolean} options.enableCompression - Enable state compression
   * @param {number} options.compressionThreshold - Minimum age (in states) before compression
   * @param {string} options.storageKey - Key for localStorage
   */
  constructor(options = {}) {
    this.options = {
      maxHistoryDepth: options.maxHistoryDepth ?? 1000,
      enableCompression: options.enableCompression ?? true,
      compressionThreshold: options.compressionThreshold ?? 100,
      storageKey: options.storageKey ?? 'tds_simulation_state'
    };
    
    // State history
    this.history = [];
    this.currentIndex = -1;
    
    // Snapshots for comparison
    this.snapshots = new Map();
    this.nextSnapshotId = 1;
    
    // Compression cache
    this.compressionCache = new Map();
    
    // Callbacks
    this.callbacks = {
      onStateSaved: null,
      onStateLoaded: null,
      onSnapshotCreated: null,
      onHistoryChanged: null
    };
  }

  /**
   * Save a simulation state
   * @param {Object} state - State object to save
   * @param {Object} metadata - Optional metadata
   * @returns {number} Index of saved state
   */
  saveState(state, metadata = {}) {
    const stateEntry = {
      state: this._cloneState(state),
      metadata: {
        timestamp: Date.now(),
        ...metadata
      },
      compressed: false,
      age: 0
    };
    
    // If we're not at the end of history, truncate future states
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add new state
    this.history.push(stateEntry);
    this.currentIndex = this.history.length - 1;
    
    // Update ages
    this._updateAges();
    
    // Apply compression to old states
    if (this.options.enableCompression) {
      this._compressOldStates();
    }
    
    // Limit history depth
    this._limitHistoryDepth();
    
    // Notify callback
    if (this.callbacks.onStateSaved) {
      this.callbacks.onStateSaved({
        index: this.currentIndex,
        state: stateEntry
      });
    }
    
    if (this.callbacks.onHistoryChanged) {
      this.callbacks.onHistoryChanged({
        historyLength: this.history.length,
        currentIndex: this.currentIndex
      });
    }
    
    return this.currentIndex;
  }

  /**
   * Load a state by index
   * @param {number} index - Index of state to load
   * @returns {Object|null} Loaded state or null if invalid index
   */
  loadState(index) {
    if (index < 0 || index >= this.history.length) {
      return null;
    }
    
    const stateEntry = this.history[index];
    this.currentIndex = index;
    
    // Decompress if needed
    const state = stateEntry.compressed 
      ? this._decompressState(stateEntry.state)
      : this._cloneState(stateEntry.state);
    
    // Notify callback
    if (this.callbacks.onStateLoaded) {
      this.callbacks.onStateLoaded({
        index,
        state,
        metadata: stateEntry.metadata
      });
    }
    
    if (this.callbacks.onHistoryChanged) {
      this.callbacks.onHistoryChanged({
        historyLength: this.history.length,
        currentIndex: this.currentIndex
      });
    }
    
    return state;
  }

  /**
   * Get the current state
   * @returns {Object|null} Current state or null if no history
   */
  getCurrentState() {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    
    return this.loadState(this.currentIndex);
  }

  /**
   * Move to the next state in history
   * @returns {Object|null} Next state or null if at end
   */
  nextState() {
    if (this.currentIndex < this.history.length - 1) {
      return this.loadState(this.currentIndex + 1);
    }
    return null;
  }

  /**
   * Move to the previous state in history
   * @returns {Object|null} Previous state or null if at beginning
   */
  previousState() {
    if (this.currentIndex > 0) {
      return this.loadState(this.currentIndex - 1);
    }
    return null;
  }

  /**
   * Create a snapshot of the current state for comparison
   * @param {string} name - Name for the snapshot
   * @param {string} description - Optional description
   * @returns {Object} Created snapshot
   */
  createSnapshot(name, description = '') {
    const currentState = this.getCurrentState();
    
    if (!currentState) {
      throw new Error('No current state to snapshot');
    }
    
    const snapshot = {
      id: this.nextSnapshotId++,
      name,
      description,
      state: this._cloneState(currentState),
      metadata: {
        timestamp: Date.now(),
        historyIndex: this.currentIndex
      }
    };
    
    this.snapshots.set(snapshot.id, snapshot);
    
    // Notify callback
    if (this.callbacks.onSnapshotCreated) {
      this.callbacks.onSnapshotCreated(snapshot);
    }
    
    return snapshot;
  }

  /**
   * Get a snapshot by ID
   * @param {number} snapshotId - ID of snapshot to retrieve
   * @returns {Object|null} Snapshot or null if not found
   */
  getSnapshot(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    return snapshot ? { ...snapshot, state: this._cloneState(snapshot.state) } : null;
  }

  /**
   * Get all snapshots
   * @returns {Array<Object>} Array of snapshots (without full state data)
   */
  getAllSnapshots() {
    return Array.from(this.snapshots.values()).map(snapshot => ({
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description,
      metadata: snapshot.metadata
    }));
  }

  /**
   * Delete a snapshot
   * @param {number} snapshotId - ID of snapshot to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteSnapshot(snapshotId) {
    return this.snapshots.delete(snapshotId);
  }

  /**
   * Compare two states
   * @param {Object} state1 - First state
   * @param {Object} state2 - Second state
   * @returns {Object} Comparison results
   */
  compareStates(state1, state2) {
    const comparison = {
      identical: false,
      differences: [],
      statistics: {}
    };
    
    // Compare lattice dimensions
    if (state1.lattice && state2.lattice) {
      if (state1.lattice.width !== state2.lattice.width ||
          state1.lattice.height !== state2.lattice.height ||
          state1.lattice.depth !== state2.lattice.depth) {
        comparison.differences.push({
          type: 'dimensions',
          state1: { 
            width: state1.lattice.width, 
            height: state1.lattice.height, 
            depth: state1.lattice.depth 
          },
          state2: { 
            width: state2.lattice.width, 
            height: state2.lattice.height, 
            depth: state2.lattice.depth 
          }
        });
      }
      
      // Compare node states
      if (state1.lattice.nodes && state2.lattice.nodes) {
        const nodeDiffs = this._compareNodes(state1.lattice.nodes, state2.lattice.nodes);
        if (nodeDiffs.differentCount > 0) {
          comparison.differences.push({
            type: 'nodes',
            ...nodeDiffs
          });
        }
      }
    }
    
    // Compare statistics
    if (state1.statistics && state2.statistics) {
      comparison.statistics = this._compareStatistics(state1.statistics, state2.statistics);
    }
    
    // Compare time
    if (state1.time !== undefined && state2.time !== undefined) {
      comparison.timeDifference = state2.time - state1.time;
    }
    
    comparison.identical = comparison.differences.length === 0;
    
    return comparison;
  }

  /**
   * Compare nodes between two states
   * @private
   */
  _compareNodes(nodes1, nodes2) {
    const minLength = Math.min(nodes1.length, nodes2.length);
    let differentCount = 0;
    const stateDifferences = {
      symmetric: 0,
      asymmetric: 0,
      anomaly: 0
    };
    
    for (let i = 0; i < minLength; i++) {
      if (nodes1[i].state !== nodes2[i].state) {
        differentCount++;
        stateDifferences[nodes2[i].state]++;
      }
    }
    
    return {
      totalNodes: minLength,
      differentCount,
      differencePercentage: (differentCount / minLength) * 100,
      stateDifferences
    };
  }

  /**
   * Compare statistics between two states
   * @private
   */
  _compareStatistics(stats1, stats2) {
    return {
      energyDifference: (stats2.totalEnergy || 0) - (stats1.totalEnergy || 0),
      symmetricDifference: (stats2.symmetric || 0) - (stats1.symmetric || 0),
      asymmetricDifference: (stats2.asymmetric || 0) - (stats1.asymmetric || 0),
      anomalyDifference: (stats2.anomalies || 0) - (stats1.anomalies || 0)
    };
  }

  /**
   * Compress a state using delta encoding and RLE
   * @private
   */
  _compressState(state) {
    // Simple compression: store only changed values from previous state
    // In a real implementation, you might use more sophisticated compression
    
    // For now, we'll use JSON stringification with a marker
    const compressed = {
      _compressed: true,
      data: JSON.stringify(state)
    };
    
    return compressed;
  }

  /**
   * Decompress a state
   * @private
   */
  _decompressState(compressedState) {
    if (compressedState._compressed) {
      return JSON.parse(compressedState.data);
    }
    return compressedState;
  }

  /**
   * Compress old states that exceed the threshold
   * @private
   */
  _compressOldStates() {
    for (let i = 0; i < this.history.length; i++) {
      const entry = this.history[i];
      
      // Skip if already compressed or too recent
      if (entry.compressed || entry.age < this.options.compressionThreshold) {
        continue;
      }
      
      // Compress the state
      entry.state = this._compressState(entry.state);
      entry.compressed = true;
    }
  }

  /**
   * Update ages of all states
   * @private
   */
  _updateAges() {
    const currentTime = this.history.length - 1;
    for (let i = 0; i < this.history.length; i++) {
      this.history[i].age = currentTime - i;
    }
  }

  /**
   * Limit history to maxHistoryDepth
   * @private
   */
  _limitHistoryDepth() {
    if (this.history.length > this.options.maxHistoryDepth) {
      const removeCount = this.history.length - this.options.maxHistoryDepth;
      this.history.splice(0, removeCount);
      this.currentIndex = Math.max(0, this.currentIndex - removeCount);
      
      if (this.callbacks.onHistoryChanged) {
        this.callbacks.onHistoryChanged({
          historyLength: this.history.length,
          currentIndex: this.currentIndex
        });
      }
    }
  }

  /**
   * Clone a state object
   * @private
   */
  _cloneState(state) {
    // Deep clone using JSON (simple but effective for serializable data)
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Clear all history
   * @param {boolean} keepCurrent - If true, keeps only the current state
   */
  clearHistory(keepCurrent = false) {
    if (keepCurrent && this.currentIndex >= 0) {
      const currentState = this.history[this.currentIndex];
      this.history = [currentState];
      this.currentIndex = 0;
    } else {
      this.history = [];
      this.currentIndex = -1;
    }
    
    if (this.callbacks.onHistoryChanged) {
      this.callbacks.onHistoryChanged({
        historyLength: this.history.length,
        currentIndex: this.currentIndex
      });
    }
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots() {
    this.snapshots.clear();
    this.nextSnapshotId = 1;
  }

  /**
   * Save state to localStorage
   * @param {string} key - Optional custom key (uses default if not provided)
   * @returns {boolean} True if successful
   */
  saveToLocalStorage(key = null) {
    const storageKey = key || this.options.storageKey;
    
    try {
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        snapshots: Array.from(this.snapshots.entries()),
        nextSnapshotId: this.nextSnapshotId,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Load state from localStorage
   * @param {string} key - Optional custom key (uses default if not provided)
   * @returns {boolean} True if successful
   */
  loadFromLocalStorage(key = null) {
    const storageKey = key || this.options.storageKey;
    
    try {
      const dataStr = localStorage.getItem(storageKey);
      if (!dataStr) return false;
      
      const data = JSON.parse(dataStr);
      
      this.history = data.history || [];
      this.currentIndex = data.currentIndex ?? -1;
      this.snapshots = new Map(data.snapshots || []);
      this.nextSnapshotId = data.nextSnapshotId || 1;
      
      if (this.callbacks.onHistoryChanged) {
        this.callbacks.onHistoryChanged({
          historyLength: this.history.length,
          currentIndex: this.currentIndex
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  /**
   * Export state manager data
   * @returns {Object} Exportable data
   */
  export() {
    return {
      history: this.history,
      currentIndex: this.currentIndex,
      snapshots: Array.from(this.snapshots.entries()),
      options: this.options
    };
  }

  /**
   * Import state manager data
   * @param {Object} data - Data to import
   */
  import(data) {
    if (data.history) {
      this.history = data.history;
    }
    
    if (data.currentIndex !== undefined) {
      this.currentIndex = data.currentIndex;
    }
    
    if (data.snapshots) {
      this.snapshots = new Map(data.snapshots);
    }
    
    if (data.options) {
      this.options = { ...this.options, ...data.options };
    }
    
    if (this.callbacks.onHistoryChanged) {
      this.callbacks.onHistoryChanged({
        historyLength: this.history.length,
        currentIndex: this.currentIndex
      });
    }
  }

  /**
   * Get history information
   * @returns {Object} History info
   */
  getHistoryInfo() {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.currentIndex > 0,
      canGoForward: this.currentIndex < this.history.length - 1,
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of stored states
   * @private
   * @returns {number} Estimated bytes
   */
  _estimateMemoryUsage() {
    try {
      const dataStr = JSON.stringify(this.history);
      return dataStr.length * 2; // Rough estimate (2 bytes per character in UTF-16)
    } catch {
      return 0;
    }
  }

  /**
   * Register a callback for events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback;
    }
    return this;
  }

  /**
   * Get statistics about state management
   * @returns {Object} Statistics
   */
  getStatistics() {
    const compressedCount = this.history.filter(entry => entry.compressed).length;
    
    return {
      totalStates: this.history.length,
      compressedStates: compressedCount,
      uncompressedStates: this.history.length - compressedCount,
      snapshotCount: this.snapshots.size,
      currentIndex: this.currentIndex,
      memoryUsage: this._estimateMemoryUsage(),
      compressionRatio: compressedCount / Math.max(1, this.history.length)
    };
  }
}
