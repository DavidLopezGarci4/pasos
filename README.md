# Pasos · Crecemos en familia 📱🌱

> Aplicación móvil nativa para Android (APK/Capacitor 7) orientada a acompañar hábitos positivos, fomentar la autonomía infantil y celebrar el esfuerzo diario en familia con privacidad total y funcionamiento 100% offline.

---

## 🌟 Características Principales

* 🔒 **Control Parental con PIN Táctil (4 Dígitos):** Teclado numérico táctil accesible (`PinModal`) con vibración micro-háptica y animación de sacudida (*shake*) para proteger el acceso a las funciones de administración, acuerdos y ajustes.
* 👥 **Selector Rápido de Perfiles Familiares:** Alternancia fluida entre padres e hijos directamente desde la barra lateral, con bloqueo estricto al seleccionar perfiles adultos.
* 📥 **Restauración de Copias SAF & Filesystem:** Selector de archivos nativo de Android en pantalla de bienvenida y en Ajustes para recuperar copias `.json`, junto con exportación directa en `Documents/Pasos/` vía `@capacitor/filesystem`.
* ⚡ **Notificaciones Accionables de Android:** Recordatorios interactivos de rutinas con botones directos `✓ Marcar Hecha` y `⏰ Posponer 15m` en la cortina del sistema sin necesidad de abrir la aplicación.
* 🎮 **Sensor de Movimiento (Acelerómetro - Shake to Play):** Agita físicamente el smartphone para interactuar y jugar con la mascota virtual pixel-art.
* 🎉 **Motor de Confeti Canvas 2D:** Partículas físicas a 60 FPS con gravedad, resistencia al aire y rotación 3D para celebrar rutinas completadas y logros.
* 🚀 **Integración Android 15 & App Shortcuts:** Atajos dinámicos de lanzador para abrir directamente *Rutinas* y *Mascota*, y soporte nativo de gestos predictivos hacia atrás (`enableOnBackInvokedCallback`).
* 🛡️ **Ergonomía de Pantalla y Barrera de 0.5 cm:** Reserva física de medio centímetro arriba y abajo para proteger el reloj del móvil y los botones del sistema, con bloqueo activo de desplazamiento y rebote vertical (anti-overscroll).
* ℹ️ **Modal Acerca de & Novedades:** Información transparente para el usuario final con tarjeta destacada de mejoras, historial de versiones en acordeón y enlace al diagnóstico de arquitectura en tiempo real.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend Móvil** | React 19, TypeScript, Vite 6, CSS3 Moderno (Variables CSS) |
| **Contenedor Nativo** | Capacitor 7 (`@capacitor/android`, `@capacitor/app`, `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/local-notifications`, `@capacitor/share`, `@capacitor/status-bar`) |
| **Plataforma Android** | Android SDK 34 / 35, Java 21 / OpenJDK |
| **Almacenamiento** | Persistencia local autónoma con snapshots JSON y Storage Access Framework |
| **Firma & Empaquetado** | Gradle 8.11, `apksigner`, `zipalign`, pipeline automatizado versionado |

---

## 📂 Estructura del Proyecto

```text
pasos/
├── android/                   # Proyecto nativo Android Studio / Gradle
│   ├── app/src/main/res/      # Iconos adaptativos mipmap, shortcuts.xml, strings
│   └── app/build.gradle       # Configuración de compilación, versionCode y versionName
├── docs/                      # Documentación del proyecto
│   ├── FAQ.md                 # Preguntas Frecuentes y Guía de Herramientas (10 secciones)
│   └── ROADMAP.md             # Hoja de ruta estratégica y evolución de versiones
├── scripts/                   # Scripts de automatización
│   ├── build-apk.cjs          # Compilación, sincronización y firma release con apksigner
│   ├── switch-icon.cjs        # Conmutador instantáneo de icono (normal / verticons)
│   └── generate-icons.py      # Generador de mipmaps adaptativos multiresolución
├── src/
│   ├── components/            # Componentes React (Portal, RoutineRunner, PetConsole, PinModal, AboutModal, FAQView...)
│   ├── config/                # Manifiestos de usuario (changelog.user.json, stack.config.json)
│   ├── lib/                   # Lógica de dominio, almacenamiento, sonido 8-bits, notificaciones, confeti
│   └── App.tsx                # Raíz de la app con listeners nativos y gestión de estado
├── CHANGELOG.md               # Historial de cambios técnico (Keep a Changelog)
├── package.json               # Configuración npm y versión canónica SemVer
└── pasos-release.apk          # APK compilada y firmada lista para instalar en Android
```

---

## 🚀 Comandos de Desarrollo y Compilación

```bash
# Iniciar servidor de desarrollo en navegador local
npm run dev

# Validar tipos TypeScript y compilar bundle web Vite
npm run build

# Sincronizar bundle web con el proyecto nativo Android
npm run sync

# Compilar, optimizar y firmar APK release v1.2.0
npm run release
# o bien: npm run build:apk

# Cambiar estilo de icono de la aplicación
npm run icon:normal      # Emblema botánico estándar (Squircle)
npm run icon:verticons   # Tarjeta vertical adaptada a pantallas alargadas

# Abrir proyecto en Android Studio
npm run open:android
```

---

## 📚 Documentación de Referencia

* [Preguntas Frecuentes y Guía de Uso (FAQ)](file:///C:/Users/dace8/OneDrive/Documentos/Antigravity/pasos/docs/FAQ.md)
* [Hoja de Ruta Estratégica (Roadmap)](file:///C:/Users/dace8/OneDrive/Documentos/Antigravity/pasos/docs/ROADMAP.md)
* [Historial Técnico de Versiones (CHANGELOG.md)](file:///C:/Users/dace8/OneDrive/Documentos/Antigravity/pasos/CHANGELOG.md)
* [Novedades para el Usuario (changelog.user.json)](file:///C:/Users/dace8/OneDrive/Documentos/Antigravity/pasos/src/config/changelog.user.json)
