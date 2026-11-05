/**
 * Firebase Admin SDK, set up once and shared by all functions.
 * The Admin SDK is not limited by Firestore security rules, so every function
 * must check permissions itself.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

if (getApps().length === 0) initializeApp();

export const db = getFirestore();

export type Role = 'senior' | 'family';

/** Make sure the caller is signed in and return their user ID. */
export function requireAuth(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in first.');
  return uid;
}

/** Read the caller's profile and make sure they have the expected role. */
export async function requireRole(uid: string, role: Role, reason: string) {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists || snap.get('role') !== role) {
    throw new HttpsError('permission-denied', `Only ${role} accounts can do this.`, { reason });
  }
  return snap.data() as { name: string; phone: string; role: Role };
}
