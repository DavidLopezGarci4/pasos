# Preguntas Frecuentes y Guía de Herramientas (FAQ) — Pasos Móvil (APK)

> Guía de referencia rápida y operativa sobre todas las funciones activas en la versión oficial de Pasos APK.  
> **Versión:** `v1.2.0` • **Módulos Auditados:** 11/11 • **Guías Operativas:** 20 temas • **Actualizado:** 27 de Septiembre de 2026

---

## Índice Rápido
1. [Seguridad y Almacenamiento Offline](#1-seguridad-y-almacenamiento-offline)
2. [Perfiles, Selector y PIN Parental](#2-perfiles-selector-y-pin-parental)
3. [Rutinas, Tareas y Asistente Guiado](#3-rutinas-tareas-y-asistente-guiado)
4. [Notificaciones y Atajos de Android](#4-notificaciones-y-atajos-de-android)
5. [Barra de Progreso y Reconocimiento](#5-barra-de-progreso-y-reconocimiento)
6. [Mascota Virtual 8-Bits y Sensor Físico](#6-mascota-virtual-8-bits-y-sensor-físico)
7. [Catálogo de Recompensas y Canjes](#7-catálogo-de-recompensas-y-canjes)
8. [Copias de Seguridad y Restauración SAF](#8-copias-de-seguridad-y-restauración-saf)
9. [Ergonomía, Bloqueo 0.5 cm y Stack Nativo](#9-ergonomía-bloqueo-05-cm-y-stack-nativo)
10. [Iconos Verticons y Versión Release](#10-iconos-verticons-y-versión-release)
11. [Acerca de Pasos y Novedades](#11-acerca-de-pasos-y-novedades)

---

## 1. Seguridad y Almacenamiento Offline

### ¿Dónde se guardan los datos de mi familia y de mis hijos?
* **Almacenamiento 100% local:** Toda la información (perfiles, historial, tareas, mascotas y configuración) se guarda de manera autónoma en el almacenamiento del dispositivo Android.
* **Sin servidores ni nube externa:** La aplicación no transmite ningún dato personal, identificador o métrica a servidores externos. No requiere conexión a internet para funcionar.
* **Privacidad infantil total:** Cumple con las normativas más estrictas de protección de datos infantiles al operar sin telemetría ni rastreadores.

### ¿Qué ocurre si no tengo conexión a internet o activo el modo avión?
* **Funcionamiento ininterrumpido:** La APK está diseñada para ser plenamente autónoma sin red Wi-Fi ni cobertura.
* **Cero dependencias remotas:** Las fuentes tipográficas y elementos gráficos están empaquetados localmente, eliminando tiempos de espera de red.

---

## 2. Perfiles, Selector y PIN Parental

### ¿Cómo funciona el PIN de control parental?
* **Bloqueo de seguridad de 4 dígitos:** Impide que los menores alteren la configuración familiar, creen acuerdos o modifiquen puntos.
* **Teclado numérico táctil:** Interfaz accesible (`PinModal`) con vibración micro-háptica y animación de sacudida si el PIN introducido no coincide.
* **Gestión desde Ajustes:** El adulto puede cambiar el PIN en cualquier momento desde «Ajustes» → «Seguridad y Control Parental».

### ¿Cómo cambiar rápidamente entre miembros de la familia?
* **Selector en el menú lateral:** Pulsa sobre tu nombre de usuario en la barra lateral para desplegar la lista de miembros de la familia.
* **Cambio ágil a hijos:** Al pulsar sobre un hijo se cambia de inmediato a su espacio personalizado sin fricción.
* **Acceso restringido a adultos:** Al intentar cambiar a un perfil de adulto se solicita obligatoriamente el PIN parental.

---

## 3. Rutinas, Tareas y Asistente Guiado

### ¿Cómo se crean acuerdos y rutinas diarias?
* **Desde la sección «Rutinas y tareas»:** Disponible para perfiles de adulto.
* **Estructura del acuerdo:**
  * *Título claro:* Describe la acción observable (ej. «Preparar la mochila»).
  * *Puntos asignados:* Valor concedido al completarse (de 1 a 100).
  * *Señal o momento:* Cuándo realizar la tarea (ej. «Antes de cenar»).
  * *Primer paso observable:* Acción sencilla para iniciar (ej. «Abrir la agenda»).
  * *Frecuencia:* «Diaria» o «Puntual».
  * *Aprobación:* Automática o mediante revisión parental.

### ¿Qué es el Asistente de Rutinas a pantalla completa?
* **Modo enfoque guiado:** Permite a los niños recorrer sus hábitos del día paso a paso con temporizador integrado y retroalimentación háptica.
* **Celebración con física de confeti:** Al completar la última tarea de la rutina, se lanza un efecto de confeti 60 FPS en Canvas 2D con sonido triunfal 8-bits.

---

## 4. Notificaciones y Atajos de Android

### ¿Qué son las notificaciones accionables de Android?
* **Acciones directas en la cortina:** Las notificaciones de recordatorio de rutinas incluyen botones interactivos sin abrir la app:
  * *✓ Marcar Hecha:* Registra el paso como completado instantáneamente.
  * *⏰ Posponer 15m:* Programa automáticamente un nuevo recordatorio tras 15 minutos.

### ¿Cómo funcionan los atajos de la pantalla de inicio (App Shortcuts)?
* **Pulsación larga en el icono:** En el lanzador de Android, mantén pulsado el icono de Pasos para desplegar accesos directos:
  * *Rutinas:* Inicia de inmediato el asistente de rutinas diarias.
  * *Mascota:* Abre directamente la consola de la mascota virtual.

---

## 5. Barra de Progreso y Reconocimiento

### ¿Cómo se interpretan las zonas de la barra de progreso?
* **Escala de 0 a 100:** Cada jornada empieza en 50 puntos (neutro).
* **Zona acordada (60 puntos):** Nivel que representa el cumplimiento de acuerdos básicos.
* **Zona meta (85 puntos):** Nivel que reconoce un esfuerzo destacado y constancia sobresaliente.

### ¿Qué diferencia hay entre la barra y el saldo de recompensas?
* **La barra mide el esfuerzo diario:** Termómetro dinámico de 0 a 100 puntos.
* **El saldo acumula puntos ganados:** Se utiliza para canjear premios en el catálogo pactado.
* **Independencia de saldo:** Los ajustes negativos en la barra nunca restan saldo de premios ya consolidado por el menor.

---

## 6. Mascota Virtual 8-Bits y Sensor Físico

### ¿Cómo evoluciona la mascota virtual pixel-art?
* **5 Especies disponibles:** Cada hijo puede adoptar un 🦊 Zorro, 🐼 Panda, 🐉 Dragón, 🐱 Gato o 🦉 Búho.
* **4 Etapas de crecimiento por XP:** Huevo (0 XP) → Bebé (25 XP) → Juvenil (60 XP) → Adulto (120 XP).
* **Energía recargable:** Cada tarea completada recarga +1 punto de energía para interactuar y jugar con la mascota.

### ¿Cómo funciona el sensor físico Shake to Play?
* **Detección por acelerómetro:** Al agitar físicamente el móvil con la pantalla de la mascota abierta, el sensor de movimiento detecta la sacudida y juega con la mascota automáticamente (+5 XP y +15 de felicidad), acompañado de vibración háptica.

---

## 7. Catálogo de Recompensas y Canjes

### ¿Cómo se solicitan y aprueban los canjes?
* **Petición del hijo:** El niño selecciona una recompensa de su catálogo y pulsa «Pedir canje» cuando tiene saldo suficiente.
* **Validación parental:** El adulto revisa la solicitud en la pestaña «Solicitudes», pudiendo aprobarla, posponerla o marcarla como entregada.

---

## 8. Copias de Seguridad y Restauración SAF

### ¿Cómo respaldar los datos en el dispositivo?
* **Guardar en almacenamiento del dispositivo:** Guarda un snapshot `.json` en `Documents/Pasos/` mediante el botón «Guardar en almacenamiento».
* **Compartir archivo o copiar JSON:** Comparte el archivo por WhatsApp, Google Drive, correo o copia el texto al portapapeles.

### ¿Cómo restaurar una copia previa (.json)?
* **Restauración con selector de archivos (SAF):**
  * *Desde la bienvenida:* Pulsa «¿Ya tienes una copia de seguridad? Restaurar (.json)».
  * *Desde Ajustes:* Pulsa «Restaurar copia (.json)» para importar cualquier copia previa con el explorador nativo de Android.

---

## 9. Ergonomía, Bloqueo 0.5 cm y Stack Nativo

### ¿Para qué sirve la reserva física de 0.5 cm y el bloqueo vertical?
* **Protección del reloj y la barra de navegación:** La app reserva medio centímetro físico arriba y abajo para evitar que el contenido tape la hora del móvil o los gestos del sistema.
* **Anti-overscroll:** Bloquea rebotes parásitos para garantizar una navegación táctil sólida y fluida.
* **Gestos predictivos Android 15:** Totalmente compatible con la navegación moderna por gestos (`enableOnBackInvokedCallback`).

### ¿Cómo auditar la salud del stack tecnológico de la app?
* **Grafo de Arquitectura Canvas:** En «Ajustes», pulsa «Stack Móvil Nativo» para abrir el mapa interactivo Canvas 2D en tiempo real con diagnóstico de plugins y almacenamiento.

---

## 10. Iconos Verticons y Versión Release

### ¿Qué es el icono Verticons y en qué se diferencia del estándar?
* **Formato tarjeta 2:3 vertical:** Presenta la app como una tarjeta coleccionable premium en proporción 2:3 estricta (800×1200 px), sin paddings residuales.
* **Zona segura adaptativa (68%):** Centrado y escalado al 68% de altura en la cuadrícula de 108dp para que ningún lanzador de Android recorte la ilustración.
* **Fondo por color (#0A150F):** Elimina cualquier rectángulo verde plano de versiones antiguas asegurando un contraste impecable.

### ¿Cómo se distribuyen y firman las versiones de la APK?
* **Pipeline dual de compilación:** Cada release genera dos APKs firmadas con `apksigner`:
  * `pasos-v1.2.0-verticons-release.apk` (icono Verticons tarjeta 2:3).
  * `pasos-v1.2.0-standard-release.apk` (icono estándar squircle redondeado).

---

## 11. Acerca de Pasos y Novedades

### ¿Dónde puedo ver las novedades de la versión instalada?
* **Acceso desde la cabecera:** Pulsa en el botón «v1.2.0 · Novedades» situado en la barra superior.
* **Acceso desde Ajustes:** En la sección «Transparencia Técnica», pulsa «Acerca de Pasos y Novedades».
* **Historial accesible:** Muestra las mejoras de la versión explicadas de forma sencilla y directa, con un acordeón de versiones anteriores (`v1.1.1`, `v1.1.0`, `v1.0.0`).
* **Diagnóstico en 1 toque:** Incluye acceso directo para evaluar la salud de la arquitectura nativa.
