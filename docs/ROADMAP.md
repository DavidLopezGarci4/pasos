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

### v1.1.0 — Automatización, Identidad Visual y Ergonomía
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

### v1.2.0 — Características Frontera Mobile & Seguridad de Datos (Actual)
* [x] **Autonomía Offline Absoluta (0% Red):**
  * Retirada total de dependencias CDN de Google Fonts en favor de una pila tipográfica nativa de sistema de alto rendimiento sin retardos de red.
* [x] **PIN Parental y Blindaje de Perfil Adulto:**
  * Modal táctil de 4 dígitos (`PinModal`) con teclado numérico nativo, retroalimentación micro-háptica y animación de sacudida (shake) en caso de PIN incorrecto.
  * Selector interactivo de miembros de la familia con bloqueo por PIN al intentar ingresar al perfil de adulto desde perfiles infantiles.
  * Gestión y actualización del PIN desde la pestaña de Ajustes.
* [x] **Restauración de Copias de Seguridad (SAF / File Picker):**
  * Selector de archivos nativo para importar backups `.json` en pantalla de bienvenida y en Ajustes.
  * Guardado automático de snapshot en almacenamiento local (`Documents/Pasos/`) mediante `@capacitor/filesystem`.
* [x] **Notificaciones Accionables e Interactivas de Android:**
  * Registro de tipos de acción Android (`ROUTINE_ACTIONS`) con botones directos '✓ Marcar Hecha' y '⏰ Posponer 15m' en la cortina de notificaciones.
  * Procesamiento en segundo plano de tareas marcadas o pospuestas.
* [x] **Motor de Física de Partículas Canvas 2D:**
  * Celebración de confeti a 60 FPS con gravedad, resistencia al aire, rotación 3D y ráfagas micro-hápticas al completar rutinas y aprobar solicitudes.
* [x] **Sensor Físico Acelerómetro (Shake to Play):**
  * Detección de agitación del dispositivo vía `devicemotion` para jugar e interactuar físicamente con la mascota virtual.
* [x] **Integración Android 15 & App Shortcuts:**
  * Atajos dinámicos de lanzador (`shortcuts.xml`) para abrir directamente 'Rutinas' y 'Mascota'.
  * Compatibilidad con gestos predictivos de Android 14+ y 15 (`enableOnBackInvokedCallback="true"`).
* [x] **Modal Acerca de & Changelog de Usuario:**
  * Componente nativo `AboutModal` con tarjeta destacada de novedades para humanos (`changelog.user.json`), historial en acordeón y enlace al diagnóstico en tiempo real de la arquitectura.

---

### v1.3.0 — Sincronización Local P2P sin Nube
* [ ] **Sincronización por Código QR:**
  * Generación de código QR dinámico con snapshot encriptado para transferir datos entre el móvil del padre y la tablet del hijo sin cables ni internet.
* [ ] **Sincronización LAN / Wi-Fi Local:**
  * Detección mutua en la misma red Wi-Fi doméstica entre la versión web (`pasos-en-familia`) y la app móvil (`pasos`).
* [ ] **Widgets de Pantalla de Inicio:**
  * Widget de Android para visualizar el estado de la barra de progreso y la mascota directamente en el escritorio del móvil.
