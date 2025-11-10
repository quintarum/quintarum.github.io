/**
 * TDS Web Simulation - Main Entry Point
 * Theory of Dynamic Symmetry Interactive Visualization
 */

import { Lattice } from './core/Lattice.js';
import { Simulation } from './core/Simulation.js';
import { Renderer2D } from './rendering/Renderer2D.js';
import { initI18n, t } from './i18n/i18n.js';
import { DataExporter } from './utils/DataExporter.js';
import { AdvancedAnalytics } from './analytics/AdvancedAnalytics.js';
import { SpectrumColorizer } from './rendering/SpectrumColorizer.js';
import { AuthorPhysics } from './core/AuthorPhysics.js';
import { TDSCharts } from './ui/TDSCharts.js';
import { ParameterControls } from './ui/ParameterControls.js';
import { TheoryPanel } from './ui/TheoryPanel.js';

interface AppInstance {
  simulation: Simulation | null;
  renderer: Renderer2D | null;
  lattice: Lattice | null;
  isRunning: boolean;
  animationId: number | null;
  analytics: AdvancedAnalytics | null;
  colorizer: SpectrumColorizer | null;
  useSpectrumColors: boolean;
  authorPhysics: AuthorPhysics | null;
  useAuthorMode: boolean;
  tdsCharts: TDSCharts | null;
  paramControls: ParameterControls | null;
}

declare global {
  interface Window {
    app: AppInstance;
  }
}

// Global app instance
window.app = {
  simulation: null,
  renderer: null,
  lattice: null,
  isRunning: false,
  animationId: null,
  analytics: null,
  colorizer: null,
  useSpectrumColors: false,
  authorPhysics: null,
  useAuthorMode: false,
  tdsCharts: null,
  paramControls: null
};

// Initialize application
function initApp(): void {
  // eslint-disable-next-line no-console
  console.log('🚀 Initializing TDS Web Simulation...');

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'simulation-canvas';
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '1px solid #ccc';
  canvas.style.display = 'block';
  canvas.style.margin = '20px auto';

  // Create lattice
  const lattice = new Lattice(20, 20, 1);
  window.app.lattice = lattice;

  // Create simulation with parameters that show anomaly propagation
  const simulation = new Simulation(lattice, {
    symmetryStrength: 0.3, // Lower = more transitions
    anomalyProbability: 0.4, // Higher = anomalies spread more
    energyThreshold: 1.5, // Lower = easier to create anomalies
    interactionRange: 3,
    waveSpeed: 0.5,
    timeStep: 1.0
  });
  window.app.simulation = simulation;

  // Create renderer
  const renderer = new Renderer2D(canvas, {
    showGrid: true,
    showConnections: true,
    showMiniMap: true,
    nodeSize: 8
  });
  renderer.initialize(canvas.width, canvas.height);
  window.app.renderer = renderer;

  // Create advanced analytics
  const analytics = new AdvancedAnalytics({
    kx: 6,
    latticeSize: lattice.width,
    E_0_ref: 1.0,
    maxLogEntries: 1500
  });
  window.app.analytics = analytics;

  // Create spectrum colorizer (simple mode by default)
  const colorizer = SpectrumColorizer.createSimple(lattice.width);
  window.app.colorizer = colorizer;

  // Create author physics engine
  const authorPhysics = new AuthorPhysics(lattice.width, 6);
  window.app.authorPhysics = authorPhysics;

  // Create TDS Charts
  const tdsCharts = new TDSCharts();
  window.app.tdsCharts = tdsCharts;

  // Create Parameter Controls
  const paramControls = new ParameterControls({
    J: 1.0,
    E_0: 1.0,
    tolerance: 1e-6,
    k_x: 6,
    timeStep: 1.0
  });
  window.app.paramControls = paramControls;

  // Create UI
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="font-family: sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 20px; box-sizing: border-box;">
        <div style="max-width: 1400px; margin: 0 auto;">
          <h1 style="color: #E74C3C; margin: 0 0 5px 0; text-align: center;">${t('app.title')}</h1>
          <p style="color: #aaa; margin: 0 0 5px 0; text-align: center;">${t('app.subtitle')}</p>
          <p style="color: #888; margin: 0 0 20px 0; text-align: center; font-size: 13px;">
            <a href="https://doi.org/10.5281/zenodo.17465190" target="_blank" rel="noopener noreferrer" style="color: #4CAF50; text-decoration: none;">
              ${t('theory.readTheory')}
            </a>
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start;">
            <!-- Left column: Canvas and controls -->
            <div>
              <div id="canvas-container" style="background: #0f3460; border-radius: 8px; padding: 10px; margin-bottom: 15px;"></div>
              
              <div style="text-align: center; margin-bottom: 15px;">
                <button id="play-pause-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; transition: all 0.2s;">
                  ▶ ${t('controls.start')}
                </button>
                <button id="reset-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 16px; transition: all 0.2s;">
                  ↻ ${t('controls.reset')}
                </button>
                <button id="anomaly-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #E74C3C; color: white; border: none; border-radius: 4px; font-size: 16px; transition: all 0.2s;">
                  ⚡ ${t('controls.addAnomaly')}
                </button>
              </div>
              
              <div style="text-align: center; margin-bottom: 15px;">
                <button id="auto-anomaly-btn" style="padding: 10px 20px; cursor: pointer; background: #0f3460; color: #aaa; border: 2px solid #2c5f8d; border-radius: 4px; font-size: 14px; transition: all 0.2s; width: 100%; max-width: 400px;">
                  🔄 ${t('controls.autoAnomaliesOff')}
                </button>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">${t('legend.title')}</h3>
                <div style="display: flex; gap: 20px; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #4CAF50; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">${t('legend.symmetric')}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #FFC107; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">${t('legend.asymmetric')}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #F44336; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">${t('legend.anomaly')}</span>
                  </div>
                </div>
              </div>
              
              <!-- Parameter Controls Panel -->
              <div id="parameter-controls-container"></div>
            </div>
            
            <!-- Right column: Stats and chart -->
            <div>
              <div id="stats" style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">${t('stats.title')}</h3>
                <div id="stats-content"></div>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <canvas id="energy-chart" style="width: 100%; height: 200px;"></canvas>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <canvas id="conservation-chart" style="width: 100%; height: 180px;"></canvas>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">⚡ TDS Metrics</h3>
                <div id="tds-metrics" style="font-size: 13px; color: #ccc; line-height: 1.8;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><strong>E_sym:</strong></div>
                    <div id="e-sym-value" style="text-align: right; font-family: monospace;">--</div>
                    <div><strong>E_asym:</strong></div>
                    <div id="e-asym-value" style="text-align: right; font-family: monospace;">--</div>
                    <div><strong>E_0:</strong></div>
                    <div id="e-0-value" style="text-align: right; font-family: monospace;">--</div>
                    <div style="grid-column: 1 / -1; height: 1px; background: #0f3460; margin: 4px 0;"></div>
                    <div><strong>T_info:</strong></div>
                    <div id="t-info-value" style="text-align: right; font-family: monospace;">--</div>
                    <div><strong>Phase φ:</strong></div>
                    <div id="phase-value" style="text-align: right; font-family: monospace;">--</div>
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #0f3460; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>E_sym + E_asym:</span>
                      <span id="conservation-check" style="font-family: monospace;">--</span>
                    </div>
                    <div style="margin-top: 4px; font-size: 11px; color: #888;">
                      Should equal E_0 (conservation law)
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">🔬 Advanced Analytics</h3>
                <div id="advanced-stats" style="font-size: 13px; color: #ccc; line-height: 1.8;">
                  <div><strong>ρ(E_sym, E_asym):</strong> <span id="correlation-value">--</span></div>
                  <div><strong>Energy Drift:</strong> <span id="drift-value">--</span></div>
                  <div><strong>RMS A_kx:</strong> <span id="rms-akx-value">--</span></div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #0f3460;">
                    <strong>Conservation:</strong> <span id="conservation-status" style="color: #4CAF50;">✓ Good</span>
                  </div>
                </div>
                <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button id="run-photon-test-btn" style="padding: 8px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🔄 Photon Test
                  </button>
                  <button id="toggle-spectrum-btn" style="padding: 8px; background: #0f3460; color: #aaa; border: 2px solid #2c5f8d; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🌈 Spectrum
                  </button>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #0f3460;">
                  <button id="toggle-author-mode-btn" style="padding: 8px; width: 100%; background: #0f3460; color: #aaa; border: 2px solid #2c5f8d; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🔬 Author Mode OFF
                  </button>
                  <div style="font-size: 11px; color: #888; margin-top: 4px; text-align: center;">
                    Exact reference implementation
                  </div>
                </div>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">📊 ${t('export.title')}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button id="export-csv-btn" style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                    📄 ${t('export.csv')}
                  </button>
                  <button id="export-json-btn" style="padding: 10px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                    📋 ${t('export.json')}
                  </button>
                  <button id="export-chart-btn" style="padding: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                    📈 ${t('export.chart')}
                  </button>
                  <button id="export-pdf-btn" style="padding: 10px; background: #F44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;">
                    📑 ${t('export.pdf')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          ${TheoryPanel.createHTML()}
        </div>
      </div>
    `;

    document.getElementById('canvas-container')?.appendChild(canvas);
  }

  // Initialize TDS Charts
  tdsCharts.initEnergyChart('energy-chart');
  tdsCharts.initConservationChart('conservation-chart');

  // Initialize Parameter Controls
  const paramContainer = document.getElementById('parameter-controls-container');
  if (paramContainer) {
    paramContainer.innerHTML = paramControls.createHTML();
    paramControls.attachListeners();
    
    // Handle parameter changes
    paramControls.setOnChange((params) => {
      // Update analytics k_x
      if (window.app.analytics) {
        window.app.analytics.setKx(params.k_x);
      }
      
      // Update author physics k_x
      if (window.app.authorPhysics) {
        window.app.authorPhysics.setKx(params.k_x);
      }
      
      // Update simulation time step
      if (window.app.simulation) {
        window.app.simulation.params.timeStep = params.timeStep;
      }
      
      // eslint-disable-next-line no-console
      console.log('TDS Parameters updated:', params);
    });
  }

  // Set up controls
  setupControls(simulation, renderer, lattice);

  // Start animation loop
  startAnimationLoop(simulation, renderer, lattice);
}

function setupControls(simulation: Simulation, renderer: Renderer2D, lattice: Lattice): void {
  const playPauseBtn = document.getElementById('play-pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const anomalyBtn = document.getElementById('anomaly-btn');
  const autoAnomalyBtn = document.getElementById('auto-anomaly-btn');

  let anomalyCount = 0;
  let autoAnomalyInterval: number | null = null;
  let autoAnomalyEnabled = false;

  // Function to create anomaly
  const createAnomaly = () => {
    anomalyCount++;
    // Random position near center
    const cx = Math.floor(lattice.width / 2) + Math.floor(Math.random() * 6 - 3);
    const cy = Math.floor(lattice.height / 2) + Math.floor(Math.random() * 6 - 3);
    
    // Create anomaly with radius
    lattice.createAnomaly(cx, cy, 0, 2);
    
    // Boost energy of nearby nodes to help propagation
    const region = lattice.getRegion(cx - 3, cy - 3, cx + 3, cy + 3);
    region.forEach(node => {
      node.energy += 2.0;
    });
    
    // Visual feedback
    renderer.getVisualEffects().addRipple(400, 300, '#E74C3C', 100);
    renderer.getVisualEffects().addHalo(400, 300, '#F39C12', 2000);
    
    if (anomalyBtn) {
      anomalyBtn.innerHTML = `⚡ ${t('controls.addAnomaly')} (${anomalyCount})`;
    }
  };

  // Play/Pause toggle button
  playPauseBtn?.addEventListener('click', () => {
    if (window.app.isRunning) {
      simulation.pause();
      window.app.isRunning = false;
      playPauseBtn.innerHTML = `▶ ${t('controls.start')}`;
      playPauseBtn.style.background = '#4CAF50';
    } else {
      simulation.start();
      window.app.isRunning = true;
      playPauseBtn.innerHTML = `⏸ ${t('controls.pause')}`;
      playPauseBtn.style.background = '#FF9800';
    }
  });

  resetBtn?.addEventListener('click', () => {
    simulation.reset();
    lattice.reset();
    window.app.isRunning = false;
    anomalyCount = 0;
    
    // Clear charts
    if (window.app.tdsCharts) {
      window.app.tdsCharts.clear();
    }
    
    if (playPauseBtn) {
      playPauseBtn.innerHTML = `▶ ${t('controls.start')}`;
      playPauseBtn.style.background = '#4CAF50';
    }
    if (anomalyBtn) {
      anomalyBtn.innerHTML = `⚡ ${t('controls.addAnomaly')}`;
    }
  });

  anomalyBtn?.addEventListener('click', () => {
    createAnomaly();
    anomalyBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      anomalyBtn.style.transform = 'scale(1)';
    }, 100);
  });

  // Auto-anomaly toggle button
  autoAnomalyBtn?.addEventListener('click', () => {
    autoAnomalyEnabled = !autoAnomalyEnabled;
    
    if (autoAnomalyEnabled) {
      // Enable auto-mode
      autoAnomalyBtn.innerHTML = `🔄 ${t('controls.autoAnomaliesOn')}`;
      autoAnomalyBtn.style.background = '#2E7D32';
      autoAnomalyBtn.style.color = 'white';
      autoAnomalyBtn.style.borderColor = '#4CAF50';
      
      // Start auto-creating anomalies
      autoAnomalyInterval = window.setInterval(() => {
        if (window.app.isRunning) {
          createAnomaly();
        }
      }, 5000);
    } else {
      // Disable auto-mode
      autoAnomalyBtn.innerHTML = `🔄 ${t('controls.autoAnomaliesOff')}`;
      autoAnomalyBtn.style.background = '#0f3460';
      autoAnomalyBtn.style.color = '#aaa';
      autoAnomalyBtn.style.borderColor = '#2c5f8d';
      
      // Stop auto-creating
      if (autoAnomalyInterval) {
        clearInterval(autoAnomalyInterval);
        autoAnomalyInterval = null;
      }
    }
  });

  // Export buttons
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportChartBtn = document.getElementById('export-chart-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  // Collect simulation data for export
  const collectExportData = () => {
    const stats = lattice.getStatistics();
    const state = simulation.getState();
    return {
      time: state.time,
      stepCount: state.stepCount,
      statistics: {
        symmetric: stats.vacuum,
        asymmetric: stats.broken,
        anomalies: stats.anomalous,
        total: stats.total,
        avgEnergy: stats.totalE_0 / stats.total,
      },
    };
  };

  exportCsvBtn?.addEventListener('click', () => {
    const data = [collectExportData()];
    DataExporter.exportToCSV(data, { filename: 'tds-simulation' });
    exportCsvBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      exportCsvBtn.style.transform = 'scale(1)';
    }, 100);
  });

  exportJsonBtn?.addEventListener('click', () => {
    const data = collectExportData();
    DataExporter.exportToJSON(data, { filename: 'tds-simulation' });
    exportJsonBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      exportJsonBtn.style.transform = 'scale(1)';
    }, 100);
  });

  exportChartBtn?.addEventListener('click', () => {
    const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
    if (chartCanvas) {
      DataExporter.exportChartToPNG(chartCanvas, { filename: 'tds-chart' });
      exportChartBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        exportChartBtn.style.transform = 'scale(1)';
      }, 100);
    }
  });

  exportPdfBtn?.addEventListener('click', () => {
    const data = [collectExportData()];
    const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
    DataExporter.exportToPDF(data, chartCanvas, { filename: 'tds-report' });
    exportPdfBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      exportPdfBtn.style.transform = 'scale(1)';
    }, 100);
  });

  // Advanced analytics buttons
  const runPhotonTestBtn = document.getElementById('run-photon-test-btn');
  const toggleSpectrumBtn = document.getElementById('toggle-spectrum-btn');
  const toggleAuthorModeBtn = document.getElementById('toggle-author-mode-btn');

  runPhotonTestBtn?.addEventListener('click', async () => {
    runPhotonTestBtn.innerHTML = '⏳ Running...';
    runPhotonTestBtn.style.background = '#666';
    
    try {
      if (window.app.useAuthorMode && window.app.authorPhysics && window.app.lattice) {
        // Use Author Physics test
        const result = await window.app.authorPhysics.photonWindowTest(window.app.lattice, 100);
        const color = result.passed ? '#4CAF50' : '#F44336';
        
        alert(`Photon Window Test (Author Mode)\n\n` +
              `Hamming Distance: ${result.hammingDistance}\n` +
              `Ratio: ${result.ratio.toFixed(6)}\n` +
              `Status: ${result.message}\n\n` +
              `${result.passed ? '✓ PERFECT REVERSIBILITY' : '✗ REVERSIBILITY LOST'}`);
        
        runPhotonTestBtn.style.background = color;
      } else if (window.app.analytics && window.app.simulation) {
        // Use standard analytics test
        const result = await window.app.analytics.runPhotonWindowTest(window.app.simulation, 100);
        const photonTest = window.app.analytics.getComponents().photonWindow;
        const color = photonTest.getResultColor(result);
        
        alert(`Photon Window Test Results:\n\n${photonTest.formatResult(result)}`);
        
        runPhotonTestBtn.style.background = color;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Test failed: ${errorMessage}`);
      runPhotonTestBtn.style.background = '#9C27B0';
    }
    
    runPhotonTestBtn.innerHTML = '🔄 Photon Test';
  });

  toggleSpectrumBtn?.addEventListener('click', () => {
    window.app.useSpectrumColors = !window.app.useSpectrumColors;
    
    if (window.app.useSpectrumColors) {
      // Enable spectrum mode
      window.app.colorizer = new SpectrumColorizer(6, lattice.width);
      toggleSpectrumBtn.innerHTML = '🌈 Spectrum ON';
      toggleSpectrumBtn.style.background = '#2E7D32';
      toggleSpectrumBtn.style.color = 'white';
      toggleSpectrumBtn.style.borderColor = '#4CAF50';
    } else {
      // Disable spectrum mode
      window.app.colorizer = SpectrumColorizer.createSimple(lattice.width);
      toggleSpectrumBtn.innerHTML = '🌈 Spectrum';
      toggleSpectrumBtn.style.background = '#0f3460';
      toggleSpectrumBtn.style.color = '#aaa';
      toggleSpectrumBtn.style.borderColor = '#2c5f8d';
    }
  });

  toggleAuthorModeBtn?.addEventListener('click', () => {
    window.app.useAuthorMode = !window.app.useAuthorMode;
    
    if (window.app.useAuthorMode && window.app.authorPhysics) {
      // Enable Author Mode
      window.app.authorPhysics.initializeLattice(lattice);
      toggleAuthorModeBtn.innerHTML = '🔬 Author Mode ON';
      toggleAuthorModeBtn.style.background = '#2E7D32';
      toggleAuthorModeBtn.style.color = 'white';
      toggleAuthorModeBtn.style.borderColor = '#4CAF50';
      
      alert('Author Mode ENABLED\n\n' +
            'Using exact reference implementation:\n' +
            '• Swap-based dynamics (Margolus)\n' +
            '• E_sym = aligned spins\n' +
            '• E_asym = misaligned spins\n' +
            '• Photon Window Test validation\n\n' +
            'Lattice reinitialized with cosine wave.');
    } else {
      // Disable Author Mode
      toggleAuthorModeBtn.innerHTML = '🔬 Author Mode OFF';
      toggleAuthorModeBtn.style.background = '#0f3460';
      toggleAuthorModeBtn.style.color = '#aaa';
      toggleAuthorModeBtn.style.borderColor = '#2c5f8d';
    }
  });
}

function startAnimationLoop(simulation: Simulation, renderer: Renderer2D, lattice: Lattice): void {
  function animate(): void {
    // Update simulation if running
    if (window.app.isRunning) {
      if (window.app.useAuthorMode && window.app.authorPhysics) {
        // Use author's physics
        window.app.authorPhysics.step(lattice);
      } else if (simulation.isRunning && !simulation.isPaused) {
        // Use standard simulation
        simulation.step();
      }
    }

    // Apply colorizer to renderer
    if (window.app.colorizer) {
      renderer.setColorizer(window.app.colorizer);
    }

    // Render
    renderer.render(lattice);

    // Update stats
    updateStats(lattice, simulation);

    // Continue loop
    window.app.animationId = requestAnimationFrame(animate);
  }

  animate();
}

function updateStats(lattice: Lattice, simulation: Simulation): void {
  const stats = lattice.getStatistics();
  const state = simulation.getState();

  const statsContent = document.getElementById('stats-content');
  if (statsContent) {
    const symPercent = ((stats.vacuum / stats.total) * 100).toFixed(1);
    const asymPercent = ((stats.broken / stats.total) * 100).toFixed(1);
    const anomPercent = ((stats.anomalous / stats.total) * 100).toFixed(1);
    
    statsContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
        <div><strong>${t('stats.time')}:</strong> ${state.time.toFixed(1)}s</div>
        <div><strong>${t('stats.steps')}:</strong> ${state.stepCount}</div>
        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #0f3460;">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🟢 ${t('stats.symmetric')}</span>
              <strong>${stats.vacuum} (${symPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #4CAF50; height: 100%; width: ${symPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🟡 ${t('stats.asymmetric')}</span>
              <strong>${stats.broken} (${asymPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #FFC107; height: 100%; width: ${asymPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🔴 ${t('stats.anomalies')}</span>
              <strong>${stats.anomalous} (${anomPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #F44336; height: 100%; width: ${anomPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #0f3460;">
          <strong>${t('stats.avgEnergy')}:</strong> ${(stats.totalE_0 / stats.total).toFixed(2)}
        </div>
      </div>
    `;
  }
  
  // Update TDS metrics
  const energies = lattice.calculateTotalEnergy();
  const tInfo = lattice.calculateT_info(1.0); // J = 1.0
  const phaseCoherence = stats.phaseCoherence || 0;
  
  const eSymEl = document.getElementById('e-sym-value');
  const eAsymEl = document.getElementById('e-asym-value');
  const e0El = document.getElementById('e-0-value');
  const tInfoEl = document.getElementById('t-info-value');
  const phaseEl = document.getElementById('phase-value');
  const conservationCheckEl = document.getElementById('conservation-check');
  
  if (eSymEl) eSymEl.textContent = energies.E_sym.toFixed(2);
  if (eAsymEl) eAsymEl.textContent = energies.E_asym.toFixed(2);
  if (e0El) e0El.textContent = energies.E_0.toFixed(2);
  if (tInfoEl) tInfoEl.textContent = tInfo.toFixed(4);
  if (phaseEl) phaseEl.textContent = phaseCoherence.toFixed(4);
  
  if (conservationCheckEl) {
    const sum = energies.E_sym + energies.E_asym;
    const diff = Math.abs(sum - energies.E_0);
    conservationCheckEl.textContent = sum.toFixed(2);
    
    if (diff < 0.01) {
      conservationCheckEl.style.color = '#4CAF50';
    } else if (diff < 0.1) {
      conservationCheckEl.style.color = '#FFC107';
    } else {
      conservationCheckEl.style.color = '#F44336';
    }
  }
  
  // Update advanced analytics
  if (window.app.analytics && window.app.simulation) {
    window.app.analytics.update(window.app.simulation);
    const analyticsData = window.app.analytics.getStatsPanelData();
    
    const correlationEl = document.getElementById('correlation-value');
    const driftEl = document.getElementById('drift-value');
    const rmsAkxEl = document.getElementById('rms-akx-value');
    const conservationEl = document.getElementById('conservation-status');
    
    if (correlationEl) {
      correlationEl.textContent = analyticsData.rho;
    }
    if (driftEl) {
      driftEl.textContent = analyticsData.drift;
    }
    if (rmsAkxEl) {
      rmsAkxEl.textContent = analyticsData.rmsAkx;
    }
    
    // Update conservation status
    if (conservationEl && simulation.getReversibilityValidator) {
      const validator = simulation.getReversibilityValidator();
      const statusObj = validator.getConservationStatus();
      
      if (statusObj.status === 'good') {
        conservationEl.innerHTML = '✓ Good';
        conservationEl.style.color = '#4CAF50';
      } else if (statusObj.status === 'warning') {
        conservationEl.innerHTML = '⚠ Warning';
        conservationEl.style.color = '#FFC107';
      } else {
        conservationEl.innerHTML = '✗ Error';
        conservationEl.style.color = '#F44336';
      }
    }
  }
  
  // Update TDS Charts
  if (window.app.tdsCharts) {
    window.app.tdsCharts.update({
      time: state.time,
      E_sym: energies.E_sym,
      E_asym: energies.E_asym,
      E_0: energies.E_0,
      T_info: tInfo
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n first
  await initI18n();
  // eslint-disable-next-line no-console
  console.log('🌍 Language initialized');
  
  // Then initialize app
  initApp();
});
