import React, { useState, lazy, Suspense } from "react";
import type { Snapshot, Child, Task, Reward, Family, Member } from "../lib/model";
import {
  advice,
  dateLabel,
  dayKey,
  statusFor,
  taskChildIds,
  taskRequest,
  taskStreak,
  taskLibrary,
} from "../lib/model";
import {
  addPoints,
  submitTask,
  reviewRequest,
  editTask,
  deleteTask,
  editReward,
  deleteReward,
  resetChild,
  deleteChild,
} from "../lib/domain";
import {
  saveStoredFamily,
  setActiveUser,
  exportFamilyBackup,
  importFamilyBackup,
  saveDiskBackupSnapshot,
  getStoredUsers,
  saveStoredUsers,
} from "../lib/mobile-storage";
import { Share } from "@capacitor/share";
import { hapticSuccess, hapticTap, hapticWarning, isHapticsEnabled, setHapticsEnabled, testHaptic } from "../lib/haptics";
import { showToast } from "./toast";
import { PinModal } from "./pin-modal";
import { AboutModal } from "./about-modal";
import { fireConfetti } from "../lib/confetti";
import { Brand, Garden, Icon } from "./icon";
import { PixelPet } from "./pixel-pet";
import { PetView } from "./pet-modal";
import { FAQView } from "./faq-view";
import { RoutineRunner } from "./routine-runner";
import { FamilyProjectView } from "./family-project-view";
import { playTap, playTaskDone, isSoundMuted, toggleSoundMuted } from "../lib/sound";
import { setScreenLockSetting } from "../lib/screen-lock";

const AppArchitectureGraph = lazy(() => import("./AppArchitectureGraph"));

type View = "home" | "tasks" | "rewards" | "requests" | "family" | "pet" | "project" | "advice" | "faq" | "settings";

export function Portal({
  snapshot,
  onUpdate,
}: {
  snapshot: Snapshot;
  onUpdate: () => void;
}) {
  const [view, setView] = useState<View>(() => {
    if (window.location.hash.includes("pet")) return "pet";
    if (window.location.hash.includes("routines")) return "tasks";
    return "home";
  });

  React.useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes("pet")) setView("pet");
      if (window.location.hash.includes("routines")) setView("tasks");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  const [showTechStack, setShowTechStack] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [activeRoutineChild, setActiveRoutineChild] = useState<Child | null>(null);
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"verify" | "create">("verify");
  const [pinTargetUser, setPinTargetUser] = useState<Member | null>(null);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const restoreFileRef = React.useRef<HTMLInputElement>(null);

  const { family, user, members, today } = snapshot;
  const parent = user.role === "parent";

  const handleRequestSwitchUser = (target: Member) => {
    setShowUserSwitcher(false);
    if (target.id === user.id) return;

    if (target.role === "parent") {
      setPinTargetUser(target);
      setPinModalMode("verify");
      setPinModalOpen(true);
    } else {
      setActiveUser(target);
      hapticSuccess();
      onUpdate();
    }
  };

  const handlePinSuccess = (enteredPin: string) => {
    if (pinModalMode === "verify") {
      if (pinTargetUser) {
        setActiveUser(pinTargetUser);
        setPinTargetUser(null);
      }
      setPinModalOpen(false);
      hapticSuccess();
      onUpdate();
    } else if (pinModalMode === "create") {
      family.settings.adultPin = enteredPin;
      saveStoredFamily({ ...family });
      setPinModalOpen(false);
      hapticSuccess();
      showToast("¡PIN de control parental actualizado correctamente!", "success");
      onUpdate();
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || "");
        const res = importFamilyBackup(text);
        if (res.success) {
          hapticSuccess();
          fireConfetti({ count: 70 });
          showToast("¡Copia de seguridad restaurada correctamente con éxito!", "success");
          onUpdate();
        } else {
          throw new Error(res.error || "Archivo no compatible.");
        }
      } catch (err: unknown) {
        hapticWarning();
        showToast(err instanceof Error ? err.message : "Error al restaurar archivo.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveDiskSnapshot = async () => {
    try {
      const res = await saveDiskBackupSnapshot();
      if (res.success) {
        hapticSuccess();
        showToast("¡Copia guardada en Documents/Pasos!", "success");
      } else {
        throw new Error(res.error || "No se pudo guardar");
      }
    } catch (err: unknown) {
      hapticWarning();
      showToast("Error al guardar copia en disco: " + (err instanceof Error ? err.message : ""), "error");
    }
  };

  const visibleChildren = parent
    ? family.children
    : family.children.filter((c) => c.id === user.id);

  const visibleTasks = parent
    ? family.tasks
    : family.tasks.filter((t) => taskChildIds(t).includes(user.id));

  const visibleEntries = parent
    ? family.entries
    : family.entries.filter((e) => e.childId === user.id);

  const handleLogout = () => {
    hapticTap();
    setActiveUser(null);
    onUpdate();
  };

  const handleAddPoints = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const childId = String(form.get("childId") || "");
    const delta = Number(form.get("delta") || 0);
    const title = String(form.get("motivo") || "").trim();

    try {
      const child = family.children.find((c) => c.id === childId);
      if (!child) throw new Error("Perfil no encontrado");
      addPoints(family, child, delta, title, user);
      saveStoredFamily({ ...family });
      hapticSuccess();
      showToast(`¡Puntos registrados correctamente (${delta > 0 ? "+" + delta : delta})!`, "success");
      onUpdate();
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al registrar puntos", "error");
    }
  };

  const handleAddChild = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("nombre") || "").trim();
    const age = Number(form.get("edad") || 8);
    const avatar = String(form.get("avatar") || "🦊");
    const goal = String(form.get("meta") || "Crecer con autonomía").trim();

    const newChild: Child = {
      id: "child-" + Date.now(),
      name,
      age,
      avatar,
      score: 50,
      balance: 0,
      goal,
      level: 1,
      xp: 0,
      xpToNext: 50,
      pet: null,
    };

    family.children.push(newChild);
    saveStoredFamily({ ...family });

    const existingUsers = getStoredUsers();
    if (!existingUsers.some((u) => u.id === newChild.id)) {
      saveStoredUsers([...existingUsers, { id: newChild.id, name: newChild.name, role: "child" }]);
    }

    hapticSuccess();
    showToast(`¡Perfil de ${newChild.name} añadido a la familia!`, "success");
    onUpdate();
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteChild = (childId: string) => {
    if (!confirm("¿Seguro que deseas eliminar este perfil?")) return;
    try {
      deleteChild(family, childId, user);
      saveStoredFamily({ ...family });
      const remainingUsers = getStoredUsers().filter((u) => u.id !== childId);
      saveStoredUsers(remainingUsers);
      hapticSuccess();
      showToast("Perfil eliminado correctamente", "info");
      onUpdate();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al eliminar perfil", "error");
    }
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("titulo") || "").trim();
    const points = Number(form.get("puntos") || 5);
    const frequency = String(form.get("frecuencia") || "daily") as "daily" | "once";
    const cue = String(form.get("senal") || "Cuando llegue el momento acordado").trim();
    const firstStep = String(form.get("primerPaso") || "Empezar").trim();
    const autoApprove = form.get("autoAprobar") === "on";
    const selectedChildIds = form.getAll("childIds").map(String);

    const childIds = selectedChildIds.length ? selectedChildIds : family.children.map((c) => c.id);

    const newTask: Task = {
      id: "task-" + Date.now(),
      title,
      points,
      frequency,
      cue,
      firstStep,
      autoApprove,
      childIds,
      childId: childIds[0] || "",
      active: true,
      checklist: [],
    };

    family.tasks.push(newTask);
    saveStoredFamily({ ...family });
    hapticSuccess();
    onUpdate();
    (e.target as HTMLFormElement).reset();
  };

  const handleAddReward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("titulo") || "").trim();
    const description = String(form.get("descripcion") || "").trim();
    const cost = Number(form.get("puntos") || 10);
    const emoji = String(form.get("emoji") || "🎁").trim();

    const newReward: Reward = {
      id: "reward-" + Date.now(),
      title,
      description,
      cost,
      emoji,
      active: true,
    };

    family.rewards.push(newReward);
    saveStoredFamily({ ...family });
    hapticSuccess();
    onUpdate();
    (e.target as HTMLFormElement).reset();
  };

  const handleCompleteTask = (taskId: string, childId?: string) => {
    try {
      submitTask(family, taskId, user, parent, childId);
      saveStoredFamily({ ...family });
      hapticSuccess();
      playTaskDone();
      onUpdate();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al registrar tarea", "error");
    }
  };

  const handleReviewRequest = (requestId: string, status: "approved" | "rejected" | "delivered", note = "") => {
    try {
      reviewRequest(family, requestId, status, note, user);
      saveStoredFamily({ ...family });
      hapticSuccess();
      if (status === "approved" || status === "delivered") {
        fireConfetti({ count: 55 });
      }
      showToast(
        status === "approved"
          ? "¡Solicitud aprobada con éxito!"
          : status === "delivered"
          ? "¡Recompensa marcada como entregada!"
          : "Solicitud rechazada",
        "info"
      );
      onUpdate();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al revisar solicitud", "error");
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar / Bottom Navigation */}
      <aside className="sidebar">
        <Brand />
        <div className="family-label">
          <div className="family-monogram">{family.name[0]?.toUpperCase() || "P"}</div>
          <span>
            {family.name}
            <small>Portal Familiar Móvil</small>
          </span>
        </div>

        <span className="nav-eyebrow">NAVEGACIÓN</span>
        <nav>
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => {
              hapticTap();
              setView("home");
            }}
          >
            <Icon name="home" /> Panel principal
          </button>
          <button
            className={view === "tasks" ? "active" : ""}
            onClick={() => {
              hapticTap();
              setView("tasks");
            }}
          >
            <Icon name="tasks" /> Rutinas y tareas
          </button>
          <button
            className={view === "rewards" ? "active" : ""}
            onClick={() => {
              hapticTap();
              setView("rewards");
            }}
          >
            <Icon name="gift" /> Recompensas
          </button>
          <button
            className={view === "pet" ? "active" : ""}
            onClick={() => {
              hapticTap();
              playTap();
              setView("pet");
            }}
          >
            <Icon name="pet" /> Mascota 8-Bits
          </button>
          <button
            className={view === "project" ? "active" : ""}
            onClick={() => {
              hapticTap();
              playTap();
              setView("project");
            }}
          >
            <Icon name="tree" /> Proyecto Familiar
          </button>
          {parent && (
            <button
              className={view === "family" ? "active" : ""}
              onClick={() => {
                hapticTap();
                playTap();
                setView("family");
              }}
            >
              <Icon name="family" /> Mi familia
            </button>
          )}
          <button
            className={view === "advice" ? "active" : ""}
            onClick={() => {
              hapticTap();
              playTap();
              setView("advice");
            }}
          >
            <Icon name="book" /> Pautas educativas
          </button>
          <button
            className={view === "faq" ? "active" : ""}
            onClick={() => {
              hapticTap();
              playTap();
              setView("faq");
            }}
          >
            <Icon name="help" /> Guía y FAQ
          </button>
          {parent && (
            <button
              className={view === "settings" ? "active" : ""}
              onClick={() => {
                hapticTap();
                playTap();
                setView("settings");
              }}
            >
              <Icon name="settings" /> Ajustes
            </button>
          )}
        </nav>

        <div className="sidebar-user" style={{ position: "relative" }}>
          <div className="mini-avatar">{user.name[0]?.toUpperCase()}</div>
          <span style={{ cursor: "pointer" }} onClick={() => setShowUserSwitcher(!showUserSwitcher)}>
            <strong>{user.name}</strong>
            <small>{parent ? "Adulto / Padre" : "Hijo"} · Cambiar ▾</small>
          </span>
          <button
            type="button"
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            title="Cambiar de perfil familiar"
            style={{ padding: 6, color: "var(--green)" }}
          >
            <Icon name="family" size={16} />
          </button>
          <button onClick={handleLogout} title="Cerrar sesión" style={{ padding: 6 }}>
            <Icon name="logout" size={16} />
          </button>

          {showUserSwitcher && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#ffffff",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 8,
                marginBottom: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", padding: "4px 8px 8px" }}>
                CAMBIAR PERFIL FAMILIAR
              </div>
              {getStoredUsers().map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleRequestSwitchUser(m)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    border: "none",
                    background: m.id === user.id ? "#edf2e8" : "transparent",
                    color: "var(--ink)",
                    textAlign: "left",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: m.role === "parent" ? "#416850" : "#fbefe4",
                      color: m.role === "parent" ? "#fff" : "#986b45",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {m.name[0]?.toUpperCase()}
                  </span>
                  <span style={{ flex: 1, fontWeight: m.id === user.id ? 700 : 500 }}>{m.name}</span>
                  {m.role === "parent" && <Icon name="lock" size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-shell">
        <header className="topbar">
          <span>
            <strong>{family.name}</strong> · {dateLabel(today)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                const muted = toggleSoundMuted();
                setSoundMuted(muted);
                hapticTap();
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--edge)",
                borderRadius: 8,
                padding: "4px 8px",
                color: "var(--ink)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
              }}
              title={soundMuted ? "Activar audio retro" : "Silenciar audio"}
            >
              <Icon name={soundMuted ? "mute" : "sound"} size={14} />
              <span>{soundMuted ? "Mute" : "8-Bit"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setShowAboutModal(true);
              }}
              style={{
                background: "rgba(65, 104, 80, 0.09)",
                border: "1px solid rgba(65, 104, 80, 0.22)",
                borderRadius: 8,
                padding: "4px 8px",
                color: "#416850",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
              }}
              title="Acerca de y Novedades de la versión"
            >
              <span>v1.2.0</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>Novedades</span>
            </button>
            <span className="private-tag">
              <i /> APK Móvil 100% Offline
            </span>
          </div>
        </header>

        <div className="main-content">
          {/* HOME VIEW */}
          {view === "home" && (
            <div>
              <div className="page-heading">
                <div>
                  <div className="date-label">{dateLabel(today)}</div>
                  <h1>¡Hola, {user.name}!</h1>
                  <p>Acompañamos hábitos con paciencia y acuerdos claros.</p>
                </div>
                <div className="page-flower">🌱</div>
              </div>

              {/* Children Overview Cards */}
              {visibleChildren.length > 0 && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "14px 18px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(56, 189, 248, 0.08))",
                    border: "1px solid rgba(74, 222, 128, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(74, 222, 128, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      ⏱️
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Modo Rutina Guiada</span>
                        <span className="pill green" style={{ fontSize: 10, padding: "1px 6px" }}>8-Bit</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        Una tarea a la vez con temporizador visual chiptune
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button primary"
                    style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: 13 }}
                    onClick={() => {
                      hapticSuccess();
                      playTap();
                      setActiveRoutineChild(visibleChildren[0]);
                    }}
                  >
                    Comenzar ▶
                  </button>
                </div>
              )}
              <div className="children-grid">
                {visibleChildren.map((child) => {
                  const status = statusFor(child.score, family.settings);
                  return (
                    <div className="child-card" key={child.id}>
                      <div className="child-card-top">
                        <div className="avatar">{child.avatar}</div>
                        <div>
                          <h3>{child.name}</h3>
                          <span>
                            {child.age} años · Nivel {child.level} ({child.xp} XP)
                          </span>
                        </div>
                        {child.pet && (
                          <div style={{ marginLeft: "auto" }}>
                            <PixelPet type={child.pet.type} stage={child.pet.stage} accessories={child.pet.equippedAccessories} size={48} />
                          </div>
                        )}
                      </div>

                      <div className="goal">
                        <span>META ACTUAL</span>
                        {child.goal}
                      </div>

                      <div className="progress-heading">
                        <span className={`status ${status.tone}`}>
                          <i /> {status.label}
                        </span>
                        <span>
                          <strong>{child.score}</strong> <small>/ 100</small>
                        </span>
                      </div>

                      <div className="progress-track" style={{ "--acceptable": `${family.settings.acceptable}%`, "--target": `${family.settings.target}%` } as React.CSSProperties}>
                        <div className="progress-shade" style={{ width: `${100 - child.score}%` }} />
                        <div className="progress-marker" style={{ left: `${child.score}%` }} />
                      </div>

                      <div className="progress-labels">
                        <span>0 Inicio</span>
                        <span>Acuerdo: {family.settings.acceptable}</span>
                        <span>Meta: {family.settings.target}</span>
                        <span>100</span>
                      </div>

                      <div className="child-bottom">
                        <span>
                          <Icon name="gift" size={16} /> Saldo premios: <strong>{child.balance} pts</strong>
                        </span>
                        {child.pet && (
                          <span>
                            ⚡ Energía: <strong>{child.pet.energy ?? 3}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions for Parents */}
              {parent && family.children.length > 0 && (
                <div className="dashboard-bottom">
                  <section className="panel">
                    <span className="eyebrow">REGISTRAR ESFUERZO</span>
                    <h3>Ajustar puntos de la barra</h3>
                    <form onSubmit={handleAddPoints} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div className="form-grid">
                        <label>
                          Para quién
                          <select name="childId" required>
                            {family.children.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Puntos (-100 a +100)
                          <input name="delta" type="number" min="-100" max="100" defaultValue="5" required />
                        </label>
                      </div>
                      <label>
                        Motivo del ajuste
                        <input name="motivo" placeholder="Ej: Recoger la habitación sin recordar" required maxLength={120} />
                      </label>
                      <button type="submit" className="button primary">
                        Guardar ajuste
                      </button>
                    </form>
                  </section>

                  <section className="panel">
                    <span className="eyebrow">ÚLTIMOS MOVIMIENTOS</span>
                    <h3>Historial reciente</h3>
                    {visibleEntries.slice(0, 5).map((e) => (
                      <div className="history-row" key={e.id}>
                        <div className={`history-symbol ${e.delta >= 0 ? "green" : "coral"}`}>
                          {e.delta >= 0 ? "+" : "−"}
                        </div>
                        <div>
                          <strong>{e.title}</strong>
                          <small>Por {e.by}</small>
                        </div>
                        <div className={`entry-points ${e.delta >= 0 ? "" : "negative"}`}>
                          {e.delta >= 0 ? `+${e.delta}` : e.delta} pts
                        </div>
                      </div>
                    ))}
                    {visibleEntries.length === 0 && <p className="muted">Aún no hay movimientos registrados.</p>}
                  </section>
                </div>
              )}
            </div>
          )}

          {/* TASKS VIEW */}
          {view === "tasks" && (
            <div>
              <div className="page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="date-label">HÁBITOS DIARIOS Y RETOS</div>
                  <h1>Rutinas y tareas</h1>
                  <p>Pequeños compromisos que construyen autonomía día a día.</p>
                </div>
                {visibleChildren.length > 0 && (
                  <button
                    type="button"
                    className="button secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                    onClick={() => {
                      hapticTap();
                      playTap();
                      setActiveRoutineChild(visibleChildren[0]);
                    }}
                  >
                    <span>⏱️ Iniciar Rutina Guiada</span>
                  </button>
                )}
              </div>

              <div className="panel">
                <h3>Tareas acordadas</h3>
                {visibleTasks.map((t) => {
                  const assignedChildren = family.children.filter((c) => taskChildIds(t).includes(c.id));
                  return (
                    <div className="task-row" key={t.id} style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div className="task-copy">
                          <h4>{t.title}</h4>
                          <p>
                            {t.cue} → {t.firstStep} ({t.frequency === "daily" ? "Diaria" : "Puntual"})
                          </p>
                        </div>
                        <div className="points">+{t.points} pts</div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", borderTop: "1px dashed var(--edge)", paddingTop: 8 }}>
                        {user.role === "child" ? (
                          (() => {
                            const req = taskRequest(family, t, today, user.id);
                            const isDone = !!req && req.status === "approved";
                            return (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span className={`task-check ${isDone ? "done" : ""}`} style={{ marginRight: 8 }}>
                                  {isDone ? "✓" : "○"}
                                </span>
                                {!isDone ? (
                                  <button
                                    type="button"
                                    className="button secondary small"
                                    onClick={() => handleCompleteTask(t.id, user.id)}
                                  >
                                    Marcar hecha
                                  </button>
                                ) : (
                                  <span className="pill green">Hecha hoy</span>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          assignedChildren.map((child) => {
                            const req = taskRequest(family, t, today, child.id);
                            const isDone = !!req && req.status === "approved";
                            return (
                              <div key={child.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: 8 }}>
                                <span>{child.avatar} {child.name}:</span>
                                {isDone ? (
                                  <span className="pill green" style={{ fontSize: 11, padding: "2px 6px" }}>✓ Hecha</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="button secondary small"
                                    style={{ fontSize: 11, padding: "2px 8px" }}
                                    onClick={() => handleCompleteTask(t.id, child.id)}
                                  >
                                    Marcar hecha
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}

                {visibleTasks.length === 0 && <p className="muted">No hay tareas creadas todavía.</p>}
              </div>

              {parent && (
                <section className="panel" style={{ marginTop: 22 }}>
                  <span className="eyebrow">NUEVO ACUERDO</span>
                  <h3>Añadir tarea o rutina</h3>
                  <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="form-grid">
                      <label>
                        Título
                        <input name="titulo" placeholder="Ej: Poner la mesa" required maxLength={120} />
                      </label>
                      <label>
                        Puntos
                        <input name="puntos" type="number" min="1" max="100" defaultValue="5" required />
                      </label>
                    </div>
                    <div className="form-grid">
                      <label>
                        Señal o momento
                        <input name="senal" placeholder="Ej: Antes de cenar" defaultValue="Al llegar a casa" required />
                      </label>
                      <label>
                        Primer paso pequeño
                        <input name="primerPaso" placeholder="Ej: Mirar la agenda" defaultValue="Empezar por lo fácil" required />
                      </label>
                    </div>
                    <label className="checkbox">
                      <input type="checkbox" name="autoAprobar" defaultChecked />
                      Aprobar y conceder puntos automáticamente al marcarse
                    </label>
                    <button type="submit" className="button primary">
                      Crear tarea
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}

          {/* REWARDS VIEW */}
          {view === "rewards" && (
            <div>
              <div className="page-heading">
                <div>
                  <div className="date-label">CATÁLOGO FAMILIAR</div>
                  <h1>Recompensas</h1>
                  <p>Premios acordados para celebrar el esfuerzo acumulado.</p>
                </div>
              </div>

              <div className="rewards-grid">
                {family.rewards.map((r) => (
                  <div className="reward-card" key={r.id}>
                    <div className="reward-art">
                      <span>{r.emoji}</span>
                      <div className="reward-cost">{r.cost} pts</div>
                    </div>
                    <div className="reward-copy">
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {parent && (
                <section className="panel" style={{ marginTop: 22 }}>
                  <span className="eyebrow">NUEVO PREMIO</span>
                  <h3>Añadir recompensa al catálogo</h3>
                  <form onSubmit={handleAddReward} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="form-grid">
                      <label>
                        Título
                        <input name="titulo" placeholder="Ej: Elegir película el viernes" required maxLength={120} />
                      </label>
                      <label>
                        Coste en puntos
                        <input name="puntos" type="number" min="1" max="1000" defaultValue="20" required />
                      </label>
                    </div>
                    <div className="form-grid">
                      <label>
                        Emoji representativo
                        <input name="emoji" defaultValue="🎬" maxLength={4} required />
                      </label>
                      <label>
                        Descripción
                        <input name="descripcion" placeholder="Ej: Elegir qué vemos en familia el viernes por la noche" required />
                      </label>
                    </div>
                    <button type="submit" className="button primary">
                      Añadir recompensa
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}

          {/* PET VIEW */}
          {view === "pet" && <PetView snapshot={snapshot} />}

          {/* FAMILY COOPERATIVE PROJECT VIEW */}
          {view === "project" && (
            <FamilyProjectView family={family} user={user} onUpdate={onUpdate} />
          )}

          {/* FAMILY PROFILES VIEW */}
          {view === "family" && parent && (
            <div>
              <div className="page-heading">
                <div>
                  <div className="date-label">EL EQUIPO FAMILIAR</div>
                  <h1>Mi familia</h1>
                  <p>Administra perfiles de hijos y progenitores.</p>
                </div>
              </div>

              <div className="children-grid">
                {family.children.map((c) => (
                  <div className="child-card" key={c.id}>
                    <div className="child-card-top">
                      <div className="avatar">{c.avatar}</div>
                      <div>
                        <h3>{c.name}</h3>
                        <span>{c.age} años · Nivel {c.level}</span>
                      </div>
                    </div>
                    <div className="goal">
                      <span>OBJETIVO</span>
                      {c.goal}
                    </div>
                    <div className="child-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span>Puntuación: <strong>{c.score}/100</strong></span>
                        <span style={{ marginLeft: 8 }}>Saldo: <strong>{c.balance} pts</strong></span>
                      </div>
                      <button
                        type="button"
                        className="button secondary small"
                        style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", padding: "4px 8px" }}
                        onClick={() => handleDeleteChild(c.id)}
                        title="Eliminar perfil"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <section className="panel" style={{ marginTop: 22 }}>
                <span className="eyebrow">NUEVO MIEMBRO</span>
                <h3>Añadir hijo o hija</h3>
                <form onSubmit={handleAddChild} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="form-grid">
                    <label>
                      Nombre
                      <input name="nombre" placeholder="Ej: Lucas" required maxLength={40} />
                    </label>
                    <label>
                      Edad
                      <input name="edad" type="number" min="4" max="18" defaultValue="9" required />
                    </label>
                  </div>
                  <div className="form-grid">
                    <label>
                      Avatar (Emoji)
                      <select name="avatar" defaultValue="🦊">
                        <option value="🦊">🦊 Zorro</option>
                        <option value="🐼">🐼 Panda</option>
                        <option value="🦁">🦁 León</option>
                        <option value="🐨">🐨 Koala</option>
                        <option value="🦄">🦄 Unicornio</option>
                      </select>
                    </label>
                    <label>
                      Objetivo personal
                      <input name="meta" placeholder="Ej: Mejorar mi rutina de estudio" defaultValue="Crecer con autonomía" required />
                    </label>
                  </div>
                  <button type="submit" className="button primary">
                    Añadir hijo a la familia
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* ADVICE VIEW */}
          {view === "advice" && (
            <div>
              <div className="page-heading">
                <div>
                  <div className="date-label">BASE EDUCATIVA</div>
                  <h1>Pautas y hábitos</h1>
                  <p>Orientaciones prácticas basadas en investigación sobre refuerzo positivo.</p>
                </div>
              </div>

              <div className="advice-grid">
                {advice.map((item, idx) => (
                  <div className="advice-card" key={idx}>
                    <span className="eyebrow">{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <blockquote>«{item.example}»</blockquote>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 8 }}>
                      Para el niño: {item.child}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ VIEW */}
          {view === "faq" && <FAQView onNavigate={(targetView) => setView(targetView as View)} />}

          {/* SETTINGS VIEW */}
          {view === "settings" && parent && (
            <div className="settings-grid">
              <section className="panel">
                <span className="eyebrow">REGLAS DE LA FAMILIA</span>
                <h3>Configuración general</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    family.name = String(form.get("familia") || family.name).trim();
                    family.settings.acceptable = Number(form.get("aceptable") || 60);
                    family.settings.target = Number(form.get("meta") || 85);
                    family.settings.negativeEnabled = form.get("negativos") === "on";
                    family.settings.screenLockMargins = form.get("screenLockMargins") === "on";
                    setScreenLockSetting(family.settings.screenLockMargins);
                    const haptics = form.get("hapticsEnabled") === "on";
                    family.settings.hapticsEnabled = haptics;
                    setHapticsEnabled(haptics);
                    saveStoredFamily({ ...family });
                    hapticSuccess();
                    onUpdate();
                    showToast("¡Configuración familiar guardada correctamente!", "success");
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <label>
                    Nombre de la familia
                    <input name="familia" defaultValue={family.name} maxLength={60} required />
                  </label>
                  <div className="form-grid">
                    <label>
                      Inicio zona acordada
                      <input name="aceptable" type="number" min="10" max="90" defaultValue={family.settings.acceptable} required />
                    </label>
                    <label>
                      Objetivo meta
                      <input name="meta" type="number" min="20" max="100" defaultValue={family.settings.target} required />
                    </label>
                  </div>
                  <label className="checkbox">
                    <input type="checkbox" name="negativos" defaultChecked={family.settings.negativeEnabled} />
                    Permitir ajustes negativos en la barra
                  </label>
                  <label className="checkbox" style={{ marginTop: 2, alignItems: "flex-start" }}>
                    <input
                      type="checkbox"
                      name="screenLockMargins"
                      defaultChecked={family.settings.screenLockMargins !== false}
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      <strong>Bloqueo vertical y márgenes seguros de 0.5 cm</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
                        Bloquea el rebote/desplazamiento vertical parásito y reserva medio centímetro por encima (reloj del móvil) y por debajo (botones de navegación).
                      </small>
                    </span>
                  </label>
                  <label className="checkbox" style={{ marginTop: 2, alignItems: "flex-start" }}>
                    <input
                      type="checkbox"
                      name="hapticsEnabled"
                      defaultChecked={family.settings.hapticsEnabled ?? isHapticsEnabled()}
                      style={{ marginTop: 3 }}
                    />
                    <span>
                      <strong>Vibración y retroalimentación táctil (Hápticos)</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
                        Emite vibraciones sutiles al pulsar botones, marcar tareas, registrar puntos y desbloquear con PIN. Desactívalo para un modo silencioso sin vibración.
                      </small>
                    </span>
                  </label>
                  <div style={{ paddingLeft: "26px", marginTop: "-4px", marginBottom: "4px" }}>
                    <button
                      type="button"
                      className="button secondary small"
                      style={{ fontSize: "11px", minHeight: "34px", padding: "4px 11px" }}
                      onClick={async () => {
                        await testHaptic();
                        showToast("¡Vibración táctil de prueba ejecutada!", "info");
                      }}
                    >
                      📳 Probar vibración táctil
                    </button>
                  </div>
                  <button type="submit" className="button primary">
                    Guardar reglas
                  </button>
                </form>

                <div className="rules">
                  <h4>Cómo funciona la barra</h4>
                  <ul>
                    <li>Empieza en 50 y se mueve entre 0 y 100.</li>
                    <li>Los puntos positivos aumentan también el saldo de recompensas.</li>
                    <li>Los puntos negativos no descuentan saldo ya ganado.</li>
                  </ul>
                </div>
              </section>

              <div>
                <section className="panel">
                  <span className="eyebrow">COPIA DE SEGURIDAD Y RESPALDO</span>
                  <h3>Respaldo y Restauración Local</h3>
                  <p className="muted" style={{ marginBottom: 14 }}>
                    Exporta o restaura tus datos familiares en formato JSON seguro. Todo reside 100% en tu dispositivo.
                  </p>

                  <input
                    type="file"
                    ref={restoreFileRef}
                    onChange={handleRestoreFile}
                    accept=".json,application/json"
                    style={{ display: "none" }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <button
                      type="button"
                      className="button secondary small"
                      onClick={async () => {
                        try {
                          const json = exportFamilyBackup();
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(json);
                            hapticSuccess();
                            showToast("¡Copia de seguridad copiada al portapapeles!", "success");
                          } else {
                            throw new Error("Portapapeles no disponible");
                          }
                        } catch {
                          try {
                            const json = exportFamilyBackup();
                            await Share.share({
                              title: "Copia de Seguridad Pasos",
                              text: json,
                            });
                          } catch {
                            hapticWarning();
                            showToast("No se pudo copiar al portapapeles automáticamente.", "warning");
                          }
                        }
                      }}
                    >
                      Copiar backup JSON
                    </button>

                    <button
                      type="button"
                      className="button secondary small"
                      onClick={async () => {
                        try {
                          const json = exportFamilyBackup();
                          await Share.share({
                            title: `Backup Pasos - ${family.name}`,
                            text: json,
                            dialogTitle: "Compartir o guardar copia de seguridad",
                          });
                          hapticSuccess();
                        } catch {
                          // Dismissed
                        }
                      }}
                    >
                      Compartir archivo
                    </button>

                    <button
                      type="button"
                      className="button secondary small"
                      onClick={handleSaveDiskSnapshot}
                      title="Guardar archivo en la carpeta Documents/Pasos del móvil"
                    >
                      <Icon name="archive" size={14} /> Guardar en almacenamiento
                    </button>

                    <button
                      type="button"
                      className="button primary small"
                      onClick={() => {
                        hapticTap();
                        restoreFileRef.current?.click();
                      }}
                      title="Seleccionar archivo .json para restaurar datos"
                    >
                      <span>📥</span> Restaurar copia (.json)
                    </button>
                  </div>
                </section>

                <section className="panel" style={{ marginTop: 22 }}>
                  <span className="eyebrow">SEGURIDAD Y CONTROL PARENTAL</span>
                  <h3>PIN de Adulto</h3>
                  <p className="muted" style={{ marginBottom: 14 }}>
                    Protege el acceso a las funciones de administración, asignación de puntos y configuración frente a cambios involuntarios de los niños.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <span className="status green">
                        <i /> PIN de 4 dígitos activo
                      </span>
                    </div>
                    <button
                      type="button"
                      className="button secondary small"
                      onClick={() => {
                        hapticTap();
                        setPinModalMode("create");
                        setPinModalOpen(true);
                      }}
                    >
                      <Icon name="lock" size={14} /> Cambiar PIN
                    </button>
                  </div>
                </section>

                <section className="panel" style={{ marginTop: 22 }}>
                  <span className="eyebrow">TRANSPARENCIA TÉCNICA</span>
                  <h3>Arquitectura y Tecnologías</h3>
                  <p className="muted" style={{ marginBottom: 16 }}>
                    Mapa interactivo de módulos móviles, plugins nativos y diagnóstico de salud.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setShowAboutModal(true);
                      }}
                      className="button secondary full"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18, color: "var(--green)" }}>🌱</span>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>Acerca de Pasos y Novedades</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Versión v1.2.0 · Historial de mejoras</div>
                        </div>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setShowTechStack(true);
                      }}
                      className="button secondary full"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18, color: "var(--green)" }}>📱</span>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>Stack Móvil Nativo</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Grafo Canvas 2D y salud en vivo</div>
                        </div>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {showTechStack && (
        <Suspense fallback={null}>
          <AppArchitectureGraph onClose={() => setShowTechStack(false)} />
        </Suspense>
      )}

      {activeRoutineChild && (
        <RoutineRunner
          family={family}
          child={activeRoutineChild}
          today={today}
          onCompleteTask={(taskId, childId) => handleCompleteTask(taskId, childId)}
          onClose={() => {
            setActiveRoutineChild(null);
            onUpdate();
          }}
        />
      )}

      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
          onOpenArchitecture={() => {
            setShowAboutModal(false);
            setShowTechStack(true);
          }}
        />
      )}

      {pinModalOpen && (
        <PinModal
          mode={pinModalMode}
          expectedPin={family.settings.adultPin || "1234"}
          title={pinModalMode === "create" ? "Nuevo PIN Parental" : "Acceso de Adulto"}
          subtitle={
            pinModalMode === "create"
              ? "Elige un código PIN de 4 dígitos para proteger la zona de adultos"
              : `Introduce el PIN de 4 dígitos para continuar como ${pinTargetUser?.name || "adulto"}`
          }
          onSuccess={handlePinSuccess}
          onCancel={() => {
            setPinModalOpen(false);
            setPinTargetUser(null);
          }}
        />
      )}
    </div>
  );
}
