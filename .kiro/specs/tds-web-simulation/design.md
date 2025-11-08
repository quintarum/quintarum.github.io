# Design Document

## Overview

The Theory of Dynamic Symmetry web simulation will be implemented as a comprehensive, educational Single Page Application (SPA) designed for researchers, educators, and students. The application will provide intuitive visualization of lattice dynamics, symmetry anomalies, and reversible processes, with emphasis on accessibility, real-time analytics, and validation against unsolved physics problems. The design prioritizes clarity, interactivity, and scientific rigor.

## Key Design Decisions

This section summarizes the major architectural and design decisions made to satisfy the requirements:

### 1. Technology Stack: TypeScript + Vanilla Architecture

**Decision**: Use TypeScript with a lightweight vanilla architecture instead of React/Vue.js framework.

**Rationale**: 
- Meets the ≤10MB bundle size target by avoiding heavy framework overhead
- TypeScript provides type safety and better developer experience
- Event-driven architecture provides reactivity without framework complexity
- Faster load times contribute to ≤3s load time target
- Easier to optimize for 60 FPS performance target

**Trade-offs**: More manual DOM management, but acceptable given performance requirements.

### 2. Dual Storage Strategy: LocalStorage + IndexedDB

**Decision**: Use LocalStorage for preferences and IndexedDB for large data.

**Rationale**:
- LocalStorage (5-10MB): Perfect for user settings, bookmarks, small configurations
- IndexedDB (50MB+): Handles simulation history, snapshots, lesson plans
- Graceful degradation when quota exceeded
- Enables offline functionality via PWA

### 3. Beginner/Expert Mode Toggle

**Decision**: Implement adaptive UI complexity based on user expertise level.

**Rationale**:
- Prevents information overload for beginners (Requirement 5.9)
- Provides full control for expert users
- Improves onboarding experience
- Reduces cognitive load for educational use cases

### 4. Real-Time Annotations

**Decision**: Automatically detect and annotate significant simulation events.

**Rationale**:
- Helps users understand what's happening without deep physics knowledge (Requirement 5.7)
- Reduces barrier to entry for students
- Provides contextual learning opportunities
- Complements visual feedback with explanatory text

### 5. Parameter Preview System

**Decision**: Show live preview of parameter changes before applying to main simulation.

**Rationale**:
- Prevents accidental disruption of interesting simulation states (Requirement 4.2, 4.3)
- Enables experimentation without risk
- Provides immediate visual feedback
- Improves user confidence in parameter adjustments

### 6. Variable Speed Playback

**Decision**: Support playback speeds from 0.1x (slow motion) to 10x (fast forward).

**Rationale**:
- Enables detailed observation of rapid events (Requirement 2.7)
- Allows quick exploration of long-term behavior
- Improves educational value for demonstrations
- Maintains 60 FPS through frame interpolation/skipping

### 7. Keyboard Shortcuts with Customization

**Decision**: Provide comprehensive keyboard shortcuts that users can customize.

**Rationale**:
- Improves efficiency for power users (Requirement 4.8)
- Enhances accessibility for keyboard-only navigation
- Reduces reliance on mouse for common actions
- Supports different user workflows

### 8. Custom Physics Tests

**Decision**: Allow users to define and run custom physics problem tests.

**Rationale**:
- Enables research beyond predefined scenarios (Requirement 11.7)
- Supports hypothesis testing
- Facilitates educational exploration
- Makes simulation more valuable for researchers

### 9. Automatic Region Highlighting

**Decision**: Automatically detect and highlight regions of interest in the lattice.

**Rationale**:
- Guides user attention to important phenomena (Requirement 1.7)
- Reduces cognitive load in large lattices
- Helps identify interesting events in real-time
- Improves educational value

### 10. Multimedia Tutorial Support

**Decision**: Support text, video, and animated tutorials.

**Rationale**:
- Accommodates different learning styles (Requirement 5.8)
- Improves accessibility for diverse audiences
- Increases engagement with complex concepts
- Provides multiple paths to understanding

## Architecture

### Technology Stack

**Design Rationale**: The application uses TypeScript with Vite for type safety and modern build tooling, while maintaining a lightweight vanilla approach without heavy framework dependencies. This balances developer experience with performance and bundle size constraints.

- **Language**: TypeScript (ES2020+) for type safety and better developer experience
- **Build Tool**: Vite 7.x for fast development and optimized production builds
- **Rendering**: HTML5 Canvas API for 2D visualization, Three.js 0.181 for 3D WebGL rendering
- **Charting**: Chart.js 4.5 for real-time analytics and data visualization
- **Styling**: CSS3 with CSS Grid and Flexbox for responsive design
- **Internationalization**: i18next 25.6 for multi-language support (English, Russian minimum)
- **Data Export**: PapaParse 5.5 for CSV export functionality
- **State Management**: Vanilla TypeScript with event-driven architecture (no React/Redux to minimize bundle size)
- **Persistence**: LocalStorage for user preferences, IndexedDB for simulation history and snapshots
- **Deployment**: GitHub Pages for static hosting at `/quintarum.github.io/` base path
- **PWA Support**: vite-plugin-pwa for offline functionality and caching
- **Code Quality**: ESLint 9.x (flat config), Prettier 3.6 for consistent code style

### Performance Targets

**Design Rationale**: These targets ensure the simulation is accessible on mid-range hardware while maintaining scientific accuracy and smooth interactivity.

- **Initial Load Time**: ≤ 3 seconds on standard broadband connection
- **Runtime Performance**: ≥ 60 FPS for lattices up to 100×100×100 on mid-range hardware
- **Bundle Size**: ≤ 10 megabytes total (optimized with Terser minification)
- **Analytics Latency**: ≤ 200 milliseconds for real-time metric updates
- **Browser Compatibility**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### State Management Architecture

**Design Rationale**: A lightweight event-driven architecture without heavy framework dependencies keeps bundle size minimal while providing reactive updates across components.

The application uses a vanilla TypeScript approach with:

1. **Event-Driven Communication**: Custom event system for component communication
2. **LocalStorage**: User preferences, settings, bookmarks, and small data
3. **IndexedDB**: Large data like simulation history, snapshots, and lesson plans
4. **State Persistence**: Automatic saving with configurable intervals

```typescript
// Central state manager
class StateManager {
  private state: ApplicationState;
  private listeners: Map<string, Function[]>;
  
  subscribe(event: string, callback: Function): void {
    // Subscribe to state changes
  }
  
  emit(event: string, data: any): void {
    // Notify all subscribers
  }
  
  saveToLocalStorage(key: string, data: any): void {
    // Save small data to LocalStorage
  }
  
  saveToIndexedDB(storeName: string, data: any): Promise<void> {
    // Save large data to IndexedDB
  }
}
```

### Application Structure

```
tds-simulation/
├── index.html              # Main page
├── src/
│   ├── main.ts            # Application entry point (TypeScript)
│   ├── core/              # Core simulation engine (TypeScript)
│   │   ├── Lattice.ts     # Lattice class
│   │   ├── Node.ts        # Lattice node class
│   │   ├── Simulation.ts  # Simulation engine
│   │   ├── Physics.ts     # TDS physics calculations
│   │   └── PhysicsProblems.ts # Unsolved physics problems scenarios
│   ├── rendering/         # Visualization layer (TypeScript)
│   │   ├── Renderer2D.ts  # 2D rendering
│   │   ├── Renderer3D.ts  # 3D rendering (Three.js)
│   │   ├── ColorScheme.ts # Color schemes
│   │   └── VisualEffects.ts # Particle trails, ripples, halos
│   ├── analytics/         # Data collection and analysis
│   │   ├── MetricsCollector.ts # Real-time metrics collection
│   │   ├── ChartManager.ts     # Chart.js integration
│   │   ├── DataExporter.ts     # CSV export functionality
│   │   └── StatisticsEngine.ts # Statistical calculations
│   ├── ui/                # User interface components
│   │   ├── Controls.ts    # Control panel with keyboard shortcuts
│   │   ├── InfoPanel.ts   # Information panel with beginner/expert mode
│   │   ├── Timeline.ts    # Timeline with scrubber and variable speed
│   │   ├── Tutorial.ts    # Interactive tutorial system
│   │   ├── ComparisonView.ts # Split-screen comparison
│   │   ├── AnalyticsDashboard.ts # Real-time analytics display
│   │   ├── PhysicsProblemsPanel.ts # Physics problems interface
│   │   └── PresetsManager.ts # Preset scenarios management
│   ├── education/         # Educational features
│   │   ├── GuidedTour.ts  # Step-by-step tours
│   │   ├── Quiz.ts        # Interactive quizzes
│   │   ├── LessonPlanner.ts # Educational content management
│   │   └── PresentationMode.ts # Fullscreen presentation mode
│   ├── i18n/              # Internationalization
│   │   ├── en.json        # English translations
│   │   ├── ru.json        # Russian translations
│   │   └── i18n.ts        # i18next setup
│   └── utils/             # Utility functions
│       ├── StateManager.ts # Event-driven state management
│       ├── Storage.ts      # LocalStorage wrapper
│       ├── IndexedDB.ts    # IndexedDB wrapper for large data
│       ├── URLParams.ts    # URL parameter handling
│       └── KeyboardShortcuts.ts # Keyboard shortcut manager
├── styles/
│   ├── main.css           # Main styles
│   ├── controls.css       # Control panel styles
│   ├── responsive.css     # Responsive styles
│   ├── tutorial.css       # Tutorial overlay styles
│   ├── analytics.css      # Analytics dashboard styles
│   └── themes.css         # Light/dark themes
├── assets/
│   ├── docs/              # Theory documentation
│   ├── scenarios/         # Pre-configured scenarios
│   ├── physics-problems/  # Physics problems data
│   └── tutorials/         # Tutorial content
├── sw.js                  # Service worker
└── vite.config.js         # Vite configuration
```

## Components and Interfaces

### Core Components

#### 1. Lattice Class

Represents the TDS lattice with region highlighting.

**Design Rationale**: The lattice provides efficient spatial queries and automatic identification of interesting regions for user attention.

```javascript
class Lattice {
  constructor(width, height, depth = 1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.nodes = [];
    this.regionsOfInterest = [];
    this.initialize();
  }

  initialize() {
    // Create lattice nodes
  }

  getNode(x, y, z = 0) {
    // Get node by coordinates
  }

  getNeighbors(node) {
    // Get neighboring nodes
  }

  update(deltaTime) {
    // Update lattice state
    this.detectRegionsOfInterest();
  }

  detectRegionsOfInterest() {
    // Automatically identify and highlight regions with:
    // - High anomaly density
    // - Rapid state changes
    // - Unusual energy patterns
    // - Symmetry breaking events
    this.regionsOfInterest = this.analyzeRegions();
  }

  getRegionsOfInterest() {
    // Return list of interesting regions for highlighting
    return this.regionsOfInterest;
  }

  resize(width, height, depth) {
    // Resize lattice with immediate visual feedback
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.initialize();
  }
}
```

#### 2. Node Class

Represents a lattice node.

```javascript
class Node {
  constructor(x, y, z = 0) {
    this.position = { x, y, z };
    this.state = 'symmetric';  // symmetric, asymmetric, anomaly
    this.energy = 0;
    this.phase = 0;
  }

  updateState(neighbors, params) {
    // Update state based on neighbors
  }

  calculateEnergy() {
    // Calculate node energy
  }
}
```

#### 3. Simulation Class

Manages the simulation.

```javascript
class Simulation {
  constructor(lattice, params) {
    this.lattice = lattice;
    this.params = params;
    this.time = 0;
    this.isRunning = false;
    this.history = [];
  }

  start() {
    // Start simulation
  }

  stop() {
    // Stop simulation
  }

  step(deltaTime) {
    // Single simulation step
  }

  reverse() {
    // Reverse playback
  }

  saveState() {
    // Save state to history
  }
}
```

#### 4. Renderer2D Class

Responsible for 2D visualization with smooth transitions and region highlighting.

**Design Rationale**: The 2D renderer prioritizes clarity and smooth animations while highlighting important regions to guide user attention.

```javascript
class Renderer2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colorScheme = new ColorScheme();
    this.animationProgress = 0;
  }

  render(lattice) {
    // Render lattice with smooth animations
    this.highlightRegionsOfInterest(lattice.getRegionsOfInterest());
  }

  drawNode(node) {
    // Draw node with state-based coloring
    // Use glowing nodes and pulsing animations for visual metaphors
  }

  drawConnections(lattice) {
    // Draw connections between nodes
  }

  highlightRegionsOfInterest(regions) {
    // Automatically highlight interesting regions with:
    // - Colored overlays
    // - Pulsing borders
    // - Attention-grabbing animations
  }

  smoothTransition(fromState, toState, progress) {
    // Smooth transition between states
    // Used for 2D/3D view switching
    this.animationProgress = progress;
  }

  setRenderMode(mode) {
    // Switch between 2D and 3D with smooth transition
  }
}
```

#### 5. Renderer3D Class

Responsible for 3D visualization using Three.js.

```javascript
class Renderer3D {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new THREE.OrbitControls();
    this.meshes = new Map();
    this.effects = new VisualEffects();
  }

  render(lattice) {
    // Render 3D lattice
  }

  updateNodeMesh(node) {
    // Update node mesh
  }

  animate() {
    // Animation loop
  }

  addParticleTrail(node) {
    // Add particle trail effect
  }

  showMiniMap() {
    // Display mini-map overlay
  }
}
```

#### 6. PhysicsProblems Class

Manages unsolved physics problems scenarios.

```javascript
class PhysicsProblems {
  constructor() {
    this.problems = {
      darkMatter: {
        name: 'Dark Matter & Dark Energy',
        description: 'Explaining the missing mass in the universe',
        initialConditions: {},
        standardModelPrediction: {},
        experimentalData: []
      },
      matterAntimatter: {
        name: 'Matter-Antimatter Asymmetry',
        description: 'Why is there more matter than antimatter?',
        initialConditions: {},
        standardModelPrediction: {},
        experimentalData: []
      },
      quantumMeasurement: {
        name: 'Quantum Measurement Problem',
        description: 'The collapse of the wave function',
        initialConditions: {},
        standardModelPrediction: {},
        experimentalData: []
      },
      informationParadox: {
        name: 'Black Hole Information Paradox',
        description: 'Information loss in black holes',
        initialConditions: {},
        standardModelPrediction: {},
        experimentalData: []
      },
      hierarchyProblem: {
        name: 'Hierarchy Problem',
        description: 'Why is gravity so weak?',
        initialConditions: {},
        standardModelPrediction: {},
        experimentalData: []
      }
    };
  }

  getProblem(problemId) {
    // Get problem configuration
  }

  setupScenario(problemId, lattice) {
    // Configure lattice for specific problem
  }

  compareWithStandardModel(results) {
    // Compare TDS results with standard model
  }

  validateAgainstData(results, experimentalData) {
    // Validate against experimental observations
  }
}
```

#### 7. MetricsCollector Class

Collects real-time simulation metrics.

```javascript
class MetricsCollector {
  constructor(simulation) {
    this.simulation = simulation;
    this.history = {
      energy: [],
      symmetry: [],
      anomalies: [],
      entropy: []
    };
  }

  collect() {
    // Collect current metrics
  }

  calculateStatistics() {
    // Calculate mean, variance, etc.
  }

  detectSignificantEvents() {
    // Identify statistically significant changes
  }

  exportToCSV() {
    // Export metrics to CSV format
  }
}
```

### UI Components

#### 1. Controls Panel

Control panel for simulation parameters with enhanced interactivity.

**Design Rationale**: The control panel provides immediate visual feedback and parameter validation to help users understand the impact of their changes before applying them to the main simulation.

```javascript
class Controls {
  constructor(simulation) {
    this.simulation = simulation;
    this.params = {
      latticeSize: 20,
      animationSpeed: 1.0,
      symmetryStrength: 0.5,
      anomalyProbability: 0.1,
      renderMode: '2d'
    };
    this.previewCanvas = null; // For live parameter previews
    this.keyboardShortcuts = new Map();
  }

  createUI() {
    // Create control elements with logical grouping
    // Add tooltips with "What does this do?" explanations
    // Display recommended parameter ranges visually
  }

  updateParameter(name, value) {
    // Show live visual preview before applying
    this.showPreview(name, value);
  }

  showPreview(paramName, value) {
    // Render preview of parameter effect in small canvas
  }

  applyChanges() {
    // Apply previewed changes to main simulation
  }

  reset() {
    // Reset to default values with confirmation
  }

  exportConfig() {
    // Export configuration as JSON
    return JSON.stringify(this.params);
  }

  importConfig(jsonString) {
    // Import configuration from JSON
    this.params = JSON.parse(jsonString);
  }

  registerKeyboardShortcut(key, action) {
    // Register keyboard shortcuts (Space=play/pause, R=reset, etc.)
    this.keyboardShortcuts.set(key, action);
  }
}
```

#### 2. Info Panel

Information panel with rich theoretical content and learning features.

**Design Rationale**: The info panel adapts to user expertise level and provides contextual help, making TDS theory accessible to both beginners and experts.

```javascript
class InfoPanel {
  constructor() {
    this.isVisible = false;
    this.mode = 'beginner'; // 'beginner' or 'expert'
    this.glossary = new Map();
    this.userNotes = [];
  }

  show() {
    // Show panel with mode-appropriate content
  }

  hide() {
    // Hide panel
  }

  loadContent() {
    // Load theory content with diagrams and examples
    // Include links to theory papers with abstracts
  }

  setMode(mode) {
    // Toggle between beginner and expert mode
    // Adjust detail level of explanations
    this.mode = mode;
    this.refreshContent();
  }

  searchGlossary(term) {
    // Search glossary for TDS terms
    return this.glossary.get(term.toLowerCase());
  }

  addNote(text, timestamp) {
    // Add user note with timestamp
    this.userNotes.push({ text, timestamp, simulationState: this.captureState() });
  }

  exportNotes() {
    // Export notes as markdown or PDF
    return this.userNotes;
  }

  showRealTimeAnnotation(event) {
    // Display real-time annotation for ongoing simulation events
  }

  loadVideoTutorial(topic) {
    // Load optional video/animated tutorial for complex topics
  }
}
```

#### 3. Timeline

Timeline for playback control with scrubber and variable speed playback.

**Design Rationale**: The timeline provides fine-grained control over simulation playback, enabling detailed analysis of specific moments and smooth transitions between time states.

```javascript
class Timeline {
  constructor(simulation) {
    this.simulation = simulation;
    this.maxHistory = 1000; // User-configurable
    this.bookmarks = [];
    this.playbackSpeed = 1.0; // 1.0 = normal speed
  }

  render() {
    // Render timeline with scrubber
    // Show time direction indicator (arrows or gradient)
    // Display bookmark markers on timeline
  }

  seek(time) {
    // Seek to specific time in history
    // Smooth animation during seek
  }

  playForward() {
    // Play forward at current speed
  }

  playBackward() {
    // Play backward with smooth reverse animation
  }

  step(direction) {
    // Single step forward or backward
    // direction: 1 for forward, -1 for backward
  }

  setPlaybackSpeed(speed) {
    // Set playback speed (0.1x to 10x)
    // 0.1-0.5 = slow motion
    // 1.0 = normal
    // 2.0-10.0 = fast forward
    this.playbackSpeed = speed;
  }

  addBookmark(time, description) {
    // Add bookmark at current time with description
    this.bookmarks.push({ time, description, state: this.simulation.saveState() });
  }

  jumpToBookmark(bookmarkId) {
    // Jump to bookmarked moment
    const bookmark = this.bookmarks[bookmarkId];
    this.seek(bookmark.time);
  }

  showBeforeAfter(time1, time2) {
    // Display before/after comparison view
    // Side-by-side visualization of two time states
  }

  setHistoryDepth(depth) {
    // Configure history depth (user-configurable)
    // Use delta-compression for memory efficiency
    this.maxHistory = depth;
  }
}
```

#### 4. Tutorial System

Interactive tutorial for first-time users with multimedia support.

**Design Rationale**: The tutorial system provides multiple learning paths (text, video, interactive) to accommodate different learning styles and ensures users can quickly become productive with the simulation.

```javascript
class Tutorial {
  constructor(app) {
    this.app = app;
    this.steps = [];
    this.currentStep = 0;
    this.isActive = false;
    this.completionTracking = new Map();
    this.videoTutorials = new Map();
  }

  start() {
    // Start tutorial from beginning
    // Show on first launch automatically
  }

  nextStep() {
    // Move to next tutorial step
    this.trackProgress();
  }

  previousStep() {
    // Go back to previous step
  }

  skip() {
    // Skip tutorial with confirmation
    this.markAsCompleted();
  }

  highlightElement(selector) {
    // Highlight UI element with overlay and spotlight effect
  }

  showTooltip(text, position) {
    // Show explanatory tooltip with contextual help
  }

  trackProgress() {
    // Track completion of tutorial steps
    this.completionTracking.set(this.currentStep, true);
  }

  markAsCompleted() {
    // Mark tutorial as completed in localStorage
    localStorage.setItem('tutorialCompleted', 'true');
  }

  loadVideoTutorial(stepId) {
    // Load optional video tutorial for complex concepts
    return this.videoTutorials.get(stepId);
  }

  showAnimatedDemo(concept) {
    // Show animated demonstration of TDS concepts
  }
}
```

#### 5. Analytics Dashboard

Real-time analytics and metrics display.

```javascript
class AnalyticsDashboard {
  constructor(simulation) {
    this.simulation = simulation;
    this.charts = new Map();
    this.metrics = new MetricsCollector();
  }

  initialize() {
    // Create chart instances
  }

  update() {
    // Update all charts with latest data
  }

  addChart(type, config) {
    // Add new chart to dashboard
  }

  exportData(format) {
    // Export data in specified format
  }

  showStatistics() {
    // Display statistical summary
  }
}
```

#### 6. Physics Problems Panel

Interface for testing against unsolved physics problems with custom test support.

**Design Rationale**: This panel enables rigorous scientific validation by comparing TDS predictions against standard model predictions and experimental data, with support for user-defined test scenarios.

```javascript
class PhysicsProblemsPanel {
  constructor(simulation) {
    this.simulation = simulation;
    this.problems = [];
    this.currentProblem = null;
    this.customTests = new Map();
  }

  loadProblems() {
    // Load physics problems database (5+ predefined problems)
    // Include: dark matter, matter-antimatter asymmetry, quantum measurement,
    // black hole information paradox, hierarchy problem
  }

  selectProblem(problemId) {
    // Load problem scenario with appropriate parameters and initial states
    this.currentProblem = this.problems.find(p => p.id === problemId);
    this.applyProblemConfiguration();
  }

  runComparison() {
    // Run TDS vs standard model comparison
    // Overlay experimental data when available
    // Calculate quantitative metrics
  }

  showResults() {
    // Display comparison results with visualizations
    // Highlight where TDS matches or diverges from standard predictions
  }

  generateReport() {
    // Generate detailed analysis report with:
    // - Problem description and background
    // - TDS approach explanation
    // - Comparison with standard model
    // - Quantitative metrics
    // - References to peer-reviewed literature
  }

  createCustomTest(name, config) {
    // Allow users to define and run custom problem tests
    this.customTests.set(name, config);
  }

  runCustomTest(name) {
    // Execute user-defined custom test
    const config = this.customTests.get(name);
    this.applyConfiguration(config);
    return this.runComparison();
  }

  exportTest(name) {
    // Export custom test configuration for sharing
    return JSON.stringify(this.customTests.get(name));
  }

  importTest(jsonString) {
    // Import custom test configuration
    const config = JSON.parse(jsonString);
    this.customTests.set(config.name, config);
  }
}
```

#### 7. Comparison View

Split-screen comparison of multiple simulations with parameter sensitivity analysis.

**Design Rationale**: The comparison view enables systematic exploration of parameter space and helps users understand how different settings affect simulation outcomes.

```javascript
class ComparisonView {
  constructor() {
    this.simulations = [];
    this.maxSimulations = 4;
    this.snapshots = new Map();
  }

  addSimulation(simulation) {
    // Add simulation to comparison (up to 4)
    if (this.simulations.length < this.maxSimulations) {
      this.simulations.push(simulation);
    }
  }

  removeSimulation(index) {
    // Remove simulation from comparison
    this.simulations.splice(index, 1);
  }

  syncPlayback() {
    // Synchronize playback across all simulations
  }

  highlightDifferences() {
    // Visually highlight differences with delta maps
    // Use color coding to show divergence magnitude
  }

  generateComparisonReport() {
    // Create detailed comparison report with statistics
    // Include parameter differences and outcome metrics
  }

  saveSnapshot(name) {
    // Save current simulation state for later comparison
    this.snapshots.set(name, this.captureAllStates());
  }

  loadSnapshot(name) {
    // Load saved snapshot for comparison
    return this.snapshots.get(name);
  }

  analyzeParameterSensitivity(paramName, values) {
    // Run multiple simulations with different parameter values
    // Visualize how parameter changes affect outcomes
    // Generate sensitivity charts showing parameter impact
  }

  showSideBySide() {
    // Display simulations side-by-side
  }

  showDeltaMap() {
    // Display difference map between simulations
  }
}
```

## Data Models

### Simulation State

```javascript
{
  lattice: {
    width: number,
    height: number,
    depth: number,
    nodes: Array<Node>
  },
  time: number,
  parameters: {
    symmetryStrength: number,
    anomalyProbability: number,
    interactionRange: number,
    timeStep: number
  },
  statistics: {
    symmetricNodes: number,
    asymmetricNodes: number,
    anomalies: number,
    totalEnergy: number
  }
}
```

### Node State

```javascript
{
  position: { x: number, y: number, z: number },
  state: 'symmetric' | 'asymmetric' | 'anomaly',
  energy: number,
  phase: number,
  neighbors: Array<Node>
}
```

### User Settings

```javascript
{
  renderMode: '2d' | '3d',
  colorScheme: 'default' | 'energy' | 'phase',
  showGrid: boolean,
  showConnections: boolean,
  showParticleTrails: boolean,
  showMiniMap: boolean,
  showRegionsOfInterest: boolean,
  showRealTimeAnnotations: boolean,
  animationSpeed: number,
  playbackSpeed: number, // For slow-motion and fast-forward
  latticeSize: number,
  language: 'en' | 'ru',
  theme: 'light' | 'dark' | 'high-contrast',
  mode: 'beginner' | 'expert',
  tutorialCompleted: boolean,
  analyticsLayout: string,
  bookmarks: Array<Bookmark>,
  keyboardShortcuts: Map<string, string>,
  historyDepth: number,
  autoSave: boolean,
  userNotes: Array<Note>,
  customTests: Array<PhysicsTest>,
  lessonPlans: Array<Lesson>
}
```

### Physics Problem Data

```javascript
{
  id: string,
  name: string,
  description: string,
  category: 'cosmology' | 'quantum' | 'particle' | 'gravity',
  initialConditions: {
    latticeConfig: object,
    parameters: object
  },
  standardModelPrediction: {
    expectedBehavior: string,
    limitations: Array<string>
  },
  tdsModelPrediction: {
    expectedBehavior: string,
    advantages: Array<string>
  },
  experimentalData: Array<{
    source: string,
    values: Array<number>,
    uncertainty: number
  }>,
  references: Array<{
    title: string,
    authors: Array<string>,
    url: string,
    abstract: string
  }>
}
```

### Analytics Metrics

```javascript
{
  timestamp: number,
  energy: {
    total: number,
    kinetic: number,
    potential: number,
    distribution: Array<number>
  },
  symmetry: {
    ratio: number,
    localVariance: number,
    globalOrder: number
  },
  anomalies: {
    count: number,
    density: number,
    propagationRate: number
  },
  entropy: number,
  correlationLength: number
}
```

### Utility Components

#### Storage Manager

**Design Rationale**: Abstracts storage complexity and handles quota management gracefully.

```typescript
class Storage {
  saveToLocalStorage(key: string, data: any): void {
    // Save to LocalStorage with error handling
    // Handle quota exceeded errors
  }

  loadFromLocalStorage(key: string): any {
    // Load from LocalStorage with fallback
  }

  saveToIndexedDB(storeName: string, key: string, data: any): Promise<void> {
    // Save large data to IndexedDB
    // Used for: simulation history, snapshots, lesson plans
  }

  loadFromIndexedDB(storeName: string, key: string): Promise<any> {
    // Load from IndexedDB
  }

  clearOldHistory(): void {
    // Clear old history when quota exceeded
  }
}
```

#### URL Parameter Manager

**Design Rationale**: Enables sharing of simulation states via URL, facilitating collaboration and reproducibility.

```typescript
class URLParams {
  encodeState(state: SimulationState): string {
    // Encode simulation state to URL parameters
    // Compress data to keep URL manageable
    return encodeURIComponent(JSON.stringify(state));
  }

  decodeState(urlParams: string): SimulationState {
    // Decode simulation state from URL
    return JSON.parse(decodeURIComponent(urlParams));
  }

  generateShareableURL(state: SimulationState): string {
    // Generate complete shareable URL
    const params = this.encodeState(state);
    return `${window.location.origin}${window.location.pathname}?state=${params}`;
  }

  loadStateFromURL(): SimulationState | null {
    // Load state from current URL if present
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    return stateParam ? this.decodeState(stateParam) : null;
  }
}
```

#### Keyboard Shortcuts Manager

**Design Rationale**: Centralized keyboard shortcut management with conflict detection and user customization.

```typescript
class KeyboardShortcuts {
  private shortcuts: Map<string, Function>;
  private customShortcuts: Map<string, string>;

  register(key: string, action: Function, description: string): void {
    // Register keyboard shortcut
    // Detect conflicts with existing shortcuts
  }

  unregister(key: string): void {
    // Unregister shortcut
  }

  customize(key: string, newKey: string): void {
    // Allow user to customize shortcuts
    // Save to preferences
  }

  showHelp(): void {
    // Display keyboard shortcuts help overlay
  }

  handleKeyPress(event: KeyboardEvent): void {
    // Handle keyboard events
    // Execute registered actions
  }
}
```

## Physics Model

### TDS Core Law Implementation

Implementation of the Theory of Dynamic Symmetry core law:

```javascript
class Physics {
  static calculateSymmetryTransition(node, neighbors, params) {
    // Calculate symmetry transition probability
    const localSymmetry = this.calculateLocalSymmetry(neighbors);
    const energyGradient = this.calculateEnergyGradient(node, neighbors);
    
    const transitionProbability = 
      params.symmetryStrength * localSymmetry - 
      params.anomalyProbability * energyGradient;
    
    return transitionProbability;
  }

  static calculateLocalSymmetry(neighbors) {
    // Calculate local symmetry
    const symmetricCount = neighbors.filter(n => n.state === 'symmetric').length;
    return symmetricCount / neighbors.length;
  }

  static calculateEnergyGradient(node, neighbors) {
    // Calculate energy gradient
    const avgEnergy = neighbors.reduce((sum, n) => sum + n.energy, 0) / neighbors.length;
    return Math.abs(node.energy - avgEnergy);
  }

  static propagateAnomaly(anomalyNode, lattice, params) {
    // Propagate anomaly across lattice
    const neighbors = lattice.getNeighbors(anomalyNode);
    neighbors.forEach(neighbor => {
      const distance = this.calculateDistance(anomalyNode, neighbor);
      const influence = Math.exp(-distance / params.interactionRange);
      
      if (Math.random() < influence * params.anomalyProbability) {
        neighbor.state = 'anomaly';
      }
    });
  }

  static calculateReversibleDynamics(currentState, previousState) {
    // Ensure dynamics reversibility
    return {
      forward: currentState,
      backward: previousState,
      isReversible: this.checkReversibility(currentState, previousState)
    };
  }
}
```

## Error Handling

### Error Types

1. **Initialization Errors**: Errors when creating lattice or renderer
2. **Rendering Errors**: Errors during rendering (WebGL unavailable)
3. **State Errors**: Invalid simulation state
4. **Storage Errors**: Errors when working with localStorage

### Error Handling Strategy

```javascript
class ErrorHandler {
  static handle(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly message
    this.showUserMessage(this.getUserFriendlyMessage(error));
    
    // Attempt recovery
    this.attemptRecovery(error, context);
  }

  static getUserFriendlyMessage(error) {
    const messages = {
      'WebGLNotSupported': 'Your browser does not support 3D visualization. Use 2D mode.',
      'StorageQuotaExceeded': 'Not enough space to save history.',
      'InvalidLatticeSize': 'Invalid lattice size. Use a value between 5 and 100.'
    };
    return messages[error.name] || 'An error occurred. Try reloading the page.';
  }

  static attemptRecovery(error, context) {
    if (error.name === 'WebGLNotSupported') {
      // Switch to 2D mode
      window.app.switchTo2D();
    } else if (error.name === 'StorageQuotaExceeded') {
      // Clear old history
      window.app.clearOldHistory();
    }
  }
}
```

## Testing Strategy

**Design Rationale**: Comprehensive testing ensures the simulation meets performance targets and provides scientifically accurate results.

### Unit Tests

Focus on core logic and calculations:

- **Lattice Tests**: Node creation, neighbor queries, region detection
- **Node Tests**: State transitions, energy calculations
- **Physics Tests**: 
  - Symmetry calculation correctness
  - Dynamics reversibility (forward then backward = original state)
  - Energy conservation
  - Anomaly propagation rules
- **Utility Tests**: Storage, URL encoding, keyboard shortcuts

### Integration Tests

Test component interactions:

- **Simulation Engine**: Start, stop, pause, step, reverse
- **UI Updates**: Verify UI reflects simulation state changes
- **State Persistence**: Save and load complete simulation state
- **Analytics Pipeline**: Metrics collection → calculation → visualization
- **Event System**: Component communication via events

### Visual Regression Tests

Ensure consistent rendering:

- Screenshot comparison for key simulation states
- Verify rendering correctness across browsers
- Test 2D/3D mode switching
- Validate color schemes and themes
- Check particle effects and animations

### Performance Tests

Validate performance targets:

- **FPS Testing**: Measure frame rate at various lattice sizes
  - Target: ≥60 FPS for 100×100×100 lattice
  - Test on mid-range hardware
- **Memory Testing**: Monitor memory usage over time
  - Target: <500MB for large simulations
  - Detect memory leaks
- **Load Time Testing**: Measure initial load time
  - Target: ≤3 seconds on standard broadband
  - Test with throttled network
- **Bundle Size**: Verify total size ≤10MB
- **Analytics Latency**: Measure metric update time
  - Target: ≤200ms

### Accessibility Tests

Ensure WCAG 2.1 AA compliance:

- Automated testing with axe-core
- Keyboard navigation testing
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Color contrast validation
- Focus indicator visibility
- ARIA label correctness

### Cross-Browser Testing

Test on target browsers:

- Chrome 90+ (desktop and mobile)
- Firefox 88+ (desktop and mobile)
- Safari 14+ (desktop and mobile)
- Edge 90+ (desktop)

Verify:
- WebGL support and fallbacks
- Canvas rendering consistency
- LocalStorage/IndexedDB functionality
- Service Worker behavior
- Touch interactions on mobile

### Educational Feature Tests

Validate learning features:

- Tutorial flow completion
- Quiz answer validation
- Lesson plan creation and loading
- Presentation mode functionality
- Worksheet generation

### Physics Validation Tests

Verify scientific accuracy:

- Compare TDS predictions with known results
- Validate against physics problem scenarios
- Test custom problem creation
- Verify experimental data overlay accuracy

## Deployment

### Build Process

**Design Rationale**: Vite provides fast development iteration and optimized production builds with automatic code splitting and tree shaking to meet the ≤10MB bundle size target.

```bash
# Install dependencies
npm install

# Development with hot reload (port 3000)
npm run dev

# Production build (includes TypeScript compilation)
npm run build

# Preview production build
npm run preview

# Code quality checks
npm run lint              # Check for linting issues
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format all code with Prettier
npm run format:check      # Check formatting without changes
npm run type-check        # Run TypeScript type checking
```

### GitHub Pages Configuration

**Design Rationale**: Automated deployment ensures consistent builds and reduces manual deployment errors.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Vite Configuration

**Design Rationale**: Configuration optimized for GitHub Pages deployment with PWA support and performance targets.

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/quintarum.github.io/',  // GitHub Pages base path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'chart': ['chart.js'],
          'i18n': ['i18next']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TDS Web Simulation',
        short_name: 'TDS Sim',
        description: 'Interactive visualization of Theory of Dynamic Symmetry',
        theme_color: '#1a1a2e',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

## Performance Optimization

**Design Rationale**: Performance optimizations are critical to meet the target of ≥60 FPS for lattices up to 100×100×100 while maintaining ≤10MB bundle size and ≤3s load time.

### Rendering Optimization

1. **Canvas Optimization**
   - Using requestAnimationFrame for smooth 60 FPS animation
   - Rendering only visible nodes (viewport culling)
   - Caching immutable elements (grid lines, static backgrounds)
   - Dirty rectangle optimization for 2D rendering
   - Adaptive quality: reduce detail when FPS drops below 60

2. **3D Optimization**
   - Using instanced rendering for nodes (single draw call for all nodes)
   - LOD (Level of Detail) for large lattices (>50×50×50)
   - Frustum culling to remove invisible objects
   - Occlusion culling for dense lattices
   - Texture atlasing for particle effects
   - Geometry instancing for repeated elements

3. **Animation Optimization**
   - Smooth transitions between states using interpolation
   - Variable playback speed (0.1x to 10x) without frame drops
   - Efficient slow-motion rendering using frame interpolation
   - Fast-forward mode with frame skipping

### Memory Optimization

**Target**: Keep memory usage under 500MB for 100×100×100 lattice with 1000-step history.

1. **History Management**
   - User-configurable history depth (default: 1000 steps)
   - Delta-compression for state storage (store only changes)
   - Automatic cleanup when approaching memory limits
   - Periodic garbage collection hints
   - IndexedDB for long-term history storage

2. **Object Pooling**
   - Reusing node objects during lattice resize
   - Pool for temporary calculation arrays
   - Reusing particle effect objects
   - Mesh pooling for 3D rendering

3. **Data Structures**
   - Typed arrays (Int8Array, Float32Array) for node states
   - Sparse arrays for anomaly tracking
   - Efficient neighbor lookup using spatial indexing

### Bundle Size Optimization

**Target**: ≤10MB total bundle size.

1. **Code Splitting**
   - Lazy loading for 3D renderer (only when needed)
   - Separate chunks for educational features
   - Dynamic imports for physics problems data

2. **Tree Shaking**
   - Import only used Three.js modules
   - Remove unused Chart.js components
   - Eliminate dead code with Terser

3. **Asset Optimization**
   - Compress textures and images
   - Minify JSON data files
   - Use SVG for icons (smaller than PNG)

### Load Time Optimization

**Target**: ≤3 seconds on standard broadband.

1. **Critical Path**
   - Inline critical CSS
   - Defer non-critical JavaScript
   - Preload key assets
   - Use resource hints (preconnect, prefetch)

2. **Caching Strategy**
   - Service Worker for offline caching
   - Cache-first strategy for static assets
   - Network-first for simulation data
   - Versioned cache invalidation

### Analytics Performance

**Target**: ≤200ms latency for metric updates.

1. **Efficient Calculations**
   - Incremental metric updates (not full recalculation)
   - Web Workers for heavy calculations (future)
   - Throttled chart updates (max 10 FPS for charts)
   - Batch DOM updates

2. **Chart Optimization**
   - Limit data points displayed (max 1000 per chart)
   - Use canvas-based charts (not SVG)
   - Debounce resize events
   - Lazy render off-screen charts

## Educational Features

**Design Rationale**: Educational features are designed to accommodate different learning styles (visual, textual, interactive) and expertise levels, making TDS theory accessible to students while providing depth for researchers.

### Interactive Tutorial System

The tutorial system will guide new users through the simulation with step-by-step instructions:

1. **Welcome Screen**: Brief introduction to TDS theory
2. **Interface Tour**: Highlight and explain each UI element
3. **Basic Interaction**: Guide user through creating first anomaly
4. **Parameter Exploration**: Demonstrate effect of different parameters
5. **Advanced Features**: Introduce analytics, comparison, and physics problems

**Multimedia Support**:
- Optional video tutorials for complex concepts
- Animated demonstrations of TDS principles
- Interactive exercises with immediate feedback

### Preset Scenarios

Pre-configured scenarios for quick exploration with explanations:

- **High Symmetry**: Stable, highly ordered system
- **Chaotic**: High anomaly probability, dynamic behavior
- **Oscillating**: Periodic symmetry transitions
- **Avalanche**: Cascading anomaly propagation
- **Equilibrium**: Balanced state demonstration

Each preset includes:
- Descriptive narration text
- Expected behavior explanation
- Key concepts highlighted
- Suggested observations

### Guided Tours

Thematic tours focusing on specific concepts:

- **Symmetry Basics**: Understanding symmetric and asymmetric states
- **Anomaly Dynamics**: How anomalies form and propagate
- **Time Reversibility**: Exploring reversible dynamics
- **Energy Conservation**: Tracking energy through the system
- **Physics Problems**: Tour of unsolved problems and TDS solutions

### Presentation Mode

**Design Rationale**: Enables educators to demonstrate TDS concepts in classroom settings without UI distractions.

Features:
- Fullscreen, distraction-free visualization
- Presenter notes panel (visible only to presenter)
- Slide-based navigation through concepts
- Laser pointer tool for highlighting
- Automatic progression through preset scenarios

### Lesson Planning Tools

**Design Rationale**: Empowers educators to create custom learning experiences tailored to their curriculum.

```javascript
class LessonPlanner {
  constructor() {
    this.lessons = [];
    this.worksheets = [];
  }

  createLesson(name, steps) {
    // Create custom lesson plan with:
    // - Sequence of simulation states
    // - Explanatory text for each step
    // - Questions for students
    // - Expected observations
  }

  saveLesson(lesson) {
    // Save lesson plan to localStorage
    // Export as JSON for sharing
  }

  loadLesson(lessonId) {
    // Load saved lesson plan
  }

  generateWorksheet(lesson) {
    // Generate printable worksheet with:
    // - Simulation screenshots
    // - Questions and exercises
    // - Space for student observations
    // - Answer key (optional)
  }

  exportWorksheet(format) {
    // Export worksheet as PDF or HTML for printing
  }
}
```

### Interactive Quizzes

**Design Rationale**: Reinforces learning through active recall and provides immediate feedback.

```javascript
class Quiz {
  constructor() {
    this.questions = [];
    this.currentQuestion = 0;
    this.score = 0;
  }

  loadQuestions(topic) {
    // Load quiz questions for specific topic
    // Multiple choice, true/false, and simulation-based questions
  }

  checkAnswer(answer) {
    // Validate answer and provide immediate feedback
    // Explain why answer is correct or incorrect
  }

  showProgress() {
    // Display quiz progress and current score
  }

  generateCertificate() {
    // Generate completion certificate for successful quiz completion
  }
}
```

### Beginner/Expert Mode

**Design Rationale**: Adapts interface complexity to user expertise, preventing information overload for beginners while providing depth for experts.

**Beginner Mode**:
- Simplified parameter controls
- More explanatory text and tooltips
- Guided workflows
- Automatic suggestions
- Limited advanced features

**Expert Mode**:
- Full parameter access
- Technical terminology
- Advanced analytics
- Custom scripting (future)
- All features unlocked

Toggle available in settings with smooth transition between modes.

## Physics Problems Integration

### Problem Categories

1. **Cosmology**
   - Dark matter and dark energy
   - Cosmic inflation
   - Large-scale structure formation

2. **Quantum Mechanics**
   - Measurement problem
   - Wave function collapse
   - Quantum entanglement

3. **Particle Physics**
   - Matter-antimatter asymmetry
   - Hierarchy problem
   - Neutrino masses

4. **Gravity & Spacetime**
   - Black hole information paradox
   - Quantum gravity
   - Singularity resolution

### Comparison Methodology

For each problem, the simulation will:

1. Load problem-specific initial conditions
2. Run TDS simulation
3. Display standard model predictions
4. Overlay experimental data (where available)
5. Highlight areas where TDS provides better fit
6. Generate quantitative comparison metrics
7. Provide references to relevant research

## Analytics & Data Visualization

**Design Rationale**: Real-time analytics provide quantitative validation of TDS predictions and enable researchers to identify interesting phenomena as they occur.

### Real-Time Charts

- **Energy Distribution**: Histogram showing energy across nodes
- **Symmetry Ratio**: Time series of symmetric vs asymmetric nodes
- **Anomaly Count**: Real-time anomaly tracking with event markers
- **Phase Diagram**: State space visualization
- **Correlation Function**: Spatial correlation analysis
- **Entropy Over Time**: Track system entropy evolution

All charts update with ≤200ms latency and support:
- Zoom and pan
- Export as PNG/SVG
- Customizable time ranges
- Automatic event highlighting

### Real-Time Annotations

**Design Rationale**: Annotations help users understand what's happening in the simulation without needing to interpret raw data.

```typescript
class AnnotationSystem {
  private annotations: Annotation[];

  detectEvent(metrics: Metrics): Annotation | null {
    // Automatically detect significant events:
    // - Symmetry breaking cascade
    // - Anomaly formation
    // - Energy spike
    // - Phase transition
    // - Equilibrium reached
  }

  showAnnotation(text: string, position: Vector2, duration: number): void {
    // Display floating annotation near relevant region
    // Auto-fade after duration
  }

  describeCurrentState(): string {
    // Generate natural language description of current simulation state
    // e.g., "High symmetry with localized anomaly propagation"
  }
}
```

### Statistical Analysis

- Mean, median, standard deviation for all metrics
- Autocorrelation analysis for temporal patterns
- Fourier analysis for periodic behavior detection
- Event detection with statistical significance testing
- Trend analysis with regression
- Correlation between different metrics

### Data Export

- **CSV format**: For spreadsheet analysis (Excel, Google Sheets)
- **JSON format**: For programmatic access and custom analysis
- **PNG/SVG export**: For charts and visualizations
- **PDF report generation**: Complete analysis report with:
  - Simulation parameters
  - Key metrics and statistics
  - Chart visualizations
  - Event timeline
  - Observations and notes

## Internationalization

### Supported Languages

- English (default)
- Russian
- Extensible architecture for additional languages

### Translation Coverage

- All UI text and labels
- Tutorial content
- Help documentation
- Error messages
- Physics problem descriptions

## Keyboard Shortcuts

**Design Rationale**: Keyboard shortcuts enable power users to work efficiently and improve accessibility for users who prefer or require keyboard navigation.

Default shortcuts:
- **Space**: Play/Pause simulation
- **R**: Reset simulation
- **←/→**: Step backward/forward
- **↑/↓**: Increase/decrease playback speed
- **1/2/3**: Switch between render modes
- **B**: Add bookmark at current time
- **H**: Toggle help panel
- **G**: Toggle glossary
- **Ctrl+E**: Export current state
- **Ctrl+I**: Import configuration
- **F**: Toggle fullscreen
- **?**: Show keyboard shortcuts help

All shortcuts are user-configurable and saved to preferences.

## Accessibility

**Design Rationale**: Accessibility is a core requirement to ensure the simulation is usable by researchers and students with diverse abilities.

- **Keyboard Navigation**: Full keyboard support (Tab, Arrow keys, Enter, Space)
- **ARIA Labels**: All interactive elements have descriptive ARIA labels
- **Alternative Text**: Visual elements include text descriptions
- **High-Contrast Theme**: Dedicated high-contrast color scheme
- **Scalable Interface**: Supports browser zoom (100%-200%)
- **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver
- **Focus Indicators**: Clear visual focus indicators for all interactive elements
- **Skip Navigation**: Skip links to main content areas
- **Color Independence**: Information not conveyed by color alone
- **Reduced Motion**: Respects prefers-reduced-motion media query

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Using polyfills for older browsers when necessary.

## Offline Functionality

- Service Worker for caching
- Offline-first architecture
- Background sync for data export
- Progressive Web App (PWA) capabilities
