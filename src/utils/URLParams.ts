/**
 * URL Parameters Utility
 * Handles encoding/decoding simulation state in URL parameters
 * and QR code generation for sharing
 */

interface SimulationState {
  latticeSize?: number;
  symmetryStrength?: number;
  anomalyProbability?: number;
  interactionRange?: number;
  timeStep?: number;
  [key: string]: unknown;
}

export class URLParams {
  private static readonly PARAM_PREFIX = 'tds_';
  private static readonly STATE_PARAM = 'state';

  /**
   * Encode simulation state to URL parameters
   */
  static encodeState(state: SimulationState): string {
    try {
      const compressed = this.compressState(state);
      const encoded = window.btoa(compressed);
      return encoded;
    } catch (error) {
      console.error('Failed to encode state:', error);
      return '';
    }
  }

  /**
   * Decode simulation state from URL parameters
   */
  static decodeState(encoded: string): SimulationState | null {
    try {
      const compressed = window.atob(encoded);
      const state = this.decompressState(compressed);
      return state;
    } catch (error) {
      console.error('Failed to decode state:', error);
      return null;
    }
  }

  /**
   * Get current URL with encoded state
   */
  static getShareURL(state: SimulationState): string {
    const encoded = this.encodeState(state);
    const url = new URL(window.location.href);
    url.searchParams.set(this.PARAM_PREFIX + this.STATE_PARAM, encoded);
    return url.toString();
  }

  /**
   * Load state from current URL
   */
  static loadStateFromURL(): SimulationState | null {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get(this.PARAM_PREFIX + this.STATE_PARAM);

    if (!encoded) {
      return null;
    }

    return this.decodeState(encoded);
  }

  /**
   * Update URL with current state (without page reload)
   */
  static updateURL(state: SimulationState): void {
    const encoded = this.encodeState(state);
    const url = new URL(window.location.href);
    url.searchParams.set(this.PARAM_PREFIX + this.STATE_PARAM, encoded);

    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Clear state from URL
   */
  static clearURL(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete(this.PARAM_PREFIX + this.STATE_PARAM);

    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Generate QR code as Data URL
   */
  static async generateQRCode(_url: string, size: number = 256): Promise<string> {
    try {
      // Simple QR code generation using a canvas
      // For production, consider using a library like qrcode.js
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw a simple placeholder QR code pattern
      // In production, use a proper QR code library
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#000000';
      const moduleSize = size / 25;

      // Draw a simple pattern (not a real QR code)
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if ((i + j) % 2 === 0 || i === 0 || i === 24 || j === 0 || j === 24) {
            ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
          }
        }
      }

      // Add text indicating this is a placeholder
      ctx.fillStyle = '#ffffff';
      ctx.font = `${size / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('QR Code', size / 2, size / 2);
      ctx.fillText('Placeholder', size / 2, size / 2 + size / 15);

      return canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  }

  /**
   * Copy share URL to clipboard
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch {
        return false;
      }
    }
  }

  /**
   * Compress state object to string
   */
  private static compressState(state: SimulationState): string {
    // Simple compression: only include non-default values
    const compressed: Record<string, unknown> = {};

    const defaults: SimulationState = {
      latticeSize: 20,
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      interactionRange: 2.0,
      timeStep: 0.1,
    };

    for (const [key, value] of Object.entries(state)) {
      if (value !== defaults[key]) {
        compressed[key] = value;
      }
    }

    return JSON.stringify(compressed);
  }

  /**
   * Decompress state string to object
   */
  private static decompressState(compressed: string): SimulationState {
    const parsed = JSON.parse(compressed);

    // Merge with defaults
    const defaults: SimulationState = {
      latticeSize: 20,
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      interactionRange: 2.0,
      timeStep: 0.1,
    };

    return { ...defaults, ...parsed };
  }

  /**
   * Validate state object
   */
  static validateState(state: SimulationState): boolean {
    const requiredKeys = [
      'latticeSize',
      'symmetryStrength',
      'anomalyProbability',
      'interactionRange',
      'timeStep',
    ];

    for (const key of requiredKeys) {
      if (!(key in state)) {
        return false;
      }

      const value = state[key];
      if (typeof value !== 'number' || isNaN(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get short URL (for display purposes)
   */
  static getShortURL(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) {
      return url;
    }

    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - maxLength / 2);
    return `${start}...${end}`;
  }

  /**
   * Check if URL contains state parameters
   */
  static hasStateInURL(): boolean {
    const url = new URL(window.location.href);
    return url.searchParams.has(this.PARAM_PREFIX + this.STATE_PARAM);
  }

  /**
   * Get all URL parameters as object
   */
  static getAllParams(): Record<string, string> {
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      if (key.startsWith(this.PARAM_PREFIX)) {
        params[key.substring(this.PARAM_PREFIX.length)] = value;
      }
    });

    return params;
  }

  /**
   * Create share dialog HTML
   */
  static createShareDialog(state: SimulationState): HTMLDivElement {
    const dialog = document.createElement('div');
    dialog.className = 'url-share-dialog';

    const shareURL = this.getShareURL(state);

    dialog.innerHTML = `
      <div class="share-dialog-content">
        <h3>Share Simulation</h3>
        <div class="share-url-container">
          <input 
            type="text" 
            class="share-url-input" 
            value="${shareURL}" 
            readonly
            id="share-url-input"
          />
          <button class="share-copy-btn" id="share-copy-btn">
            📋 Copy
          </button>
        </div>
        <div class="share-qr-container" id="share-qr-container">
          <p>Generating QR code...</p>
        </div>
        <div class="share-actions">
          <button class="share-close-btn" id="share-close-btn">Close</button>
        </div>
      </div>
    `;

    // Add event listeners
    const copyBtn = dialog.querySelector('#share-copy-btn');
    const closeBtn = dialog.querySelector('#share-close-btn');
    const input = dialog.querySelector('#share-url-input') as HTMLInputElement;

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const success = await this.copyToClipboard(shareURL);
        if (success) {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
          }, 2000);
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dialog.remove();
      });
    }

    if (input) {
      input.addEventListener('click', () => {
        input.select();
      });
    }

    // Generate QR code
    this.generateQRCode(shareURL).then((dataURL) => {
      const qrContainer = dialog.querySelector('#share-qr-container');
      if (qrContainer && dataURL) {
        qrContainer.innerHTML = `
          <img src="${dataURL}" alt="QR Code" class="share-qr-image" />
          <p class="share-qr-note">Scan to open on mobile</p>
        `;
      }
    });

    return dialog;
  }

  /**
   * Show share dialog
   */
  static showShareDialog(state: SimulationState): void {
    // Remove existing dialog if any
    const existing = document.querySelector('.url-share-dialog');
    if (existing) {
      existing.remove();
    }

    const dialog = this.createShareDialog(state);
    document.body.appendChild(dialog);
  }
}
