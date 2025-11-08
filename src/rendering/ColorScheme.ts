import { Node } from '../core/Node.js';

type Theme = 'light' | 'dark';
type PaletteName = 'default' | 'energy' | 'phase';

interface ColorPair {
  base: string;
  glow: string;
}

interface ThemeColors {
  background: string;
  grid: string;
  connection: string;
  text: string;
  [key: string]: string | ColorPair;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface LegendEntry {
  color: string;
  label: string;
  description: string;
}

/**
 * ColorScheme class - Manages color palettes and mappings for visualization
 * Provides scientifically-informed color schemes with theme support
 */
export class ColorScheme {
  private theme: Theme;
  private currentPalette: PaletteName;
  private palettes: Record<PaletteName, Record<Theme, ThemeColors>>;

  constructor(theme: Theme = 'light') {
    this.theme = theme;
    this.currentPalette = 'default';
     
    this.palettes = {} as any;
    this.initializePalettes();
  }

  private initializePalettes(): void {
    this.palettes = {
      default: {
        light: {
          symmetric: { base: '#4A90E2', glow: '#6BA3E8' },
          asymmetric: { base: '#F5A623', glow: '#F7B84E' },
          anomaly: { base: '#E74C3C', glow: '#EC7063' },
          background: '#F8F9FA',
          grid: '#DEE2E6',
          connection: '#ADB5BD',
          text: '#212529'
        },
        dark: {
          symmetric: { base: '#5DADE2', glow: '#85C1E9' },
          asymmetric: { base: '#F39C12', glow: '#F8C471' },
          anomaly: { base: '#EC7063', glow: '#F1948A' },
          background: '#1A1A1A',
          grid: '#2C2C2C',
          connection: '#4A4A4A',
          text: '#E8E8E8'
        }
      },
      energy: {
        light: {
          low: { base: '#3498DB', glow: '#5DADE2' },
          medium: { base: '#2ECC71', glow: '#58D68D' },
          high: { base: '#F39C12', glow: '#F8C471' },
          veryHigh: { base: '#E74C3C', glow: '#EC7063' },
          background: '#F8F9FA',
          grid: '#DEE2E6',
          connection: '#ADB5BD',
          text: '#212529'
        },
        dark: {
          low: { base: '#5DADE2', glow: '#85C1E9' },
          medium: { base: '#58D68D', glow: '#82E0AA' },
          high: { base: '#F8C471', glow: '#FAD7A0' },
          veryHigh: { base: '#EC7063', glow: '#F1948A' },
          background: '#1A1A1A',
          grid: '#2C2C2C',
          connection: '#4A4A4A',
          text: '#E8E8E8'
        }
      },
      phase: {
        light: {
          phase0: { base: '#9B59B6', glow: '#BB8FCE' },
          phase90: { base: '#3498DB', glow: '#5DADE2' },
          phase180: { base: '#2ECC71', glow: '#58D68D' },
          phase270: { base: '#F39C12', glow: '#F8C471' },
          background: '#F8F9FA',
          grid: '#DEE2E6',
          connection: '#ADB5BD',
          text: '#212529'
        },
        dark: {
          phase0: { base: '#BB8FCE', glow: '#D7BDE2' },
          phase90: { base: '#5DADE2', glow: '#85C1E9' },
          phase180: { base: '#58D68D', glow: '#82E0AA' },
          phase270: { base: '#F8C471', glow: '#FAD7A0' },
          background: '#1A1A1A',
          grid: '#2C2C2C',
          connection: '#4A4A4A',
          text: '#E8E8E8'
        }
      }
    };
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
  }

  setPalette(palette: PaletteName): void {
    if (this.palettes[palette]) {
      this.currentPalette = palette;
    }
  }

  getNodeColor(node: Node): ColorPair {
    const palette = this.palettes[this.currentPalette][this.theme];
    
    if (this.currentPalette === 'default') {
      return (palette[node.state] as ColorPair) || (palette.symmetric as ColorPair);
    } else if (this.currentPalette === 'energy') {
      return this.getEnergyColor(node.energy);
    } else if (this.currentPalette === 'phase') {
      return this.getPhaseColor(node.phase);
    }
    
    return palette.symmetric as ColorPair;
  }

  getEnergyColor(energy: number): ColorPair {
    const palette = this.palettes.energy[this.theme];
    
    if (energy < 0.25) {
      return palette.low as ColorPair;
    } else if (energy < 0.5) {
      return palette.medium as ColorPair;
    } else if (energy < 0.75) {
      return palette.high as ColorPair;
    } else {
      return palette.veryHigh as ColorPair;
    }
  }

  getPhaseColor(phase: number): ColorPair {
    const palette = this.palettes.phase[this.theme];
    const normalizedPhase = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const phaseDegrees = (normalizedPhase * 180) / Math.PI;
    
    if (phaseDegrees < 45 || phaseDegrees >= 315) {
      return palette.phase0 as ColorPair;
    } else if (phaseDegrees < 135) {
      return palette.phase90 as ColorPair;
    } else if (phaseDegrees < 225) {
      return palette.phase180 as ColorPair;
    } else {
      return palette.phase270 as ColorPair;
    }
  }

  interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return this.rgbToHex(r, g, b);
  }

  hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  getBackgroundColor(): string {
    return this.palettes[this.currentPalette][this.theme].background;
  }

  getGridColor(): string {
    return this.palettes[this.currentPalette][this.theme].grid;
  }

  getConnectionColor(): string {
    return this.palettes[this.currentPalette][this.theme].connection;
  }

  getTextColor(): string {
    return this.palettes[this.currentPalette][this.theme].text;
  }

  generateLegend(): LegendEntry[] {
    const legends: Record<PaletteName, LegendEntry[]> = {
      default: [
        { color: (this.palettes.default[this.theme].symmetric as ColorPair).base, label: 'Symmetric', description: 'Nodes in symmetric state' },
        { color: (this.palettes.default[this.theme].asymmetric as ColorPair).base, label: 'Asymmetric', description: 'Nodes in asymmetric state' },
        { color: (this.palettes.default[this.theme].anomaly as ColorPair).base, label: 'Anomaly', description: 'Symmetry anomaly nodes' }
      ],
      energy: [
        { color: (this.palettes.energy[this.theme].low as ColorPair).base, label: 'Low Energy', description: 'Energy < 25%' },
        { color: (this.palettes.energy[this.theme].medium as ColorPair).base, label: 'Medium Energy', description: 'Energy 25-50%' },
        { color: (this.palettes.energy[this.theme].high as ColorPair).base, label: 'High Energy', description: 'Energy 50-75%' },
        { color: (this.palettes.energy[this.theme].veryHigh as ColorPair).base, label: 'Very High Energy', description: 'Energy > 75%' }
      ],
      phase: [
        { color: (this.palettes.phase[this.theme].phase0 as ColorPair).base, label: 'Phase 0°', description: 'Phase 0-45° or 315-360°' },
        { color: (this.palettes.phase[this.theme].phase90 as ColorPair).base, label: 'Phase 90°', description: 'Phase 45-135°' },
        { color: (this.palettes.phase[this.theme].phase180 as ColorPair).base, label: 'Phase 180°', description: 'Phase 135-225°' },
        { color: (this.palettes.phase[this.theme].phase270 as ColorPair).base, label: 'Phase 270°', description: 'Phase 225-315°' }
      ]
    };
    
    return legends[this.currentPalette] || legends.default;
  }
}
