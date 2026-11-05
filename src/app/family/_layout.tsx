/**
 * Family area: the tab bar plus screens opened on top of it
 * (Link another parent; Alert detail and Payment approval come later).
 */
import { Stack } from 'expo-router';

import { colors } from '../../theme';

export default function FamilyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    />
  );
}
