/**
 * TDS Web Simulation - Main Entry Point
 * Theory of Dynamic Symmetry Interactive Visualization
 */

import { Lattice, LatticeStatistics } from './core/Lattice.js';
import { Simulation } from './core/Simulation.js';
import { Renderer2D } from './rendering/Renderer2D.js';

interface AppInstance {
  simulation: Simulation | null;
  renderer: Renderer2D | null;
  lattice: Lattice | null;
  isRunning: boolean;
  animationId: number | null;
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
  animationId: null
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

  // Create UI
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="font-family: sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 20px; box-sizing: border-box;">
        <div style="max-width: 1400px; margin: 0 auto;">
          <h1 style="color: #E74C3C; margin: 0 0 5px 0; text-align: center;">TDS Web Simulation</h1>
          <p style="color: #aaa; margin: 0 0 5px 0; text-align: center;">Theory of Dynamic Symmetry - Interactive Visualization</p>
          <p style="color: #888; margin: 0 0 20px 0; text-align: center; font-size: 13px;">
            <a href="https://doi.org/10.5281/zenodo.17465190" target="_blank" rel="noopener noreferrer" style="color: #4CAF50; text-decoration: none;">
              Read the theory paper
            </a>
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start;">
            <!-- Left column: Canvas and controls -->
            <div>
              <div id="canvas-container" style="background: #0f3460; border-radius: 8px; padding: 10px; margin-bottom: 15px;"></div>
              
              <div style="text-align: center; margin-bottom: 15px;">
                <button id="play-pause-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; transition: all 0.2s;">
                  ▶ Start
                </button>
                <button id="reset-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 16px; transition: all 0.2s;">
                  ↻ Reset
                </button>
                <button id="anomaly-btn" style="padding: 12px 24px; margin: 0 5px; cursor: pointer; background: #E74C3C; color: white; border: none; border-radius: 4px; font-size: 16px; transition: all 0.2s;">
                  ⚡ Add Anomaly
                </button>
              </div>
              
              <div style="text-align: center; margin-bottom: 15px;">
                <button id="auto-anomaly-btn" style="padding: 10px 20px; cursor: pointer; background: #0f3460; color: #aaa; border: 2px solid #2c5f8d; border-radius: 4px; font-size: 14px; transition: all 0.2s; width: 100%; max-width: 400px;">
                  🔄 Auto-create anomalies (OFF)
                </button>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">Legend</h3>
                <div style="display: flex; gap: 20px; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #4CAF50; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">Symmetric</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #FFC107; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">Asymmetric</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; background: #F44336; border-radius: 50%;"></div>
                    <span style="font-size: 14px;">Anomaly</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right column: Stats and chart -->
            <div>
              <div id="stats" style="padding: 15px; background: #16213e; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">Statistics</h3>
                <div id="stats-content"></div>
              </div>
              
              <div style="padding: 15px; background: #16213e; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 16px;">State Distribution</h3>
                <canvas id="chart-canvas" width="350" height="200" style="width: 100%; height: auto;"></canvas>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #16213e; border-radius: 8px; text-align: left;">
            <h3 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 18px;">📚 How it works (TDS Theory)</h3>
            <div style="color: #ccc; font-size: 14px; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong style="color: #4CAF50;">🟢 Symmetric nodes</strong> are in stable equilibrium state</p>
              <p style="margin: 8px 0;"><strong style="color: #FFC107;">🟡 Asymmetric nodes</strong> have broken symmetry but are not anomalies yet</p>
              <p style="margin: 8px 0;"><strong style="color: #F44336;">🔴 Anomalies</strong> are high-energy symmetry violations that spread to neighbors</p>
              <p style="margin: 12px 0 8px 0; color: #aaa; border-top: 1px solid #0f3460; padding-top: 12px;">
                <strong>What to observe:</strong>
              </p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Click "Start" to begin the simulation</li>
                <li>Click "Add Anomaly" to inject red anomalies</li>
                <li>Watch anomalies spread to yellow neighbors</li>
                <li>Yellow nodes may become red or return to green</li>
                <li>Enable auto-mode to see continuous dynamics</li>
              </ul>
              <p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #0f3460; line-height: 1.5;">
                <strong>Theory of Dynamic Symmetry (TDS)</strong> proposes that fundamental physical phenomena emerge from reversible symmetry dynamics in a discrete lattice structure. The theory suggests that dark matter, matter-antimatter asymmetry, and quantum measurement can be explained through symmetry transitions and anomaly propagation without introducing new particles.
              </p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://doi.org/10.5281/zenodo.17465190" target="_blank" rel="noopener noreferrer" style="color: #4CAF50; text-decoration: none;">
                  Read the full paper
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('canvas-container')?.appendChild(canvas);
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
      anomalyBtn.innerHTML = `⚡ Add Anomaly (${anomalyCount})`;
    }
  };

  // Play/Pause toggle button
  playPauseBtn?.addEventListener('click', () => {
    if (window.app.isRunning) {
      simulation.pause();
      window.app.isRunning = false;
      playPauseBtn.innerHTML = '▶ Start';
      playPauseBtn.style.background = '#4CAF50';
    } else {
      simulation.start();
      window.app.isRunning = true;
      playPauseBtn.innerHTML = '⏸ Pause';
      playPauseBtn.style.background = '#FF9800';
    }
  });

  resetBtn?.addEventListener('click', () => {
    simulation.reset();
    lattice.reset();
    window.app.isRunning = false;
    anomalyCount = 0;
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '▶ Start';
      playPauseBtn.style.background = '#4CAF50';
    }
    if (anomalyBtn) {
      anomalyBtn.innerHTML = '⚡ Add Anomaly';
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
      autoAnomalyBtn.innerHTML = '🔄 Auto-create anomalies (ON)';
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
      autoAnomalyBtn.innerHTML = '🔄 Auto-create anomalies (OFF)';
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
}

function startAnimationLoop(simulation: Simulation, renderer: Renderer2D, lattice: Lattice): void {
  function animate(): void {
    // Update simulation if running
    if (window.app.isRunning && simulation.isRunning && !simulation.isPaused) {
      simulation.step();
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
    const symPercent = ((stats.symmetric / stats.total) * 100).toFixed(1);
    const asymPercent = ((stats.asymmetric / stats.total) * 100).toFixed(1);
    const anomPercent = ((stats.anomalies / stats.total) * 100).toFixed(1);
    
    statsContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
        <div><strong>Time:</strong> ${state.time.toFixed(1)}s</div>
        <div><strong>Steps:</strong> ${state.stepCount}</div>
        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #0f3460;">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🟢 Symmetric</span>
              <strong>${stats.symmetric} (${symPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #4CAF50; height: 100%; width: ${symPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🟡 Asymmetric</span>
              <strong>${stats.asymmetric} (${asymPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #FFC107; height: 100%; width: ${asymPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>🔴 Anomalies</span>
              <strong>${stats.anomalies} (${anomPercent}%)</strong>
            </div>
            <div style="background: #0f3460; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #F44336; height: 100%; width: ${anomPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #0f3460;">
          <strong>Avg Energy:</strong> ${stats.avgEnergy.toFixed(2)}
        </div>
      </div>
    `;
  }
  
  // Update simple chart
  updateChart(stats);
}

const chartHistory: Array<{ symmetric: number; asymmetric: number; anomalies: number }> = [];

function updateChart(stats: LatticeStatistics): void {
  chartHistory.push({
    symmetric: stats.symmetric,
    asymmetric: stats.asymmetric,
    anomalies: stats.anomalies
  });
  
  // Keep last 50 data points
  if (chartHistory.length > 50) {
    chartHistory.shift();
  }
  
  const canvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (chartHistory.length < 2) return;
  
  const maxValue = stats.total;
  const width = canvas.width;
  const height = canvas.height;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Draw grid
  ctx.strokeStyle = '#1a2942';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // Draw lines
  const pointSpacing = chartWidth / (chartHistory.length - 1);
  
  // Symmetric (green)
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  chartHistory.forEach((data, i) => {
    const x = padding + i * pointSpacing;
    const y = padding + chartHeight - (data.symmetric / maxValue) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // Asymmetric (yellow)
  ctx.strokeStyle = '#FFC107';
  ctx.beginPath();
  chartHistory.forEach((data, i) => {
    const x = padding + i * pointSpacing;
    const y = padding + chartHeight - (data.asymmetric / maxValue) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // Anomalies (red)
  ctx.strokeStyle = '#F44336';
  ctx.beginPath();
  chartHistory.forEach((data, i) => {
    const x = padding + i * pointSpacing;
    const y = padding + chartHeight - (data.anomalies / maxValue) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
