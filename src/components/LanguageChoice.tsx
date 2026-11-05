/**
 * The two big language buttons, used on first launch (A1) and in Settings.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGE_NAMES, type Language } from '../i18n/strings';
import { colors } from '../theme';
import { Icon } from './Icon';

type Props = {
  selected: Language | null;
  onChoose: (lang: Language) => void;
};

export function LanguageChoice({ selected, onChoose }: Props) {
  return (
    <View style={styles.list}>
      {(['hi', 'en'] as const).map((lang) => {
        const isSelected = selected === lang;
        return (
          <Pressable
            key={lang}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChoose(lang)}
            style={({ pressed }) => [
              styles.button,
              isSelected && styles.selected,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.label}>{LANGUAGE_NAMES[lang]}</Text>
            {isSelected ? <Icon name="checkc" size={30} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  button: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  selected: { borderWidth: 3, backgroundColor: colors.primarySoft },
  label: { fontSize: 30, fontWeight: '800', color: colors.primary },
});
