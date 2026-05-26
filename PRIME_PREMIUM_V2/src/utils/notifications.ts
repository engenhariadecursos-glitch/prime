import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PRIME Premium',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A00',
      sound: 'default',
    });
  }
  return true;
}

export async function scheduleRestTimerNotification(seconds: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 Descanso completo!',
      body: 'Hora do próximo set. Vamos lá!',
      sound: 'default',
      color: '#FF7A00',
    },
    trigger: { seconds, channelId: 'default' } as any,
  });
  return id;
}

export async function scheduleFastingEndNotification(durationMs: number, goalHours: number): Promise<string> {
  const seconds = Math.max(1, Math.floor(durationMs / 1000));
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏆 Jejum de ${goalHours}h concluído!`,
      body: 'Parabéns! Você completou seu jejum. Hora de se alimentar bem.',
      sound: 'default',
      color: '#FF7A00',
    },
    trigger: { seconds, channelId: 'default' } as any,
  });
  return id;
}

export async function scheduleWorkoutReminder(hour: number, minute: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Hora do treino!',
      body: 'Não quebre sua sequência. Você consegue!',
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: 'default',
    } as any,
  });
  return id;
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
