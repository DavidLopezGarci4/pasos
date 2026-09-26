import React, { useState } from "react";
import type { Family, Member, FamilyProject } from "../lib/model";
import { saveStoredFamily } from "../lib/mobile-storage";
import { hapticSuccess, hapticTap } from "../lib/haptics";
import { playLevelUp, playTap } from "../lib/sound";
import { Icon } from "./icon";

interface FamilyProjectViewProps {
  family: Family;
  user: Member;
  onUpdate: () => void;
}

export function FamilyProjectView({ family, user, onUpdate }: FamilyProjectViewProps) {
  const parent = user.role === "parent";

  // Ensure default project exists if empty
  if (!family.projects || family.projects.length === 0) {
    family.projects = [
      {
        id: "proj-treehouse",
        title: "Construir la Cabaña del Árbol 8-Bits",
        description: "Cada rutina y tarea que completamos aporta un ladrillo de madera a nuestro proyecto compartido.",
        rewardTitle: "Tarde de cine y pizza casera en familia",
        targetPoints: 60,
        currentPoints: 15,
        active: true,
        contributions: family.children.map((c, i) => ({
          memberId: c.id,
          memberName: c.name,
          points: (i + 1) * 5,
        })),
        startedAt: new Date().toISOString(),
      },
    ];
  }

  const activeProject = family.projects.find((p) => p.active && !p.completedAt) || family.projects[0];
  const isCompleted = activeProject.currentPoints >= activeProject.targetPoints;
  const pct = Math.min(100, Math.round((activeProject.currentPoints / activeProject.targetPoints) * 100));

  const [showNewForm, setShowNewForm] = useState(false);

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("titulo") || "").trim();
    const description = String(form.get("descripcion") || "").trim();
    const rewardTitle = String(form.get("premio") || "").trim();
    const targetPoints = Number(form.get("puntos") || 50);

    const newProj: FamilyProject = {
      id: "proj-" + Date.now(),
      title,
      description,
      rewardTitle,
      targetPoints,
      currentPoints: 0,
      active: true,
      contributions: [],
      startedAt: new Date().toISOString(),
    };

    if (family.projects) {
      family.projects.forEach((p) => (p.active = false));
      family.projects.unshift(newProj);
    } else {
      family.projects = [newProj];
    }

    saveStoredFamily({ ...family });
    hapticSuccess();
    playLevelUp();
    onUpdate();
    setShowNewForm(false);
  };

  return (
    <div className="family-project-container">
      <div className="page-heading">
        <div>
          <div className="date-label">METAS COOPERATIVAS</div>
          <h1>El Proyecto Familiar</h1>
          <p>Un reto común donde todo el esfuerzo suma. Sin reproches, en equipo.</p>
        </div>
        <div className="page-flower">🌳</div>
      </div>

      {/* Main Project Card */}
      <section
        className="panel"
        style={{
          background: "radial-gradient(circle at top, rgba(22, 60, 42, 0.9) 0%, rgba(8, 24, 17, 0.95) 100%)",
          border: "1px solid rgba(74, 210, 109, 0.3)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          borderRadius: 20,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#4ad26d",
                background: "rgba(74, 210, 109, 0.15)",
                padding: "4px 10px",
                borderRadius: 8,
              }}
            >
              {isCompleted ? "¡Hito Alcanzado!" : "Proyecto en Construcción"}
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginTop: 8, marginBottom: 4 }}>
              {activeProject.title}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0, maxWidth: 500 }}>
              {activeProject.description}
            </p>
          </div>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 14,
              padding: "10px 16px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>
              Recompensa Familiar
            </div>
            <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700 }}>
              🎁 {activeProject.rewardTitle}
            </div>
          </div>
        </div>

        {/* 8-Bit Pixel Treehouse Illustration */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--edge)",
            borderRadius: 16,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <svg viewBox="0 0 48 36" width={192} height={144} style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
            {/* Ground Soil */}
            <rect x="0" y="32" width="48" height="4" fill="#2d1d0e" />
            <rect x="0" y="31" width="48" height="1" fill="#4d7c0f" />

            {/* Tree Trunk Base */}
            <rect x="20" y="18" width="8" height="14" fill="#5c3818" />
            <rect x="22" y="20" width="2" height="12" fill="#3d240d" />

            {/* Stage 1: Logs on the ground (pct >= 0) */}
            <rect x="8" y="28" width="6" height="3" fill="#78491f" />
            <rect x="34" y="29" width="6" height="2" fill="#78491f" />

            {/* Stage 2: Ladder and Support Beams (pct >= 25) */}
            {pct >= 25 && (
              <>
                <rect x="18" y="20" width="2" height="12" fill="#a16207" />
                <rect x="17" y="22" width="4" height="1" fill="#ca8a04" />
                <rect x="17" y="25" width="4" height="1" fill="#ca8a04" />
                <rect x="17" y="28" width="4" height="1" fill="#ca8a04" />
              </>
            )}

            {/* Stage 3: Wooden Platform and Foliage (pct >= 50) */}
            {pct >= 50 && (
              <>
                {/* Green Leaves Background */}
                <rect x="8" y="6" width="32" height="12" fill="#15803d" />
                <rect x="12" y="3" width="24" height="6" fill="#16a34a" />
                {/* Platform */}
                <rect x="12" y="17" width="24" height="3" fill="#854d0e" />
                <rect x="12" y="14" width="24" height="1" fill="#a16207" />
                <rect x="14" y="15" width="1" height="2" fill="#a16207" />
                <rect x="22" y="15" width="1" height="2" fill="#a16207" />
                <rect x="30" y="15" width="1" height="2" fill="#a16207" />
              </>
            )}

            {/* Stage 4: Cabin Walls and Window (pct >= 75) */}
            {pct >= 75 && (
              <>
                <rect x="16" y="9" width="16" height="8" fill="#b45309" />
                <rect x="22" y="11" width="4" height="4" fill="#fef08a" />
                <rect x="24" y="11" width="1" height="4" fill="#78350f" />
                <rect x="22" y="13" width="4" height="1" fill="#78350f" />
                {/* Roof */}
                <polygon points="14,9 24,3 34,9" fill="#991b1b" />
              </>
            )}

            {/* Stage 5: Flag, Lantern, and Sparkles (pct >= 100) */}
            {pct >= 100 && (
              <>
                <rect x="24" y="0" width="1" height="4" fill="#e2e8f0" />
                <polygon points="25,0 29,1.5 25,3" fill="#ef4444" />
                <rect x="13" y="17" width="2" height="3" fill="#facc15" />
                {/* Confetti pixels */}
                <rect x="6" y="4" width="1" height="1" fill="#f43f5e" />
                <rect x="42" y="6" width="1" height="1" fill="#38bdf8" />
                <rect x="38" y="2" width="1" height="1" fill="#eab308" />
                <rect x="4" y="12" width="1" height="1" fill="#a855f7" />
              </>
            )}
          </svg>

          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            {pct === 0
              ? "Reuniendo los primeros materiales..."
              : pct < 50
              ? "Construyendo las vigas maestras y la escalera..."
              : pct < 100
              ? "¡Levantando las paredes y el tejado de la cabaña!"
              : "⭐ ¡Cabaña del Árbol completada! ¡A celebrar en familia!"}
          </span>
        </div>

        {/* Progress Bar & Counter */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "var(--ink)" }}>
              Progreso acumulado: <strong>{activeProject.currentPoints}</strong> / {activeProject.targetPoints} pasos
            </span>
            <span style={{ color: "#4ad26d" }}>{pct}%</span>
          </div>

          <div
            style={{
              height: 16,
              background: "rgba(0,0,0,0.4)",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #10b981 0%, #4ad26d 100%)",
                borderRadius: 8,
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        {/* Member Contributions Breakdown */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
            Aportaciones de la Familia
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {activeProject.contributions.length > 0 ? (
              activeProject.contributions.map((c) => (
                <div
                  key={c.memberId}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--edge)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{c.memberName}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: "var(--green)" }}>+{c.points}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>
                Cada tarea aprobada hoy sumará puntos automáticamente a este hito común.
              </p>
            )}
          </div>
        </div>

        {/* Action to create new project (Parents only) */}
        {parent && (
          <div style={{ borderTop: "1px dashed var(--edge)", paddingTop: 16 }}>
            {!showNewForm ? (
              <button
                type="button"
                className="button secondary small"
                onClick={() => {
                  hapticTap();
                  playTap();
                  setShowNewForm(true);
                }}
              >
                + Proponer un nuevo proyecto familiar
              </button>
            ) : (
              <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h4 style={{ margin: 0, color: "var(--ink)" }}>Nuevo Proyecto Familiar Compartido</h4>
                <div className="form-grid">
                  <label>
                    Título del reto
                    <input name="titulo" placeholder="Ej: La Expedición a la Colina" required maxLength={60} />
                  </label>
                  <label>
                    Pasos / Puntos requeridos
                    <input name="puntos" type="number" min="20" max="500" defaultValue="50" required />
                  </label>
                </div>
                <label>
                  Descripción o motivo
                  <input name="descripcion" placeholder="Ej: Sumamos esfuerzos diarios para nuestra salida en bici" required />
                </label>
                <label>
                  Premio / Celebración familiar
                  <input name="premio" placeholder="Ej: Excursión en bicicleta con picnic" required />
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="button primary small">
                    Activar reto familiar
                  </button>
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={() => setShowNewForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
