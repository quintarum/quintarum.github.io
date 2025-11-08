# Technology Stack

## Build System

- **Vite 7.x**: Modern build tool and dev server
- **TypeScript**: Primary language for all source code
- **ES Modules**: Native JavaScript modules (type: "module")
- **Terser**: Production minification

## Core Libraries

- **Three.js 0.181**: 3D visualization and WebGL rendering
- **Chart.js 4.5**: Real-time analytics charts and graphs
- **i18next 25.6**: Internationalization framework
- **PapaParse 5.5**: CSV data export

## Development Tools

- **ESLint 9.x**: Linting with flat config format
- **Prettier 3.6**: Code formatting
- **eslint-config-prettier**: ESLint/Prettier integration
- **vite-plugin-pwa**: Progressive Web App support

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Production
npm run build            # Build for production (includes TypeScript compilation)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all code
npm run format:check     # Check formatting without changes
npm run type-check       # Run TypeScript type checking
```

## TypeScript Configuration

- Use strict mode for type safety
- Target ES2020+ for modern browser features
- Enable all strict type-checking options
- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use enums for fixed sets of values (node states, simulation modes)

### Migration Status

Core simulation engine fully migrated to TypeScript:
- ✅ Node, Lattice, Physics, Simulation, PhysicsProblems
- 🔄 Rendering, UI, and utility modules remain in JavaScript
- See MIGRATION.md for details

## Browser Requirements

Modern browsers with ES2020+ support, WebGL for 3D rendering.

## Deployment

Static site deployment to GitHub Pages at `/quintarum.github.io/` base path.
