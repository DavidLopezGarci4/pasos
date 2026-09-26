# Historial de Cambios (Changelog Técnico) - Pasos

Todos los cambios notables realizados en el proyecto Pasos están documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.2.0] - 2026-09-26 (build 10200)

### Added
- **PIN de Control Parental:** Teclado numérico táctil `PinModal` de 4 dígitos con micro-hápticos y animación de sacudida (*shake*).
- **Selector Rápido de Perfiles Familiares:** Selector interactivo de usuarios en barra lateral con bloqueo estricto al cambiar a perfiles de adulto.
- **Restauración de Copias SAF & Filesystem:** Integración con selector de archivos nativo de Android en pantalla de bienvenida y en ajustes, con snapshots directos en `Documents/Pasos/` vía `@capacitor/filesystem`.
- **Notificaciones Accionables Android:** Registro de tipos de acción `ROUTINE_ACTIONS` con botones `✓ Marcar Hecha` y `⏰ Posponer 15m` en la cortina del sistema.
- **Motor de Física de Partículas Canvas 2D:** Generador de confeti a 60 FPS con gravedad, resistencia de aire y rotación 3D para celebraciones (`src/lib/confetti.ts`).
- **Sensor Físico Acelerómetro:** Detección de agitación (*Shake to Play*) mediante evento nativo `devicemotion` en la consola de la mascota.
- **Integración Android 15 & Shortcuts:** Soporte de `enableOnBackInvokedCallback="true"`, atajos dinámicos de lanzador en `res/xml/shortcuts.xml` y deep links `pasos://`.
- **Changelog de Usuario:** Manifiesto declarativo `src/config/changelog.user.json` y componente modal de información `AboutModal`.

### Changed
- **Autonomía Offline 100%:** Eliminación de enlaces y peticiones CDN a Google Fonts en `index.html` e `index.css`, sustituidas por una pila tipográfica nativa de sistema ultra rápida.

---

## [1.1.1] - 2026-09-26 (build 10101)

### Fixed
- **Escala de Iconos Adaptativos:** Corrección del recorte en la zona segura (66dp dentro de 108dp) en `ic_launcher_foreground.xml` eliminando el fichero obsoleto en `drawable-v24/` y regenerando todos los mipmaps para sets Normal y Verticons.

---

## [1.1.0] - 2026-09-26 (build 10100)

### Added
- **Iconografía Dual:** Soporte de selector de icono normal (squircle) y Verticons (tarjeta vertical) vía `switch-icon.cjs`.
- **Barrera de 0.5 cm y Bloqueo Vertical:** Variables CSS `--safe-lock-top` y `--safe-lock-bottom` junto con módulo `screen-lock.ts` para evitar superposición con el reloj y botones de navegación.
- **Síntesis de Audio Retro 8-Bits:** Generación procedural de ondas de sonido con Web Audio API (`src/lib/sound.ts`).

---

## [1.0.0] - 2026-09-01 (build 10000)

### Added
- **Lanzamiento Inicial:** Aplicación Capacitor 7 con Vite y React 19 para gestión familiar offline.
- **Persistencia Local:** Almacenamiento seguro en dispositivo sin servidores remotos.
- **Mascota Virtual Tamagotchi 8-Bits:** Mecánicas de crianza, alimentación y personalización de accesorios.
- **Asistente de Rutinas y Hábitos:** Seguimiento visual de tareas, recompensas y proyectos familiares.
- **Diagnóstico de Arquitectura:** Integración no invasiva de visualizador `AppArchitectureGraph`.
