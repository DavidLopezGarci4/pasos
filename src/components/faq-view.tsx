import React, { useState } from "react";
import { Icon } from "./icon";
import { hapticTap } from "../lib/haptics";

interface FAQItem {
  q: string;
  points: string[];
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    title: "1. Seguridad, Privacidad y Almacenamiento Offline",
    items: [
      {
        q: "¿Dónde se guardan los datos de mi familia y de mis hijos?",
        points: [
          "Almacenamiento 100% local en tu dispositivo Android.",
          "Sin servidores ni nube externa: no se envían datos personales ni telemetría.",
          "Privacidad infantil total: diseñado sin rastreo ni analítica.",
        ],
      },
      {
        q: "¿Qué ocurre si no tengo conexión a internet o activo el modo avión?",
        points: [
          "Funcionamiento ininterrumpido: la APK opera completamente offline.",
          "Respuesta instantánea sin latencias de red.",
        ],
      },
    ],
  },
  {
    title: "2. Gestión de Perfiles y Roles (Padres e Hijos)",
    items: [
      {
        q: "¿Qué diferencias existen entre el rol de Adulto y el rol de Hijo?",
        points: [
          "Rol Adulto / Padre: Control administrativo total, creación de acuerdos, tareas, recompensas, ajustes y copias de seguridad.",
          "Rol Hijo: Espacio protegido donde solo visualiza sus tareas, su progreso, su saldo y su mascota virtual.",
        ],
      },
      {
        q: "¿Cómo se añade un nuevo hijo a la familia?",
        points: [
          "Accede a «Mi familia» con el perfil del adulto.",
          "Introduce nombre, edad, avatar emoji y meta acordada.",
          "El perfil queda inmediatamente sincronizado para iniciar sesión.",
        ],
      },
      {
        q: "¿Cómo cerrar sesión o cambiar de usuario con PIN parental?",
        points: [
          "Pulsa sobre tu nombre en la barra lateral para desplegar el selector de usuarios.",
          "Cambia directamente a los perfiles infantiles sin fricción.",
          "Para entrar a un perfil de adulto se solicita el PIN de 4 dígitos para proteger la privacidad.",
        ],
      },
    ],
  },
  {
    title: "3. Rutinas, Tareas y Notificaciones Accionables",
    items: [
      {
        q: "¿Cómo se crean tareas y rutinas acordadas?",
        points: [
          "En la sección «Rutinas y tareas» del adulto.",
          "Define señal o disparador (cuándo se hace) y primer paso pequeño.",
          "Elige frecuencia diaria o puntual y si requiere aprobación automática.",
        ],
      },
      {
        q: "¿Qué son las notificaciones accionables?",
        points: [
          "Los recordatorios en la cortina de Android incluyen botones de acción directa.",
          "Puedes pulsar «✓ Marcar Hecha» o «⏰ Posponer 15m» directamente sin abrir la app.",
        ],
      },
      {
        q: "¿Cómo funciona el asistente de rutinas a pantalla completa?",
        points: [
          "Modo guiado con temporizador pixel-art que acompaña al niño paso a paso.",
          "Al terminar todos los pasos del día, celebra con un motor de partículas de confeti Canvas 2D.",
        ],
      },
    ],
  },
  {
    title: "4. La Barra de Progreso y Reconocimiento de Esfuerzo",
    items: [
      {
        q: "¿Cómo funciona la barra de progreso de 0 a 100?",
        points: [
          "Empieza en 50 puntos de base.",
          "Zona acordada (60 puntos): cumplimiento de acuerdos familiares.",
          "Zona meta (85 puntos): reconocimiento a la constancia y autonomía.",
        ],
      },
      {
        q: "¿Qué diferencia hay entre los puntos de la barra y el saldo de recompensas?",
        points: [
          "La barra refleja el esfuerzo reciente (0 a 100).",
          "El saldo acumula puntos ganados para canjear en el catálogo de premios.",
          "Los ajustes negativos en la barra nunca restan saldo de premios ya conseguido.",
        ],
      },
    ],
  },
  {
    title: "5. Mascota Virtual 8-Bits y Sensor de Movimiento (Acelerómetro)",
    items: [
      {
        q: "¿Cómo se adopta y evoluciona la mascota?",
        points: [
          "Cada hijo elige su mascota (🦊 Zorro, 🐼 Panda, 🐉 Dragón, 🐱 Gato, 🦉 Búho).",
          "Evolución por niveles de XP: Huevo (0-24) → Bebé (25-74) → Juvenil (75-149) → Adulto (150+ XP).",
        ],
      },
      {
        q: "¿Cómo funciona el sensor físico Shake to Play?",
        points: [
          "En la consola de la mascota, agita físicamente tu smartphone Android para jugar.",
          "El acelerómetro detecta la sacudida y otorga XP y felicidad con vibración háptica.",
        ],
      },
    ],
  },
  {
    title: "6. Copias de Seguridad, Respaldo en Disco y Restauración SAF",
    items: [
      {
        q: "¿Cómo respaldo mis datos en el dispositivo?",
        points: [
          "En «Ajustes», pulsa «Guardar en almacenamiento» para escribir en Documents/Pasos.",
          "O usa «Compartir archivo» para enviarlo por WhatsApp o guardarlo en Drive.",
        ],
      },
      {
        q: "¿Cómo restauro una copia de seguridad existente (.json)?",
        points: [
          "En la pantalla de bienvenida o en «Ajustes», pulsa «Restaurar copia (.json)».",
          "Selecciona el archivo desde tu explorador de archivos nativo de Android.",
        ],
      },
    ],
  },
  {
    title: "7. Catálogo de Recompensas y Canjes",
    items: [
      {
        q: "¿Cómo se solicitan y canjean premios?",
        points: [
          "El niño selecciona una recompensa de su catálogo y pulsa «Pedir canje».",
          "El adulto revisa y aprueba la solicitud en la pestaña «Solicitudes».",
        ],
      },
    ],
  },
  {
    title: "8. Ergonomía, Barrera de 0.5 cm y Transparencia Técnica",
    items: [
      {
        q: "¿Para qué sirve la reserva de 0.5 cm y el bloqueo vertical?",
        points: [
          "Reserva física arriba y abajo para no tapar el reloj ni los botones de navegación.",
          "Bloquea rebotes parásitos para una experiencia fluida tipo app nativa.",
          "Compatible con gestos predictivos de Android 15.",
        ],
      },
      {
        q: "¿Cómo inspeccionar la salud del stack móvil?",
        points: [
          "En «Ajustes», pulsa «Stack Móvil Nativo» para abrir el grafo Canvas 2D en tiempo real.",
        ],
      },
    ],
  },
  {
    title: "9. Acerca de la App y Novedades de la Versión",
    items: [
      {
        q: "¿Cómo consultar el historial de versiones y novedades?",
        points: [
          "Pulsa el botón «v1.2.0 · Novedades» en la barra superior o en «Ajustes».",
          "Visualiza las mejoras de la versión actual y el historial desplegable en acordeón.",
          "Accede en 1 toque al diagnóstico de la arquitectura y la política de privacidad local.",
        ],
      },
    ],
  },
];

export function FAQView() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    hapticTap();
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="faq-container">
      <div className="page-heading">
        <div>
          <div className="date-label">CENTRO DE AYUDA OFICIAL</div>
          <h1>Preguntas Frecuentes y Guía de Uso</h1>
          <p>Todo lo que necesitas saber sobre las funciones activas de Pasos APK.</p>
        </div>
        <div className="page-flower">📖</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {FAQ_DATA.map((section, sIdx) => (
          <section className="panel" key={sIdx}>
            <h3 style={{ marginBottom: 14, color: "var(--ink)" }}>{section.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {section.items.map((item, iIdx) => {
                const key = `${sIdx}-${iIdx}`;
                const isOpen = !!openItems[key];
                return (
                  <div
                    key={iIdx}
                    style={{
                      border: "1px solid var(--edge)",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    >
                      <span>{item.q}</span>
                      <span style={{ fontSize: 16, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 14px 14px 14px",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          marginTop: 4,
                        }}
                      >
                        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                          {item.points.map((pt, pIdx) => (
                            <li key={pIdx} style={{ lineHeight: 1.5 }}>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
