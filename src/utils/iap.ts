import { Platform } from 'react-native';

export const PRODUCT_IDS = {
  MONTHLY: Platform.select({
    ios: 'com.prime.fastingapp.monthly',
    android: 'prime_monthly',
  })!,
  ANNUAL: Platform.select({
    ios: 'com.prime.fastingapp.annual',
    android: 'prime_annual',
  })!,
};

export type SubscriptionInfo = {
  productId: string;
  price: string;
  localizedPrice: string;
  title: string;
  description: string;
};

// Dynamic require — expo-in-app-purchases is NOT available in Expo Go.
// All functions fall back to mock data / friendly errors when iap is null.
let iap: any = null;
let iapConnected = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  iap = require('expo-in-app-purchases');
} catch {
  // Running in Expo Go or a build without IAP native module
}

export const IAP_AVAILABLE = iap !== null;

const MOCK_PRODUCTS: SubscriptionInfo[] = [
  {
    productId: PRODUCT_IDS.MONTHLY,
    price: '29.90',
    localizedPrice: 'R$ 29,90',
    title: 'Prime Mensal',
    description: 'Acesso completo por 1 mês',
  },
  {
    productId: PRODUCT_IDS.ANNUAL,
    price: '199.90',
    localizedPrice: 'R$ 199,90',
    title: 'Prime Anual',
    description: 'Acesso completo por 1 ano — economize 44%',
  },
];

async function connectIAP() {
  if (!iap || iapConnected) return;
  try {
    await iap.connectAsync();
    iapConnected = true;
  } catch {
    // Simulator, device without Store access, or Expo Go
  }
}

export async function getSubscriptions(): Promise<SubscriptionInfo[]> {
  if (!iap) return MOCK_PRODUCTS;
  try {
    await connectIAP();
    const { results } = await iap.getProductsAsync([PRODUCT_IDS.MONTHLY, PRODUCT_IDS.ANNUAL]);
    if (!results?.length) return MOCK_PRODUCTS;
    return results.map((p: any) => ({
      productId: p.productId,
      price: p.price?.toString() ?? '',
      localizedPrice: p.localizedPrice,
      title: p.title,
      description: p.description,
    }));
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function purchaseSubscription(productId: string): Promise<boolean> {
  if (!iap) {
    throw new Error(
      'Compras in-app não estão disponíveis no Expo Go. Para testar assinaturas, gere um build de produção via EAS Build.'
    );
  }
  try {
    await connectIAP();
    await iap.purchaseItemAsync(productId);
    return true;
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!iap) return false;
  try {
    await connectIAP();
    const history = await iap.getPurchaseHistoryAsync();
    if (!history?.results?.length) return false;
    return history.results.some(
      (p: any) => p.productId === PRODUCT_IDS.MONTHLY || p.productId === PRODUCT_IDS.ANNUAL
    );
  } catch {
    return false;
  }
}

export async function disconnectIAP() {
  if (iap && iapConnected) {
    try {
      await iap.disconnectAsync();
    } catch {}
    iapConnected = false;
  }
}
