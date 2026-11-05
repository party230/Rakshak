/**
 * Keeps track of the chosen language and gives screens a `t()` function.
 *
 * The language is saved on the phone (AsyncStorage) so it is remembered even
 * before the user logs in. When a user is logged in, SessionContext also copies
 * it to their Firestore profile so the server can send push messages in the
 * right language.
 *
 * Usage in a screen:
 *   const { t } = useLanguage();
 *   <Text>{t('home.greeting', { name: 'Kamla ji' })}</Text>
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { strings, type Language, type StringKey } from './strings';

const STORAGE_KEY = 'rakshak.language';

type Params = Record<string, string | number>;

type LanguageContextValue = {
  /** null until the user has picked a language for the first time. */
  language: Language | null;
  /** true once we have read the saved language from storage. */
  loaded: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  /** Look up a string and fill in {placeholders}. */
  t: (key: StringKey, params?: Params) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Replace {name}-style placeholders with values. */
function fill(text: string, params?: Params): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Read the saved language once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'hi') setLanguageState(saved);
      })
      .catch(() => {
        // If storage fails we simply ask the user to pick again.
      })
      .finally(() => setLoaded(true));
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not fatal: the app still works, it just asks again next launch.
    }
  }, []);

  const t = useCallback(
    (key: StringKey, params?: Params) => fill(strings[language ?? 'en'][key], params),
    [language],
  );

  const value = useMemo(
    () => ({ language, loaded, setLanguage, t }),
    [language, loaded, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
