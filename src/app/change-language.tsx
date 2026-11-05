/**
 * Settings → Language. Used by both Seniors and Family members.
 * The change applies at once; SessionContext also saves it to the profile.
 */
import { router } from 'expo-router';

import { LanguageChoice } from '../components/LanguageChoice';
import { Screen } from '../components/Screen';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/strings';

export default function ChangeLanguageScreen() {
  const { t, language, setLanguage } = useLanguage();

  const choose = async (lang: Language) => {
    await setLanguage(lang);
    router.back();
  };

  return (
    <Screen scroll title={t('language.settingsTitle')} onBack={() => router.back()}>
      <LanguageChoice selected={language} onChoose={choose} />
    </Screen>
  );
}
