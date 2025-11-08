import { Physics } from '../core/Physics.js';
import { Simulation } from '../core/Simulation.js';

 
type AnyRecord = any;

interface CollectorOptions {
  maxDataPoints?: number;
  samplingInterval?: number;
  detectEvents?: boolean;
}

interface EnergyMetrics {
  total: number;
  average: number;
  max: number;
  min: number;
}

interface SymmetryMetrics {
  ratio: number;
  symmetric: number;
  asymmetric: number;
  anomalies: number;
}

interface TimeSeriesData {
  time: number[];
  energy: {
    total: number[];
    average: number[];
    max: number[];
    min: number[];
    distribution: number[];
  };
  symmetry: {
    ratio: number[];
    symmetric: number[];
    asymmetric: number[];
    anomalies: number[];
  };
  entropy: number[];
  correlationLength: number[];
  phaseCoherence: number[];
  anomalyDensity: number[];
}

interface StatAccumulator {
  count: number;
  sum: number;
  sumSquares: number;
  min: number;
  max: number;
  values: number[];
}

interface CalculatedStatistics {
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
}

interface DetectedEvent {
  type: 'energySpike' | 'symmetryChange' | 'anomalyBurst' | 'entropyJump';
  time: number;
  severity: number;
  data: Record<string, number>;
}

interface CollectedData {
  time: number;
  energy: EnergyMetrics;
  symmetry: SymmetryMetrics;
  entropy: number;
  correlationLength: number;
  phaseCoherence: number;
  anomalyDensity: number;
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  slope: number;
  confidence: number;
}

interface MetricsCallbacks {
  onEventDetected: ((event: DetectedEvent) => void) | null;
  onDataCollected: ((data: CollectedData) => void) | null;
}

/**
 * MetricsCollector class for real-time analytics and data collection
 * Collects, analyzes, and tracks simulation metrics over time
 */
export class MetricsCollector {
  private simulation: Simulation;
  private options: Required<CollectorOptions>;
  private timeSeries: TimeSeriesData;
  private statistics: Record<string, StatAccumulator>;
  private events: DetectedEvent[] = [];
  private eventThresholds: Record<string, number>;
  private lastValues: Record<string, number>;
  private sampleCount: number = 0;
  private callbacks: MetricsCallbacks;

  constructor(simulation: Simulation, options: CollectorOptions = {}) {
    this.simulation = simulation;
    
    this.options = {
      maxDataPoints: options.maxDataPoints ?? 1000,
      samplingInterval: options.samplingInterval ?? 1,
      detectEvents: options.detectEvents ?? true
    };
    
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
    
    this.statistics = {
      energy: this._createStatAccumulator(),
      symmetryRatio: this._createStatAccumulator(),
      entropy: this._createStatAccumulator(),
      anomalyCount: this._createStatAccumulator()
    };
    
    this.eventThresholds = {
      energySpike: 2.0,
      symmetryChange: 0.3,
      anomalyBurst: 10,
      entropyJump: 0.5
    };
    
    this.lastValues = {
      energy: 0,
      symmetryRatio: 0,
      anomalyCount: 0,
      entropy: 0
    };
    
    this.callbacks = {
      onEventDetected: null,
      onDataCollected: null
    };
  }

  private _createStatAccumulator(): StatAccumulator {
    return {
      count: 0,
      sum: 0,
      sumSquares: 0,
      min: Infinity,
      max: -Infinity,
      values: []
    };
  }

  collect(): CollectedData | null {
    this.sampleCount++;
    
    if (this.sampleCount % this.options.samplingInterval !== 0) {
      return null;
    }
    
    const lattice = this.simulation.lattice;
    const stats = lattice.getStatistics();
    const currentTime = this.simulation.time;
    
    const energyMetrics: EnergyMetrics = {
      total: stats.totalEnergy,
      average: stats.avgEnergy,
      max: stats.maxEnergy,
      min: stats.minEnergy
    };
    
    const symmetryMetrics: SymmetryMetrics = {
      ratio: stats.symmetric / stats.total,
      symmetric: stats.symmetric,
      asymmetric: stats.asymmetric,
      anomalies: stats.anomalies
    };
    
    const entropy = Physics.calculateEntropy(lattice);
    const correlationLength = Physics.calculateCorrelationLength(lattice);
    const phaseCoherence = Physics.calculatePhaseCoherence(lattice.nodes);
    const anomalyDensity = stats.anomalies / stats.total;
    
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
    
    this._limitDataPoints();
    this._updateStatistics(energyMetrics, symmetryMetrics, entropy, stats.anomalies);
    
    if (this.options.detectEvents) {
      this._detectEvents(energyMetrics, symmetryMetrics, entropy, stats.anomalies);
    }
    
    this.lastValues = {
      energy: energyMetrics.total,
      symmetryRatio: symmetryMetrics.ratio,
      anomalyCount: stats.anomalies,
      entropy: entropy
    };
    
    const collectedData: CollectedData = {
      time: currentTime,
      energy: energyMetrics,
      symmetry: symmetryMetrics,
      entropy,
      correlationLength,
      phaseCoherence,
      anomalyDensity
    };
    
    if (this.callbacks.onDataCollected) {
      this.callbacks.onDataCollected(collectedData);
    }
    
    return collectedData;
  }

  private _limitDataPoints(): void {
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

  private _updateStatistics(
    energyMetrics: EnergyMetrics,
    symmetryMetrics: SymmetryMetrics,
    entropy: number,
    anomalyCount: number
  ): void {
    this._updateAccumulator(this.statistics.energy, energyMetrics.total);
    this._updateAccumulator(this.statistics.symmetryRatio, symmetryMetrics.ratio);
    this._updateAccumulator(this.statistics.entropy, entropy);
    this._updateAccumulator(this.statistics.anomalyCount, anomalyCount);
  }

  private _updateAccumulator(accumulator: StatAccumulator, value: number): void {
    accumulator.count++;
    accumulator.sum += value;
    accumulator.sumSquares += value * value;
    accumulator.min = Math.min(accumulator.min, value);
    accumulator.max = Math.max(accumulator.max, value);
    
    accumulator.values.push(value);
    if (accumulator.values.length > 100) {
      accumulator.values.shift();
    }
  }

  calculateStatistics(accumulator: StatAccumulator): CalculatedStatistics {
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

  getStatistics(): Record<string, CalculatedStatistics> {
    return {
      energy: this.calculateStatistics(this.statistics.energy),
      symmetryRatio: this.calculateStatistics(this.statistics.symmetryRatio),
      entropy: this.calculateStatistics(this.statistics.entropy),
      anomalyCount: this.calculateStatistics(this.statistics.anomalyCount)
    };
  }

  private _detectEvents(
    energyMetrics: EnergyMetrics,
    symmetryMetrics: SymmetryMetrics,
    entropy: number,
    anomalyCount: number
  ): void {
    const currentTime = this.simulation.time;
    
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

  private _addEvent(event: DetectedEvent): void {
    this.events.push(event);
    
    if (this.events.length > 100) {
      this.events.shift();
    }
    
    if (this.callbacks.onEventDetected) {
      this.callbacks.onEventDetected(event);
    }
  }

  getEvents(type: DetectedEvent['type'] | null = null): DetectedEvent[] {
    if (type) {
      return this.events.filter(e => e.type === type);
    }
    return [...this.events];
  }

  getTimeSeries(
    metric: string,
    startTime: number | null = null,
    endTime: number | null = null
  ): { time: number[]; values: number[] } {
    const parts = metric.split('.');
    let data: AnyRecord = this.timeSeries;
    
    for (const part of parts) {
      if (data[part] !== undefined) {
        data = data[part];
      } else {
        return { time: [], values: [] };
      }
    }
    
    if (startTime !== null || endTime !== null) {
      const filtered = { time: [] as number[], values: [] as number[] };
      
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

  calculateMovingAverage(metric: string, windowSize: number = 10): number[] {
    const series = this.getTimeSeries(metric);
    const values = series.values;
    const movingAvg: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      movingAvg.push(avg);
    }
    
    return movingAvg;
  }

  calculateCorrelation(metric1: string, metric2: string): number {
    const series1 = this.getTimeSeries(metric1).values;
    const series2 = this.getTimeSeries(metric2).values;
    
    const n = Math.min(series1.length, series2.length);
    if (n === 0) return 0;
    
    const mean1 = series1.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = series2.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
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

  detectTrend(metric: string, windowSize: number = 50): TrendAnalysis {
    const series = this.getTimeSeries(metric).values;
    
    if (series.length < windowSize) {
      return { trend: 'insufficient_data', slope: 0, confidence: 0 };
    }
    
    const window = series.slice(-windowSize);
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
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = yMean + slope * (i - xMean);
      ssRes += Math.pow(window[i] - predicted, 2);
      ssTot += Math.pow(window[i] - yMean, 2);
    }
    
    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
    
    let trend: TrendAnalysis['trend'] = 'stable';
    if (Math.abs(slope) > 0.01) {
      trend = slope > 0 ? 'increasing' : 'decreasing';
    }
    
    return {
      trend,
      slope,
      confidence: rSquared
    };
  }

  reset(): void {
    for (const key in this.timeSeries) {
      const value = this.timeSeries[key as keyof TimeSeriesData];
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const subKey in value) {
          (value as any)[subKey] = [];
        }
      } else if (Array.isArray(value)) {
        (this.timeSeries as any)[key] = [];
      }
    }
    
    for (const key in this.statistics) {
      this.statistics[key] = this._createStatAccumulator();
    }
    
    this.events = [];
    this.sampleCount = 0;
    
    this.lastValues = {
      energy: 0,
      symmetryRatio: 0,
      anomalyCount: 0,
      entropy: 0
    };
  }

  on(event: keyof MetricsCallbacks, callback: MetricsCallbacks[keyof MetricsCallbacks]): this {
    if (event in this.callbacks) {
      this.callbacks[event] = callback as any;
    }
    return this;
  }

  /**
   * Perform Fourier analysis to detect periodicity in data
   */
  calculateFourierAnalysis(metric: string): {
    frequencies: number[];
    amplitudes: number[];
    dominantFrequency: number;
    dominantPeriod: number;
  } {
    const series = this.getTimeSeries(metric).values;
    const n = series.length;

    if (n < 4) {
      return {
        frequencies: [],
        amplitudes: [],
        dominantFrequency: 0,
        dominantPeriod: 0,
      };
    }

    // Simple DFT (Discrete Fourier Transform)
    const frequencies: number[] = [];
    const amplitudes: number[] = [];

    // Only calculate for first half of frequencies (Nyquist limit)
    const maxFreq = Math.floor(n / 2);

    for (let k = 0; k < maxFreq; k++) {
      let real = 0;
      let imag = 0;

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += series[t] * Math.cos(angle);
        imag += series[t] * Math.sin(angle);
      }

      const amplitude = Math.sqrt(real * real + imag * imag) / n;
      const frequency = k / n;

      frequencies.push(frequency);
      amplitudes.push(amplitude);
    }

    // Find dominant frequency (excluding DC component at k=0)
    let maxAmplitude = 0;
    let dominantIndex = 0;

    for (let i = 1; i < amplitudes.length; i++) {
      if (amplitudes[i] > maxAmplitude) {
        maxAmplitude = amplitudes[i];
        dominantIndex = i;
      }
    }

    const dominantFrequency = frequencies[dominantIndex] || 0;
    const dominantPeriod = dominantFrequency > 0 ? 1 / dominantFrequency : 0;

    return {
      frequencies,
      amplitudes,
      dominantFrequency,
      dominantPeriod,
    };
  }

  /**
   * Detect if a metric shows periodic behavior
   */
  detectPeriodicity(metric: string, threshold: number = 0.1): {
    isPeriodic: boolean;
    period: number;
    confidence: number;
  } {
    const fourier = this.calculateFourierAnalysis(metric);

    if (fourier.amplitudes.length === 0) {
      return { isPeriodic: false, period: 0, confidence: 0 };
    }

    // Calculate total power
    const totalPower = fourier.amplitudes.reduce((sum, amp) => sum + amp * amp, 0);

    // Find dominant frequency power (excluding DC)
    const dominantPower =
      fourier.amplitudes.length > 1
        ? Math.max(...fourier.amplitudes.slice(1).map((a) => a * a))
        : 0;

    // Confidence is ratio of dominant frequency power to total power
    const confidence = totalPower > 0 ? dominantPower / totalPower : 0;

    return {
      isPeriodic: confidence > threshold,
      period: fourier.dominantPeriod,
      confidence,
    };
  }

  /**
   * Perform statistical significance test (t-test) between two metrics
   */
  performTTest(
    metric1: string,
    metric2: string
  ): {
    tStatistic: number;
    pValue: number;
    significant: boolean;
    degreesOfFreedom: number;
  } {
    const series1 = this.getTimeSeries(metric1).values;
    const series2 = this.getTimeSeries(metric2).values;

    const n1 = series1.length;
    const n2 = series2.length;

    if (n1 < 2 || n2 < 2) {
      return {
        tStatistic: 0,
        pValue: 1,
        significant: false,
        degreesOfFreedom: 0,
      };
    }

    // Calculate means
    const mean1 = series1.reduce((sum, val) => sum + val, 0) / n1;
    const mean2 = series2.reduce((sum, val) => sum + val, 0) / n2;

    // Calculate variances
    const var1 =
      series1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 =
      series2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);

    // Pooled standard deviation
    const pooledStd = Math.sqrt(var1 / n1 + var2 / n2);

    // t-statistic
    const tStatistic = pooledStd > 0 ? (mean1 - mean2) / pooledStd : 0;

    // Degrees of freedom (Welch-Satterthwaite equation)
    const df =
      var1 / n1 + var2 / n2 > 0
        ? Math.pow(var1 / n1 + var2 / n2, 2) /
          (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))
        : 0;

    // Approximate p-value using t-distribution approximation
    // For simplicity, using normal approximation for large samples
    const pValue = this._approximatePValue(Math.abs(tStatistic), df);

    return {
      tStatistic,
      pValue,
      significant: pValue < 0.05, // 5% significance level
      degreesOfFreedom: df,
    };
  }

  /**
   * Approximate p-value for t-test
   * Uses normal approximation for large df, more accurate for df > 30
   */
  private _approximatePValue(t: number, df: number): number {
    if (df < 1) return 1;

    // For large df, t-distribution approaches normal distribution
    if (df > 30) {
      // Standard normal approximation
      return 2 * (1 - this._normalCDF(t));
    }

    // For smaller df, use a simple approximation
    // This is a rough approximation and not as accurate as proper t-distribution
    const x = df / (df + t * t);
    const p = 1 - Math.pow(x, df / 2);

    return Math.min(1, Math.max(0, p));
  }

  /**
   * Cumulative distribution function for standard normal distribution
   */
  private _normalCDF(x: number): number {
    // Approximation using error function
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return x > 0 ? 1 - p : p;
  }

  /**
   * Calculate autocorrelation for a metric at different lags
   */
  calculateAutocorrelation(metric: string, maxLag: number = 50): number[] {
    const series = this.getTimeSeries(metric).values;
    const n = series.length;

    if (n < 2) return [];

    const mean = series.reduce((sum, val) => sum + val, 0) / n;
    const variance = series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    if (variance === 0) return Array(maxLag).fill(0);

    const autocorr: number[] = [];

    for (let lag = 0; lag < Math.min(maxLag, n); lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += (series[i] - mean) * (series[i + lag] - mean);
      }
      autocorr.push(sum / (n * variance));
    }

    return autocorr;
  }

  /**
   * Detect anomalies in time series using statistical methods
   */
  detectAnomalies(
    metric: string,
    threshold: number = 3
  ): Array<{ index: number; value: number; zScore: number }> {
    const series = this.getTimeSeries(metric).values;
    const n = series.length;

    if (n < 10) return [];

    const mean = series.reduce((sum, val) => sum + val, 0) / n;
    const stdDev = Math.sqrt(
      series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    );

    if (stdDev === 0) return [];

    const anomalies: Array<{ index: number; value: number; zScore: number }> = [];

    for (let i = 0; i < n; i++) {
      const zScore = (series[i] - mean) / stdDev;
      if (Math.abs(zScore) > threshold) {
        anomalies.push({
          index: i,
          value: series[i],
          zScore,
        });
      }
    }

    return anomalies;
  }

  export(): {
    timeSeries: TimeSeriesData;
    statistics: Record<string, CalculatedStatistics>;
    events: DetectedEvent[];
    options: Required<CollectorOptions>;
  } {
    return {
      timeSeries: this.timeSeries,
      statistics: this.getStatistics(),
      events: this.events,
      options: this.options
    };
  }
}
