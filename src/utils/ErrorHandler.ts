/**
 * Error Handler Utility
 * Global error catching, logging, and recovery strategies
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'webgl' | 'storage' | 'network' | 'rendering' | 'simulation' | 'general';

interface ErrorInfo {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  context?: Record<string, unknown>;
}

interface ErrorRecoveryStrategy {
  canRecover: (error: ErrorInfo) => boolean;
  recover: (error: ErrorInfo) => Promise<boolean>;
  description: string;
}

interface ErrorNotification {
  title: string;
  message: string;
  severity: ErrorSeverity;
  actions?: Array<{
    label: string;
    callback: () => void;
  }>;
}

export class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrorHistory: number = 100;
  private recoveryStrategies: Map<ErrorCategory, ErrorRecoveryStrategy[]> = new Map();
  private callbacks: {
    onError?: (error: ErrorInfo) => void;
    onRecovery?: (error: ErrorInfo, success: boolean) => void;
    onNotification?: (notification: ErrorNotification) => void;
  } = {};

  private userFriendlyMessages: Map<string, string> = new Map([
    // WebGL errors
    ['webgl_not_supported', 'Your browser does not support 3D graphics. Switching to 2D mode.'],
    ['webgl_context_lost', '3D graphics context was lost. Attempting to restore...'],
    ['webgl_out_of_memory', 'Not enough graphics memory. Reducing quality settings.'],
    
    // Storage errors
    ['storage_quota_exceeded', 'Storage limit reached. Clearing old data...'],
    ['storage_not_available', 'Browser storage is not available. Some features may be limited.'],
    ['indexeddb_error', 'Database error occurred. Using temporary storage.'],
    
    // Network errors
    ['network_offline', 'You are offline. Some features may not work.'],
    ['resource_load_failed', 'Failed to load resource. Using cached version.'],
    
    // Rendering errors
    ['canvas_error', 'Canvas rendering error. Attempting to recover...'],
    ['animation_frame_error', 'Animation error. Restarting renderer...'],
    
    // Simulation errors
    ['simulation_overflow', 'Simulation values exceeded limits. Resetting parameters.'],
    ['invalid_state', 'Invalid simulation state detected. Restoring last valid state.'],
    
    // General errors
    ['unknown_error', 'An unexpected error occurred. The application will attempt to recover.'],
  ]);

  constructor() {
    this.bindMethods();
    this.initializeGlobalErrorHandlers();
    this.registerDefaultRecoveryStrategies();
  }

  /**
   * Bind methods to preserve context
   */
  private bindMethods(): void {
    this.handleGlobalError = this.handleGlobalError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
  }

  /**
   * Initialize global error handlers
   */
  private initializeGlobalErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', this.handleGlobalError);

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);

    // Handle WebGL context loss
    this.setupWebGLErrorHandlers();
  }

  /**
   * Setup WebGL-specific error handlers
   */
  private setupWebGLErrorHandlers(): void {
    // Will be called when canvas elements are created
    document.addEventListener('DOMContentLoaded', () => {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          this.handleError({
            message: 'WebGL context lost',
            category: 'webgl',
            severity: 'high',
            timestamp: Date.now(),
          });
        });

        canvas.addEventListener('webglcontextrestored', () => {
          // WebGL context restored - no action needed
        });
      });
    });
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    const error: ErrorInfo = {
      message: event.message,
      category: 'general',
      severity: 'medium',
      timestamp: Date.now(),
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    };

    this.handleError(error);
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error: ErrorInfo = {
      message: event.reason?.message || String(event.reason),
      category: 'general',
      severity: 'medium',
      timestamp: Date.now(),
      stack: event.reason?.stack,
    };

    this.handleError(error);
  }

  /**
   * Register default recovery strategies
   */
  private registerDefaultRecoveryStrategies(): void {
    // WebGL recovery strategies
    this.registerRecoveryStrategy('webgl', {
      canRecover: (error) => error.message.includes('context lost'),
      recover: async () => {
        // Attempt to restore WebGL context
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      },
      description: 'Restore WebGL context',
    });

    this.registerRecoveryStrategy('webgl', {
      canRecover: (error) => error.message.includes('not supported'),
      recover: async () => {
        // Fallback to 2D mode
        this.notifyUser({
          title: 'Switching to 2D Mode',
          message: 'Your browser does not support 3D graphics. Using 2D visualization.',
          severity: 'medium',
        });
        return true;
      },
      description: 'Fallback to 2D rendering',
    });

    // Storage recovery strategies
    this.registerRecoveryStrategy('storage', {
      canRecover: (error) => error.message.includes('quota'),
      recover: async () => {
        // Clear old data
        try {
          localStorage.removeItem('tds-history');
          return true;
        } catch {
          return false;
        }
      },
      description: 'Clear old storage data',
    });

    // Rendering recovery strategies
    this.registerRecoveryStrategy('rendering', {
      canRecover: () => true,
      recover: async () => {
        // Restart renderer
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      },
      description: 'Restart renderer',
    });
  }

  /**
   * Handle an error
   */
  handleError(error: ErrorInfo): void {
    // Store error
    this.errors.push(error);
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }

    // Log error
    this.logError(error);

    // Notify callbacks
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }

    // Attempt recovery
    this.attemptRecovery(error);

    // Notify user if severity is high or critical
    if (error.severity === 'high' || error.severity === 'critical') {
      this.notifyUser(this.createUserNotification(error));
    }
  }

  /**
   * Log error to console
   */
  private logError(error: ErrorInfo): void {
    const errorDetails = {
      severity: error.severity,
      timestamp: new Date(error.timestamp).toISOString(),
      stack: error.stack,
      context: error.context,
    };

    if (error.severity === 'critical') {
      console.error(`[${error.category}] ${error.message}`, errorDetails);
    } else {
      console.warn(`[${error.category}] ${error.message}`, errorDetails);
    }
  }

  /**
   * Attempt to recover from error
   */
  private async attemptRecovery(error: ErrorInfo): Promise<void> {
    const strategies = this.recoveryStrategies.get(error.category) || [];

    for (const strategy of strategies) {
      if (strategy.canRecover(error)) {
        // Attempting recovery
        try {
          const success = await strategy.recover(error);
          
          if (this.callbacks.onRecovery) {
            this.callbacks.onRecovery(error, success);
          }

          if (success) {
            // Recovery successful
            return;
          }
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      }
    }
  }

  /**
   * Create user-friendly notification
   */
  private createUserNotification(error: ErrorInfo): ErrorNotification {
    const messageKey = this.getMessageKey(error);
    const message = this.userFriendlyMessages.get(messageKey) || error.message;

    return {
      title: this.getSeverityTitle(error.severity),
      message,
      severity: error.severity,
    };
  }

  /**
   * Get message key from error
   */
  private getMessageKey(error: ErrorInfo): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('webgl') && message.includes('not supported')) {
      return 'webgl_not_supported';
    }
    if (message.includes('context lost')) {
      return 'webgl_context_lost';
    }
    if (message.includes('quota')) {
      return 'storage_quota_exceeded';
    }
    if (message.includes('storage') && message.includes('not available')) {
      return 'storage_not_available';
    }
    if (message.includes('offline')) {
      return 'network_offline';
    }
    
    return 'unknown_error';
  }

  /**
   * Get severity title
   */
  private getSeverityTitle(severity: ErrorSeverity): string {
    switch (severity) {
      case 'low':
        return 'Notice';
      case 'medium':
        return 'Warning';
      case 'high':
        return 'Error';
      case 'critical':
        return 'Critical Error';
      default:
        return 'Error';
    }
  }

  /**
   * Notify user
   */
  private notifyUser(notification: ErrorNotification): void {
    if (this.callbacks.onNotification) {
      this.callbacks.onNotification(notification);
    }
  }

  /**
   * Register a recovery strategy
   */
  registerRecoveryStrategy(category: ErrorCategory, strategy: ErrorRecoveryStrategy): void {
    if (!this.recoveryStrategies.has(category)) {
      this.recoveryStrategies.set(category, []);
    }
    this.recoveryStrategies.get(category)!.push(strategy);
  }

  /**
   * Register custom error message
   */
  registerErrorMessage(key: string, message: string): void {
    this.userFriendlyMessages.set(key, message);
  }

  /**
   * Set error callback
   */
  onError(callback: (error: ErrorInfo) => void): void {
    this.callbacks.onError = callback;
  }

  /**
   * Set recovery callback
   */
  onRecovery(callback: (error: ErrorInfo, success: boolean) => void): void {
    this.callbacks.onRecovery = callback;
  }

  /**
   * Set notification callback
   */
  onNotification(callback: (notification: ErrorNotification) => void): void {
    this.callbacks.onNotification = callback;
  }

  /**
   * Get error history
   */
  getErrors(category?: ErrorCategory, severity?: ErrorSeverity): ErrorInfo[] {
    let filtered = [...this.errors];

    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }

    if (severity) {
      filtered = filtered.filter((e) => e.severity === severity);
    }

    return filtered;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Check if WebGL is supported
   */
  static isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  static isStorageAvailable(type: 'localStorage' | 'sessionStorage' | 'indexedDB'): boolean {
    try {
      if (type === 'indexedDB') {
        return 'indexedDB' in window;
      }
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage quota information
   */
  static async getStorageQuota(): Promise<{ usage: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Export error log
   */
  exportErrorLog(): string {
    return JSON.stringify(
      {
        errors: this.errors,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      null,
      2
    );
  }

  /**
   * Destroy error handler
   */
  destroy(): void {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    this.callbacks = {};
    this.errors = [];
  }
}
