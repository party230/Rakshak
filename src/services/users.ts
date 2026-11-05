/**
 * Reading and writing user profiles (users/{uid}) and Senior settings
 * (settings/{seniorId}) in Firestore.
 */
import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

import { DEFAULT_PAYMENT_LIMIT } from '../config';
import type { Language } from '../i18n/strings';
import type { Role, UserProfile } from '../types';
import { db } from './firebase';

/** Convert a Firestore document into our UserProfile shape. */
export function toProfile(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    name: String(data.name ?? ''),
    phone: String(data.phone ?? ''),
    role: data.role === 'family' ? 'family' : 'senior',
    language: data.language === 'hi' ? 'hi' : 'en',
    pushToken: typeof data.pushToken === 'string' ? data.pushToken : null,
  };
}

/**
 * Create the profile for a newly signed-in user.
 * Seniors also get their settings document with the default values.
 * Firestore security rules check that these values are allowed.
 */
export async function createProfile(input: {
  uid: string;
  phone: string;
  name: string;
  role: Role;
  language: Language;
}): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', input.uid), {
    id: input.uid,
    name: input.name.trim().slice(0, 60),
    phone: input.phone,
    role: input.role,
    language: input.language,
    pushToken: null,
    createdAt: serverTimestamp(),
  });
  if (input.role === 'senior') {
    batch.set(doc(db, 'settings', input.uid), {
      seniorId: input.uid,
      privacyLevel: 'standard',
      paymentLimit: DEFAULT_PAYMENT_LIMIT,
      trustedNumbers: [],
    });
  }
  await batch.commit();
}

export async function updateLanguage(uid: string, language: Language): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { language });
}

/** Watch one user's profile. Calls back with null if it doesn't exist (yet). */
export function watchProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      const data = snap.data();
      onChange(snap.exists() && data ? toProfile(uid, data) : null);
    },
    (e) => onError?.(e),
  );
}
