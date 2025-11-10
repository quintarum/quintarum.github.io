/**
 * TDSCharts - Professional real-time charts for TDS metrics
 * Uses Chart.js for scientific visualization
 */

import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface TDSDataPoint {
  time: number;
  E_sym: number;
  E_asym: number;
  E_0: number;
  E_sym_norm: number;
  E_asym_norm: number;
  E_0_norm: number;
  A_kx: number;
}

export class TDSCharts {
  private energyChart: Chart | null = null;
  private conservationChart: Chart | null = null;
  private dataHistory: TDSDataPoint[] = [];
  private readonly maxDataPoints = 100;

  /**
   * Initialize energy chart (normalized E_sym, E_asym, E_0)
   */
  initEnergyChart(canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'E₀',
            data: [],
            borderColor: '#888',
            backgroundColor: 'rgba(136, 136, 136, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
            borderDash: [5, 5]
          },
          {
            label: 'E_sym',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0
          },
          {
            label: 'E_asym',
            data: [],
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ccc',
              font: {
                family: 'monospace',
                size: 11
              },
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Energy invariants (normalized)',
            color: '#ccc',
            font: {
              family: 'sans-serif',
              size: 13,
              weight: 'normal'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#4CAF50',
            bodyColor: '#ccc',
            borderColor: '#4CAF50',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y?.toFixed(2) ?? '0.00';
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time Step',
              color: '#888',
              font: {
                family: 'monospace',
                size: 11
              }
            },
            ticks: {
              color: '#888',
              font: {
                family: 'monospace',
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Energy',
              color: '#888',
              font: {
                family: 'monospace',
                size: 11
              }
            },
            ticks: {
              color: '#888',
              font: {
                family: 'monospace',
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    this.energyChart = new Chart(canvas, config);
  }

  /**
   * Initialize mode amplitude chart A_kx(t)
   */
  initConservationChart(canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'A_kx',
            data: [],
            borderColor: '#58a6ff',
            backgroundColor: 'rgba(88, 166, 255, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ccc',
              font: {
                family: 'monospace',
                size: 11
              },
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Mode amplitude A_kx(t)',
            color: '#ccc',
            font: {
              family: 'sans-serif',
              size: 13,
              weight: 'normal'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#4CAF50',
            bodyColor: '#ccc',
            borderColor: '#4CAF50',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time Step',
              color: '#888',
              font: {
                family: 'monospace',
                size: 11
              }
            },
            ticks: {
              color: '#888',
              font: {
                family: 'monospace',
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Amplitude',
              color: '#888',
              font: {
                family: 'monospace',
                size: 11
              }
            },
            ticks: {
              color: '#888',
              font: {
                family: 'monospace',
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    };

    this.conservationChart = new Chart(canvas, config);
  }

  /**
   * Update charts with new data point
   */
  update(dataPoint: TDSDataPoint): void {
    this.dataHistory.push(dataPoint);

    // Keep only last N points
    if (this.dataHistory.length > this.maxDataPoints) {
      this.dataHistory.shift();
    }

    this.updateEnergyChart();
    this.updateConservationChart();
  }

  /**
   * Update energy chart (normalized)
   */
  private updateEnergyChart(): void {
    if (!this.energyChart) return;

    const labels = this.dataHistory.map(d => d.time.toFixed(1));
    const e0Data = this.dataHistory.map(d => d.E_0_norm);
    const eSymData = this.dataHistory.map(d => d.E_sym_norm);
    const eAsymData = this.dataHistory.map(d => d.E_asym_norm);

    this.energyChart.data.labels = labels;
    this.energyChart.data.datasets[0].data = e0Data;
    this.energyChart.data.datasets[1].data = eSymData;
    this.energyChart.data.datasets[2].data = eAsymData;

    this.energyChart.update('none');
  }

  /**
   * Update mode amplitude chart
   */
  private updateConservationChart(): void {
    if (!this.conservationChart) return;

    const labels = this.dataHistory.map(d => d.time.toFixed(1));
    const akxData = this.dataHistory.map(d => d.A_kx);

    this.conservationChart.data.labels = labels;
    this.conservationChart.data.datasets[0].data = akxData;

    this.conservationChart.update('none');
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.dataHistory = [];
    if (this.energyChart) {
      this.energyChart.data.labels = [];
      this.energyChart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      this.energyChart.update();
    }
    if (this.conservationChart) {
      this.conservationChart.data.labels = [];
      this.conservationChart.data.datasets.forEach(dataset => {
        dataset.data = [];
      });
      this.conservationChart.update();
    }
  }

  /**
   * Destroy charts
   */
  destroy(): void {
    if (this.energyChart) {
      this.energyChart.destroy();
      this.energyChart = null;
    }
    if (this.conservationChart) {
      this.conservationChart.destroy();
      this.conservationChart = null;
    }
  }
}
