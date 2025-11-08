# Project Structure

```
tds-web-simulation/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── core/                      # Core simulation engine
│   │   ├── Node.ts                # Lattice node with state/energy
│   │   ├── Lattice.ts             # Lattice grid structure
│   │   ├── Physics.ts             # Physics calculations
│   │   ├── Simulation.ts          # Simulation lifecycle manager
│   │   └── PhysicsProblems.ts     # Educational problem sets
│   ├── rendering/                 # Visualization layer
│   │   ├── Renderer2D.ts          # Canvas 2D rendering
│   │   ├── Renderer3D.ts          # Three.js 3D rendering
│   │   ├── ColorScheme.ts         # Color palettes and themes
│   │   └── VisualEffects.ts       # Particle effects, glows
│   ├── ui/                        # User interface components
│   │   ├── Controls.ts            # Simulation controls panel
│   │   ├── InfoPanel.ts           # Information display
│   │   ├── Timeline.ts            # History timeline scrubber
│   │   ├── Tutorial.ts            # Guided tutorial system
│   │   ├── AnalyticsDashboard.ts  # Metrics and charts
│   │   ├── ComparisonView.ts      # Side-by-side comparison
│   │   └── PhysicsProblemsPanel.ts # Problem testing UI
│   ├── analytics/                 # Data collection and analysis
│   │   └── MetricsCollector.ts    # Real-time metrics tracking
│   ├── utils/                     # Utility functions
│   │   └── StateManager.ts        # State persistence
│   └── i18n/                      # Internationalization
│       ├── en.json                # English translations
│       └── ru.json                # Russian translations
├── styles/                        # CSS stylesheets
│   ├── main.css                   # Global styles
│   ├── controls.css               # Control panel styles
│   ├── analytics.css              # Dashboard styles
│   └── tutorial.css               # Tutorial overlay styles
├── assets/                        # Static assets
│   ├── docs/                      # TDS theory documents
│   ├── scenarios/                 # Preset simulation scenarios
│   ├── tutorials/                 # Tutorial content
│   └── physics-problems/          # Problem definitions
├── docs/                          # Theory documentation PDFs
├── index.html                     # Main HTML entry
└── vite.config.js                 # Vite configuration
```

## Architecture Patterns

### Core Layer
- **Simulation**: Manages lifecycle, history, bookmarks, time-reversibility
- **Lattice**: Grid structure with node management and neighbor queries
- **Node**: Individual lattice points with state (symmetric/broken/anomaly) and energy
- **Physics**: Pure functions for entropy, correlation length, energy calculations

### Rendering Layer
- **Renderer2D**: Canvas-based 2D visualization with effects
- **Renderer3D**: Three.js WebGL 3D visualization
- **ColorScheme**: Theme-aware color management
- **VisualEffects**: Particle systems, glows, ripples, halos

### UI Layer
- Modular UI components that interact with core simulation
- Event-driven updates via callbacks
- State management for persistence

## File Naming

- Use PascalCase for TypeScript class files: `Simulation.ts`, `Renderer2D.ts`
- Use camelCase for utility modules: `stateManager.ts`
- Use kebab-case for CSS files: `main.css`, `analytics.css`
- Use lowercase for JSON files: `en.json`, `package.json`

## Import Conventions

- Use explicit `.js` extensions in imports (Vite requirement for ES modules)
- Group imports: external libraries first, then internal modules
- Use named exports for classes and functions
- Avoid default exports except for main entry points
