import React, { useState } from "react";
import { Brand, Garden, Icon } from "./icon";
import { saveStoredFamily, saveStoredUsers, setActiveUser, getStoredUsers, getStoredFamily } from "../lib/mobile-storage";
import { hapticSuccess, hapticWarning } from "../lib/haptics";
import type { Family, Member } from "../lib/model";

export function Welcome({ setup, onComplete }: { setup: boolean; onComplete: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        if (!familyName) throw new Error("Por favor introduce el nombre de la familia.");
        if (clave.length < 10) throw new Error("La clave del adulto debe tener al menos 10 caracteres.");

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
                minLength={setup ? 10 : 6}
                maxLength={128}
                required
                autoComplete={setup ? "new-password" : "current-password"}
              />
            </label>
            {setup && <small>Usa al menos 10 caracteres. Los niños tendrán su propio acceso.</small>}

            {error && <p role="alert" className="notice error">{error}</p>}

            <button type="submit" className="button primary full" disabled={pending}>
              {pending ? "Un momento…" : setup ? "Crear nuestro espacio" : "Entrar en familia"}
              <Icon name="arrow" />
            </button>
          </form>

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
