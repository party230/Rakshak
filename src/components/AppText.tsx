/**
 * Text with the app's sizes built in, so nobody accidentally uses tiny text.
 *
 * variant:
 *  - "title"   28, bold   (screen headings)
 *  - "heading" 22, bold   (card headings)
 *  - "body"    18         (default)
 *  - "muted"   18, grey   (helper text)
 *  - "small"   16, grey   (short hints under buttons only)
 */
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, font } from '../theme';

type Variant = 'title' | 'heading' | 'body' | 'muted' | 'small';

type Props = TextProps & {
  variant?: Variant;
  center?: boolean;
  bold?: boolean;
  color?: string;
};

export function AppText({ variant = 'body', center, bold, color, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles[variant],
        center && styles.center,
        bold && styles.bold,
        color ? { color } : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: font.title, lineHeight: 36, fontWeight: '800', color: colors.ink },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '800', color: colors.ink },
  body: { fontSize: font.body, lineHeight: 26, color: colors.ink },
  muted: { fontSize: font.body, lineHeight: 26, color: colors.muted },
  small: { fontSize: font.small, lineHeight: 22, color: colors.muted },
  center: { textAlign: 'center' },
  bold: { fontWeight: '700' },
});
