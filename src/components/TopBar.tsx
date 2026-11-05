/**
 * Top bar with an optional big back arrow and a screen title.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Icon } from './Icon';

type Props = {
  title?: string;
  onBack?: () => void;
};

export function TopBar({ title, onBack }: Props) {
  return (
    <View style={styles.bar}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={12}
          style={styles.back}
        >
          <Icon name="back" size={30} color={colors.ink} />
        </Pressable>
      ) : null}
      {title ? (
        <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 12,
    gap: 6,
  },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.ink, paddingHorizontal: 8 },
});
