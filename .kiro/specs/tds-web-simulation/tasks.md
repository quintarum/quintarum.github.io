# Implementation Plan

## Overview

This implementation plan breaks down the TDS Web Simulation into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring the system remains functional at every stage. Tasks are organized by functional area and prioritized for MVP delivery.

## Task Organization

- **Core tasks** (no marker): Essential for MVP functionality
- **Optional tasks** (marked with *): Testing, documentation, advanced features

## Implementation Status

✅ **Completed**: Core engine (Node, Lattice, Physics, Simulation, PhysicsProblems), basic 2D/3D rendering, analytics, UI components, i18n, utilities
🔄 **In Progress**: Aligning implementation with TDS requirements (E_sym/E_asym model, conservation laws)
⏳ **Remaining**: TDS-specific physics, advanced features, data export formats, external integrations

## Phase 1: Core TDS Engine Alignment

### Task 1: Align Node Class with TDS Requirements

- [x] 1.1 Update Node class to use TDS terminology and physics (COMPLETED)
  - Node class now uses 'vacuum'/'broken'/'anomalous' states
  - Spin state (s_i ∈ {-1, +1}) property implemented
  - E_sym and E_asym energy components separated
  - omega (ω₀) property for internal oscillation frequency added
  - getMass() returning M = ℏω₀ for anomalous nodes implemented
  - _Requirements: 1.1, 2.1, 3.1, 3.6_

- [x] 1.2 Implement TDS energy calculation methods (COMPLETED)
  - calculateEnergy() computes E_sym and E_asym separately from neighbors
  - E_sym + E_asym = E_0 conservation law enforced
  - E_sym based on neighbor spin alignment (s_i × s_j)
  - E_asym based on symmetry breaking
  - _Requirements: 2.6, 3.6, 8.1_

- [ ]* 1.3 Write unit tests for updated Node class
  - Test state transitions (vacuum ↔ broken ↔ anomalous)
  - Test E_sym and E_asym calculations with various neighbor configurations
  - Test mass calculation M = ℏω₀ for anomalous nodes
  - Test conservation E_sym + E_asym = E_0
  - _Requirements: 13.8_

### Task 2: Align Lattice Class with TDS Requirements

- [x] 2.1 Add TDS-specific lattice calculations (COMPLETED)
  - calculateTotalEnergy() returning {E_sym, E_asym, E_0} implemented
  - calculateT_info(J) computing informational tension J × Σ(1 - s_i × s_j) implemented
  - Boundary conditions supported (currently open, periodic can be added)
  - _Requirements: 8.1, 8.5, 3.5_

- [x] 2.2 Update lattice statistics for TDS metrics (COMPLETED)
  - getStatistics() includes E_sym, E_asym, E_0, T_info
  - Tracks vacuum/broken/anomalous state counts
  - Phase coherence calculation added
  - Backward compatibility maintained with symmetric/asymmetric/anomalies
  - _Requirements: 8.1, 8.3_

- [ ]* 2.3 Write unit tests for Lattice TDS calculations
  - Test E_sym + E_asym = E_0 conservation
  - Test T_info calculation accuracy
  - Test boundary condition handling
  - _Requirements: 13.8_

### Task 3: Update Physics Class to Remove Old Terminology

- [x] 3.1 Fix Physics class to use TDS state names (COMPLETED)
  - Updated propagateAnomaly() to use 'vacuum'/'broken'/'anomalous'
  - Updated _isReversibleTransition() to use correct state names
  - Updated calculateEntropy() to use correct statistics properties
  - Updated applyExternalField() to use correct state names
  - Also fixed PhysicsProblems.ts, MetricsCollector.ts, Simulation.ts, main.ts, test-simulation.ts
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 3.2 Implement TDS energy conservation enforcement (COMPLETED)
  - Created ConservationEnforcer class with enforceConservation() method
  - Redistributes energy proportionally when deviation exceeds tolerance
  - Logs conservation violations with timestamp, position, and magnitude
  - Implements verifyEnergyRateRelationship() for dE_sym/dt = -dE_asym/dt
  - Integrated into Physics and Simulation classes
  - _Requirements: 7.8, 8.4, 13.1_

- [x] 3.3 Implement TDS anomaly detection algorithm (COMPLETED)
  - Created AnomalyDetector class with detectAnomalies() method
  - Tracks node states over configurable history depth (default 50 steps)
  - Calculates ω₀ for detected anomalies based on persistence and E_asym
  - Auto-marks nodes as 'anomalous' when persistence criteria met (>80% broken/anomalous states)
  - Integrated into Physics class with initializeAnomalyDetector()
  - _Requirements: 3.2, 3.6, 3.7_

- [ ]* 3.4 Write unit tests for Physics TDS dynamics
  - Test energy conservation E_sym + E_asym = E_0 over multiple steps
  - Test dE_sym/dt = -dE_asym/dt relationship
  - Test anomaly detection with known configurations
  - Test T_info calculation accuracy
  - _Requirements: 13.8_

### Task 4: Update Simulation Class for TDS Reversibility

- [x] 4.1 Enhance reversibility validation (COMPLETED)
  - Created ReversibilityValidator class with validateConservation() method
  - Implemented reversibility score calculation (energy, state, spin consistency)
  - Added testReversibilityCycle() for forward-backward cycle testing
  - Implemented continuous validation mode with real-time monitoring
  - Added getConservationStatus() for UI display (good/warning/error)
  - Integrated into Simulation class
  - _Requirements: 7.8, 7.9, 13.1, 13.2_

- [ ] 4.2 Update export/import for TDS data
  - Include E_sym, E_asym, E_0, T_info in exported data
  - Store spin states (s_i) in addition to node states
  - Include ω₀ values for anomalous nodes
  - Add conservation metrics to export
  - _Requirements: 12.2, 12.4_

- [ ]* 4.3 Write integration tests for TDS Simulation
  - Test forward-backward reversibility over 100 steps
  - Test E_sym + E_asym = E_0 conservation throughout
  - Test bookmark save/restore with TDS metrics
  - _Requirements: 13.2, 13.9_

## Phase 2: Visualization Updates for TDS

### Task 5: Update 2D Rendering for TDS Visualization

- [x] 5.1 Basic Canvas 2D renderer (COMPLETED)
  - Renderer2D class with canvas context exists
  - Grid rendering with color-coded nodes implemented
  - Visual effects system in place
  - _Requirements: 1.1, 1.5_

- [ ] 5.2 Update color scheme for TDS states
  - Map vacuum state to green (currently 'symmetric')
  - Map broken state to yellow (currently 'asymmetric')
  - Map anomalous state to red (currently 'anomaly')
  - Update ColorScheme class with TDS terminology
  - _Requirements: 1.5_

- [ ] 5.3 Implement TDS energy visualization overlays
  - Add brightness/glow based on E_sym and E_asym separately
  - Visualize T_info gradients with color gradients
  - Display phase φ through hue rotation
  - Add toggle for different visualization modes (E_sym, E_asym, T_info)
  - _Requirements: 1.6, 3.5_

- [ ] 5.4 Add conservation status visualization
  - Visual indicator showing E_sym + E_asym = E_0 status
  - Color-coded alert when conservation violated
  - Display dE_sym/dt and dE_asym/dt arrows
  - _Requirements: 8.4, 13.7_

- [ ]* 5.5 Optimize 2D rendering performance
  - Implement dirty rectangle optimization
  - Use off-screen canvas for complex effects
  - Profile and optimize hot paths
  - _Requirements: 6.6_

### Task 6: Update 3D Rendering for TDS

- [x] 6.1 Basic Three.js setup (COMPLETED)
  - Renderer3D class with WebGL exists
  - Scene, camera, and lighting configured
  - Instanced mesh rendering implemented
  - _Requirements: 1.2, 1.4_

- [ ] 6.2 Update 3D visualization for TDS states
  - Update colors for vacuum/broken/anomalous states
  - Implement pulsation animation at frequency ω₀ for anomalies
  - Add halo effect proportional to mass M = ℏω₀
  - Enhance ripple effects for anomaly propagation
  - _Requirements: 1.7, 3.1, 3.6_

- [ ] 6.3 Implement 2D/3D view switching
  - Add toggle button for view mode in UI
  - Smooth transition between 2D and 3D within 500ms
  - Preserve camera position and zoom level
  - _Requirements: 1.3_

- [ ]* 6.4 Implement geometry curvature visualization
  - Calculate informational metric g_ij^(info) from E_asym density
  - Distort grid based on curvature
  - Add toggle for flat vs curved view
  - _Requirements: 16.1, 16.2, 16.4_

### Task 7: Update Control Panel for TDS Parameters

- [x] 7.1 Basic Control Panel (COMPLETED)
  - Controls class exists with parameter management
  - Play/pause/reset buttons implemented
  - Basic parameter controls in place
  - _Requirements: 4.1_

- [ ] 7.2 Add TDS-specific parameter controls
  - Add slider for J (coupling strength) - currently using symmetryStrength
  - Add controls for E_0 (total conserved energy)
  - Add tolerance threshold for conservation violations
  - Update tooltips to explain TDS physics context
  - _Requirements: 4.1, 4.2, 4.6_

- [ ] 7.3 Display TDS metrics in real-time
  - Show E_sym, E_asym, E_0 values
  - Display T_info (informational tension)
  - Show vacuum/broken/anomalous counts (update from symmetric/asymmetric/anomaly)
  - Add conservation status indicator (green/yellow/red)
  - _Requirements: 4.10, 8.1_

- [ ] 7.4 Implement TDS preset configurations
  - Vacuum equilibrium preset (all nodes in vacuum state)
  - Wave propagation preset (oscillating E_asym)
  - Defect formation preset (anomaly creation scenario)
  - Photon mode preset (perfectly reversible cycle)
  - _Requirements: 4.5, 17.10_

- [x] 7.5 Settings persistence (COMPLETED)
  - StateManager class handles localStorage
  - Settings auto-save implemented
  - _Requirements: 4.3_

### Task 8: Update Timeline for TDS Reversibility

- [x] 8.1 Basic Timeline component (COMPLETED)
  - Timeline class exists with history scrubbing
  - Bookmark system implemented in Simulation class
  - _Requirements: 7.3, 7.6_

- [ ] 8.2 Add TDS reversibility visualization
  - Show E_sym and E_asym evolution over time
  - Display conservation violations on timeline
  - Add reversibility score indicator
  - Highlight forward/backward time direction
  - _Requirements: 7.4, 7.9, 13.2_

- [ ] 8.3 Enhance bookmark system with TDS metrics
  - Store E_sym, E_asym, E_0, T_info with bookmarks
  - Display conservation status at bookmark points
  - Add comparison between bookmarked states
  - _Requirements: 7.6_


## Phase 3: Analytics and Validation for TDS

### Task 9: Update Metrics Collection for TDS

- [x] 9.1 Basic MetricsCollector (COMPLETED)
  - MetricsCollector class exists
  - Tracks metrics over time
  - Circular buffer implemented
  - _Requirements: 8.1, 8.3_

- [ ] 9.2 Add TDS-specific metrics tracking
  - Track E_sym, E_asym, E_0 separately over time
  - Track T_info (informational tension) evolution
  - Track vacuum/broken/anomalous state distribution (update from symmetric/asymmetric/anomaly)
  - Add conservation violation tracking
  - _Requirements: 8.1, 8.3_

- [ ] 9.3 Implement TDS real-time charts
  - Energy chart showing E_sym and E_asym over time
  - Conservation chart showing E_sym + E_asym = E_0 with deviation
  - State distribution chart (vacuum/broken/anomalous)
  - T_info evolution chart
  - Update existing Chart.js integration
  - _Requirements: 8.1, 8.2_

- [ ] 9.4 Add TDS statistical summaries
  - Calculate mean, variance, min, max for E_sym, E_asym, T_info
  - Display conservation violation statistics
  - Show reversibility score over time
  - Update within 200ms of state changes
  - _Requirements: 8.2, 8.3_

- [ ] 9.5 Implement TDS advanced metrics
  - Phase coherence calculation (already in Physics class)
  - Correlation length estimation (already in Physics class)
  - Topological defect density (anomaly density)
  - Spin correlation functions
  - Display in advanced mode
  - _Requirements: 8.7_

- [ ]* 9.6 Implement dashboard customization
  - Drag-and-drop layout editor
  - Show/hide individual metrics
  - Save layout preferences
  - _Requirements: 8.8_

### Task 10: Implement TDS Validation Suite

- [ ] 10.1 Create validation framework
  - Create Validation class for running tests
  - Define test interfaces and result types
  - Implement test runner with progress tracking
  - _Requirements: 13.5, 13.6_

- [ ] 10.2 Implement energy conservation test
  - testEnergyConservation() running simulation for N steps
  - Check E_sym + E_asym = E_0 at each step
  - Report violations with step number and deviation
  - Configurable tolerance threshold (default 1e-6)
  - _Requirements: 13.1, 13.6_

- [ ] 10.3 Implement reversibility test
  - testReversibility() running forward-backward cycles
  - Compare initial and final states (spin states, energies)
  - Calculate reversibility score (similarity metric)
  - Report state deviations and energy drift
  - _Requirements: 13.2, 13.6_

- [ ] 10.4 Implement TDS benchmark scenarios
  - Photon mode: perfectly reversible cycle with E_asym oscillating, period 2τ
  - Stable defect: persistent anomaly with constant ω₀ and M = ℏω₀
  - Phase transition: cascade of vacuum → broken → anomalous
  - Load benchmark configurations
  - Compare results against reference data
  - _Requirements: 13.4, 13.9, 17.10_

- [ ] 10.5 Create validation UI
  - Add "Run Validation" button to UI
  - Progress indicator during tests
  - Results display with pass/fail status
  - Detailed report with metrics and violations
  - Export validation report
  - _Requirements: 13.5_

- [ ] 10.6 Implement continuous validation mode
  - Real-time monitoring of E_sym + E_asym = E_0
  - Alert on violations exceeding threshold
  - Visual indicator in UI (green/yellow/red status)
  - Log violations to console and metrics
  - _Requirements: 13.7, 8.9_

- [ ]* 10.7 Write regression tests
  - Compare current results against validated reference datasets
  - Automated test suite for CI/CD
  - _Requirements: 13.9_

## Phase 4: Advanced Analytics (Photon Window Features)

### Task 11: Implement Photon Window Test

- [x] 11.1 Implement Photon Window reversibility test (COMPLETED)
  - Created PhotonWindowTest class with async run() method
  - Calculates Hamming distance between initial and final states
  - Returns reversibility ratio with pass/fail status
  - Includes formatResult() and getResultColor() for display
  - _Requirements: 13.2, 13.6_

- [x] 11.2 Add real-time correlation statistics (COMPLETED)
  - Created OnlineStatistics class using Welford's algorithm
  - Tracks mean and variance of E_sym and E_asym incrementally
  - Calculates correlation coefficient ρ(E_sym, E_asym)
  - Numerically stable implementation
  - _Requirements: 8.2, 8.7_

- [x] 11.3 Implement energy drift monitoring (COMPLETED)
  - Created DriftMonitor class
  - Tracks |E₀ - E₀_ref| mean and maximum deviation
  - Calculates running average of drift
  - Provides formatMetrics() for display
  - _Requirements: 8.4, 13.1_

- [x] 11.4 Add mode amplitude tracking (COMPLETED)
  - Created ModeAmplitudeTracker class
  - Calculates Fourier mode amplitude A_kx with precomputed cosine LUT
  - Tracks RMS amplitude over time
  - Supports adjustable wave number k_x with setKx()
  - _Requirements: 8.1, 8.3_

- [x] 11.5 Implement stats panel with CSV export (COMPLETED - backend)
  - Created AdvancedAnalytics class integrating all components
  - Provides getStatsPanelData() returning {rho, drift, rmsAkx}
  - Implements exportStatsToCSV() with all metrics
  - UI integration pending
  - _Requirements: 8.6, 12.1_

- [x] 11.6 Implement simulation log panel (COMPLETED - backend)
  - Created SimulationLogger class with 1500 entry circular buffer
  - Log format: "t=X | E0=Y | E_sym=Z | E_asym=W | A_kx=V"
  - Implements exportToText() and exportToCSV()
  - Provides getDisplayText() for UI
  - _Requirements: 8.9, 12.1_

- [x] 11.7 Add color spectrum visualization mode (COMPLETED)
  - Created SpectrumColorizer class with HSL color mapping
  - Color nodes by phase: hue = (270 + 360 × (x × k_x mod N) / N) mod 360
  - Precomputed bright/dark LUTs for performance
  - Supports toggle with createSimple() for white/gray mode
  - _Requirements: 1.5, 1.6_

- [x] 11.8 Implement swap-based dynamics (Margolus neighborhood) (COMPLETED)
  - Created SwapDynamics class with 6-phase algorithm
  - Phases: X_EVEN, Y_ODD, Z_EVEN, X_ODD, Y_EVEN, Z_ODD
  - Deterministic reversible swaps with step() and reverseStep()
  - O(N) complexity per step
  - _Requirements: 2.1, 7.8_

## Phase 5: Data Export and Interoperability

### Task 12: Enhance Export Engine for TDS Data

- [x] 12.1 Basic export functionality (COMPLETED)
  - DataExporter class exists with CSV, JSON, PDF export
  - Chart export to PNG implemented
  - _Requirements: 8.6, 12.1_

- [ ] 11.2 Update exports to include TDS metrics
  - Include E_sym, E_asym, E_0, T_info in all exports
  - Export spin states (s_i) for each node
  - Include ω₀ values for anomalous nodes
  - Add conservation violation log to exports
  - _Requirements: 12.2, 12.4_

- [ ] 11.3 Implement HDF5 export for scientific data
  - Add h5wasm library dependency
  - Create HDF5Writer class
  - Implement hierarchical structure: /lattice (spins, E_sym, E_asym, phase, omega), /energy (time series), /anomalies, /metadata
  - Include complete metadata (parameters, timestamp, TDS version)
  - _Requirements: 12.2, 12.4_

- [ ] 11.4 Implement time series export
  - Export E_sym, E_asym, T_info, anomaly counts over time to CSV
  - Add Parquet format support for efficient storage
  - Include conservation violation events
  - _Requirements: 8.6, 12.7_

- [ ]* 11.5 Implement NumPy and MATLAB export
  - Export lattice arrays to .npy/.npz format
  - Export to MATLAB .mat v7.3 format
  - Ensure compatibility with NumPy and MATLAB readers
  - _Requirements: 12.3, 4.11_

- [ ]* 11.6 Implement VTK export for ParaView
  - Create VTKWriter for 3D visualization
  - Export lattice geometry with scalar fields (E_sym, E_asym, state)
  - Support vector fields for T_info gradients
  - _Requirements: 12.5_

- [ ]* 11.7 Implement JSON-LD export with TDS ontology
  - Define TDS ontology with semantic types (E_sym, E_asym, T_info, etc.)
  - Export simulation data with @context
  - Include links to TDS theory papers
  - _Requirements: 12.6_

### Task 12: Implement Import System

- [ ] 12.1 Implement JSON configuration import
  - Parse JSON files with simulation parameters
  - Validate parameter values
  - Apply configuration to simulation
  - Support loading initial lattice states
  - _Requirements: 4.9_

- [ ] 12.2 Implement HDF5 import
  - Create HDF5Reader class
  - Parse /lattice, /energy, /anomalies, /metadata groups
  - Reconstruct lattice state from imported data
  - Validate data integrity and TDS conservation laws
  - _Requirements: 4.9, 4.11_

- [ ] 12.3 Create import UI
  - File upload button in UI
  - Drag-and-drop support
  - Format auto-detection (JSON, HDF5)
  - Progress indicator for large files
  - Error handling and user feedback
  - _Requirements: 4.9_

- [ ]* 12.4 Implement NumPy/MATLAB import
  - Read .npy/.npz files
  - Read MATLAB .mat files
  - Map arrays to lattice structure
  - _Requirements: 4.11_

### Task 13: FAIR-Compliant Export

- [ ] 13.1 Implement metadata generation
  - Generate Dublin Core / DataCite metadata
  - Include simulation parameters, TDS version, timestamps
  - Support author information and ORCID
  - Add DOI field for published datasets
  - _Requirements: 12.4, 12.8_

- [ ] 13.2 Implement export level system
  - Level 0: Quick export (CSV/JSON) - basic metrics (E_sym, E_asym, T_info)
  - Level 1: Research export (HDF5) - full arrays with spin states
  - Level 2: Publication export (HDF5 + metadata) - FAIR-compliant
  - Level 3: Visualization export (VTK) - 3D models
  - _Requirements: 12.1_

- [ ] 13.3 Create export UI with level selection
  - Export button with dropdown for levels
  - Format selection within each level
  - Metadata editor for publication exports
  - Preview of export contents
  - _Requirements: 12.1, 12.8_

## Phase 5: External Integration (Future Enhancement)

### Task 14: Python API (Optional)

- [ ]* 14.1 Design REST API endpoints
  - POST /api/simulation/create - Initialize simulation
  - POST /api/simulation/step - Advance one step
  - GET /api/simulation/state - Get current state with E_sym, E_asym, T_info
  - POST /api/simulation/export - Export data
  - GET /api/validation/run - Run validation suite
  - _Requirements: 14.4_

- [ ]* 14.2 Implement WebSocket for real-time updates
  - Establish WebSocket connection
  - Stream simulation state updates
  - Handle client subscriptions to specific metrics
  - _Requirements: 14.4_

- [ ]* 14.3 Create Python client library
  - TDSSimulation class wrapping API calls
  - Methods: create(), step(), get_energies(), get_anomalies(), export()
  - NumPy array integration for lattice data
  - Error handling and retries
  - _Requirements: 14.1, 14.2, 14.7_

- [ ]* 14.4 Create Jupyter notebook examples
  - Basic simulation workflow
  - Parameter sweep example (varying J, E_0)
  - Anomaly analysis example
  - Energy conservation verification (E_sym + E_asym = E_0)
  - _Requirements: 14.3, 14.6_

- [ ]* 14.5 Write Python API documentation
  - Function signatures and parameters
  - Usage examples
  - Installation instructions
  - _Requirements: 14.8_

### Task 15: Zenodo Integration (Optional)

- [ ]* 15.1 Implement Zenodo API client
  - Authentication with API token
  - Create deposition
  - Upload HDF5 files with TDS data
  - Publish deposition
  - Retrieve DOI
  - _Requirements: 15.1, 15.3_

- [ ]* 15.2 Implement metadata generation for Zenodo
  - Map simulation parameters to Zenodo metadata schema
  - Include title, description, creators, keywords
  - Add related identifiers (TDS theory papers DOIs)
  - Include TDS-specific metadata (E_sym, E_asym, conservation status)
  - _Requirements: 15.2_

- [ ]* 15.3 Create publication UI
  - "Publish to Zenodo" button
  - Metadata editor (title, description, authors)
  - ORCID input field
  - License selection (CC0, CC-BY, etc.)
  - Progress indicator during upload
  - Display DOI after publication
  - _Requirements: 15.2, 15.3, 15.6, 15.8_

- [ ]* 15.4 Implement dataset versioning
  - Track version numbers
  - Link to previous versions
  - Update existing depositions
  - _Requirements: 15.4_

- [ ]* 15.5 Implement citation generation
  - Generate BibTeX, RIS, APA formats
  - Copy to clipboard functionality
  - Display in UI
  - _Requirements: 15.6_


## Phase 6: Advanced TDS Features

### Task 16: Multi-Scale Informational Hierarchy (Optional)

- [ ]* 16.1 Implement scale management in Lattice
  - Add scale property to Lattice class
  - Support at least 3 distinct scale levels
  - Implement scale switching with state preservation
  - _Requirements: 11.1, 11.2_

- [ ]* 16.2 Implement scale-dependent coupling
  - Vary J (coupling strength) across scales
  - Implement scale-specific interaction ranges
  - Adjust ω₀ frequencies for different scales
  - _Requirements: 11.3, 11.4_

- [ ]* 16.3 Create multi-scale visualization
  - Split-screen view showing multiple scales
  - Overlay view with transparency
  - Scale selector UI
  - Smooth transitions between scales
  - _Requirements: 11.2, 11.5_

- [ ]* 16.4 Implement cross-scale influence
  - Propagate anomalies across scales
  - Calculate inter-scale coupling
  - Visualize scale interactions
  - _Requirements: 11.7_

### Task 17: Informational Geometry Visualization (Optional)

- [ ]* 17.1 Implement metric calculation
  - Calculate asymmetric energy density ρ from E_asym
  - Compute gradients ∂_i ρ
  - Calculate g_ij^(info) = ∂_i ρ × ∂_j ρ
  - _Requirements: 16.1_

- [ ]* 17.2 Implement curvature calculation
  - Compute scalar curvature from metric
  - Calculate Ricci tensor components (optional)
  - _Requirements: 16.6_

- [ ]* 17.3 Implement geometry visualization
  - Grid distortion based on curvature
  - Color gradient for scalar curvature
  - Toggle between flat and curved views
  - _Requirements: 16.2, 16.4_

- [ ]* 17.4 Visualize T_info gradients and curvature relationship
  - Overlay T_info gradients on geometry view
  - Show correlation between tension and curvature
  - _Requirements: 16.5_

### Task 18: Update Physics Problems for TDS

- [x] 18.1 Basic PhysicsProblems class (COMPLETED)
  - PhysicsProblems class exists with dark matter and matter-antimatter scenarios
  - Initial conditions and comparisons defined
  - _Requirements: 17.1, 17.2_

- [ ] 18.2 Update PhysicsProblems for TDS terminology
  - Update scenarios to use vacuum/broken/anomalous states
  - Update metrics to use E_sym, E_asym, T_info
  - Add conservation law validation to scenarios
  - _Requirements: 17.1, 17.2_

- [x] 18.3 Basic scenario loader (COMPLETED)
  - setupScenario() method exists
  - Loads lattice configuration for problems
  - _Requirements: 17.3_

- [ ] 18.4 Enhance Physics Problems UI
  - Update PhysicsProblemsPanel to show TDS metrics
  - Display E_sym, E_asym, T_info for each scenario
  - Show conservation status during problem runs
  - Add comparison view for TDS vs Standard Model
  - _Requirements: 17.1, 17.3, 17.4_

- [ ] 18.5 Implement experimental data overlay
  - Load experimental data for comparison
  - Overlay on simulation results
  - Calculate agreement metrics
  - _Requirements: 17.5_

- [ ] 18.6 Implement problem report generation
  - Generate detailed report for each scenario
  - Include TDS mechanism explanation (E_sym, E_asym dynamics)
  - Summarize matches and divergences
  - Export report as PDF or HTML
  - _Requirements: 17.8, 17.11_

- [ ] 18.7 Add photon emergence demonstration
  - Create preset showing perfectly reversible cycle
  - Visualize E_asym oscillating with period 2τ
  - Display zero net imbalance (E_sym + E_asym = E_0)
  - Show that photons emerge as reversible cycles
  - _Requirements: 17.10_

- [ ] 18.8 Add TDS theory references to UI
  - Link to Core Law of TDS paper (DOI: 10.5281/zenodo.17465190)
  - Link to Symmetry Anomalies framework
  - Link to TDS Manifest
  - Display in help section and info panel
  - _Requirements: 17.9_

- [ ]* 18.9 Implement custom problem definition
  - Allow users to define custom scenarios
  - Save and load custom problems
  - _Requirements: 17.7_


## Phase 7: Educational Features

### Task 19: Update Tutorial System for TDS

- [x] 19.1 Basic Tutorial component (COMPLETED)
  - Tutorial class exists with step-by-step guidance
  - GuidedTour class for interactive tours
  - Quiz system implemented
  - _Requirements: 5.1_

- [ ] 19.2 Update tutorial content for TDS terminology
  - Update Vacuum_State explanation (E_sym = E_0, not just "symmetric")
  - Update Broken_State explanation (E_asym > 0, transitional)
  - Update Anomalous_State as topological defects with M = ℏω₀
  - Add conservation law tutorial (E_sym + E_asym = E_0)
  - Add reversibility and time symmetry tutorial
  - _Requirements: 5.1, 5.10_

- [ ] 19.3 Create interactive TDS tutorial steps
  - Guide user to create anomaly and observe ω₀
  - Show energy redistribution (E_sym ↔ E_asym)
  - Demonstrate reversibility with forward/backward
  - Explore vacuum/broken/anomalous states
  - _Requirements: 5.1_

- [x] 19.4 Visual legend (COMPLETED)
  - Color meanings displayed in UI
  - _Requirements: 5.3_

- [ ] 19.5 Enhance help section with TDS concepts
  - Add searchable documentation
  - Add diagrams explaining E_sym, E_asym, T_info
  - Add examples of symmetry transitions
  - Add FAQ section for TDS
  - _Requirements: 5.4_

### Task 20: Educational Mode and TDS Glossary

- [ ] 20.1 Implement expert/beginner mode toggle
  - Beginner mode: simplified UI, basic explanations
  - Expert mode: full UI, mathematical formulations (E_sym + E_asym = E_0, T_info = J × Σ(1 - s_i × s_j))
  - Adjust tooltip detail level
  - _Requirements: 5.7_

- [ ] 20.2 Create searchable TDS glossary
  - Define all TDS terms (E_sym, E_asym, E_0, T_info, ω₀, M = ℏω₀, etc.)
  - Include mathematical formulations in expert mode
  - Cross-reference related terms
  - Accessible from all screens via InfoPanel
  - _Requirements: 5.6_

- [ ] 20.3 Implement contextual TDS tooltips
  - Hover tooltips for all UI elements
  - Explain TDS physics context (e.g., "J is coupling strength affecting spin alignment")
  - Display within 300ms
  - _Requirements: 5.2, 4.6_

- [ ] 20.4 Add TDS constants explanation
  - Explain how c, ℏ, G, α emerge as stable ratios in TDS
  - Show relationship to lattice parameters
  - Include in expert mode and help section
  - _Requirements: 5.8_

- [ ] 20.5 Create photon and mass emergence examples
  - Interactive example: photon as reversible cycle (E_asym oscillates, period 2τ)
  - Interactive example: mass as persistent defect (M = ℏω₀)
  - Step-by-step visualization with annotations
  - _Requirements: 5.9_

- [ ]* 20.6 Implement presentation mode
  - Fullscreen distraction-free view
  - Preset educational scenarios
  - Narration text display
  - _Requirements: 9.1, 9.2_

- [ ]* 20.7 Create guided tours
  - Multiple tour paths for different TDS concepts
  - Interactive quizzes at end of tours
  - _Requirements: 9.4, 9.5_

### Task 21: Internationalization

- [x] 21.1 i18next framework (COMPLETED)
  - i18next configured for TypeScript
  - Translation files exist (en.json, ru.json, uk.json)
  - Language system in place
  - _Requirements: 9.6_

- [ ] 21.2 Update translations for TDS terminology
  - Update all strings to use vacuum/broken/anomalous (not symmetric/asymmetric/anomaly)
  - Add translations for E_sym, E_asym, E_0, T_info
  - Add translations for conservation law messages
  - Translate to English, Russian, Ukrainian
  - _Requirements: 9.6_

- [ ] 21.3 Translate TDS tutorial and help content
  - Translate updated tutorial steps
  - Translate glossary terms
  - Translate tooltips with TDS context
  - _Requirements: 9.6_

- [ ]* 21.4 Add additional languages
  - Support for more languages (German, French, Chinese, etc.)
  - Community translation contributions
  - _Requirements: 9.6_

## Phase 8: Comparison and Analysis Tools

### Task 22: Simulation Comparison

- [x] 22.1 Basic snapshot system (COMPLETED)
  - Bookmark system in Simulation class serves as snapshots
  - Stores full state and metadata
  - _Requirements: 10.1_

- [x] 22.2 Basic comparison view (COMPLETED)
  - ComparisonView class exists
  - _Requirements: 10.2_

- [ ] 22.3 Update comparison for TDS metrics
  - Compare E_sym, E_asym, E_0, T_info between snapshots
  - Calculate conservation status differences
  - Identify nodes with state changes (vacuum/broken/anomalous)
  - Show spin state differences
  - _Requirements: 10.5_

- [ ] 22.4 Generate TDS comparison reports
  - Summarize key differences in TDS metrics
  - Statistical comparison (mean E_sym, E_asym, T_info)
  - Conservation violation comparison
  - Export report as PDF or HTML
  - _Requirements: 10.3_

- [ ] 22.5 Implement parameter sensitivity visualization
  - Show how J, E_0 changes affect E_sym, E_asym, T_info
  - Interactive charts with parameter sliders
  - Display conservation status across parameter ranges
  - _Requirements: 10.4_

- [ ]* 22.6 Implement multi-simulation split view
  - Display 3+ simulations simultaneously
  - Grid layout
  - _Requirements: 10.5_


## Phase 9: Performance and Optimization

### Task 23: Performance Optimization (Optional)

- [ ]* 23.1 Implement spatial indexing
  - Grid-based spatial hash for neighbor queries
  - Optimize for O(1) neighbor lookup
  - Benchmark performance improvement
  - _Requirements: 6.6_

- [ ]* 23.2 Optimize rendering with Web Workers
  - Offload physics calculations to background thread
  - Use SharedArrayBuffer for state sharing
  - Maintain 60 FPS during computation
  - _Requirements: 6.6_

- [ ]* 23.3 Implement lazy evaluation for TDS metrics
  - Calculate expensive metrics (T_info, curvature) only when requested
  - Cache E_sym, E_asym results until state changes
  - Invalidate cache on updates
  - _Requirements: 6.6_

- [ ]* 23.4 Optimize history buffer
  - Implement delta compression for state storage
  - Use run-length encoding for sparse changes
  - Benchmark memory usage reduction
  - _Requirements: 7.5_

- [ ]* 23.5 Profile and optimize hot paths
  - Use browser profiler to identify bottlenecks
  - Optimize critical loops (energy calculations, neighbor queries)
  - Reduce allocations in tight loops
  - _Requirements: 6.6_

### Task 24: Build and Deployment

- [x] 24.1 Vite build configuration (COMPLETED)
  - Vite configured with TypeScript
  - Build optimization in place
  - _Requirements: 6.9_

- [ ] 24.2 Implement PWA support
  - Create service worker for offline support
  - Generate PWA manifest
  - Cache static assets
  - Enable offline functionality after first load
  - _Requirements: 6.1, 6.2_

- [ ] 24.3 Configure GitHub Pages deployment
  - Set up GitHub Actions workflow
  - Configure base path for GitHub Pages
  - Automate deployment on push to main
  - _Requirements: 6.1_

- [ ] 24.4 Enhance responsive design
  - Adapt UI for desktop, tablet, mobile
  - Test on various screen sizes
  - Ensure usability on touch devices
  - _Requirements: 6.3_

- [ ] 24.5 Optimize initial load time
  - Lazy load non-critical components
  - Preload critical resources
  - Optimize asset loading
  - Target < 3 second load time on 10 Mbps connection
  - _Requirements: 6.1, 6.4_

- [x] 24.6 Error handling (COMPLETED)
  - ErrorHandler class exists
  - _Requirements: 6.4_

### Task 25: Testing and Quality Assurance (Optional)

- [ ]* 25.1 Set up testing framework
  - Configure Jest for unit tests
  - Configure Playwright for E2E tests
  - Set up test coverage reporting
  - _Requirements: 13.8_

- [ ]* 25.2 Write comprehensive unit tests for TDS
  - Test Node class (E_sym, E_asym, conservation)
  - Test Lattice class (T_info, total energy)
  - Test Physics class (conservation enforcement, anomaly detection)
  - Test Simulation class (reversibility, bookmarks)
  - Achieve > 80% code coverage
  - _Requirements: 13.8_

- [ ]* 25.3 Write integration tests
  - Test full simulation workflows
  - Test export/import round-trips with TDS data
  - Test validation suite execution
  - _Requirements: 13.8_

- [ ]* 25.4 Write E2E tests
  - Test user workflows (create simulation, run, export)
  - Test UI interactions
  - Test cross-browser compatibility
  - _Requirements: 6.5_

- [ ]* 25.5 Implement continuous integration
  - Set up GitHub Actions for automated testing
  - Run tests on pull requests
  - Automated deployment on passing tests
  - _Requirements: 13.9_

## Phase 10: Documentation and Polish

### Task 26: Documentation (Optional)

- [ ]* 26.1 Write user documentation
  - Getting started guide
  - Feature overview with TDS concepts
  - Tutorial walkthroughs
  - FAQ about TDS
  - _Requirements: 5.4_

- [ ]* 26.2 Write developer documentation
  - Architecture overview
  - API reference for TDS classes
  - Contributing guidelines
  - Code style guide
  - _Requirements: 14.8_

- [ ]* 26.3 Create video tutorials
  - Screen recordings of key features
  - Narrated explanations of TDS concepts
  - Upload to YouTube or embed in app
  - _Requirements: 5.8_

- [ ]* 26.4 Write scientific documentation
  - TDS theory background
  - Mathematical formulations
  - Validation methodology
  - Comparison with other models
  - _Requirements: 5.5, 17.9_

### Task 27: Final Polish

- [ ] 27.1 Implement URL state sharing
  - Encode simulation state in URL parameters
  - Include TDS parameters (J, E_0, etc.)
  - Allow sharing via link
  - Restore state from URL on load
  - _Requirements: 6.7_

- [x] 27.2 Keyboard shortcuts (COMPLETED)
  - KeyboardShortcuts class exists
  - _Requirements: 4.7_

- [ ] 27.3 Implement undo/redo
  - Undo last action
  - Redo undone action
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - _Requirements: 7.3_

- [ ] 27.4 Add accessibility features
  - ARIA labels for screen readers
  - Keyboard navigation
  - High contrast mode
  - _Requirements: 6.3_

- [x] 27.5 Theme system (COMPLETED)
  - ThemeManager class exists
  - Light and dark themes
  - _Requirements: 6.3_

- [ ]* 27.6 Add animation presets
  - Smooth, fast, instant animation modes
  - User preference persistence
  - _Requirements: 2.4_

- [ ]* 27.7 Implement data visualization export
  - Export charts as PNG/SVG
  - Export animations as GIF/MP4
  - Publication-ready figures
  - _Requirements: 12.5_

## Summary

This implementation plan focuses on aligning the existing TDS Web Simulation codebase with the formal TDS requirements. The core engine, rendering, UI, and utilities are largely implemented, but need updates to use proper TDS terminology (vacuum/broken/anomalous states), physics (E_sym, E_asym, E_0, T_info), and conservation laws (E_sym + E_asym = E_0).

**Current Status:**
- ✅ Core classes implemented (Node, Lattice, Physics, Simulation, PhysicsProblems)
- ✅ Rendering systems (2D/3D) with visual effects
- ✅ UI components (Controls, Timeline, Analytics, Tutorial, etc.)
- ✅ Utilities (StateManager, DataExporter, i18n, etc.)
- 🔄 Need alignment with TDS requirements

**Priority Tasks:**
1. **Phase 1**: Update core classes to use TDS terminology and physics (E_sym, E_asym, conservation)
2. **Phase 2**: Update visualization to show TDS metrics
3. **Phase 3**: Implement validation suite for conservation laws
4. **Phase 4**: Enhance data export with TDS metrics

**Estimated Timeline:**
- Phase 1 (Core TDS Alignment): 2-3 weeks
- Phase 2 (Visualization Updates): 2-3 weeks
- Phase 3 (Analytics & Validation): 2-3 weeks
- Phase 4 (Data Export): 1-2 weeks
- Phase 5-10 (Advanced Features): 4-8 weeks (optional)

**Total Estimated Time:** 7-11 weeks for core TDS alignment, 11-19 weeks for full implementation with advanced features.
