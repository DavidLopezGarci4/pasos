import React, { useState, useRef } from "react";
import { Brand, Garden, Icon } from "./icon";
import {
  saveStoredFamily,
  saveStoredUsers,
  setActiveUser,
  getStoredUsers,
  getStoredFamily,
  importFamilyBackup,
} from "../lib/mobile-storage";
import { hapticSuccess, hapticWarning, hapticTap } from "../lib/haptics";
import type { Family, Member } from "../lib/model";

export function Welcome({ setup, onComplete }: { setup: boolean; onComplete: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = String(event.target?.result || "");
        const res = importFamilyBackup(content);
        if (res.success) {
          hapticSuccess();
          alert("¡Copia de seguridad restaurada correctamente!");
          onComplete();
        } else {
          throw new Error(res.error || "Archivo no compatible.");
        }
      } catch (err: unknown) {
        hapticWarning();
        setError(err instanceof Error ? err.message : "Error al procesar la copia.");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const form = new FormData(e.currentTarget);
      const name = String(form.get("nombre") || "").trim();
      const clave = String(form.get("clave") || "").trim();

      if (setup) {
        const familyName = String(form.get("familia") || "").trim();
        const pin = String(form.get("pin") || "1234").trim();
        if (!familyName) throw new Error("Por favor introduce el nombre de la familia.");
        if (clave.length < 6) throw new Error("La clave debe tener al menos 6 caracteres.");
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          throw new Error("El PIN de adulto debe ser exactamente de 4 dígitos numéricos.");
        }

        const adultId = "adult-" + Date.now();
        const initialUser: Member = { id: adultId, name, role: "parent" };

        const initialFamily: Family = {
          name: familyName,
          settings: {
            negativeEnabled: true,
            acceptable: 60,
            target: 85,
            timezone: "Europe/Madrid",
            screenLockMargins: true,
            adultPin: pin,
          },
          children: [],
          tasks: [],
          rewards: [],
          requests: [],
          entries: [],
          messages: [],
          quests: [],
        };

        saveStoredFamily(initialFamily);
        saveStoredUsers([initialUser]);
        setActiveUser(initialUser);
        hapticSuccess();
        onComplete();
      } else {
        const storedUsers = getStoredUsers();
        const family = getStoredFamily();
        const allUsers = [...storedUsers];
        if (family && family.children) {
          family.children.forEach((c) => {
            if (!allUsers.some((u) => u.id === c.id || u.name.toLowerCase() === c.name.toLowerCase())) {
              allUsers.push({ id: c.id, name: c.name, role: "child" });
            }
          });
          if (allUsers.length !== storedUsers.length) {
            saveStoredUsers(allUsers);
          }
        }
        const user = allUsers.find((u) => u.name.toLowerCase() === name.toLowerCase());
        if (!user) {
          throw new Error("No se ha encontrado un perfil con ese nombre.");
        }
        setActiveUser(user);
        hapticSuccess();
        onComplete();
      }
    } catch (err: unknown) {
      hapticWarning();
      setError(err instanceof Error ? err.message : "Error de acceso.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="welcome">
      <section className="welcome-story">
        <Brand />
        <div>
          <span className="eyebrow">PEQUEÑOS PASOS. GRANDES CAMBIOS.</span>
          <h1>
            Crecer es mejor<br />
            cuando lo hacemos<br />
            <em>en familia.</em>
          </h1>
          <p>Un lugar para acompañar los hábitos, reconocer el esfuerzo y celebrar lo que vais consiguiendo juntos en Android.</p>
          <Garden />
        </div>
        <span className="welcome-foot">
          <Icon name="leaf" /> Cada familia tiene su propio ritmo.
        </span>
      </section>

      <section className="welcome-form">
        <div className="form-card">
          <span className="pill">
            <Icon name="home" size={15} /> Espacio Privado Móvil
          </span>
          <h2>{setup ? "Aquí empieza vuestro camino" : "Qué bien tenerte de vuelta"}</h2>
          <p>
            {setup
              ? "Crea el acceso del primer adulto. Después podrás añadir a tus hijos y al otro progenitor."
              : "Entra con tu nombre y tu clave para continuar en tu móvil."}
          </p>

          <form onSubmit={handleSubmit}>
            {setup && (
              <label>
                Nombre de la familia
                <input name="familia" placeholder="Familia García" maxLength={60} required autoComplete="organization" />
              </label>
            )}

            <label>
              Nombre de acceso
              <input name="nombre" placeholder={setup ? "Tu nombre o alias" : "Tu nombre"} minLength={2} maxLength={40} required autoComplete="username" />
            </label>

            <label>
              {setup ? "Contraseña del adulto" : "Contraseña o clave"}
              <input
                name="clave"
                type="password"
                minLength={setup ? 6 : 6}
                maxLength={128}
                required
                autoComplete={setup ? "new-password" : "current-password"}
              />
            </label>
            {setup && (
              <label>
                PIN de control parental (4 dígitos)
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  minLength={4}
                  defaultValue="1234"
                  placeholder="1234"
                  required
                />
                <small>PIN rápido para autorizar cambios y acceder a la zona de adultos.</small>
              </label>
            )}

            {error && <p role="alert" className="notice error">{error}</p>}

            <button type="submit" className="button primary full" disabled={pending}>
              {pending ? "Un momento…" : setup ? "Crear nuestro espacio" : "Entrar en familia"}
              <Icon name="arrow" />
            </button>
          </form>

          {/* SAF / File Picker Restore Backup */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--line)", textAlign: "center" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json,application/json"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="text-button"
              style={{ fontSize: 11, color: "var(--green)", justifyContent: "center", width: "100%" }}
              onClick={() => {
                hapticTap();
                fileInputRef.current?.click();
              }}
            >
              <Icon name="archive" size={14} /> ¿Ya tienes una copia de seguridad? Restaurar (.json)
            </button>
          </div>

          <p className="form-note">
            {setup
              ? "Sin registros públicos. 100% privado en tu dispositivo Android."
              : "Los adultos administran el portal. Cada niño ve solo su propio espacio."}
          </p>
        </div>
      </section>
    </main>
  );
}
