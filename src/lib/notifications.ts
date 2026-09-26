import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleRoutineReminder(id: number, title: string, body: string, hour = 20, minute = 0) {
  try {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return false;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: {
            on: {
              hour,
              minute,
            },
            repeats: true,
          },
          smallIcon: 'ic_stat_icon',
          sound: 'beep.wav',
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
