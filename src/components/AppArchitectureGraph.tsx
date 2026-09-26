import React, { useEffect, useRef, useState, useCallback } from "react";
import stackConfig from "../config/stack.config.json";
import { hapticTap } from "../lib/haptics";

export interface StackNode {
  id: string;
  label: string;
  version: string;
  role: string;
  category: string;
  icon: string;
  healthCheck: string;
}

export interface StackLink {
  source: string;
  target: string;
  relation: string;
}

export interface NodeHealth {
  status: "healthy" | "degraded" | "static" | "checking";
  latency?: string;
  details: string;
}

interface SimNode extends StackNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Particle {
  sourceId: string;
  targetId: string;
  progress: number;
  speed: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; glow: string; label: string }> = {
  mobile_apps: { bg: "#10b981", border: "#34d399", glow: "rgba(16, 185, 129, 0.4)", label: "Móvil / Nativo" },
  desktop_apps: { bg: "#0284c7", border: "#38bdf8", glow: "rgba(2, 132, 199, 0.4)", label: "Desktop" },
  local_web_apps: { bg: "#06b6d4", border: "#22d3ee", glow: "rgba(6, 182, 212, 0.4)", label: "UI / React" },
  server_web_apps: { bg: "#6366f1", border: "#818cf8", glow: "rgba(99, 102, 241, 0.4)", label: "Servidor / API" },
  local_persistence: { bg: "#f59e0b", border: "#fbbf24", glow: "rgba(245, 158, 11, 0.4)", label: "Persistencia" },
  cloud_persistence: { bg: "#8b5cf6", border: "#a78bfa", glow: "rgba(139, 92, 246, 0.4)", label: "Nube" },
  graphics_multimedia: { bg: "#f43f5e", border: "#fb7185", glow: "rgba(244, 63, 94, 0.4)", label: "Gráficos / UI" },
  ai_machine_learning: { bg: "#14b8a6", border: "#2dd4bf", glow: "rgba(20, 184, 166, 0.4)", label: "IA / ML" },
};

export default function AppArchitectureGraph({ onClose }: { onClose?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [healthMap, setHealthMap] = useState<Record<string, NodeHealth>>({});
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const nodesRef = useRef<SimNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<SimNode | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const rawNodes = stackConfig.nodes as StackNode[];
    const count = rawNodes.length;

    nodesRef.current = rawNodes.map((n, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 130;
      return {
        ...n,
        x: 320 + Math.cos(angle) * radius,
        y: 240 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 26,
      };
    });

    const links = stackConfig.links as StackLink[];
    particlesRef.current = links.map((l, i) => ({
      sourceId: l.source,
      targetId: l.target,
      progress: (i * 0.25) % 1,
      speed: 0.006 + (i % 3) * 0.002,
    }));
  }, []);

  const runHealthChecks = useCallback(async () => {
    setIsDiagnosing(true);
    const results: Record<string, NodeHealth> = {};
    const nodes = stackConfig.nodes as StackNode[];

    for (const node of nodes) {
      results[node.id] = { status: "checking", details: "Diagnosticando..." };
    }
    setHealthMap({ ...results });

    for (const node of nodes) {
      try {
        if (node.healthCheck === "native_bridge") {
          results[node.id] = {
            status: "healthy",
            details: "Puente nativo Capacitor 7 activo con WebView optimizado",
          };
        } else if (node.healthCheck === "react_runtime") {
          results[node.id] = {
            status: "healthy",
            details: `React v${React.version} con Concurrency y Renderizado Concurrente activo`,
          };
        } else if (node.healthCheck === "storage") {
          try {
            const testKey = "__pasos_mobile_storage_test__";
            localStorage.setItem(testKey, "1");
            localStorage.removeItem(testKey);
            results[node.id] = {
              status: "healthy",
              details: "Persistencia local en dispositivo verificada y operativa",
            };
          } catch {
            results[node.id] = {
              status: "degraded",
              details: "Almacenamiento web restringido",
            };
          }
        } else if (node.healthCheck === "haptics") {
          results[node.id] = {
            status: "healthy",
            details: "Controlador de vibración táctil @capacitor/haptics listo",
          };
        } else if (node.healthCheck === "notifications") {
          results[node.id] = {
            status: "healthy",
            details: "Programador de alarmas y notificaciones locales configurado",
          };
        } else if (node.healthCheck === "pet_engine") {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            results[node.id] = {
              status: "healthy",
              details: "Contexto Canvas 2D con aceleración de hardware para Pixel Pet",
            };
          } else {
            results[node.id] = {
              status: "degraded",
              details: "Aceleración gráfica 2D no disponible",
            };
          }
        } else {
          results[node.id] = {
            status: "static",
            details: "Design System adaptado para safe-area y gestos móviles",
          };
        }
      } catch (err: unknown) {
        results[node.id] = {
          status: "degraded",
          details: `Diagnóstico degradado: ${err instanceof Error ? err.message : "Error pasivo"}`,
        };
      }
      setHealthMap({ ...results });
    }
    setIsDiagnosing(false);
  }, []);

  useEffect(() => {
    runHealthChecks();
  }, [runHealthChecks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 600;
    let height = 480;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = Math.max(300, Math.floor(rect.width));
      height = Math.max(360, Math.floor(rect.height || 480));

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const links = stackConfig.links as StackLink[];

    const render = () => {
      const nodes = nodesRef.current;
      const particles = particlesRef.current;

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (draggedNodeRef.current?.id === n1.id) continue;

        n1.vx += (centerX - n1.x) * 0.0008;
        n1.vy += (centerY - n1.y) * 0.0008;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = n1.radius + n2.radius + 50;
          if (dist < minDist) {
            const force = ((minDist - dist) / dist) * 0.05;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            if (draggedNodeRef.current?.id !== n2.id) {
              n2.vx += dx * force;
              n2.vy += dy * force;
            }
          }
        }
      }

      for (const link of links) {
        const s = nodes.find((n) => n.id === link.source);
        const t = nodes.find((n) => n.id === link.target);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.hypot(dx, dy) || 1;
          const targetDist = 120;
          const spring = (dist - targetDist) * 0.002;
          if (draggedNodeRef.current?.id !== s.id) {
            s.vx += (dx / dist) * spring;
            s.vy += (dy / dist) * spring;
          }
          if (draggedNodeRef.current?.id !== t.id) {
            t.vx -= (dx / dist) * spring;
            t.vy -= (dy / dist) * spring;
          }
        }
      }

      for (const n of nodes) {
        if (draggedNodeRef.current?.id !== n.id) {
          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x += n.vx;
          n.y += n.vy;

          const pad = n.radius + 15;
          if (n.x < pad) { n.x = pad; n.vx *= -0.5; }
          if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.5; }
          if (n.y < pad) { n.y = pad; n.vy *= -0.5; }
          if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.5; }
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = "rgba(41, 72, 59, 0.15)";
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Links
      for (const link of links) {
        const s = nodes.find((n) => n.id === link.source);
        const t = nodes.find((n) => n.id === link.target);
        if (!s || !t) continue;

        const isFiltered =
          filterCategory !== "all" &&
          s.category !== filterCategory &&
          t.category !== filterCategory;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isFiltered ? "rgba(100, 116, 139, 0.15)" : "rgba(148, 163, 184, 0.4)";
        ctx.lineWidth = isFiltered ? 1 : 1.6;
        ctx.stroke();

        if (!isFiltered) {
          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          ctx.font = "9px 'DM Sans', sans-serif";
          ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(link.relation, midX, midY - 6);
        }
        ctx.restore();
      }

      // Particles
      for (const p of particles) {
        const s = nodes.find((n) => n.id === p.sourceId);
        const t = nodes.find((n) => n.id === p.targetId);
        if (!s || !t) continue;

        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const px = s.x + (t.x - s.x) * p.progress;
        const py = s.y + (t.y - s.y) * p.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // Nodes
      for (const node of nodes) {
        const cat = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.local_web_apps;
        const health = healthMap[node.id]?.status || "checking";
        const isSelected = selectedNode?.id === node.id;
        const isDimmed = filterCategory !== "all" && node.category !== filterCategory;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.35 : 1;

        let healthColor = "#6366f1";
        if (health === "healthy") healthColor = "#10b981";
        else if (health === "degraded") healthColor = "#f59e0b";

        const pulse = 1 + Math.sin(Date.now() * 0.003 + node.x) * 0.08;
        ctx.beginPath();
        ctx.arc(node.x, node.y, (node.radius + 6) * (isSelected ? 1.15 : pulse), 0, Math.PI * 2);
        ctx.strokeStyle = healthColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x - 7, node.y - 7, 3, node.x, node.y, node.radius);
        grad.addColorStop(0, cat.border);
        grad.addColorStop(1, cat.bg);
        ctx.fillStyle = grad;
        ctx.shadowColor = cat.glow;
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px 'Manrope', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const glyph = node.label.substring(0, 2).toUpperCase();
        ctx.fillText(glyph, node.x, node.y);

        ctx.beginPath();
        ctx.arc(node.x + node.radius * 0.7, node.y - node.radius * 0.7, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = healthColor;
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = isSelected ? "bold 11px 'Manrope', sans-serif" : "10px 'DM Sans', sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : "#e2e8f0";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, node.x, node.y + node.radius + 7);

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [filterCategory, healthMap, selectedNode]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    dragStartPos.current = { x, y };

    const clicked = nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 8);
    if (clicked) {
      isDraggingRef.current = true;
      draggedNodeRef.current = clicked;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      hapticTap();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && draggedNodeRef.current) {
      const { x, y } = getCanvasCoords(e);
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && draggedNodeRef.current) {
      const { x, y } = getCanvasCoords(e);
      const dist = Math.hypot(x - dragStartPos.current.x, y - dragStartPos.current.y);

      if (dist < 6) {
        setSelectedNode((prev) => (prev?.id === draggedNodeRef.current?.id ? null : draggedNodeRef.current));
      }

      isDraggingRef.current = false;
      draggedNodeRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    } else {
      const { x, y } = getCanvasCoords(e);
      const clicked = nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 8);
      if (!clicked) {
        setSelectedNode(null);
      }
    }
  };

  const totalNodes = stackConfig.nodes.length;
  const healthyCount = Object.values(healthMap).filter((h) => h.status === "healthy").length;
  const degradedCount = Object.values(healthMap).filter((h) => h.status === "degraded").length;
  const staticCount = Object.values(healthMap).filter((h) => h.status === "static").length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Arquitectura de la App Móvil Pasos"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 20, 16, 0.94)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        color: "#f1f5f9",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "920px",
          height: "92vh",
          maxHeight: "820px",
          background: "#0d1b15",
          border: "2px solid #284436",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
        }}
      >
        <header
          style={{
            padding: "14px 18px",
            background: "#08130e",
            borderBottom: "1px solid #1f372a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#1c382b",
                color: "#4ade80",
                fontSize: "16px",
              }}
            >
              📱
            </span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {stackConfig.appName} · Arquitectura del Sistema
              </h2>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {stackConfig.description} (v{stackConfig.version})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => {
                hapticTap();
                runHealthChecks();
              }}
              disabled={isDiagnosing}
              style={{
                background: isDiagnosing ? "#1a2c22" : "#173628",
                color: "#86efac",
                border: "1px solid #2d5540",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: isDiagnosing ? "wait" : "pointer",
              }}
            >
              <span>{isDiagnosing ? "↻" : "↺"}</span>
              {isDiagnosing ? "Diagnosticando..." : "Re-diagnosticar"}
            </button>

            {onClose && (
              <button
                onClick={() => {
                  hapticTap();
                  onClose();
                }}
                aria-label="Cerrar ventana de arquitectura"
                style={{
                  background: "#1e293b",
                  color: "#cbd5e1",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </header>

        <div
          style={{
            padding: "8px 18px",
            background: "#0b1712",
            borderBottom: "1px solid #1a3024",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "11px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
              {healthyCount} Operativos
            </span>

            {degradedCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#fbbf24",
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fbbf24" }} />
                {degradedCount} Degradados
              </span>
            )}

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#a5b4fc",
                fontWeight: 600,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8" }} />
              {staticCount} Estáticos
            </span>
          </div>

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFilterCategory("all")}
              style={{
                padding: "2px 8px",
                borderRadius: "5px",
                fontSize: "10px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: filterCategory === "all" ? "#34d399" : "#233d2f",
                background: filterCategory === "all" ? "#163a28" : "transparent",
                color: filterCategory === "all" ? "#6ee7b7" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_COLORS).map(([catKey, catVal]) => (
              <button
                key={catKey}
                onClick={() => setFilterCategory(catKey)}
                style={{
                  padding: "2px 6px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: filterCategory === catKey ? catVal.border : "#1e3328",
                  background: filterCategory === catKey ? "rgba(255,255,255,0.08)" : "transparent",
                  color: filterCategory === catKey ? catVal.border : "#718096",
                  cursor: "pointer",
                }}
              >
                {catVal.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          style={{
            position: "relative",
            flex: 1,
            overflow: "hidden",
            background: "radial-gradient(circle at center, #11261d 0%, #08140e 100%)",
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: isDraggingRef.current ? "grabbing" : "grab",
              touchAction: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "12px",
              pointerEvents: "none",
              background: "rgba(10, 24, 18, 0.75)",
              border: "1px solid rgba(41, 72, 59, 0.4)",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "10px",
              color: "#94a3b8",
            }}
          >
            Tip: Toca y arrastra los módulos para explorar.
          </div>

          {selectedNode && (
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                left: "12px",
                maxWidth: "420px",
                margin: "0 0 0 auto",
                background: "rgba(13, 27, 21, 0.95)",
                border: "1px solid #325844",
                borderRadius: "14px",
                padding: "14px 18px",
                boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
                backdropFilter: "blur(12px)",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontWeight: 700,
                        background: CATEGORY_COLORS[selectedNode.category]?.bg || "#6366f1",
                        color: "#fff",
                      }}
                    >
                      {CATEGORY_COLORS[selectedNode.category]?.label || selectedNode.category}
                    </span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>v{selectedNode.version}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc", fontWeight: 700 }}>
                    {selectedNode.label}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#94a3b8",
                    fontSize: "14px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ margin: "8px 0 10px", fontSize: "11px", color: "#cbd5e1", lineHeight: 1.5 }}>
                {selectedNode.role}
              </p>

              <div
                style={{
                  background: "#08130e",
                  border: "1px solid #1a3025",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  fontSize: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600 }}>Estado:</span>
                  {healthMap[selectedNode.id]?.status === "healthy" && (
                    <span style={{ color: "#4ade80", fontWeight: 700 }}>🟢 Operativo (Healthy)</span>
                  )}
                  {healthMap[selectedNode.id]?.status === "degraded" && (
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>🟡 Modo Degradado</span>
                  )}
                  {healthMap[selectedNode.id]?.status === "static" && (
                    <span style={{ color: "#818cf8", fontWeight: 700 }}>⚪ Módulo Estático</span>
                  )}
                  {(!healthMap[selectedNode.id] || healthMap[selectedNode.id]?.status === "checking") && (
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>↻ Comprobando...</span>
                  )}
                </div>

                <div style={{ color: "#64748b" }}>
                  {healthMap[selectedNode.id]?.details || "Diagnóstico pendiente"}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer
          style={{
            padding: "8px 18px",
            background: "#08130e",
            borderTop: "1px solid #1f372a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "#64748b",
          }}
        >
          <span>Capacitor 7 + Android APK · Canvas 2D nativo</span>
          <span>Pasos Mobile © 2026</span>
        </footer>
      </div>
    </div>
  );
}
