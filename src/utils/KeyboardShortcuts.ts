/**
 * Keyboard Shortcuts Manager
 * Centralized keyboard shortcut registration and management
 */

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

interface ShortcutMap {
  [id: string]: ShortcutConfig;
}

export class KeyboardShortcuts {
  private shortcuts: ShortcutMap = {};
  private isEnabled: boolean = true;
  private helpOverlayVisible: boolean = false;
  private helpOverlay: HTMLDivElement | null = null;

  constructor() {
    this.initializeEventListeners();
    this.loadCustomShortcuts();
    this.createHelpOverlay();
  }

  /**
   * Initialize keyboard event listeners
   */
  private initializeEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow help overlay shortcut even in input fields
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault();
        this.toggleHelpOverlay();
      }
      return;
    }

    // Check each registered shortcut
    for (const [, shortcut] of Object.entries(this.shortcuts)) {
      if (!shortcut.enabled) continue;

      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }

  /**
   * Check if event matches shortcut configuration
   */
  private matchesShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
    const shiftMatch = !!shortcut.shift === event.shiftKey;
    const altMatch = !!shortcut.alt === event.altKey;

    return keyMatch && ctrlMatch && shiftMatch && altMatch;
  }

  /**
   * Register a new keyboard shortcut
   */
  register(id: string, config: ShortcutConfig): void {
    // Check for conflicts
    const conflict = this.findConflict(config);
    if (conflict) {
      console.warn(
        `Shortcut conflict: "${this.formatShortcut(config)}" is already registered for "${conflict}"`
      );
    }

    this.shortcuts[id] = {
      ...config,
      enabled: config.enabled !== false,
    };

    this.saveCustomShortcuts();
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    delete this.shortcuts[id];
    this.saveCustomShortcuts();
  }

  /**
   * Update an existing shortcut
   */
  update(id: string, config: Partial<ShortcutConfig>): void {
    if (!this.shortcuts[id]) {
      console.warn(`Shortcut "${id}" not found`);
      return;
    }

    this.shortcuts[id] = {
      ...this.shortcuts[id],
      ...config,
    };

    this.saveCustomShortcuts();
  }

  /**
   * Enable or disable a specific shortcut
   */
  setEnabled(id: string, enabled: boolean): void {
    if (this.shortcuts[id]) {
      this.shortcuts[id].enabled = enabled;
      this.saveCustomShortcuts();
    }
  }

  /**
   * Enable or disable all shortcuts
   */
  setGlobalEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Find conflicting shortcut
   */
  private findConflict(config: ShortcutConfig): string | null {
    for (const [id, shortcut] of Object.entries(this.shortcuts)) {
      if (
        shortcut.key === config.key &&
        !!shortcut.ctrl === !!config.ctrl &&
        !!shortcut.shift === !!config.shift &&
        !!shortcut.alt === !!config.alt
      ) {
        return id;
      }
    }
    return null;
  }

  /**
   * Format shortcut for display
   */
  private formatShortcut(config: ShortcutConfig): string {
    const parts: string[] = [];

    if (config.ctrl) parts.push('Ctrl');
    if (config.shift) parts.push('Shift');
    if (config.alt) parts.push('Alt');
    if (config.meta) parts.push('Meta');

    parts.push(config.key.toUpperCase());

    return parts.join('+');
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): ShortcutMap {
    return { ...this.shortcuts };
  }

  /**
   * Get a specific shortcut
   */
  get(id: string): ShortcutConfig | null {
    return this.shortcuts[id] || null;
  }

  /**
   * Create help overlay
   */
  private createHelpOverlay(): void {
    this.helpOverlay = document.createElement('div');
    this.helpOverlay.className = 'keyboard-shortcuts-overlay hidden';
    this.helpOverlay.id = 'keyboard-shortcuts-overlay';

    this.helpOverlay.innerHTML = `
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button class="shortcuts-close-btn" id="close-shortcuts">×</button>
        </div>
        <div class="shortcuts-content" id="shortcuts-content"></div>
      </div>
    `;

    document.body.appendChild(this.helpOverlay);

    // Close button
    const closeBtn = document.getElementById('close-shortcuts');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideHelpOverlay());
    }

    // Close on overlay click
    this.helpOverlay.addEventListener('click', (e) => {
      if (e.target === this.helpOverlay) {
        this.hideHelpOverlay();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.helpOverlayVisible) {
        this.hideHelpOverlay();
      }
    });
  }

  /**
   * Show help overlay
   */
  showHelpOverlay(): void {
    if (!this.helpOverlay) return;

    this.updateHelpContent();
    this.helpOverlay.classList.remove('hidden');
    this.helpOverlayVisible = true;
  }

  /**
   * Hide help overlay
   */
  hideHelpOverlay(): void {
    if (!this.helpOverlay) return;

    this.helpOverlay.classList.add('hidden');
    this.helpOverlayVisible = false;
  }

  /**
   * Toggle help overlay
   */
  toggleHelpOverlay(): void {
    if (this.helpOverlayVisible) {
      this.hideHelpOverlay();
    } else {
      this.showHelpOverlay();
    }
  }

  /**
   * Update help overlay content
   */
  private updateHelpContent(): void {
    const content = document.getElementById('shortcuts-content');
    if (!content) return;

    const shortcuts = Object.entries(this.shortcuts)
      .filter(([, config]) => config.enabled)
      .map(
        ([, config]) => `
        <div class="shortcut-item">
          <div class="shortcut-keys">
            <kbd>${this.formatShortcut(config)}</kbd>
          </div>
          <div class="shortcut-description">${config.description}</div>
        </div>
      `
      )
      .join('');

    content.innerHTML = shortcuts || '<p class="no-shortcuts">No shortcuts registered</p>';
  }

  /**
   * Save custom shortcuts to localStorage
   */
  private saveCustomShortcuts(): void {
    try {
      const customShortcuts: Record<string, Partial<ShortcutConfig>> = {};

      for (const [id, config] of Object.entries(this.shortcuts)) {
        customShortcuts[id] = {
          key: config.key,
          ctrl: config.ctrl,
          shift: config.shift,
          alt: config.alt,
          meta: config.meta,
          enabled: config.enabled,
        };
      }

      localStorage.setItem('tds_keyboard_shortcuts', JSON.stringify(customShortcuts));
    } catch (e) {
      console.warn('Could not save keyboard shortcuts:', e);
    }
  }

  /**
   * Load custom shortcuts from localStorage
   */
  private loadCustomShortcuts(): void {
    try {
      const stored = localStorage.getItem('tds_keyboard_shortcuts');
      if (!stored) return;

      const customShortcuts = JSON.parse(stored) as Record<string, Partial<ShortcutConfig>>;

      for (const [id, config] of Object.entries(customShortcuts)) {
        if (this.shortcuts[id]) {
          this.shortcuts[id] = {
            ...this.shortcuts[id],
            ...config,
          };
        }
      }
    } catch (e) {
      console.warn('Could not load keyboard shortcuts:', e);
    }
  }

  /**
   * Reset all shortcuts to defaults
   */
  resetToDefaults(): void {
    localStorage.removeItem('tds_keyboard_shortcuts');
    // Shortcuts will be re-registered by the application
  }

  /**
   * Export shortcuts configuration
   */
  export(): string {
    return JSON.stringify(this.shortcuts, null, 2);
  }

  /**
   * Import shortcuts configuration
   */
  import(json: string): void {
    try {
      const imported = JSON.parse(json) as ShortcutMap;

      for (const [id, config] of Object.entries(imported)) {
        this.shortcuts[id] = config;
      }

      this.saveCustomShortcuts();
    } catch (e) {
      console.error('Failed to import shortcuts:', e);
    }
  }

  /**
   * Destroy the keyboard shortcuts manager
   */
  destroy(): void {
    if (this.helpOverlay) {
      this.helpOverlay.remove();
      this.helpOverlay = null;
    }
  }
}
