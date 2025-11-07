/**
 * VisualEffects class - Manages visual effects for the simulation
 * Provides ripples, halos, particle trails, and flow lines
 */
export class VisualEffects {
  constructor() {
    this.ripples = [];
    this.halos = [];
    this.particleTrails = [];
    this.flowLines = [];
    this.maxRipples = 50;
    this.maxParticles = 1000;
    this.maxFlowLines = 100;
  }

  /**
   * Add a ripple effect at a position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Ripple color
   * @param {number} maxRadius - Maximum ripple radius
   */
  addRipple(x, y, color = '#E74C3C', maxRadius = 100) {
    if (this.ripples.length >= this.maxRipples) {
      this.ripples.shift();
    }
    
    this.ripples.push({
      x,
      y,
      radius: 0,
      maxRadius,
      color,
      alpha: 1.0,
      speed: 2.0,
      createdAt: Date.now()
    });
  }

  /**
   * Add a halo effect around a node
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Halo color
   * @param {number} duration - Duration in milliseconds
   */
  addHalo(x, y, color = '#F39C12', duration = 1000) {
    this.halos.push({
      x,
      y,
      color,
      alpha: 1.0,
      radius: 10,
      maxRadius: 20,
      duration,
      createdAt: Date.now()
    });
  }

  /**
   * Add a particle to a trail
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} vx - X velocity
   * @param {number} vy - Y velocity
   * @param {string} color - Particle color
   * @param {number} lifetime - Particle lifetime in milliseconds
   */
  addParticle(x, y, vx, vy, color = '#4A90E2', lifetime = 2000) {
    if (this.particleTrails.length >= this.maxParticles) {
      this.particleTrails.shift();
    }
    
    this.particleTrails.push({
      x,
      y,
      vx,
      vy,
      color,
      alpha: 1.0,
      size: 3,
      lifetime,
      createdAt: Date.now()
    });
  }

  /**
   * Add a flow line between two points
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {string} color - Flow line color
   * @param {number} duration - Duration in milliseconds
   */
  addFlowLine(x1, y1, x2, y2, color = '#ADB5BD', duration = 1000) {
    if (this.flowLines.length >= this.maxFlowLines) {
      this.flowLines.shift();
    }
    
    this.flowLines.push({
      x1,
      y1,
      x2,
      y2,
      color,
      alpha: 0.6,
      progress: 0,
      duration,
      createdAt: Date.now()
    });
  }

  /**
   * Update all effects
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime) {
    const now = Date.now();
    
    // Update ripples
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed * deltaTime / 16;
      ripple.alpha = 1.0 - (ripple.radius / ripple.maxRadius);
      return ripple.radius < ripple.maxRadius;
    });
    
    // Update halos
    this.halos = this.halos.filter(halo => {
      const elapsed = now - halo.createdAt;
      const progress = elapsed / halo.duration;
      halo.alpha = 1.0 - progress;
      halo.radius = halo.maxRadius * (0.5 + 0.5 * Math.sin(progress * Math.PI * 4));
      return elapsed < halo.duration;
    });
    
    // Update particles
    this.particleTrails = this.particleTrails.filter(particle => {
      particle.x += particle.vx * deltaTime / 16;
      particle.y += particle.vy * deltaTime / 16;
      const elapsed = now - particle.createdAt;
      particle.alpha = 1.0 - (elapsed / particle.lifetime);
      particle.size = 3 * particle.alpha;
      return elapsed < particle.lifetime;
    });
    
    // Update flow lines
    this.flowLines = this.flowLines.filter(line => {
      const elapsed = now - line.createdAt;
      line.progress = elapsed / line.duration;
      line.alpha = 0.6 * (1.0 - line.progress);
      return elapsed < line.duration;
    });
  }

  /**
   * Render all ripple effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderRipples(ctx) {
    this.ripples.forEach(ripple => {
      ctx.save();
      ctx.strokeStyle = ripple.color;
      ctx.globalAlpha = ripple.alpha * 0.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner ripple
      ctx.globalAlpha = ripple.alpha * 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  /**
   * Render all halo effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderHalos(ctx) {
    this.halos.forEach(halo => {
      ctx.save();
      
      // Outer glow
      const gradient = ctx.createRadialGradient(
        halo.x, halo.y, 0,
        halo.x, halo.y, halo.radius
      );
      gradient.addColorStop(0, halo.color + Math.floor(halo.alpha * 100).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.5, halo.color + Math.floor(halo.alpha * 50).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, halo.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(halo.x, halo.y, halo.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }

  /**
   * Render all particle trails
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderParticleTrails(ctx) {
    this.particleTrails.forEach(particle => {
      ctx.save();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * Render all flow lines
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderFlowLines(ctx) {
    this.flowLines.forEach(line => {
      ctx.save();
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = line.alpha;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Draw animated flow line
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const currentX = line.x1 + dx * line.progress;
      const currentY = line.y1 + dy * line.progress;
      
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      
      // Draw arrow head at current position
      const angle = Math.atan2(dy, dx);
      const arrowSize = 8;
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(
        currentX - arrowSize * Math.cos(angle - Math.PI / 6),
        currentY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(currentX, currentY);
      ctx.lineTo(
        currentX - arrowSize * Math.cos(angle + Math.PI / 6),
        currentY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      
      ctx.restore();
    });
  }

  /**
   * Render all effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    this.renderFlowLines(ctx);
    this.renderRipples(ctx);
    this.renderParticleTrails(ctx);
    this.renderHalos(ctx);
  }

  /**
   * Clear all effects
   */
  clear() {
    this.ripples = [];
    this.halos = [];
    this.particleTrails = [];
    this.flowLines = [];
  }

  /**
   * Get smooth color transition
   * @param {string} fromColor - Start color (hex)
   * @param {string} toColor - End color (hex)
   * @param {number} progress - Transition progress (0-1)
   * @returns {string} Interpolated color
   */
  getColorTransition(fromColor, toColor, progress) {
    const from = this.hexToRgb(fromColor);
    const to = this.hexToRgb(toColor);
    
    const r = Math.round(from.r + (to.r - from.r) * progress);
    const g = Math.round(from.g + (to.g - from.g) * progress);
    const b = Math.round(from.b + (to.b - from.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert hex to RGB
   * @param {string} hex - Hex color
   * @returns {Object} RGB object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
