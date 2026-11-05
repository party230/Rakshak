/**
 * Shapes of the data we keep in Firestore. Matches the spec's data structure.
 * Server code has its own copy in functions/src/types.ts.
 */
import type { Language } from './i18n/strings';

export type Role = 'senior' | 'family';

/** users/{uid} */
export type UserProfile = {
  id: string;
  name: string;
  phone: string; // +91XXXXXXXXXX
  role: Role;
  language: Language;
  /** Push notification token for this phone (set in Phase 3). Spec name: fcmToken. */
  pushToken: string | null;
};

/** links/{seniorId}_{familyId}  (created only by the linkWithCode Cloud Function) */
export type Link = {
  id: string;
  seniorId: string;
  familyId: string;
  createdAtMs: number;
};

export type PrivacyLevel = 'basic' | 'standard' | 'full';

export type TrustedNumber = { name: string; phone: string };

/** settings/{seniorId} */
export type SeniorSettings = {
  seniorId: string;
  privacyLevel: PrivacyLevel;
  paymentLimit: number;
  trustedNumbers: TrustedNumber[];
};
