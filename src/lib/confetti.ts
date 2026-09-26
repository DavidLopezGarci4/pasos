import { hapticSuccess } from "./haptics";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

const PASOS_PALETTE = [
  "#416850", // Forest Green
  "#729879", // Sage
  "#f4be5e", // Gold / Star
  "#b96e53", // Coral
  "#fbefe4", // Peach
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#ec4899", // Rose
];

let activeCanvas: HTMLCanvasElement | null = null;
let animationId: number | null = null;

export function fireConfetti(options?: {
  count?: number;
  origin?: { x: number; y: number };
  spread?: number;
}) {
  try {
    hapticSuccess();
  } catch {
    // Ignore if haptics unavailable
  }

  const count = options?.count ?? 65;
  const originX = options?.origin?.x ?? window.innerWidth / 2;
  const originY = options?.origin?.y ?? window.innerHeight * 0.45;

  let canvas = activeCanvas;
  if (!canvas || !document.body.contains(canvas)) {
    canvas = document.createElement("canvas");
    canvas.id = "pasos-confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);
    activeCanvas = canvas;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * (Math.random() * 1.6 + 0.2)) + Math.PI; // Launch upwards
    const speed = Math.random() * 12 + 6;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
      vy: Math.sin(angle) * speed - 4,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      color: PASOS_PALETTE[Math.floor(Math.random() * PASOS_PALETTE.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      wobble: Math.random() * Math.PI,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      opacity: 1,
      shape: Math.random() > 0.3 ? "rect" : "circle",
    });
  }

  const gravity = 0.38;
  const drag = 0.985;
  const startTime = performance.now();

  function render(time: number) {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let aliveCount = 0;
    const elapsed = (time - startTime) / 1000;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= drag;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      // Fade out after 1.8 seconds or when falling
      if (elapsed > 1.8) {
        p.opacity -= 0.025;
      }

      if (p.opacity > 0 && p.y < window.innerHeight + 50) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        const scaleX = Math.cos(p.wobble);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.5 * Math.abs(scaleX), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2 * scaleX, -p.h / 2, p.w * scaleX, p.h);
        }

        ctx.restore();
      }
    }

    if (aliveCount > 0) {
      animationId = requestAnimationFrame(render);
    } else {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      activeCanvas = null;
      animationId = null;
    }
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(render);
}
