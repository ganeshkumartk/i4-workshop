'use client';
import { useEffect, useRef } from 'react';

export default function AtelierBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      draw();
    };

    const draw = () => {
      // Base warm white paper/alabaster
      ctx.fillStyle = '#F9F8F6';
      ctx.fillRect(0, 0, width, height);

      // Create a very subtle, soft gradient (like light hitting a wall)
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.3, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(1, '#F2EFEA');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add a static, microscopic grain texture
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 6; // Very subtle noise
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ background: '#F9F8F6' }}
    />
  );
}
