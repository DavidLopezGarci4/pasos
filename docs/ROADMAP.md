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

### v1.0.0 — Fundación Autónoma y Auditoría Integral
* [x] **Arquitectura Base:** Setup completo Vite + React 19 + Capacitor 7.
* [x] **Almacenamiento Offline Autónomo:** Persistencia en `localStorage` con motor de copias de seguridad JSON y compartición nativa (`@capacitor/share`).
* [x] **Roles y Seguridad:** Entornos diferenciados para adultos y niños, con aislamiento de tareas e historial para proteger la privacidad individual.
* [x] **Mascota Virtual 8-Bits:** Motor pixel-art con ciclos de evolución (Huevo → Bebé → Juvenil → Adulto), accesorios personalizables y mecánicas de energía/alimentación.
* [x] **Auditoría Dual Blind Judgment Day:** Eliminación de fugas de eventos en el botón 'Atrás' nativo, resolución de concurrencia en perfiles infantiles y validación de firma con `apksigner`.
* [x] **Documentación y Centro de Ayuda:** Integración de `docs/FAQ.md` y componente interactivo `FAQView` sincronizado dentro de la app.
* [x] **Transparencia Técnica:** Grafo de arquitectura en vivo con Canvas 2D interactivo (`AppArchitectureGraph`).

---

### v1.1.0 — Automatización, Identidad Visual y Ergonomía (Actual)
* [x] **Identidad Visual Dual:**
  * Icono estándar Android/PWA (Squircle) con emblema botánico y acentos de esfuerzo.
  * Icono versión Verticons (tarjeta vertical adaptada a pantallas alargadas de smartphone).
  * Selector instantáneo vía comandos npm (`npm run icon:normal` / `npm run icon:verticons`).
* [x] **Ergonomía de Pantalla y Barrera de 0.5 cm:**
  * Reserva de seguridad física de al menos `0.5cm` superior e inferior para proteger el reloj del móvil, el notch y los botones de navegación del sistema.
  * Bloqueo activo de desplazamiento y rebote vertical (anti-overscroll) en WebView y gestos táctiles.
  * Configuración de `StatusBar` sin superposición y casilla de control en Ajustes.
* [x] **Sonidos Retro 8-Bits:**
  * Síntesis de audio retro vía Web Audio API para toques y completado de tareas.
* [x] **Notificaciones Locales Programadas:**
  * Alertas matutinas y recordatorios vespertinos con `@capacitor/local-notifications`.

---

### v1.2.0 — Sincronización Local P2P sin Nube
* [ ] **Sincronización por Código QR:**
  * Generación de código QR dinámico con snapshot encriptado para transferir datos entre el móvil del padre y la tablet del hijo sin cables ni internet.
* [ ] **Sincronización LAN / Wi-Fi Local:**
  * Detección mutua en la misma red Wi-Fi doméstica entre la versión web (`pasos-en-familia`) y la app móvil (`pasos`).
* [ ] **Widgets de Pantalla de Inicio:**
  * Widget de Android para visualizar el estado de la barra de progreso y la mascota directamente en el escritorio del móvil.
