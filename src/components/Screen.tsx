/**
 * Wraps every screen: white background, safe area (notch, home bar) and the
 * standard 20px side padding.
 *
 * - `scroll`: let the content scroll (for long screens and forms).
 * - `footer`: content pinned to the bottom, e.g. the main action button.
 * - `title` + `onBack`: shows the top bar with a back arrow.
 */
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';
import { TopBar } from './TopBar';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  title?: string;
  onBack?: () => void;
  /** Screens inside a tab bar don't need the bottom safe-area padding. */
  hasTabBar?: boolean;
};

export function Screen({ children, footer, scroll, title, onBack, hasTabBar }: Props) {
  const edges: Edge[] = hasTabBar ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom'];

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {title !== undefined || onBack ? <TopBar title={title} onBack={onBack} /> : null}
        {content}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: spacing.md, gap: spacing.md },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  footer: { paddingHorizontal: 20, paddingBottom: spacing.md, paddingTop: spacing.sm, gap: 12 },
});
