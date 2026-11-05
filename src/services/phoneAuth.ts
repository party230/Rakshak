/**
 * Phone number + OTP login, using Firebase Authentication.
 *
 * Flow:
 *   1. sendLoginCode('+919876543210')  -> Firebase sends an SMS
 *   2. confirmLoginCode('123456')      -> the user is signed in
 *
 * The code is never stored by us. Firebase checks it on its servers.
 *
 * On Android, Firebase can sometimes read the SMS by itself and sign the user
 * in without step 2. SessionContext notices the sign-in either way.
 */
import {
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from '@react-native-firebase/auth';

import { DEMO_PHONE_NUMBERS } from '../config';
import { auth } from './firebase';

// The pending login, kept in memory between the login screen and the code screen.
let pending: ConfirmationResult | null = null;

export async function sendLoginCode(phoneE164: string): Promise<void> {
  // Demo numbers (Firebase "test phone numbers") don't need the phone check
  // that Firebase normally does before sending an SMS. Turning it off for them
  // makes demo logins work instantly, even on a free Apple account.
  // Real numbers always go through the normal check.
  auth.settings.appVerificationDisabledForTesting = DEMO_PHONE_NUMBERS.includes(phoneE164);
  pending = await signInWithPhoneNumber(auth, phoneE164);
}

export async function confirmLoginCode(code: string): Promise<void> {
  if (!pending) throw Object.assign(new Error('No code was sent'), { code: 'auth/code-expired' });
  await pending.confirm(code);
  pending = null;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

/** Map a Firebase login error to one of our text keys. */
export function loginErrorKey(error: unknown) {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('invalid-verification-code')) return 'otp.wrong' as const;
  if (code.includes('code-expired') || code.includes('session-expired'))
    return 'otp.expired' as const;
  if (code.includes('invalid-phone-number')) return 'login.badPhone' as const;
  if (code.includes('too-many-requests') || code.includes('quota-exceeded'))
    return 'login.tooMany' as const;
  if (code.includes('network')) return 'common.noInternet' as const;
  return 'common.error' as const;
}
