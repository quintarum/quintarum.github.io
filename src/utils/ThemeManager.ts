/**
 * Theme Manager Utility
 * Manages application themes (light, dark, high-contrast) with persistence
 */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'auto';

interface ThemeConfig {
  name: Theme;
  displayName: string;
  description: string;
  icon: string;
}

export class ThemeManager {
  private currentTheme: Theme = 'auto';
  private systemTheme: 'light' | 'dark' = 'light';
  private mediaQuery: MediaQueryList | null = null;
  private callbacks: {
    onThemeChange?: (theme: Theme, effectiveTheme: 'light' | 'dark' | 'high-contrast') => void;
  } = {};

  private readonly themes: ThemeConfig[] = [
    {
      name: 'light',
      displayName: 'Light',
      description: 'Bright theme for well-lit environments',
      icon: '☀️',
    },
    {
      name: 'dark',
      displayName: 'Dark',
      description: 'Dark theme for low-light environments',
      icon: '🌙',
    },
    {
      name: 'high-contrast',
      displayName: 'High Contrast',
      description: 'High contrast theme for accessibility',
      icon: '⚡',
    },
    {
      name: 'auto',
      displayName: 'Auto',
      description: 'Follow system theme preference',
      icon: '🔄',
    },
  ];

  constructor() {
    this.bindMethods();
    this.initializeSystemThemeDetection();
    this.loadSavedTheme();
  }

  /**
   * Bind methods to preserve context
   */
  private bindMethods(): void {
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  /**
   * Initialize system theme detection
   */
  private initializeSystemThemeDetection(): void {
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

      // Listen for system theme changes
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        this.mediaQuery.addListener(this.handleSystemThemeChange);
      }
    }
  }

  /**
   * Handle system theme changes
   */
  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    this.systemTheme = e.matches ? 'dark' : 'light';

    // If using auto theme, apply the new system theme
    if (this.currentTheme === 'auto') {
      this.applyTheme(this.currentTheme);
    }
  }

  /**
   * Load saved theme from localStorage
   */
  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('tds-theme') as Theme;
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.setTheme(savedTheme);
      } else {
        // Default to auto theme
        this.setTheme('auto');
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
      this.setTheme('auto');
    }
  }

  /**
   * Check if theme is valid
   */
  private isValidTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'high-contrast', 'auto'].includes(theme);
  }

  /**
   * Get effective theme (resolves 'auto' to actual theme)
   */
  private getEffectiveTheme(theme: Theme): 'light' | 'dark' | 'high-contrast' {
    if (theme === 'auto') {
      return this.systemTheme;
    }
    return theme;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const effectiveTheme = this.getEffectiveTheme(theme);
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');

    // Add appropriate theme class
    if (effectiveTheme === 'light') {
      body.classList.add('light-theme');
    } else if (effectiveTheme === 'dark') {
      body.classList.add('dark-theme');
    } else if (effectiveTheme === 'high-contrast') {
      body.classList.add('high-contrast-theme');
    }

    // Set data-theme attribute for CSS variables
    body.setAttribute('data-theme', effectiveTheme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);

    // Notify callbacks
    if (this.callbacks.onThemeChange) {
      this.callbacks.onThemeChange(theme, effectiveTheme);
    }
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: 'light' | 'dark' | 'high-contrast'): void {
    let themeColor = '#1a1a2e'; // Default dark

    if (theme === 'light') {
      themeColor = '#ffffff';
    } else if (theme === 'high-contrast') {
      themeColor = '#000000';
    }

    // Update or create meta theme-color tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'auto' instead.`);
      theme = 'auto';
    }

    this.currentTheme = theme;
    this.applyTheme(theme);

    // Save to localStorage
    try {
      localStorage.setItem('tds-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get effective theme (resolves 'auto')
   */
  getEffectiveThemeValue(): 'light' | 'dark' | 'high-contrast' {
    return this.getEffectiveTheme(this.currentTheme);
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): ThemeConfig[] {
    return [...this.themes];
  }

  /**
   * Get theme config by name
   */
  getThemeConfig(theme: Theme): ThemeConfig | undefined {
    return this.themes.find((t) => t.name === theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const effectiveTheme = this.getEffectiveTheme(this.currentTheme);
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Cycle through all themes
   */
  cycleTheme(): void {
    const currentIndex = this.themes.findIndex((t) => t.name === this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex].name);
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    const effectiveTheme = this.getEffectiveTheme(this.currentTheme);
    return effectiveTheme === 'dark' || effectiveTheme === 'high-contrast';
  }

  /**
   * Check if high contrast mode is active
   */
  isHighContrast(): boolean {
    return this.getEffectiveTheme(this.currentTheme) === 'high-contrast';
  }

  /**
   * Set callback for theme changes
   */
  onThemeChange(callback: (theme: Theme, effectiveTheme: 'light' | 'dark' | 'high-contrast') => void): void {
    this.callbacks.onThemeChange = callback;
  }

  /**
   * Get system theme preference
   */
  getSystemTheme(): 'light' | 'dark' {
    return this.systemTheme;
  }

  /**
   * Check if system supports dark mode
   */
  systemSupportsDarkMode(): boolean {
    return this.mediaQuery !== null;
  }

  /**
   * Export theme settings
   */
  exportSettings(): { theme: Theme; systemTheme: 'light' | 'dark' } {
    return {
      theme: this.currentTheme,
      systemTheme: this.systemTheme,
    };
  }

  /**
   * Import theme settings
   */
  importSettings(settings: { theme?: Theme }): void {
    if (settings.theme && this.isValidTheme(settings.theme)) {
      this.setTheme(settings.theme);
    }
  }

  /**
   * Reset to default theme
   */
  reset(): void {
    this.setTheme('auto');
  }

  /**
   * Destroy the theme manager
   */
  destroy(): void {
    // Remove event listener
    if (this.mediaQuery) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        this.mediaQuery.removeListener(this.handleSystemThemeChange);
      }
    }

    this.callbacks = {};
  }
}
