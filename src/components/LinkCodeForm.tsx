/**
 * F1 · Enter invite code (the form part). Used on Family Home when nobody is
 * linked yet, and on the "Link another parent" screen.
 *
 * 1. Family member types the 6 digits.
 * 2. We show whose code it is (so they can check it's the right person).
 * 3. They tap Link. The server creates the link.
 */
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import type { StringKey } from '../i18n/strings';
import { linkErrorKey, linkWithCode, previewInvite } from '../services/links';
import { colors } from '../theme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { ErrorNote, PersonRow } from './Blocks';
import { CodeInput } from './CodeInput';
import { Icon } from './Icon';

type Props = { onLinked: (seniorName: string) => void };

export function LinkCodeForm({ onLinked }: Props) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<{ name: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);

  const onChange = (digits: string) => {
    setCode(digits);
    setPreview(null);
    setError(null);
  };

  const check = async (digits: string) => {
    setChecking(true);
    try {
      setPreview(await previewInvite(digits));
    } catch (e) {
      setError(linkErrorKey(e));
    } finally {
      setChecking(false);
    }
  };

  const link = async () => {
    setLinking(true);
    setError(null);
    try {
      const result = await linkWithCode(code);
      setCode('');
      setPreview(null);
      onLinked(result.seniorName);
    } catch (e) {
      setError(linkErrorKey(e));
    } finally {
      setLinking(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <AppText variant="muted">{t('link.help')}</AppText>
      <CodeInput
        value={code}
        onChange={onChange}
        onComplete={check}
        accessibilityLabel={t('link.title')}
      />

      {checking ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      {preview ? (
        <PersonRow
          name={preview.name}
          right={<Icon name="checkc" size={32} color={colors.safe} />}
        />
      ) : null}
      {error ? <ErrorNote message={t(error)} /> : null}

      <BigButton label={t('link.button')} onPress={link} loading={linking} disabled={!preview} />
      <AppText variant="small" center>
        {t('link.more')}
      </AppText>
    </View>
  );
}
