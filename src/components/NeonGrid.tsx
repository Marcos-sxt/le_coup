import { useEffect, useRef } from "react";

const NeonGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 60;
      const perspective = 0.7;

      // Horizontal lines with perspective
      for (let y = canvas.height * 0.5; y < canvas.height; y += spacing * perspective) {
        const progress = (y - canvas.height * 0.5) / (canvas.height * 0.5);
        const alpha = progress * 0.25;
        ctx.strokeStyle = `hsla(185, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + (offset % spacing) * perspective);
        ctx.lineTo(canvas.width, y + (offset % spacing) * perspective);
        ctx.stroke();
      }

      // Vertical lines converging
      const vanishX = canvas.width / 2;
      const vanishY = canvas.height * 0.5;
      for (let i = -20; i <= 20; i++) {
        const bottomX = vanishX + i * spacing * 2;
        const alpha = Math.max(0, 0.15 - Math.abs(i) * 0.008);
        ctx.strokeStyle = `hsla(185, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();
      }

      // Ambient glow at horizon
      const gradient = ctx.createRadialGradient(
        vanishX, vanishY, 0,
        vanishX, vanishY, canvas.width * 0.4
      );
      gradient.addColorStop(0, "hsla(185, 100%, 50%, 0.08)");
      gradient.addColorStop(0.5, "hsla(300, 100%, 50%, 0.03)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      offset += 0.5;
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
      style={{ opacity: 0.8 }}
    />
  );
};

export default NeonGrid;
