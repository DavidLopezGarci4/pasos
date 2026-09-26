import React, { useState } from "react";
import userChangelog from "../config/changelog.user.json";
import { Icon } from "./icon";
import { hapticTap } from "../lib/haptics";

interface AboutModalProps {
  onClose: () => void;
  onOpenArchitecture?: () => void;
}

export function AboutModal({ onClose, onOpenArchitecture }: AboutModalProps) {
  const [openVersion, setOpenVersion] = useState<string | null>(null);

  const toggleVersion = (ver: string) => {
    hapticTap();
    setOpenVersion((prev) => (prev === ver ? null : ver));
  };

  const currentVersionData = userChangelog.versions[0];
  const previousVersions = userChangelog.versions.slice(1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(10, 24, 18, 0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "max(0.5cm, env(safe-area-inset-top, 20px)) 16px max(0.5cm, env(safe-area-inset-bottom, 20px)) 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          backgroundColor: "#ffffff",
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "appear 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fafbf9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: "#eaf2e8",
                color: "#416850",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🌱
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 750, color: "var(--ink)" }}>
                Acerca de & Novedades
              </h3>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Pasos · Crecemos en familia</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            style={{
              border: 0,
              background: "transparent",
              padding: 8,
              borderRadius: "50%",
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Cerrar"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Identity & Badges */}
          <div>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--body)", lineHeight: 1.5 }}>
              {userChangelog.appDescription}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span className="pill green" style={{ fontSize: 11, fontWeight: 700 }}>
                v{userChangelog.currentVersion}
              </span>
              <span className="pill" style={{ fontSize: 11 }}>
                Build {userChangelog.buildNumber}
              </span>
              <span className="pill" style={{ fontSize: 11 }}>
                Android APK
              </span>
              <span className="pill green" style={{ fontSize: 11 }}>
                100% Offline & Privada
              </span>
            </div>
          </div>

          {/* Current Version Hero Card */}
          {currentVersionData && (
            <div
              style={{
                borderRadius: 16,
                border: "1.5px solid #b6c9aa",
                backgroundColor: "#f7faf5",
                padding: "18px 20px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span className="eyebrow" style={{ color: "#416850", fontSize: 9 }}>
                  ⭐ NOVEDADES DE LA VERSIÓN ACTUAL
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
                  {currentVersionData.date}
                </span>
              </div>
              <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 750, color: "var(--ink)" }}>
                {currentVersionData.title}
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {currentVersionData.highlights.map((item, idx) => (
                  <li key={idx} style={{ fontSize: 12, lineHeight: 1.45, color: "#2d4436" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous Versions Accordion */}
          {previousVersions.length > 0 && (
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 8, fontSize: 9 }}>
                HISTORIAL DE VERSIONES ANTERIORES
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {previousVersions.map((v) => {
                  const isOpen = openVersion === v.version;
                  return (
                    <div
                      key={v.version}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleVersion(v.version)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: 0,
                          backgroundColor: isOpen ? "#f6f8f4" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong style={{ fontSize: 13, color: "var(--ink)" }}>v{v.version}</strong>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>· {v.title}</span>
                        </div>
                        <span style={{ fontSize: 14, color: "var(--muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                          ▾
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--line)", backgroundColor: "#fafbf9" }}>
                          <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                            {v.highlights.map((h, i) => (
                              <li key={i} style={{ fontSize: 11.5, color: "var(--body)", lineHeight: 1.4 }}>
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tech Stack Health Button */}
          {onOpenArchitecture && (
            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
              <button
                type="button"
                className="button secondary full small"
                onClick={() => {
                  hapticTap();
                  onOpenArchitecture();
                }}
                style={{ borderRadius: 10, gap: 8 }}
              >
                <span>🔍</span> Inspeccionar Salud de la Arquitectura
              </button>
            </div>
          )}

          {/* Privacy & Legal Footer */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#edf2e8",
              borderRadius: 12,
              fontSize: 11,
              color: "#416850",
              lineHeight: 1.4,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <span>🛡️</span>
            <span>{userChangelog.privacyPolicy}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--line)",
            backgroundColor: "#fafbf9",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="button primary small"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            style={{ minWidth: 100 }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
