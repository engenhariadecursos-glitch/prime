import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const today = () => format(new Date(), 'yyyy-MM-dd');

export const formatDate = (date: string) =>
  format(parseISO(date), "d 'de' MMMM", { locale: ptBR });

export const formatDateShort = (date: string) =>
  format(parseISO(date), 'dd/MM', { locale: ptBR });

export const formatTime = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatHourMin = (ms: number) => {
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

export const getLast90Days = (): string[] => {
  const days: string[] = [];
  for (let i = 89; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return days;
};

export const fastingElapsed = (startTime: number): number =>
  Date.now() - startTime;

export const fastingRemaining = (startTime: number, goalHours: number): number =>
  Math.max(0, startTime + goalHours * 3600000 - Date.now());

export const fastingProgress = (startTime: number, goalHours: number): number =>
  Math.min(1, (Date.now() - startTime) / (goalHours * 3600000));

export const dayOfWeek = (date: string) =>
  format(parseISO(date), 'EEE', { locale: ptBR });

export const greetingText = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};
