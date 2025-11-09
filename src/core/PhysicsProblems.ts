import { Lattice } from './Lattice.js';
import { PhysicsParams } from './Node.js';

type ProblemCategory = 'cosmology' | 'particle' | 'quantum' | 'gravity';
type SetupType = 'uniform_low_symmetry' | 'symmetric_with_perturbation' | 'superposition_state' | 
                 'high_density_center' | 'multi_scale_structure';

interface LatticeSize {
  width: number;
  height: number;
  depth: number;
}

interface InitialConditions {
  latticeSize: LatticeSize;
  parameters: PhysicsParams;
  setup: SetupType;
}

interface StandardModelPrediction {
  expectedBehavior: string;
  limitations: string[];
  metrics: Record<string, number | string>;
}

interface TDSModelPrediction {
  expectedBehavior: string;
  advantages: string[];
  observables: string[];
}

interface ExperimentalDataPoint {
  source: string;
  description: string;
  values: number[];
  uncertainty: number;
  url: string;
}

interface Reference {
  title: string;
  authors: string[];
  year: number;
  journal: string;
  url: string;
  abstract: string;
}

export interface PhysicsProblem {
  id: string;
  name: string;
  category: ProblemCategory;
  description: string;
  background: string;
  initialConditions: InitialConditions;
  standardModelPrediction: StandardModelPrediction;
  tdsModelPrediction: TDSModelPrediction;
  experimentalData: ExperimentalDataPoint[];
  references: Reference[];
}

interface SimulationResults {
  totalNodes: number;
  symmetricNodes: number;
  asymmetricNodes: number;
  anomalies: number;
  timeSteps?: number;
  stateTransitions?: number;
  avgCoherence?: number;
  entropyChange?: number;
  initialEntropy?: number;
  reversibilityScore?: number;
  longRangeCorrelation?: number;
  shortRangeCorrelation?: number;
}

interface ComparisonResult {
  problemId: string;
  problemName: string;
  tdsResults: Record<string, number | boolean>;
  standardModelResults: Record<string, number | string>;
  agreement: Record<string, number>;
  advantages: string[];
  limitations: string[];
}

interface ValidationExperiment {
  source: string;
  description: string;
  experimentalValue: number[];
  uncertainty: number;
  simulationValue: number | null;
  agreement: number;
  withinUncertainty: boolean;
}

interface ValidationResult {
  problemId: string;
  experiments: ValidationExperiment[];
  overallAgreement: number;
}

interface ProblemReport {
  problem: {
    name: string;
    description: string;
    background: string;
  };
  comparison: ComparisonResult;
  validation: ValidationResult;
  references: Reference[];
  timestamp: string;
}

/**
 * PhysicsProblems class managing unsolved physics problems and TDS model comparisons
 * Provides scenarios for testing TDS against standard physics models
 */
export class PhysicsProblems {
  private problems: Record<string, PhysicsProblem>;
  currentProblem: string | null = null;

  constructor() {
    this.problems = this._initializeProblems();
  }

  /**
   * Initialize the database of physics problems
   */
  private _initializeProblems(): Record<string, PhysicsProblem> {
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
            values: [0.315, 0.685],
            uncertainty: 0.007,
            url: 'https://www.cosmos.esa.int/web/planck'
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
        background: 'The Big Bang should have created equal amounts of matter and antimatter, yet the observable universe is dominated by matter.',
        
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
          expectedBehavior: 'Requires CP violation in weak interactions, but observed CP violation is too small.',
          limitations: [
            'Known CP violation insufficient',
            'Requires additional mechanisms',
            'Baryogenesis scenarios require fine-tuning'
          ],
          metrics: {
            asymmetryRatio: 1e-9,
            cpViolationStrength: 1e-3
          }
        },
        
        tdsModelPrediction: {
          expectedBehavior: 'Asymmetry emerges naturally from spontaneous symmetry breaking in the lattice.',
          advantages: [
            'Spontaneous symmetry breaking is inherent',
            'No fine-tuning required',
            'Asymmetry ratio emerges from lattice parameters'
          ],
          observables: [
            'Ratio of asymmetric to symmetric nodes',
            'Time evolution shows rapid symmetry breaking',
            'Asymmetry persists in reversible dynamics'
          ]
        },
        
        experimentalData: [
          {
            source: 'LHCb Experiment',
            description: 'CP violation measurements',
            values: [0.001],
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
      }
    };
  }

  /**
   * Get a specific physics problem by ID
   */
  getProblem(problemId: string): PhysicsProblem | null {
    return this.problems[problemId] || null;
  }

  /**
   * Get all available problems
   */
  getAllProblems(): PhysicsProblem[] {
    return Object.values(this.problems);
  }

  /**
   * Get problems by category
   */
  getProblemsByCategory(category: ProblemCategory): PhysicsProblem[] {
    return Object.values(this.problems).filter(p => p.category === category);
  }

  /**
   * Setup a lattice for a specific physics problem
   */
  setupScenario(problemId: string, lattice: Lattice): PhysicsParams {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    this.currentProblem = problemId;
    const { initialConditions } = problem;
    
    lattice.reset();
    
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

  private _setupUniformLowSymmetry(lattice: Lattice): void {
    lattice.forEachNode(node => {
      if (Math.random() < 0.6) {
        node.setState('broken');
      }
    });
  }

  private _setupSymmetricWithPerturbation(lattice: Lattice): void {
    lattice.reset();
    const cx = Math.floor(lattice.width / 2);
    const cy = Math.floor(lattice.height / 2);
    lattice.createAnomaly(cx, cy, 0, 2);
  }

  private _setupSuperpositionState(lattice: Lattice): void {
    lattice.forEachNode(node => {
      node.setState('vacuum');
      node.phase = Math.random() * 2 * Math.PI;
    });
  }

  private _setupHighDensityCenter(lattice: Lattice): void {
    const cx = Math.floor(lattice.width / 2);
    const cy = Math.floor(lattice.height / 2);
    
    lattice.forEachNode(node => {
      const dx = node.position.x - cx;
      const dy = node.position.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        node.setState('anomalous');
        // Set high E_asym for anomalous nodes
        node.E_asym = 8.0;
        node.E_sym = 2.0;
      } else if (distance < 10) {
        node.setState('broken');
        // Set moderate E_asym for broken nodes
        node.E_asym = 3.0;
        node.E_sym = 7.0;
      }
    });
  }

  private _setupMultiScaleStructure(lattice: Lattice): void {
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
   */
  compareWithStandardModel(simulationResults: SimulationResults, problemId: string): ComparisonResult {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    const comparison: ComparisonResult = {
      problemId,
      problemName: problem.name,
      tdsResults: {},
      standardModelResults: problem.standardModelPrediction.metrics,
      agreement: {},
      advantages: problem.tdsModelPrediction.advantages,
      limitations: problem.standardModelPrediction.limitations
    };

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
    }

    return comparison;
  }

  /**
   * Validate simulation results against experimental data
   */
  validateAgainstData(simulationResults: SimulationResults, problemId: string): ValidationResult {
    const problem = this.getProblem(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} not found`);
    }

    const validation: ValidationResult = {
      problemId,
      experiments: [],
      overallAgreement: 0
    };

    for (const experiment of problem.experimentalData) {
      const simulationValue = this._extractRelevantMetric(simulationResults, problemId, experiment);
      const result: ValidationExperiment = {
        source: experiment.source,
        description: experiment.description,
        experimentalValue: experiment.values,
        uncertainty: experiment.uncertainty,
        simulationValue,
        agreement: 0,
        withinUncertainty: false
      };

      if (simulationValue !== null && experiment.values.length > 0) {
        const diff = Math.abs(simulationValue - experiment.values[0]);
        result.withinUncertainty = diff <= experiment.uncertainty;
        result.agreement = Math.max(0, 1 - diff / experiment.values[0]);
      }

      validation.experiments.push(result);
    }

    if (validation.experiments.length > 0) {
      validation.overallAgreement = 
        validation.experiments.reduce((sum, exp) => sum + exp.agreement, 0) / 
        validation.experiments.length;
    }

    return validation;
  }

  private _extractRelevantMetric(
    simulationResults: SimulationResults, 
    problemId: string, 
    _experiment: ExperimentalDataPoint
  ): number | null {
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
   */
  generateReport(problemId: string, simulationResults: SimulationResults): ProblemReport {
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
