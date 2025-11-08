// @ts-nocheck
import { ColorScheme } from './ColorScheme.js';
import { VisualEffects } from './VisualEffects.js';

/**
 * Renderer2D class - Handles 2D canvas rendering of the lattice
 * Provides smooth animations, visual effects, and mini-map
 */
export class Renderer2D {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colorScheme = new ColorScheme(options.theme || 'light');
    this.visualEffects = new VisualEffects();
    
    // Rendering options
    this.options = {
      showGrid: options.showGrid !== false,
      showConnections: options.showConnections !== false,
      showParticleTrails: options.showParticleTrails !== false,
      showMiniMap: options.showMiniMap !== false,
      nodeSize: options.nodeSize || 8,
      glowIntensity: options.glowIntensity || 0.8,
      animationSpeed: options.animationSpeed || 1.0,
      ...options
    };
    
    // Animation state
    this.animationFrame = 0;
    this.lastRenderTime = Date.now();
    
    // Mini-map configuration
    this.miniMapSize = 150;
    this.miniMapPadding = 10;
    
    // Camera/viewport
    this.viewport = {
      offsetX: 0,
      offsetY: 0,
      scale: 1.0
    };
    
    // Node transitions for smooth animations
    this.nodeTransitions = new Map();
  }

  /**
   * Initialize canvas size
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initialize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = true;
  }

  /**
   * Main render method
   * @param {Lattice} lattice - Lattice to render
   */
  render(lattice) {
    const now = Date.now();
    const deltaTime = now - this.lastRenderTime;
    this.lastRenderTime = now;
    
    // Clear canvas
    this.clear();
    
    // Update visual effects
    this.visualEffects.update(deltaTime);
    
    // Calculate node spacing
    const spacing = this.calculateSpacing(lattice);
    
    // Render grid
    if (this.options.showGrid) {
      this.drawGrid(lattice, spacing);
    }
    
    // Render connections
    if (this.options.showConnections) {
      this.drawConnections(lattice, spacing);
    }
    
    // Render visual effects (background layer)
    this.visualEffects.render(this.ctx);
    
    // Render nodes
    this.drawNodes(lattice, spacing);
    
    // Render mini-map
    if (this.options.showMiniMap) {
      this.drawMiniMap(lattice);
    }
    
    // Increment animation frame
    this.animationFrame++;
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = this.colorScheme.getBackgroundColor();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Calculate spacing between nodes
   * @param {Lattice} lattice - Lattice object
   * @returns {Object} Spacing information
   */
  calculateSpacing(lattice) {
    const padding = 40;
    const availableWidth = this.canvas.width - 2 * padding - (this.options.showMiniMap ? this.miniMapSize + 20 : 0);
    const availableHeight = this.canvas.height - 2 * padding;
    
    const cellWidth = availableWidth / (lattice.width - 1 || 1);
    const cellHeight = availableHeight / (lattice.height - 1 || 1);
    const cellSize = Math.min(cellWidth, cellHeight);
    
    return {
      cellSize,
      offsetX: padding + (availableWidth - cellSize * (lattice.width - 1)) / 2,
      offsetY: padding + (availableHeight - cellSize * (lattice.height - 1)) / 2
    };
  }

  /**
   * Draw grid lines
   * @param {Lattice} lattice - Lattice object
   * @param {Object} spacing - Spacing information
   */
  drawGrid(lattice, spacing) {
    this.ctx.save();
    this.ctx.strokeStyle = this.colorScheme.getGridColor();
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.3;
    
    // Vertical lines
    for (let x = 0; x < lattice.width; x++) {
      const screenX = spacing.offsetX + x * spacing.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, spacing.offsetY);
      this.ctx.lineTo(screenX, spacing.offsetY + (lattice.height - 1) * spacing.cellSize);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < lattice.height; y++) {
      const screenY = spacing.offsetY + y * spacing.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(spacing.offsetX, screenY);
      this.ctx.lineTo(spacing.offsetX + (lattice.width - 1) * spacing.cellSize, screenY);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  /**
   * Draw connections between nodes
   * @param {Lattice} lattice - Lattice object
   * @param {Object} spacing - Spacing information
   */
  drawConnections(lattice, spacing) {
    this.ctx.save();
    this.ctx.strokeStyle = this.colorScheme.getConnectionColor();
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.2;
    
    // Animated pulse effect
    const pulse = 0.5 + 0.5 * Math.sin(this.animationFrame * 0.05);
    
    for (let y = 0; y < lattice.height; y++) {
      for (let x = 0; x < lattice.width; x++) {
        const node = lattice.getNode(x, y);
        if (!node) continue;
        
        const screenX = spacing.offsetX + x * spacing.cellSize;
        const screenY = spacing.offsetY + y * spacing.cellSize;
        
        // Draw connections to right and down neighbors only (to avoid duplicates)
        if (x < lattice.width - 1) {
          const rightNode = lattice.getNode(x + 1, y);
          if (rightNode) {
            const rightX = spacing.offsetX + (x + 1) * spacing.cellSize;
            
            // Animate connections based on energy flow
            const energyDiff = Math.abs(node.energy - rightNode.energy);
            this.ctx.globalAlpha = 0.2 + energyDiff * 0.3 * pulse;
            
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(rightX, screenY);
            this.ctx.stroke();
          }
        }
        
        if (y < lattice.height - 1) {
          const downNode = lattice.getNode(x, y + 1);
          if (downNode) {
            const downY = spacing.offsetY + (y + 1) * spacing.cellSize;
            
            const energyDiff = Math.abs(node.energy - downNode.energy);
            this.ctx.globalAlpha = 0.2 + energyDiff * 0.3 * pulse;
            
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(screenX, downY);
            this.ctx.stroke();
          }
        }
      }
    }
    
    this.ctx.restore();
  }

  /**
   * Draw all nodes
   * @param {Lattice} lattice - Lattice object
   * @param {Object} spacing - Spacing information
   */
  drawNodes(lattice, spacing) {
    for (let y = 0; y < lattice.height; y++) {
      for (let x = 0; x < lattice.width; x++) {
        const node = lattice.getNode(x, y);
        if (!node) continue;
        
        const screenX = spacing.offsetX + x * spacing.cellSize;
        const screenY = spacing.offsetY + y * spacing.cellSize;
        
        this.drawNode(node, screenX, screenY);
        
        // Add particle trails for high-energy nodes
        if (this.options.showParticleTrails && node.energy > 0.7 && Math.random() < 0.1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          this.visualEffects.addParticle(
            screenX,
            screenY,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            this.colorScheme.getNodeColor(node).base,
            1000 + Math.random() * 1000
          );
        }
      }
    }
  }

  /**
   * Draw a single node with glow effects
   * @param {Node} node - Node to draw
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   */
  drawNode(node, x, y) {
    const colors = this.colorScheme.getNodeColor(node);
    const nodeSize = this.options.nodeSize;
    
    // Smooth state transitions
    const transitionKey = `${node.position.x},${node.position.y}`;
    if (!this.nodeTransitions.has(transitionKey)) {
      this.nodeTransitions.set(transitionKey, {
        currentColor: colors.base,
        targetColor: colors.base,
        progress: 1.0
      });
    }
    
    const transition = this.nodeTransitions.get(transitionKey);
    if (transition.targetColor !== colors.base) {
      transition.targetColor = colors.base;
      transition.progress = 0;
    }
    
    // Update transition
    if (transition.progress < 1.0) {
      transition.progress = Math.min(1.0, transition.progress + 0.1);
      transition.currentColor = this.visualEffects.getColorTransition(
        transition.currentColor,
        transition.targetColor,
        transition.progress
      );
    }
    
    this.ctx.save();
    
    // Draw glow effect
    if (this.options.glowIntensity > 0) {
      const glowSize = nodeSize * 2.5;
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      
      const glowAlpha = Math.floor(this.options.glowIntensity * 60).toString(16).padStart(2, '0');
      gradient.addColorStop(0, colors.glow + glowAlpha);
      gradient.addColorStop(0.5, colors.glow + '20');
      gradient.addColorStop(1, colors.glow + '00');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Pulsing animation for anomalies
    let currentNodeSize = nodeSize;
    if (node.state === 'anomaly') {
      const pulse = 1 + 0.3 * Math.sin(this.animationFrame * 0.1);
      currentNodeSize = nodeSize * pulse;
    }
    
    // Draw node
    this.ctx.fillStyle = transition.currentColor || colors.base;
    this.ctx.beginPath();
    this.ctx.arc(x, y, currentNodeSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw node border
    this.ctx.strokeStyle = colors.glow;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    
    // Draw energy indicator (small inner circle)
    if (node.energy > 0.5) {
      const energySize = currentNodeSize * 0.4 * node.energy;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.globalAlpha = 0.6;
      this.ctx.beginPath();
      this.ctx.arc(x, y, energySize, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  /**
   * Draw mini-map
   * @param {Lattice} lattice - Lattice object
   */
  drawMiniMap(lattice) {
    const mapSize = this.miniMapSize;
    const padding = this.miniMapPadding;
    const mapX = this.canvas.width - mapSize - padding;
    const mapY = padding;
    
    this.ctx.save();
    
    // Draw mini-map background
    this.ctx.fillStyle = this.colorScheme.getBackgroundColor();
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Draw mini-map border
    this.ctx.strokeStyle = this.colorScheme.getGridColor();
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 1.0;
    this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    
    // Draw lattice overview
    const cellSize = mapSize / Math.max(lattice.width, lattice.height);
    
    for (let y = 0; y < lattice.height; y++) {
      for (let x = 0; x < lattice.width; x++) {
        const node = lattice.getNode(x, y);
        if (!node) continue;
        
        const colors = this.colorScheme.getNodeColor(node);
        const miniX = mapX + x * cellSize;
        const miniY = mapY + y * cellSize;
        
        this.ctx.fillStyle = colors.base;
        this.ctx.fillRect(miniX, miniY, cellSize, cellSize);
      }
    }
    
    // Draw mini-map label
    this.ctx.fillStyle = this.colorScheme.getTextColor();
    this.ctx.font = '10px sans-serif';
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillText('Overview', mapX + 5, mapY + mapSize + 15);
    
    this.ctx.restore();
  }

  /**
   * Create anomaly at screen coordinates
   * @param {number} screenX - Screen X coordinate
   * @param {number} screenY - Screen Y coordinate
   * @param {Lattice} lattice - Lattice object
   */
  createAnomalyAtPosition(screenX, screenY, lattice) {
    const spacing = this.calculateSpacing(lattice);
    
    // Convert screen coordinates to lattice coordinates
    const latticeX = Math.round((screenX - spacing.offsetX) / spacing.cellSize);
    const latticeY = Math.round((screenY - spacing.offsetY) / spacing.cellSize);
    
    if (latticeX >= 0 && latticeX < lattice.width && latticeY >= 0 && latticeY < lattice.height) {
      const node = lattice.getNode(latticeX, latticeY);
      if (node) {
        node.state = 'anomaly';
        
        // Add visual effects
        const effectX = spacing.offsetX + latticeX * spacing.cellSize;
        const effectY = spacing.offsetY + latticeY * spacing.cellSize;
        
        this.visualEffects.addRipple(effectX, effectY, '#E74C3C', 80);
        this.visualEffects.addHalo(effectX, effectY, '#F39C12', 1500);
        
        return node;
      }
    }
    
    return null;
  }

  /**
   * Set rendering options
   * @param {Object} options - Options to update
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Set color scheme palette
   * @param {string} palette - Palette name
   */
  setPalette(palette) {
    this.colorScheme.setPalette(palette);
  }

  /**
   * Set theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme(theme) {
    this.colorScheme.setTheme(theme);
  }

  /**
   * Get color scheme for legend generation
   * @returns {ColorScheme} Color scheme instance
   */
  getColorScheme() {
    return this.colorScheme;
  }

  /**
   * Get visual effects instance
   * @returns {VisualEffects} Visual effects instance
   */
  getVisualEffects() {
    return this.visualEffects;
  }

  /**
   * Resize canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
