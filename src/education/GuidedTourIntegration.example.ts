/**
 * Example integration of GuidedTour system into the main application
 * This file demonstrates how to set up and use the guided tours
 */

import { GuidedTour } from './GuidedTour.js';

/**
 * Initialize the GuidedTour system
 * Call this function after your main app is initialized
 */
export function initializeGuidedTours(app: {
  simulation?: {
    start: () => void;
    pause: () => void;
    reset: () => void;
    setParameter: (name: string, value: number) => void;
  };
  renderer?: {
    setRenderMode: (mode: string) => void;
  };
  showNotification?: (message: string) => void;
}): GuidedTour {
  // Create the guided tour system
  const guidedTour = new GuidedTour(app);
  
  // Add resize handler
  window.addEventListener('resize', () => {
    guidedTour.handleResize();
  });
  
  return guidedTour;
}

/**
 * Create a tour selection menu
 * This creates a UI for users to select and start tours
 */
export function createTourMenu(guidedTour: GuidedTour): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'tour-menu';
  menu.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    max-width: 300px;
    z-index: 1000;
  `;
  
  const title = document.createElement('h3');
  title.textContent = '🎓 Guided Tours';
  title.style.cssText = 'margin: 0 0 12px 0; font-size: 18px; color: #333;';
  menu.appendChild(title);
  
  // Get tours by category
  const basicsTours = guidedTour.getToursByCategory('basics');
  const advancedTours = guidedTour.getToursByCategory('advanced');
  const physicsTours = guidedTour.getToursByCategory('physics');
  
  // Create sections
  if (basicsTours.length > 0) {
    const section = createTourSection('Basics', basicsTours, guidedTour);
    menu.appendChild(section);
  }
  
  if (advancedTours.length > 0) {
    const section = createTourSection('Advanced', advancedTours, guidedTour);
    menu.appendChild(section);
  }
  
  if (physicsTours.length > 0) {
    const section = createTourSection('Physics', physicsTours, guidedTour);
    menu.appendChild(section);
  }
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
  `;
  closeBtn.addEventListener('click', () => {
    menu.style.display = 'none';
  });
  menu.appendChild(closeBtn);
  
  return menu;
}

/**
 * Create a tour section for a category
 */
function createTourSection(
  categoryName: string,
  tours: Array<{
    id: string;
    name: string;
    description: string;
    estimatedMinutes: number;
  }>,
  guidedTour: GuidedTour
): HTMLElement {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 16px;';
  
  const heading = document.createElement('h4');
  heading.textContent = categoryName;
  heading.style.cssText = 'margin: 0 0 8px 0; font-size: 14px; color: #666; text-transform: uppercase;';
  section.appendChild(heading);
  
  tours.forEach(tour => {
    const button = document.createElement('button');
    const isCompleted = guidedTour.isTourCompleted(tour.id);
    
    button.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">${isCompleted ? '✅' : '▶️'}</span>
        <div style="text-align: left; flex: 1;">
          <div style="font-weight: 500; margin-bottom: 2px;">${tour.name}</div>
          <div style="font-size: 12px; color: #666;">${tour.estimatedMinutes} min</div>
        </div>
      </div>
    `;
    
    button.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: ${isCompleted ? '#f0f9ff' : 'white'};
      border: 1px solid ${isCompleted ? '#4CAF50' : '#ddd'};
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = isCompleted ? '#e3f2fd' : '#f5f5f5';
      button.style.borderColor = '#4CAF50';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = isCompleted ? '#f0f9ff' : 'white';
      button.style.borderColor = isCompleted ? '#4CAF50' : '#ddd';
    });
    
    button.addEventListener('click', () => {
      guidedTour.startTour(tour.id);
    });
    
    button.title = tour.description;
    section.appendChild(button);
  });
  
  return section;
}

/**
 * Example usage in main.ts:
 * 
 * import { initializeGuidedTours, createTourMenu } from './education/GuidedTourIntegration.example.js';
 * 
 * // After initializing your app
 * const guidedTour = initializeGuidedTours({
 *   simulation: window.app.simulation,
 *   renderer: window.app.renderer,
 *   showNotification: (msg) => alert(msg)
 * });
 * 
 * // Create and add tour menu to page
 * const tourMenu = createTourMenu(guidedTour);
 * document.body.appendChild(tourMenu);
 * 
 * // Or start a specific tour programmatically
 * guidedTour.startTour('symmetry-basics');
 */
