/**
 * Who is using the app right now, and what they should see.
 *
 * `status` drives navigation (see src/app/_layout.tsx):
 *   loading        -> splash spinner
 *   needsLanguage  -> Language select (A1)
 *   signedOut      -> Role select (A2) -> Login (A3) -> Code (A4)
 *   needsRole      -> signed in, but no profile and no saved role: Role select again
 *   senior         -> Senior tabs
 *   family         -> Family tabs
 *
 * After login, if the user has no profile yet, we create it from the role and
 * name they picked during onboarding (saved in services/onboarding.ts).
 */
import { onAuthStateChanged, type User } from '@react-native-firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useLanguage } from '../i18n/LanguageContext';
import { auth } from '../services/firebase';
import { clearPendingOnboarding, getPendingOnboarding } from '../services/onboarding';
import { logOut } from '../services/phoneAuth';
import { createProfile, updateLanguage, watchProfile } from '../services/users';
import type { Role, UserProfile } from '../types';

export type SessionStatus =
  'loading' | 'needsLanguage' | 'signedOut' | 'needsRole' | 'senior' | 'family';

type SessionValue = {
  status: SessionStatus;
  profile: UserProfile | null;
  /** Used when a signed-in user has no profile and no saved role. */
  createProfileWithRole: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { language, loaded: languageLoaded } = useLanguage();

  // undefined = still checking, null = nobody signed in
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);

  // The last profile we received, tagged with whose it is. Tagging lets us
  // tell "still loading this user's profile" apart from an old user's data.
  const [loadedProfile, setLoadedProfile] = useState<{
    uid: string;
    profile: UserProfile | null;
  } | null>(null);

  // The user ID for which we need the user to pick a role (see step 3).
  const [needsRoleFor, setNeedsRoleFor] = useState<string | null>(null);

  // undefined = still loading, null = signed in but no profile document yet
  const profile: UserProfile | null | undefined = !authUser
    ? null
    : loadedProfile?.uid === authUser.uid
      ? loadedProfile.profile
      : undefined;
  const needsRole = !!authUser && needsRoleFor === authUser.uid;

  // 1. Listen for sign-in / sign-out.
  useEffect(() => onAuthStateChanged(auth, (user) => setAuthUser(user)), []);

  // 2. When signed in, watch the user's profile document.
  const uid = authUser?.uid;
  useEffect(() => {
    if (!uid) return;
    return watchProfile(uid, (p) => setLoadedProfile({ uid, profile: p }));
  }, [uid]);

  // 3. Signed in but no profile yet: create it from the onboarding choices.
  useEffect(() => {
    if (!authUser || profile !== null || !language) return;
    let cancelled = false;
    (async () => {
      const pending = await getPendingOnboarding();
      if (cancelled) return;
      if (!pending.role) {
        setNeedsRoleFor(authUser.uid);
        return;
      }
      try {
        await createProfile({
          uid: authUser.uid,
          phone: authUser.phoneNumber ?? '',
          name: pending.name ?? '',
          role: pending.role,
          language,
        });
        await clearPendingOnboarding();
      } catch {
        // Couldn't create (e.g. offline). Let the user pick the role again,
        // which retries the creation.
        if (!cancelled) setNeedsRoleFor(authUser.uid);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser, profile, language]);

  // 4. Keep the profile's language in step with the language on this phone,
  //    so push messages from the server use the right language.
  useEffect(() => {
    if (profile && language && profile.language !== language) {
      updateLanguage(profile.id, language).catch(() => {
        // Will retry next time the profile or language changes.
      });
    }
  }, [profile, language]);

  const createProfileWithRole = useCallback(
    async (role: Role) => {
      if (!authUser || !language) return;
      const pending = await getPendingOnboarding();
      await createProfile({
        uid: authUser.uid,
        phone: authUser.phoneNumber ?? '',
        name: pending.name ?? '',
        role,
        language,
      });
      await clearPendingOnboarding();
      setNeedsRoleFor(null);
    },
    [authUser, language],
  );

  const status: SessionStatus = useMemo(() => {
    if (!languageLoaded || authUser === undefined) return 'loading';
    if (!language) return 'needsLanguage';
    if (authUser === null) return 'signedOut';
    if (profile === undefined) return 'loading';
    if (profile === null) return needsRole ? 'needsRole' : 'loading';
    return profile.role;
  }, [languageLoaded, language, authUser, profile, needsRole]);

  const value = useMemo(
    () => ({
      status,
      profile: profile ?? null,
      createProfileWithRole,
      signOut: logOut,
    }),
    [status, profile, createProfileWithRole],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
