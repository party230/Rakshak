/**
 * S1 · Senior Home.
 *  - Status card ("You are protected"). Turns red for open alerts in Phase 3.
 *  - Emergency: calls the first linked family member now. (Phase 3 also
 *    alerts the other family members.)
 *  - Check a message -> Check tab.
 *  - Talk to Rakshak -> Assistant (built in Phase 6).
 */
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import { AppText } from '../../../components/AppText';
import { BigButton } from '../../../components/BigButton';
import { Logo, StatusCard } from '../../../components/Blocks';
import { Screen } from '../../../components/Screen';
import { useLinkedPeople } from '../../../hooks/useLinkedPeople';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useSession } from '../../../session/SessionContext';

export default function SeniorHome() {
  const { t } = useLanguage();
  const { profile } = useSession();
  const { people } = useLinkedPeople();

  // The first person linked is the Emergency contact.
  const firstContact = people[0]?.profile;
  const firstName = (profile?.name ?? '').split(' ')[0];

  const onEmergency = () => {
    if (!firstContact) {
      Alert.alert(t('home.emergency'), t('home.emergencyNoFamily'));
      return;
    }
    Linking.openURL(`tel:${firstContact.phone}`).catch(() =>
      Alert.alert(t('home.emergency'), t('common.error')),
    );
  };

  return (
    <Screen scroll hasTabBar>
      <Logo />
      {firstName ? (
        <AppText variant="heading">{t('home.greeting', { name: firstName })}</AppText>
      ) : null}

      <StatusCard kind="safe" title={t('home.protected')} subtitle={t('home.protectedSub')} />

      <BigButton
        big
        variant="danger"
        icon="phone"
        label={t('home.emergency')}
        subLabel={
          firstContact
            ? t('home.emergencySub', { name: firstContact.name.split(' ')[0] })
            : t('home.emergencyNoFamilySub')
        }
        onPress={onEmergency}
      />
      <BigButton
        icon="search"
        label={t('home.check')}
        onPress={() => router.navigate('/senior/check')}
      />
      <BigButton
        variant="outline"
        icon="msg"
        label={t('home.talk')}
        onPress={() => router.push('/senior/assistant')}
      />
    </Screen>
  );
}
