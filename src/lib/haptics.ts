import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function hapticTap(style: ImpactStyle = ImpactStyle.Light) {
  try {
    await Haptics.impact({ style });
  } catch {
    // Silently ignore if not supported in browser
  }
}

export async function hapticSuccess() {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Fallback
  }
}

export async function hapticWarning() {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Fallback
  }
}

export async function hapticVibrate(duration = 200) {
  try {
    await Haptics.vibrate({ duration });
  } catch {
    // Fallback
  }
}
