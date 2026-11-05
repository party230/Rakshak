/**
 * S11 · My family.
 *  - Lists linked Family members, each with a Remove button (asks first).
 *  - Shows the 6-digit invite code (valid 24 hours) and a Share button.
 *  - Hides the code once 5 people are linked.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { BigButton } from '../../components/BigButton';
import { Card, ErrorNote, InfoNote, PersonRow, RowAction } from '../../components/Blocks';
import { Screen } from '../../components/Screen';
import { MAX_FAMILY_PER_SENIOR } from '../../config';
import { useLinkedPeople } from '../../hooks/useLinkedPeople';
import { useLanguage } from '../../i18n/LanguageContext';
import { getInviteCode, removeLink, type Invite, type LinkedPerson } from '../../services/links';
import { colors } from '../../theme';
import { confirm } from '../../utils/confirm';
import { formatPhone } from '../../utils/phone';

export default function MyFamilyScreen() {
  const { t } = useLanguage();
  const { people, loaded } = useLinkedPeople();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [inviteError, setInviteError] = useState(false);
  const [removeError, setRemoveError] = useState(false);

  const isFull = people.length >= MAX_FAMILY_PER_SENIOR;

  // Bumped by the "try again" button to fetch the code again.
  const [retry, setRetry] = useState(0);

  // Ask the server for the current invite code (it makes a new one if needed).
  // Runs when the screen opens, when our code has expired, and on "try again".
  useEffect(() => {
    if (isFull || (invite && invite.expiresAtMs > Date.now())) return;
    let cancelled = false;
    getInviteCode().then(
      (fresh) => {
        if (cancelled) return;
        setInvite(fresh);
        setInviteError(false);
      },
      () => {
        if (!cancelled) setInviteError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isFull, invite, retry]);

  const askRemove = (person: LinkedPerson) =>
    confirm({
      title: t('family.remove'),
      message: t('family.removeConfirm', { name: person.profile.name }),
      yes: t('family.remove'),
      no: t('common.cancel'),
      onYes: () => {
        setRemoveError(false);
        removeLink(person.link.id).catch(() => setRemoveError(true));
      },
    });

  const shareCode = () => {
    if (!invite) return;
    void Share.share({ message: t('family.shareMessage', { code: spaced(invite.code) }) });
  };

  return (
    <Screen
      scroll
      title={t('family.title')}
      onBack={() => router.back()}
      footer={
        isFull ? null : (
          <>
            <BigButton
              icon="share"
              label={t('family.share')}
              onPress={shareCode}
              disabled={!invite}
            />
            <AppText variant="small" center>
              {t('family.canAddMore', { count: MAX_FAMILY_PER_SENIOR - people.length })}
            </AppText>
          </>
        )
      }
    >
      {!loaded ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      {loaded && people.length === 0 ? <AppText variant="muted">{t('family.none')}</AppText> : null}

      {people.map((person) => (
        <PersonRow
          key={person.link.id}
          name={person.profile.name}
          subtitle={formatPhone(person.profile.phone)}
          right={<RowAction danger label={t('family.remove')} onPress={() => askRemove(person)} />}
        />
      ))}
      {removeError ? <ErrorNote message={t('common.error')} /> : null}

      {isFull ? (
        <InfoNote icon="users">{t('family.full')}</InfoNote>
      ) : (
        <Card highlight="primary">
          <View style={styles.inviteBox}>
            <AppText variant="heading" center>
              {t('family.addTitle')}
            </AppText>
            <AppText center>{t('family.addHelp')}</AppText>
            {invite ? (
              <Text style={styles.code} accessibilityLabel={invite.code.split('').join(' ')}>
                {spaced(invite.code)}
              </Text>
            ) : inviteError ? null : (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
            <AppText variant="small" center>
              {t('family.codeValid')}
            </AppText>
          </View>
        </Card>
      )}
      {inviteError ? (
        <>
          <ErrorNote message={t('family.codeError')} />
          <BigButton
            variant="outline"
            label={t('common.tryAgain')}
            onPress={() => setRetry((n) => n + 1)}
          />
        </>
      ) : null}
    </Screen>
  );
}

/** "482913" -> "482 913" (easier to read out loud). */
function spaced(code: string) {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

const styles = StyleSheet.create({
  inviteBox: { alignItems: 'center', gap: 6 },
  code: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.primary,
    marginVertical: 4,
  },
});
