import { LocalNotifications } from '@capacitor/local-notifications';
import { getStoredFamily, saveStoredFamily, getActiveUser } from './mobile-storage';
import { submitTask } from './domain';

let initialized = false;

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch {
    return false;
  }
}

export async function initNotificationActions(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    // Registrar tipos de acciones interactivas para Android
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'ROUTINE_ACTIONS',
          actions: [
            {
              id: 'COMPLETE_TASK',
              title: '✓ Marcar Hecha',
            },
            {
              id: 'SNOOZE_TASK',
              title: '⏰ Posponer 15m',
            },
          ],
        },
      ],
    });

    // Escuchar acciones realizadas desde la cortina de notificaciones de Android
    LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
      try {
        const extra = action.notification.extra;
        if (action.actionId === 'COMPLETE_TASK') {
          const taskId = extra?.taskId;
          const childId = extra?.childId;
          const family = getStoredFamily();
          if (family && taskId) {
            const task = family.tasks.find((t) => t.id === taskId);
            const child = family.children.find((c) => c.id === childId) || family.children[0];
            const activeUser = getActiveUser() || { id: 'adult-auto', name: 'Adulto', role: 'parent' as const };
            if (task && child) {
              submitTask(family, taskId, activeUser, true, child.id);
              saveStoredFamily({ ...family });
            }
          }
        } else if (action.actionId === 'SNOOZE_TASK') {
          const snoozeDate = new Date(Date.now() + 15 * 60 * 1000);
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Date.now() % 100000),
                title: action.notification.title,
                body: `(Pospuesto 15 min) ${action.notification.body}`,
                schedule: { at: snoozeDate },
                actionTypeId: 'ROUTINE_ACTIONS',
                extra: action.notification.extra,
                smallIcon: 'ic_stat_icon',
                sound: 'beep.wav',
              },
            ],
          });
        }
      } catch (err) {
        console.warn('Error al procesar acción de notificación:', err);
      }
    });
  } catch (err) {
    console.warn('No se pudieron registrar acciones de notificación:', err);
  }
}

export async function scheduleRoutineReminder(
  id: number,
  title: string,
  body: string,
  hour = 20,
  minute = 0,
  extra?: { taskId?: string; childId?: string }
) {
  try {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return false;

    await initNotificationActions();

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
          actionTypeId: 'ROUTINE_ACTIONS',
          extra,
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
