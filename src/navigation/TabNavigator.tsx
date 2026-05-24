import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
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
          tabBarIcon: ({ focused, color }) => {
            const iconName = focused ? tabDef!.iconActive : tabDef!.icon;
            return (
              <View style={focused ? styles.iconActive : styles.iconWrap}>
                <Ionicons name={iconName} size={20} color={color} />
              </View>
            );
          },
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
