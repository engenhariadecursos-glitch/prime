import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from '../src/utils/notifications';
import { useAppStore } from '../src/store/useAppStore';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      SplashScreen.hideAsync();
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        setHydrated(true);
        SplashScreen.hideAsync();
      });
      return unsub;
    }
  }, []);

  if (!hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
