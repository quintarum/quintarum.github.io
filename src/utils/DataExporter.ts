/**
 * Data Exporter Utility
 * Handles exporting simulation data in various formats
 */

import Papa from 'papaparse';

interface SimulationData {
  time: number;
  stepCount: number;
  statistics: {
    symmetric: number;
    asymmetric: number;
    anomalies: number;
    total: number;
    avgEnergy: number;
  };
  parameters?: Record<string, unknown>;
}

interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  format?: 'csv' | 'json' | 'png' | 'svg' | 'pdf';
}

export class DataExporter {
  /**
   * Export simulation data to CSV format
   */
  static exportToCSV(data: SimulationData[], options: ExportOptions = {}): void {
    const filename = options.filename || 'tds-simulation-data';
    const includeTimestamp = options.includeTimestamp !== false;

    // Prepare data for CSV
    const csvData = data.map((entry) => ({
      Time: entry.time,
      Steps: entry.stepCount,
      Symmetric: entry.statistics.symmetric,
      Asymmetric: entry.statistics.asymmetric,
      Anomalies: entry.statistics.anomalies,
      Total: entry.statistics.total,
      'Avg Energy': entry.statistics.avgEnergy,
    }));

    // Convert to CSV using PapaParse
    const csv = Papa.unparse(csvData);

    // Create filename with timestamp
    const finalFilename = includeTimestamp
      ? `${filename}-${this.getTimestamp()}.csv`
      : `${filename}.csv`;

    // Download file
    this.downloadFile(csv, finalFilename, 'text/csv');
  }

  /**
   * Export simulation data to JSON format
   */
  static exportToJSON(
    data: SimulationData | SimulationData[],
    options: ExportOptions = {}
  ): void {
    const filename = options.filename || 'tds-simulation-data';
    const includeTimestamp = options.includeTimestamp !== false;

    // Convert to JSON with pretty printing
    const json = JSON.stringify(data, null, 2);

    // Create filename with timestamp
    const finalFilename = includeTimestamp
      ? `${filename}-${this.getTimestamp()}.json`
      : `${filename}.json`;

    // Download file
    this.downloadFile(json, finalFilename, 'application/json');
  }

  /**
   * Export chart as PNG image
   */
  static exportChartToPNG(canvas: HTMLCanvasElement, options: ExportOptions = {}): void {
    const filename = options.filename || 'tds-chart';
    const includeTimestamp = options.includeTimestamp !== false;

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create image blob');
        return;
      }

      // Create filename with timestamp
      const finalFilename = includeTimestamp
        ? `${filename}-${this.getTimestamp()}.png`
        : `${filename}.png`;

      // Download file
      const url = URL.createObjectURL(blob);
      this.downloadURL(url, finalFilename);
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Export chart as SVG image
   */
  static exportChartToSVG(canvas: HTMLCanvasElement, options: ExportOptions = {}): void {
    const filename = options.filename || 'tds-chart';
    const includeTimestamp = options.includeTimestamp !== false;

    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Create SVG with embedded image
    const dataURL = canvas.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataURL}"/>
</svg>`;

    // Create filename with timestamp
    const finalFilename = includeTimestamp
      ? `${filename}-${this.getTimestamp()}.svg`
      : `${filename}.svg`;

    // Download file
    this.downloadFile(svg, finalFilename, 'image/svg+xml');
  }

  /**
   * Generate and export PDF report
   */
  static exportToPDF(
    data: SimulationData[],
    chartCanvas: HTMLCanvasElement | null,
    _options: ExportOptions = {}
  ): void {
    // Create HTML content for PDF
    const html = this.generatePDFContent(data, chartCanvas);

    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error('Failed to access iframe document');
      document.body.removeChild(iframe);
      return;
    }

    // Write content to iframe
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Trigger print dialog
    iframe.contentWindow?.print();

    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  /**
   * Generate HTML content for PDF report
   */
  private static generatePDFContent(
    data: SimulationData[],
    chartCanvas: HTMLCanvasElement | null
  ): string {
    const latestData = data[data.length - 1];
    const chartImage = chartCanvas ? chartCanvas.toDataURL('image/png') : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TDS Simulation Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #E74C3C;
      border-bottom: 3px solid #E74C3C;
      padding-bottom: 10px;
    }
    h2 {
      color: #4CAF50;
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #4CAF50;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .summary {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .chart {
      margin: 20px 0;
      text-align: center;
    }
    .chart img {
      max-width: 100%;
      height: auto;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>TDS Web Simulation Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Simulation Summary</h2>
    <p><strong>Total Time:</strong> ${latestData.time.toFixed(2)}s</p>
    <p><strong>Total Steps:</strong> ${latestData.stepCount}</p>
    <p><strong>Average Energy:</strong> ${latestData.statistics.avgEnergy.toFixed(4)}</p>
  </div>

  <h2>Final State Statistics</h2>
  <table>
    <thead>
      <tr>
        <th>State</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Symmetric</td>
        <td>${latestData.statistics.symmetric}</td>
        <td>${((latestData.statistics.symmetric / latestData.statistics.total) * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Asymmetric</td>
        <td>${latestData.statistics.asymmetric}</td>
        <td>${((latestData.statistics.asymmetric / latestData.statistics.total) * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Anomalies</td>
        <td>${latestData.statistics.anomalies}</td>
        <td>${((latestData.statistics.anomalies / latestData.statistics.total) * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td><strong>${latestData.statistics.total}</strong></td>
        <td><strong>100%</strong></td>
      </tr>
    </tbody>
  </table>

  ${
    chartImage
      ? `
  <h2>State Distribution Chart</h2>
  <div class="chart">
    <img src="${chartImage}" alt="State Distribution Chart" />
  </div>
  `
      : ''
  }

  <h2>Time Series Data</h2>
  <table>
    <thead>
      <tr>
        <th>Time (s)</th>
        <th>Steps</th>
        <th>Symmetric</th>
        <th>Asymmetric</th>
        <th>Anomalies</th>
        <th>Avg Energy</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .slice(-20)
        .map(
          (entry) => `
        <tr>
          <td>${entry.time.toFixed(2)}</td>
          <td>${entry.stepCount}</td>
          <td>${entry.statistics.symmetric}</td>
          <td>${entry.statistics.asymmetric}</td>
          <td>${entry.statistics.anomalies}</td>
          <td>${entry.statistics.avgEnergy.toFixed(4)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>TDS Web Simulation - Theory of Dynamic Symmetry</p>
    <p>Report generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Download file with given content
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.downloadURL(url, filename);
    URL.revokeObjectURL(url);
  }

  /**
   * Download file from URL
   */
  private static downloadURL(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get current timestamp for filenames
   */
  private static getTimestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
  }

  /**
   * Export complete simulation state
   */
  static exportCompleteState(
    data: SimulationData[],
    parameters: Record<string, unknown>,
    options: ExportOptions = {}
  ): void {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        application: 'TDS Web Simulation',
      },
      parameters,
      data,
      summary: {
        totalSteps: data.length,
        duration: data[data.length - 1]?.time || 0,
        finalState: data[data.length - 1]?.statistics,
      },
    };

    // Export as JSON with proper typing
    const json = JSON.stringify(exportData, null, 2);
    const filename = options.filename || 'tds-complete-state';
    const includeTimestamp = options.includeTimestamp !== false;
    const finalFilename = includeTimestamp
      ? `${filename}-${this.getTimestamp()}.json`
      : `${filename}.json`;

    this.downloadFile(json, finalFilename, 'application/json');
  }
}
