/**
 * ParameterControls - Scientific parameter controls for TDS simulation
 * Provides sliders and inputs for J, E_0, tolerance, and other physics parameters
 */

export interface TDSParameters {
  J: number;              // Coupling strength
  E_0: number;            // Total conserved energy
  tolerance: number;      // Conservation tolerance
  k_x: number;            // Wave number
  timeStep: number;       // Time step size
}

export interface ParameterChangeCallback {
  (params: TDSParameters): void;
}

export class ParameterControls {
  private params: TDSParameters;
  private onChange: ParameterChangeCallback | null = null;

  constructor(initialParams: TDSParameters) {
    this.params = { ...initialParams };
  }

  /**
   * Create parameter control panel HTML
   */
  createHTML(): string {
    return `
      <div style="padding: 15px; background: #16213e; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #4CAF50; font-size: 16px;">⚙️ TDS Parameters</h3>
        
        <!-- Coupling Strength J -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <label style="font-size: 13px; color: #ccc;">
              <strong>J</strong> (Coupling Strength)
            </label>
            <span id="j-value" style="font-family: monospace; color: #4CAF50; font-size: 13px;">${this.params.J.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            id="j-slider" 
            min="0.1" 
            max="2.0" 
            step="0.1" 
            value="${this.params.J}"
            style="width: 100%; cursor: pointer;"
          />
          <div style="font-size: 11px; color: #888; margin-top: 3px;">
            Controls spin alignment interaction strength
          </div>
        </div>

        <!-- Total Energy E_0 -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <label style="font-size: 13px; color: #ccc;">
              <strong>E₀</strong> (Total Energy)
            </label>
            <span id="e0-value" style="font-family: monospace; color: #4CAF50; font-size: 13px;">${this.params.E_0.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            id="e0-slider" 
            min="0.5" 
            max="3.0" 
            step="0.1" 
            value="${this.params.E_0}"
            style="width: 100%; cursor: pointer;"
          />
          <div style="font-size: 11px; color: #888; margin-top: 3px;">
            Conserved total energy (E_sym + E_asym = E₀)
          </div>
        </div>

        <!-- Conservation Tolerance -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <label style="font-size: 13px; color: #ccc;">
              <strong>ε</strong> (Tolerance)
            </label>
            <span id="tolerance-value" style="font-family: monospace; color: #4CAF50; font-size: 13px;">${this.params.tolerance.toExponential(1)}</span>
          </div>
          <input 
            type="range" 
            id="tolerance-slider" 
            min="-6" 
            max="-2" 
            step="0.5" 
            value="${Math.log10(this.params.tolerance)}"
            style="width: 100%; cursor: pointer;"
          />
          <div style="font-size: 11px; color: #888; margin-top: 3px;">
            Conservation violation threshold
          </div>
        </div>

        <!-- Wave Number k_x -->
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <label style="font-size: 13px; color: #ccc;">
              <strong>k_x</strong> (Wave Number)
            </label>
            <span id="kx-value" style="font-family: monospace; color: #4CAF50; font-size: 13px;">${this.params.k_x}</span>
          </div>
          <input 
            type="range" 
            id="kx-slider" 
            min="1" 
            max="16" 
            step="1" 
            value="${this.params.k_x}"
            style="width: 100%; cursor: pointer;"
          />
          <div style="font-size: 11px; color: #888; margin-top: 3px;">
            Fourier mode for amplitude tracking
          </div>
        </div>

        <!-- Time Step -->
        <div style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <label style="font-size: 13px; color: #ccc;">
              <strong>Δt</strong> (Time Step)
            </label>
            <span id="timestep-value" style="font-family: monospace; color: #4CAF50; font-size: 13px;">${this.params.timeStep.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            id="timestep-slider" 
            min="0.1" 
            max="2.0" 
            step="0.1" 
            value="${this.params.timeStep}"
            style="width: 100%; cursor: pointer;"
          />
          <div style="font-size: 11px; color: #888; margin-top: 3px;">
            Simulation time step size
          </div>
        </div>

        <!-- Reset to defaults -->
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #0f3460;">
          <button 
            id="reset-params-btn" 
            style="width: 100%; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;"
          >
            ↻ Reset to Defaults
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners after HTML is inserted
   */
  attachListeners(): void {
    // J slider
    const jSlider = document.getElementById('j-slider') as HTMLInputElement;
    const jValue = document.getElementById('j-value');
    jSlider?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.params.J = value;
      if (jValue) jValue.textContent = value.toFixed(2);
      this.notifyChange();
    });

    // E_0 slider
    const e0Slider = document.getElementById('e0-slider') as HTMLInputElement;
    const e0Value = document.getElementById('e0-value');
    e0Slider?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.params.E_0 = value;
      if (e0Value) e0Value.textContent = value.toFixed(2);
      this.notifyChange();
    });

    // Tolerance slider (logarithmic)
    const toleranceSlider = document.getElementById('tolerance-slider') as HTMLInputElement;
    const toleranceValue = document.getElementById('tolerance-value');
    toleranceSlider?.addEventListener('input', (e) => {
      const logValue = parseFloat((e.target as HTMLInputElement).value);
      const value = Math.pow(10, logValue);
      this.params.tolerance = value;
      if (toleranceValue) toleranceValue.textContent = value.toExponential(1);
      this.notifyChange();
    });

    // k_x slider
    const kxSlider = document.getElementById('kx-slider') as HTMLInputElement;
    const kxValue = document.getElementById('kx-value');
    kxSlider?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value, 10);
      this.params.k_x = value;
      if (kxValue) kxValue.textContent = value.toString();
      this.notifyChange();
    });

    // Time step slider
    const timestepSlider = document.getElementById('timestep-slider') as HTMLInputElement;
    const timestepValue = document.getElementById('timestep-value');
    timestepSlider?.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.params.timeStep = value;
      if (timestepValue) timestepValue.textContent = value.toFixed(2);
      this.notifyChange();
    });

    // Reset button
    const resetBtn = document.getElementById('reset-params-btn');
    resetBtn?.addEventListener('click', () => {
      this.resetToDefaults();
    });
  }

  /**
   * Set change callback
   */
  setOnChange(callback: ParameterChangeCallback): void {
    this.onChange = callback;
  }

  /**
   * Notify change
   */
  private notifyChange(): void {
    if (this.onChange) {
      this.onChange({ ...this.params });
    }
  }

  /**
   * Reset to default values
   */
  private resetToDefaults(): void {
    this.params = {
      J: 1.0,
      E_0: 1.0,
      tolerance: 1e-6,
      k_x: 6,
      timeStep: 1.0
    };

    // Update UI
    const jSlider = document.getElementById('j-slider') as HTMLInputElement;
    const jValue = document.getElementById('j-value');
    if (jSlider) jSlider.value = this.params.J.toString();
    if (jValue) jValue.textContent = this.params.J.toFixed(2);

    const e0Slider = document.getElementById('e0-slider') as HTMLInputElement;
    const e0Value = document.getElementById('e0-value');
    if (e0Slider) e0Slider.value = this.params.E_0.toString();
    if (e0Value) e0Value.textContent = this.params.E_0.toFixed(2);

    const toleranceSlider = document.getElementById('tolerance-slider') as HTMLInputElement;
    const toleranceValue = document.getElementById('tolerance-value');
    if (toleranceSlider) toleranceSlider.value = Math.log10(this.params.tolerance).toString();
    if (toleranceValue) toleranceValue.textContent = this.params.tolerance.toExponential(1);

    const kxSlider = document.getElementById('kx-slider') as HTMLInputElement;
    const kxValue = document.getElementById('kx-value');
    if (kxSlider) kxSlider.value = this.params.k_x.toString();
    if (kxValue) kxValue.textContent = this.params.k_x.toString();

    const timestepSlider = document.getElementById('timestep-slider') as HTMLInputElement;
    const timestepValue = document.getElementById('timestep-value');
    if (timestepSlider) timestepSlider.value = this.params.timeStep.toString();
    if (timestepValue) timestepValue.textContent = this.params.timeStep.toFixed(2);

    this.notifyChange();
  }

  /**
   * Get current parameters
   */
  getParameters(): TDSParameters {
    return { ...this.params };
  }

  /**
   * Update parameters programmatically
   */
  setParameters(params: Partial<TDSParameters>): void {
    this.params = { ...this.params, ...params };
    // TODO: Update UI elements if needed
  }
}
