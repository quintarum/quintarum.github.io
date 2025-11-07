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
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
tds-simulation/
├── src/
│   ├── main.js              # Application entry point
│   ├── core/                # Core simulation logic
│   ├── rendering/           # 2D and 3D rendering
│   ├── analytics/           # Metrics and data analysis
│   ├── ui/                  # User interface components
│   ├── education/           # Educational features
│   ├── i18n/                # Internationalization
│   └── utils/               # Utility functions
├── styles/                  # CSS stylesheets
├── assets/                  # Static assets
└── index.html               # Main HTML file
```

## Technologies

- **Vite** - Build tool and dev server
- **Three.js** - 3D visualization
- **Chart.js** - Real-time charts and analytics
- **i18next** - Internationalization
- **PapaParse** - CSV data export

## License

ISC
