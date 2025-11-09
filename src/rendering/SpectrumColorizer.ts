/**
 * SpectrumColorizer - HSL color mapping for wave visualization
 * 
 * Maps node colors to wave phase based on wave number k_x.
 * Precomputes color lookup tables (LUTs) for performance.
 * 
 * Based on the author's reference implementation.
 */

import { Node } from '../core/Node.js';

export interface ColorLUTs {
  bright: Float32Array;
  dark: Float32Array;
}

export class SpectrumColorizer {
  private brightLUT: Float32Array;
  private darkLUT: Float32Array;
  private kx: number;
  private N: number;
  private readonly SAT_PCT = 90;
  private readonly L_BRIGHT = 70;
  private readonly L_DARK = 30;

  /**
   * Create a new SpectrumColorizer
   * @param kx - Wave number (mode index)
   * @param N - Lattice size
   */
  constructor(kx: number, N: number) {
    this.kx = kx;
    this.N = N;
    
    const nodeCount = N * N * N;
    this.brightLUT = new Float32Array(nodeCount * 3);
    this.darkLUT = new Float32Array(nodeCount * 3);
    
    this.rebuildLUTs();
  }

  /**
   * Rebuild color lookup tables when kx or N changes
   */
  private rebuildLUTs(): void {
    let idx = 0;
    
    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          // Calculate hue based on wave phase
          const base = ((x * this.kx) % this.N) / (this.N - 1);
          const hue = (270 + 360 * base) % 360;
          
          // Generate bright and dark colors
          const [rb, gb, bb] = this.hslToRgb(hue, this.SAT_PCT, this.L_BRIGHT);
          const [rd, gd, bd] = this.hslToRgb(hue, this.SAT_PCT, this.L_DARK);
          
          this.brightLUT[idx] = rb;
          this.brightLUT[idx + 1] = gb;
          this.brightLUT[idx + 2] = bb;
          
          this.darkLUT[idx] = rd;
          this.darkLUT[idx + 1] = gd;
          this.darkLUT[idx + 2] = bd;
          
          idx += 3;
        }
      }
    }
  }

  /**
   * Convert HSL to RGB
   * @param h - Hue (0-360)
   * @param s - Saturation (0-100)
   * @param l - Lightness (0-100)
   * @returns RGB values in range [0, 1]
   */
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= hp && hp < 1) {
      r = c; g = x;
    } else if (1 <= hp && hp < 2) {
      r = x; g = c;
    } else if (2 <= hp && hp < 3) {
      g = c; b = x;
    } else if (3 <= hp && hp < 4) {
      g = x; b = c;
    } else if (4 <= hp && hp < 5) {
      r = x; b = c;
    } else if (5 <= hp && hp < 6) {
      r = c; b = x;
    }
    
    const m = l - c / 2;
    return [r + m, g + m, b + m];
  }

  /**
   * Colorize nodes based on spin state
   * @param nodes - Array of nodes to colorize
   * @param colors - Output color array (RGB, interleaved)
   */
  colorize(nodes: Node[], colors: Float32Array): void {
    for (let i = 0; i < nodes.length; i++) {
      const offset = i * 3;
      const lut = nodes[i].spin > 0 ? this.brightLUT : this.darkLUT;
      
      colors[offset] = lut[offset];
      colors[offset + 1] = lut[offset + 1];
      colors[offset + 2] = lut[offset + 2];
    }
  }

  /**
   * Get color for a specific node
   * @param node - Node to get color for
   * @returns RGB color in range [0, 1]
   */
  getNodeColor(node: Node): [number, number, number] {
    const index = this.getNodeIndex(node);
    const offset = index * 3;
    const lut = node.spin > 0 ? this.brightLUT : this.darkLUT;
    
    return [lut[offset], lut[offset + 1], lut[offset + 2]];
  }

  /**
   * Calculate node index in flat array
   */
  private getNodeIndex(node: Node): number {
    const { x, y, z } = node.position;
    return z * (this.N * this.N) + y * this.N + x;
  }

  /**
   * Update wave number and rebuild LUTs
   * @param kx - New wave number
   */
  setKx(kx: number): void {
    this.kx = kx;
    this.rebuildLUTs();
  }

  /**
   * Get current wave number
   */
  getKx(): number {
    return this.kx;
  }

  /**
   * Get lattice size
   */
  getN(): number {
    return this.N;
  }

  /**
   * Get color LUTs for direct access
   */
  getLUTs(): ColorLUTs {
    return {
      bright: this.brightLUT,
      dark: this.darkLUT
    };
  }

  /**
   * Create simple white/gray colorizer (non-spectrum mode)
   */
  static createSimple(N: number): SpectrumColorizer {
    const colorizer = new SpectrumColorizer(0, N);
    
    // Override LUTs with white/gray
    const nodeCount = N * N * N;
    for (let i = 0; i < nodeCount * 3; i += 3) {
      colorizer.brightLUT[i] = 1.0;
      colorizer.brightLUT[i + 1] = 1.0;
      colorizer.brightLUT[i + 2] = 1.0;
      
      colorizer.darkLUT[i] = 0.2;
      colorizer.darkLUT[i + 1] = 0.2;
      colorizer.darkLUT[i + 2] = 0.2;
    }
    
    return colorizer;
  }
}
