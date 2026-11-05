/**
 * Remembers the role and name the user picked during onboarding, before their
 * account exists. SessionContext reads these after login to create the profile.
 *
 * Saved on the phone so it survives the app being closed during login.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Role } from '../types';

const KEY = 'rakshak.onboarding';

export type PendingOnboarding = { role?: Role; name?: string };

export async function getPendingOnboarding(): Promise<PendingOnboarding> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingOnboarding) : {};
  } catch {
    return {};
  }
}

export async function savePendingOnboarding(update: PendingOnboarding): Promise<void> {
  const current = await getPendingOnboarding();
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...update }));
  } catch {
    // Not fatal: SessionContext will ask for the role again if it's missing.
  }
}

export async function clearPendingOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
