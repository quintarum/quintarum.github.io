// @ts-nocheck
/* eslint-disable */
/**
 * Analytics Dashboard
 * Real-time visualization of simulation metrics using Chart.js
 */
export class AnalyticsDashboard {
  constructor(simulation, metricsCollector) {
    this.simulation = simulation;
    this.metrics = metricsCollector;
    this.charts = new Map();
    this.updateInterval = null;
    this.isVisible = true;
    this.layout = 'default'; // default, compact, detailed
    
    this.createUI();
    this.initializeCharts();
    this.attachEventListeners();
  }

  createUI() {
    const dashboardContainer = document.getElementById('analytics-dashboard');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = `
      <div class="dashboard-panel">
        <div class="dashboard-header">
          <h3>Analytics Dashboard</h3>
          <div class="dashboard-controls">
            <select id="layout-selector" class="layout-select">
              <option value="default">Default Layout</option>
              <option value="compact">Compact View</option>
              <option value="detailed">Detailed View</option>
            </select>
            <button id="export-data-btn" class="dashboard-btn" title="Export Data">
              📊 Export
            </button>
            <button id="toggle-dashboard-btn" class="dashboard-btn" title="Toggle Dashboard">
              ▼
            </button>
          </div>
        </div>

        <div class="dashboard-content" id="dashboard-content">
          <div class="dashboard-grid" id="dashboard-grid">
            <!-- Statistics Summary -->
            <div class="dashboard-card stats-card">
              <h4>Statistics Summary</h4>
              <div class="stats-grid" id="stats-summary">
                <div class="stat-item">
                  <span class="stat-label">Total Energy</span>
                  <span class="stat-value" id="stat-energy">0.00</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Symmetry Ratio</span>
                  <span class="stat-value" id="stat-symmetry">0.00</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Anomaly Count</span>
                  <span class="stat-value" id="stat-anomalies">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Entropy</span>
                  <span class="stat-value" id="stat-entropy">0.00</span>
                </div>
              </div>
            </div>

            <!-- Energy Distribution Chart -->
            <div class="dashboard-card chart-card">
              <h4>Energy Distribution</h4>
              <canvas id="energy-chart"></canvas>
            </div>

            <!-- Symmetry Ratio Time Series -->
            <div class="dashboard-card chart-card">
              <h4>Symmetry Ratio Over Time</h4>
              <canvas id="symmetry-chart"></canvas>
            </div>

            <!-- Anomaly Count Tracker -->
            <div class="dashboard-card chart-card">
              <h4>Anomaly Count</h4>
              <canvas id="anomaly-chart"></canvas>
            </div>

            <!-- Phase Diagram -->
            <div class="dashboard-card chart-card">
              <h4>Phase Diagram</h4>
              <canvas id="phase-chart"></canvas>
            </div>

            <!-- Detailed Statistics -->
            <div class="dashboard-card detailed-stats-card">
              <h4>Detailed Metrics</h4>
              <div class="detailed-stats" id="detailed-stats">
                <div class="stat-row">
                  <span class="stat-name">Mean Energy:</span>
                  <span class="stat-data" id="mean-energy">0.00</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Energy Variance:</span>
                  <span class="stat-data" id="variance-energy">0.00</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Max Energy:</span>
                  <span class="stat-data" id="max-energy">0.00</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Anomaly Density:</span>
                  <span class="stat-data" id="anomaly-density">0.00%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Propagation Rate:</span>
                  <span class="stat-data" id="propagation-rate">0.00</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Correlation Length:</span>
                  <span class="stat-data" id="correlation-length">0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initializeCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded. Charts will not be displayed.');
      return;
    }

    // Energy Distribution Chart (Bar)
    this.createEnergyChart();

    // Symmetry Ratio Time Series (Line)
    this.createSymmetryChart();

    // Anomaly Count Tracker (Line)
    this.createAnomalyChart();

    // Phase Diagram (Scatter)
    this.createPhaseChart();
  }

  createEnergyChart() {
    const canvas = document.getElementById('energy-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Energy Distribution',
          data: [],
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Energy Level'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    this.charts.set('energy', chart);
  }

  createSymmetryChart() {
    const canvas = document.getElementById('symmetry-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Symmetry Ratio',
          data: [],
          borderColor: 'rgba(33, 150, 243, 1)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: 'Ratio'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    this.charts.set('symmetry', chart);
  }

  createAnomalyChart() {
    const canvas = document.getElementById('anomaly-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Anomaly Count',
          data: [],
          borderColor: 'rgba(244, 67, 54, 1)',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    this.charts.set('anomaly', chart);
  }

  createPhaseChart() {
    const canvas = document.getElementById('phase-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Phase Space',
          data: [],
          backgroundColor: 'rgba(156, 39, 176, 0.6)',
          borderColor: 'rgba(156, 39, 176, 1)',
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Energy'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Symmetry'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    this.charts.set('phase', chart);
  }

  attachEventListeners() {
    // Layout selector
    const layoutSelector = document.getElementById('layout-selector');
    if (layoutSelector) {
      layoutSelector.addEventListener('change', (e) => this.changeLayout(e.target.value));
    }

    // Export data button
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    // Toggle dashboard
    const toggleBtn = document.getElementById('toggle-dashboard-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleDashboard());
    }
  }

  update() {
    if (!this.metrics || !this.isVisible) return;

    const currentMetrics = this.metrics.collect();
    if (!currentMetrics) return;

    // Update statistics summary
    this.updateStatsSummary(currentMetrics);

    // Update detailed statistics
    this.updateDetailedStats(currentMetrics);

    // Update charts
    this.updateCharts(currentMetrics);
  }

  updateStatsSummary(metrics) {
    const elements = {
      energy: document.getElementById('stat-energy'),
      symmetry: document.getElementById('stat-symmetry'),
      anomalies: document.getElementById('stat-anomalies'),
      entropy: document.getElementById('stat-entropy')
    };

    if (elements.energy) {
      elements.energy.textContent = metrics.energy.total.toFixed(2);
    }
    if (elements.symmetry) {
      elements.symmetry.textContent = metrics.symmetry.ratio.toFixed(3);
    }
    if (elements.anomalies) {
      elements.anomalies.textContent = metrics.anomalies.count;
    }
    if (elements.entropy) {
      elements.entropy.textContent = metrics.entropy.toFixed(3);
    }
  }

  updateDetailedStats(metrics) {
    const stats = this.metrics.calculateStatistics();

    const elements = {
      meanEnergy: document.getElementById('mean-energy'),
      varianceEnergy: document.getElementById('variance-energy'),
      maxEnergy: document.getElementById('max-energy'),
      anomalyDensity: document.getElementById('anomaly-density'),
      propagationRate: document.getElementById('propagation-rate'),
      correlationLength: document.getElementById('correlation-length')
    };

    if (elements.meanEnergy) {
      elements.meanEnergy.textContent = stats.energy.mean.toFixed(3);
    }
    if (elements.varianceEnergy) {
      elements.varianceEnergy.textContent = stats.energy.variance.toFixed(3);
    }
    if (elements.maxEnergy) {
      elements.maxEnergy.textContent = stats.energy.max.toFixed(3);
    }
    if (elements.anomalyDensity) {
      const density = (metrics.anomalies.density * 100).toFixed(2);
      elements.anomalyDensity.textContent = `${density}%`;
    }
    if (elements.propagationRate) {
      elements.propagationRate.textContent = metrics.anomalies.propagationRate.toFixed(3);
    }
    if (elements.correlationLength) {
      elements.correlationLength.textContent = metrics.correlationLength.toFixed(2);
    }
  }

  updateCharts(metrics) {
    const history = this.metrics.history;
    const maxPoints = 100;

    // Update Energy Distribution Chart
    const energyChart = this.charts.get('energy');
    if (energyChart && metrics.energy.distribution) {
      const distribution = metrics.energy.distribution;
      energyChart.data.labels = distribution.map((_, i) => i.toFixed(1));
      energyChart.data.datasets[0].data = distribution;
      energyChart.update('none');
    }

    // Update Symmetry Ratio Chart
    const symmetryChart = this.charts.get('symmetry');
    if (symmetryChart && history.symmetry) {
      const data = history.symmetry.slice(-maxPoints);
      symmetryChart.data.labels = data.map((_, i) => i);
      symmetryChart.data.datasets[0].data = data.map(d => d.ratio);
      symmetryChart.update('none');
    }

    // Update Anomaly Count Chart
    const anomalyChart = this.charts.get('anomaly');
    if (anomalyChart && history.anomalies) {
      const data = history.anomalies.slice(-maxPoints);
      anomalyChart.data.labels = data.map((_, i) => i);
      anomalyChart.data.datasets[0].data = data.map(d => d.count);
      anomalyChart.update('none');
    }

    // Update Phase Diagram
    const phaseChart = this.charts.get('phase');
    if (phaseChart && history.energy && history.symmetry) {
      const points = [];
      const length = Math.min(history.energy.length, history.symmetry.length, maxPoints);
      
      for (let i = Math.max(0, history.energy.length - length); i < history.energy.length; i++) {
        points.push({
          x: history.symmetry[i]?.ratio || 0,
          y: history.energy[i]?.total || 0
        });
      }
      
      phaseChart.data.datasets[0].data = points;
      phaseChart.update('none');
    }
  }

  changeLayout(layout) {
    this.layout = layout;
    const grid = document.getElementById('dashboard-grid');
    if (!grid) return;

    grid.className = 'dashboard-grid';
    grid.classList.add(`layout-${layout}`);
  }

  toggleDashboard() {
    const content = document.getElementById('dashboard-content');
    const toggleBtn = document.getElementById('toggle-dashboard-btn');
    
    if (content && toggleBtn) {
      this.isVisible = !this.isVisible;
      content.style.display = this.isVisible ? 'block' : 'none';
      toggleBtn.textContent = this.isVisible ? '▼' : '▲';
    }
  }

  exportData() {
    if (!this.metrics) return;

    const format = prompt('Export format (csv/json):', 'csv');
    if (!format) return;

    if (format.toLowerCase() === 'csv') {
      this.exportCSV();
    } else if (format.toLowerCase() === 'json') {
      this.exportJSON();
    } else {
      alert('Invalid format. Please choose csv or json.');
    }
  }

  exportCSV() {
    const history = this.metrics.history;
    if (!history || history.energy.length === 0) {
      alert('No data to export');
      return;
    }

    let csv = 'Time,Total Energy,Symmetry Ratio,Anomaly Count,Entropy\n';
    
    const length = history.energy.length;
    for (let i = 0; i < length; i++) {
      const row = [
        i,
        history.energy[i]?.total || 0,
        history.symmetry[i]?.ratio || 0,
        history.anomalies[i]?.count || 0,
        history.entropy[i] || 0
      ];
      csv += row.join(',') + '\n';
    }

    this.downloadFile(csv, 'simulation-data.csv', 'text/csv');
  }

  exportJSON() {
    const data = {
      timestamp: new Date().toISOString(),
      simulation: {
        time: this.simulation?.time || 0,
        parameters: this.simulation?.params || {}
      },
      metrics: this.metrics.history,
      statistics: this.metrics.calculateStatistics()
    };

    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, 'simulation-data.json', 'application/json');
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  startAutoUpdate(interval = 1000) {
    this.stopAutoUpdate();
    this.updateInterval = setInterval(() => this.update(), interval);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  destroy() {
    this.stopAutoUpdate();
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}
