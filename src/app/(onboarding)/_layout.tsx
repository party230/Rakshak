/**
 * Onboarding screens: Language (A1) -> Role (A2) -> Login (A3) -> Code (A4).
 * Shared by Seniors and Family members.
 */
import { Stack } from 'expo-router';

import { colors } from '../../theme';

export default function OnboardingLayout() {
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
