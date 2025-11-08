/**
 * Annotation System
 * Detects significant simulation events and displays real-time annotations
 * with natural language descriptions
 */

interface Annotation {
  id: string;
  type: 'info' | 'warning' | 'success' | 'highlight';
  message: string;
  position: { x: number; y: number };
  timestamp: number;
  duration: number;
  priority: number;
}

interface SimulationState {
  lattice: {
    nodes: Array<{ state: string; energy: number }>;
    width: number;
    height: number;
  };
  time: number;
  statistics: {
    symmetricNodes: number;
    asymmetricNodes: number;
    anomalies: number;
    totalEnergy: number;
  };
}

interface EventThresholds {
  anomalySpike: number;
  energyChange: number;
  symmetryChange: number;
  cascadeSize: number;
}

export class AnnotationSystem {
  private annotations: Map<string, Annotation>;
  private container: HTMLDivElement | null;
  private previousState: SimulationState | null;
  private eventHistory: Array<{ type: string; timestamp: number }>;
  private thresholds: EventThresholds;
  private isEnabled: boolean;
  private maxAnnotations: number;
  private nextId: number;

  constructor() {
    this.annotations = new Map();
    this.container = null;
    this.previousState = null;
    this.eventHistory = [];
    this.nextId = 0;
    this.maxAnnotations = 5;
    this.isEnabled = true;

    // Thresholds for event detection
    this.thresholds = {
      anomalySpike: 5, // Number of new anomalies to trigger annotation
      energyChange: 0.2, // Relative energy change (20%)
      symmetryChange: 0.15, // Relative symmetry change (15%)
      cascadeSize: 10, // Number of nodes in cascade
    };

    this.initializeDOM();
    this.loadSettings();
  }

  /**
   * Initialize DOM elements for annotations
   */
  private initializeDOM(): void {
    this.container = document.createElement('div');
    this.container.className = 'annotations-container';
    this.container.id = 'annotations-container';
    document.body.appendChild(this.container);
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('tds_annotations_enabled');
      this.isEnabled = stored !== 'false';
    } catch {
      this.isEnabled = true;
    }
  }

  /**
   * Analyze simulation state and detect significant events
   */
  analyzeState(currentState: SimulationState): void {
    if (!this.isEnabled || !currentState) {
      return;
    }

    // First state - just store it
    if (!this.previousState) {
      this.previousState = this.cloneState(currentState);
      return;
    }

    // Detect various events
    this.detectAnomalySpike(currentState);
    this.detectEnergyChange(currentState);
    this.detectSymmetryChange(currentState);
    this.detectEquilibrium(currentState);
    this.detectCascade(currentState);
    this.detectOscillation(currentState);

    // Update previous state
    this.previousState = this.cloneState(currentState);

    // Clean up old annotations
    this.cleanupOldAnnotations();
  }

  /**
   * Detect sudden increase in anomalies
   */
  private detectAnomalySpike(state: SimulationState): void {
    if (!this.previousState) return;

    const anomalyIncrease =
      state.statistics.anomalies - this.previousState.statistics.anomalies;

    if (anomalyIncrease >= this.thresholds.anomalySpike) {
      this.addAnnotation({
        type: 'warning',
        message: `Anomaly spike detected! ${anomalyIncrease} new anomalies formed.`,
        position: this.getRandomPosition(),
        duration: 4000,
        priority: 8,
      });
    }
  }

  /**
   * Detect significant energy changes
   */
  private detectEnergyChange(state: SimulationState): void {
    if (!this.previousState) return;

    const prevEnergy = this.previousState.statistics.totalEnergy;
    const currEnergy = state.statistics.totalEnergy;

    if (prevEnergy === 0) return;

    const relativeChange = Math.abs(currEnergy - prevEnergy) / prevEnergy;

    if (relativeChange >= this.thresholds.energyChange) {
      const direction = currEnergy > prevEnergy ? 'increased' : 'decreased';
      const percentage = (relativeChange * 100).toFixed(1);

      this.addAnnotation({
        type: 'info',
        message: `System energy ${direction} by ${percentage}%. Energy flow detected.`,
        position: this.getRandomPosition(),
        duration: 3500,
        priority: 6,
      });
    }
  }

  /**
   * Detect symmetry transitions
   */
  private detectSymmetryChange(state: SimulationState): void {
    if (!this.previousState) return;

    const prevSymmetry = this.previousState.statistics.symmetricNodes;
    const currSymmetry = state.statistics.symmetricNodes;
    const totalNodes = state.lattice.nodes.length;

    if (totalNodes === 0) return;

    const prevRatio = prevSymmetry / totalNodes;
    const currRatio = currSymmetry / totalNodes;
    const change = Math.abs(currRatio - prevRatio);

    if (change >= this.thresholds.symmetryChange) {
      const direction = currRatio > prevRatio ? 'increasing' : 'decreasing';
      const percentage = (currRatio * 100).toFixed(1);

      this.addAnnotation({
        type: 'highlight',
        message: `Symmetry ${direction}. Current symmetry: ${percentage}% of nodes.`,
        position: this.getRandomPosition(),
        duration: 3500,
        priority: 7,
      });
    }
  }

  /**
   * Detect system reaching equilibrium
   */
  private detectEquilibrium(state: SimulationState): void {
    if (!this.previousState) return;

    const prevAnomalies = this.previousState.statistics.anomalies;
    const currAnomalies = state.statistics.anomalies;
    const prevEnergy = this.previousState.statistics.totalEnergy;
    const currEnergy = state.statistics.totalEnergy;

    // Check if both anomalies and energy are stable
    const anomalyStable = Math.abs(currAnomalies - prevAnomalies) <= 1;
    const energyStable =
      prevEnergy > 0 && Math.abs(currEnergy - prevEnergy) / prevEnergy < 0.02;

    if (anomalyStable && energyStable && currAnomalies > 0) {
      // Check if this has been stable for a few steps
      const recentEvents = this.eventHistory.filter(
        (e) => e.type === 'equilibrium' && state.time - e.timestamp < 10
      );

      if (recentEvents.length === 0) {
        this.addAnnotation({
          type: 'success',
          message: 'System reached equilibrium. Stable state achieved.',
          position: this.getCenterPosition(),
          duration: 4000,
          priority: 9,
        });

        this.eventHistory.push({ type: 'equilibrium', timestamp: state.time });
      }
    }
  }

  /**
   * Detect cascading anomaly propagation
   */
  private detectCascade(state: SimulationState): void {
    if (!this.previousState) return;

    const anomalyIncrease =
      state.statistics.anomalies - this.previousState.statistics.anomalies;

    if (anomalyIncrease >= this.thresholds.cascadeSize) {
      this.addAnnotation({
        type: 'warning',
        message: `Cascade effect! ${anomalyIncrease} nodes affected in rapid succession.`,
        position: this.getRandomPosition(),
        duration: 4500,
        priority: 10,
      });

      this.eventHistory.push({ type: 'cascade', timestamp: state.time });
    }
  }

  /**
   * Detect oscillating behavior
   */
  private detectOscillation(state: SimulationState): void {
    // Look for periodic patterns in recent history
    const recentOscillations = this.eventHistory.filter(
      (e) => e.type === 'oscillation' && state.time - e.timestamp < 50
    );

    if (recentOscillations.length > 0) return;

    // Check for energy oscillation pattern
    if (this.previousState) {
      const energyHistory = this.getRecentEnergyHistory();
      if (this.isOscillating(energyHistory)) {
        this.addAnnotation({
          type: 'info',
          message: 'Oscillating pattern detected. System showing periodic behavior.',
          position: this.getCenterPosition(),
          duration: 4000,
          priority: 7,
        });

        this.eventHistory.push({ type: 'oscillation', timestamp: state.time });
      }
    }
  }

  /**
   * Check if values show oscillating pattern
   */
  private isOscillating(values: number[]): boolean {
    if (values.length < 6) return false;

    // Simple oscillation detection: check for alternating increases/decreases
    let changes = 0;
    for (let i = 1; i < values.length; i++) {
      if (i > 1) {
        const prevChange = values[i - 1] - values[i - 2];
        const currChange = values[i] - values[i - 1];
        if (prevChange * currChange < 0) {
          // Sign change
          changes++;
        }
      }
    }

    return changes >= 3; // At least 3 direction changes
  }

  /**
   * Get recent energy history (placeholder - would need actual tracking)
   */
  private getRecentEnergyHistory(): number[] {
    // In a real implementation, this would track energy over time
    // For now, return empty array
    return [];
  }

  /**
   * Add a new annotation
   */
  private addAnnotation(config: {
    type: 'info' | 'warning' | 'success' | 'highlight';
    message: string;
    position: { x: number; y: number };
    duration: number;
    priority: number;
  }): void {
    // Check if we've reached max annotations
    if (this.annotations.size >= this.maxAnnotations) {
      // Remove lowest priority annotation
      this.removeLowestPriorityAnnotation();
    }

    const id = `annotation-${this.nextId++}`;
    const annotation: Annotation = {
      id,
      type: config.type,
      message: config.message,
      position: config.position,
      timestamp: Date.now(),
      duration: config.duration,
      priority: config.priority,
    };

    this.annotations.set(id, annotation);
    this.renderAnnotation(annotation);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeAnnotation(id);
    }, config.duration);
  }

  /**
   * Render annotation to DOM
   */
  private renderAnnotation(annotation: Annotation): void {
    if (!this.container) return;

    const element = document.createElement('div');
    element.className = `annotation annotation-${annotation.type}`;
    element.id = annotation.id;
    element.style.left = `${annotation.position.x}px`;
    element.style.top = `${annotation.position.y}px`;

    const icon = this.getIconForType(annotation.type);
    element.innerHTML = `
      <div class="annotation-icon">${icon}</div>
      <div class="annotation-message">${annotation.message}</div>
      <button class="annotation-close" data-id="${annotation.id}">×</button>
    `;

    // Add close button handler
    const closeBtn = element.querySelector('.annotation-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removeAnnotation(annotation.id);
      });
    }

    this.container.appendChild(element);

    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.add('annotation-visible');
    });
  }

  /**
   * Get icon for annotation type
   */
  private getIconForType(type: string): string {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✓',
      highlight: '⭐',
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  /**
   * Remove annotation
   */
  private removeAnnotation(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('annotation-visible');
      element.classList.add('annotation-hiding');

      setTimeout(() => {
        element.remove();
      }, 300);
    }

    this.annotations.delete(id);
  }

  /**
   * Remove lowest priority annotation
   */
  private removeLowestPriorityAnnotation(): void {
    let lowestPriority = Infinity;
    let lowestId = '';

    this.annotations.forEach((annotation) => {
      if (annotation.priority < lowestPriority) {
        lowestPriority = annotation.priority;
        lowestId = annotation.id;
      }
    });

    if (lowestId) {
      this.removeAnnotation(lowestId);
    }
  }

  /**
   * Clean up old annotations
   */
  private cleanupOldAnnotations(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.annotations.forEach((annotation) => {
      if (now - annotation.timestamp > annotation.duration) {
        toRemove.push(annotation.id);
      }
    });

    toRemove.forEach((id) => this.removeAnnotation(id));

    // Clean up old event history
    const currentTime = this.previousState?.time || 0;
    this.eventHistory = this.eventHistory.filter(
      (e) => currentTime - e.timestamp < 100
    );
  }

  /**
   * Get random position for annotation
   */
  private getRandomPosition(): { x: number; y: number } {
    const margin = 50;
    const maxX = window.innerWidth - 350; // Annotation width ~300px
    const maxY = window.innerHeight - 150; // Annotation height ~100px

    return {
      x: margin + Math.random() * (maxX - margin),
      y: margin + Math.random() * (maxY - margin),
    };
  }

  /**
   * Get center position for important annotations
   */
  private getCenterPosition(): { x: number; y: number } {
    return {
      x: window.innerWidth / 2 - 150, // Half annotation width
      y: 100, // Top center
    };
  }

  /**
   * Clone simulation state
   */
  private cloneState(state: SimulationState): SimulationState {
    return {
      lattice: {
        nodes: state.lattice.nodes.map((n) => ({ ...n })),
        width: state.lattice.width,
        height: state.lattice.height,
      },
      time: state.time,
      statistics: { ...state.statistics },
    };
  }

  /**
   * Enable or disable annotations
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    try {
      localStorage.setItem('tds_annotations_enabled', String(enabled));
    } catch (e) {
      console.warn('Could not save annotation settings:', e);
    }

    if (!enabled) {
      this.clearAll();
    }
  }

  /**
   * Check if annotations are enabled
   */
  isAnnotationsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Clear all annotations
   */
  clearAll(): void {
    this.annotations.forEach((annotation) => {
      this.removeAnnotation(annotation.id);
    });
    this.annotations.clear();
  }

  /**
   * Set maximum number of simultaneous annotations
   */
  setMaxAnnotations(max: number): void {
    this.maxAnnotations = Math.max(1, Math.min(max, 10));
  }

  /**
   * Update event detection thresholds
   */
  setThresholds(thresholds: Partial<EventThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get current thresholds
   */
  getThresholds(): EventThresholds {
    return { ...this.thresholds };
  }

  /**
   * Manually add a custom annotation
   */
  addCustomAnnotation(
    message: string,
    type: 'info' | 'warning' | 'success' | 'highlight' = 'info',
    duration: number = 3000
  ): void {
    this.addAnnotation({
      type,
      message,
      position: this.getRandomPosition(),
      duration,
      priority: 5,
    });
  }

  /**
   * Destroy the annotation system
   */
  destroy(): void {
    this.clearAll();
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
