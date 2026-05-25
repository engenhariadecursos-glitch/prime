import * as InAppPurchases from 'expo-in-app-purchases';
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

let connected = false;

export async function connectIAP() {
  if (connected) return;
  try {
    await InAppPurchases.connectAsync();
    connected = true;
  } catch {
    // IAP not available in simulator/dev
  }
}

export async function getSubscriptions(): Promise<SubscriptionInfo[]> {
  try {
    await connectIAP();
    const { results } = await InAppPurchases.getProductsAsync([
      PRODUCT_IDS.MONTHLY,
      PRODUCT_IDS.ANNUAL,
    ]);
    return results.map((p) => ({
      productId: p.productId,
      price: p.price.toString(),
      localizedPrice: p.localizedPrice,
      title: p.title,
      description: p.description,
    }));
  } catch {
    // Return mock data for dev/simulator
    return [
      {
        productId: PRODUCT_IDS.MONTHLY,
        price: '29.90',
        localizedPrice: 'R$ 29,90',
        title: 'Prime Mensal',
        description: 'Acesso completo por 1 mês',
      },
      {
        productId: PRODUCT_IDS.ANNUAL,
        price: '199.90',
        localizedPrice: 'R$ 199,90',
        title: 'Prime Anual',
        description: 'Acesso completo por 1 ano — economize 44%',
      },
    ];
  }
}

export async function purchaseSubscription(productId: string): Promise<boolean> {
  try {
    await connectIAP();
    await InAppPurchases.purchaseItemAsync(productId);
    return true;
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    await connectIAP();
    const history = await InAppPurchases.getPurchaseHistoryAsync();
    if (!history?.results?.length) return false;
    const active = history.results.find(
      (p) =>
        p.productId === PRODUCT_IDS.MONTHLY ||
        p.productId === PRODUCT_IDS.ANNUAL
    );
    return !!active;
  } catch {
    return false;
  }
}

export async function disconnectIAP() {
  if (connected) {
    await InAppPurchases.disconnectAsync();
    connected = false;
  }
}
