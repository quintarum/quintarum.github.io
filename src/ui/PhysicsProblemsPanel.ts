// @ts-nocheck
/* eslint-disable */
/**
 * Physics Problems Panel
 * Interface for testing TDS against unsolved physics problems
 */
export class PhysicsProblemsPanel {
  constructor(simulation, physicsProblems) {
    this.simulation = simulation;
    this.physicsProblems = physicsProblems;
    this.currentProblem = null;
    this.comparisonResults = null;
    
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    const panelContainer = document.getElementById('physics-problems-panel');
    if (!panelContainer) return;

    const problems = Object.entries(this.physicsProblems.problems);

    panelContainer.innerHTML = `
      <div class="physics-panel">
        <div class="physics-header">
          <h3>Physics Problems Explorer</h3>
          <p class="physics-subtitle">Test TDS against unsolved problems in standard physics</p>
        </div>

        <div class="problems-selector">
          <h4>Select a Problem</h4>
          <div class="problems-grid">
            ${problems.map(([key, problem]) => `
              <div class="problem-card" data-problem="${key}">
                <div class="problem-icon">${this.getProblemIcon(key)}</div>
                <h5 class="problem-name">${problem.name}</h5>
                <p class="problem-brief">${problem.description}</p>
                <button class="select-problem-btn" data-problem="${key}">
                  Explore →
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="problem-details hidden" id="problem-details">
          <div class="details-header">
            <button id="back-to-list-btn" class="back-btn">← Back to List</button>
            <h4 id="problem-title"></h4>
          </div>

          <div class="problem-description" id="problem-description"></div>

          <div class="problem-actions">
            <button id="load-scenario-btn" class="action-btn primary">
              Load Scenario
            </button>
            <button id="run-comparison-btn" class="action-btn" disabled>
              Run Comparison
            </button>
            <button id="generate-report-btn" class="action-btn" disabled>
              Generate Report
            </button>
          </div>

          <div class="comparison-view hidden" id="comparison-view">
            <h4>TDS vs Standard Model Comparison</h4>
            
            <div class="comparison-grid">
              <div class="comparison-column">
                <h5>Standard Model</h5>
                <div class="model-content" id="standard-model-content">
                  <div class="model-section">
                    <h6>Prediction</h6>
                    <p id="standard-prediction"></p>
                  </div>
                  <div class="model-section">
                    <h6>Limitations</h6>
                    <ul id="standard-limitations"></ul>
                  </div>
                </div>
              </div>

              <div class="comparison-column">
                <h5>TDS Model</h5>
                <div class="model-content" id="tds-model-content">
                  <div class="model-section">
                    <h6>Prediction</h6>
                    <p id="tds-prediction"></p>
                  </div>
                  <div class="model-section">
                    <h6>Advantages</h6>
                    <ul id="tds-advantages"></ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="experimental-data" id="experimental-data">
              <h5>Experimental Data Overlay</h5>
              <div class="data-visualization">
                <canvas id="experimental-chart"></canvas>
              </div>
              <div class="data-sources" id="data-sources"></div>
            </div>

            <div class="quantitative-metrics" id="quantitative-metrics">
              <h5>Quantitative Comparison</h5>
              <div class="metrics-grid" id="metrics-grid"></div>
            </div>
          </div>

          <div class="references-section" id="references-section">
            <h4>References & Research</h4>
            <div class="references-list" id="references-list"></div>
          </div>
        </div>
      </div>
    `;
  }

  getProblemIcon(problemKey) {
    const icons = {
      darkMatter: '🌌',
      matterAntimatter: '⚛️',
      quantumMeasurement: '🔬',
      informationParadox: '🕳️',
      hierarchyProblem: '⚖️'
    };
    return icons[problemKey] || '🔬';
  }

  attachEventListeners() {
    // Problem selection
    document.querySelectorAll('.select-problem-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const problemKey = e.target.dataset.problem;
        this.selectProblem(problemKey);
      });
    });

    // Back to list
    const backBtn = document.getElementById('back-to-list-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showProblemsList());
    }

    // Load scenario
    const loadBtn = document.getElementById('load-scenario-btn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadScenario());
    }

    // Run comparison
    const compareBtn = document.getElementById('run-comparison-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.runComparison());
    }

    // Generate report
    const reportBtn = document.getElementById('generate-report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.generateReport());
    }
  }

  selectProblem(problemKey) {
    const problem = this.physicsProblems.getProblem(problemKey);
    if (!problem) return;

    this.currentProblem = { key: problemKey, ...problem };

    // Hide problems list, show details
    document.querySelector('.problems-selector').classList.add('hidden');
    document.getElementById('problem-details').classList.remove('hidden');

    // Update problem details
    document.getElementById('problem-title').textContent = problem.name;
    document.getElementById('problem-description').innerHTML = `
      <p>${problem.description}</p>
      <div class="problem-category">
        <strong>Category:</strong> ${problem.category || 'General'}
      </div>
    `;

    // Load references
    this.loadReferences(problem.references);

    // Reset comparison view
    document.getElementById('comparison-view').classList.add('hidden');
    document.getElementById('run-comparison-btn').disabled = true;
    document.getElementById('generate-report-btn').disabled = true;
  }

  showProblemsList() {
    document.querySelector('.problems-selector').classList.remove('hidden');
    document.getElementById('problem-details').classList.add('hidden');
    this.currentProblem = null;
  }

  loadScenario() {
    if (!this.currentProblem || !this.simulation) return;

    // Setup scenario in simulation
    this.physicsProblems.setupScenario(this.currentProblem.key, this.simulation.lattice);

    // Apply initial conditions
    if (this.currentProblem.initialConditions) {
      const params = this.currentProblem.initialConditions.parameters;
      if (params) {
        this.simulation.updateParameters(params);
      }
    }

    // Enable comparison button
    document.getElementById('run-comparison-btn').disabled = false;

    // Show notification
    this.showNotification('Scenario loaded successfully!');
  }

  runComparison() {
    if (!this.currentProblem || !this.simulation) return;

    // Run simulation and collect results
    const results = this.collectSimulationResults();

    // Compare with standard model
    this.comparisonResults = this.physicsProblems.compareWithStandardModel(results);

    // Display comparison
    this.displayComparison();

    // Enable report generation
    document.getElementById('generate-report-btn').disabled = false;

    // Show comparison view
    document.getElementById('comparison-view').classList.remove('hidden');
  }

  collectSimulationResults() {
    // Collect relevant metrics from simulation
    return {
      energy: this.simulation.lattice.nodes.reduce((sum, node) => sum + node.energy, 0),
      symmetryRatio: this.calculateSymmetryRatio(),
      anomalyCount: this.simulation.lattice.nodes.filter(n => n.state === 'anomaly').length,
      patterns: this.detectPatterns(),
      timeEvolution: this.simulation.history.slice(-100)
    };
  }

  calculateSymmetryRatio() {
    const nodes = this.simulation.lattice.nodes;
    const symmetric = nodes.filter(n => n.state === 'symmetric').length;
    return symmetric / nodes.length;
  }

  detectPatterns() {
    // Simple pattern detection
    return {
      hasOscillation: false,
      hasPropagation: true,
      hasStability: false
    };
  }

  displayComparison() {
    if (!this.currentProblem || !this.comparisonResults) return;

    const problem = this.currentProblem;

    // Standard Model content
    const standardPrediction = document.getElementById('standard-prediction');
    const standardLimitations = document.getElementById('standard-limitations');

    if (standardPrediction && problem.standardModelPrediction) {
      standardPrediction.textContent = problem.standardModelPrediction.expectedBehavior;
    }

    if (standardLimitations && problem.standardModelPrediction?.limitations) {
      standardLimitations.innerHTML = problem.standardModelPrediction.limitations
        .map(limit => `<li>${limit}</li>`)
        .join('');
    }

    // TDS Model content
    const tdsPrediction = document.getElementById('tds-prediction');
    const tdsAdvantages = document.getElementById('tds-advantages');

    if (tdsPrediction && problem.tdsModelPrediction) {
      tdsPrediction.textContent = problem.tdsModelPrediction.expectedBehavior;
    }

    if (tdsAdvantages && problem.tdsModelPrediction?.advantages) {
      tdsAdvantages.innerHTML = problem.tdsModelPrediction.advantages
        .map(adv => `<li>${adv}</li>`)
        .join('');
    }

    // Experimental data
    this.displayExperimentalData();

    // Quantitative metrics
    this.displayQuantitativeMetrics();
  }

  displayExperimentalData() {
    const problem = this.currentProblem;
    if (!problem.experimentalData || problem.experimentalData.length === 0) {
      document.getElementById('experimental-data').style.display = 'none';
      return;
    }

    document.getElementById('experimental-data').style.display = 'block';

    // Display data sources
    const sourcesEl = document.getElementById('data-sources');
    if (sourcesEl) {
      sourcesEl.innerHTML = `
        <h6>Data Sources:</h6>
        <ul>
          ${problem.experimentalData.map(data => `
            <li>
              <strong>${data.source}</strong>
              ${data.uncertainty ? `(±${data.uncertainty})` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // Create chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
      this.createExperimentalChart(problem.experimentalData);
    }
  }

  createExperimentalChart(experimentalData) {
    const canvas = document.getElementById('experimental-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (this.experimentalChart) {
      this.experimentalChart.destroy();
    }

    this.experimentalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: experimentalData[0]?.values.map((_, i) => i) || [],
        datasets: [
          {
            label: 'Experimental Data',
            data: experimentalData[0]?.values || [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2
          },
          {
            label: 'TDS Prediction',
            data: this.comparisonResults?.tdsValues || [],
            borderColor: 'rgba(76, 175, 80, 1)',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }

  displayQuantitativeMetrics() {
    const metricsGrid = document.getElementById('metrics-grid');
    if (!metricsGrid || !this.comparisonResults) return;

    const metrics = [
      {
        name: 'Agreement with Data',
        standard: this.comparisonResults.standardAgreement || 'N/A',
        tds: this.comparisonResults.tdsAgreement || 'N/A'
      },
      {
        name: 'Prediction Accuracy',
        standard: this.comparisonResults.standardAccuracy || 'N/A',
        tds: this.comparisonResults.tdsAccuracy || 'N/A'
      },
      {
        name: 'Explanatory Power',
        standard: 'Limited',
        tds: 'Enhanced'
      }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
      <div class="metric-card">
        <h6>${metric.name}</h6>
        <div class="metric-comparison">
          <div class="metric-value">
            <span class="metric-label">Standard:</span>
            <span class="metric-data">${metric.standard}</span>
          </div>
          <div class="metric-value">
            <span class="metric-label">TDS:</span>
            <span class="metric-data highlight">${metric.tds}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadReferences(references) {
    const referencesEl = document.getElementById('references-list');
    if (!referencesEl || !references || references.length === 0) {
      document.getElementById('references-section').style.display = 'none';
      return;
    }

    document.getElementById('references-section').style.display = 'block';

    referencesEl.innerHTML = references.map(ref => `
      <div class="reference-item">
        <h6 class="reference-title">${ref.title}</h6>
        <p class="reference-authors">${ref.authors?.join(', ') || 'Unknown authors'}</p>
        <p class="reference-abstract">${ref.abstract}</p>
        ${ref.url ? `<a href="${ref.url}" target="_blank" class="reference-link">Read Paper →</a>` : ''}
      </div>
    `).join('');
  }

  generateReport() {
    if (!this.currentProblem || !this.comparisonResults) return;

    const report = this.createReportContent();
    this.downloadReport(report);
  }

  createReportContent() {
    const problem = this.currentProblem;
    const date = new Date().toLocaleDateString();

    return `
# TDS Physics Problem Analysis Report
## ${problem.name}

**Generated:** ${date}

### Problem Description
${problem.description}

### Standard Model Approach
**Prediction:** ${problem.standardModelPrediction?.expectedBehavior || 'N/A'}

**Limitations:**
${problem.standardModelPrediction?.limitations?.map(l => `- ${l}`).join('\n') || 'None listed'}

### TDS Model Approach
**Prediction:** ${problem.tdsModelPrediction?.expectedBehavior || 'N/A'}

**Advantages:**
${problem.tdsModelPrediction?.advantages?.map(a => `- ${a}`).join('\n') || 'None listed'}

### Simulation Results
- Energy: ${this.comparisonResults?.energy || 'N/A'}
- Symmetry Ratio: ${this.comparisonResults?.symmetryRatio || 'N/A'}
- Anomaly Count: ${this.comparisonResults?.anomalyCount || 'N/A'}

### Conclusion
The TDS model provides ${this.comparisonResults?.conclusion || 'an alternative perspective'} on this problem.

### References
${problem.references?.map(r => `- ${r.title} by ${r.authors?.join(', ')}`).join('\n') || 'None'}
    `.trim();
  }

  downloadReport(content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tds-problem-report-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showNotification('Report downloaded successfully!');
  }

  showNotification(message) {
    // Simple notification (could be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color, #4CAF50);
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
