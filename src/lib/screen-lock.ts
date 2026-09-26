/**
 * Screen Lock & Safe Margins Handler (0.5cm boundary lock)
 * Bloquea el desplazamiento vertical no deseado (rebote/overscroll de WebView)
 * y garantiza una reserva de al menos medio centímetro (0.5cm) por encima
 * (reloj del móvil / status bar) y por debajo (botones de navegación Android).
 */

const STORAGE_KEY = "pasos_screen_lock_margins";

export function getScreenLockSetting(familySetting?: boolean): boolean {
  if (familySetting !== undefined) return familySetting;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === "true";
  }
  return true; // Activado por defecto para máxima ergonomía móvil
}

export function setScreenLockSetting(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
  applyScreenLock(enabled);
}

let touchStartY = 0;
let touchListenerAttached = false;

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length !== 1) return;
  const touchY = e.touches[0].clientY;
  const deltaY = touchY - touchStartY;
  
  // Elemento objetivo o contenedor con scroll
  let target = e.target as HTMLElement | null;
  let scrollableParent: HTMLElement | null = null;

  while (target && target !== document.body && target !== document.documentElement) {
    const overflowY = window.getComputedStyle(target).overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && target.scrollHeight > target.clientHeight) {
      scrollableParent = target;
      break;
    }
    target = target.parentElement;
  }

  const scrollContainer = scrollableParent || document.documentElement;
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  // Bloquear desplazamiento parásito hacia abajo cuando ya se está en el tope superior
  if (deltaY > 0 && scrollTop <= 0) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }

  // Bloquear desplazamiento parásito hacia arriba cuando ya se está en el fondo inferior
  if (deltaY < 0 && scrollTop + clientHeight >= scrollHeight - 1) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
}

export function applyScreenLock(enabled: boolean): void {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add("screen-locked-margins");
    if (!touchListenerAttached && typeof window !== "undefined") {
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      touchListenerAttached = true;
    }
  } else {
    root.classList.remove("screen-locked-margins");
    if (touchListenerAttached && typeof window !== "undefined") {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      touchListenerAttached = false;
    }
  }
}
