import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prime', {
      name: 'Prime Jejum & Fitness',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHydrationReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const hours = [8, 10, 12, 14, 16, 18, 20];
  for (const hour of hours) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Hora de Hidratar!',
        body: 'Beba pelo menos 250ml de água agora. A hidratação é essencial durante o jejum.',
        sound: true,
      },
      trigger: {
        hour,
        minute: 0,
        repeats: true,
      },
    });
  }
}

export async function scheduleFastingMilestone(
  startTime: number,
  targetHours: number
) {
  const milestones = [
    { hours: 12, msg: '⚡ 12 horas de jejum! Cetose leve iniciada. Continue firme!' },
    { hours: 16, msg: '🔥 16 horas! Você está queimando gordura como campeão!' },
    { hours: 18, msg: '💜 18 horas! Cetose profunda ativada. Incrível!' },
    { hours: 24, msg: '🏆 24 HORAS! Um dia completo de jejum. Você é elite!' },
    { hours: 36, msg: '🔄 36 horas! Autofagia iniciada. Renovação celular em curso!' },
    { hours: 48, msg: '⭐ 48 horas! 2 dias! Limpeza celular profunda acontecendo!' },
    { hours: 72, msg: '🧠 72 horas! Pico de foco mental. Você transcendeu!' },
  ];

  for (const m of milestones) {
    if (m.hours <= targetHours) {
      const trigger = new Date(startTime + m.hours * 60 * 60 * 1000);
      if (trigger > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎯 Marco do Jejum!',
            body: m.msg,
            sound: true,
          },
          trigger,
        });
      }
    }
  }
}

export async function scheduleWorkoutReminder(hour = 7) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 Hora do Treino!',
      body: 'Seu treino de hoje está esperando por você. Vamos nessa!',
      sound: true,
    },
    trigger: {
      hour,
      minute: 0,
      repeats: true,
    },
  });
}

export async function sendMotivational() {
  const messages = [
    'A disciplina é a ponte entre metas e conquistas. 🏆',
    'Cada hora de jejum é uma vitória sobre a mente. ⚡',
    'Seu corpo está se transformando. Confie no processo. 💪',
    'Grandes resultados exigem grandes comprometimentos. 🔥',
    'Você já chegou até aqui. Não pare agora. 💎',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✨ Prime Motivação',
      body: msg,
      sound: true,
    },
    trigger: { seconds: 1 },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
