/**
 * S2 · Check a message. Built in Phase 2 (paste text, screenshot, link, share).
 */
import { ComingSoon } from '../../../components/ComingSoon';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function CheckTab() {
  const { t } = useLanguage();
  return <ComingSoon title={t('check.title')} icon="search" hasTabBar />;
}
