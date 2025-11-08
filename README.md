# TDS Web Simulation

Interactive web simulation of the Theory of Dynamic Symmetry (TDS) - a theoretical model describing symmetry dynamics, anomalies, and reversible lattice dynamics.

## Features

- Interactive 2D and 3D lattice visualization
- Real-time symmetry dynamics simulation
- Anomaly propagation visualization
- Time-reversible dynamics
- Real-time analytics and metrics
- Educational tutorials and guided tours
- Physics problems testing interface
- Multi-language support (English, Russian)
- Progressive Web App (PWA) with offline support

## Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Scripts and Tools

```bash
# Generate PWA icons
npm run icons:generate

# Verify generated icons
npm run icons:verify
```

## TypeScript-Only Policy

This project follows a **strict TypeScript-only policy**:

- ✅ All source code must be TypeScript (`.ts`, `.tsx`)
- ✅ All scripts must be TypeScript (executed with `tsx`)
- ✅ Explicit type annotations required
- ❌ No JavaScript (`.js`, `.jsx`) files allowed

See `.kiro/steering/typescript-policy.md` for detailed guidelines.

## Project Structure

```
tds-simulation/
├── src/
│   ├── main.ts              # Application entry point (TypeScript)
│   ├── core/                # Core simulation logic (TypeScript)
│   ├── rendering/           # 2D and 3D rendering (TypeScript)
│   ├── analytics/           # Metrics and data analysis (TypeScript)
│   ├── ui/                  # User interface components (TypeScript)
│   ├── education/           # Educational features (TypeScript)
│   ├── i18n/                # Internationalization (JSON)
│   └── utils/               # Utility functions (TypeScript)
├── scripts/                 # Build and utility scripts (TypeScript)
├── styles/                  # CSS stylesheets
├── public/                  # Static assets and PWA icons
└── index.html               # Main HTML file
```

## Technologies

- **TypeScript** - Primary language (TypeScript-only codebase)
- **Vite** - Build tool and dev server
- **Three.js** - 3D visualization
- **Chart.js** - Real-time charts and analytics
- **i18next** - Internationalization
- **PapaParse** - CSV data export
- **tsx** - TypeScript execution for scripts

## License

ISC
