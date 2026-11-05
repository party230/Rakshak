/**
 * The starting screen. Shows a spinner while we check who is logged in,
 * then sends the user to the right place.
 */
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '../session/SessionContext';
import { colors } from '../theme';
import { Logo } from '../components/Blocks';

export default function Index() {
  const { status } = useSession();

  switch (status) {
    case 'needsLanguage':
      return <Redirect href="/language" />;
    case 'signedOut':
    case 'needsRole':
      return <Redirect href="/role" />;
    case 'senior':
      return <Redirect href="/senior" />;
    case 'family':
      return <Redirect href="/family" />;
    default:
      return (
        <View style={styles.center}>
          <Logo size={32} />
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: colors.background,
  },
});
