'use client';
import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

interface Props {
  theme: 'light' | 'dark';
  intensity?: number; // 0.0 to 1.0 (e.g., based on participant count or activity phase)
}

const PALETTES = {
  dark: {
    bg: '#0B0B0B',
    fade: 'rgba(11, 11, 11, 0.1)',
    colors: ['#3B82F6', '#BEF264', '#8B5CF6', '#10B981'],
  },
  light: {
    bg: '#F8FAFC',
    fade: 'rgba(248, 250, 252, 0.1)',
    colors: ['#1E3A8A', '#047857', '#701A75', '#B45309'],
  }
};

class Agent {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  color: string;
  size: number;
  maxSpeed: number;

  constructor(width: number, height: number, colors: string[], intensity: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.random() * 2 + 1;
    this.maxSpeed = (Math.random() * 1.5 + 0.5) * (1 + intensity * 2);
  }

  update(angle: number, intensity: number) {
    this.vx += Math.cos(angle) * 0.1;
    this.vy += Math.sin(angle) * 0.1;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const currentMaxSpeed = this.maxSpeed * (1 + intensity);

    if (speed > currentMaxSpeed) {
      this.vx = (this.vx / speed) * currentMaxSpeed;
      this.vy = (this.vy / speed) * currentMaxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  wrap(width: number, height: number) {
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
}

export default function LivingBackground({ theme, intensity = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const noise3D = createNoise3D();
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Handle resize
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Fill initial background
      ctx.fillStyle = PALETTES[theme].bg;
      ctx.fillRect(0, 0, width, height);
    };
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for interactivity
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize agents
    const numAgents = Math.min(width * height / 4000, 400); // Scale agent count based on screen size
    let agents: Agent[] = [];
    const palette = PALETTES[theme];
    
    for (let i = 0; i < numAgents; i++) {
      agents.push(new Agent(width, height, palette.colors, intensity));
    }

    let zOff = 0;

    const render = () => {
      // Create trailing effect
      ctx.fillStyle = palette.fade;
      ctx.fillRect(0, 0, width, height);

      const noiseScale = 0.002;
      const timeSpeed = 0.001 + (intensity * 0.005);
      zOff += timeSpeed;

      agents.forEach(agent => {
        // Calculate flow field angle
        let angle = noise3D(agent.x * noiseScale, agent.y * noiseScale, zOff) * Math.PI * 4;

        // Interactive mouse repulsion
        const dx = agent.x - mouseRef.current.x;
        const dy = agent.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          const repulseAngle = Math.atan2(dy, dx);
          // Blend flow field angle with repulsion
          angle = angle * (1 - force) + repulseAngle * force * 2;
        }

        agent.update(angle, intensity);
        agent.wrap(width, height);
        
        // Dynamic opacity based on speed and intensity
        ctx.globalAlpha = 0.4 + (intensity * 0.4);
        agent.draw(ctx);
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ background: PALETTES[theme].bg }}
    />
  );
}
