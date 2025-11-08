# Guided Tour System

The Guided Tour system provides thematic, step-by-step tours for different TDS concepts. It's designed to help users learn about the Theory of Dynamic Symmetry through interactive, guided experiences.

## Features

- **5 Pre-built Tours**: Covering basics to advanced physics concepts
- **Interactive Steps**: Tours can trigger actions and wait for user interaction
- **Progress Tracking**: Completion status saved in localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Automatically adapts to user's color scheme preference
- **Element Highlighting**: Draws attention to relevant UI elements
- **Smart Positioning**: Tooltips automatically position around highlighted elements

## Available Tours

### 1. Symmetry Basics (5 minutes)
**Category**: Basics  
**Topics Covered**:
- Understanding symmetry in TDS
- Lattice structure and node states
- Symmetry strength parameter
- Observing symmetry evolution
- Reading symmetry metrics

### 2. Anomaly Dynamics (7 minutes)
**Category**: Advanced  
**Topics Covered**:
- What are anomalies
- Creating anomalies interactively
- Anomaly propagation patterns
- Tracking anomaly statistics
- Spontaneous anomaly formation
- Visual effects and energy impact

### 3. Time Reversibility (6 minutes)
**Category**: Advanced  
**Topics Covered**:
- Time-symmetric nature of TDS
- Timeline controls
- Forward and reverse playback
- Timeline scrubber usage
- Bookmarking states
- Time direction indicators

### 4. Energy Conservation (6 minutes)
**Category**: Advanced  
**Topics Covered**:
- Energy in TDS framework
- Energy distribution charts
- Node energy levels
- Energy flow visualization
- Symmetric vs asymmetric energy
- Energy gradients and conservation verification

### 5. Physics Problems (8 minutes)
**Category**: Physics  
**Topics Covered**:
- TDS approach to unsolved problems
- Physics problems panel
- Available problem scenarios
- Problem descriptions and context
- TDS vs Standard Model comparison
- Experimental data overlay
- Quantitative metrics
- Research references

## Usage

### Basic Integration

```typescript
import { GuidedTour } from './education/GuidedTour.js';

// Initialize with your app instance
const guidedTour = new GuidedTour({
  simulation: mySimulation,
  renderer: myRenderer,
  showNotification: (msg) => console.log(msg)
});

// Start a specific tour
guidedTour.startTour('symmetry-basics');
```

### With Tour Menu

```typescript
import { initializeGuidedTours, createTourMenu } from './education/GuidedTourIntegration.example.js';

// Initialize tours
const guidedTour = initializeGuidedTours(app);

// Create and add menu
const tourMenu = createTourMenu(guidedTour);
document.body.appendChild(tourMenu);
```

### Checking Completion Status

```typescript
// Check if a tour has been completed
if (guidedTour.isTourCompleted('symmetry-basics')) {
  console.log('User has completed Symmetry Basics tour');
}

// Get all available tours
const allTours = guidedTour.getAvailableTours();

// Get tours by category
const basicTours = guidedTour.getToursByCategory('basics');
const advancedTours = guidedTour.getToursByCategory('advanced');
const physicsTours = guidedTour.getToursByCategory('physics');
```

### Resetting Progress

```typescript
// Reset all tour completion status
guidedTour.resetAllProgress();
```

## Tour Structure

Each tour consists of steps with the following properties:

```typescript
interface TourStep {
  id: string;                    // Unique step identifier
  title: string;                 // Step title
  description: string;           // Step description
  target: string | null;         // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;           // Optional action to execute
  waitForInteraction?: boolean;  // Wait for user interaction before proceeding
}
```

## Styling

The tour system uses the `styles/guided-tour.css` stylesheet. Key classes:

- `.guided-tour-overlay` - Full-screen overlay
- `.guided-tour-highlight` - Highlighted element box
- `.guided-tour-tooltip` - Tooltip container
- `.guided-tour-btn` - Navigation buttons

### Customization

You can customize the appearance by overriding CSS variables or classes:

```css
.guided-tour-highlight {
  border-color: #your-color;
}

.guided-tour-tooltip {
  background: #your-background;
}
```

## Best Practices

1. **Start with Basics**: Encourage new users to start with "Symmetry Basics"
2. **Progressive Learning**: Guide users through tours in order (basics → advanced → physics)
3. **Show Completion**: Display checkmarks or badges for completed tours
4. **Offer Choice**: Let users skip tours or exit at any time
5. **Provide Context**: Show estimated time and description before starting

## Requirements Satisfied

This implementation satisfies **Requirement 9.4** from the TDS Web Simulation requirements:

> **Guided tours SHALL explain key concepts step-by-step.**

The system provides:
- ✅ Thematic tour framework
- ✅ "Symmetry Basics" tour
- ✅ "Anomaly Dynamics" tour
- ✅ "Time Reversibility" tour
- ✅ "Energy Conservation" tour
- ✅ "Physics Problems" tour

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- None (vanilla TypeScript)
- Requires `styles/guided-tour.css` to be loaded

## File Structure

```
src/education/
├── GuidedTour.ts                      # Main tour system class
├── GuidedTourIntegration.example.ts   # Integration example
└── README.md                          # This file

styles/
└── guided-tour.css                    # Tour styling
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Add more tours for specific features
- [ ] Support for video/animated content in steps
- [ ] Tour analytics (track which steps users spend most time on)
- [ ] Multi-language support for tour content
- [ ] Custom tour creation by users
- [ ] Tour sharing via URL parameters
- [ ] Accessibility improvements (screen reader support)
- [ ] Mobile-specific tour optimizations
