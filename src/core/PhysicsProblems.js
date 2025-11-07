/**
 * PhysicsProblems class managing unsolved physics problems and TDS model comparisons
 * Provides scenarios for testing TDS against standard physics models
 */
export class PhysicsProblems {
  constructor() {
    this.problems = this._initializeProblems();
    this.currentProblem = null;
  }

  /**
   * Initialize the database of physics problems
   * @private
   * @returns {Object} Problems database
   */
  _initializeProblems() {
    return {
      darkMatter: {
        id: 'darkMatter',
        name: 'Dark Matter & Dark Energy',
        category: 'cosmology',
        description: 'Explaining the missing mass and accelerating expansion of the universe',
        background: 'Observations show that visible matter accounts for only ~5% of the universe. Dark matter (~27%) and dark energy (~68%) remain unexplained by the standard model.',
        
        initialConditions: {
          latticeSize: { width: 50, height: 50, depth: 1 },
          parameters: {
            symmetryStrength: 0.3,
            anomalyProbability: 0.15,
            interactionRange: 5,
            energyThreshold: 2.5,
            timeStep: 1
          },
          setup: 'uniform_low_symmetry'
        },
        
        standardModelPrediction: {
          expectedBehavior: 'Standard model cannot explain dark matter without introducing new particles (WIMPs, axions) that have not been detected.',
          limitations: [
            'Requires hypothetical particles with specific properties',
            'No direct detection despite decades of experiments',
            'Fine-tuning problems with dark energy (cosmological constant)',
            'Cannot explain why dark matter and dark energy have similar densities today'
          ],
          metrics: {
            darkMatterFraction: 0.27,
            darkEnergyFraction: 0.68,
            visibleMatterFraction: 0.05
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'TDS explains dark matter as regions of asymmetric lattice states that interact gravitationally but not electromagnetically. Dark energy emerges from the energy of symmetry transitions.',
          advantages: [
            'No new particles required - emerges from lattice dynamics',
            'Naturally explains gravitational but not electromagnetic interaction',
            'Energy of symmetry transitions provides dark energy mechanism',
            'Predicts specific ratios based on lattice parameters'
          ],
          observables: [
            'Asymmetric node density correlates with dark matter distribution',
            'Total lattice energy includes dark energy component',
            'Symmetry transition rate affects expansion acceleration'
          ]
        },
        
        experimentalData: [
          {
            source: 'Planck Satellite 2018',
            description: 'Cosmic microwave background measurements',
            values: [0.315, 0.685],  // [matter fraction, dark energy fraction]
            uncertainty: 0.007,
            url: 'https://www.cosmos.esa.int/web/planck'
          },
          {
            source: 'WMAP',
            description: 'Large scale structure observations',
            values: [0.27, 0.73],
            uncertainty: 0.04,
            url: 'https://map.gsfc.nasa.gov/'
          }
        ],
        
        references: [
          {
            title: 'Dark Matter and Dark Energy: A Challenge for Modern Cosmology',
            authors: ['Bertone, G.', 'Hooper, D.', 'Silk, J.'],
            year: 2005,
            journal: 'Physics Reports',
            url: 'https://arxiv.org/abs/hep-ph/0404175',
            abstract: 'Comprehensive review of dark matter and dark energy problems in modern cosmology.'
          }
        ]
      },

      matterAntimatter: {
        id: 'matterAntimatter',
        name: 'Matter-Antimatter Asymmetry',
        category: 'particle',
        description: 'Why is there more matter than antimatter in the universe?',
        background: 'The Big Bang should have created equal amounts of matter and antimatter, yet the observable universe is dominated by matter. The standard model cannot fully explain this asymmetry.',
        
        initialConditions: {
          latticeSize: { width: 40, height: 40, depth: 1 },
          parameters: {
            symmetryStrength: 0.8,
            anomalyProbability: 0.05,
            interactionRange: 3,
            energyThreshold: 3.0,
            timeStep: 1
          },
          setup: 'symmetric_with_perturbation'
        },
        
        standardModelPrediction: {
          expectedBehavior: 'Requires CP violation in weak interactions (Sakharov conditions), but the observed CP violation is too small by many orders of magnitude.',
          limitations: [
            'Known CP violation insufficient to explain observed asymmetry',
            'Requires additional mechanisms beyond standard model',
            'Baryogenesis scenarios require fine-tuning',
            'No direct experimental verification of proposed mechanisms'
          ],
          metrics: {
            asymmetryRatio: 1e-9,  // One extra matter particle per billion
            cpViolationStrength: 1e-3
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'Asymmetry emerges naturally from symmetry breaking in the lattice. Initial symmetric state undergoes spontaneous symmetry breaking, with asymmetric states (matter) slightly favored over symmetric states (antimatter) due to lattice dynamics.',
          advantages: [
            'Spontaneous symmetry breaking is inherent to TDS',
            'No fine-tuning required',
            'Asymmetry ratio emerges from lattice parameters',
            'Predicts specific time evolution of asymmetry'
          ],
          observables: [
            'Ratio of asymmetric to symmetric nodes after equilibration',
            'Time evolution shows rapid symmetry breaking phase',
            'Asymmetry persists in reversible dynamics'
          ]
        },
        
        experimentalData: [
          {
            source: 'LHCb Experiment',
            description: 'CP violation measurements in B meson decays',
            values: [0.001],  // CP violation parameter
            uncertainty: 0.0001,
            url: 'https://lhcb-public.web.cern.ch/'
          }
        ],
        
        references: [
          {
            title: 'Baryogenesis and Dark Matter from B Mesons',
            authors: ['Elor, G.', 'Escudero, M.', 'Nelson, A.'],
            year: 2019,
            journal: 'Physical Review D',
            url: 'https://arxiv.org/abs/1810.00880',
            abstract: 'Novel mechanism for generating matter-antimatter asymmetry.'
          }
        ]
      },

      quantumMeasurement: {
        id: 'quantumMeasurement',
        name: 'Quantum Measurement Problem',
        category: 'quantum',
        description: 'The collapse of the wave function during measurement',
        background: 'Quantum mechanics describes superposition states, but measurements always yield definite outcomes. The mechanism of wave function collapse is not explained by standard quantum mechanics.',
        
        initialConditions: {
          latticeSize: { width: 30, height: 30, depth: 1 },
          parameters: {
            symmetryStrength: 0.6,
            anomalyProbability: 0.2,
            interactionRange: 4,
            energyThreshold: 2.0,
            timeStep: 1
          },
          setup: 'superposition_state'
        },
        
        standardModelPrediction: {
          expectedBehavior: 'Copenhagen interpretation: wave function collapses upon measurement, but mechanism is not specified. Many-worlds interpretation: all outcomes occur in parallel universes.',
          limitations: [
            'No physical mechanism for collapse',
            'Measurement problem remains unresolved',
            'Observer role is unclear',
            'Incompatible with deterministic evolution'
          ],
          metrics: {
            collapseTime: 'instantaneous',
            decoherenceTime: 1e-12  // seconds
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'Measurement is an interaction that creates local anomalies, forcing the lattice into a definite state. Superposition corresponds to symmetric states, collapse to asymmetric/anomaly states.',
          advantages: [
            'Physical mechanism for collapse via anomaly creation',
            'No need for observer-dependent interpretations',
            'Consistent with reversible dynamics',
            'Predicts decoherence timescales from lattice parameters'
          ],
          observables: [
            'Transition from symmetric (superposition) to asymmetric (collapsed) states',
            'Anomaly propagation represents measurement interaction',
            'Decoherence rate from symmetry transition dynamics'
          ]
        },
        
        experimentalData: [
          {
            source: 'Quantum Eraser Experiments',
            description: 'Double-slit with delayed choice',
            values: [1.0],  // Interference visibility
            uncertainty: 0.02,
            url: 'https://arxiv.org/abs/quant-ph/9903047'
          }
        ],
        
        references: [
          {
            title: 'The Quantum Measurement Problem: State of Play',
            authors: ['Schlosshauer, M.'],
            year: 2019,
            journal: 'arXiv preprint',
            url: 'https://arxiv.org/abs/1910.13258',
            abstract: 'Comprehensive review of the measurement problem and proposed solutions.'
          }
        ]
      },

      informationParadox: {
        id: 'informationParadox',
        name: 'Black Hole Information Paradox',
        category: 'gravity',
        description: 'Information loss in black holes contradicts quantum mechanics',
        background: 'Hawking radiation suggests black holes evaporate, but this appears to destroy information, violating quantum mechanics. Reconciling general relativity with quantum mechanics remains unsolved.',
        
        initialConditions: {
          latticeSize: { width: 35, height: 35, depth: 1 },
          parameters: {
            symmetryStrength: 0.4,
            anomalyProbability: 0.3,
            interactionRange: 6,
            energyThreshold: 4.0,
            timeStep: 1
          },
          setup: 'high_density_center'
        },
        
        standardModelPrediction: {
          expectedBehavior: 'General relativity predicts information is lost in black holes. Quantum mechanics requires information conservation. No consensus resolution exists.',
          limitations: [
            'Fundamental conflict between GR and QM',
            'No quantum theory of gravity',
            'Proposed solutions (holography, firewalls) lack experimental support',
            'Cannot calculate information flow precisely'
          ],
          metrics: {
            informationLoss: 'complete',
            hawkingTemperature: 'inversely proportional to mass'
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'Information is encoded in lattice states and preserved through reversible dynamics. High-density anomaly regions (black holes) can release information through symmetry transitions.',
          advantages: [
            'Reversible dynamics ensures information conservation',
            'Black holes are high-anomaly density regions',
            'Information encoded in lattice state patterns',
            'Hawking radiation emerges from boundary symmetry transitions'
          ],
          observables: [
            'Total lattice information (entropy) is conserved',
            'Anomaly regions can decrease while preserving information',
            'Phase coherence tracks information flow'
          ]
        },
        
        experimentalData: [
          {
            source: 'Event Horizon Telescope',
            description: 'M87 black hole observations',
            values: [6.5e9],  // Solar masses
            uncertainty: 0.7e9,
            url: 'https://eventhorizontelescope.org/'
          }
        ],
        
        references: [
          {
            title: 'The Black Hole Information Paradox',
            authors: ['Harlow, D.'],
            year: 2016,
            journal: 'Reviews of Modern Physics',
            url: 'https://arxiv.org/abs/1409.1231',
            abstract: 'Detailed review of the information paradox and proposed resolutions.'
          }
        ]
      },

      hierarchyProblem: {
        id: 'hierarchyProblem',
        name: 'Hierarchy Problem',
        category: 'particle',
        description: 'Why is gravity so much weaker than other forces?',
        background: 'The gravitational force is about 10^36 times weaker than the electromagnetic force. The standard model provides no explanation for this enormous hierarchy.',
        
        initialConditions: {
          latticeSize: { width: 45, height: 45, depth: 1 },
          parameters: {
            symmetryStrength: 0.7,
            anomalyProbability: 0.08,
            interactionRange: 2,
            energyThreshold: 1.5,
            timeStep: 1
          },
          setup: 'multi_scale_structure'
        },
        
        standardModelPrediction: {
          expectedBehavior: 'No explanation within standard model. Proposed solutions include supersymmetry (not observed) or extra dimensions (not detected).',
          limitations: [
            'Requires fine-tuning of parameters to 1 part in 10^34',
            'Supersymmetry not found at LHC',
            'Extra dimensions lack experimental evidence',
            'Anthropic principle is non-predictive'
          ],
          metrics: {
            strengthRatio: 1e36,  // Gravity vs EM force
            planckMass: 1.22e19  // GeV
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'Gravity emerges from long-range correlations in lattice symmetry, while other forces from short-range interactions. The hierarchy arises naturally from different interaction ranges.',
          advantages: [
            'Natural explanation from interaction range differences',
            'No fine-tuning required',
            'Predicts force strength ratios from lattice parameters',
            'Unifies forces through common lattice mechanism'
          ],
          observables: [
            'Long-range symmetry correlations (gravity)',
            'Short-range anomaly interactions (other forces)',
            'Correlation length ratio matches force strength ratio'
          ]
        },
        
        experimentalData: [
          {
            source: 'Particle Data Group',
            description: 'Fundamental force strengths',
            values: [1e-36],  // Gravity/EM ratio
            uncertainty: 1e-37,
            url: 'https://pdg.lbl.gov/'
          }
        ],
        
        references: [
          {
            title: 'The Hierarchy Problem and New Dimensions at a Millimeter',
            authors: ['Arkani-Hamed, N.', 'Dimopoulos, S.', 'Dvali, G.'],
            year: 1998,
            journal: 'Physics Letters B',
            url: 'https://arxiv.org/abs/hep-ph/9803315',
            abstract: 'Proposes extra dimensions as solution to hierarchy problem.'
          }
        ]
      }
    };
  }

  /**
   * Get a specific physics problem by ID
   * @param {string} problemId - ID of the problem
   * @returns {Object|null} Problem data or null if not found
   */
  getProblem(problemId) {
    return this.problems[problemId] || null;
  }

  /**
   * Get all available problems
   * @returns {Array<Object>} Array of all problems
   */
  getAllProblems() {
    return Object.values(this.problems);
  }

  /**
   * Get problems by category
   * @param {string} category - Category to filter by
   * @returns {Array<Object>} Array of problems in the category
   */
  getProblemsByCategory(category) {
    return Object.values(this.problems).filter(p => p.category === category);
  }

  /**
   * Setup a lattice for a specific physics problem
   * @param {string} problemId - ID of the problem
   * @param {Lattice} lattice - Lattice to configure
   * @returns {Object} Configuration parameters
   */
  setupScenario(problemId, lattice) {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    this.currentProblem = problemId;
    const { initialConditions } = problem;
    
    // Reset lattice
    lattice.reset();
    
    // Apply setup based on problem type
    switch (initialConditions.setup) {
      case 'uniform_low_symmetry':
        this._setupUniformLowSymmetry(lattice);
        break;
      case 'symmetric_with_perturbation':
        this._setupSymmetricWithPerturbation(lattice);
        break;
      case 'superposition_state':
        this._setupSuperpositionState(lattice);
        break;
      case 'high_density_center':
        this._setupHighDensityCenter(lattice);
        break;
      case 'multi_scale_structure':
        this._setupMultiScaleStructure(lattice);
        break;
    }
    
    return initialConditions.parameters;
  }

  /**
   * Setup uniform low symmetry configuration
   * @private
   */
  _setupUniformLowSymmetry(lattice) {
    lattice.forEachNode(node => {
      if (Math.random() < 0.6) {
        node.setState('asymmetric');
      }
    });
  }

  /**
   * Setup symmetric state with small perturbation
   * @private
   */
  _setupSymmetricWithPerturbation(lattice) {
    // Start symmetric
    lattice.reset();
    
    // Add small perturbation in center
    const cx = Math.floor(lattice.width / 2);
    const cy = Math.floor(lattice.height / 2);
    lattice.createAnomaly(cx, cy, 0, 2);
  }

  /**
   * Setup superposition-like state
   * @private
   */
  _setupSuperpositionState(lattice) {
    // Create regions of high symmetry (superposition)
    lattice.forEachNode(node => {
      node.setState('symmetric');
      node.phase = Math.random() * 2 * Math.PI;
    });
  }

  /**
   * Setup high density center (black hole analog)
   * @private
   */
  _setupHighDensityCenter(lattice) {
    const cx = Math.floor(lattice.width / 2);
    const cy = Math.floor(lattice.height / 2);
    
    lattice.forEachNode(node => {
      const dx = node.position.x - cx;
      const dy = node.position.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        node.setState('anomaly');
        node.energy = 10.0;
      } else if (distance < 10) {
        node.setState('asymmetric');
        node.energy = 5.0;
      }
    });
  }

  /**
   * Setup multi-scale structure
   * @private
   */
  _setupMultiScaleStructure(lattice) {
    // Create structures at different scales
    for (let scale = 1; scale <= 3; scale++) {
      const spacing = scale * 10;
      for (let x = spacing; x < lattice.width; x += spacing) {
        for (let y = spacing; y < lattice.height; y += spacing) {
          lattice.createAnomaly(x, y, 0, scale);
        }
      }
    }
  }

  /**
   * Compare TDS results with standard model predictions
   * @param {Object} simulationResults - Results from TDS simulation
   * @param {string} problemId - ID of the problem
   * @returns {Object} Comparison analysis
   */
  compareWithStandardModel(simulationResults, problemId) {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    const comparison = {
      problemId,
      problemName: problem.name,
      tdsResults: {},
      standardModelResults: problem.standardModelPrediction.metrics,
      agreement: {},
      advantages: problem.tdsModelPrediction.advantages,
      limitations: problem.standardModelPrediction.limitations
    };

    // Extract relevant metrics from simulation
    switch (problemId) {
      case 'darkMatter':
        comparison.tdsResults = {
          asymmetricFraction: simulationResults.asymmetricNodes / simulationResults.totalNodes,
          anomalyFraction: simulationResults.anomalies / simulationResults.totalNodes,
          symmetricFraction: simulationResults.symmetricNodes / simulationResults.totalNodes
        };
        break;
      
      case 'matterAntimatter':
        comparison.tdsResults = {
          asymmetryRatio: (simulationResults.asymmetricNodes - simulationResults.symmetricNodes) / 
                          simulationResults.totalNodes
        };
        break;
      
      case 'quantumMeasurement':
        comparison.tdsResults = {
          collapseRate: simulationResults.stateTransitions / simulationResults.timeSteps,
          coherenceTime: simulationResults.avgCoherence
        };
        break;
      
      case 'informationParadox':
        comparison.tdsResults = {
          entropyConservation: simulationResults.entropyChange / simulationResults.initialEntropy,
          informationPreserved: simulationResults.reversibilityScore > 0.95
        };
        break;
      
      case 'hierarchyProblem':
        comparison.tdsResults = {
          correlationRatio: simulationResults.longRangeCorrelation / 
                           simulationResults.shortRangeCorrelation
        };
        break;
    }

    return comparison;
  }

  /**
   * Validate simulation results against experimental data
   * @param {Object} simulationResults - Results from TDS simulation
   * @param {string} problemId - ID of the problem
   * @returns {Object} Validation results
   */
  validateAgainstData(simulationResults, problemId) {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    const validation = {
      problemId,
      experiments: [],
      overallAgreement: 0
    };

    for (const experiment of problem.experimentalData) {
      const result = {
        source: experiment.source,
        description: experiment.description,
        experimentalValue: experiment.values,
        uncertainty: experiment.uncertainty,
        simulationValue: null,
        agreement: 0,
        withinUncertainty: false
      };

      // Extract corresponding simulation value (problem-specific)
      // This is a simplified version - real implementation would need detailed mapping
      result.simulationValue = this._extractRelevantMetric(simulationResults, problemId, experiment);
      
      // Calculate agreement
      if (result.simulationValue !== null && experiment.values.length > 0) {
        const diff = Math.abs(result.simulationValue - experiment.values[0]);
        result.withinUncertainty = diff <= experiment.uncertainty;
        result.agreement = Math.max(0, 1 - diff / experiment.values[0]);
      }

      validation.experiments.push(result);
    }

    // Calculate overall agreement
    if (validation.experiments.length > 0) {
      validation.overallAgreement = 
        validation.experiments.reduce((sum, exp) => sum + exp.agreement, 0) / 
        validation.experiments.length;
    }

    return validation;
  }

  /**
   * Extract relevant metric from simulation results
   * @private
   */
  _extractRelevantMetric(simulationResults, problemId, _experiment) {
    // Simplified extraction - would need more sophisticated mapping in real implementation
    switch (problemId) {
      case 'darkMatter':
        return simulationResults.asymmetricNodes / simulationResults.totalNodes;
      case 'matterAntimatter':
        return Math.abs(simulationResults.asymmetricNodes - simulationResults.symmetricNodes) / 
               simulationResults.totalNodes;
      default:
        return null;
    }
  }

  /**
   * Generate a detailed report for a problem
   * @param {string} problemId - ID of the problem
   * @param {Object} simulationResults - Results from simulation
   * @returns {Object} Detailed report
   */
  generateReport(problemId, simulationResults) {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    const comparison = this.compareWithStandardModel(simulationResults, problemId);
    const validation = this.validateAgainstData(simulationResults, problemId);

    return {
      problem: {
        name: problem.name,
        description: problem.description,
        background: problem.background
      },
      comparison,
      validation,
      references: problem.references,
      timestamp: new Date().toISOString()
    };
  }
}
