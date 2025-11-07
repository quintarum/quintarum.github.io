import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColorScheme } from './ColorScheme.js';
import { VisualEffects } from './VisualEffects.js';

/**
 * Renderer3D class - Handles 3D rendering of the lattice using Three.js
 * Provides instanced rendering, LOD, particle trails, and mini-map overlay
 */
export class Renderer3D {
  constructor(container, options = {}) {
    this.container = container;
    this.colorScheme = new ColorScheme(options.theme || 'light');
    this.visualEffects = new VisualEffects();
    
    // Rendering options
    this.options = {
      showGrid: options.showGrid !== false,
      showConnections: options.showConnections !== false,
      showParticleTrails: options.showParticleTrails !== false,
      showMiniMap: options.showMiniMap !== false,
      nodeSize: options.nodeSize || 0.3,
      glowIntensity: options.glowIntensity || 0.8,
      animationSpeed: options.animationSpeed || 1.0,
      enableLOD: options.enableLOD !== false,
      enableFrustumCulling: options.enableFrustumCulling !== false,
      ...options
    };
    
    // Three.js core objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Node rendering
    this.nodeMeshes = new Map();
    this.instancedMesh = null;
    this.nodeGeometry = null;
    this.nodeMaterials = new Map();
    
    // Connections
    this.connectionLines = null;
    
    // Particle system
    this.particleSystem = null;
    this.particles = [];
    
    // Mini-map
    this.miniMapCanvas = null;
    this.miniMapCtx = null;
    this.miniMapSize = 150;
    
    // Animation
    this.animationFrame = 0;
    this.isAnimating = false;
    this.lastRenderTime = Date.now();
    
    // Instructions overlay
    this.instructionsElement = null;
    
    this.initialize();
  }

  /**
   * Initialize Three.js scene, camera, renderer, and controls
   */
  initialize() {
    // Create scene
    this.scene = new THREE.Scene();
    const bgColor = this.colorScheme.getBackgroundColor();
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.Fog(bgColor, 20, 100);
    
    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(15, 15, 15);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);
    
    // Set up OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // Set up lighting
    this.setupLighting();
    
    // Create materials
    this.createMaterials();
    
    // Create mini-map canvas
    this.createMiniMap();
    
    // Create instructions overlay
    this.createInstructions();
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Set up scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0x4A90E2, 0.5, 30);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
    
    // Hemisphere light for better ambient
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(hemisphereLight);
  }

  /**
   * Create materials for different node states
   */
  createMaterials() {
    const palette = this.colorScheme.palettes.default[this.colorScheme.theme];
    
    // Symmetric material
    this.nodeMaterials.set('symmetric', new THREE.MeshPhongMaterial({
      color: new THREE.Color(palette.symmetric.base),
      emissive: new THREE.Color(palette.symmetric.glow),
      emissiveIntensity: 0.2,
      shininess: 100,
      specular: 0x888888
    }));
    
    // Asymmetric material
    this.nodeMaterials.set('asymmetric', new THREE.MeshPhongMaterial({
      color: new THREE.Color(palette.asymmetric.base),
      emissive: new THREE.Color(palette.asymmetric.glow),
      emissiveIntensity: 0.3,
      shininess: 100,
      specular: 0x888888
    }));
    
    // Anomaly material
    this.nodeMaterials.set('anomaly', new THREE.MeshPhongMaterial({
      color: new THREE.Color(palette.anomaly.base),
      emissive: new THREE.Color(palette.anomaly.glow),
      emissiveIntensity: 0.5,
      shininess: 100,
      specular: 0xffffff
    }));
  }

  /**
   * Create mini-map canvas overlay
   */
  createMiniMap() {
    this.miniMapCanvas = document.createElement('canvas');
    this.miniMapCanvas.width = this.miniMapSize;
    this.miniMapCanvas.height = this.miniMapSize;
    this.miniMapCanvas.style.position = 'absolute';
    this.miniMapCanvas.style.top = '10px';
    this.miniMapCanvas.style.right = '10px';
    this.miniMapCanvas.style.border = '2px solid ' + this.colorScheme.getGridColor();
    this.miniMapCanvas.style.borderRadius = '4px';
    this.miniMapCanvas.style.backgroundColor = this.colorScheme.getBackgroundColor();
    this.miniMapCanvas.style.opacity = '0.9';
    this.miniMapCanvas.style.pointerEvents = 'none';
    
    this.miniMapCtx = this.miniMapCanvas.getContext('2d');
    
    if (this.options.showMiniMap) {
      this.container.appendChild(this.miniMapCanvas);
    }
  }

  /**
   * Create on-screen instructions overlay
   */
  createInstructions() {
    this.instructionsElement = document.createElement('div');
    this.instructionsElement.style.position = 'absolute';
    this.instructionsElement.style.bottom = '10px';
    this.instructionsElement.style.left = '10px';
    this.instructionsElement.style.padding = '10px 15px';
    this.instructionsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.instructionsElement.style.color = '#ffffff';
    this.instructionsElement.style.fontFamily = 'sans-serif';
    this.instructionsElement.style.fontSize = '12px';
    this.instructionsElement.style.borderRadius = '4px';
    this.instructionsElement.style.pointerEvents = 'none';
    this.instructionsElement.innerHTML = `
      <strong>3D Controls:</strong><br>
      • Left Mouse: Rotate<br>
      • Right Mouse: Pan<br>
      • Scroll: Zoom
    `;
    
    this.container.appendChild(this.instructionsElement);
  }

  /**
   * Create node meshes with instanced rendering for performance
   * @param {Lattice} lattice - Lattice object
   */
  createNodeMeshes(lattice) {
    // Clear existing meshes
    this.clearNodeMeshes();
    
    // Create geometry for nodes
    this.nodeGeometry = new THREE.SphereGeometry(this.options.nodeSize, 16, 16);
    
    // Calculate total nodes
    const totalNodes = lattice.width * lattice.height * (lattice.depth || 1);
    
    // Create instanced mesh for better performance
    const material = this.nodeMaterials.get('symmetric');
    this.instancedMesh = new THREE.InstancedMesh(
      this.nodeGeometry,
      material,
      totalNodes
    );
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    
    // Position nodes
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    let index = 0;
    
    for (let z = 0; z < (lattice.depth || 1); z++) {
      for (let y = 0; y < lattice.height; y++) {
        for (let x = 0; x < lattice.width; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;
          
          // Center the lattice
          const posX = x - lattice.width / 2;
          const posY = y - lattice.height / 2;
          const posZ = z - (lattice.depth || 1) / 2;
          
          matrix.setPosition(posX, posY, posZ);
          this.instancedMesh.setMatrixAt(index, matrix);
          
          // Set initial color
          const colors = this.colorScheme.getNodeColor(node);
          color.set(colors.base);
          this.instancedMesh.setColorAt(index, color);
          
          // Store mapping
          this.nodeMeshes.set(`${x},${y},${z}`, index);
          
          index++;
        }
      }
    }
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    
    this.scene.add(this.instancedMesh);
    
    // Create connections if enabled
    if (this.options.showConnections) {
      this.createConnections(lattice);
    }
    
    // Create grid if enabled
    if (this.options.showGrid) {
      this.createGrid(lattice);
    }
  }

  /**
   * Create connection lines between nodes
   * @param {Lattice} lattice - Lattice object
   */
  createConnections(lattice) {
    const positions = [];
    const colors = [];
    const connectionColor = new THREE.Color(this.colorScheme.getConnectionColor());
    
    for (let z = 0; z < (lattice.depth || 1); z++) {
      for (let y = 0; y < lattice.height; y++) {
        for (let x = 0; x < lattice.width; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;
          
          const posX = x - lattice.width / 2;
          const posY = y - lattice.height / 2;
          const posZ = z - (lattice.depth || 1) / 2;
          
          // Connect to right neighbor
          if (x < lattice.width - 1) {
            const rightNode = lattice.getNode(x + 1, y, z);
            if (rightNode) {
              positions.push(posX, posY, posZ);
              positions.push(posX + 1, posY, posZ);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
            }
          }
          
          // Connect to down neighbor
          if (y < lattice.height - 1) {
            const downNode = lattice.getNode(x, y + 1, z);
            if (downNode) {
              positions.push(posX, posY, posZ);
              positions.push(posX, posY + 1, posZ);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
            }
          }
          
          // Connect to forward neighbor (3D)
          if (z < (lattice.depth || 1) - 1) {
            const forwardNode = lattice.getNode(x, y, z + 1);
            if (forwardNode) {
              positions.push(posX, posY, posZ);
              positions.push(posX, posY, posZ + 1);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
              colors.push(connectionColor.r, connectionColor.g, connectionColor.b);
            }
          }
        }
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      opacity: 0.3,
      transparent: true
    });
    
    this.connectionLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.connectionLines);
  }

  /**
   * Create grid helper
   * @param {Lattice} lattice - Lattice object
   */
  createGrid(lattice) {
    const size = Math.max(lattice.width, lattice.height);
    const divisions = size;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x444444);
    gridHelper.position.y = -lattice.height / 2;
    this.scene.add(gridHelper);
  }

  /**
   * Clear all node meshes
   */
  clearNodeMeshes() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
      this.instancedMesh = null;
    }
    
    if (this.connectionLines) {
      this.scene.remove(this.connectionLines);
      this.connectionLines.geometry.dispose();
      this.connectionLines.material.dispose();
      this.connectionLines = null;
    }
    
    this.nodeMeshes.clear();
  }

  /**
   * Main render method
   * @param {Lattice} lattice - Lattice to render
   */
  render(lattice) {
    if (!this.instancedMesh) {
      this.createNodeMeshes(lattice);
    }
    
    const now = Date.now();
    const deltaTime = now - this.lastRenderTime;
    this.lastRenderTime = now;
    
    // Update visual effects
    this.visualEffects.update(deltaTime);
    
    // Update controls
    this.controls.update();
    
    // Update node states
    this.updateAllNodes(lattice);
    
    // Update particle system
    if (this.options.showParticleTrails) {
      this.updateParticles(lattice, deltaTime);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Render mini-map
    if (this.options.showMiniMap) {
      this.renderMiniMap(lattice);
    }
    
    // Increment animation frame
    this.animationFrame++;
  }

  /**
   * Animation loop with requestAnimationFrame
   * @param {Lattice} lattice - Lattice to render
   */
  animate(lattice) {
    if (!this.isAnimating) return;
    
    requestAnimationFrame(() => this.animate(lattice));
    
    // Render the scene
    this.render(lattice);
  }

  /**
   * Update a single node mesh based on state changes
   * @param {Object} node - Node object
   * @param {Lattice} lattice - Lattice object
   */
  updateNodeMesh(node, lattice) {
    if (!this.instancedMesh) return;
    
    const key = `${node.position.x},${node.position.y},${node.position.z || 0}`;
    const index = this.nodeMeshes.get(key);
    if (index === undefined) return;
    
    const color = new THREE.Color();
    const matrix = new THREE.Matrix4();
    
    // Update color
    const colors = this.colorScheme.getNodeColor(node);
    color.set(colors.base);
    this.instancedMesh.setColorAt(index, color);
    
    // Update scale for anomalies (pulsing effect)
    let nodeScale = 1.0;
    if (node.state === 'anomaly') {
      nodeScale = 1.0 + 0.3 * Math.sin(this.animationFrame * 0.1);
    } else if (node.energy > 0.7) {
      nodeScale = 1.0 + 0.1 * node.energy;
    }
    
    // Get current matrix and update scale
    const posX = node.position.x - lattice.width / 2;
    const posY = node.position.y - lattice.height / 2;
    const posZ = (node.position.z || 0) - (lattice.depth || 1) / 2;
    
    matrix.compose(
      new THREE.Vector3(posX, posY, posZ),
      new THREE.Quaternion(),
      new THREE.Vector3(nodeScale, nodeScale, nodeScale)
    );
    
    this.instancedMesh.setMatrixAt(index, matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Update all node meshes based on lattice state
   * @param {Lattice} lattice - Lattice object
   */
  updateAllNodes(lattice) {
    const color = new THREE.Color();
    const matrix = new THREE.Matrix4();
    
    // Frustum culling optimization
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
    
    // LOD system - adjust detail based on distance
    const cameraPosition = this.camera.position;
    const lodDistances = {
      high: 15,
      medium: 30,
      low: 50
    };
    
    for (let z = 0; z < (lattice.depth || 1); z++) {
      for (let y = 0; y < lattice.height; y++) {
        for (let x = 0; x < lattice.width; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node) continue;
          
          const key = `${x},${y},${z}`;
          const index = this.nodeMeshes.get(key);
          if (index === undefined) continue;
          
          const posX = x - lattice.width / 2;
          const posY = y - lattice.height / 2;
          const posZ = z - (lattice.depth || 1) / 2;
          
          const nodePosition = new THREE.Vector3(posX, posY, posZ);
          
          // Frustum culling - skip nodes outside view
          if (this.options.enableFrustumCulling) {
            const sphere = new THREE.Sphere(nodePosition, this.options.nodeSize);
            if (!frustum.intersectsSphere(sphere)) {
              continue;
            }
          }
          
          // Calculate distance for LOD
          const distance = cameraPosition.distanceTo(nodePosition);
          let lodLevel = 'high';
          if (this.options.enableLOD) {
            if (distance > lodDistances.low) {
              lodLevel = 'low';
            } else if (distance > lodDistances.medium) {
              lodLevel = 'medium';
            }
          }
          
          // Update color
          const colors = this.colorScheme.getNodeColor(node);
          color.set(colors.base);
          this.instancedMesh.setColorAt(index, color);
          
          // Update scale for anomalies (pulsing effect)
          let nodeScale = 1.0;
          if (node.state === 'anomaly') {
            nodeScale = 1.0 + 0.3 * Math.sin(this.animationFrame * 0.1);
          } else if (node.energy > 0.7) {
            nodeScale = 1.0 + 0.1 * node.energy;
          }
          
          // Apply LOD scaling
          if (lodLevel === 'low') {
            nodeScale *= 0.7;
          } else if (lodLevel === 'medium') {
            nodeScale *= 0.85;
          }
          
          matrix.compose(
            nodePosition,
            new THREE.Quaternion(),
            new THREE.Vector3(nodeScale, nodeScale, nodeScale)
          );
          
          this.instancedMesh.setMatrixAt(index, matrix);
        }
      }
    }
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Update particle system for 3D trails
   * @param {Lattice} lattice - Lattice object
   * @param {number} deltaTime - Time since last update
   */
  updateParticles(lattice, deltaTime) {
    // Add new particles from high-energy nodes
    for (let z = 0; z < (lattice.depth || 1); z++) {
      for (let y = 0; y < lattice.height; y++) {
        for (let x = 0; x < lattice.width; x++) {
          const node = lattice.getNode(x, y, z);
          if (!node || node.energy < 0.7) continue;
          
          if (Math.random() < 0.05) {
            const posX = x - lattice.width / 2;
            const posY = y - lattice.height / 2;
            const posZ = z - (lattice.depth || 1) / 2;
            
            this.addParticle3D(posX, posY, posZ, node);
          }
        }
      }
    }
    
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.position.x += particle.velocity.x * deltaTime / 1000;
      particle.position.y += particle.velocity.y * deltaTime / 1000;
      particle.position.z += particle.velocity.z * deltaTime / 1000;
      particle.life -= deltaTime;
      
      if (particle.mesh) {
        particle.mesh.position.copy(particle.position);
        particle.mesh.material.opacity = particle.life / particle.maxLife;
      }
      
      if (particle.life <= 0 && particle.mesh) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        return false;
      }
      
      return particle.life > 0;
    });
  }

  /**
   * Add a 3D particle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @param {Object} node - Node object
   */
  addParticle3D(x, y, z, node) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const colors = this.colorScheme.getNodeColor(node);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.base),
      transparent: true,
      opacity: 1.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI;
    const speed = 0.5 + Math.random() * 1.5;
    
    this.particles.push({
      mesh,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed,
        Math.sin(angle) * Math.cos(elevation) * speed
      ),
      life: 2000,
      maxLife: 2000
    });
  }

  /**
   * Render mini-map overlay
   * @param {Lattice} lattice - Lattice object
   */
  renderMiniMap(lattice) {
    const ctx = this.miniMapCtx;
    const size = this.miniMapSize;
    
    // Clear canvas
    ctx.fillStyle = this.colorScheme.getBackgroundColor();
    ctx.fillRect(0, 0, size, size);
    
    // Draw lattice overview (top-down view)
    const cellSize = size / Math.max(lattice.width, lattice.height);
    
    for (let y = 0; y < lattice.height; y++) {
      for (let x = 0; x < lattice.width; x++) {
        const node = lattice.getNode(x, y, 0);
        if (!node) continue;
        
        const colors = this.colorScheme.getNodeColor(node);
        const miniX = x * cellSize;
        const miniY = y * cellSize;
        
        ctx.fillStyle = colors.base;
        ctx.fillRect(miniX, miniY, cellSize, cellSize);
      }
    }
    
    // Draw border
    ctx.strokeStyle = this.colorScheme.getGridColor();
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
  }

  /**
   * Start animation loop
   * @param {Lattice} lattice - Lattice to animate
   */
  startAnimation(lattice) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animate(lattice);
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    this.isAnimating = false;
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  /**
   * Set rendering options
   * @param {Object} options - Options to update
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    
    // Update mini-map visibility
    if (options.showMiniMap !== undefined) {
      if (options.showMiniMap && !this.miniMapCanvas.parentElement) {
        this.container.appendChild(this.miniMapCanvas);
      } else if (!options.showMiniMap && this.miniMapCanvas.parentElement) {
        this.container.removeChild(this.miniMapCanvas);
      }
    }
  }

  /**
   * Set color scheme palette
   * @param {string} palette - Palette name
   */
  setPalette(palette) {
    this.colorScheme.setPalette(palette);
    this.createMaterials();
  }

  /**
   * Set theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme(theme) {
    this.colorScheme.setTheme(theme);
    const bgColor = this.colorScheme.getBackgroundColor();
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog.color = new THREE.Color(bgColor);
    this.createMaterials();
  }

  /**
   * Get color scheme for legend generation
   * @returns {ColorScheme} Color scheme instance
   */
  getColorScheme() {
    return this.colorScheme;
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    this.stopAnimation();
    
    // Dispose geometries and materials
    this.clearNodeMeshes();
    
    if (this.nodeGeometry) {
      this.nodeGeometry.dispose();
    }
    
    this.nodeMaterials.forEach(material => material.dispose());
    this.nodeMaterials.clear();
    
    // Dispose particles
    this.particles.forEach(particle => {
      if (particle.mesh) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
      }
    });
    this.particles = [];
    
    // Dispose renderer
    this.renderer.dispose();
    
    // Remove DOM elements
    if (this.renderer.domElement.parentElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    if (this.miniMapCanvas.parentElement) {
      this.container.removeChild(this.miniMapCanvas);
    }
    
    if (this.instructionsElement.parentElement) {
      this.container.removeChild(this.instructionsElement);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
  }
}
