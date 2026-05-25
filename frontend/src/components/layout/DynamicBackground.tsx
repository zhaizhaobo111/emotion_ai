"use client";
import { useEffect, useRef } from "react";

// 花瓣粒子
interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const petals: Petal[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 初始化花瓣
    for (let i = 0; i < 15; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 4 + Math.random() * 8,
        speedY: 0.3 + Math.random() * 0.6,
        speedX: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }

    // 画一个花瓣形状
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.4, p.size, -p.size * 0.2, p.size, 0);
      ctx.bezierCurveTo(p.size, p.size * 0.2, p.size * 0.5, p.size * 0.4, 0, 0);
      ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 粉色渐变光晕
      const orbs = [
        { x: 0.3, y: 0.3, r: 300, color: "rgba(244, 114, 182, 0.08)", speed: 1 },
        { x: 0.7, y: 0.6, r: 250, color: "rgba(236, 72, 153, 0.06)", speed: 1.3 },
        { x: 0.5, y: 0.8, r: 200, color: "rgba(253, 164, 175, 0.05)", speed: 0.8 },
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

      // 更新和绘制花瓣
      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 2 + p.x * 0.01) * 0.3;
        p.rotation += p.rotationSpeed;

        // 飘出屏幕后重置到顶部
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        drawPetal(p);
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
      style={{ opacity: 0.7 }}
    />
  );
}
