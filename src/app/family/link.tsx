/**
 * F1 · "Link another parent" (opened from Family Home).
 */
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { AppText } from '../../components/AppText';
import { LinkCodeForm } from '../../components/LinkCodeForm';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../i18n/LanguageContext';

export default function LinkAnotherScreen() {
  const { t } = useLanguage();

  const onLinked = (name: string) => {
    Alert.alert(t('link.title'), t('link.success', { name }), [
      { text: t('common.done'), onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll onBack={() => router.back()}>
      <AppText variant="title">{t('link.title')}</AppText>
      <LinkCodeForm onLinked={onLinked} />
    </Screen>
  );
}
