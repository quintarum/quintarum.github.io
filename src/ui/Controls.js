/**
 * Controls Panel
 * Manages simulation parameters and user controls
 */
export class Controls {
  constructor(simulation, renderer2D, renderer3D) {
    this.simulation = simulation;
    this.renderer2D = renderer2D;
    this.renderer3D = renderer3D;
    this.currentRenderer = renderer2D;
    this.renderMode = '2d';
    
    this.params = {
      latticeSize: 20,
      animationSpeed: 1.0,
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      interactionRange: 2.0,
      timeStep: 0.1
    };

    this.presets = {
      'high-symmetry': {
        name: 'High Symmetry',
        description: 'Stable, highly ordered system with minimal anomalies',
        params: {
          symmetryStrength: 0.9,
          anomalyProbability: 0.02,
          interactionRange: 1.5,
          timeStep: 0.1
        }
      },
      'chaotic': {
        name: 'Chaotic',
        description: 'High anomaly probability with dynamic behavior',
        params: {
          symmetryStrength: 0.3,
          anomalyProbability: 0.4,
          interactionRange: 3.0,
          timeStep: 0.15
        }
      },
      'oscillating': {
        name: 'Oscillating',
        description: 'Periodic symmetry transitions',
        params: {
          symmetryStrength: 0.5,
          anomalyProbability: 0.15,
          interactionRange: 2.0,
          timeStep: 0.1
        }
      },
      'avalanche': {
        name: 'Avalanche',
        description: 'Cascading anomaly propagation',
        params: {
          symmetryStrength: 0.4,
          anomalyProbability: 0.25,
          interactionRange: 4.0,
          timeStep: 0.12
        }
      },
      'equilibrium': {
        name: 'Equilibrium',
        description: 'Balanced state demonstration',
        params: {
          symmetryStrength: 0.6,
          anomalyProbability: 0.1,
          interactionRange: 2.0,
          timeStep: 0.1
        }
      }
    };

    this.parameterInfo = {
      latticeSize: {
        description: 'Size of the simulation lattice grid',
        effect: 'Larger sizes show more complex patterns but may reduce performance',
        range: { min: 5, max: 100, recommended: [10, 50] }
      },
      animationSpeed: {
        description: 'Speed of the simulation animation',
        effect: 'Higher values make the simulation run faster',
        range: { min: 0.1, max: 5.0, recommended: [0.5, 2.0] }
      },
      symmetryStrength: {
        description: 'Tendency of nodes to maintain symmetric states',
        effect: 'Higher values create more stable, ordered patterns',
        range: { min: 0.0, max: 1.0, recommended: [0.3, 0.8] }
      },
      anomalyProbability: {
        description: 'Likelihood of anomalies forming in the lattice',
        effect: 'Higher values create more dynamic, chaotic behavior',
        range: { min: 0.0, max: 1.0, recommended: [0.05, 0.3] }
      },
      interactionRange: {
        description: 'Distance over which nodes influence each other',
        effect: 'Larger ranges create more connected, global behavior',
        range: { min: 1.0, max: 5.0, recommended: [1.5, 3.0] }
      },
      timeStep: {
        description: 'Time increment for each simulation step',
        effect: 'Smaller values give more accurate but slower simulations',
        range: { min: 0.01, max: 0.5, recommended: [0.05, 0.2] }
      }
    };

    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    const controlsPanel = document.getElementById('controls-panel');
    if (!controlsPanel) return;

    controlsPanel.innerHTML = `
      <div class="controls-header">
        <h2>Simulation Controls</h2>
        <button id="reset-btn" class="btn-secondary" title="Reset to default values">
          Reset
        </button>
      </div>

      <div class="control-section">
        <h3>Render Mode</h3>
        <div class="render-mode-toggle">
          <button id="mode-2d" class="mode-btn active" data-mode="2d">2D View</button>
          <button id="mode-3d" class="mode-btn" data-mode="3d">3D View</button>
        </div>
      </div>

      <div class="control-section">
        <h3>Preset Scenarios</h3>
        <select id="preset-selector" class="preset-select">
          <option value="">-- Select Preset --</option>
          ${Object.entries(this.presets).map(([key, preset]) => 
            `<option value="${key}">${preset.name}</option>`
          ).join('')}
        </select>
        <div id="preset-description" class="preset-description"></div>
      </div>

      <div class="control-section">
        <h3>Playback Controls</h3>
        <div class="playback-controls">
          <button id="play-btn" class="btn-primary">Play</button>
          <button id="pause-btn" class="btn-secondary">Pause</button>
          <button id="step-btn" class="btn-secondary">Step</button>
        </div>
      </div>

      <div class="control-section">
        <h3>Parameters</h3>
        <div class="parameters-list">
          ${this.createParameterControl('latticeSize', 'Lattice Size', 5, 100, 1)}
          ${this.createParameterControl('animationSpeed', 'Animation Speed', 0.1, 5.0, 0.1)}
          ${this.createParameterControl('symmetryStrength', 'Symmetry Strength', 0.0, 1.0, 0.01)}
          ${this.createParameterControl('anomalyProbability', 'Anomaly Probability', 0.0, 1.0, 0.01)}
          ${this.createParameterControl('interactionRange', 'Interaction Range', 1.0, 5.0, 0.1)}
          ${this.createParameterControl('timeStep', 'Time Step', 0.01, 0.5, 0.01)}
        </div>
      </div>
    `;
  }

  createParameterControl(name, label, min, max, step) {
    const value = this.params[name];
    const info = this.parameterInfo[name];
    
    return `
      <div class="parameter-control">
        <div class="parameter-header">
          <label for="${name}">${label}</label>
          <button class="info-btn" data-param="${name}" title="What does this do?">?</button>
          <span class="parameter-value" id="${name}-value">${value}</span>
        </div>
        <input 
          type="range" 
          id="${name}" 
          name="${name}"
          min="${min}" 
          max="${max}" 
          step="${step}" 
          value="${value}"
          class="parameter-slider"
        />
        <div class="parameter-range-hint">
          Recommended: ${info.range.recommended[0]} - ${info.range.recommended[1]}
        </div>
        <div class="parameter-tooltip hidden" id="${name}-tooltip">
          <div class="tooltip-content">
            <strong>${label}</strong>
            <p>${info.description}</p>
            <p class="tooltip-effect"><em>Effect:</em> ${info.effect}</p>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Render mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleModeChange(e));
    });

    // Preset selector
    const presetSelector = document.getElementById('preset-selector');
    if (presetSelector) {
      presetSelector.addEventListener('change', (e) => this.handlePresetChange(e));
    }

    // Playback controls
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepBtn = document.getElementById('step-btn');

    if (playBtn) playBtn.addEventListener('click', () => this.simulation.start());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.simulation.stop());
    if (stepBtn) stepBtn.addEventListener('click', () => this.simulation.step(this.params.timeStep));

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Parameter sliders
    Object.keys(this.params).forEach(paramName => {
      const slider = document.getElementById(paramName);
      if (slider) {
        slider.addEventListener('input', (e) => this.handleParameterChange(paramName, e.target.value));
      }
    });

    // Info buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleTooltip(e));
      btn.addEventListener('mouseenter', (e) => this.showTooltip(e));
      btn.addEventListener('mouseleave', (e) => this.hideTooltip(e));
    });
  }

  handleModeChange(e) {
    const mode = e.target.dataset.mode;
    if (mode === this.renderMode) return;

    this.renderMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Switch renderer
    if (mode === '2d') {
      this.currentRenderer = this.renderer2D;
      if (this.renderer3D) this.renderer3D.hide();
      this.renderer2D.show();
    } else {
      this.currentRenderer = this.renderer3D;
      if (this.renderer2D) this.renderer2D.hide();
      this.renderer3D.show();
    }

    // Notify simulation of renderer change
    if (this.simulation) {
      this.simulation.setRenderer(this.currentRenderer);
    }
  }

  handlePresetChange(e) {
    const presetKey = e.target.value;
    if (!presetKey) {
      document.getElementById('preset-description').textContent = '';
      return;
    }

    const preset = this.presets[presetKey];
    if (!preset) return;

    // Show description
    const descriptionEl = document.getElementById('preset-description');
    descriptionEl.textContent = preset.description;

    // Apply preset parameters
    Object.entries(preset.params).forEach(([key, value]) => {
      this.params[key] = value;
      
      // Update slider
      const slider = document.getElementById(key);
      if (slider) {
        slider.value = value;
      }
      
      // Update value display
      const valueDisplay = document.getElementById(`${key}-value`);
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    });

    // Apply to simulation
    this.applyParameters();
  }

  handleParameterChange(paramName, value) {
    const numValue = parseFloat(value);
    this.params[paramName] = numValue;

    // Update value display
    const valueDisplay = document.getElementById(`${paramName}-value`);
    if (valueDisplay) {
      valueDisplay.textContent = numValue;
    }

    // Show visual preview effect
    this.showParameterPreview(paramName, numValue);

    // Apply to simulation with debouncing
    clearTimeout(this.parameterTimeout);
    this.parameterTimeout = setTimeout(() => {
      this.applyParameters();
    }, 100);
  }

  showParameterPreview(paramName, value) {
    const slider = document.getElementById(paramName);
    if (!slider) return;

    // Add visual feedback class
    slider.classList.add('changing');
    setTimeout(() => {
      slider.classList.remove('changing');
    }, 300);

    // Show effect preview based on parameter
    const info = this.parameterInfo[paramName];
    if (info) {
      const rangeHint = slider.parentElement.querySelector('.parameter-range-hint');
      if (rangeHint) {
        const [min, max] = info.range.recommended;
        if (value < min || value > max) {
          rangeHint.classList.add('warning');
        } else {
          rangeHint.classList.remove('warning');
        }
      }
    }
  }

  applyParameters() {
    if (!this.simulation) return;

    // Apply parameters to simulation
    this.simulation.updateParameters(this.params);

    // If lattice size changed, reinitialize
    if (this.params.latticeSize !== this.simulation.lattice.width) {
      this.simulation.reinitialize(this.params.latticeSize);
    }
  }

  toggleTooltip(e) {
    const paramName = e.target.dataset.param;
    const tooltip = document.getElementById(`${paramName}-tooltip`);
    if (tooltip) {
      tooltip.classList.toggle('hidden');
    }
  }

  showTooltip(e) {
    const paramName = e.target.dataset.param;
    const tooltip = document.getElementById(`${paramName}-tooltip`);
    if (tooltip) {
      tooltip.classList.remove('hidden');
    }
  }

  hideTooltip(e) {
    const paramName = e.target.dataset.param;
    const tooltip = document.getElementById(`${paramName}-tooltip`);
    if (tooltip) {
      tooltip.classList.add('hidden');
    }
  }

  reset() {
    // Reset to default parameters
    this.params = {
      latticeSize: 20,
      animationSpeed: 1.0,
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      interactionRange: 2.0,
      timeStep: 0.1
    };

    // Update all sliders and displays
    Object.entries(this.params).forEach(([key, value]) => {
      const slider = document.getElementById(key);
      if (slider) {
        slider.value = value;
      }
      
      const valueDisplay = document.getElementById(`${key}-value`);
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    });

    // Clear preset selection
    const presetSelector = document.getElementById('preset-selector');
    if (presetSelector) {
      presetSelector.value = '';
    }
    document.getElementById('preset-description').textContent = '';

    // Apply to simulation
    this.applyParameters();
  }

  getParameters() {
    return { ...this.params };
  }

  setParameter(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
      
      const slider = document.getElementById(name);
      if (slider) {
        slider.value = value;
      }
      
      const valueDisplay = document.getElementById(`${name}-value`);
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
      
      this.applyParameters();
    }
  }
}
