import { Physics } from '../core/Physics.js';

/**
 * MetricsCollector class for real-time analytics and data collection
 * Collects, analyzes, and tracks simulation metrics over time
 */
export class MetricsCollector {
  /**
   * Create a new MetricsCollector
   * @param {Simulation} simulation - The simulation to collect metrics from
   * @param {Object} options - Collection options
   * @param {number} options.maxDataPoints - Maximum number of data points to keep
   * @param {number} options.samplingInterval - Interval for collecting samples (in steps)
   * @param {boolean} options.detectEvents - Enable automatic event detection
   */
  constructor(simulation, options = {}) {
    this.simulation = simulation;
    
    this.options = {
      maxDataPoints: options.maxDataPoints ?? 1000,
      samplingInterval: options.samplingInterval ?? 1,
      detectEvents: options.detectEvents ?? true
    };
    
    // Time-series data structures
    this.timeSeries = {
      time: [],
      energy: {
        total: [],
        average: [],
        max: [],
        min: [],
        distribution: []
      },
      symmetry: {
        ratio: [],
        symmetric: [],
        asymmetric: [],
        anomalies: []
      },
      entropy: [],
      correlationLength: [],
      phaseCoherence: [],
      anomalyDensity: []
    };
    
    // Statistical accumulators
    this.statistics = {
      energy: this._createStatAccumulator(),
      symmetryRatio: this._createStatAccumulator(),
      entropy: this._createStatAccumulator(),
      anomalyCount: this._createStatAccumulator()
    };
    
    // Event detection
    this.events = [];
    this.eventThresholds = {
      energySpike: 2.0,        // Standard deviations above mean
      symmetryChange: 0.3,     // Absolute change in ratio
      anomalyBurst: 10,        // Number of new anomalies
      entropyJump: 0.5         // Absolute change in entropy
    };
    
    // Last collected values for change detection
    this.lastValues = {
      energy: 0,
      symmetryRatio: 0,
      anomalyCount: 0,
      entropy: 0
    };
    
    // Collection counter
    this.sampleCount = 0;
    
    // Callbacks
    this.callbacks = {
      onEventDetected: null,
      onDataCollected: null
    };
  }

  /**
   * Create a statistical accumulator
   * @private
   * @returns {Object} Accumulator object
   */
  _createStatAccumulator() {
    return {
      count: 0,
      sum: 0,
      sumSquares: 0,
      min: Infinity,
      max: -Infinity,
      values: []
    };
  }

  /**
   * Collect current metrics from the simulation
   * @returns {Object} Collected metrics
   */
  collect() {
    this.sampleCount++;
    
    // Only collect at specified intervals
    if (this.sampleCount % this.options.samplingInterval !== 0) {
      return null;
    }
    
    const lattice = this.simulation.lattice;
    const stats = lattice.getStatistics();
    const currentTime = this.simulation.time;
    
    // Collect energy metrics
    const energyMetrics = {
      total: stats.totalEnergy,
      average: stats.avgEnergy,
      max: stats.maxEnergy,
      min: stats.minEnergy
    };
    
    // Collect symmetry metrics
    const symmetryMetrics = {
      ratio: stats.symmetric / stats.total,
      symmetric: stats.symmetric,
      asymmetric: stats.asymmetric,
      anomalies: stats.anomalies
    };
    
    // Calculate advanced metrics
    const entropy = Physics.calculateEntropy(lattice);
    const correlationLength = Physics.calculateCorrelationLength(lattice);
    const phaseCoherence = Physics.calculatePhaseCoherence(lattice.nodes);
    const anomalyDensity = stats.anomalies / stats.total;
    
    // Store in time series
    this.timeSeries.time.push(currentTime);
    this.timeSeries.energy.total.push(energyMetrics.total);
    this.timeSeries.energy.average.push(energyMetrics.average);
    this.timeSeries.energy.max.push(energyMetrics.max);
    this.timeSeries.energy.min.push(energyMetrics.min);
    this.timeSeries.symmetry.ratio.push(symmetryMetrics.ratio);
    this.timeSeries.symmetry.symmetric.push(symmetryMetrics.symmetric);
    this.timeSeries.symmetry.asymmetric.push(symmetryMetrics.asymmetric);
    this.timeSeries.symmetry.anomalies.push(symmetryMetrics.anomalies);
    this.timeSeries.entropy.push(entropy);
    this.timeSeries.correlationLength.push(correlationLength);
    this.timeSeries.phaseCoherence.push(phaseCoherence);
    this.timeSeries.anomalyDensity.push(anomalyDensity);
    
    // Limit data points
    this._limitDataPoints();
    
    // Update statistics
    this._updateStatistics(energyMetrics, symmetryMetrics, entropy, stats.anomalies);
    
    // Detect significant events
    if (this.options.detectEvents) {
      this._detectEvents(energyMetrics, symmetryMetrics, entropy, stats.anomalies);
    }
    
    // Update last values
    this.lastValues = {
      energy: energyMetrics.total,
      symmetryRatio: symmetryMetrics.ratio,
      anomalyCount: stats.anomalies,
      entropy: entropy
    };
    
    const collectedData = {
      time: currentTime,
      energy: energyMetrics,
      symmetry: symmetryMetrics,
      entropy,
      correlationLength,
      phaseCoherence,
      anomalyDensity
    };
    
    // Notify callback
    if (this.callbacks.onDataCollected) {
      this.callbacks.onDataCollected(collectedData);
    }
    
    return collectedData;
  }

  /**
   * Limit the number of data points to maxDataPoints
   * @private
   */
  _limitDataPoints() {
    const maxPoints = this.options.maxDataPoints;
    
    if (this.timeSeries.time.length > maxPoints) {
      const removeCount = this.timeSeries.time.length - maxPoints;
      
      this.timeSeries.time.splice(0, removeCount);
      this.timeSeries.energy.total.splice(0, removeCount);
      this.timeSeries.energy.average.splice(0, removeCount);
      this.timeSeries.energy.max.splice(0, removeCount);
      this.timeSeries.energy.min.splice(0, removeCount);
      this.timeSeries.symmetry.ratio.splice(0, removeCount);
      this.timeSeries.symmetry.symmetric.splice(0, removeCount);
      this.timeSeries.symmetry.asymmetric.splice(0, removeCount);
      this.timeSeries.symmetry.anomalies.splice(0, removeCount);
      this.timeSeries.entropy.splice(0, removeCount);
      this.timeSeries.correlationLength.splice(0, removeCount);
      this.timeSeries.phaseCoherence.splice(0, removeCount);
      this.timeSeries.anomalyDensity.splice(0, removeCount);
    }
  }

  /**
   * Update statistical accumulators
   * @private
   */
  _updateStatistics(energyMetrics, symmetryMetrics, entropy, anomalyCount) {
    this._updateAccumulator(this.statistics.energy, energyMetrics.total);
    this._updateAccumulator(this.statistics.symmetryRatio, symmetryMetrics.ratio);
    this._updateAccumulator(this.statistics.entropy, entropy);
    this._updateAccumulator(this.statistics.anomalyCount, anomalyCount);
  }

  /**
   * Update a single accumulator with a new value
   * @private
   */
  _updateAccumulator(accumulator, value) {
    accumulator.count++;
    accumulator.sum += value;
    accumulator.sumSquares += value * value;
    accumulator.min = Math.min(accumulator.min, value);
    accumulator.max = Math.max(accumulator.max, value);
    
    // Keep recent values for moving statistics
    accumulator.values.push(value);
    if (accumulator.values.length > 100) {
      accumulator.values.shift();
    }
  }

  /**
   * Calculate statistics for an accumulator
   * @param {Object} accumulator - The accumulator to calculate stats for
   * @returns {Object} Calculated statistics
   */
  calculateStatistics(accumulator) {
    if (accumulator.count === 0) {
      return {
        mean: 0,
        variance: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        count: 0
      };
    }
    
    const mean = accumulator.sum / accumulator.count;
    const variance = (accumulator.sumSquares / accumulator.count) - (mean * mean);
    const stdDev = Math.sqrt(Math.max(0, variance));
    
    return {
      mean,
      variance,
      stdDev,
      min: accumulator.min,
      max: accumulator.max,
      count: accumulator.count
    };
  }

  /**
   * Get all calculated statistics
   * @returns {Object} All statistics
   */
  getStatistics() {
    return {
      energy: this.calculateStatistics(this.statistics.energy),
      symmetryRatio: this.calculateStatistics(this.statistics.symmetryRatio),
      entropy: this.calculateStatistics(this.statistics.entropy),
      anomalyCount: this.calculateStatistics(this.statistics.anomalyCount)
    };
  }

  /**
   * Detect significant events in the simulation
   * @private
   */
  _detectEvents(energyMetrics, symmetryMetrics, entropy, anomalyCount) {
    const currentTime = this.simulation.time;
    
    // Energy spike detection
    const energyStats = this.calculateStatistics(this.statistics.energy);
    if (energyStats.count > 10) {
      const energyZScore = (energyMetrics.total - energyStats.mean) / (energyStats.stdDev || 1);
      if (Math.abs(energyZScore) > this.eventThresholds.energySpike) {
        this._addEvent({
          type: 'energySpike',
          time: currentTime,
          severity: Math.abs(energyZScore),
          data: {
            energy: energyMetrics.total,
            mean: energyStats.mean,
            zScore: energyZScore
          }
        });
      }
    }
    
    // Symmetry change detection
    const symmetryChange = Math.abs(symmetryMetrics.ratio - this.lastValues.symmetryRatio);
    if (symmetryChange > this.eventThresholds.symmetryChange) {
      this._addEvent({
        type: 'symmetryChange',
        time: currentTime,
        severity: symmetryChange,
        data: {
          oldRatio: this.lastValues.symmetryRatio,
          newRatio: symmetryMetrics.ratio,
          change: symmetryChange
        }
      });
    }
    
    // Anomaly burst detection
    const anomalyIncrease = anomalyCount - this.lastValues.anomalyCount;
    if (anomalyIncrease > this.eventThresholds.anomalyBurst) {
      this._addEvent({
        type: 'anomalyBurst',
        time: currentTime,
        severity: anomalyIncrease / this.eventThresholds.anomalyBurst,
        data: {
          newAnomalies: anomalyIncrease,
          totalAnomalies: anomalyCount
        }
      });
    }
    
    // Entropy jump detection
    const entropyChange = Math.abs(entropy - this.lastValues.entropy);
    if (entropyChange > this.eventThresholds.entropyJump) {
      this._addEvent({
        type: 'entropyJump',
        time: currentTime,
        severity: entropyChange / this.eventThresholds.entropyJump,
        data: {
          oldEntropy: this.lastValues.entropy,
          newEntropy: entropy,
          change: entropyChange
        }
      });
    }
  }

  /**
   * Add a detected event
   * @private
   */
  _addEvent(event) {
    this.events.push(event);
    
    // Limit event history
    if (this.events.length > 100) {
      this.events.shift();
    }
    
    if (this.callbacks.onEventDetected) {
      this.callbacks.onEventDetected(event);
    }
  }

  /**
   * Get all detected events
   * @param {string} type - Optional filter by event type
   * @returns {Array<Object>} Array of events
   */
  getEvents(type = null) {
    if (type) {
      return this.events.filter(e => e.type === type);
    }
    return [...this.events];
  }

  /**
   * Get time series data
   * @param {string} metric - Metric name (e.g., 'energy.total', 'symmetry.ratio')
   * @param {number} startTime - Optional start time filter
   * @param {number} endTime - Optional end time filter
   * @returns {Object} Time series data with time and values arrays
   */
  getTimeSeries(metric, startTime = null, endTime = null) {
    const parts = metric.split('.');
    let data = this.timeSeries;
    
    // Navigate to the requested metric
    for (const part of parts) {
      if (data[part] !== undefined) {
        data = data[part];
      } else {
        return { time: [], values: [] };
      }
    }
    
    // Filter by time range if specified
    if (startTime !== null || endTime !== null) {
      const filtered = { time: [], values: [] };
      
      for (let i = 0; i < this.timeSeries.time.length; i++) {
        const t = this.timeSeries.time[i];
        if ((startTime === null || t >= startTime) && (endTime === null || t <= endTime)) {
          filtered.time.push(t);
          filtered.values.push(data[i]);
        }
      }
      
      return filtered;
    }
    
    return {
      time: [...this.timeSeries.time],
      values: Array.isArray(data) ? [...data] : []
    };
  }

  /**
   * Calculate moving average for a metric
   * @param {string} metric - Metric name
   * @param {number} windowSize - Window size for moving average
   * @returns {Array<number>} Moving average values
   */
  calculateMovingAverage(metric, windowSize = 10) {
    const series = this.getTimeSeries(metric);
    const values = series.values;
    const movingAvg = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      movingAvg.push(avg);
    }
    
    return movingAvg;
  }

  /**
   * Calculate correlation between two metrics
   * @param {string} metric1 - First metric name
   * @param {string} metric2 - Second metric name
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  calculateCorrelation(metric1, metric2) {
    const series1 = this.getTimeSeries(metric1).values;
    const series2 = this.getTimeSeries(metric2).values;
    
    const n = Math.min(series1.length, series2.length);
    if (n === 0) return 0;
    
    // Calculate means
    const mean1 = series1.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = series2.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate correlation
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect trends in a metric
   * @param {string} metric - Metric name
   * @param {number} windowSize - Window size for trend detection
   * @returns {Object} Trend information
   */
  detectTrend(metric, windowSize = 50) {
    const series = this.getTimeSeries(metric).values;
    
    if (series.length < windowSize) {
      return { trend: 'insufficient_data', slope: 0, confidence: 0 };
    }
    
    // Use recent window
    const window = series.slice(-windowSize);
    
    // Calculate linear regression
    const n = window.length;
    const xMean = (n - 1) / 2;
    const yMean = window.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = window[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate R-squared for confidence
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = yMean + slope * (i - xMean);
      ssRes += Math.pow(window[i] - predicted, 2);
      ssTot += Math.pow(window[i] - yMean, 2);
    }
    
    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
    
    // Determine trend direction
    let trend = 'stable';
    if (Math.abs(slope) > 0.01) {
      trend = slope > 0 ? 'increasing' : 'decreasing';
    }
    
    return {
      trend,
      slope,
      confidence: rSquared
    };
  }

  /**
   * Reset all collected data
   */
  reset() {
    // Clear time series
    for (const key in this.timeSeries) {
      if (typeof this.timeSeries[key] === 'object' && !Array.isArray(this.timeSeries[key])) {
        for (const subKey in this.timeSeries[key]) {
          this.timeSeries[key][subKey] = [];
        }
      } else if (Array.isArray(this.timeSeries[key])) {
        this.timeSeries[key] = [];
      }
    }
    
    // Reset statistics
    for (const key in this.statistics) {
      this.statistics[key] = this._createStatAccumulator();
    }
    
    // Clear events
    this.events = [];
    
    // Reset counters
    this.sampleCount = 0;
    
    // Reset last values
    this.lastValues = {
      energy: 0,
      symmetryRatio: 0,
      anomalyCount: 0,
      entropy: 0
    };
  }

  /**
   * Register a callback for events
   * @param {string} event - Event name ('onEventDetected', 'onDataCollected')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback;
    }
    return this;
  }

  /**
   * Export all collected data
   * @returns {Object} Exportable data
   */
  export() {
    return {
      timeSeries: this.timeSeries,
      statistics: this.getStatistics(),
      events: this.events,
      options: this.options
    };
  }
}
