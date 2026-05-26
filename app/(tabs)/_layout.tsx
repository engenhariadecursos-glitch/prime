import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import { colors } from '../../src/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted2,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="treino"
        options={{
          title: 'Treino',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'barbell' : 'barbell-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dieta"
        options={{
          title: 'Dieta',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'nutrition' : 'nutrition-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="jejum"
        options={{
          title: 'Jejum',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="livros"
        options={{
          title: 'Livros',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconActive : styles.iconWrap}>
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8,8,8,0.98)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: colors.orangeDim,
    borderRadius: 10,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
