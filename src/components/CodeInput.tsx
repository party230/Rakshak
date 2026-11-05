/**
 * Six big boxes for entering a 6-digit code (login code or invite code).
 *
 * Behind the boxes is one invisible TextInput that holds the digits. Tapping
 * any box focuses it, so the number keyboard opens. This works better for
 * older users than six separate inputs (no jumping between fields).
 */
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';

import { colors } from '../theme';

type Props = {
  value: string;
  onChange: (digits: string) => void;
  length?: number;
  autoFocus?: boolean;
  /** Called once all digits are entered. */
  onComplete?: (digits: string) => void;
  /** Lets Android/iOS offer the SMS code from the keyboard. */
  isOneTimeCode?: boolean;
  accessibilityLabel: string;
};

export function CodeInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  onComplete,
  isOneTimeCode,
  accessibilityLabel,
}: Props) {
  const inputRef = useRef<TextInputInstance>(null);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const digit = value[i];
          return (
            <View key={i} style={[styles.box, digit !== undefined && styles.filled]}>
              <Text style={styles.digit}>{digit ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        textContentType={isOneTimeCode ? 'oneTimeCode' : 'none'}
        autoComplete={isOneTimeCode ? 'sms-otp' : 'off'}
        accessibilityLabel={accessibilityLabel}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    height: 64,
    maxWidth: 56,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  digit: { fontSize: 28, fontWeight: '800', color: colors.ink },
  // Covers the boxes, fully transparent, so taps and paste still work.
  hidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    fontSize: 1,
  },
});
