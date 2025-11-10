/**
 * TDSDataExporter - Export simulation data for scientific analysis
 * Supports CSV, JSON formats with full TDS metrics
 */

import { Simulation } from '../core/Simulation.js';
import { Lattice } from '../core/Lattice.js';

export interface TDSTimeSeriesData {
  time: number;
  stepCount: number;
  E_sym: number;
  E_asym: number;
  E_0: number;
  T_info: number;
  phaseCoherence: number;
  vacuumCount: number;
  brokenCount: number;
  anomalousCount: number;
  conservationDeviation: number;
}

export interface TDSExportMetadata {
  exportDate: string;
  simulationVersion: string;
  latticeSize: { width: number; height: number; depth: number };
  parameters: {
    J: number;
    E_0: number;
    tolerance: number;
    k_x: number;
    timeStep: number;
  };
  totalSteps: number;
  dataPoints: number;
}

export class TDSDataExporter {
  private timeSeriesData: TDSTimeSeriesData[] = [];
  private maxDataPoints: number = 10000;

  /**
   * Record current simulation state
   */
  recordDataPoint(simulation: Simulation, lattice: Lattice): void {
    const state = simulation.getState();
    const stats = lattice.getStatistics();
    const energies = lattice.calculateTotalEnergy();
    const tInfo = lattice.calculateT_info(1.0);

    const dataPoint: TDSTimeSeriesData = {
      time: state.time,
      stepCount: state.stepCount,
      E_sym: energies.E_sym,
      E_asym: energies.E_asym,
      E_0: energies.E_0,
      T_info: tInfo,
      phaseCoherence: stats.phaseCoherence || 0,
      vacuumCount: stats.vacuum,
      brokenCount: stats.broken,
      anomalousCount: stats.anomalous,
      conservationDeviation: Math.abs((energies.E_sym + energies.E_asym) - energies.E_0)
    };

    this.timeSeriesData.push(dataPoint);

    // Keep only last N points
    if (this.timeSeriesData.length > this.maxDataPoints) {
      this.timeSeriesData.shift();
    }
  }

  /**
   * Export time series to CSV
   */
  exportToCSV(metadata: TDSExportMetadata): string {
    let csv = '# TDS Web Simulation - Time Series Data\n';
    csv += `# Export Date: ${metadata.exportDate}\n`;
    csv += `# Simulation Version: ${metadata.simulationVersion}\n`;
    csv += `# Lattice Size: ${metadata.latticeSize.width}×${metadata.latticeSize.height}×${metadata.latticeSize.depth}\n`;
    csv += `# Parameters: J=${metadata.parameters.J}, E_0=${metadata.parameters.E_0}, ε=${metadata.parameters.tolerance}\n`;
    csv += `# Total Steps: ${metadata.totalSteps}, Data Points: ${metadata.dataPoints}\n`;
    csv += '#\n';
    
    // Header
    csv += 'time,step,E_sym,E_asym,E_0,T_info,phase_coherence,vacuum_count,broken_count,anomalous_count,conservation_deviation\n';
    
    // Data rows
    this.timeSeriesData.forEach(d => {
      csv += `${d.time.toFixed(3)},${d.stepCount},${d.E_sym.toFixed(6)},${d.E_asym.toFixed(6)},${d.E_0.toFixed(6)},${d.T_info.toFixed(6)},${d.phaseCoherence.toFixed(6)},${d.vacuumCount},${d.brokenCount},${d.anomalousCount},${d.conservationDeviation.toExponential(6)}\n`;
    });
    
    return csv;
  }

  /**
   * Export time series to JSON
   */
  exportToJSON(metadata: TDSExportMetadata): string {
    const exportData = {
      metadata,
      timeSeries: this.timeSeriesData
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download CSV file
   */
  downloadCSV(metadata: TDSExportMetadata, filename: string = 'tds-timeseries.csv'): void {
    const csv = this.exportToCSV(metadata);
    this.downloadFile(csv, filename, 'text/csv');
  }

  /**
   * Download JSON file
   */
  downloadJSON(metadata: TDSExportMetadata, filename: string = 'tds-timeseries.json'): void {
    const json = this.exportToJSON(metadata);
    this.downloadFile(json, filename, 'application/json');
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
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

  /**
   * Get current data count
   */
  getDataPointCount(): number {
    return this.timeSeriesData.length;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.timeSeriesData = [];
  }

  /**
   * Get data summary statistics
   */
  getSummaryStatistics(): {
    E_sym: { mean: number; min: number; max: number; std: number };
    E_asym: { mean: number; min: number; max: number; std: number };
    E_0: { mean: number; min: number; max: number; std: number };
    conservationDeviation: { mean: number; max: number };
  } {
    if (this.timeSeriesData.length === 0) {
      return {
        E_sym: { mean: 0, min: 0, max: 0, std: 0 },
        E_asym: { mean: 0, min: 0, max: 0, std: 0 },
        E_0: { mean: 0, min: 0, max: 0, std: 0 },
        conservationDeviation: { mean: 0, max: 0 }
      };
    }

    const calcStats = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      return { mean, min, max, std };
    };

    const eSymValues = this.timeSeriesData.map(d => d.E_sym);
    const eAsymValues = this.timeSeriesData.map(d => d.E_asym);
    const e0Values = this.timeSeriesData.map(d => d.E_0);
    const deviationValues = this.timeSeriesData.map(d => d.conservationDeviation);

    return {
      E_sym: calcStats(eSymValues),
      E_asym: calcStats(eAsymValues),
      E_0: calcStats(e0Values),
      conservationDeviation: {
        mean: deviationValues.reduce((a, b) => a + b, 0) / deviationValues.length,
        max: Math.max(...deviationValues)
      }
    };
  }
}
