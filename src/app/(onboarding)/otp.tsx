/**
 * A4 · Enter the 6-digit login code.
 * Submits automatically once 6 digits are typed. After success, the session
 * creates the profile (if new) and the root layout moves to the right tabs.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { AppText } from '../../components/AppText';
import { BigButton } from '../../components/BigButton';
import { ErrorNote, InfoNote } from '../../components/Blocks';
import { CodeInput } from '../../components/CodeInput';
import { Screen } from '../../components/Screen';
import { OTP_RESEND_SECONDS } from '../../config';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { confirmLoginCode, loginErrorKey, sendLoginCode } from '../../services/phoneAuth';
import { colors } from '../../theme';
import { formatPhone } from '../../utils/phone';

export default function OtpScreen() {
  const { t } = useLanguage();
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);
  const [notice, setNotice] = useState<StringKey | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);

  // Count down until "Send the code again" is allowed.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const submit = async (digits: string) => {
    if (digits.length !== 6 || busy) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await confirmLoginCode(digits);
      // Signed in. Keep the spinner; the app navigates away by itself.
    } catch (e) {
      setError(loginErrorKey(e));
      setCode('');
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      await sendLoginCode(phone);
      setNotice('otp.sent');
      setSecondsLeft(OTP_RESEND_SECONDS);
    } catch (e) {
      setError(loginErrorKey(e));
    }
  };

  const time = `0:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <Screen
      scroll
      onBack={() => router.back()}
      footer={
        <BigButton
          label={t('common.continue')}
          onPress={() => submit(code)}
          loading={busy}
          disabled={code.length !== 6}
        />
      }
    >
      <AppText variant="title">{t('otp.title')}</AppText>
      <AppText variant="muted">{t('otp.subtitle', { phone: formatPhone(phone) })}</AppText>

      <CodeInput
        value={code}
        onChange={setCode}
        onComplete={submit}
        autoFocus
        isOneTimeCode
        accessibilityLabel={t('otp.title')}
      />

      <InfoNote icon="lock">{t('otp.never')}</InfoNote>

      {error ? <ErrorNote message={t(error)} /> : null}
      {notice ? (
        <AppText center color={colors.safe} bold>
          {t(notice)}
        </AppText>
      ) : null}
      {busy ? <ActivityIndicator size="large" color={colors.primary} /> : null}

      {secondsLeft > 0 ? (
        <AppText variant="muted" center>
          {t('otp.resendIn', { time })}
        </AppText>
      ) : (
        <Pressable accessibilityRole="button" onPress={resend} hitSlop={12}>
          <Text style={styles.resend}>{t('otp.resend')}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resend: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: 12,
  },
});
