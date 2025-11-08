/**
 * GuidedTour system for thematic step-by-step tours
 * Provides specialized tours for different TDS concepts
 */

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  waitForInteraction?: boolean;
}

interface Tour {
  id: string;
  name: string;
  description: string;
  category: 'basics' | 'advanced' | 'physics';
  estimatedMinutes: number;
  steps: TourStep[];
}

interface AppInstance {
  simulation?: {
    start: () => void;
    pause: () => void;
    reset: () => void;
    setParameter: (name: string, value: number) => void;
  };
  renderer?: {
    setRenderMode: (mode: string) => void;
  };
  showNotification?: (message: string) => void;
}

export class GuidedTour {
  private app: AppInstance;
  private tours: Map<string, Tour>;
  private currentTour: Tour | null;
  private currentStep: number;
  private isActive: boolean;
  
  // DOM elements
  private overlay: HTMLDivElement | null;
  private tooltip: HTMLDivElement | null;
  private progressBar: HTMLDivElement | null;
  private progressText: HTMLSpanElement | null;
  private highlightBox: HTMLDivElement | null;
  private titleElement: HTMLHeadingElement | null;
  private descriptionElement: HTMLParagraphElement | null;
  private prevButton: HTMLButtonElement | null;
  private nextButton: HTMLButtonElement | null;
  private exitButton: HTMLButtonElement | null;

  constructor(app: AppInstance) {
    this.app = app;
    this.tours = new Map();
    this.currentTour = null;
    this.currentStep = 0;
    this.isActive = false;
    
    // Initialize DOM elements as null
    this.overlay = null;
    this.tooltip = null;
    this.progressBar = null;
    this.progressText = null;
    this.highlightBox = null;
    this.titleElement = null;
    this.descriptionElement = null;
    this.prevButton = null;
    this.nextButton = null;
    this.exitButton = null;
    
    this.initializeDOM();
    this.loadTours();
  }

  /**
   * Initialize DOM elements for tour overlay
   */
  private initializeDOM(): void {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'guided-tour-overlay';
    this.overlay.style.display = 'none';
    
    // Create highlight box
    this.highlightBox = document.createElement('div');
    this.highlightBox.className = 'guided-tour-highlight';
    this.overlay.appendChild(this.highlightBox);
    
    // Create tooltip container
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'guided-tour-tooltip';
    this.tooltip.innerHTML = `
      <div class="guided-tour-header">
        <div class="guided-tour-progress">
          <div class="guided-tour-progress-bar"></div>
          <span class="guided-tour-progress-text"></span>
        </div>
        <button class="guided-tour-exit" title="Exit Tour">×</button>
      </div>
      <div class="guided-tour-content">
        <h3 class="guided-tour-title"></h3>
        <p class="guided-tour-description"></p>
      </div>
      <div class="guided-tour-navigation">
        <button class="guided-tour-btn guided-tour-prev">Previous</button>
        <button class="guided-tour-btn guided-tour-next">Next</button>
      </div>
    `;
    this.overlay.appendChild(this.tooltip);
    
    // Add to document
    document.body.appendChild(this.overlay);
    
    // Cache DOM references
    this.progressBar = this.tooltip.querySelector('.guided-tour-progress-bar') as HTMLDivElement;
    this.progressText = this.tooltip.querySelector('.guided-tour-progress-text') as HTMLSpanElement;
    this.titleElement = this.tooltip.querySelector('.guided-tour-title') as HTMLHeadingElement;
    this.descriptionElement = this.tooltip.querySelector('.guided-tour-description') as HTMLParagraphElement;
    this.prevButton = this.tooltip.querySelector('.guided-tour-prev') as HTMLButtonElement;
    this.nextButton = this.tooltip.querySelector('.guided-tour-next') as HTMLButtonElement;
    this.exitButton = this.tooltip.querySelector('.guided-tour-exit') as HTMLButtonElement;
    
    // Bind event listeners
    this.prevButton.addEventListener('click', () => this.previousStep());
    this.nextButton.addEventListener('click', () => this.nextStep());
    this.exitButton.addEventListener('click', () => this.exit());
  }

  /**
   * Load all available tours
   */
  private loadTours(): void {
    this.tours.set('symmetry-basics', this.createSymmetryBasicsTour());
    this.tours.set('anomaly-dynamics', this.createAnomalyDynamicsTour());
    this.tours.set('time-reversibility', this.createTimeReversibilityTour());
    this.tours.set('energy-conservation', this.createEnergyConservationTour());
    this.tours.set('physics-problems', this.createPhysicsProblemsTour());
  }

  /**
   * Create Symmetry Basics tour
   */
  private createSymmetryBasicsTour(): Tour {
    return {
      id: 'symmetry-basics',
      name: 'Symmetry Basics',
      description: 'Learn the fundamental concepts of symmetry in TDS',
      category: 'basics',
      estimatedMinutes: 5,
      steps: [
        {
          id: 'intro',
          title: 'Understanding Symmetry',
          description: 'In TDS, symmetry is the fundamental property of the lattice. Each node can be in a symmetric or broken state, representing the balance of informational dynamics.',
          target: null,
          position: 'center'
        },
        {
          id: 'lattice-view',
          title: 'The Lattice Structure',
          description: 'This lattice represents quantized space. Each point is a node that can hold information about its symmetry state. Notice how nodes are connected to their neighbors.',
          target: 'canvas',
          position: 'bottom'
        },
        {
          id: 'node-states',
          title: 'Node States',
          description: 'Nodes can be in different states: symmetric (balanced), broken (asymmetric), or anomaly (disrupted). The colors represent these different states.',
          target: 'canvas',
          position: 'bottom',
          action: () => {
            // Highlight color legend if available
            const legend = document.querySelector('.color-legend');
            if (legend) {
              legend.classList.add('highlight-pulse');
              setTimeout(() => legend.classList.remove('highlight-pulse'), 2000);
            }
          }
        },
        {
          id: 'symmetry-parameter',
          title: 'Symmetry Strength',
          description: 'This parameter controls how strongly nodes prefer symmetric states. Higher values create more stable, ordered patterns.',
          target: '#symmetryStrength',
          position: 'right'
        },
        {
          id: 'observe-symmetry',
          title: 'Observe Symmetry Evolution',
          description: 'Start the simulation to see how symmetry evolves over time. Watch how nodes interact with their neighbors to maintain or break symmetry.',
          target: '.timeline',
          position: 'top',
          action: () => {
            if (this.app.simulation) {
              this.app.simulation.start();
            }
          }
        },
        {
          id: 'symmetry-metrics',
          title: 'Symmetry Metrics',
          description: 'The analytics dashboard shows real-time symmetry ratios. This tells you what percentage of the lattice is in a symmetric state.',
          target: '.analytics-dashboard',
          position: 'left'
        },
        {
          id: 'complete',
          title: 'Symmetry Basics Complete!',
          description: 'You now understand the basics of symmetry in TDS. Try adjusting parameters to see how they affect symmetry patterns.',
          target: null,
          position: 'center'
        }
      ]
    };
  }

  /**
   * Create Anomaly Dynamics tour
   */
  private createAnomalyDynamicsTour(): Tour {
    return {
      id: 'anomaly-dynamics',
      name: 'Anomaly Dynamics',
      description: 'Explore how anomalies form and propagate through the lattice',
      category: 'advanced',
      estimatedMinutes: 7,
      steps: [
        {
          id: 'intro',
          title: 'What are Anomalies?',
          description: 'Anomalies are local disruptions in symmetry that can propagate through the lattice like waves. They represent informational disturbances in the TDS framework.',
          target: null,
          position: 'center'
        },
        {
          id: 'create-anomaly',
          title: 'Creating an Anomaly',
          description: 'Click anywhere on the lattice to create an anomaly. Watch how it appears with distinctive visual effects.',
          target: 'canvas',
          position: 'bottom',
          waitForInteraction: true
        },
        {
          id: 'propagation',
          title: 'Anomaly Propagation',
          description: 'Notice how the anomaly spreads to neighboring nodes in a wave-like pattern. This demonstrates the reversible dynamics of information flow in TDS.',
          target: 'canvas',
          position: 'bottom'
        },
        {
          id: 'anomaly-counter',
          title: 'Tracking Anomalies',
          description: 'The anomaly counter shows how many anomalies currently exist in the lattice. Watch how this number changes as anomalies propagate and interact.',
          target: '.anomaly-counter',
          position: 'left'
        },
        {
          id: 'anomaly-probability',
          title: 'Spontaneous Anomalies',
          description: 'This parameter controls the probability of spontaneous anomaly formation. Higher values create more chaotic, dynamic systems.',
          target: '#anomalyProbability',
          position: 'right'
        },
        {
          id: 'visual-effects',
          title: 'Visual Effects',
          description: 'Anomalies are shown with ripples, halos, and particle trails to make their propagation visible. These effects help you understand the dynamics.',
          target: 'canvas',
          position: 'bottom'
        },
        {
          id: 'energy-impact',
          title: 'Energy Distribution',
          description: 'Anomalies affect the energy distribution in the lattice. Watch the energy chart to see how anomalies create local energy variations.',
          target: '.analytics-dashboard',
          position: 'left'
        },
        {
          id: 'complete',
          title: 'Anomaly Dynamics Complete!',
          description: 'You now understand how anomalies form, propagate, and interact in the TDS lattice. Experiment with different parameters to explore various anomaly behaviors.',
          target: null,
          position: 'center'
        }
      ]
    };
  }

  /**
   * Create Time Reversibility tour
   */
  private createTimeReversibilityTour(): Tour {
    return {
      id: 'time-reversibility',
      name: 'Time Reversibility',
      description: 'Discover the time-symmetric nature of TDS dynamics',
      category: 'advanced',
      estimatedMinutes: 6,
      steps: [
        {
          id: 'intro',
          title: 'Time Reversibility in TDS',
          description: 'Unlike many physical models, TDS is fully time-reversible. This means you can run the simulation backward and recover exact previous states.',
          target: null,
          position: 'center'
        },
        {
          id: 'timeline-controls',
          title: 'Timeline Controls',
          description: 'The timeline provides complete control over time. You can play forward, pause, reverse, or jump to any point in history.',
          target: '.timeline',
          position: 'top'
        },
        {
          id: 'play-forward',
          title: 'Forward Evolution',
          description: 'Start the simulation and let it run for a few seconds. Observe how the system evolves forward in time.',
          target: '.timeline',
          position: 'top',
          action: () => {
            if (this.app.simulation) {
              this.app.simulation.start();
            }
          }
        },
        {
          id: 'pause',
          title: 'Pause and Observe',
          description: 'Pause the simulation to freeze the current state. This allows you to examine the lattice configuration in detail.',
          target: '.timeline',
          position: 'top',
          action: () => {
            if (this.app.simulation) {
              this.app.simulation.pause();
            }
          }
        },
        {
          id: 'reverse',
          title: 'Reverse Playback',
          description: 'Now click the reverse button. Watch as the simulation runs backward, recovering all previous states exactly. This demonstrates perfect time reversibility.',
          target: '.timeline',
          position: 'top'
        },
        {
          id: 'scrubber',
          title: 'Timeline Scrubber',
          description: 'Drag the scrubber to jump to any point in the simulation history. This lets you explore specific moments in detail.',
          target: '.timeline-scrubber',
          position: 'top'
        },
        {
          id: 'bookmarks',
          title: 'Bookmarking States',
          description: 'You can bookmark interesting moments to return to them later. This is useful for studying specific configurations or events.',
          target: '.bookmark-button',
          position: 'top'
        },
        {
          id: 'time-direction',
          title: 'Time Direction Indicator',
          description: 'The visual indicators show which direction time is flowing. This helps you understand whether you\'re watching forward or reverse evolution.',
          target: '.timeline',
          position: 'top'
        },
        {
          id: 'complete',
          title: 'Time Reversibility Complete!',
          description: 'You now understand the time-reversible nature of TDS. This property is fundamental to the theory and distinguishes it from many other models.',
          target: null,
          position: 'center'
        }
      ]
    };
  }

  /**
   * Create Energy Conservation tour
   */
  private createEnergyConservationTour(): Tour {
    return {
      id: 'energy-conservation',
      name: 'Energy Conservation',
      description: 'Learn how energy is conserved and distributed in TDS',
      category: 'advanced',
      estimatedMinutes: 6,
      steps: [
        {
          id: 'intro',
          title: 'Energy in TDS',
          description: 'In TDS, energy represents the informational content and dynamics of the lattice. The total energy is conserved, but it can flow between nodes.',
          target: null,
          position: 'center'
        },
        {
          id: 'energy-chart',
          title: 'Energy Distribution Chart',
          description: 'This chart shows the total energy over time. Notice how it remains constant (conserved) even as the lattice evolves.',
          target: '.energy-chart',
          position: 'left'
        },
        {
          id: 'node-energy',
          title: 'Node Energy Levels',
          description: 'Each node has an energy level based on its state and interactions with neighbors. The color intensity often represents energy magnitude.',
          target: 'canvas',
          position: 'bottom'
        },
        {
          id: 'energy-flow',
          title: 'Energy Flow',
          description: 'Start the simulation to see energy flow through the lattice. Particle trails and flow lines visualize this energy transfer.',
          target: 'canvas',
          position: 'bottom',
          action: () => {
            if (this.app.simulation) {
              this.app.simulation.start();
            }
          }
        },
        {
          id: 'symmetric-energy',
          title: 'Symmetric Energy',
          description: 'Symmetric nodes contribute to the symmetric energy component. This represents the ordered, balanced portion of the system.',
          target: '.analytics-dashboard',
          position: 'left'
        },
        {
          id: 'asymmetric-energy',
          title: 'Asymmetric Energy',
          description: 'Broken symmetry nodes contribute to asymmetric energy. This represents the disordered or disrupted portion of the system.',
          target: '.analytics-dashboard',
          position: 'left'
        },
        {
          id: 'energy-gradient',
          title: 'Energy Gradients',
          description: 'Energy gradients drive the dynamics. Nodes tend to evolve toward lower energy configurations, but reversibility ensures no information is lost.',
          target: 'canvas',
          position: 'bottom'
        },
        {
          id: 'conservation-verification',
          title: 'Verifying Conservation',
          description: 'Watch the total energy line in the chart. Despite all the dynamics, the total energy remains constant, demonstrating conservation.',
          target: '.energy-chart',
          position: 'left'
        },
        {
          id: 'complete',
          title: 'Energy Conservation Complete!',
          description: 'You now understand how energy is conserved and flows in TDS. This conservation law is fundamental to the theory\'s consistency.',
          target: null,
          position: 'center'
        }
      ]
    };
  }

  /**
   * Create Physics Problems tour
   */
  private createPhysicsProblemsTour(): Tour {
    return {
      id: 'physics-problems',
      name: 'Physics Problems',
      description: 'Explore how TDS addresses unsolved physics problems',
      category: 'physics',
      estimatedMinutes: 8,
      steps: [
        {
          id: 'intro',
          title: 'TDS and Unsolved Problems',
          description: 'TDS offers new perspectives on several unsolved problems in physics. This tour shows how you can explore these problems using the simulation.',
          target: null,
          position: 'center'
        },
        {
          id: 'problems-panel',
          title: 'Physics Problems Panel',
          description: 'This panel contains pre-configured scenarios for major unsolved physics problems. Each scenario sets up the lattice to explore a specific problem.',
          target: '.physics-problems-panel',
          position: 'left'
        },
        {
          id: 'problem-list',
          title: 'Available Problems',
          description: 'The simulation includes scenarios for dark matter, matter-antimatter asymmetry, quantum measurement, black hole information paradox, and the hierarchy problem.',
          target: '.problem-selector',
          position: 'left'
        },
        {
          id: 'select-problem',
          title: 'Select a Problem',
          description: 'Choose a problem to explore. Each problem has a description explaining the physics challenge and how TDS approaches it.',
          target: '.problem-selector',
          position: 'left'
        },
        {
          id: 'problem-description',
          title: 'Problem Context',
          description: 'Read the problem description to understand the physics challenge. This includes background on why it\'s unsolved and what makes it difficult.',
          target: '.problem-description',
          position: 'left'
        },
        {
          id: 'tds-approach',
          title: 'TDS Approach',
          description: 'Learn how TDS addresses this problem through its framework of reversible dynamics and symmetry. This explains the theoretical perspective.',
          target: '.tds-approach',
          position: 'left'
        },
        {
          id: 'run-scenario',
          title: 'Run the Scenario',
          description: 'Start the simulation to see how TDS models this problem. Watch how the lattice evolves according to the problem-specific parameters.',
          target: '.timeline',
          position: 'top'
        },
        {
          id: 'comparison',
          title: 'TDS vs Standard Model',
          description: 'The comparison view shows how TDS predictions differ from the standard model. This helps identify where TDS might offer new insights.',
          target: '.comparison-view',
          position: 'left'
        },
        {
          id: 'experimental-data',
          title: 'Experimental Data',
          description: 'When available, experimental data is overlaid on the predictions. This allows you to see how well each model matches observations.',
          target: '.experimental-overlay',
          position: 'left'
        },
        {
          id: 'metrics',
          title: 'Quantitative Metrics',
          description: 'Quantitative metrics show numerical comparisons between models. These help evaluate which approach better explains the phenomenon.',
          target: '.metrics-panel',
          position: 'left'
        },
        {
          id: 'references',
          title: 'Research References',
          description: 'Each problem includes references to peer-reviewed research. These provide deeper context and theoretical background.',
          target: '.references-section',
          position: 'left'
        },
        {
          id: 'complete',
          title: 'Physics Problems Complete!',
          description: 'You now know how to explore unsolved physics problems using TDS. Try different problems and compare the approaches!',
          target: null,
          position: 'center'
        }
      ]
    };
  }

  /**
   * Start a specific tour
   */
  startTour(tourId: string): void {
    const tour = this.tours.get(tourId);
    if (!tour) {
      console.warn(`Tour "${tourId}" not found`);
      return;
    }
    
    if (this.isActive) {
      this.exit();
    }
    
    this.currentTour = tour;
    this.currentStep = 0;
    this.isActive = true;
    
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }
    
    this.showStep(this.currentStep);
  }

  /**
   * Stop the current tour
   */
  stop(): void {
    this.isActive = false;
    this.currentTour = null;
    
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    this.clearHighlight();
  }

  /**
   * Exit tour with confirmation
   */
  exit(): void {
    if (confirm('Are you sure you want to exit this tour? Your progress will not be saved.')) {
      this.stop();
    }
  }

  /**
   * Move to next step
   */
  nextStep(): void {
    if (!this.isActive || !this.currentTour) {
      return;
    }
    
    const currentStepData = this.currentTour.steps[this.currentStep];
    
    // Check if we need to wait for interaction
    if (currentStepData.waitForInteraction) {
      // Set up listener for interaction before proceeding
      this.setupInteractionListener(currentStepData);
      return;
    }
    
    if (this.currentStep < this.currentTour.steps.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      this.completeTour();
    }
  }

  /**
   * Move to previous step
   */
  previousStep(): void {
    if (!this.isActive || !this.currentTour || this.currentStep === 0) {
      return;
    }
    
    this.currentStep--;
    this.showStep(this.currentStep);
  }

  /**
   * Complete the current tour
   */
  completeTour(): void {
    if (!this.currentTour) {
      return;
    }
    
    const tourId = this.currentTour.id;
    this.stop();
    
    // Show completion message
    if (this.app && this.app.showNotification) {
      this.app.showNotification(`Tour "${this.currentTour.name}" completed! Great job!`);
    }
    
    // Save completion status
    this.markTourCompleted(tourId);
  }

  /**
   * Show a specific step
   */
  private showStep(stepIndex: number): void {
    if (!this.currentTour) {
      return;
    }
    
    const step = this.currentTour.steps[stepIndex];
    if (!step) {
      return;
    }
    
    // Update content
    if (this.titleElement) {
      this.titleElement.textContent = step.title;
    }
    if (this.descriptionElement) {
      this.descriptionElement.textContent = step.description;
    }
    
    // Update progress
    this.updateProgress();
    
    // Update navigation buttons
    if (this.prevButton) {
      this.prevButton.disabled = stepIndex === 0;
    }
    if (this.nextButton) {
      const isLastStep = stepIndex === this.currentTour.steps.length - 1;
      this.nextButton.textContent = isLastStep ? 'Finish' : 'Next';
    }
    
    // Execute step action if defined
    if (step.action) {
      setTimeout(() => {
        if (step.action) {
          step.action();
        }
      }, 500);
    }
    
    // Highlight target element
    if (step.target) {
      this.highlightElement(step.target);
      this.positionTooltip(step.target, step.position);
    } else {
      this.clearHighlight();
      this.centerTooltip();
    }
  }

  /**
   * Highlight a specific element
   */
  private highlightElement(selector: string): void {
    const element = document.querySelector(selector);
    if (!element || !this.highlightBox) {
      this.clearHighlight();
      return;
    }
    
    const rect = element.getBoundingClientRect();
    const padding = 10;
    
    // Position highlight box
    this.highlightBox.style.display = 'block';
    this.highlightBox.style.left = `${rect.left - padding}px`;
    this.highlightBox.style.top = `${rect.top - padding}px`;
    this.highlightBox.style.width = `${rect.width + padding * 2}px`;
    this.highlightBox.style.height = `${rect.height + padding * 2}px`;
    
    // Add pulsing animation
    this.highlightBox.classList.add('pulse');
  }

  /**
   * Clear element highlighting
   */
  private clearHighlight(): void {
    if (this.highlightBox) {
      this.highlightBox.style.display = 'none';
      this.highlightBox.classList.remove('pulse');
    }
  }

  /**
   * Position tooltip relative to target element
   */
  private positionTooltip(selector: string, position: 'top' | 'bottom' | 'left' | 'right' | 'center'): void {
    const element = document.querySelector(selector);
    if (!element || !this.tooltip) {
      this.centerTooltip();
      return;
    }
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const spacing = 20;
    
    let left, top;
    
    switch (position) {
      case 'top':
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        top = rect.top - tooltipRect.height - spacing;
        break;
      case 'bottom':
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        top = rect.bottom + spacing;
        break;
      case 'left':
        left = rect.left - tooltipRect.width - spacing;
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        left = rect.right + spacing;
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        break;
      default:
        this.centerTooltip();
        return;
    }
    
    // Keep tooltip within viewport
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));
    
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.transform = 'none';
  }

  /**
   * Center tooltip in viewport
   */
  private centerTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.left = '50%';
      this.tooltip.style.top = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
    }
  }

  /**
   * Update progress indicator
   */
  private updateProgress(): void {
    if (!this.currentTour) {
      return;
    }
    
    const progress = ((this.currentStep + 1) / this.currentTour.steps.length) * 100;
    
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
    
    if (this.progressText) {
      this.progressText.textContent = `${this.currentStep + 1} / ${this.currentTour.steps.length}`;
    }
  }

  /**
   * Setup interaction listener for interactive steps
   */
  private setupInteractionListener(step: TourStep): void {
    if (!step.target) {
      return;
    }
    
    const element = document.querySelector(step.target);
    if (!element) {
      return;
    }
    
    const handler = () => {
      element.removeEventListener('click', handler);
      setTimeout(() => {
        this.currentStep++;
        this.showStep(this.currentStep);
      }, 1000);
    };
    
    element.addEventListener('click', handler);
  }

  /**
   * Mark tour as completed
   */
  private markTourCompleted(tourId: string): void {
    try {
      const completed = this.getCompletedTours();
      completed.add(tourId);
      localStorage.setItem('tds_completed_tours', JSON.stringify(Array.from(completed)));
    } catch (e) {
      console.warn('Could not save tour completion status:', e);
    }
  }

  /**
   * Get set of completed tour IDs
   */
  private getCompletedTours(): Set<string> {
    try {
      const stored = localStorage.getItem('tds_completed_tours');
      if (stored) {
        const array = JSON.parse(stored) as string[];
        return new Set(array);
      }
    } catch (e) {
      console.warn('Could not load tour completion status:', e);
    }
    return new Set();
  }

  /**
   * Check if a tour has been completed
   */
  isTourCompleted(tourId: string): boolean {
    return this.getCompletedTours().has(tourId);
  }

  /**
   * Get all available tours
   */
  getAvailableTours(): Tour[] {
    return Array.from(this.tours.values());
  }

  /**
   * Get tours by category
   */
  getToursByCategory(category: 'basics' | 'advanced' | 'physics'): Tour[] {
    return this.getAvailableTours().filter(tour => tour.category === category);
  }

  /**
   * Handle window resize
   */
  handleResize(): void {
    if (this.isActive && this.currentTour && this.currentStep < this.currentTour.steps.length) {
      const step = this.currentTour.steps[this.currentStep];
      if (step.target) {
        this.highlightElement(step.target);
        this.positionTooltip(step.target, step.position);
      }
    }
  }

  /**
   * Reset all tour completion status
   */
  resetAllProgress(): void {
    try {
      localStorage.removeItem('tds_completed_tours');
    } catch (e) {
      console.warn('Could not reset tour progress:', e);
    }
  }
}
