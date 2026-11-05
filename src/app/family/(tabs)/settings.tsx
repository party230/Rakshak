/**
 * F5 · Family Settings.
 * Phase 1 rows: Language, Log out.
 * Phase 3 adds notification switches; Phase 5 adds payment limits per Senior.
 */
import { router } from 'expo-router';

import { AppText } from '../../../components/AppText';
import { SettingsRow } from '../../../components/Blocks';
import { Screen } from '../../../components/Screen';
import { useLanguage } from '../../../i18n/LanguageContext';
import { LANGUAGE_NAMES } from '../../../i18n/strings';
import { useSession } from '../../../session/SessionContext';
import { confirm } from '../../../utils/confirm';

export default function FamilySettings() {
  const { t, language } = useLanguage();
  const { signOut } = useSession();

  const askLogout = () =>
    confirm({
      title: t('settings.logout'),
      message: t('settings.logoutConfirm'),
      yes: t('common.yes'),
      no: t('common.no'),
      onYes: () => void signOut(),
    });

  return (
    <Screen scroll hasTabBar>
      <AppText variant="title">{t('settings.title')}</AppText>
      <SettingsRow
        icon="globe"
        title={t('settings.language')}
        value={LANGUAGE_NAMES[language ?? 'en']}
        onPress={() => router.push('/change-language')}
      />
      <SettingsRow icon="logout" title={t('settings.logout')} onPress={askLogout} />
    </Screen>
  );
}
