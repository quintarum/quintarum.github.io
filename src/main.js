/**
 * TDS Web Simulation - Main Entry Point
 * Theory of Dynamic Symmetry Interactive Visualization
 */

import { Tutorial } from './ui/Tutorial.js';

// Global app instance
window.app = {
  tutorial: null,
  showNotification: (message) => {
    console.warn('Notification:', message);
  }
};

// DOM ready handler
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <h1>TDS Web Simulation</h1>
      <p>Project structure initialized successfully!</p>
      <p>Ready for component implementation.</p>
      <button id="start-tutorial" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
        Start Tutorial
      </button>
    `;
    
    // Initialize tutorial
    window.app.tutorial = new Tutorial(window.app);
    
    // Add tutorial button handler
    const tutorialBtn = document.getElementById('start-tutorial');
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => {
        window.app.tutorial.start();
      });
    }
    
    // Auto-start tutorial on first visit
    if (!window.app.tutorial.isCompleted()) {
      // Uncomment to auto-start tutorial on first visit
      // setTimeout(() => window.app.tutorial.start(), 1000);
    }
  }
});
