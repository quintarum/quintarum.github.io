/**
 * Tests for AuthorPhysics - validates against reference implementation
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { AuthorPhysics } from '../AuthorPhysics.js';
import { Lattice } from '../Lattice.js';

describe('AuthorPhysics', () => {
  let physics: AuthorPhysics;
  let lattice: Lattice;
  const N = 8;

  beforeEach(() => {
    physics = new AuthorPhysics(N, 6);
    lattice = new Lattice(N, N, N);
    physics.initializeLattice(lattice);
  });

  describe('Initialization', () => {
    test('should initialize lattice with cosine wave pattern', () => {
      const node0 = lattice.getNode(0, 0, 0);
      expect(node0?.spin).toBe(1);

      let positiveCount = 0;
      let negativeCount = 0;

      for (let x = 0; x < N; x++) {
        const node = lattice.getNode(x, 0, 0);
        if (node) {
          if (node.spin > 0) positiveCount++;
          else negativeCount++;
        }
      }

      expect(positiveCount).toBeGreaterThan(0);
      expect(negativeCount).toBeGreaterThan(0);
    });
  });

  describe('Energy Conservation', () => {
    test('should conserve total energy E_0', () => {
      const initial = physics.calculateEnergy(lattice);
      const initialE0 = initial.E_0;

      for (let i = 0; i < 100; i++) {
        physics.step(lattice);
      }

      const final = physics.calculateEnergy(lattice);
      expect(final.E_0).toBe(initialE0);
    });

    test('should maintain E_sym + E_asym = E_0', () => {
      for (let i = 0; i < 50; i++) {
        physics.step(lattice);
        const energy = physics.calculateEnergy(lattice);
        expect(energy.E_sym + energy.E_asym).toBe(energy.E_0);
      }
    });

    test('should have E_0_norm approximately 1', () => {
      const energy = physics.calculateEnergy(lattice);
      expect(energy.E_0_norm).toBeCloseTo(1.0, 2);
    });
  });

  describe('Photon Window Test', () => {
    test('should pass reversibility test with 10 steps', async () => {
      const result = await physics.photonWindowTest(lattice, 10);
      expect(result.passed).toBe(true);
      expect(result.ratio).toBeLessThan(0.001);
    });

    test('should pass reversibility test with 100 steps', async () => {
      const result = await physics.photonWindowTest(lattice, 100);
      expect(result.passed).toBe(true);
      expect(result.hammingDistance).toBe(0);
    });

    test('should restore exact initial state', async () => {
      const initialSpins: number[] = [];
      for (let z = 0; z < N; z++) {
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const node = lattice.getNode(x, y, z);
            initialSpins.push(node?.spin ?? 0);
          }
        }
      }

      await physics.photonWindowTest(lattice, 50);

      let idx = 0;
      for (let z = 0; z < N; z++) {
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const node = lattice.getNode(x, y, z);
            expect(node?.spin).toBe(initialSpins[idx]);
            idx++;
          }
        }
      }
    });
  });

  describe('Fourier Mode', () => {
    test('should calculate mode amplitude', () => {
      const mode = physics.calculateFourierMode(lattice);
      expect(mode.k_x).toBe(6);
      expect(mode.amplitude).toBeGreaterThan(0);
      expect(mode.normalized).toBeGreaterThan(0);
      expect(mode.normalized).toBeLessThanOrEqual(1);
    });

    test('should have high amplitude for matching k_x', () => {
      physics.setKx(6);
      physics.initializeLattice(lattice);
      
      const mode = physics.calculateFourierMode(lattice);
      expect(mode.normalized).toBeGreaterThan(0.3);
    });
  });

  describe('Swap Dynamics', () => {
    test('should complete 6-phase cycle', () => {
      const initialPhase = physics.getPhaseStep();
      expect(initialPhase).toBe(0);

      for (let i = 0; i < 6; i++) {
        physics.step(lattice);
      }

      expect(physics.getPhaseStep()).toBe(0);
    });

    test('should be reversible step-by-step', () => {
      const initialSpins = new Map<string, number>();
      for (let z = 0; z < N; z++) {
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const node = lattice.getNode(x, y, z);
            if (node) {
              initialSpins.set(`${x},${y},${z}`, node.spin);
            }
          }
        }
      }

      physics.step(lattice);
      physics.reverseStep(lattice);

      for (let z = 0; z < N; z++) {
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const node = lattice.getNode(x, y, z);
            const key = `${x},${y},${z}`;
            expect(node?.spin).toBe(initialSpins.get(key));
          }
        }
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle single step forward and back', async () => {
      const result = await physics.photonWindowTest(lattice, 1);
      expect(result.passed).toBe(true);
    });

    test('should handle zero steps', async () => {
      const result = await physics.photonWindowTest(lattice, 0);
      expect(result.passed).toBe(true);
      expect(result.hammingDistance).toBe(0);
    });

    test('should handle different k_x values', () => {
      for (const kx of [1, 2, 4, 8]) {
        physics.setKx(kx);
        physics.initializeLattice(lattice);
        const mode = physics.calculateFourierMode(lattice);
        expect(mode.k_x).toBe(kx);
      }
    });
  });
});
