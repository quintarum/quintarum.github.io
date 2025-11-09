import { Physics } from './Physics.js';
import { Lattice, LatticeStatistics, LatticeData } from './Lattice.js';
import { PhysicsParams } from './Node.js';
import { ConservationReport } from './ConservationEnforcer.js';
import { ReversibilityValidator, CycleTestResult } from './ReversibilityValidator.js';

export interface SimulationParams extends PhysicsParams {
  maxHistoryDepth?: number;
  enforceConservation?: boolean;
  conservationTolerance?: number;
  validateReversibility?: boolean;
}

interface SimulationState {
  time: number;
  stepCount: number;
  latticeData: LatticeData;
  statistics: LatticeStatistics;
}

interface Bookmark {
  id: number;
  time: number;
  stepCount: number;
  historyIndex: number;
  description: string;
  metadata: Record<string, unknown>;
  statistics: LatticeStatistics;
  timestamp: number;
}

interface StepStatistics extends LatticeStatistics {
  time: number;
  stepCount: number;
  direction: number;
  entropy: number;
  correlationLength: number;
  symmetryRatio: number;
  anomalyDensity: number;
  conservationReport?: ConservationReport;
}

interface StateChangeEvent {
  type: string;
  state: SimulationStateInfo;
}

interface SimulationStateInfo {
  time: number;
  stepCount: number;
  isRunning: boolean;
  isPaused: boolean;
  direction: number;
  historyLength: number;
  historyIndex: number;
  bookmarkCount: number;
  statistics: LatticeStatistics;
}

interface HistoryChangeEvent {
  historyLength: number;
  currentIndex: number;
}

interface SimulationCallbacks {
  onStep: ((stats: StepStatistics) => void) | null;
  onStateChange: ((event: StateChangeEvent) => void) | null;
  onBookmarkAdded: ((bookmark: Bookmark) => void) | null;
  onHistoryChange: ((event: HistoryChangeEvent) => void) | null;
}

interface ExportData {
  params: SimulationParams;
  time: number;
  stepCount: number;
  lattice: LatticeData;
  bookmarks: Bookmark[];
  statistics: LatticeStatistics;
  // TDS-specific data
  tdsMetrics?: {
    E_sym_total: number;
    E_asym_total: number;
    E_0_total: number;
    T_info: number;
    phaseCoherence: number;
  };
  conservationMetrics?: {
    isConserved: boolean;
    violations: number;
    maxDeviation: number;
    avgDeviation: number;
  };
  reversibilityMetrics?: {
    validations: number;
    violationRate: number;
    avgDeviation: number;
  };
}

/**
 * Simulation class managing the TDS simulation engine
 * Handles simulation lifecycle, history tracking, and bookmarking
 */
export class Simulation {
  readonly lattice: Lattice;
  params: SimulationParams;
  time: number = 0;
  stepCount: number = 0;
  isRunning: boolean = false;
  isPaused: boolean = false;
  direction: number = 1;
  
  private history: SimulationState[] = [];
  private historyIndex: number = -1;
  private bookmarks: Bookmark[] = [];
  private nextBookmarkId: number = 1;
  private animationFrameId: number | null = null;
  private callbacks: SimulationCallbacks;
  private reversibilityValidator: ReversibilityValidator;

  constructor(lattice: Lattice, params: Partial<SimulationParams> = {}) {
    this.lattice = lattice;
    
    this.params = {
      symmetryStrength: params.symmetryStrength ?? 0.7,
      anomalyProbability: params.anomalyProbability ?? 0.1,
      energyThreshold: params.energyThreshold ?? 2.0,
      interactionRange: params.interactionRange ?? 3,
      waveSpeed: params.waveSpeed ?? 0.5,
      timeStep: params.timeStep ?? 1.0,
      maxHistoryDepth: params.maxHistoryDepth ?? 1000
    };
    
    this.callbacks = {
      onStep: null,
      onStateChange: null,
      onBookmarkAdded: null,
      onHistoryChange: null
    };
    
    // Initialize reversibility validator
    this.reversibilityValidator = new ReversibilityValidator(
      params.conservationTolerance ?? 1e-6
    );
    
    if (params.validateReversibility) {
      this.reversibilityValidator.enableContinuousMode();
    }
    
    this.saveState();
  }

  start(): this {
    if (this.isRunning) return this;
    
    this.isRunning = true;
    this.isPaused = false;
    this._notifyStateChange('started');
    
    return this;
  }

  stop(): this {
    if (!this.isRunning) return this;
    
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this._notifyStateChange('stopped');
    return this;
  }

  pause(): this {
    if (!this.isRunning || this.isPaused) return this;
    
    this.isPaused = true;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this._notifyStateChange('paused');
    return this;
  }

  resume(): this {
    if (!this.isRunning || !this.isPaused) return this;
    
    this.isPaused = false;
    this._notifyStateChange('resumed');
    
    return this;
  }

  step(deltaTime: number | null = null): StepStatistics | { success: boolean; reason: string } {
    const dt = deltaTime ?? this.params.timeStep!;
    
    if (this.direction === -1) {
      return this._stepBackward();
    }
    
    this.saveState();
    this.lattice.update(this.params, dt);
    
    // Enforce conservation if enabled
    if (this.params.enforceConservation) {
      const report = Physics.enforceConservation(this.lattice);
      if (!report.isConserved && report.violations.length > 0) {
        console.warn(`Conservation violations detected: ${report.violations.length} nodes`);
      }
    }
    
    this.time += dt * this.direction;
    this.stepCount++;
    
    const stats = this._collectStepStatistics();
    
    if (this.callbacks.onStep) {
      this.callbacks.onStep(stats);
    }
    
    return stats;
  }

  private _stepBackward(): StepStatistics | { success: boolean; reason: string } {
    if (this.historyIndex <= 0) {
      return { success: false, reason: 'No more history' };
    }
    
    this.historyIndex--;
    const previousState = this.history[this.historyIndex];
    
    if (previousState) {
      this._restoreState(previousState);
      this.time -= this.params.timeStep!;
      
      const stats = this._collectStepStatistics();
      
      if (this.callbacks.onStep) {
        this.callbacks.onStep(stats);
      }
      
      return stats;
    }
    
    return { success: false, reason: 'Invalid history state' };
  }

  private _collectStepStatistics(): StepStatistics {
    const latticeStats = this.lattice.getStatistics();
    const entropy = Physics.calculateEntropy(this.lattice);
    const correlationLength = Physics.calculateCorrelationLength(this.lattice);
    
    // Check conservation if enabled
    let conservationReport: ConservationReport | undefined;
    if (this.params.enforceConservation) {
      conservationReport = Physics.getConservationEnforcer().enforceConservation(this.lattice);
    }
    
    return {
      time: this.time,
      stepCount: this.stepCount,
      direction: this.direction,
      ...latticeStats,
      entropy,
      correlationLength,
      symmetryRatio: latticeStats.vacuum / latticeStats.total,
      anomalyDensity: latticeStats.anomalous / latticeStats.total,
      conservationReport
    };
  }

  saveState(): SimulationState {
    const state: SimulationState = {
      time: this.time,
      stepCount: this.stepCount,
      latticeData: this.lattice.toJSON(),
      statistics: this.lattice.getStatistics()
    };
    
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    
    if (this.history.length > this.params.maxHistoryDepth!) {
      const removeCount = this.history.length - this.params.maxHistoryDepth!;
      this.history.splice(0, removeCount);
      this.historyIndex -= removeCount;
      
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

  private _restoreState(state: SimulationState): void {
    this.time = state.time;
    this.stepCount = state.stepCount;
    this.lattice.fromJSON(state.latticeData);
  }

  setDirection(direction: number): this {
    this.direction = direction === -1 ? -1 : 1;
    this._notifyStateChange('directionChanged');
    return this;
  }

  reverse(): this {
    this.setDirection(-1);
    if (!this.isRunning) {
      this.start();
    }
    return this;
  }

  forward(): this {
    this.setDirection(1);
    if (!this.isRunning) {
      this.start();
    }
    return this;
  }

  addBookmark(description: string = '', metadata: Record<string, unknown> = {}): Bookmark {
    const bookmark: Bookmark = {
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

  removeBookmark(bookmarkId: number): boolean {
    const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      return true;
    }
    return false;
  }

  jumpToBookmark(bookmarkId: number): boolean {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return false;
    
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

  getBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }

  seekToTime(targetTime: number): boolean {
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

  seekToStep(stepIndex: number): boolean {
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

  clearHistory(keepCurrent: boolean = true): void {
    if (keepCurrent && this.history.length > 0) {
      const currentState = this.history[this.historyIndex];
      this.history = [currentState];
      this.historyIndex = 0;
    } else {
      this.history = [];
      this.historyIndex = -1;
    }
    
    this.bookmarks = [];
    
    if (this.callbacks.onHistoryChange) {
      this.callbacks.onHistoryChange({
        historyLength: this.history.length,
        currentIndex: this.historyIndex
      });
    }
  }

  updateParameters(newParams: Partial<SimulationParams>): this {
    this.params = { ...this.params, ...newParams };
    return this;
  }

  getParameters(): SimulationParams {
    return { ...this.params };
  }

  reset(): this {
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

  getState(): SimulationStateInfo {
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

  on(event: keyof SimulationCallbacks, callback: SimulationCallbacks[keyof SimulationCallbacks]): this {
    if (event in this.callbacks) {
       
      this.callbacks[event] = callback as any;
    }
    return this;
  }

  private _notifyStateChange(changeType: string): void {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        type: changeType,
        state: this.getState()
      });
    }
  }

  /**
   * Test reversibility cycle
   */
  async testReversibilityCycle(steps: number = 100): Promise<CycleTestResult> {
    return this.reversibilityValidator.testReversibilityCycle(this, steps);
  }

  /**
   * Get reversibility validator
   */
  getReversibilityValidator(): ReversibilityValidator {
    return this.reversibilityValidator;
  }

  /**
   * Get conservation status for display
   */
  getConservationStatus(): {
    status: 'good' | 'warning' | 'error';
    message: string;
    color: string;
  } {
    return this.reversibilityValidator.getConservationStatus();
  }

  export(): ExportData {
    const stats = this.lattice.getStatistics();
    const energies = this.lattice.calculateTotalEnergy();
    
    // Get conservation metrics if enforcer is available
    let conservationMetrics;
    if (this.params.enforceConservation) {
      const enforcer = Physics.getConservationEnforcer();
      const conservationStats = enforcer.getStatistics();
      conservationMetrics = {
        isConserved: conservationStats.totalViolations === 0,
        violations: conservationStats.totalViolations,
        maxDeviation: conservationStats.maxDeviation,
        avgDeviation: conservationStats.avgDeviation
      };
    }
    
    // Get reversibility metrics
    const reversibilityStats = this.reversibilityValidator.getStatistics();
    const reversibilityMetrics = {
      validations: reversibilityStats.totalValidations,
      violationRate: reversibilityStats.violationRate,
      avgDeviation: reversibilityStats.avgDeviation
    };
    
    return {
      params: this.params,
      time: this.time,
      stepCount: this.stepCount,
      lattice: this.lattice.toJSON(),
      bookmarks: this.bookmarks,
      statistics: stats,
      tdsMetrics: {
        E_sym_total: energies.E_sym,
        E_asym_total: energies.E_asym,
        E_0_total: energies.E_0,
        T_info: stats.T_info,
        phaseCoherence: stats.phaseCoherence
      },
      conservationMetrics,
      reversibilityMetrics
    };
  }

  import(data: ExportData): this {
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
