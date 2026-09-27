import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const HAPTICS_STORAGE_KEY = 'pasos_haptics_enabled';

/**
 * Consulta si la retroalimentación háptica está habilitada globalmente.
 * Por defecto es true.
 */
export function isHapticsEnabled(): boolean {
  try {
    const val = localStorage.getItem(HAPTICS_STORAGE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Activa o desactiva la retroalimentación háptica globalmente.
 */
export function setHapticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignored in restricted environments
  }
}

export async function hapticTap(style: ImpactStyle = ImpactStyle.Light) {
  if (!isHapticsEnabled()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    // Silently ignore if not supported in browser
  }
}

export async function hapticSuccess() {
  if (!isHapticsEnabled()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Fallback
  }
}

export async function hapticWarning() {
  if (!isHapticsEnabled()) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Fallback
  }
}

export async function hapticVibrate(duration = 200) {
  if (!isHapticsEnabled()) return;
  try {
    await Haptics.vibrate({ duration });
  } catch {
    // Fallback
  }
}

/**
 * Pulso de prueba para verificar hápticos desde la pantalla de configuración.
 * Fuerza el pulso independientemente del estado previo para confirmar el hardware.
 */
export async function testHaptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Fallback
  }
}
