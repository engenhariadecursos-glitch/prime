import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prime', {
        name: 'Prime Jejum & Fitness',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync('prime_hydration', {
        name: 'Hidratação',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync('prime_electrolytes', {
        name: 'Eletrólitos',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleHydrationReminders(): Promise<void> {
  const hours = [8, 10, 12, 14, 16, 18, 20];
  for (const hour of hours) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Hora de Hidratar!',
          body: 'Beba pelo menos 250ml de água agora. Hidratação é essencial durante o jejum.',
          sound: true,
        },
        trigger: { hour, minute: 0, repeats: true },
      });
    } catch {
      // Skip if scheduling fails (e.g., permission denied)
    }
  }
}

export async function scheduleElectrolyteReminders(): Promise<void> {
  const times = [
    { hour: 8, minute: 30, msg: 'Adicione uma pitada de sal marinho à sua água. Eletrólitos são essenciais em jejum.' },
    { hour: 14, minute: 0, msg: 'Lembrete de eletrólitos: sódio + potássio + magnésio. Seu jejum agradece!' },
    { hour: 19, minute: 0, msg: 'Eletrólitos do fim do dia: magnésio glicinato (300mg) antes de dormir previne câimbras.' },
  ];
  for (const t of times) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚗️ Eletrólitos',
          body: t.msg,
          sound: false,
        },
        trigger: { hour: t.hour, minute: t.minute, repeats: true },
      });
    } catch {
      // Skip if scheduling fails
    }
  }
}

export async function scheduleFastingMilestone(startTime: number, targetHours: number): Promise<void> {
  const milestones = [
    { hours: 4, msg: '🍽️ Digestão completa! Seu corpo começa a queimar glicogênio. Ótimo começo!' },
    { hours: 12, msg: '🔥 12 horas de jejum! Queima de glicogênio intensa. Continue!' },
    { hours: 16, msg: '⚡ 16 horas! Cetose leve ativada. Você está queimando gordura agora!' },
    { hours: 18, msg: '💜 18 horas! Cetose profunda. Queima máxima de gordura em andamento!' },
    { hours: 24, msg: '🏆 24 HORAS! Um dia completo. Hormônio do crescimento +300%. Você é elite!' },
    { hours: 36, msg: '🔄 36 horas! AUTOFAGIA iniciada. Renovação celular Nobel 2016 em curso!' },
    { hours: 48, msg: '⭐ 48 horas! Sistema imune se regenerando. Transformação profunda acontecendo!' },
    { hours: 72, msg: '🧠 72 horas! Clareza mental máxima. BDNF no pico. Você transcendeu!' },
    { hours: 96, msg: '💎 96 horas! Nível de elite absoluto. Autofagia máxima. Incrível!' },
    { hours: 120, msg: '👑 120 HORAS! 5 dias completos! Você alcançou o nível máximo do jejum!' },
  ];

  for (const m of milestones) {
    if (m.hours <= targetHours) {
      const triggerDate = new Date(startTime + m.hours * 60 * 60 * 1000);
      if (triggerDate > new Date()) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title: '🎯 Marco do Jejum!', body: m.msg, sound: true },
            trigger: triggerDate,
          });
        } catch {
          // Skip if trigger is in the past or scheduling fails
        }
      }
    }
  }
}

export async function scheduleWorkoutReminder(hour = 7): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 Hora do Treino!',
        body: 'Seu treino de hoje está esperando. Vamos nessa — consistência cria transformação!',
        sound: true,
      },
      trigger: { hour, minute: 0, repeats: true },
    });
  } catch {
    // Ignore scheduling errors
  }
}

export async function sendMotivational(): Promise<void> {
  const messages = [
    'A disciplina é a ponte entre metas e conquistas. 🏆',
    'Cada hora de jejum é uma vitória sobre a mente. ⚡',
    'Seu corpo está se transformando. Confie no processo. 💪',
    'Grandes resultados exigem grandes comprometimentos. 🔥',
    'Você já chegou até aqui. Não pare agora. 💎',
    'Cetose ativada. Gordura virando combustível. Você está no nível! 💜',
    'O jejum não é privação — é transformação. Continue. 🧠',
    'Cada dia consistente conta. A composição cria o impossível. ⭐',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: '✨ Prime Motivação', body: msg, sound: true },
      trigger: { seconds: 1 },
    });
  } catch {
    // Ignore
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore
  }
}

export async function scheduleAllReminders(): Promise<void> {
  await cancelAllNotifications();
  await scheduleHydrationReminders();
  await scheduleElectrolyteReminders();
}
