/**
 * TheoryPanel - Scientific references and TDS theory documentation
 * Provides links to papers, formulas, and theoretical background
 */

export class TheoryPanel {
  /**
   * Create theory panel HTML with scientific references
   */
  static createHTML(): string {
    return `
      <div style="padding: 20px; background: #16213e; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #4CAF50; font-size: 18px;">📚 Theory of Dynamic Symmetry</h3>
        
        <!-- Core Principles -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #FFC107; font-size: 14px;">Core Principles</h4>
          <div style="font-size: 13px; color: #ccc; line-height: 1.8;">
            <div style="margin-bottom: 8px;">
              <strong style="color: #4CAF50;">Conservation Law:</strong>
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #fff;">
                E_sym + E_asym = E₀ = const
              </code>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #4CAF50;">Energy Rate:</strong>
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #fff;">
                dE_sym/dt = -dE_asym/dt
              </code>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #4CAF50;">Informational Tension:</strong>
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #fff;">
                T_info = J × Σ(1 - s_i × s_j)
              </code>
            </div>
            <div>
              <strong style="color: #4CAF50;">Anomaly Mass:</strong>
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #fff;">
                M = ℏω₀
              </code>
            </div>
          </div>
        </div>

        <!-- Scientific References -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #FFC107; font-size: 14px;">Scientific References</h4>
          <div style="font-size: 13px; color: #ccc; line-height: 1.8;">
            <div style="margin-bottom: 10px; padding: 10px; background: #0f3460; border-radius: 5px; border-left: 3px solid #4CAF50;">
              <div style="font-weight: bold; color: #4CAF50; margin-bottom: 4px;">
                📄 Core Law of TDS
              </div>
              <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">
                Fundamental principles of Theory of Dynamic Symmetry
              </div>
              <a 
                href="https://doi.org/10.5281/zenodo.17465190" 
                target="_blank" 
                rel="noopener noreferrer"
                style="color: #2196F3; text-decoration: none; font-family: monospace; font-size: 11px;"
              >
                DOI: 10.5281/zenodo.17465190 →
              </a>
            </div>

            <div style="margin-bottom: 10px; padding: 10px; background: #0f3460; border-radius: 5px; border-left: 3px solid #9C27B0;">
              <div style="font-weight: bold; color: #9C27B0; margin-bottom: 4px;">
                📄 Symmetry Anomalies Framework
              </div>
              <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">
                Mathematical framework for anomaly detection and tracking
              </div>
              <a 
                href="https://github.com/quintarum/tds-theory" 
                target="_blank" 
                rel="noopener noreferrer"
                style="color: #2196F3; text-decoration: none; font-family: monospace; font-size: 11px;"
              >
                GitHub Repository →
              </a>
            </div>

            <div style="padding: 10px; background: #0f3460; border-radius: 5px; border-left: 3px solid #FF9800;">
              <div style="font-weight: bold; color: #FF9800; margin-bottom: 4px;">
                📄 TDS Manifest
              </div>
              <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">
                Philosophical and theoretical foundations
              </div>
              <a 
                href="https://quintarum.github.io/tds-manifest" 
                target="_blank" 
                rel="noopener noreferrer"
                style="color: #2196F3; text-decoration: none; font-family: monospace; font-size: 11px;"
              >
                Read Online →
              </a>
            </div>
          </div>
        </div>

        <!-- Key Concepts -->
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #FFC107; font-size: 14px;">Key Concepts</h4>
          <div style="font-size: 12px; color: #ccc; line-height: 1.7;">
            <div style="margin-bottom: 8px;">
              <strong style="color: #4CAF50;">🟢 Vacuum State:</strong> 
              E_sym = E₀, perfect symmetry, ground state
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #FFC107;">🟡 Broken State:</strong> 
              E_asym > 0, transitional, symmetry breaking
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #F44336;">🔴 Anomalous State:</strong> 
              Persistent defect, M = ℏω₀, topological
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #2196F3;">⚡ Photon Mode:</strong> 
              Perfectly reversible cycle, E_asym oscillates, period 2τ
            </div>
          </div>
        </div>

        <!-- Physical Constants -->
        <div style="margin-bottom: 0;">
          <h4 style="margin: 0 0 10px 0; color: #FFC107; font-size: 14px;">Emergent Constants</h4>
          <div style="font-size: 12px; color: #ccc; line-height: 1.7;">
            <div style="margin-bottom: 6px;">
              In TDS, fundamental constants emerge as stable ratios:
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; margin-top: 8px;">
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #4CAF50;">c</code>
              <span>Speed of light (lattice spacing / time step)</span>
              
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #4CAF50;">ℏ</code>
              <span>Reduced Planck constant (action quantum)</span>
              
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #4CAF50;">G</code>
              <span>Gravitational constant (curvature coupling)</span>
              
              <code style="background: #0f3460; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #4CAF50;">α</code>
              <span>Fine structure constant (coupling ratio)</span>
            </div>
          </div>
        </div>

        <!-- Citation -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #0f3460;">
          <div style="font-size: 11px; color: #888; line-height: 1.6;">
            <strong>How to cite:</strong><br>
            <code style="background: #0f3460; padding: 4px 8px; border-radius: 3px; font-family: monospace; font-size: 10px; color: #ccc; display: inline-block; margin-top: 4px;">
              TDS Web Simulation (2025). Theory of Dynamic Symmetry Interactive Visualization. 
              https://quintarum.github.io/
            </code>
          </div>
        </div>
      </div>
    `;
  }
}
