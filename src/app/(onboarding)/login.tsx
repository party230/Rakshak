/**
 * A3 · Phone login: mobile number + name, then "Send code".
 * Demo numbers (+91 90000 00001/2/3) get the fixed code 123456 with no SMS.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { BigButton } from '../../components/BigButton';
import { ErrorNote, Field } from '../../components/Blocks';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { savePendingOnboarding } from '../../services/onboarding';
import { loginErrorKey, sendLoginCode } from '../../services/phoneAuth';
import { colors } from '../../theme';
import { toE164India } from '../../utils/phone';

export default function LoginScreen() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);

  const send = async () => {
    setError(null);
    const e164 = toE164India(phone);
    if (!e164) return setError('login.badPhone');
    if (!name.trim()) return setError('login.needName');

    setBusy(true);
    try {
      await savePendingOnboarding({ name: name.trim() });
      await sendLoginCode(e164);
      router.push({ pathname: '/otp', params: { phone: e164 } });
    } catch (e) {
      setError(loginErrorKey(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      onBack={() => router.back()}
      footer={<BigButton label={t('login.send')} onPress={send} loading={busy} />}
    >
      <AppText variant="title">{t('login.title')}</AppText>
      <AppText variant="muted">{t('login.subtitle')}</AppText>

      <View style={styles.field}>
        <AppText bold>{t('login.phoneLabel')}</AppText>
        <View style={styles.phoneBox}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={14}
            placeholder="98765 43210"
            placeholderTextColor={colors.muted}
            accessibilityLabel={t('login.phoneLabel')}
            style={styles.phoneInput}
            autoFocus
          />
        </View>
      </View>

      <Field
        label={t('login.nameLabel')}
        value={name}
        onChangeText={setName}
        placeholder={t('login.namePlaceholder')}
        autoCapitalize="words"
        textContentType="name"
        maxLength={60}
        returnKeyType="done"
        onSubmitEditing={send}
      />

      {error ? <ErrorNote message={t(error)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  prefix: { fontSize: 24, fontWeight: '700', color: colors.muted },
  phoneInput: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.ink, paddingVertical: 12 },
});
