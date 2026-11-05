/**
 * S3 · Talk to Rakshak (assistant chat). Built in Phase 6.
 */
import { router } from 'expo-router';

import { ComingSoon } from '../../components/ComingSoon';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AssistantScreen() {
  const { t } = useLanguage();
  return <ComingSoon title={t('assistant.title')} icon="msg" onBack={() => router.back()} />;
}
