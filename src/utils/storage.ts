import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@prime:user',
  ONBOARDING: '@prime:onboarding',
  FASTING_ACTIVE: '@prime:fasting_active',
  FASTING_HISTORY: '@prime:fasting_history',
  PREMIUM: '@prime:premium',
  HYDRATION: '@prime:hydration',
  EBOOK_PROGRESS: '@prime:ebook_progress',
};

export async function saveUser(user: object) {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function saveOnboarding(done: boolean) {
  await AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(done));
}

export async function getOnboarding(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.ONBOARDING);
  return raw ? JSON.parse(raw) : false;
}

export async function saveFastingSession(session: object) {
  await AsyncStorage.setItem(KEYS.FASTING_ACTIVE, JSON.stringify(session));
}

export async function getActiveFasting() {
  const raw = await AsyncStorage.getItem(KEYS.FASTING_ACTIVE);
  return raw ? JSON.parse(raw) : null;
}

export async function clearActiveFasting() {
  await AsyncStorage.removeItem(KEYS.FASTING_ACTIVE);
}

export async function savePremium(v: boolean) {
  await AsyncStorage.setItem(KEYS.PREMIUM, JSON.stringify(v));
}

export async function getPremium(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.PREMIUM);
  return raw ? JSON.parse(raw) : false;
}

export async function saveEbookProgress(ebookId: string, page: number) {
  const raw = await AsyncStorage.getItem(KEYS.EBOOK_PROGRESS);
  const current = raw ? JSON.parse(raw) : {};
  current[ebookId] = page;
  await AsyncStorage.setItem(KEYS.EBOOK_PROGRESS, JSON.stringify(current));
}

export async function getEbookProgress(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(KEYS.EBOOK_PROGRESS);
  return raw ? JSON.parse(raw) : {};
}
