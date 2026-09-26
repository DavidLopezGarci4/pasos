import React, { useState } from "react";
import { Icon } from "./icon";
import { hapticTap, hapticSuccess, hapticWarning } from "../lib/haptics";

interface PinModalProps {
  title?: string;
  subtitle?: string;
  expectedPin?: string;
  mode?: "verify" | "create";
  onSuccess: (pin: string) => void;
  onCancel: () => void;
}

export function PinModal({
  title = "Acceso Protegido",
  subtitle = "Introduce el código PIN de 4 dígitos para acceder a la zona de adultos",
  expectedPin,
  mode = "verify",
  onSuccess,
  onCancel,
}: PinModalProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    hapticTap();
    setError(null);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      // Evaluate PIN
      if (mode === "verify") {
        if (!expectedPin || newPin === expectedPin) {
          hapticSuccess();
          setTimeout(() => onSuccess(newPin), 150);
        } else {
          hapticWarning();
          setError("PIN incorrecto");
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin("");
          }, 600);
        }
      } else {
        // Mode create
        hapticSuccess();
        setTimeout(() => onSuccess(newPin), 150);
      }
    }
  };

  const handleDelete = () => {
    hapticTap();
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    hapticTap();
    setPin("");
    setError(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        backgroundColor: "rgba(10, 24, 18, 0.75)",
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
          maxWidth: 360,
          backgroundColor: "#ffffff",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          animation: shake ? "pin-shake 0.4s ease" : "appear 0.25s ease-out",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: "#edf2e8",
            color: "#416850",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon name="lock" size={26} />
        </div>

        <h3 style={{ margin: "0 0 6px 0", fontSize: 20, color: "var(--ink)", fontWeight: 700 }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>
          {subtitle}
        </p>

        {/* 4 dots display */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => {
            const filled = pin.length > i;
            return (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid #416850",
                  backgroundColor: filled ? "#416850" : "transparent",
                  transform: filled ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.15s ease",
                  boxShadow: filled ? "0 2px 8px rgba(65, 104, 80, 0.4)" : "none",
                }}
              />
            );
          })}
        </div>

        {error && (
          <div
            style={{
              color: "#b96e53",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              minHeight: 18,
            }}
          >
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            width: "100%",
            marginBottom: 20,
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              style={{
                height: 56,
                borderRadius: 16,
                border: "1px solid #e7eae3",
                backgroundColor: "#f7f8f4",
                color: "#233d33",
                fontSize: 22,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "manipulation",
              }}
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid transparent",
              backgroundColor: "transparent",
              color: "var(--muted)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Borrar
          </button>

          <button
            type="button"
            onClick={() => handleDigit("0")}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid #e7eae3",
              backgroundColor: "#f7f8f4",
              color: "#233d33",
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: "manipulation",
            }}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              height: 56,
              borderRadius: 16,
              border: "1px solid transparent",
              backgroundColor: "transparent",
              color: "var(--ink)",
              fontSize: 18,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Borrar dígito"
          >
            ⌫
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            onCancel();
          }}
          className="button secondary full small"
          style={{ borderRadius: 12 }}
        >
          Cancelar
        </button>
      </div>

      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
