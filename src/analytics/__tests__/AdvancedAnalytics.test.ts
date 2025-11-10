/**
 * Tests for AdvancedAnalytics
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { AdvancedAnalytics } from '../AdvancedAnalytics.js';
import { Simulation } from '../../core/Simulation.js';
import { Lattice } from '../../core/Lattice.js';

describe('AdvancedAnalytics', () => {
  let analytics: AdvancedAnalytics;
  let simulation: Simulation;
  let lattice: Lattice;

  beforeEach(() => {
    lattice = new Lattice(8, 8, 8);
    simulation = new Simulation(lattice, {
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      energyThreshold: 1.0,
      interactionRange: 2,
      waveSpeed: 0.5,
      timeStep: 1.0
    });

    analytics = new AdvancedAnalytics({
      kx: 6,
      latticeSize: 8,
      E_0_ref: 1.0,
      maxLogEntries: 100
    });
  });

  describe('Initialization', () => {
    test('should create analytics instance', () => {
      expect(analytics).toBeDefined();
    });

    test('should have all components', () => {
      const components = analytics.getComponents();
      expect(components.photonWindow).toBeDefined();
      expect(components.statistics).toBeDefined();
      expect(components.driftMonitor).toBeDefined();
      expect(components.amplitudeTracker).toBeDefined();
      expect(components.logger).toBeDefined();
    });
  });

  describe('Update', () => {
    test('should update analytics with simulation state', () => {
      analytics.update(simulation);
      const metrics = analytics.getMetrics();
      
      expect(metrics.statistics).toBeDefined();
      expect(metrics.drift).toBeDefined();
      expect(metrics.amplitude).toBeDefined();
      expect(metrics.logEntryCount).toBeGreaterThan(0);
    });

    test('should track multiple updates', () => {
      for (let i = 0; i < 10; i++) {
        simulation.step();
        analytics.update(simulation);
      }

      const metrics = analytics.getMetrics();
      expect(metrics.logEntryCount).toBe(10);
    });
  });

  describe('Stats Panel Data', () => {
    test('should provide formatted stats', () => {
      analytics.update(simulation);
      const stats = analytics.getStatsPanelData();
      
      expect(stats.rho).toBeDefined();
      expect(stats.drift).toBeDefined();
      expect(stats.rmsAkx).toBeDefined();
      
      expect(typeof stats.rho).toBe('string');
      expect(typeof stats.drift).toBe('string');
      expect(typeof stats.rmsAkx).toBe('string');
    });
  });

  describe('Photon Window Test', () => {
    test('should run photon window test', async () => {
      const result = await analytics.runPhotonWindowTest(simulation, 10);
      
      expect(result).toBeDefined();
      expect(result.hammingDistance).toBeDefined();
      expect(result.reversibilityRatio).toBeDefined();
      expect(result.passed).toBeDefined();
      expect(result.steps).toBe(10);
    });
  });

  describe('Export', () => {
    test('should export stats to CSV', () => {
      analytics.update(simulation);
      const csv = analytics.exportStatsToCSV();
      
      expect(csv).toContain('t,rho,drift_mean,drift_max,Akx_rms');
      expect(csv.split('\n').length).toBeGreaterThan(1);
    });

    test('should export log to text', () => {
      analytics.update(simulation);
      const log = analytics.exportLogToText();
      
      expect(log).toContain('t=');
      expect(log).toContain('E0=');
    });

    test('should export log to CSV', () => {
      analytics.update(simulation);
      const csv = analytics.exportLogToCSV();
      
      expect(csv).toContain('t,E0,E_sym,E_asym,A_kx');
    });
  });

  describe('Reset', () => {
    test('should reset all analytics', () => {
      analytics.update(simulation);
      analytics.update(simulation);
      
      let metrics = analytics.getMetrics();
      expect(metrics.logEntryCount).toBe(2);
      
      analytics.reset();
      
      metrics = analytics.getMetrics();
      expect(metrics.logEntryCount).toBe(0);
    });
  });

  describe('Wave Number', () => {
    test('should update wave number', () => {
      analytics.setKx(8);
      analytics.update(simulation);
      
      const metrics = analytics.getMetrics();
      expect(metrics.amplitude).toBeDefined();
    });
  });
});
