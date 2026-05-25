import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation';
import { useAppStore } from './src/store';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

// ─── Error Boundary ────────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient colors={['#0A0A0F', '#12121A']} style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚡</Text>
          <Text style={styles.errorTitle}>Algo deu errado</Text>
          <Text style={styles.errorDesc}>
            {this.state.error?.message || 'Erro inesperado'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={styles.errorBtn}
          >
            <Text style={styles.errorBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
    return this.props.children;
  }
}

// ─── Splash / Loading Screen ───────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <LinearGradient colors={['#0A0A0F', '#12121A']} style={styles.splash}>
      <Text style={styles.splashEmoji}>⚡</Text>
      <Text style={styles.splashTitle}>PRIME</Text>
      <Text style={styles.splashSub}>Jejum & Fitness</Text>
    </LinearGradient>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [appReady, setAppReady] = useState(false);

  const onReady = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {}
    setAppReady(true);
  }, []);

  useEffect(() => {
    // Wait for Zustand persist rehydration
    const unsub = useAppStore.persist.onFinishHydration(() => {
      onReady();
    });

    // If already hydrated (e.g. fast subsequent mount)
    if (useAppStore.persist.hasHydrated()) {
      onReady();
    }

    return unsub;
  }, [onReady]);

  // Global notification tap handler — deep-link to Jejum screen
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      // Navigation ref would be used here in a production app
      // For now, the app opens to the correct tab via the notification
    });
    return () => sub.remove();
  }, []);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />
        <AppNavigator />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#C9A84C',
    letterSpacing: 8,
    marginBottom: 8,
  },
  splashSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  errorBtn: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  errorBtnText: {
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: '600',
  },
});
