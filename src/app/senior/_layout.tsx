/**
 * Senior area: the tab bar plus screens opened on top of it
 * (My family, Assistant, ...).
 */
import { Stack } from 'expo-router';

import { colors } from '../../theme';

export default function SeniorLayout() {
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
