/**
 * Per-user request limits, stored in Firestore (rateLimits/{uid}_{action}).
 *
 * Used to stop someone guessing invite codes, and (from Phase 2) to cap how
 * often each user can call Claude.
 *
 * Simple fixed windows: at most `perMinute` calls in the current minute and
 * `perDay` calls in the current day. Done in a transaction so two calls at the
 * same moment can't both slip through.
 */
import { HttpsError } from 'firebase-functions/v2/https';

import { db } from './admin';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export async function enforceRateLimit(
  uid: string,
  action: string,
  limits: { perMinute: number; perDay: number },
): Promise<void> {
  const ref = db.collection('rateLimits').doc(`${uid}_${action}`);
  const now = Date.now();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() ?? {};

    // Start a new window if the old one has passed.
    const minuteStart = now - (data.minuteStart ?? 0) >= MINUTE ? now : data.minuteStart;
    const minuteCount = minuteStart === now ? 0 : (data.minuteCount ?? 0);
    const dayStart = now - (data.dayStart ?? 0) >= DAY ? now : data.dayStart;
    const dayCount = dayStart === now ? 0 : (data.dayCount ?? 0);

    if (minuteCount >= limits.perMinute || dayCount >= limits.perDay) {
      throw new HttpsError('resource-exhausted', 'Too many requests. Please wait.', {
        reason: 'rate_limited',
      });
    }

    tx.set(ref, {
      minuteStart,
      minuteCount: minuteCount + 1,
      dayStart,
      dayCount: dayCount + 1,
    });
  });
}
