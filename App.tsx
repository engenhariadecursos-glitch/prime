import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from './src/utils/notifications';
import { TabNavigator } from './src/navigation/TabNavigator';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    async function init() {
      await requestNotificationPermission();
      await SplashScreen.hideAsync();
    }
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080808' }}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
