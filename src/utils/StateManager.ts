interface StateManagerOptions {
  maxHistoryDepth?: number;
  enableCompression?: boolean;
  compressionThreshold?: number;
  storageKey?: string;
}

interface StateMetadata {
  timestamp: number;
  [key: string]: unknown;
}

interface StateEntry<T = any> {
  state: T;
  metadata: StateMetadata;
  compressed: boolean;
  age: number;
}

interface Snapshot<T = any> {
  id: number;
  name: string;
  description: string;
  state: T;
  metadata: {
    timestamp: number;
    historyIndex: number;
  };
}

interface ComparisonResult {
  identical: boolean;
  differences: Array<{
    type: string;
    [key: string]: any;
  }>;
  statistics: StatisticsComparison | Record<string, never>;
  timeDifference?: number;
}

interface NodeComparison {
  totalNodes: number;
  differentCount: number;
  differencePercentage: number;
  stateDifferences: Record<string, number>;
}

interface StatisticsComparison {
  energyDifference: number;
  symmetricDifference: number;
  asymmetricDifference: number;
  anomalyDifference: number;
}

interface HistoryInfo {
  length: number;
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  memoryUsage: number;
}

interface StateManagerStatistics {
  totalStates: number;
  compressedStates: number;
  uncompressedStates: number;
  snapshotCount: number;
  currentIndex: number;
  memoryUsage: number;
  compressionRatio: number;
}

interface StateManagerCallbacks<T = any> {
  onStateSaved: ((data: { index: number; state: StateEntry<T> }) => void) | null;
  onStateLoaded: ((data: { index: number; state: T; metadata: StateMetadata }) => void) | null;
  onSnapshotCreated: ((snapshot: Snapshot<T>) => void) | null;
  onHistoryChanged: ((data: { historyLength: number; currentIndex: number }) => void) | null;
}

/**
 * StateManager class for enhanced state persistence and management
 * Handles saving, loading, compression, and snapshot management
 */
export class StateManager<T = any> {
  private options: Required<StateManagerOptions>;
  private history: StateEntry<T>[] = [];
  private currentIndex: number = -1;
  private snapshots: Map<number, Snapshot<T>> = new Map();
  private nextSnapshotId: number = 1;
  private callbacks: StateManagerCallbacks<T>;

  constructor(options: StateManagerOptions = {}) {
    this.options = {
      maxHistoryDepth: options.maxHistoryDepth ?? 1000,
      enableCompression: options.enableCompression ?? true,
      compressionThreshold: options.compressionThreshold ?? 100,
      storageKey: options.storageKey ?? 'tds_simulation_state'
    };
    
    this.callbacks = {
      onStateSaved: null,
      onStateLoaded: null,
      onSnapshotCreated: null,
      onHistoryChanged: null
    };
  }

  saveState(state: T, metadata: Partial<StateMetadata> = {}): number {
    const stateEntry: StateEntry<T> = {
      state: this._cloneState(state),
      metadata: {
        timestamp: Date.now(),
        ...metadata
      },
      compressed: false,
      age: 0
    };
    
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    this.history.push(stateEntry);
    this.currentIndex = this.history.length - 1;
    
    this._updateAges();
    
    if (this.options.enableCompression) {
      this._compressOldStates();
    }
    
    this._limitHistoryDepth();
    
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

  loadState(index: number): T | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }
    
    const stateEntry = this.history[index];
    this.currentIndex = index;
    
    const state = stateEntry.compressed 
      ? this._decompressState(stateEntry.state)
      : this._cloneState(stateEntry.state);
    
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

  getCurrentState(): T | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    
    return this.loadState(this.currentIndex);
  }

  nextState(): T | null {
    if (this.currentIndex < this.history.length - 1) {
      return this.loadState(this.currentIndex + 1);
    }
    return null;
  }

  previousState(): T | null {
    if (this.currentIndex > 0) {
      return this.loadState(this.currentIndex - 1);
    }
    return null;
  }

  createSnapshot(name: string, description: string = ''): Snapshot<T> {
    const currentState = this.getCurrentState();
    
    if (!currentState) {
      throw new Error('No current state to snapshot');
    }
    
    const snapshot: Snapshot<T> = {
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
    
    if (this.callbacks.onSnapshotCreated) {
      this.callbacks.onSnapshotCreated(snapshot);
    }
    
    return snapshot;
  }

  getSnapshot(snapshotId: number): Snapshot<T> | null {
    const snapshot = this.snapshots.get(snapshotId);
    return snapshot ? { ...snapshot, state: this._cloneState(snapshot.state) } : null;
  }

  getAllSnapshots(): Array<Omit<Snapshot<T>, 'state'>> {
    return Array.from(this.snapshots.values()).map(snapshot => ({
      id: snapshot.id,
      name: snapshot.name,
      description: snapshot.description,
      metadata: snapshot.metadata
    }));
  }

  deleteSnapshot(snapshotId: number): boolean {
    return this.snapshots.delete(snapshotId);
  }

  compareStates(state1: any, state2: any): ComparisonResult {
    const comparison: ComparisonResult = {
      identical: false,
      differences: [],
      statistics: {} as StatisticsComparison
    };
    
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
    
    if (state1.statistics && state2.statistics) {
      comparison.statistics = this._compareStatistics(state1.statistics, state2.statistics);
    }
    
    if (state1.time !== undefined && state2.time !== undefined) {
      comparison.timeDifference = state2.time - state1.time;
    }
    
    comparison.identical = comparison.differences.length === 0;
    
    return comparison;
  }

  private _compareNodes(nodes1: any[], nodes2: any[]): NodeComparison {
    const minLength = Math.min(nodes1.length, nodes2.length);
    let differentCount = 0;
    const stateDifferences: Record<string, number> = {
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

  private _compareStatistics(stats1: any, stats2: any): StatisticsComparison {
    return {
      energyDifference: (stats2.totalEnergy || 0) - (stats1.totalEnergy || 0),
      symmetricDifference: (stats2.symmetric || 0) - (stats1.symmetric || 0),
      asymmetricDifference: (stats2.asymmetric || 0) - (stats1.asymmetric || 0),
      anomalyDifference: (stats2.anomalies || 0) - (stats1.anomalies || 0)
    };
  }

  private _compressState(state: T): any {
    const compressed = {
      _compressed: true,
      data: JSON.stringify(state)
    };
    
    return compressed;
  }

  private _decompressState(compressedState: any): T {
    if (compressedState._compressed) {
      return JSON.parse(compressedState.data);
    }
    return compressedState;
  }

  private _compressOldStates(): void {
    for (let i = 0; i < this.history.length; i++) {
      const entry = this.history[i];
      
      if (entry.compressed || entry.age < this.options.compressionThreshold) {
        continue;
      }
      
      entry.state = this._compressState(entry.state);
      entry.compressed = true;
    }
  }

  private _updateAges(): void {
    const currentTime = this.history.length - 1;
    for (let i = 0; i < this.history.length; i++) {
      this.history[i].age = currentTime - i;
    }
  }

  private _limitHistoryDepth(): void {
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

  private _cloneState(state: T): T {
    return JSON.parse(JSON.stringify(state));
  }

  clearHistory(keepCurrent: boolean = false): void {
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

  clearSnapshots(): void {
    this.snapshots.clear();
    this.nextSnapshotId = 1;
  }

  saveToLocalStorage(key: string | null = null): boolean {
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

  loadFromLocalStorage(key: string | null = null): boolean {
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

  export(): {
    history: StateEntry<T>[];
    currentIndex: number;
    snapshots: Array<[number, Snapshot<T>]>;
    options: Required<StateManagerOptions>;
  } {
    return {
      history: this.history,
      currentIndex: this.currentIndex,
      snapshots: Array.from(this.snapshots.entries()),
      options: this.options
    };
  }

  import(data: {
    history?: StateEntry<T>[];
    currentIndex?: number;
    snapshots?: Array<[number, Snapshot<T>]>;
    options?: Partial<StateManagerOptions>;
  }): void {
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

  getHistoryInfo(): HistoryInfo {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.currentIndex > 0,
      canGoForward: this.currentIndex < this.history.length - 1,
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  private _estimateMemoryUsage(): number {
    try {
      const dataStr = JSON.stringify(this.history);
      return dataStr.length * 2;
    } catch {
      return 0;
    }
  }

  on(event: keyof StateManagerCallbacks<T>, callback: StateManagerCallbacks<T>[keyof StateManagerCallbacks<T>]): this {
    if (event in this.callbacks) {
      this.callbacks[event] = callback as any;
    }
    return this;
  }

  getStatistics(): StateManagerStatistics {
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

  /**
   * Save state to IndexedDB for large data storage
   */
  async saveToIndexedDB(dbName: string = 'TDSSimulation', storeName: string = 'states'): Promise<boolean> {
    try {
      const db = await this._openIndexedDB(dbName, storeName);
      
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        snapshots: Array.from(this.snapshots.entries()),
        nextSnapshotId: this.nextSnapshotId,
        timestamp: Date.now()
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(data, 'simulation_state');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      return true;
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
      return false;
    }
  }

  /**
   * Load state from IndexedDB
   */
  async loadFromIndexedDB(dbName: string = 'TDSSimulation', storeName: string = 'states'): Promise<boolean> {
    try {
      const db = await this._openIndexedDB(dbName, storeName);
      
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const data = await new Promise<any>((resolve, reject) => {
        const request = store.get('simulation_state');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      
      if (!data) return false;
      
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
      console.error('Failed to load from IndexedDB:', error);
      return false;
    }
  }

  /**
   * Open IndexedDB database
   */
  private _openIndexedDB(dbName: string, storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  }

  /**
   * Clear history with memory management
   */
  clearHistoryWithMemoryManagement(keepRecentCount: number = 100): void {
    if (this.history.length <= keepRecentCount) {
      return;
    }

    const keepFrom = this.history.length - keepRecentCount;
    this.history = this.history.slice(keepFrom);
    this.currentIndex = Math.max(0, this.currentIndex - keepFrom);

    if (this.callbacks.onHistoryChanged) {
      this.callbacks.onHistoryChanged({
        historyLength: this.history.length,
        currentIndex: this.currentIndex
      });
    }
  }

  /**
   * Enhanced save to localStorage with quota error handling
   */
  saveToLocalStorageWithErrorHandling(key: string | null = null): {
    success: boolean;
    error?: string;
    quotaExceeded?: boolean;
  } {
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
      return { success: true };
    } catch (error) {
      const isQuotaError =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuotaError) {
        // Try to free up space by clearing old history
        this.clearHistoryWithMemoryManagement(50);

        // Try again
        try {
          const data = {
            history: this.history,
            currentIndex: this.currentIndex,
            snapshots: Array.from(this.snapshots.entries()),
            nextSnapshotId: this.nextSnapshotId,
            timestamp: Date.now()
          };

          localStorage.setItem(storageKey, JSON.stringify(data));
          return { success: true };
        } catch {
          return {
            success: false,
            error: 'Storage quota exceeded even after cleanup',
            quotaExceeded: true
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enable automatic save with configurable interval
   */
  private autoSaveInterval: number | null = null;

  enableAutoSave(intervalMs: number = 30000, useIndexedDB: boolean = false): void {
    this.disableAutoSave();

    this.autoSaveInterval = window.setInterval(() => {
      if (useIndexedDB) {
        this.saveToIndexedDB().catch(console.error);
      } else {
        const result = this.saveToLocalStorageWithErrorHandling();
        if (!result.success) {
          console.warn('Auto-save failed:', result.error);
        }
      }
    }, intervalMs);
  }

  /**
   * Disable automatic save
   */
  disableAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveInterval !== null;
  }
}
