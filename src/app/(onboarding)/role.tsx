/**
 * A2 · Role select: "Keep me safe" (Senior) or "I look after family" (Family).
 *
 * Usually shown before login: we save the choice and go to the login screen.
 * If the user is already signed in but has no profile (rare, e.g. the app was
 * closed during sign-up), choosing a role creates the profile straight away.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { ErrorNote } from '../../components/Blocks';
import { Icon, type IconName } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { savePendingOnboarding } from '../../services/onboarding';
import { useSession } from '../../session/SessionContext';
import { colors } from '../../theme';
import type { Role } from '../../types';

export default function RoleScreen() {
  const { t } = useLanguage();
  const { status, createProfileWithRole } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);

  const choose = async (role: Role) => {
    setError(null);
    if (status === 'needsRole') {
      setBusy(true);
      try {
        await createProfileWithRole(role);
        // SessionContext now has a profile; the root layout moves us on.
      } catch {
        setError('common.error');
      } finally {
        setBusy(false);
      }
      return;
    }
    await savePendingOnboarding({ role });
    router.push('/login');
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/language'));

  return (
    <Screen scroll onBack={status === 'needsRole' ? undefined : goBack}>
      <AppText variant="title">{t('role.title')}</AppText>
      <RoleCard
        icon="shieldcheck"
        title={t('role.senior.title')}
        desc={t('role.senior.desc')}
        onPress={() => choose('senior')}
        disabled={busy}
      />
      <RoleCard
        icon="users"
        title={t('role.family.title')}
        desc={t('role.family.desc')}
        onPress={() => choose('family')}
        disabled={busy}
      />
      {error ? <ErrorNote message={t(error)} /> : null}
      <View style={styles.spacer} />
      <AppText variant="small" center>
        {busy ? t('common.wait') : t('role.tapOne')}
      </AppText>
    </Screen>
  );
}

function RoleCard(props: {
  icon: IconName;
  title: string;
  desc: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${props.title}. ${props.desc}`}
      onPress={props.onPress}
      disabled={props.disabled}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.primarySoft }]}
    >
      <Icon name={props.icon} size={60} color={colors.primary} />
      <View style={styles.cardText}>
        <AppText variant="heading">{props.title}</AppText>
        <AppText variant="muted">{props.desc}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  cardText: { flex: 1, gap: 2 },
  spacer: { flex: 1 },
});
