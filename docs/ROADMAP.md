# Hoja de Ruta de Evolución (Roadmap) - Pasos

> Plan estratégico de evolución en paralelo: Versión Web (`pasos-en-familia`) y Versión Móvil Nativa (`pasos`).

---

## 1. Visión Estratégica en Paralelo

Pasos evoluciona bajo un modelo de doble arquitectura complementaria:
1. **Versión Web (`pasos-en-familia`):**
   * *Entorno:* Next.js 15, SSR, Server Actions, base de datos local ACID transaccional.
   * *Propósito:* Gestión familiar de escritorio, visualización en pantalla grande, acceso mediante navegador local (`http://localhost:3000`).
2. **Versión Móvil Nativa (`pasos`):**
   * *Entorno:* Capacitor 7, Vite, React 19, Android SDK 34/35, almacenamiento autónomo offline.
   * *Propósito:* Experiencia táctil inmediata en smartphones y tablets, respuesta háptica, notificaciones locales de rutinas, mascota virtual interactiva y cero dependencia de servidores.

---

## 2. Hitos y Versiones de la APK Móvil

### v1.0.0 — Fundación Autónoma y Auditoría Integral (Actual)
* [x] **Arquitectura Base:** Setup completo Vite + React 19 + Capacitor 7.
* [x] **Almacenamiento Offline Autónomo:** Persistencia en `localStorage` con motor de copias de seguridad JSON y compartición nativa (`@capacitor/share`).
* [x] **Roles y Seguridad:** Entornos diferenciados para adultos y niños, con aislamiento de tareas e historial para proteger la privacidad individual.
* [x] **Mascota Virtual 8-Bits:** Motor pixel-art con ciclos de evolución (Huevo → Bebé → Juvenil → Adulto), accesorios personalizables y mecánicas de energía/alimentación.
* [x] **Auditoría Dual Blind Judgment Day:** Eliminación de fugas de eventos en el botón 'Atrás' nativo, resolución de concurrencia en perfiles infantiles y validación de firma con `apksigner`.
* [x] **Documentación y Centro de Ayuda:** Integración de `docs/FAQ.md` y componente interactivo `FAQView` sincronizado dentro de la app.
* [x] **Transparencia Técnica:** Grafo de arquitectura en vivo con Canvas 2D interactivo (`AppArchitectureGraph`).

---

### v1.1.0 — Automatización Nativa y Notificaciones
* [ ] **Notificaciones Locales Programadas:**
  * Alertas matutinas (ej. 08:30) para revisar el primer paso del día.
  * Recordatorios vespertinos (ej. 20:00) para comprobar acuerdos y rutinas antes de cenar.
  * Uso de `@capacitor/local-notifications` con canales de prioridad configurables por el adulto.
* [ ] **Sonidos Retro 8-Bits:**
  * Efectos de audio retro sintetizados mediante Web Audio API al completar tareas o subir de nivel la mascota.
* [ ] **Exportación / Importación con Selector de Archivos:**
  * Integración con `@capacitor/filesystem` para guardar y cargar directamente archivos `.json` desde el almacenamiento del dispositivo.

---

### v1.2.0 — Sincronización Local P2P sin Nube
* [ ] **Sincronización por Código QR:**
  * Generación de código QR dinámico con snapshot encriptado para transferir datos entre el móvil del padre y la tablet del hijo sin cables ni internet.
* [ ] **Sincronización LAN / Wi-Fi Local:**
  * Detección mutua en la misma red Wi-Fi doméstica entre la versión web (`pasos-en-familia`) y la app móvil (`pasos`).
* [ ] **Widgets de Pantalla de Inicio:**
  * Widget de Android para visualizar el estado de la barra de progreso y la mascota directamente en el escritorio del móvil.
