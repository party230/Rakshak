/**
 * Small building blocks used on many screens:
 *  - InfoNote:   light-blue hint box with an icon
 *  - ErrorNote:  red message box (always says what to do next)
 *  - Card:       bordered box
 *  - Avatar:     round first-letter badge
 *  - PersonRow:  avatar + name + phone + optional action on the right
 *  - Pill:       small "Safe" / "Alert" label (colour + icon + word)
 *  - StatusCard: the big "You are protected" card on Senior Home
 *  - SettingsRow: a tappable row in a Settings list
 *  - Logo:       shield + "Rakshak"
 *  - Field:      label + text input
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function InfoNote({ icon = 'info', children }: { icon?: IconName; children: ReactNode }) {
  return (
    <View style={styles.info}>
      <Icon name={icon} size={24} color={colors.primary} />
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon name="alert" size={24} color={colors.scam} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function Card({
  children,
  highlight,
}: {
  children: ReactNode;
  highlight?: 'alert' | 'primary';
}) {
  return (
    <View
      style={[
        styles.card,
        highlight === 'alert' && { borderColor: colors.scam, borderWidth: 3 },
        highlight === 'primary' && {
          borderColor: colors.primary,
          backgroundColor: colors.primarySoft,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

export function PersonRow({
  name,
  subtitle,
  right,
}: {
  name: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.person}>
      <Avatar name={name} />
      <View style={styles.flex}>
        <AppText bold style={styles.personName}>
          {name}
        </AppText>
        {subtitle ? <AppText variant="small">{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

/** Small outlined text button used inside rows (e.g. "Remove"). */
export function RowAction({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.scam : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.rowAction,
        { borderColor: color },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.rowActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ kind, label }: { kind: 'safe' | 'alert'; label: string }) {
  const safe = kind === 'safe';
  return (
    <View style={[styles.pill, { backgroundColor: safe ? colors.safeBg : colors.scamBg }]}>
      <Icon name={safe ? 'checkc' : 'alert'} size={18} color={safe ? colors.safe : colors.scam} />
      <Text style={[styles.pillText, { color: safe ? colors.safe : colors.scam }]}>{label}</Text>
    </View>
  );
}

export function StatusCard({
  kind,
  title,
  subtitle,
}: {
  kind: 'safe' | 'alert';
  title: string;
  subtitle: string;
}) {
  const safe = kind === 'safe';
  const color = safe ? colors.safe : colors.scam;
  return (
    <View
      style={[
        styles.status,
        { borderColor: color, backgroundColor: safe ? colors.safeBg : colors.scamBg },
      ]}
      accessible
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <Icon name={safe ? 'shieldcheck' : 'alert'} size={64} color={color} />
      <View style={styles.flex}>
        <Text style={[styles.statusTitle, { color }]}>{title}</Text>
        <AppText>{subtitle}</AppText>
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  title,
  value,
  onPress,
  locked,
}: {
  icon: IconName;
  title: string;
  value?: string;
  onPress?: () => void;
  locked?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && { backgroundColor: colors.divider }]}
    >
      <Icon name={icon} size={28} color={colors.primary} />
      <View style={styles.flex}>
        <AppText bold style={{ fontSize: 19 }}>
          {title}
        </AppText>
        {value ? <AppText variant="muted">{value}</AppText> : null}
      </View>
      {locked ? (
        <Icon name="lock" size={22} color={colors.inputBorder} />
      ) : onPress ? (
        <Icon name="chev" size={22} color={colors.inputBorder} />
      ) : null}
    </Pressable>
  );
}

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <View style={styles.logo} accessible accessibilityLabel="Rakshak">
      <Icon name="shieldcheck" size={size + 10} color={colors.primary} />
      <Text style={[styles.logoText, { fontSize: size }]}>Rakshak</Text>
    </View>
  );
}

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <AppText bold>{label}</AppText>
      <TextInput
        placeholderTextColor={colors.muted}
        {...input}
        style={[styles.input, input.style]}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  info: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 17, lineHeight: 24, color: '#1E3A6B' },
  error: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.scamBg,
    borderColor: colors.scam,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
  },
  errorText: { flex: 1, fontSize: 18, lineHeight: 25, color: colors.ink, fontWeight: '600' },
  card: {
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 16,
    gap: 10,
  },
  avatar: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '800' },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 14,
  },
  personName: { fontSize: 19 },
  rowAction: { borderWidth: 2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rowActionText: { fontSize: 17, fontWeight: '800' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 16, fontWeight: '800' },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderRadius: 18,
    padding: 20,
  },
  statusTitle: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 72,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.divider,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { color: colors.primary, fontWeight: '800' },
  field: { gap: 6 },
  input: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    color: colors.ink,
  },
});
