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
  T_info: number;
}

export class TDSCharts {
  private energyChart: Chart | null = null;
  private conservationChart: Chart | null = null;
  private dataHistory: TDSDataPoint[] = [];
  private readonly maxDataPoints = 100;

  /**
   * Initialize energy chart (E_sym, E_asym, E_0)
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
            label: 'E_sym (Symmetric Energy)',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'E_asym (Asymmetric Energy)',
            data: [],
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'E_0 (Total Energy)',
            data: [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            borderDash: [5, 5]
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
            text: 'TDS Energy Evolution',
            color: '#4CAF50',
            font: {
              family: 'sans-serif',
              size: 14,
              weight: 'bold'
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
   * Initialize conservation chart (E_sym + E_asym vs E_0)
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
            label: 'E_sym + E_asym',
            data: [],
            borderColor: '#E74C3C',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'E_0 (Reference)',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            borderDash: [5, 5]
          },
          {
            label: 'Deviation (×10)',
            data: [],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4,
            yAxisID: 'y1'
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
            text: 'Energy Conservation Law: E_sym + E_asym = E_0',
            color: '#4CAF50',
            font: {
              family: 'sans-serif',
              size: 14,
              weight: 'bold'
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
            position: 'left',
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
          },
          y1: {
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Deviation',
              color: '#FF9800',
              font: {
                family: 'monospace',
                size: 11
              }
            },
            ticks: {
              color: '#FF9800',
              font: {
                family: 'monospace',
                size: 10
              }
            },
            grid: {
              drawOnChartArea: false
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
   * Update energy chart
   */
  private updateEnergyChart(): void {
    if (!this.energyChart) return;

    const labels = this.dataHistory.map(d => d.time.toFixed(1));
    const eSymData = this.dataHistory.map(d => d.E_sym);
    const eAsymData = this.dataHistory.map(d => d.E_asym);
    const e0Data = this.dataHistory.map(d => d.E_0);

    this.energyChart.data.labels = labels;
    this.energyChart.data.datasets[0].data = eSymData;
    this.energyChart.data.datasets[1].data = eAsymData;
    this.energyChart.data.datasets[2].data = e0Data;

    this.energyChart.update('none');
  }

  /**
   * Update conservation chart
   */
  private updateConservationChart(): void {
    if (!this.conservationChart) return;

    const labels = this.dataHistory.map(d => d.time.toFixed(1));
    const sumData = this.dataHistory.map(d => d.E_sym + d.E_asym);
    const e0Data = this.dataHistory.map(d => d.E_0);
    const deviationData = this.dataHistory.map(d => 
      Math.abs((d.E_sym + d.E_asym) - d.E_0) * 10
    );

    this.conservationChart.data.labels = labels;
    this.conservationChart.data.datasets[0].data = sumData;
    this.conservationChart.data.datasets[1].data = e0Data;
    this.conservationChart.data.datasets[2].data = deviationData;

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
