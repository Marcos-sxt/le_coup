import { useEffect, useRef } from "react";

/**
 * Atmospheric forest fog background — replaces the cyberpunk grid.
 * Renders layered fog wisps, floating particles and a subtle vignette.
 */
const ForestFog = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Persistent particles
    const particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background gradient — deep forest floor
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "hsl(150, 18%, 5%)");
      bg.addColorStop(0.4, "hsl(160, 20%, 4%)");
      bg.addColorStop(0.7, "hsl(150, 15%, 3%)");
      bg.addColorStop(1, "hsl(160, 20%, 2%)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Fog wisps
      for (let i = 0; i < 5; i++) {
        const fogY = h * (0.3 + i * 0.12);
        const offsetX = Math.sin(time * 0.0003 + i * 1.5) * w * 0.08;
        const fogGrad = ctx.createRadialGradient(
          w / 2 + offsetX, fogY, 0,
          w / 2 + offsetX, fogY, w * 0.5
        );
        fogGrad.addColorStop(0, `hsla(140, 20%, 35%, ${0.03 - i * 0.004})`);
        fogGrad.addColorStop(0.5, `hsla(140, 15%, 30%, ${0.015 - i * 0.002})`);
        fogGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Central spectral glow — like a distant window/portal
      const centerGlow = ctx.createRadialGradient(
        w / 2, h * 0.45, 0,
        w / 2, h * 0.45, w * 0.35
      );
      centerGlow.addColorStop(0, "hsla(145, 40%, 30%, 0.06)");
      centerGlow.addColorStop(0.4, "hsla(140, 30%, 25%, 0.03)");
      centerGlow.addColorStop(0.8, "hsla(275, 30%, 25%, 0.01)");
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      // Floating dust particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time * 0.001 + p.y * 0.01) * 0.3;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const flicker = 0.7 + Math.sin(time * 0.002 + p.x) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x % w, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(140, 30%, 55%, ${p.opacity * flicker})`;
        ctx.fill();
      });

      // Vignette
      const vignette = ctx.createRadialGradient(
        w / 2, h / 2, w * 0.25,
        w / 2, h / 2, w * 0.75
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(0.7, "hsla(160, 20%, 4%, 0.3)");
      vignette.addColorStop(1, "hsla(160, 20%, 4%, 0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      time += 16;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

export default ForestFog;
