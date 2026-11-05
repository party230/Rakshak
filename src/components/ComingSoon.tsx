/**
 * Placeholder for screens that are built in a later phase.
 */
import { StyleSheet, View } from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import { colors } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { Screen } from './Screen';

type Props = { title: string; icon: IconName; onBack?: () => void; hasTabBar?: boolean };

export function ComingSoon({ title, icon, onBack, hasTabBar }: Props) {
  const { t } = useLanguage();
  return (
    <Screen onBack={onBack} title={onBack ? title : undefined} hasTabBar={hasTabBar}>
      {onBack ? null : <AppText variant="title">{title}</AppText>}
      <View style={styles.center}>
        <Icon name={icon} size={72} color={colors.primary} />
        <AppText variant="muted" center>
          {t('common.comingSoon')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
