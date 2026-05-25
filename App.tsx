import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation';
import { useAppStore } from './src/store';
import { getOnboarding, getUser, getPremium, getActiveFasting } from './src/utils/storage';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const { setHasCompletedOnboarding, setUser, setPremium } = useAppStore();

  useEffect(() => {
    async function prepare() {
      try {
        const [onboarded, user, premium, activeFasting] = await Promise.all([
          getOnboarding(),
          getUser(),
          getPremium(),
          getActiveFasting(),
        ]);

        if (onboarded) setHasCompletedOnboarding(true);
        if (user) setUser(user);
        if (premium) setPremium(true);

        if (activeFasting) {
          const store = useAppStore.getState();
          const isExpired =
            Date.now() - activeFasting.startTime >
            activeFasting.targetHours * 3600 * 1000;
          if (!isExpired) {
            store.activeFasting = activeFasting;
          }
        }
      } catch (e) {
        console.warn('Bootstrap error:', e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) {
    return (
      <LinearGradient colors={['#0A0A0F', '#12121A']} style={styles.splash} />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  splash: {
    flex: 1,
  },
});
