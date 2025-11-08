/**
 * Tutorial class for interactive step-by-step guidance
 * Provides overlay with element highlighting, tooltips, and navigation
 */
export class Tutorial {
  constructor(app) {
    this.app = app;
    this.steps = [];
    this.currentStep = 0;
    this.isActive = false;
    this.completedTutorials = this.loadCompletionStatus();
    
    // DOM elements
    this.overlay = null;
    this.tooltip = null;
    this.progressBar = null;
    this.highlightBox = null;
    
    this.initializeDOM();
    this.loadTutorialSteps();
  }

  /**
   * Initialize DOM elements for tutorial overlay
   */
  initializeDOM() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.display = 'none';
    
    // Create highlight box
    this.highlightBox = document.createElement('div');
    this.highlightBox.className = 'tutorial-highlight';
    this.overlay.appendChild(this.highlightBox);
    
    // Create tooltip container
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    this.tooltip.innerHTML = `
      <div class="tutorial-progress">
        <div class="tutorial-progress-bar"></div>
        <span class="tutorial-progress-text"></span>
      </div>
      <div class="tutorial-content">
        <h3 class="tutorial-title"></h3>
        <p class="tutorial-description"></p>
      </div>
      <div class="tutorial-navigation">
        <button class="tutorial-btn tutorial-skip">Skip Tutorial</button>
        <div class="tutorial-nav-buttons">
          <button class="tutorial-btn tutorial-prev">Previous</button>
          <button class="tutorial-btn tutorial-next">Next</button>
        </div>
      </div>
    `;
    this.overlay.appendChild(this.tooltip);
    
    // Add to document
    document.body.appendChild(this.overlay);
    
    // Cache DOM references
    this.progressBar = this.tooltip.querySelector('.tutorial-progress-bar');
    this.progressText = this.tooltip.querySelector('.tutorial-progress-text');
    this.titleElement = this.tooltip.querySelector('.tutorial-title');
    this.descriptionElement = this.tooltip.querySelector('.tutorial-description');
    this.prevButton = this.tooltip.querySelector('.tutorial-prev');
    this.nextButton = this.tooltip.querySelector('.tutorial-next');
    this.skipButton = this.tooltip.querySelector('.tutorial-skip');
    
    // Bind event listeners
    this.prevButton.addEventListener('click', () => this.previousStep());
    this.nextButton.addEventListener('click', () => this.nextStep());
    this.skipButton.addEventListener('click', () => this.skip());
    
    // Prevent clicks on overlay from propagating
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        // Allow clicking overlay background to continue
        this.nextStep();
      }
    });
  }

  /**
   * Load tutorial steps configuration
   */
  loadTutorialSteps() {
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to TDS Simulation',
        description: 'This interactive tutorial will guide you through the Theory of Dynamic Symmetry simulation. Click "Next" to begin exploring the interface.',
        target: null,
        position: 'center'
      },
      {
        id: 'canvas',
        title: 'Visualization Canvas',
        description: 'This is the main visualization area where you can see the lattice structure. Nodes represent points in space, and their colors indicate different states.',
        target: 'canvas',
        position: 'bottom'
      },
      {
        id: 'controls',
        title: 'Control Panel',
        description: 'Use these controls to adjust simulation parameters. Try changing the lattice size, animation speed, and other settings to see how they affect the system.',
        target: '.controls-panel',
        position: 'left'
      },
      {
        id: 'playback',
        title: 'Playback Controls',
        description: 'Start, pause, or reverse the simulation using these controls. You can also step through the simulation one frame at a time.',
        target: '.timeline',
        position: 'top'
      },
      {
        id: 'render-mode',
        title: 'Render Mode',
        description: 'Switch between 2D and 3D visualization modes. 3D mode provides a more immersive view with camera controls.',
        target: '#renderMode',
        position: 'right'
      },
      {
        id: 'anomaly-creation',
        title: 'Create Anomalies',
        description: 'Click on any node in the canvas to create a symmetry anomaly. Watch how it propagates through the lattice!',
        target: 'canvas',
        position: 'bottom',
        interactive: true
      },
      {
        id: 'analytics',
        title: 'Analytics Dashboard',
        description: 'View real-time metrics and charts showing energy distribution, symmetry ratios, and anomaly statistics.',
        target: '.analytics-dashboard',
        position: 'left'
      },
      {
        id: 'info-panel',
        title: 'Information & Help',
        description: 'Click the info button to learn more about TDS theory, view documentation, and access the glossary.',
        target: '.info-button',
        position: 'bottom'
      },
      {
        id: 'complete',
        title: 'Tutorial Complete!',
        description: 'You\'re ready to explore the Theory of Dynamic Symmetry. Experiment with different parameters and observe how the system behaves. Have fun!',
        target: null,
        position: 'center'
      }
    ];
  }

  /**
   * Start the tutorial from the beginning
   */
  start() {
    if (this.isActive) {
      return;
    }
    
    this.isActive = true;
    this.currentStep = 0;
    this.overlay.style.display = 'block';
    this.showStep(this.currentStep);
  }

  /**
   * Stop the tutorial
   */
  stop() {
    this.isActive = false;
    this.overlay.style.display = 'none';
    this.clearHighlight();
  }

  /**
   * Move to the next tutorial step
   */
  nextStep() {
    if (!this.isActive) {
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      // Tutorial complete
      this.complete();
    }
  }

  /**
   * Move to the previous tutorial step
   */
  previousStep() {
    if (!this.isActive || this.currentStep === 0) {
      return;
    }
    
    this.currentStep--;
    this.showStep(this.currentStep);
  }

  /**
   * Skip the tutorial
   */
  skip() {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime from the help menu.')) {
      this.stop();
    }
  }

  /**
   * Complete the tutorial
   */
  complete() {
    this.markAsCompleted('main');
    this.stop();
    
    // Show completion message
    if (this.app && this.app.showNotification) {
      this.app.showNotification('Tutorial completed! You can restart it anytime from the help menu.');
    }
  }

  /**
   * Show a specific tutorial step
   */
  showStep(stepIndex) {
    const step = this.steps[stepIndex];
    if (!step) {
      return;
    }
    
    // Update content
    this.titleElement.textContent = step.title;
    this.descriptionElement.textContent = step.description;
    
    // Update progress
    this.updateProgress();
    
    // Update navigation buttons
    this.prevButton.disabled = stepIndex === 0;
    this.nextButton.textContent = stepIndex === this.steps.length - 1 ? 'Finish' : 'Next';
    
    // Highlight target element
    if (step.target) {
      this.highlightElement(step.target);
      this.positionTooltip(step.target, step.position);
    } else {
      this.clearHighlight();
      this.centerTooltip();
    }
    
    // Handle interactive steps
    if (step.interactive) {
      this.setupInteractiveStep(step);
    }
  }

  /**
   * Highlight a specific element
   */
  highlightElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
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
  clearHighlight() {
    this.highlightBox.style.display = 'none';
    this.highlightBox.classList.remove('pulse');
  }

  /**
   * Position tooltip relative to target element
   */
  positionTooltip(selector, position = 'bottom') {
    const element = document.querySelector(selector);
    if (!element) {
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
  centerTooltip() {
    this.tooltip.style.left = '50%';
    this.tooltip.style.top = '50%';
    this.tooltip.style.transform = 'translate(-50%, -50%)';
  }

  /**
   * Update progress indicator
   */
  updateProgress() {
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.progressText.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;
  }

  /**
   * Setup interactive step behavior
   */
  setupInteractiveStep(step) {
    // For interactive steps, we can add special event listeners
    // For example, waiting for user to click on canvas
    if (step.id === 'anomaly-creation') {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const handler = () => {
          canvas.removeEventListener('click', handler);
          setTimeout(() => this.nextStep(), 1000);
        };
        canvas.addEventListener('click', handler);
      }
    }
  }

  /**
   * Load completion status from localStorage
   */
  loadCompletionStatus() {
    try {
      const stored = localStorage.getItem('tds_tutorial_completed');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Mark tutorial as completed
   */
  markAsCompleted(tutorialId) {
    this.completedTutorials[tutorialId] = true;
    try {
      localStorage.setItem('tds_tutorial_completed', JSON.stringify(this.completedTutorials));
    } catch (e) {
      console.warn('Could not save tutorial completion status:', e);
    }
  }

  /**
   * Check if tutorial has been completed
   */
  isCompleted(tutorialId = 'main') {
    return this.completedTutorials[tutorialId] === true;
  }

  /**
   * Reset tutorial completion status
   */
  resetCompletion(tutorialId = 'main') {
    if (tutorialId) {
      delete this.completedTutorials[tutorialId];
    } else {
      this.completedTutorials = {};
    }
    try {
      localStorage.setItem('tds_tutorial_completed', JSON.stringify(this.completedTutorials));
    } catch (e) {
      console.warn('Could not reset tutorial completion status:', e);
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (this.isActive && this.currentStep < this.steps.length) {
      const step = this.steps[this.currentStep];
      if (step.target) {
        this.highlightElement(step.target);
        this.positionTooltip(step.target, step.position);
      }
    }
  }
}
