import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HojeScreen } from '../screens/HojeScreen';
import { TreinoScreen } from '../screens/TreinoScreen';
import { DietaScreen } from '../screens/DietaScreen';
import { JejumScreen } from '../screens/JejumScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { EbookScreen } from '../screens/EbookScreen';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: string;
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  Screen: React.ComponentType;
}[] = [
  { name: 'Hoje', label: 'Hoje', icon: 'home-outline', iconActive: 'home', Screen: HojeScreen },
  { name: 'Treino', label: 'Treino', icon: 'barbell-outline', iconActive: 'barbell', Screen: TreinoScreen },
  { name: 'Dieta', label: 'Dieta', icon: 'nutrition-outline', iconActive: 'nutrition', Screen: DietaScreen },
  { name: 'Jejum', label: 'Jejum', icon: 'time-outline', iconActive: 'time', Screen: JejumScreen },
  { name: 'Stats', label: 'Stats', icon: 'stats-chart-outline', iconActive: 'stats-chart', Screen: StatsScreen },
  { name: 'Livros', label: 'Livros', icon: 'book-outline', iconActive: 'book', Screen: EbookScreen },
];

function TabIcon({ focused, name, activeColor }: { focused: boolean; name: IoniconName; activeColor: string }) {
  return (
    <View style={styles.iconContainer}>
      {focused && <View style={[styles.activeGlow, { backgroundColor: `${activeColor}18` }]} />}
      <Ionicons name={name} size={22} color={focused ? activeColor : colors.muted2} />
      {focused && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tabDef = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.muted2,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? tabDef!.iconActive : tabDef!.icon}
              activeColor={colors.orange}
            />
          ),
        };
      }}
    >
      {TABS.map(({ name, label, Screen }) => (
        <Tab.Screen key={name} name={name} component={Screen} options={{ tabBarLabel: label }} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(0,0,0,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 36,
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 40,
    height: 36,
    borderRadius: 10,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
