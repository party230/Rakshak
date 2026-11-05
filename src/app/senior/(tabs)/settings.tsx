/**
 * S11 · Senior Settings.
 * Phase 1 rows: Language, My family, Log out.
 * Later phases add: What family can see, Trusted numbers, Payment limit, Lost money help.
 */
import { router } from 'expo-router';

import { AppText } from '../../../components/AppText';
import { SettingsRow } from '../../../components/Blocks';
import { Screen } from '../../../components/Screen';
import { useLinkedPeople } from '../../../hooks/useLinkedPeople';
import { useLanguage } from '../../../i18n/LanguageContext';
import { LANGUAGE_NAMES } from '../../../i18n/strings';
import { useSession } from '../../../session/SessionContext';
import { confirm } from '../../../utils/confirm';

export default function SeniorSettings() {
  const { t, language } = useLanguage();
  const { signOut } = useSession();
  const { people } = useLinkedPeople();

  return (
    <Screen scroll hasTabBar>
      <AppText variant="title">{t('settings.title')}</AppText>
      <SettingsRow
        icon="globe"
        title={t('settings.language')}
        value={LANGUAGE_NAMES[language ?? 'en']}
        onPress={() => router.push('/change-language')}
      />
      <SettingsRow
        icon="users"
        title={t('settings.myFamily')}
        value={t('settings.familyCount', { count: people.length })}
        onPress={() => router.push('/senior/family')}
      />
      <SettingsRow
        icon="logout"
        title={t('settings.logout')}
        onPress={() =>
          confirm({
            title: t('settings.logout'),
            message: t('settings.logoutConfirm'),
            yes: t('common.yes'),
            no: t('common.no'),
            onYes: () => void signOut(),
          })
        }
      />
    </Screen>
  );
}
