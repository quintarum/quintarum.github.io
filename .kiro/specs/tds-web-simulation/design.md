# Design Document

## Overview

This document defines the technical architecture and implementation strategy for the TDS Web Simulation, a reproducible research software platform implementing the Theory of Dynamic Symmetry. The design aligns with the functional requirements specified in requirements.md and follows principles of scientific software engineering including modularity, testability, and interoperability.

## Architecture Principles

1. **Separation of Concerns**: Core TDS physics engine decoupled from visualization and UI
2. **Reversibility by Design**: All state transitions must be invertible with history tracking
3. **Scientific Reproducibility**: Deterministic execution with complete state serialization
4. **Performance**: Target 60 FPS for lattices up to 100×100 nodes
5. **Interoperability**: Standard scientific data formats (HDF5, NetCDF, NumPy)
6. **Extensibility**: Plugin architecture for new physics scenarios and analysis tools

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TDS Web Application                      │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React/TypeScript)                                │
│  ├─ Control Panel    ├─ Analytics Dashboard                │
│  ├─ Timeline         ├─ Tutorial System                     │
│  └─ Export/Import    └─ Validation Monitor                  │
├─────────────────────────────────────────────────────────────┤
│  Visualization Layer (Three.js / Canvas 2D)                 │
│  ├─ 2D Renderer      ├─ 3D Renderer                        │
│  ├─ Color Schemes    ├─ Visual Effects                     │
│  └─ Geometry Visualization (curvature, gradients)          │
├─────────────────────────────────────────────────────────────┤
│  TDS Core Engine (TypeScript)                              │
│  ├─ Lattice          ├─ Node (spin states)                │
│  ├─ Physics          ├─ Simulation                         │
│  ├─ Conservation     ├─ Reversibility                      │
│  └─ Multi-Scale      └─ Anomaly Tracking                   │
├─────────────────────────────────────────────────────────────┤
│  Analytics & Validation                                     │
│  ├─ Metrics Collector  ├─ Validation Suite                │
│  ├─ Energy Monitor     ├─ Benchmark Tests                  │
│  └─ Statistical Analysis                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├─ State Manager    ├─ History Buffer                     │
│  ├─ Export Engine    ├─ Import Parser                      │
│  └─ Format Handlers (HDF5, NetCDF, NumPy, JSON-LD)        │
├─────────────────────────────────────────────────────────────┤
│  External Integration                                       │
│  ├─ Python API       ├─ REST/WebSocket                     │
│  ├─ Zenodo Client    ├─ DOI Manager                        │
│  └─ Repository Connectors                                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. TDS Core Engine

#### 1.1 Node Class

**Purpose**: Represents a single lattice cell with TDS properties

**State Variables**:
- `spin: -1 | +1` - Binary spin state s_i
- `E_sym: number` - Symmetric energy component
- `E_asym: number` - Asymmetric energy component
- `phase: number` - Phase φ ∈ [0, 2π]
- `omega: number` - Internal oscillation frequency ω₀
- `state: 'vacuum' | 'broken' | 'anomalous'` - Derived symmetry state

**Key Methods**:
- `calculateEnergy(neighbors: Node[], J: number): {E_sym, E_asym}` - Compute energy components
- `updateSpin(neighbors: Node[], params: PhysicsParams): void` - Evolve spin state
- `getMass(): number` - Return M = ℏω₀ for anomalous nodes
- `toJSON(): NodeData` - Serialize for export
- `fromJSON(data: NodeData): void` - Deserialize for import

**State Determination Logic**:
```typescript
if (E_asym === 0 && allNeighborsSatisfy(s_i * s_j === 1)) {
  state = 'vacuum'
} else if (E_asym > 0 && !isPersistent) {
  state = 'broken'
} else if (E_asym > 0 && isPersistent && hasStableOmega) {
  state = 'anomalous'
}
```

#### 1.2 Lattice Class

**Purpose**: Manages the discrete informational structure

**Properties**:
- `nodes: Node[]` - Flat array of nodes
- `dimensions: {width, height, depth}` - Lattice size
- `topology: 'periodic' | 'open'` - Boundary conditions
- `scale: number` - Current informational scale level

**Key Methods**:
- `getNode(x, y, z): Node` - Access node by coordinates
- `getNeighbors(node: Node, range: number): Node[]` - Get neighbors within range
- `calculateTotalEnergy(): {E_sym, E_asym, E_0}` - Sum all energy components
- `calculateT_info(J: number): number` - Compute J × Σ(1 - s_i × s_j)
- `findAnomalies(): Node[]` - Identify persistent topological defects
- `applyScale(newScale: number): void` - Switch informational scale

**Neighbor Calculation**:
- Support configurable interaction range (nearest, next-nearest, etc.)
- Efficient spatial indexing for large lattices
- Handle boundary conditions (periodic wrapping or open edges)

#### 1.3 Physics Class

**Purpose**: Implements TDS dynamics and conservation laws

**Core Functions**:

```typescript
// Energy conservation
function enforceConservation(lattice: Lattice, E_0: number): void {
  const {E_sym, E_asym} = lattice.calculateTotalEnergy()
  const deviation = (E_sym + E_asym) - E_0
  if (Math.abs(deviation) > TOLERANCE) {
    // Redistribute energy proportionally
    redistributeEnergy(lattice, deviation)
  }
}

// Reversible evolution
function evolveForward(lattice: Lattice, params: PhysicsParams, dt: number): void {
  // Store previous state for reversibility
  saveHistoryState(lattice)
  
  // Update all nodes
  for (const node of lattice.nodes) {
    const neighbors = lattice.getNeighbors(node)
    node.updateSpin(neighbors, params)
    node.calculateEnergy(neighbors, params.J)
  }
  
  // Enforce conservation
  enforceConservation(lattice, params.E_0)
}

function evolveBackward(lattice: Lattice): boolean {
  return restoreHistoryState(lattice)
}

// Anomaly detection
function detectAnomalies(lattice: Lattice, historyDepth: number): Node[] {
  const anomalies: Node[] = []
  
  for (const node of lattice.nodes) {
    if (isPersistentAsymmetry(node, historyDepth)) {
      node.state = 'anomalous'
      node.omega = calculateOmega(node)
      anomalies.push(node)
    }
  }
  
  return anomalies
}

// Informational tension
function calculateT_info(lattice: Lattice, J: number): number {
  let tension = 0
  
  for (const node of lattice.nodes) {
    const neighbors = lattice.getNeighbors(node)
    for (const neighbor of neighbors) {
      tension += (1 - node.spin * neighbor.spin)
    }
  }
  
  return J * tension / 2 // Divide by 2 to avoid double counting
}

// Informational geometry
function calculateMetric(lattice: Lattice): number[][] {
  const rho = calculateAsymmetricDensity(lattice)
  const grad_rho = calculateGradient(rho)
  
  // g_ij^(info) ∝ ∂_i ρ × ∂_j ρ
  return outerProduct(grad_rho, grad_rho)
}
```

**Conservation Enforcement**:
- Monitor E_sym + E_asym = E_0 at each step
- Redistribute energy if deviation exceeds tolerance
- Log violations for validation reporting

**Reversibility Implementation**:
- Delta compression for history storage
- Verify dE_sym/dt = -dE_asym/dt
- Measure reversibility score on backward evolution

#### 1.4 Simulation Class

**Purpose**: Manages simulation lifecycle and history

**State**:
- `lattice: Lattice` - Current lattice state
- `params: PhysicsParams` - Simulation parameters (J, dt, etc.)
- `time: number` - Current simulation time
- `direction: 1 | -1` - Time direction
- `history: SimulationState[]` - State history for reversibility
- `bookmarks: Bookmark[]` - User-saved states

**Key Methods**:
- `step(dt: number): StepResult` - Advance simulation by one time step
- `reverse(): void` - Switch to backward time evolution
- `seekToTime(t: number): void` - Jump to specific time in history
- `addBookmark(description: string): Bookmark` - Save current state
- `validate(): ValidationReport` - Run validation suite
- `export(format: ExportFormat): ExportData` - Export to scientific format

**History Management**:
- Configurable max depth (default 1000 steps)
- Delta compression to reduce memory
- Efficient seeking with binary search

### 2. Visualization Layer

#### 2.1 Renderer Architecture

**2D Renderer** (Canvas API):
- Grid-based visualization
- Color-coded states (vacuum: green, broken: yellow, anomalous: red)
- Energy overlay (brightness/glow)
- Phase visualization (hue rotation)
- T_info gradient overlay

**3D Renderer** (Three.js):
- Instanced mesh for performance
- Camera controls (orbit, zoom, pan)
- Lighting for depth perception
- Particle effects for anomaly propagation
- Geometry distortion for curvature visualization

**Color Scheme**:
```typescript
const TDS_COLORS = {
  vacuum: '#4CAF50',      // Green - balanced
  broken: '#FFC107',      // Yellow - transitional
  anomalous: '#F44336',   // Red - defect
  E_sym: '#2196F3',       // Blue for symmetric energy
  E_asym: '#FF5722'       // Orange for asymmetric energy
}
```

#### 2.2 Visual Effects

**Anomaly Visualization**:
- Pulsation at frequency ω₀
- Halo effect proportional to mass M = ℏω₀
- Ripple effects for propagation

**Energy Flow**:
- Arrows showing dE_sym/dt and dE_asym/dt
- Gradient visualization for T_info
- Conservation indicator (E_sym + E_asym = E_0)

**Geometry Curvature**:
- Grid distortion based on g_ij^(info)
- Color gradient for scalar curvature
- Toggle between flat and curved views

### 3. Analytics & Validation

#### 3.1 Metrics Collector

**Real-time Metrics**:
- E_sym, E_asym, E_0 (with conservation check)
- T_info = J × Σ(1 - s_i × s_j)
- Anomaly count and density
- State distribution (vacuum/broken/anomalous ratios)
- Phase coherence
- Correlation length

**Time Series Storage**:
- Circular buffer for recent history
- Downsampling for long simulations
- Export to CSV, Parquet, HDF5

#### 3.2 Validation Suite

**Conservation Tests**:
```typescript
function testEnergyConservation(simulation: Simulation, steps: number): ValidationResult {
  const E_0_initial = simulation.lattice.calculateTotalEnergy().E_0
  
  for (let i = 0; i < steps; i++) {
    simulation.step()
    const {E_sym, E_asym} = simulation.lattice.calculateTotalEnergy()
    const E_0_current = E_sym + E_asym
    const deviation = Math.abs(E_0_current - E_0_initial)
    
    if (deviation > TOLERANCE) {
      return {
        passed: false,
        step: i,
        deviation,
        message: `Energy conservation violated at step ${i}`
      }
    }
  }
  
  return {passed: true, message: 'Energy conserved'}
}
```

**Reversibility Tests**:
```typescript
function testReversibility(simulation: Simulation, steps: number): ValidationResult {
  const initialState = simulation.lattice.toJSON()
  
  // Forward evolution
  for (let i = 0; i < steps; i++) {
    simulation.step()
  }
  
  // Backward evolution
  simulation.reverse()
  for (let i = 0; i < steps; i++) {
    simulation.step()
  }
  
  const finalState = simulation.lattice.toJSON()
  const similarity = compareStates(initialState, finalState)
  
  return {
    passed: similarity > 0.99,
    similarity,
    message: `Reversibility score: ${similarity}`
  }
}
```

**Benchmark Scenarios**:
1. **Photon Mode**: Perfectly reversible cycle with E_asym oscillating
2. **Stable Defect**: Persistent anomaly with constant ω₀
3. **Phase Transition**: Cascade of symmetry breaking

### 4. Data Layer

#### 4.1 Export Engine

**HDF5 Structure**:
```
/
├── lattice/
│   ├── spins [N×M×L int8]
│   ├── E_sym [N×M×L float32]
│   ├── E_asym [N×M×L float32]
│   ├── phase [N×M×L float32]
│   └── omega [N×M×L float32]
├── energy/
│   ├── E_sym_total [T float64]
│   ├── E_asym_total [T float64]
│   ├── E_0 [scalar float64]
│   └── T_info [T float64]
├── anomalies/
│   ├── positions [A×3 int32]
│   ├── omega [A float32]
│   ├── mass [A float32]
│   └── timestamps [A float64]
├── geometry/
│   ├── metric [N×M×3×3 float32]
│   └── curvature [N×M float32]
└── metadata/
    ├── parameters (attributes)
    ├── tds_version (attribute)
    ├── timestamp (attribute)
    ├── author (attribute)
    ├── orcid (attribute)
    └── doi (attribute)
```

**Format Handlers**:
- HDF5Writer/Reader (using h5wasm for browser)
- NetCDFWriter (for climate science compatibility)
- NumPyWriter (.npy/.npz)
- MATLABWriter (.mat v7.3)
- ParquetWriter (for tabular data)
- VTKWriter (for ParaView)
- GLTFWriter (for 3D web visualization)

#### 4.2 JSON-LD Schema

```json
{
  "@context": {
    "@vocab": "http://tds-theory.org/ontology#",
    "E_sym": {"@type": "InformationalEnergy"},
    "E_asym": {"@type": "InformationalEnergy"},
    "T_info": {"@type": "InformationalTension"},
    "anomaly": {"@type": "TopologicalDefect"}
  },
  "@type": "TDSSimulation",
  "parameters": {
    "J": 1.0,
    "lattice_size": [50, 50, 1],
    "dt": 0.1
  },
  "results": {
    "E_sym": [...],
    "E_asym": [...],
    "anomalies": [...]
  }
}
```

### 5. External Integration

#### 5.1 Python API

**Client Library** (`tds_sim.py`):
```python
from tds_sim import TDSSimulation

# Create simulation
sim = TDSSimulation(width=50, height=50, J=1.0)

# Run simulation
for i in range(100):
    sim.step()

# Get results
E_sym, E_asym = sim.get_energies()
anomalies = sim.get_anomalies()

# Export
sim.export_hdf5('results.h5')
```

**REST API Endpoints**:
- `POST /api/simulation/create` - Initialize simulation
- `POST /api/simulation/step` - Advance one step
- `GET /api/simulation/state` - Get current state
- `POST /api/simulation/export` - Export data
- `GET /api/validation/run` - Run validation suite

#### 5.2 Zenodo Integration

**Publication Workflow**:
1. User clicks "Publish to Zenodo"
2. System generates metadata from simulation parameters
3. Exports data to HDF5 with complete metadata
4. Uploads to Zenodo via API
5. Receives DOI and displays to user
6. Stores DOI in simulation metadata

**Metadata Generation**:
```typescript
function generateZenodoMetadata(simulation: Simulation): ZenodoMetadata {
  return {
    title: `TDS Simulation: ${simulation.description}`,
    upload_type: 'dataset',
    description: `Theory of Dynamic Symmetry simulation with parameters: J=${simulation.params.J}, lattice=${simulation.lattice.dimensions}`,
    creators: [{name: simulation.author, orcid: simulation.orcid}],
    keywords: ['TDS', 'symmetry', 'lattice', 'reversible dynamics'],
    related_identifiers: [
      {identifier: 'https://tds-theory.org', relation: 'isSupplementTo'}
    ]
  }
}
```

## Data Models

### PhysicsParams
```typescript
interface PhysicsParams {
  J: number                    // Coupling strength
  dt: number                   // Time step
  E_0: number                  // Total conserved energy
  interactionRange: number     // Neighbor range
  tolerance: number            // Conservation tolerance
  scale: number                // Informational scale level
}
```

### SimulationState
```typescript
interface SimulationState {
  time: number
  latticeData: LatticeData
  energies: {E_sym: number, E_asym: number, E_0: number}
  T_info: number
  anomalies: AnomalyData[]
  metrics: MetricsSnapshot
}
```

### ValidationReport
```typescript
interface ValidationReport {
  timestamp: string
  tests: {
    energyConservation: TestResult
    reversibility: TestResult
    topologicalCharge: TestResult
  }
  benchmarks: {
    photonMode: BenchmarkResult
    stableDefect: BenchmarkResult
    phaseTransition: BenchmarkResult
  }
  overallScore: number
}
```

## Performance Considerations

### Optimization Strategies

1. **Spatial Indexing**: Use grid-based spatial hash for neighbor queries
2. **Instanced Rendering**: Three.js InstancedMesh for thousands of nodes
3. **Web Workers**: Offload physics calculations to background thread
4. **Delta Compression**: Store only changes in history buffer
5. **Lazy Evaluation**: Calculate metrics only when requested
6. **Memoization**: Cache expensive calculations (metric, curvature)

### Memory Management

- **History Buffer**: Circular buffer with configurable depth
- **Downsampling**: Reduce resolution for old history
- **Streaming Export**: Write large datasets incrementally
- **Garbage Collection**: Explicit cleanup of old states

### Target Performance

- 60 FPS for 50×50 lattice
- 30 FPS for 100×100 lattice
- < 3s initial load time
- < 500ms export time for typical dataset
- < 100ms validation suite execution

## Error Handling

### Conservation Violations

```typescript
class ConservationViolationError extends Error {
  constructor(
    public step: number,
    public expected: number,
    public actual: number,
    public deviation: number
  ) {
    super(`Energy conservation violated at step ${step}: deviation ${deviation}`)
  }
}
```

### Recovery Strategies

1. **Energy Redistribution**: Proportionally adjust node energies
2. **State Rollback**: Revert to last valid state
3. **Parameter Adjustment**: Reduce time step
4. **User Notification**: Display warning with details

## Testing Strategy

### Unit Tests

- Node state transitions
- Energy calculations
- Neighbor finding
- Conservation enforcement
- History management

### Integration Tests

- Full simulation cycles
- Export/import round-trips
- Validation suite execution
- API endpoint responses

### Validation Tests

- Energy conservation over 1000 steps
- Reversibility with 99% accuracy
- Benchmark scenario reproduction
- Cross-format compatibility

## Deployment

### Build Process

1. TypeScript compilation with strict mode
2. Bundle optimization with Vite
3. PWA manifest generation
4. Service worker for offline support
5. Asset optimization (icons, fonts)

### GitHub Pages Deployment

- Static site generation
- Base path configuration
- CORS headers for API
- CDN for large assets

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Extensions

### Phase 2 Features

- WebGPU acceleration for large lattices
- Multi-user collaboration (shared simulations)
- Machine learning integration (anomaly prediction)
- VR/AR visualization modes

### Research Tools

- Parameter sweep automation
- Statistical analysis suite
- Comparison with experimental data
- Publication-ready figure generation

## References

- TDS Core Law Paper
- TDS Manifest 2025
- Symmetry Anomalies Framework
- HDF5 Specification
- FAIR Data Principles
