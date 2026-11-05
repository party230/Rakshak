/**
 * F2 · Family Home: the Seniors this person looks after.
 *
 * If nobody is linked yet, this screen shows the invite-code form instead
 * (F1), so a new Family member goes straight from login to linking.
 *
 * Phase 3 adds the live Safe / Alert status and the latest alert per Senior.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '../../../components/AppText';
import { BigButton } from '../../../components/BigButton';
import { Avatar, Card, InfoNote, Logo, Pill } from '../../../components/Blocks';
import { LinkCodeForm } from '../../../components/LinkCodeForm';
import { Screen } from '../../../components/Screen';
import { useLinkedPeople } from '../../../hooks/useLinkedPeople';
import { useLanguage } from '../../../i18n/LanguageContext';
import { colors } from '../../../theme';
import { formatPhone } from '../../../utils/phone';

export default function FamilyHome() {
  const { t } = useLanguage();
  const { people, loaded } = useLinkedPeople();
  const [justLinked, setJustLinked] = useState<string | null>(null);

  if (!loaded) {
    return (
      <Screen hasTabBar>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  // Nobody linked yet: show "Link to your parent" (F1).
  if (people.length === 0) {
    return (
      <Screen scroll hasTabBar>
        <Logo />
        <AppText variant="title">{t('link.title')}</AppText>
        <LinkCodeForm onLinked={setJustLinked} />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      hasTabBar
      footer={
        <BigButton
          variant="outline"
          icon="plus"
          label={t('familyHome.linkAnother')}
          onPress={() => router.push('/family/link')}
        />
      }
    >
      <Logo />
      <AppText variant="title">{t('familyHome.title')}</AppText>
      {justLinked ? (
        <InfoNote icon="checkc">{t('link.success', { name: justLinked })}</InfoNote>
      ) : null}

      {people.map(({ link, profile }) => (
        <Card key={link.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={profile.name} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">{profile.name}</AppText>
              <AppText variant="small">{formatPhone(profile.phone)}</AppText>
            </View>
            <Pill kind="safe" label={t('common.safe')} />
          </View>
          <AppText variant="muted">{t('familyHome.allWell')}</AppText>
        </Card>
      ))}
    </Screen>
  );
}
