import React, { useState, useEffect } from "react";
import { petCatalog, petStageLabels, petItemsCatalog, type Child, type Snapshot } from "../lib/model";
import { feedPet, playPet, buyPetItem, togglePetAccessory } from "../lib/domain";
import { saveStoredFamily } from "../lib/mobile-storage";
import { hapticSuccess, hapticTap, hapticWarning } from "../lib/haptics";
import { playTap, playLevelUp, playPetFeed } from "../lib/sound";
import { PixelPet } from "./pixel-pet";
import { Icon } from "./icon";
import { showToast } from "./toast";

export function PetConsole({ child, snapshot }: { child: Child; snapshot: Snapshot }) {
  const [activeTab, setActiveTab] = useState<"play" | "feed" | "shop">("play");
  const [shakeNotice, setShakeNotice] = useState<string | null>(null);
  const pet = child.pet;
  const family = snapshot.family;

  // Sensor Acelerómetro: Agitar para jugar con la mascota (Hardware Integration)
  useEffect(() => {
    if (!pet || pet.stage === "egg") return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = performance.now();
    let cooldown = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = performance.now();
      const diffTime = now - lastTime;
      if (diffTime < 120) return; // Sample every 120ms
      lastTime = now;

      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);
      const speed = ((deltaX + deltaY + deltaZ) / diffTime) * 1000;

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;

      if (speed > 35 && now - cooldown > 3000) {
        cooldown = now;
        if (child.pet && child.pet.energy > 0) {
          try {
            playPet(child);
            saveStoredFamily({ ...family });
            hapticSuccess();
            playLevelUp();
            setShakeNotice(`¡Agitaste tu móvil! Jugaste con ${child.pet.name} 🎮 (+5 XP)`);
            setTimeout(() => setShakeNotice(null), 3500);
          } catch {
            // Pet out of energy
          }
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [pet, child, family]);

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 21 || currentHour < 8;
  const petMood = isNight ? "sleepy" : "happy";

  const handleChoosePet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const petType = String(form.get("petType") || "fox");
    const petName = String(form.get("petName") || "Chispa").trim();

    child.pet = {
      type: petType,
      name: petName,
      xp: 0,
      stage: "egg",
      happiness: 80,
      fullness: 80,
      energy: 3,
      maxEnergy: 5,
      equippedAccessories: [],
      unlockedItems: [],
    };

    saveStoredFamily({ ...family });
    hapticSuccess();
    playLevelUp();
  };

  const handlePlay = () => {
    try {
      playPet(child);
      saveStoredFamily({ ...family });
      hapticSuccess();
      playLevelUp();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al jugar con la mascota", "warning");
    }
  };

  const handleFeed = (itemId: string) => {
    try {
      feedPet(child, itemId);
      saveStoredFamily({ ...family });
      hapticSuccess();
      playPetFeed();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al alimentar la mascota", "warning");
    }
  };

  const handleBuy = (itemId: string) => {
    try {
      buyPetItem(child, itemId);
      saveStoredFamily({ ...family });
      hapticSuccess();
    } catch (err: unknown) {
      hapticWarning();
      showToast(err instanceof Error ? err.message : "Error al comprar accesorio", "warning");
    }
  };

  const handleToggleAccessory = (itemId: string) => {
    try {
      togglePetAccessory(child, itemId);
      saveStoredFamily({ ...family });
      hapticTap();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error al equipar", "warning");
    }
  };

  if (!pet) {
    return (
      <div className="panel pet-select-panel">
        <div className="section-heading compact">
          <h3><Icon name="pet" /> ¡Mascota virtual para {child.name}!</h3>
          <span className="muted">Adopta una mascota 8-bits para acompañarte en tus rutinas</span>
        </div>
        <p>Tu mascota crecerá y evolucionará cuando completes y apruebes tus tareas diarias.</p>
        <form onSubmit={handleChoosePet}>
          <div className="pet-grid">
            {petCatalog.map((p) => (
              <label key={p.type} className="pet-choice">
                <input type="radio" name="petType" value={p.type} defaultChecked={p.type === "fox"} />
                <span className="pet-emoji">
                  <PixelPet type={p.type} stage="baby" size={48} />
                </span>
                <span className="pet-name">{p.name}</span>
              </label>
            ))}
          </div>
          <label>
            Nombre de tu mascota:
            <input name="petName" placeholder="Ej: Chispa" required maxLength={40} />
          </label>
          <button type="submit" className="button primary centered">
            🐣 Adoptar mi mascota 8-Bits
          </button>
        </form>
      </div>
    );
  }

  const stageInfo = petStageLabels[pet.stage] || { emoji: "🐣", label: "Bebé" };
  const happiness = pet.happiness ?? 80;
  const fullness = pet.fullness ?? 80;
  const energy = pet.energy ?? 3;
  const maxEnergy = pet.maxEnergy ?? 5;
  const equippedIds = pet.equippedAccessories || [];
  const unlockedIds = pet.unlockedItems || [];
  const equippedItems = petItemsCatalog.filter((i) => equippedIds.includes(i.id));

  let moodEmoji = "❤️";
  let moodText = "¡Me siento genial contigo!";
  if (pet.stage === "egg") {
    moodEmoji = "🥚";
    moodText = "¡Completa tareas diarias para ayudarme a eclosionar a Bebé (25 XP)!";
  } else if (energy <= 0) {
    moodEmoji = "😴";
    moodText = "¡Necesito energía! Completa tareas para jugar juntos ⚡";
  } else if (happiness < 30 || fullness < 30) {
    moodEmoji = "💤";
    moodText = "Tengo un poco de hambre y sueño...";
  } else if (happiness >= 90 && fullness >= 90) {
    moodEmoji = "🎉";
    moodText = "¡Estoy al máximo de energía y súper feliz!";
  } else if (fullness < 60) {
    moodEmoji = "😋";
    moodText = "¡Una galletita no estaría nada mal!";
  }

  const foodItems = petItemsCatalog.filter((i) => i.category === "food");
  const accessoryItems = petItemsCatalog.filter((i) => i.category === "accessory");

  return (
    <div className="pet-tamagotchi-panel">
      <div className="tamagotchi-header">
        <div className="tamagotchi-brand">
          <span className="tamagotchi-led" />
          <h3>TAMAGOTCHI DE {pet.name.toUpperCase()} (8-BITS)</h3>
        </div>
        <span className="pet-stage-badge">{stageInfo.emoji} Etapa {stageInfo.label}</span>
      </div>

      <div className="tamagotchi-screen">
        <div className="pet-display-area">
          {equippedItems.length > 0 && (
            <div className="equipped-floating-accessories">
              {equippedItems.map((acc) => (
                <span key={acc.id} className="acc-tag" title={acc.name}>{acc.emoji}</span>
              ))}
            </div>
          )}

          <div className="pet-character-avatar" key={happiness + fullness + energy + equippedIds.length + pet.stage}>
            <PixelPet type={pet.type} stage={pet.stage} accessories={equippedIds} size={140} mood={petMood} />
          </div>

          {shakeNotice && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#416850",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                zIndex: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
                border: "1px solid #729879",
              }}
            >
              {shakeNotice}
            </div>
          )}

          <div className="pet-speech-bubble">
            <span>{moodEmoji} {moodText}</span>
          </div>
        </div>

        <div className="pet-meters-grid">
          <div className="pet-meter">
            <span className="meter-label">Energía ⚡ {energy} / {maxEnergy}</span>
            <div className="meter-track">
              <div className="meter-fill energy" style={{ width: `${Math.round((energy / maxEnergy) * 100)}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Felicidad ❤️ {happiness}%</span>
            <div className="meter-track">
              <div className="meter-fill happiness" style={{ width: `${happiness}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Saciedad 🍗 {fullness}%</span>
            <div className="meter-track">
              <div className="meter-fill fullness" style={{ width: `${fullness}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Etapa {stageInfo.emoji} {stageInfo.label} ({pet.xp} XP)</span>
            <div className="meter-track">
              <div className="meter-fill xp" style={{ width: `${Math.min(100, Math.round((pet.xp / 150) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="tamagotchi-tabs">
        <button
          type="button"
          className={`tamagotchi-tab ${activeTab === "play" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            setActiveTab("play");
          }}
        >
          🎮 Jugar (⚡{energy})
        </button>
        <button
          type="button"
          className={`tamagotchi-tab ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            setActiveTab("feed");
          }}
        >
          🍎 Alimentar
        </button>
        <button
          type="button"
          className={`tamagotchi-tab ${activeTab === "shop" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            setActiveTab("shop");
          }}
        >
          👑 Armario 8-Bits
        </button>
      </div>

      <div className="tamagotchi-body">
        {activeTab === "play" && (
          <div className="tab-pane play-pane">
            <p>Demuéstrale tu cariño a <strong>{pet.name}</strong> acariciándole o jugando juntos.</p>
            <div className="energy-notice">
              <span>⚡ Energía disponible: <strong>{energy} de {maxEnergy}</strong></span>
              <small>Cada tarea diaria completada y aprobada otorga <strong>+1 punto de energía ⚡</strong> a tu mascota.</small>
            </div>
            <button
              type="button"
              className="button primary pet-action-btn"
              disabled={energy <= 0}
              onClick={handlePlay}
            >
              {energy > 0
                ? `👋 Acariciar y jugar con ${pet.name} (-1 ⚡, +15 Felicidad, +2 XP)`
                : `⚡ Sin energía (Completa tareas para recargar)`}
            </button>

            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 10,
                backgroundColor: "#edf2e8",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: "#416850",
              }}
            >
              <span>📱</span>
              <span><strong>Sensor de movimiento:</strong> ¡Agita tu móvil físicamente para jugar con {pet.name}!</span>
            </div>
          </div>
        )}

        {activeTab === "feed" && (
          <div className="tab-pane feed-pane">
            <p className="pane-intro">Alimenta a tu mascota para subir su nivel de saciedad y felicidad. Saldo actual: <strong>{child.balance} pts</strong></p>
            <div className="items-grid">
              {foodItems.map((food) => {
                const cannotAfford = food.cost > 0 && child.balance < food.cost;
                return (
                  <div className="item-card" key={food.id}>
                    <span className="item-emoji">{food.emoji}</span>
                    <div className="item-details">
                      <strong>{food.name}</strong>
                      <span className="item-bonus">
                        +{food.fullnessBonus} Saciedad · +{food.happinessBonus} Felicidad
                        {food.xpBonus > 0 ? ` · +${food.xpBonus} XP` : ""}
                      </span>
                      <span className="item-price">
                        {food.cost === 0 ? "Gratis" : `${food.cost} puntos`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="button secondary small"
                      disabled={cannotAfford}
                      onClick={() => handleFeed(food.id)}
                    >
                      {cannotAfford ? "Faltan pts" : "Dar comida"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="tab-pane shop-pane">
            <p className="pane-intro">Desbloquea accesorios para vestir a {pet.name}. Saldo: <strong>{child.balance} pts</strong></p>
            <div className="items-grid">
              {accessoryItems.map((acc) => {
                const isUnlocked = unlockedIds.includes(acc.id);
                const isEquipped = equippedIds.includes(acc.id);
                const cannotAfford = acc.cost > 0 && child.balance < acc.cost;

                return (
                  <div className={`item-card ${isEquipped ? "equipped" : ""}`} key={acc.id}>
                    <span className="item-emoji">{acc.emoji}</span>
                    <div className="item-details">
                      <strong>{acc.name}</strong>
                      <span className="item-bonus">+{acc.happinessBonus} Felicidad</span>
                      <span className="item-price">{isUnlocked ? "Comprado" : `${acc.cost} puntos`}</span>
                    </div>
                    {isUnlocked ? (
                      <button
                        type="button"
                        className={`button small ${isEquipped ? "primary" : "secondary"}`}
                        onClick={() => handleToggleAccessory(acc.id)}
                      >
                        {isEquipped ? "Quitar ✕" : "Poner ✨"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button secondary small"
                        disabled={cannotAfford}
                        onClick={() => handleBuy(acc.id)}
                      >
                        {cannotAfford ? "Faltan pts" : `Comprar (${acc.cost} pts)`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PetView({ snapshot }: { snapshot: Snapshot }) {
  const { family, user } = snapshot;
  const parent = user.role === "parent";
  const children = family.children;
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || "");

  const activeChild = parent
    ? children.find((c) => c.id === selectedChildId) || children[0]
    : children.find((c) => c.id === user.id) || children[0];

  if (!children.length) {
    return (
      <section className="panel">
        <p>Añade primero a tus hijos en la sección de familia para gestionar sus mascotas.</p>
      </section>
    );
  }

  return (
    <div className="pet-view-container">
      {parent && children.length > 1 && (
        <div className="filters" style={{ marginBottom: 16 }}>
          {children.map((c) => (
            <button
              key={c.id}
              className={selectedChildId === c.id || (!selectedChildId && children[0].id === c.id) ? "selected" : ""}
              onClick={() => {
                hapticTap();
                setSelectedChildId(c.id);
              }}
            >
              {c.avatar} Mascota de {c.name}
            </button>
          ))}
        </div>
      )}

      {activeChild && <PetConsole child={activeChild} snapshot={snapshot} />}
    </div>
  );
}
