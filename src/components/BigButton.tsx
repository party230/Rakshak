/**
 * The app's only button. Always full width and at least 60px tall.
 *
 * variant:
 *  - "primary"  blue, the main action on a screen
 *  - "outline"  white with blue border, a second action
 *  - "danger"   red (Emergency, Reject, Hang up)
 *  - "safe"     green (Call, Approve)
 *  - "plain"    white with grey border (less important actions)
 *
 * `big` makes it 96px tall with an optional `subLabel` under the label
 * (used for the Emergency button).
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BUTTON_HEIGHT, colors, font, radius } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'outline' | 'danger' | 'safe' | 'plain';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  big?: boolean;
  subLabel?: string;
  loading?: boolean;
  disabled?: boolean;
};

const PALETTE: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  outline: { bg: colors.white, fg: colors.primary, border: colors.primary },
  danger: { bg: colors.scam, fg: colors.white, border: colors.scam },
  safe: { bg: colors.safe, fg: colors.white, border: colors.safe },
  plain: { bg: colors.white, fg: colors.ink, border: colors.inputBorder },
};

export function BigButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  big,
  subLabel,
  loading,
  disabled,
}: Props) {
  const p = PALETTE[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subLabel ? `${label}. ${subLabel}` : label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        big && styles.big,
        { backgroundColor: p.bg, borderColor: p.border },
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} size="large" />
      ) : (
        <>
          <View style={styles.row}>
            {icon ? <Icon name={icon} size={big ? 30 : 26} color={p.fg} /> : null}
            <Text style={[styles.label, big && styles.bigLabel, { color: p.fg }]}>{label}</Text>
          </View>
          {subLabel ? <Text style={[styles.sub, { color: p.fg }]}>{subLabel}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: BUTTON_HEIGHT,
    borderRadius: radius.button,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  big: { minHeight: 96, borderRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: font.button, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  bigLabel: { fontSize: 26, fontWeight: '800' },
  sub: { fontSize: 17, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  // Simple feedback only: no animations beyond a slight fade.
  pressed: { opacity: 0.8 },
  inactive: { opacity: 0.55 },
});
