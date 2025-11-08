// @ts-nocheck
/* eslint-disable */
/**
 * Comparison View
 * Split-screen comparison of multiple simulations
 */
/* global alert, confirm, prompt, Blob */
export class ComparisonView {
  constructor() {
    this.simulations = [];
    this.maxSimulations = 4;
    this.isSynced = true;
    this.snapshots = new Map();
    
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    const comparisonContainer = document.getElementById('comparison-view-container');
    if (!comparisonContainer) return;

    comparisonContainer.innerHTML = `
      <div class="comparison-panel">
        <div class="comparison-header">
          <h3>Simulation Comparison</h3>
          <div class="comparison-controls">
            <button id="add-simulation-btn" class="comparison-btn">
              + Add Simulation
            </button>
            <button id="sync-playback-btn" class="comparison-btn active">
              🔗 Sync Playback
            </button>
            <button id="highlight-diff-btn" class="comparison-btn">
              ✨ Highlight Differences
            </button>
            <button id="generate-comparison-report-btn" class="comparison-btn">
              📄 Generate Report
            </button>
          </div>
        </div>

        <div class="comparison-grid" id="comparison-grid">
          <div class="empty-comparison">
            <div class="empty-icon">🔬</div>
            <h4>No Simulations to Compare</h4>
            <p>Add simulations to start comparing their behavior</p>
            <button class="add-first-btn" id="add-first-simulation">
              Add First Simulation
            </button>
          </div>
        </div>

        <div class="comparison-playback hidden" id="comparison-playback">
          <h4>Synchronized Playback</h4>
          <div class="playback-controls-comparison">
            <button id="comp-play-btn" class="playback-btn">▶ Play All</button>
            <button id="comp-pause-btn" class="playback-btn">⏸ Pause All</button>
            <button id="comp-step-btn" class="playback-btn">⏭ Step</button>
            <button id="comp-reset-btn" class="playback-btn">↺ Reset All</button>
          </div>
          <div class="sync-timeline">
            <input 
              type="range" 
              id="sync-scrubber" 
              min="0" 
              max="100" 
              value="0"
              class="sync-slider"
            />
            <div class="sync-time-display">
              <span>Time: <span id="sync-time">0.00</span></span>
            </div>
          </div>
        </div>

        <div class="snapshots-panel" id="snapshots-panel">
          <div class="snapshots-header">
            <h4>Snapshots</h4>
            <button id="take-snapshot-btn" class="snapshot-btn">
              📸 Take Snapshot
            </button>
          </div>
          <div class="snapshots-list" id="snapshots-list">
            <p class="empty-message">No snapshots yet</p>
          </div>
        </div>

        <div class="differences-panel hidden" id="differences-panel">
          <h4>Detected Differences</h4>
          <div class="differences-list" id="differences-list"></div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Add simulation
    const addBtn = document.getElementById('add-simulation-btn');
    const addFirstBtn = document.getElementById('add-first-simulation');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addSimulation());
    }
    
    if (addFirstBtn) {
      addFirstBtn.addEventListener('click', () => this.addSimulation());
    }

    // Sync playback toggle
    const syncBtn = document.getElementById('sync-playback-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.toggleSync());
    }

    // Highlight differences
    const highlightBtn = document.getElementById('highlight-diff-btn');
    if (highlightBtn) {
      highlightBtn.addEventListener('click', () => this.highlightDifferences());
    }

    // Generate report
    const reportBtn = document.getElementById('generate-comparison-report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.generateComparisonReport());
    }

    // Playback controls
    const playBtn = document.getElementById('comp-play-btn');
    const pauseBtn = document.getElementById('comp-pause-btn');
    const stepBtn = document.getElementById('comp-step-btn');
    const resetBtn = document.getElementById('comp-reset-btn');

    if (playBtn) playBtn.addEventListener('click', () => this.playAll());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseAll());
    if (stepBtn) stepBtn.addEventListener('click', () => this.stepAll());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetAll());

    // Sync scrubber
    const scrubber = document.getElementById('sync-scrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => this.seekAll(parseInt(e.target.value)));
    }

    // Take snapshot
    const snapshotBtn = document.getElementById('take-snapshot-btn');
    if (snapshotBtn) {
      snapshotBtn.addEventListener('click', () => this.takeSnapshot());
    }
  }

  addSimulation(simulation = null) {
    if (this.simulations.length >= this.maxSimulations) {
      alert(`Maximum ${this.maxSimulations} simulations allowed`);
      return;
    }

    // Create a new simulation slot
    const slotId = `sim-${Date.now()}`;
    const slot = {
      id: slotId,
      simulation: simulation,
      renderer: null,
      canvas: null
    };

    this.simulations.push(slot);
    this.renderGrid();
    this.updatePlaybackControls();
  }

  removeSimulation(slotId) {
    const index = this.simulations.findIndex(s => s.id === slotId);
    if (index !== -1) {
      // Clean up
      const slot = this.simulations[index];
      if (slot.renderer) {
        slot.renderer.destroy?.();
      }
      
      this.simulations.splice(index, 1);
      this.renderGrid();
      this.updatePlaybackControls();
    }
  }

  renderGrid() {
    const grid = document.getElementById('comparison-grid');
    if (!grid) return;

    if (this.simulations.length === 0) {
      grid.innerHTML = `
        <div class="empty-comparison">
          <div class="empty-icon">🔬</div>
          <h4>No Simulations to Compare</h4>
          <p>Add simulations to start comparing their behavior</p>
          <button class="add-first-btn" id="add-first-simulation">
            Add First Simulation
          </button>
        </div>
      `;
      
      // Re-attach event listener
      const addFirstBtn = document.getElementById('add-first-simulation');
      if (addFirstBtn) {
        addFirstBtn.addEventListener('click', () => this.addSimulation());
      }
      
      return;
    }

    // Set grid layout based on number of simulations
    const gridClass = this.getGridClass();
    grid.className = `comparison-grid ${gridClass}`;

    grid.innerHTML = this.simulations.map(slot => `
      <div class="simulation-slot" data-slot-id="${slot.id}">
        <div class="slot-header">
          <h5>Simulation ${this.simulations.indexOf(slot) + 1}</h5>
          <div class="slot-controls">
            <button class="slot-btn config-btn" data-slot-id="${slot.id}" title="Configure">
              ⚙️
            </button>
            <button class="slot-btn remove-btn" data-slot-id="${slot.id}" title="Remove">
              ✕
            </button>
          </div>
        </div>
        <div class="slot-canvas-container">
          <canvas id="canvas-${slot.id}" class="slot-canvas"></canvas>
        </div>
        <div class="slot-info">
          <div class="info-item">
            <span class="info-label">Time:</span>
            <span class="info-value" id="time-${slot.id}">0.00</span>
          </div>
          <div class="info-item">
            <span class="info-label">Energy:</span>
            <span class="info-value" id="energy-${slot.id}">0.00</span>
          </div>
          <div class="info-item">
            <span class="info-label">Anomalies:</span>
            <span class="info-value" id="anomalies-${slot.id}">0</span>
          </div>
        </div>
        <div class="slot-parameters" id="params-${slot.id}">
          <details>
            <summary>Parameters</summary>
            <div class="params-list">
              <div class="param-item">
                <span>Symmetry:</span>
                <span id="param-symmetry-${slot.id}">0.5</span>
              </div>
              <div class="param-item">
                <span>Anomaly Prob:</span>
                <span id="param-anomaly-${slot.id}">0.1</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    `).join('');

    // Attach event listeners to slot controls
    grid.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotId = e.target.dataset.slotId;
        this.removeSimulation(slotId);
      });
    });

    grid.querySelectorAll('.config-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotId = e.target.dataset.slotId;
        this.configureSimulation(slotId);
      });
    });
  }

  getGridClass() {
    const count = this.simulations.length;
    if (count === 1) return 'grid-1';
    if (count === 2) return 'grid-2';
    if (count === 3) return 'grid-3';
    return 'grid-4';
  }

  updatePlaybackControls() {
    const playbackPanel = document.getElementById('comparison-playback');
    if (playbackPanel) {
      if (this.simulations.length > 0) {
        playbackPanel.classList.remove('hidden');
      } else {
        playbackPanel.classList.add('hidden');
      }
    }
  }

  toggleSync() {
    this.isSynced = !this.isSynced;
    
    const syncBtn = document.getElementById('sync-playback-btn');
    if (syncBtn) {
      syncBtn.classList.toggle('active', this.isSynced);
      syncBtn.textContent = this.isSynced ? '🔗 Sync Playback' : '🔓 Independent';
    }
  }

  playAll() {
    this.simulations.forEach(slot => {
      if (slot.simulation) {
        slot.simulation.start();
      }
    });
  }

  pauseAll() {
    this.simulations.forEach(slot => {
      if (slot.simulation) {
        slot.simulation.stop();
      }
    });
  }

  stepAll() {
    this.simulations.forEach(slot => {
      if (slot.simulation) {
        slot.simulation.step(slot.simulation.params.timeStep);
      }
    });
  }

  resetAll() {
    if (confirm('Reset all simulations?')) {
      this.simulations.forEach(slot => {
        if (slot.simulation) {
          slot.simulation.reset();
        }
      });
    }
  }

  seekAll(timeIndex) {
    if (!this.isSynced) return;

    this.simulations.forEach(slot => {
      if (slot.simulation && slot.simulation.history) {
        const history = slot.simulation.history;
        if (timeIndex >= 0 && timeIndex < history.length) {
          slot.simulation.restoreState(timeIndex);
        }
      }
    });

    // Update time display
    const timeDisplay = document.getElementById('sync-time');
    if (timeDisplay && this.simulations[0]?.simulation) {
      timeDisplay.textContent = this.simulations[0].simulation.time.toFixed(2);
    }
  }

  configureSimulation(slotId) {
    const slot = this.simulations.find(s => s.id === slotId);
    if (!slot) return;

    // Simple configuration dialog
    const symmetry = prompt('Symmetry Strength (0-1):', '0.5');
    const anomaly = prompt('Anomaly Probability (0-1):', '0.1');

    if (symmetry !== null && anomaly !== null) {
      if (slot.simulation) {
        slot.simulation.updateParameters({
          symmetryStrength: parseFloat(symmetry),
          anomalyProbability: parseFloat(anomaly)
        });
      }
      
      // Update display
      const paramSymmetry = document.getElementById(`param-symmetry-${slotId}`);
      const paramAnomaly = document.getElementById(`param-anomaly-${slotId}`);
      
      if (paramSymmetry) paramSymmetry.textContent = symmetry;
      if (paramAnomaly) paramAnomaly.textContent = anomaly;
    }
  }

  highlightDifferences() {
    if (this.simulations.length < 2) {
      alert('Need at least 2 simulations to compare');
      return;
    }

    const differences = this.detectDifferences();
    this.displayDifferences(differences);
  }

  detectDifferences() {
    const differences = [];

    // Compare parameters
    for (let i = 0; i < this.simulations.length - 1; i++) {
      for (let j = i + 1; j < this.simulations.length; j++) {
        const sim1 = this.simulations[i].simulation;
        const sim2 = this.simulations[j].simulation;

        if (!sim1 || !sim2) continue;

        const diff = {
          simulations: [i + 1, j + 1],
          type: 'parameters',
          details: []
        };

        // Compare key metrics
        if (Math.abs(sim1.time - sim2.time) > 0.1) {
          diff.details.push(`Time difference: ${Math.abs(sim1.time - sim2.time).toFixed(2)}`);
        }

        const energy1 = sim1.lattice.nodes.reduce((sum, n) => sum + n.energy, 0);
        const energy2 = sim2.lattice.nodes.reduce((sum, n) => sum + n.energy, 0);
        
        if (Math.abs(energy1 - energy2) > 1.0) {
          diff.details.push(`Energy difference: ${Math.abs(energy1 - energy2).toFixed(2)}`);
        }

        if (diff.details.length > 0) {
          differences.push(diff);
        }
      }
    }

    return differences;
  }

  displayDifferences(differences) {
    const panel = document.getElementById('differences-panel');
    const list = document.getElementById('differences-list');
    
    if (!panel || !list) return;

    if (differences.length === 0) {
      list.innerHTML = '<p class="no-differences">No significant differences detected</p>';
    } else {
      list.innerHTML = differences.map(diff => `
        <div class="difference-item">
          <h6>Simulations ${diff.simulations.join(' vs ')}</h6>
          <ul>
            ${diff.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }

    panel.classList.remove('hidden');
  }

  takeSnapshot() {
    const name = prompt('Snapshot name:', `Snapshot ${this.snapshots.size + 1}`);
    if (!name) return;

    const snapshot = {
      id: Date.now(),
      name: name,
      timestamp: new Date().toISOString(),
      states: this.simulations.map(slot => ({
        slotId: slot.id,
        state: slot.simulation ? this.captureState(slot.simulation) : null
      }))
    };

    this.snapshots.set(snapshot.id, snapshot);
    this.renderSnapshots();
  }

  captureState(simulation) {
    return {
      time: simulation.time,
      lattice: simulation.lattice.nodes.map(node => ({
        state: node.state,
        energy: node.energy,
        phase: node.phase
      })),
      parameters: { ...simulation.params }
    };
  }

  renderSnapshots() {
    const list = document.getElementById('snapshots-list');
    if (!list) return;

    if (this.snapshots.size === 0) {
      list.innerHTML = '<p class="empty-message">No snapshots yet</p>';
      return;
    }

    list.innerHTML = Array.from(this.snapshots.values()).map(snapshot => `
      <div class="snapshot-item">
        <div class="snapshot-info">
          <h6>${snapshot.name}</h6>
          <span class="snapshot-time">${new Date(snapshot.timestamp).toLocaleString()}</span>
        </div>
        <div class="snapshot-actions">
          <button class="snapshot-action-btn restore-btn" data-id="${snapshot.id}">
            ↺ Restore
          </button>
          <button class="snapshot-action-btn delete-snapshot-btn" data-id="${snapshot.id}">
            ✕
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    list.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.restoreSnapshot(id);
      });
    });

    list.querySelectorAll('.delete-snapshot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.deleteSnapshot(id);
      });
    });
  }

  restoreSnapshot(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return;

    snapshot.states.forEach((state, index) => {
      if (index < this.simulations.length && state.state) {
        const slot = this.simulations[index];
        if (slot.simulation) {
          this.restoreState(slot.simulation, state.state);
        }
      }
    });
  }

  restoreState(simulation, state) {
    simulation.time = state.time;
    simulation.params = { ...state.parameters };
    
    state.lattice.forEach((nodeState, index) => {
      if (index < simulation.lattice.nodes.length) {
        const node = simulation.lattice.nodes[index];
        node.state = nodeState.state;
        node.energy = nodeState.energy;
        node.phase = nodeState.phase;
      }
    });
  }

  deleteSnapshot(snapshotId) {
    if (confirm('Delete this snapshot?')) {
      this.snapshots.delete(snapshotId);
      this.renderSnapshots();
    }
  }

  generateComparisonReport() {
    if (this.simulations.length === 0) {
      alert('No simulations to compare');
      return;
    }

    const report = this.createComparisonReport();
    this.downloadReport(report);
  }

  createComparisonReport() {
    const date = new Date().toLocaleDateString();
    
    let report = `# Simulation Comparison Report\n\n`;
    report += `**Generated:** ${date}\n\n`;
    report += `**Number of Simulations:** ${this.simulations.length}\n\n`;

    report += `## Simulations Overview\n\n`;
    this.simulations.forEach((slot, index) => {
      if (slot.simulation) {
        const sim = slot.simulation;
        report += `### Simulation ${index + 1}\n`;
        report += `- Time: ${sim.time.toFixed(2)}\n`;
        report += `- Symmetry Strength: ${sim.params.symmetryStrength}\n`;
        report += `- Anomaly Probability: ${sim.params.anomalyProbability}\n`;
        report += `- Total Energy: ${sim.lattice.nodes.reduce((sum, n) => sum + n.energy, 0).toFixed(2)}\n\n`;
      }
    });

    const differences = this.detectDifferences();
    if (differences.length > 0) {
      report += `## Detected Differences\n\n`;
      differences.forEach(diff => {
        report += `### Simulations ${diff.simulations.join(' vs ')}\n`;
        diff.details.forEach(detail => {
          report += `- ${detail}\n`;
        });
        report += `\n`;
      });
    }

    report += `## Snapshots\n\n`;
    report += `Total snapshots taken: ${this.snapshots.size}\n`;

    return report;
  }

  downloadReport(content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison-report-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  update() {
    // Update info displays for each simulation
    this.simulations.forEach(slot => {
      if (!slot.simulation) return;

      const sim = slot.simulation;
      const timeEl = document.getElementById(`time-${slot.id}`);
      const energyEl = document.getElementById(`energy-${slot.id}`);
      const anomaliesEl = document.getElementById(`anomalies-${slot.id}`);

      if (timeEl) timeEl.textContent = sim.time.toFixed(2);
      
      if (energyEl) {
        const energy = sim.lattice.nodes.reduce((sum, n) => sum + n.energy, 0);
        energyEl.textContent = energy.toFixed(2);
      }
      
      if (anomaliesEl) {
        const anomalies = sim.lattice.nodes.filter(n => n.state === 'anomaly').length;
        anomaliesEl.textContent = anomalies;
      }
    });
  }
}
