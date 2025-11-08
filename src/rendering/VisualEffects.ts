interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  speed: number;
  createdAt: number;
}

interface Halo {
  x: number;
  y: number;
  color: string;
  alpha: number;
  radius: number;
  maxRadius: number;
  duration: number;
  createdAt: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  lifetime: number;
  createdAt: number;
}

interface FlowLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;
  progress: number;
  duration: number;
  createdAt: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * VisualEffects class - Manages visual effects for the simulation
 * Provides ripples, halos, particle trails, and flow lines
 */
export class VisualEffects {
  private ripples: Ripple[] = [];
  private halos: Halo[] = [];
  private particleTrails: Particle[] = [];
  private flowLines: FlowLine[] = [];
  private readonly maxRipples: number = 50;
  private readonly maxParticles: number = 1000;
  private readonly maxFlowLines: number = 100;

  addRipple(x: number, y: number, color: string = '#E74C3C', maxRadius: number = 100): void {
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

  addHalo(x: number, y: number, color: string = '#F39C12', duration: number = 1000): void {
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

  addParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string = '#4A90E2',
    lifetime: number = 2000
  ): void {
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

  addFlowLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = '#ADB5BD',
    duration: number = 1000
  ): void {
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

  update(deltaTime: number): void {
    const now = Date.now();
    
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed * deltaTime / 16;
      ripple.alpha = 1.0 - (ripple.radius / ripple.maxRadius);
      return ripple.radius < ripple.maxRadius;
    });
    
    this.halos = this.halos.filter(halo => {
      const elapsed = now - halo.createdAt;
      const progress = elapsed / halo.duration;
      halo.alpha = 1.0 - progress;
      halo.radius = halo.maxRadius * (0.5 + 0.5 * Math.sin(progress * Math.PI * 4));
      return elapsed < halo.duration;
    });
    
    this.particleTrails = this.particleTrails.filter(particle => {
      particle.x += particle.vx * deltaTime / 16;
      particle.y += particle.vy * deltaTime / 16;
      const elapsed = now - particle.createdAt;
      particle.alpha = 1.0 - (elapsed / particle.lifetime);
      particle.size = 3 * particle.alpha;
      return elapsed < particle.lifetime;
    });
    
    this.flowLines = this.flowLines.filter(line => {
      const elapsed = now - line.createdAt;
      line.progress = elapsed / line.duration;
      line.alpha = 0.6 * (1.0 - line.progress);
      return elapsed < line.duration;
    });
  }

  renderRipples(ctx: CanvasRenderingContext2D): void {
    this.ripples.forEach(ripple => {
      ctx.save();
      ctx.strokeStyle = ripple.color;
      ctx.globalAlpha = ripple.alpha * 0.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.globalAlpha = ripple.alpha * 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  renderHalos(ctx: CanvasRenderingContext2D): void {
    this.halos.forEach(halo => {
      ctx.save();
      
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

  renderParticleTrails(ctx: CanvasRenderingContext2D): void {
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

  renderFlowLines(ctx: CanvasRenderingContext2D): void {
    this.flowLines.forEach(line => {
      ctx.save();
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = line.alpha;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const currentX = line.x1 + dx * line.progress;
      const currentY = line.y1 + dy * line.progress;
      
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      
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

  render(ctx: CanvasRenderingContext2D): void {
    this.renderFlowLines(ctx);
    this.renderRipples(ctx);
    this.renderParticleTrails(ctx);
    this.renderHalos(ctx);
  }

  clear(): void {
    this.ripples = [];
    this.halos = [];
    this.particleTrails = [];
    this.flowLines = [];
  }

  getColorTransition(fromColor: string, toColor: string, progress: number): string {
    const from = this.hexToRgb(fromColor);
    const to = this.hexToRgb(toColor);
    
    const r = Math.round(from.r + (to.r - from.r) * progress);
    const g = Math.round(from.g + (to.g - from.g) * progress);
    const b = Math.round(from.b + (to.b - from.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
