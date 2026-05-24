import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from './src/utils/notifications';
import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useAppStore } from './src/store/useAppStore';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppContent() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  if (!onboardingDone) return <OnboardingScreen />;
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#ff6a00',
          background: '#080808',
          card: '#111114',
          text: '#ffffff',
          border: 'rgba(255,255,255,0.07)',
          notification: '#ff6a00',
        },
      }}
    >
      <StatusBar style="light" backgroundColor="#080808" />
      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080808' }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
