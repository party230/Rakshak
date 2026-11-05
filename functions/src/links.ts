/**
 * Linking a Senior with Family members using a 6-digit invite code.
 *
 *   getInvite      (Senior)  -> returns the current code, or makes a new one
 *   previewInvite  (Family)  -> "whose code is this?" before linking
 *   linkWithCode   (Family)  -> creates links/{seniorId}_{familyId}
 *
 * Rules enforced here (the app can't be trusted to enforce them):
 *   - codes are valid for 24 hours
 *   - a Senior can have at most 5 Family members
 *   - only Family accounts can link, and not to themselves
 *   - code guessing is rate-limited
 *
 * Failures include `details.reason` so the app can show the right message:
 *   invalid | expired | senior_full | self | not_family | not_senior | rate_limited
 */
import { randomInt } from 'node:crypto';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db, requireAuth, requireRole } from './admin';
import { enforceRateLimit } from './rateLimit';

export const MAX_FAMILY_PER_SENIOR = 5;
const INVITE_VALID_MS = 24 * 60 * 60 * 1000;

/** Limits for trying invite codes: enough for typos, too few for guessing. */
const CODE_TRY_LIMITS = { perMinute: 10, perDay: 50 };

type InviteDoc = { seniorId: string; expiresAt: Timestamp; createdAt: Timestamp };

function checkCodeFormat(code: unknown): string {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    throw new HttpsError('invalid-argument', 'The code must be 6 digits.', { reason: 'invalid' });
  }
  return code;
}

/** Load an invite and make sure it exists and hasn't expired. */
async function loadValidInvite(code: string): Promise<InviteDoc> {
  const snap = await db.collection('invites').doc(code).get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'No such code.', { reason: 'invalid' });
  }
  const invite = snap.data() as InviteDoc;
  if (invite.expiresAt.toMillis() < Date.now()) {
    throw new HttpsError('not-found', 'This code has expired.', { reason: 'expired' });
  }
  return invite;
}

/**
 * Senior: get my invite code. Reuses a code that is still valid, so the code
 * doesn't change every time the My family screen is opened.
 */
export const getInvite = onCall(async (request) => {
  const uid = requireAuth(request);
  await requireRole(uid, 'senior', 'not_senior');

  const now = Date.now();
  const mine = await db.collection('invites').where('seniorId', '==', uid).get();

  // Clean up expired codes and reuse a valid one if there is one.
  const batch = db.batch();
  let valid: { code: string; expiresAtMs: number } | null = null;
  for (const doc of mine.docs) {
    const expiresAtMs = (doc.get('expiresAt') as Timestamp).toMillis();
    if (expiresAtMs < now) batch.delete(doc.ref);
    else if (!valid || expiresAtMs > valid.expiresAtMs) valid = { code: doc.id, expiresAtMs };
  }
  await batch.commit();
  if (valid) return valid;

  // Make a new random code. `create` fails if that code is already taken by
  // someone else, in which case we simply try another one.
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAtMs = now + INVITE_VALID_MS;
    try {
      await db
        .collection('invites')
        .doc(code)
        .create({
          seniorId: uid,
          createdAt: Timestamp.fromMillis(now),
          expiresAt: Timestamp.fromMillis(expiresAtMs),
        });
      return { code, expiresAtMs };
    } catch {
      // Code already in use: try again.
    }
  }
  throw new HttpsError('unavailable', 'Could not create a code. Please try again.');
});

/** Family: show whose code this is, so they can check before linking. */
export const previewInvite = onCall(async (request) => {
  const uid = requireAuth(request);
  const code = checkCodeFormat((request.data as { code?: unknown })?.code);
  await enforceRateLimit(uid, 'inviteCode', CODE_TRY_LIMITS);
  await requireRole(uid, 'family', 'not_family');

  const invite = await loadValidInvite(code);
  if (invite.seniorId === uid) {
    throw new HttpsError('failed-precondition', 'You cannot link to yourself.', { reason: 'self' });
  }
  const senior = await db.collection('users').doc(invite.seniorId).get();
  // Only the name is shared, nothing else, until the link is made.
  return { name: String(senior.get('name') ?? '') };
});

/** Family: link to the Senior who owns this code. */
export const linkWithCode = onCall(async (request) => {
  const uid = requireAuth(request);
  const code = checkCodeFormat((request.data as { code?: unknown })?.code);
  await enforceRateLimit(uid, 'inviteCode', CODE_TRY_LIMITS);
  await requireRole(uid, 'family', 'not_family');

  const invite = await loadValidInvite(code);
  const seniorId = invite.seniorId;
  if (seniorId === uid) {
    throw new HttpsError('failed-precondition', 'You cannot link to yourself.', { reason: 'self' });
  }

  const linkRef = db.collection('links').doc(`${seniorId}_${uid}`);

  // A transaction makes the "max 5" check safe even if two people link at once.
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(linkRef);
    if (existing.exists) return; // Already linked: nothing to do.

    const current = await tx.get(db.collection('links').where('seniorId', '==', seniorId));
    if (current.size >= MAX_FAMILY_PER_SENIOR) {
      throw new HttpsError('resource-exhausted', 'This person already has 5 family members.', {
        reason: 'senior_full',
      });
    }
    tx.create(linkRef, { seniorId, familyId: uid, createdAt: FieldValue.serverTimestamp() });
  });

  const senior = await db.collection('users').doc(seniorId).get();
  return { seniorName: String(senior.get('name') ?? '') };
});
