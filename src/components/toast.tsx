import React, { useState, useEffect } from "react";
import { hapticSuccess, hapticWarning, hapticTap } from "../lib/haptics";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export function showToast(text: string, type: ToastType = "success", duration = 3200) {
  const toast: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    type,
    duration,
  };

  if (type === "success") {
    hapticSuccess();
  } else if (type === "warning" || type === "error") {
    hapticWarning();
  } else {
    hapticTap();
  }

  listeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast: ToastListener = (newToast) => {
      setToasts((prev) => [...prev.slice(-2), newToast]); // Máximo 3 en pantalla

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 3200);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "max(16px, var(--safe-lock-top, 16px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "90%",
        maxWidth: "420px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        let bg = "#233d33";
        let icon = "✓";
        let borderColor = "#416850";

        if (toast.type === "error") {
          bg = "#802b1c";
          icon = "✕";
          borderColor = "#b96e53";
        } else if (toast.type === "warning") {
          bg = "#6e4719";
          icon = "⚠️";
          borderColor = "#f4be5e";
        } else if (toast.type === "info") {
          bg = "#1b332b";
          icon = "ℹ️";
          borderColor = "#729879";
        }

        return (
          <div
            key={toast.id}
            onClick={() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              background: bg,
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: "14px",
              border: `1.5px solid ${borderColor}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "13px",
              fontWeight: 600,
              lineHeight: "1.4",
              animation: "toastIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
            <span style={{ flex: 1 }}>{toast.text}</span>
          </div>
        );
      })}
    </div>
  );
}
