import { Physics } from './Physics.js';

/**
 * Simulation class managing the TDS simulation engine
 * Handles simulation lifecycle, history tracking, and bookmarking
 */
export class Simulation {
  /**
   * Create a new Simulation
   * @param {Lattice} lattice - The lattice to simulate
   * @param {Object} params - Simulation parameters
   * @param {number} params.symmetryStrength - Strength of symmetry influence (0-1)
   * @param {number} params.anomalyProbability - Probability of anomaly formation (0-1)
   * @param {number} params.energyThreshold - Energy threshold for state transitions
   * @param {number} params.interactionRange - Range of node interactions
   * @param {number} params.waveSpeed - Speed of anomaly wave propagation
   * @param {number} params.timeStep - Time step for each iteration
   * @param {number} params.maxHistoryDepth - Maximum number of states to keep in history
   */
  constructor(lattice, params = {}) {
    this.lattice = lattice;
    
    // Default parameters
    this.params = {
      symmetryStrength: params.symmetryStrength ?? 0.7,
      anomalyProbability: params.anomalyProbability ?? 0.1,
      energyThreshold: params.energyThreshold ?? 2.0,
      interactionRange: params.interactionRange ?? 3,
      waveSpeed: params.waveSpeed ?? 0.5,
      timeStep: params.timeStep ?? 1.0,
      maxHistoryDepth: params.maxHistoryDepth ?? 1000
    };
    
    // Simulation state
    this.time = 0;
    this.stepCount = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.direction = 1; // 1 for forward, -1 for backward
    
    // History tracking for reversibility
    this.history = [];
    this.historyIndex = -1;
    
    // Bookmarks for interesting moments
    this.bookmarks = [];
    this.nextBookmarkId = 1;
    
    // Animation frame ID for stopping
    this.animationFrameId = null;
    
    // Callbacks for events
    this.callbacks = {
      onStep: null,
      onStateChange: null,
      onBookmarkAdded: null,
      onHistoryChange: null
    };
    
    // Save initial state
    this.saveState();
  }

  /**
   * Start the simulation
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    this._notifyStateChange('started');
    
    return this;
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this._notifyStateChange('stopped');
    
    return this;
  }

  /**
   * Pause the simulation
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this._notifyStateChange('paused');
    
    return this;
  }

  /**
   * Resume the simulation
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    
    this._notifyStateChange('resumed');
    
    return this;
  }

  /**
   * Execute a single simulation step
   * @param {number} deltaTime - Time delta for this step (optional)
   * @returns {Object} Step results with statistics
   */
  step(deltaTime = null) {
    const dt = deltaTime ?? this.params.timeStep;
    
    // If moving backward through history
    if (this.direction === -1) {
      return this._stepBackward();
    }
    
    // Save current state before updating
    this.saveState();
    
    // Update lattice
    this.lattice.update(this.params, dt);
    
    // Update time
    this.time += dt * this.direction;
    this.stepCount++;
    
    // Collect statistics
    const stats = this._collectStepStatistics();
    
    // Notify callbacks
    if (this.callbacks.onStep) {
      this.callbacks.onStep(stats);
    }
    
    return stats;
  }

  /**
   * Step backward through history
   * @private
   * @returns {Object} Step results
   */
  _stepBackward() {
    if (this.historyIndex <= 0) {
      return { success: false, reason: 'No more history' };
    }
    
    // Move back in history
    this.historyIndex--;
    const previousState = this.history[this.historyIndex];
    
    if (previousState) {
      this._restoreState(previousState);
      this.time -= this.params.timeStep;
      
      const stats = this._collectStepStatistics();
      
      if (this.callbacks.onStep) {
        this.callbacks.onStep(stats);
      }
      
      return stats;
    }
    
    return { success: false, reason: 'Invalid history state' };
  }

  /**
   * Collect statistics for the current step
   * @private
   * @returns {Object} Statistics object
   */
  _collectStepStatistics() {
    const latticeStats = this.lattice.getStatistics();
    const entropy = Physics.calculateEntropy(this.lattice);
    const correlationLength = Physics.calculateCorrelationLength(this.lattice);
    
    return {
      time: this.time,
      stepCount: this.stepCount,
      direction: this.direction,
      ...latticeStats,
      entropy,
      correlationLength,
      symmetryRatio: latticeStats.symmetric / latticeStats.total,
      anomalyDensity: latticeStats.anomalies / latticeStats.total
    };
  }

  /**
   * Save current simulation state to history
   * @returns {Object} Saved state object
   */
  saveState() {
    const state = {
      time: this.time,
      stepCount: this.stepCount,
      latticeData: this.lattice.toJSON(),
      statistics: this.lattice.getStatistics()
    };
    
    // If we're not at the end of history, truncate future states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add new state
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    
    // Limit history depth
    if (this.history.length > this.params.maxHistoryDepth) {
      const removeCount = this.history.length - this.params.maxHistoryDepth;
      this.history.splice(0, removeCount);
      this.historyIndex -= removeCount;
      
      // Update bookmark indices
      this.bookmarks = this.bookmarks
        .map(bookmark => ({
          ...bookmark,
          historyIndex: bookmark.historyIndex - removeCount
        }))
        .filter(bookmark => bookmark.historyIndex >= 0);
    }
    
    if (this.callbacks.onHistoryChange) {
      this.callbacks.onHistoryChange({
        historyLength: this.history.length,
        currentIndex: this.historyIndex
      });
    }
    
    return state;
  }

  /**
   * Restore simulation state from a saved state
   * @private
   * @param {Object} state - State object to restore
   */
  _restoreState(state) {
    this.time = state.time;
    this.stepCount = state.stepCount;
    this.lattice.fromJSON(state.latticeData);
  }

  /**
   * Set playback direction
   * @param {number} direction - 1 for forward, -1 for backward
   */
  setDirection(direction) {
    this.direction = direction === -1 ? -1 : 1;
    this._notifyStateChange('directionChanged');
    return this;
  }

  /**
   * Play simulation in reverse
   */
  reverse() {
    this.setDirection(-1);
    if (!this.isRunning) {
      this.start();
    }
    return this;
  }

  /**
   * Play simulation forward
   */
  forward() {
    this.setDirection(1);
    if (!this.isRunning) {
      this.start();
    }
    return this;
  }

  /**
   * Add a bookmark at the current simulation state
   * @param {string} description - Description of this bookmark
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Created bookmark
   */
  addBookmark(description = '', metadata = {}) {
    const bookmark = {
      id: this.nextBookmarkId++,
      time: this.time,
      stepCount: this.stepCount,
      historyIndex: this.historyIndex,
      description,
      metadata,
      statistics: this.lattice.getStatistics(),
      timestamp: Date.now()
    };
    
    this.bookmarks.push(bookmark);
    
    if (this.callbacks.onBookmarkAdded) {
      this.callbacks.onBookmarkAdded(bookmark);
    }
    
    return bookmark;
  }

  /**
   * Remove a bookmark by ID
   * @param {number} bookmarkId - ID of bookmark to remove
   * @returns {boolean} True if bookmark was removed
   */
  removeBookmark(bookmarkId) {
    const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Jump to a bookmarked state
   * @param {number} bookmarkId - ID of bookmark to jump to
   * @returns {boolean} True if successful
   */
  jumpToBookmark(bookmarkId) {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return false;
    
    // Check if history index is valid
    if (bookmark.historyIndex >= 0 && bookmark.historyIndex < this.history.length) {
      this.historyIndex = bookmark.historyIndex;
      const state = this.history[this.historyIndex];
      this._restoreState(state);
      
      if (this.callbacks.onHistoryChange) {
        this.callbacks.onHistoryChange({
          historyLength: this.history.length,
          currentIndex: this.historyIndex
        });
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Get all bookmarks
   * @returns {Array<Object>} Array of bookmarks
   */
  getBookmarks() {
    return [...this.bookmarks];
  }

  /**
   * Seek to a specific time in history
   * @param {number} targetTime - Time to seek to
   * @returns {boolean} True if successful
   */
  seekToTime(targetTime) {
    // Find closest history state to target time
    let closestIndex = 0;
    let closestDiff = Math.abs(this.history[0]?.time - targetTime);
    
    for (let i = 1; i < this.history.length; i++) {
      const diff = Math.abs(this.history[i].time - targetTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }
    
    if (closestIndex >= 0 && closestIndex < this.history.length) {
      this.historyIndex = closestIndex;
      const state = this.history[this.historyIndex];
      this._restoreState(state);
      
      if (this.callbacks.onHistoryChange) {
        this.callbacks.onHistoryChange({
          historyLength: this.history.length,
          currentIndex: this.historyIndex
        });
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Seek to a specific step in history
   * @param {number} stepIndex - History index to seek to
   * @returns {boolean} True if successful
   */
  seekToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.history.length) {
      this.historyIndex = stepIndex;
      const state = this.history[this.historyIndex];
      this._restoreState(state);
      
      if (this.callbacks.onHistoryChange) {
        this.callbacks.onHistoryChange({
          historyLength: this.history.length,
          currentIndex: this.historyIndex
        });
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Clear simulation history
   * @param {boolean} keepCurrent - If true, keeps only the current state
   */
  clearHistory(keepCurrent = true) {
    if (keepCurrent && this.history.length > 0) {
      const currentState = this.history[this.historyIndex];
      this.history = [currentState];
      this.historyIndex = 0;
    } else {
      this.history = [];
      this.historyIndex = -1;
    }
    
    // Clear bookmarks as they reference history indices
    this.bookmarks = [];
    
    if (this.callbacks.onHistoryChange) {
      this.callbacks.onHistoryChange({
        historyLength: this.history.length,
        currentIndex: this.historyIndex
      });
    }
  }

  /**
   * Update simulation parameters
   * @param {Object} newParams - New parameter values
   */
  updateParameters(newParams) {
    this.params = { ...this.params, ...newParams };
    return this;
  }

  /**
   * Get current simulation parameters
   * @returns {Object} Current parameters
   */
  getParameters() {
    return { ...this.params };
  }

  /**
   * Reset simulation to initial state
   */
  reset() {
    this.stop();
    this.time = 0;
    this.stepCount = 0;
    this.direction = 1;
    this.lattice.reset();
    this.clearHistory(false);
    this.saveState();
    
    this._notifyStateChange('reset');
    
    return this;
  }

  /**
   * Get current simulation state
   * @returns {Object} Current state information
   */
  getState() {
    return {
      time: this.time,
      stepCount: this.stepCount,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      direction: this.direction,
      historyLength: this.history.length,
      historyIndex: this.historyIndex,
      bookmarkCount: this.bookmarks.length,
      statistics: this.lattice.getStatistics()
    };
  }

  /**
   * Register a callback for simulation events
   * @param {string} event - Event name ('onStep', 'onStateChange', 'onBookmarkAdded', 'onHistoryChange')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
    return this;
  }

  /**
   * Notify state change to callbacks
   * @private
   * @param {string} changeType - Type of state change
   */
  _notifyStateChange(changeType) {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        type: changeType,
        state: this.getState()
      });
    }
  }

  /**
   * Export simulation data
   * @returns {Object} Exportable simulation data
   */
  export() {
    return {
      params: this.params,
      time: this.time,
      stepCount: this.stepCount,
      lattice: this.lattice.toJSON(),
      bookmarks: this.bookmarks,
      statistics: this.lattice.getStatistics()
    };
  }

  /**
   * Import simulation data
   * @param {Object} data - Simulation data to import
   */
  import(data) {
    this.stop();
    
    if (data.params) {
      this.params = { ...this.params, ...data.params };
    }
    
    if (data.lattice) {
      this.lattice.fromJSON(data.lattice);
    }
    
    this.time = data.time ?? 0;
    this.stepCount = data.stepCount ?? 0;
    
    if (data.bookmarks) {
      this.bookmarks = data.bookmarks;
      this.nextBookmarkId = Math.max(...this.bookmarks.map(b => b.id), 0) + 1;
    }
    
    this.clearHistory(false);
    this.saveState();
    
    this._notifyStateChange('imported');
    
    return this;
  }
}
