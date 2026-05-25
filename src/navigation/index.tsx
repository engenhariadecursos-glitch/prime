import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import FastingScreen from '../screens/FastingScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PremiumScreen from '../screens/PremiumScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useAppStore } from '../store';
import { colors, fontSize, fontWeight } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgSurface,
    text: colors.text,
    border: colors.border,
  },
};

const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  Home: { icon: '⊞', label: 'Início' },
  Jejum: { icon: '⚡', label: 'Jejum' },
  Treinos: { icon: '💪', label: 'Treinos' },
  Biblioteca: { icon: '📚', label: 'Biblioteca' },
  Perfil: { icon: '👤', label: 'Perfil' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const tab = TAB_ICONS[name];
  return (
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconActive]}>
      {focused && (
        <LinearGradient
          colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{tab.icon}</Text>
    </View>
  );
}

function MainTabs() {
  const { activeFasting } = useAppStore();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Jejum"
        component={FastingScreen}
        options={{
          tabBarLabel: 'Jejum',
          tabBarIcon: ({ focused }) => <TabIcon name="Jejum" focused={focused} />,
          tabBarBadge: activeFasting ? ' ' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.fasting,
            minWidth: 8,
            height: 8,
            borderRadius: 4,
          },
        }}
      />
      <Tab.Screen
        name="Treinos"
        component={WorkoutScreen}
        options={{
          tabBarLabel: 'Treinos',
          tabBarIcon: ({ focused }) => <TabIcon name="Treinos" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Biblioteca"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Biblioteca',
          tabBarIcon: ({ focused }) => <TabIcon name="Biblioteca" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="Perfil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { hasCompletedOnboarding } = useAppStore();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NAV_THEME}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="WorkoutDetail"
                component={WorkoutDetailScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Premium"
                component={PremiumScreen}
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconActive: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  icon: {
    fontSize: 18,
  },
  iconFocused: {},
});
