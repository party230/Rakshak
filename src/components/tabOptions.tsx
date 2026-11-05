/**
 * Shared look for the bottom tab bar (big icons and labels, blue when active).
 */
import type { ComponentProps } from 'react';
import type { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { Icon, type IconName } from './Icon';

type ScreenOptions = ComponentProps<typeof Tabs>['screenOptions'];

export function tabBarOptions(insets: EdgeInsets): ScreenOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: '#6B7280',
    tabBarLabelStyle: { fontSize: 15, fontWeight: '700' },
    tabBarStyle: {
      height: 78 + insets.bottom,
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom, 10),
      borderTopWidth: 2,
      borderTopColor: '#E5E7EB',
      backgroundColor: colors.white,
    },
  };
}

/** Use as `tabBarIcon: tabIcon('home')` in a Tabs.Screen's options. */
export function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return (
      <Icon name={name} size={28} color={typeof color === 'string' ? color : colors.primary} />
    );
  };
}
