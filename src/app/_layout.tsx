/**
 * Root of the app.
 *
 * Sets up language + login session, then decides which group of screens the
 * user may see. `Stack.Protected` hides a group when its `guard` is false; if
 * the user is on a hidden screen, Expo Router sends them back to `index`,
 * which redirects them to the right place (see src/app/index.tsx).
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from '../i18n/LanguageContext';
import { SessionProvider, useSession } from '../session/SessionContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SessionProvider>
          <StatusBar style="dark" />
          <RootStack />
        </SessionProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { status } = useSession();
  const inOnboarding =
    status === 'needsLanguage' || status === 'signedOut' || status === 'needsRole';
  const signedIn = status === 'senior' || status === 'family';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade', // spec: no animations beyond simple fades
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Protected guard={inOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'senior'}>
        <Stack.Screen name="senior" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'family'}>
        <Stack.Screen name="family" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="change-language" />
      </Stack.Protected>
    </Stack>
  );
}
