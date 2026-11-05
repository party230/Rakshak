/**
 * A1 · Language select. First screen on a new phone.
 * The heading is shown in both languages because we don't know which one
 * the user reads yet.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Icon } from '../../components/Icon';
import { LanguageChoice } from '../../components/LanguageChoice';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../i18n/LanguageContext';
import { strings, type Language } from '../../i18n/strings';
import { colors } from '../../theme';

export default function LanguageScreen() {
  const { language, setLanguage } = useLanguage();

  const choose = async (lang: Language) => {
    await setLanguage(lang);
    router.replace('/role');
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <Icon name="shieldcheck" size={96} color={colors.primary} />
        <AppText variant="title" center color={colors.primary} style={styles.brand}>
          Rakshak · रक्षक
        </AppText>
        <AppText center bold style={styles.pick}>
          {strings.hi['language.title']}
        </AppText>
        <AppText center bold style={styles.pick}>
          {strings.en['language.title']}
        </AppText>
      </View>
      <LanguageChoice selected={language} onChoose={choose} />
      <AppText variant="small" center>
        {strings[language ?? 'en']['language.changeLater']}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 8, marginTop: 40, marginBottom: 16 },
  brand: { fontSize: 34, lineHeight: 44 },
  pick: { fontSize: 22, lineHeight: 30 },
});
