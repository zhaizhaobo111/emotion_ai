"use client";
import { useEffect, useRef } from "react";

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient orbs
      const orbs = [
        { x: 0.3, y: 0.3, r: 300, color: "rgba(59, 130, 246, 0.08)", speed: 1 },
        { x: 0.7, y: 0.6, r: 250, color: "rgba(139, 92, 246, 0.06)", speed: 1.3 },
        { x: 0.5, y: 0.8, r: 200, color: "rgba(6, 182, 212, 0.05)", speed: 0.8 },
      ];

      orbs.forEach((orb) => {
        const ox = (orb.x + Math.sin(time * orb.speed) * 0.1) * canvas.width;
        const oy = (orb.y + Math.cos(time * orb.speed * 0.7) * 0.1) * canvas.height;
        const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
