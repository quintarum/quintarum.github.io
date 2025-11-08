// @ts-nocheck
/* eslint-disable */
/**
 * Info Panel
 * Displays TDS theory information, glossary, and documentation
 */
export class InfoPanel {
  constructor() {
    this.isVisible = false;
    this.currentTab = 'theory';
    
    this.glossary = {
      'TDS': {
        term: 'Theory of Dynamic Symmetry',
        definition: 'A theoretical model describing the origin of matter and fields through an informational framework based on symmetry dynamics and reversible lattice processes.'
      },
      'Lattice': {
        term: 'Lattice',
        definition: 'A discrete structure of space in the TDS model, consisting of interconnected nodes that can exist in different states.'
      },
      'Symmetry': {
        term: 'Symmetry',
        definition: 'A state of balance and order in the lattice where nodes maintain consistent patterns with their neighbors.'
      },
      'Anomaly': {
        term: 'Symmetry Anomaly',
        definition: 'A violation or breaking of symmetry in the system, representing a localized disturbance that can propagate through the lattice.'
      },
      'Reversible Dynamics': {
        term: 'Reversible Dynamics',
        definition: 'Processes that can be reversed in time, maintaining information conservation and allowing backward evolution of the system.'
      },
      'Node': {
        term: 'Node',
        definition: 'A fundamental unit of the lattice that can exist in symmetric, asymmetric, or anomalous states.'
      },
      'Energy': {
        term: 'Energy',
        definition: 'A measure of the state difference between a node and its neighbors, representing the potential for state transitions.'
      },
      'Phase': {
        term: 'Phase',
        definition: 'A property of nodes that determines their oscillation state and interaction patterns.'
      },
      'Propagation': {
        term: 'Propagation',
        definition: 'The spread of anomalies or state changes through the lattice via node interactions.'
      },
      'Interaction Range': {
        term: 'Interaction Range',
        definition: 'The distance over which nodes can influence each other\'s states.'
      }
    };

    this.theoryDocuments = [
      {
        title: 'Symmetry Anomalies and Reversible Lattice Dynamics',
        file: 'docs/01_Symmetry_Anomalies_and_Reversible_Lattice_Dynamics__An_Informational_Framework_for_the_Origin_of_Matter_and_Fields__v57_.pdf',
        abstract: 'This paper presents the foundational framework of TDS, describing how matter and fields emerge from informational symmetry dynamics on a discrete lattice structure.',
        topics: ['Lattice Structure', 'Symmetry Dynamics', 'Information Theory']
      },
      {
        title: 'TDS Manifest',
        file: 'docs/02_TDS_Manifest.pdf',
        abstract: 'A comprehensive overview of the Theory of Dynamic Symmetry, its principles, and implications for understanding fundamental physics.',
        topics: ['Core Principles', 'Philosophical Framework', 'Applications']
      },
      {
        title: 'Core Law of the Theory of Dynamic Symmetry',
        file: 'docs/03_Core_Law_of_the_Theory_of_Dynamic_Symmetry__TDS_.pdf',
        abstract: 'Detailed mathematical formulation of the core law governing symmetry transitions and anomaly propagation in the TDS framework.',
        topics: ['Mathematical Framework', 'Core Law', 'Predictions']
      },
      {
        title: 'Theory of Dynamic Symmetry: Summary Paper',
        file: 'docs/04_Theory_of_Dynamic_Symmetry__Summary_Paper_.pdf',
        abstract: 'An accessible summary of TDS theory, suitable for researchers from various backgrounds.',
        topics: ['Overview', 'Key Concepts', 'Experimental Predictions']
      }
    ];

    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    const infoPanelContainer = document.getElementById('info-panel');
    if (!infoPanelContainer) return;

    infoPanelContainer.innerHTML = `
      <div class="info-panel-overlay hidden" id="info-overlay">
        <div class="info-panel-modal">
          <div class="info-panel-header">
            <h2>Theory of Dynamic Symmetry</h2>
            <button class="close-btn" id="close-info-btn" title="Close">&times;</button>
          </div>

          <div class="info-panel-tabs">
            <button class="tab-btn active" data-tab="theory">Theory Overview</button>
            <button class="tab-btn" data-tab="glossary">Glossary</button>
            <button class="tab-btn" data-tab="documents">Documents</button>
            <button class="tab-btn" data-tab="help">Help</button>
          </div>

          <div class="info-panel-content">
            <div class="tab-content active" id="theory-tab">
              ${this.createTheoryContent()}
            </div>

            <div class="tab-content" id="glossary-tab">
              ${this.createGlossaryContent()}
            </div>

            <div class="tab-content" id="documents-tab">
              ${this.createDocumentsContent()}
            </div>

            <div class="tab-content" id="help-tab">
              ${this.createHelpContent()}
            </div>
          </div>
        </div>
      </div>

      <button class="info-trigger-btn" id="show-info-btn" title="Show Information">
        <span class="info-icon">ℹ</span>
        <span class="info-label">Info</span>
      </button>
    `;
  }

  createTheoryContent() {
    return `
      <div class="theory-content">
        <h3>What is the Theory of Dynamic Symmetry?</h3>
        <p>
          The Theory of Dynamic Symmetry (TDS) is a theoretical framework that describes 
          the origin of matter and fields through an informational approach based on 
          symmetry dynamics in a discrete lattice structure.
        </p>

        <div class="theory-section">
          <h4>Core Concepts</h4>
          <div class="concept-grid">
            <div class="concept-card">
              <div class="concept-icon">🔷</div>
              <h5>Discrete Lattice</h5>
              <p>Space is modeled as a discrete lattice of interconnected nodes, each capable of existing in different states.</p>
            </div>
            <div class="concept-card">
              <div class="concept-icon">⚖️</div>
              <h5>Symmetry Dynamics</h5>
              <p>Nodes transition between symmetric and asymmetric states based on interactions with neighbors.</p>
            </div>
            <div class="concept-card">
              <div class="concept-icon">⚡</div>
              <h5>Anomalies</h5>
              <p>Symmetry violations that propagate through the lattice, representing fundamental particles and fields.</p>
            </div>
            <div class="concept-card">
              <div class="concept-icon">🔄</div>
              <h5>Reversibility</h5>
              <p>All processes are time-reversible, ensuring information conservation and deterministic evolution.</p>
            </div>
          </div>
        </div>

        <div class="theory-section">
          <h4>Key Principles</h4>
          <ul class="principles-list">
            <li><strong>Information Conservation:</strong> Total information in the system is conserved through reversible dynamics.</li>
            <li><strong>Local Interactions:</strong> Nodes interact only with their neighbors within a defined range.</li>
            <li><strong>Emergent Behavior:</strong> Complex patterns and structures emerge from simple local rules.</li>
            <li><strong>Symmetry Breaking:</strong> Anomalies represent spontaneous symmetry breaking events.</li>
          </ul>
        </div>

        <div class="theory-section">
          <h4>Visualization Guide</h4>
          <div class="visualization-guide">
            <div class="guide-item">
              <span class="color-indicator" style="background: #4CAF50;"></span>
              <span><strong>Green:</strong> Symmetric state (balanced, ordered)</span>
            </div>
            <div class="guide-item">
              <span class="color-indicator" style="background: #FFC107;"></span>
              <span><strong>Yellow:</strong> Asymmetric state (transitioning)</span>
            </div>
            <div class="guide-item">
              <span class="color-indicator" style="background: #F44336;"></span>
              <span><strong>Red:</strong> Anomaly (symmetry violation)</span>
            </div>
          </div>
        </div>

        <div class="theory-diagram">
          <svg viewBox="0 0 400 200" class="lattice-diagram">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            <!-- Lattice nodes -->
            <circle cx="100" cy="100" r="15" fill="#4CAF50" stroke="#333" stroke-width="2"/>
            <circle cx="150" cy="100" r="15" fill="#4CAF50" stroke="#333" stroke-width="2"/>
            <circle cx="200" cy="100" r="15" fill="#F44336" stroke="#333" stroke-width="2"/>
            <circle cx="250" cy="100" r="15" fill="#FFC107" stroke="#333" stroke-width="2"/>
            <circle cx="300" cy="100" r="15" fill="#4CAF50" stroke="#333" stroke-width="2"/>
            <!-- Connections -->
            <line x1="115" y1="100" x2="135" y2="100" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line x1="165" y1="100" x2="185" y2="100" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line x1="215" y1="100" x2="235" y2="100" stroke="#F44336" stroke-width="3" marker-end="url(#arrowhead)"/>
            <line x1="265" y1="100" x2="285" y2="100" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>
            <!-- Labels -->
            <text x="100" y="140" text-anchor="middle" font-size="12" fill="#333">Symmetric</text>
            <text x="200" y="140" text-anchor="middle" font-size="12" fill="#333">Anomaly</text>
            <text x="250" y="140" text-anchor="middle" font-size="12" fill="#333">Propagating</text>
          </svg>
          <p class="diagram-caption">Anomaly propagation through a 1D lattice</p>
        </div>
      </div>
    `;
  }

  createGlossaryContent() {
    const searchBox = `
      <div class="glossary-search">
        <input type="text" id="glossary-search" placeholder="Search terms..." class="search-input"/>
      </div>
    `;

    const terms = Object.entries(this.glossary).map(([key, item]) => `
      <div class="glossary-item" data-term="${key.toLowerCase()}">
        <h4 class="glossary-term">${item.term}</h4>
        <p class="glossary-definition">${item.definition}</p>
      </div>
    `).join('');

    return `
      <div class="glossary-content">
        <h3>Glossary of Terms</h3>
        ${searchBox}
        <div class="glossary-list" id="glossary-list">
          ${terms}
        </div>
      </div>
    `;
  }

  createDocumentsContent() {
    const docs = this.theoryDocuments.map(doc => `
      <div class="document-card">
        <h4 class="document-title">${doc.title}</h4>
        <p class="document-abstract">${doc.abstract}</p>
        <div class="document-topics">
          ${doc.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
        </div>
        <a href="${doc.file}" target="_blank" class="document-link">
          View Document →
        </a>
      </div>
    `).join('');

    return `
      <div class="documents-content">
        <h3>Theory Documents</h3>
        <p class="documents-intro">
          Explore the foundational papers and documentation for the Theory of Dynamic Symmetry.
        </p>
        <div class="documents-list">
          ${docs}
        </div>
      </div>
    `;
  }

  createHelpContent() {
    return `
      <div class="help-content">
        <h3>How to Use This Simulation</h3>

        <div class="help-section">
          <h4>Getting Started</h4>
          <ol class="help-list">
            <li>Use the <strong>Controls Panel</strong> to adjust simulation parameters</li>
            <li>Click <strong>Play</strong> to start the simulation</li>
            <li>Try different <strong>Preset Scenarios</strong> to explore various behaviors</li>
            <li>Click on nodes to create anomalies manually</li>
          </ol>
        </div>

        <div class="help-section">
          <h4>Understanding the Visualization</h4>
          <ul class="help-list">
            <li><strong>Node Colors:</strong> Indicate the state (symmetric, asymmetric, anomaly)</li>
            <li><strong>Connections:</strong> Show interactions between neighboring nodes</li>
            <li><strong>Particle Trails:</strong> Visualize the flow of energy and information</li>
            <li><strong>Mini-map:</strong> Provides an overview of the entire lattice</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>Key Parameters</h4>
          <dl class="parameter-help">
            <dt>Symmetry Strength</dt>
            <dd>Controls how strongly nodes maintain symmetric states. Higher values create more stable patterns.</dd>
            
            <dt>Anomaly Probability</dt>
            <dd>Determines how likely anomalies are to form. Higher values create more dynamic, chaotic behavior.</dd>
            
            <dt>Interaction Range</dt>
            <dd>Sets the distance over which nodes influence each other. Larger ranges create more connected behavior.</dd>
          </dl>
        </div>

        <div class="help-section">
          <h4>Tips & Tricks</h4>
          <ul class="help-list">
            <li>Hover over the <strong>?</strong> buttons for detailed parameter explanations</li>
            <li>Use the <strong>Timeline</strong> to review and replay interesting moments</li>
            <li>Switch between <strong>2D and 3D</strong> views for different perspectives</li>
            <li>Export data from the <strong>Analytics Dashboard</strong> for further analysis</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>Keyboard Shortcuts</h4>
          <table class="shortcuts-table">
            <tr><td><kbd>Space</kbd></td><td>Play/Pause simulation</td></tr>
            <tr><td><kbd>→</kbd></td><td>Step forward</td></tr>
            <tr><td><kbd>←</kbd></td><td>Step backward</td></tr>
            <tr><td><kbd>R</kbd></td><td>Reset simulation</td></tr>
            <tr><td><kbd>I</kbd></td><td>Toggle info panel</td></tr>
          </table>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Show/hide panel
    const showBtn = document.getElementById('show-info-btn');
    const closeBtn = document.getElementById('close-info-btn');
    const overlay = document.getElementById('info-overlay');

    if (showBtn) {
      showBtn.addEventListener('click', () => this.show());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Glossary search
    const searchInput = document.getElementById('glossary-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterGlossary(e.target.value));
    }

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          this.toggle();
        }
      }
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  show() {
    const overlay = document.getElementById('info-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  hide() {
    const overlay = document.getElementById('info-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      this.isVisible = false;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
  }

  filterGlossary(searchTerm) {
    const term = searchTerm.toLowerCase();
    const items = document.querySelectorAll('.glossary-item');

    items.forEach(item => {
      const itemTerm = item.dataset.term;
      const text = item.textContent.toLowerCase();
      
      if (text.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  addContextualTooltip(element, text) {
    element.setAttribute('data-tooltip', text);
    element.classList.add('has-tooltip');
  }
}
