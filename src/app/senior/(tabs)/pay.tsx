/**
 * S9 · Pay someone (practice UPI screen). Built in Phase 5.
 */
import { ComingSoon } from '../../../components/ComingSoon';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function PayTab() {
  const { t } = useLanguage();
  return <ComingSoon title={t('pay.title')} icon="rupee" hasTabBar />;
}
