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

#### 3.3 Photon Window Test (Advanced Reversibility Validation)

**Purpose**: Rigorous test of perfect reversibility inspired by the author's reference implementation

**Algorithm**:
```typescript
interface PhotonWindowResult {
  hammingDistance: number
  reversibilityRatio: number
  passed: boolean
  message: string
}

function photonWindowTest(
  simulation: Simulation, 
  steps: number = 300
): PhotonWindowResult {
  // Save initial state
  const initialSpins = new Int8Array(simulation.lattice.nodes.map(n => n.spin))
  const initialPhase = simulation.phaseStep
  
  // Forward evolution
  for (let i = 0; i < steps; i++) {
    simulation.step()
  }
  
  // Backward evolution
  for (let i = 0; i < steps; i++) {
    simulation.reverseStep()
  }
  
  // Calculate Hamming distance
  const finalSpins = simulation.lattice.nodes.map(n => n.spin)
  let hammingDistance = 0
  for (let i = 0; i < initialSpins.length; i++) {
    if (initialSpins[i] !== finalSpins[i]) {
      hammingDistance++
    }
  }
  
  const ratio = hammingDistance / initialSpins.length
  const passed = ratio < 0.001  // 0.1% tolerance
  
  return {
    hammingDistance,
    reversibilityRatio: ratio,
    passed,
    message: passed ? `OK ${ratio.toFixed(6)}` : `LOST ${ratio.toFixed(6)}`
  }
}
```

**UI Integration**:
- Button "Photon Window" in control panel
- Color-coded result display: green if passed, red if failed
- Detailed metrics in stats panel

#### 3.4 Advanced Statistical Analytics

**Real-Time Correlation Tracking** (Welford's Algorithm):
```typescript
class OnlineStatistics {
  private n = 0
  private meanEs = 0
  private meanEa = 0
  private Ccov = 0      // Covariance accumulator
  private varEs = 0     // Variance accumulator for E_sym
  private varEa = 0     // Variance accumulator for E_asym
  
  update(E_sym: number, E_asym: number): void {
    this.n++
    const dEs = E_sym - this.meanEs
    const dEa = E_asym - this.meanEa
    
    this.meanEs += dEs / this.n
    this.meanEa += dEa / this.n
    
    this.Ccov += dEs * (E_asym - this.meanEa)
    this.varEs += dEs * (E_sym - this.meanEs)
    this.varEa += dEa * (E_asym - this.meanEa)
  }
  
  getCorrelation(): number {
    if (this.n < 2) return 0
    
    const cov = this.Ccov / (this.n - 1)
    const vEs = this.varEs / (this.n - 1)
    const vEa = this.varEa / (this.n - 1)
    
    if (vEs > 0 && vEa > 0) {
      return cov / Math.sqrt(vEs * vEa)
    }
    return 0
  }
}
```

**Energy Drift Monitoring**:
```typescript
class DriftMonitor {
  private driftSumAbs = 0
  private driftMaxAbs = 0
  private n = 0
  
  update(E_0_current: number, E_0_ref: number = 1.0): void {
    const drift = Math.abs(E_0_current - E_0_ref)
    this.driftSumAbs += drift
    this.driftMaxAbs = Math.max(this.driftMaxAbs, drift)
    this.n++
  }
  
  getMeanDrift(): number {
    return this.n > 0 ? this.driftSumAbs / this.n : 0
  }
  
  getMaxDrift(): number {
    return this.driftMaxAbs
  }
}
```

**Fourier Mode Amplitude Tracking**:
```typescript
class ModeAmplitudeTracker {
  private kx: number
  private N: number
  private cosLUT: Float32Array
  private akSumSq = 0
  private n = 0
  
  constructor(kx: number, N: number) {
    this.kx = kx
    this.N = N
    this.cosLUT = new Float32Array(N)
    this.rebuildLUT()
  }
  
  private rebuildLUT(): void {
    for (let x = 0; x < this.N; x++) {
      this.cosLUT[x] = Math.cos(2 * Math.PI * (this.kx * x) / this.N)
    }
  }
  
  calculateAmplitude(lattice: Lattice): number {
    let proj = 0
    for (const node of lattice.nodes) {
      proj += node.spin * this.cosLUT[node.position.x]
    }
    const amplitude = Math.abs(proj) / (this.N * this.N * this.N)
    
    this.akSumSq += amplitude * amplitude
    this.n++
    
    return amplitude
  }
  
  getRMS(): number {
    return this.n > 0 ? Math.sqrt(this.akSumSq / this.n) : 0
  }
}
```

**Stats Panel Data Structure**:
```typescript
interface StatsPanel {
  rho: number              // ρ(E_sym, E_asym) correlation
  driftMean: number        // Mean |E₀ - E₀_ref|
  driftMax: number         // Max |E₀ - E₀_ref|
  akxRMS: number           // RMS of A_kx(t)
  exportToCSV(): void      // Export time series
}
```

#### 3.5 Simulation Log System

**Log Entry Format**:
```
t=0 | E0=3.000 | E_sym=1.500 | E_asym=1.500 | A_kx=0.234
t=1 | E0=3.000 | E_sym=1.487 | E_asym=1.513 | A_kx=0.241
...
```

**Implementation**:
```typescript
class SimulationLogger {
  private entries: string[] = []
  private readonly MAX_ENTRIES = 1500
  
  log(t: number, E0: number, E_sym: number, E_asym: number, A_kx: number): void {
    const entry = `t=${t} | E0=${E0.toFixed(3)} | E_sym=${E_sym.toFixed(3)} | E_asym=${E_asym.toFixed(3)} | A_kx=${A_kx.toFixed(3)}`
    
    if (this.entries.length >= this.MAX_ENTRIES) {
      this.entries.shift()
    }
    
    this.entries.push(entry)
  }
  
  exportToText(): string {
    return this.entries.join('\n')
  }
  
  clear(): void {
    this.entries = []
  }
}
```

#### 3.6 Color Spectrum Visualization

**HSL Color Mapping**:
```typescript
class SpectrumColorizer {
  private brightLUT: Float32Array
  private darkLUT: Float32Array
  private kx: number
  private N: number
  
  constructor(kx: number, N: number) {
    this.kx = kx
    this.N = N
    this.rebuildLUTs()
  }
  
  private rebuildLUTs(): void {
    const nodeCount = this.N * this.N * this.N
    this.brightLUT = new Float32Array(nodeCount * 3)
    this.darkLUT = new Float32Array(nodeCount * 3)
    
    let idx = 0
    for (let z = 0; z < this.N; z++) {
      for (let y = 0; y < this.N; y++) {
        for (let x = 0; x < this.N; x++) {
          const base = ((x * this.kx) % this.N) / (this.N - 1)
          const hue = (270 + 360 * base) % 360
          
          const [rb, gb, bb] = this.hslToRgb(hue, 90, 70)  // Bright
          const [rd, gd, bd] = this.hslToRgb(hue, 90, 30)  // Dark
          
          this.brightLUT[idx] = rb
          this.brightLUT[idx + 1] = gb
          this.brightLUT[idx + 2] = bb
          
          this.darkLUT[idx] = rd
          this.darkLUT[idx + 1] = gd
          this.darkLUT[idx + 2] = bd
          
          idx += 3
        }
      }
    }
  }
  
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const hp = h / 60
    const x = c * (1 - Math.abs((hp % 2) - 1))
    
    let r = 0, g = 0, b = 0
    if (0 <= hp && hp < 1) { r = c; g = x }
    else if (1 <= hp && hp < 2) { r = x; g = c }
    else if (2 <= hp && hp < 3) { g = c; b = x }
    else if (3 <= hp && hp < 4) { g = x; b = c }
    else if (4 <= hp && hp < 5) { r = x; b = c }
    else if (5 <= hp && hp < 6) { r = c; b = x }
    
    const m = l - c / 2
    return [r + m, g + m, b + m]
  }
  
  colorize(nodes: Node[], colors: Float32Array): void {
    for (let i = 0; i < nodes.length; i++) {
      const offset = i * 3
      const lut = nodes[i].spin > 0 ? this.brightLUT : this.darkLUT
      colors[offset] = lut[offset]
      colors[offset + 1] = lut[offset + 1]
      colors[offset + 2] = lut[offset + 2]
    }
  }
}
```

#### 3.7 Swap-Based Dynamics (Margolus Neighborhood)

**6-Phase Swap Algorithm**:
```typescript
enum SwapPhase {
  X_EVEN = 0,  // x-axis, even parity
  Y_ODD = 1,   // y-axis, odd parity
  Z_EVEN = 2,  // z-axis, even parity
  X_ODD = 3,   // x-axis, odd parity
  Y_EVEN = 4,  // y-axis, even parity
  Z_ODD = 5    // z-axis, odd parity
}

class SwapDynamics {
  private phaseStep = 0
  
  step(lattice: Lattice): void {
    const phase = this.getPhase(this.phaseStep)
    this.doSwap(lattice, phase)
    this.phaseStep = (this.phaseStep + 1) % 6
  }
  
  reverseStep(lattice: Lattice): void {
    this.phaseStep = (this.phaseStep + 5) % 6  // -1 mod 6
    const phase = this.getPhase(this.phaseStep)
    this.doSwap(lattice, phase)
  }
  
  private getPhase(step: number): {axis: 'x'|'y'|'z', parity: 0|1} {
    const phases = [
      {axis: 'x' as const, parity: 0 as const},
      {axis: 'y' as const, parity: 1 as const},
      {axis: 'z' as const, parity: 0 as const},
      {axis: 'x' as const, parity: 1 as const},
      {axis: 'y' as const, parity: 0 as const},
      {axis: 'z' as const, parity: 1 as const}
    ]
    return phases[step]
  }
  
  private doSwap(lattice: Lattice, phase: {axis: 'x'|'y'|'z', parity: 0|1}): void {
    const {axis, parity} = phase
    const newSpins = new Int8Array(lattice.nodes.length)
    
    // Copy current spins
    for (let i = 0; i < lattice.nodes.length; i++) {
      newSpins[i] = lattice.nodes[i].spin
    }
    
    // Perform swaps
    for (const node of lattice.nodes) {
      const {x, y, z} = node.position
      
      // Check parity
      if (((x + y + z) & 1) !== parity) continue
      
      // Get neighbor position
      let nx = x, ny = y, nz = z
      if (axis === 'x') nx = (x + 1) % lattice.width
      else if (axis === 'y') ny = (y + 1) % lattice.height
      else nz = (z + 1) % lattice.depth
      
      const neighbor = lattice.getNode(nx, ny, nz)
      if (!neighbor) continue
      
      // Swap spins
      const nodeIdx = lattice.nodes.indexOf(node)
      const neighborIdx = lattice.nodes.indexOf(neighbor)
      
      const temp = newSpins[nodeIdx]
      newSpins[nodeIdx] = lattice.nodes[neighborIdx].spin
      newSpins[neighborIdx] = lattice.nodes[nodeIdx].spin
    }
    
    // Apply new spins
    for (let i = 0; i < lattice.nodes.length; i++) {
      lattice.nodes[i].spin = newSpins[i]
    }
  }
}
```

**Key Properties**:
- **Deterministic**: Same initial state always produces same evolution
- **Reversible**: Each swap is its own inverse
- **Conservative**: Preserves total spin (if needed)
- **Efficient**: O(N) per step with no neighbor searches

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
