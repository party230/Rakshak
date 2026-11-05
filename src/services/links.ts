/**
 * Linking Seniors and Family members.
 *
 * - Links are created ONLY by the `linkWithCode` Cloud Function, which checks
 *   the invite code, its 24-hour expiry and the 5-family limit on the server.
 * - Either side can remove a link (Firestore rules allow deleting your own link).
 * - Link document IDs are "<seniorId>_<familyId>" so security rules can check
 *   a link with a single lookup.
 */
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
import { httpsCallable } from '@react-native-firebase/functions';

import type { StringKey } from '../i18n/strings';
import type { Link, UserProfile } from '../types';
import { db, functions } from './firebase';
import { toProfile } from './users';

/** A linked person: the link plus that person's profile. */
export type LinkedPerson = { link: Link; profile: UserProfile };

function toLink(id: string, data: Record<string, unknown>): Link {
  const createdAt = data.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    seniorId: String(data.seniorId),
    familyId: String(data.familyId),
    createdAtMs: createdAt?.toMillis?.() ?? Date.now(),
  };
}

/**
 * Watch everyone linked to `uid`.
 *  - For a Senior: their Family members.
 *  - For a Family member: the Seniors they look after.
 * Results are sorted oldest link first (the first is the Emergency contact).
 */
export function watchLinkedPeople(
  uid: string,
  myRole: 'senior' | 'family',
  onChange: (people: LinkedPerson[]) => void,
): () => void {
  const myField = myRole === 'senior' ? 'seniorId' : 'familyId';
  const otherField = myRole === 'senior' ? 'familyId' : 'seniorId';

  let links: Link[] = [];
  const profiles = new Map<string, UserProfile>();
  const profileUnsubs = new Map<string, () => void>();

  const emit = () => {
    const people = links
      .map((link) => {
        const profile = profiles.get(link[otherField]);
        return profile ? { link, profile } : null;
      })
      .filter((p): p is LinkedPerson => p !== null)
      .sort((a, b) => a.link.createdAtMs - b.link.createdAtMs);
    onChange(people);
  };

  const unsubLinks = onSnapshot(
    query(collection(db, 'links'), where(myField, '==', uid)),
    (snap) => {
      links = snap.docs.map((d) => toLink(d.id, d.data()));
      const wanted = new Set(links.map((l) => l[otherField]));

      // Start watching profiles of newly linked people…
      for (const otherId of wanted) {
        if (profileUnsubs.has(otherId)) continue;
        const unsub = onSnapshot(
          doc(db, 'users', otherId),
          (p) => {
            const data = p.data();
            if (p.exists() && data) profiles.set(otherId, toProfile(otherId, data));
            emit();
          },
          // If the link was just removed, reading their profile is no longer
          // allowed. That's expected, so we just drop them.
          () => {
            profiles.delete(otherId);
            emit();
          },
        );
        profileUnsubs.set(otherId, unsub);
      }
      // …and stop watching people who are no longer linked.
      for (const [otherId, unsub] of profileUnsubs) {
        if (!wanted.has(otherId)) {
          unsub();
          profileUnsubs.delete(otherId);
          profiles.delete(otherId);
        }
      }
      emit();
    },
    () => onChange([]),
  );

  return () => {
    unsubLinks();
    profileUnsubs.forEach((unsub) => unsub());
  };
}

export async function removeLink(linkId: string): Promise<void> {
  await deleteDoc(doc(db, 'links', linkId));
}

// ---------- Cloud Function calls ----------

export type Invite = { code: string; expiresAtMs: number };

/** Senior: get the current invite code (or a new one if the old one expired). */
export async function getInviteCode(): Promise<Invite> {
  const call = httpsCallable<void, Invite>(functions, 'getInvite');
  const result = await call();
  return result.data;
}

/** Family: see whose code this is, before linking. */
export async function previewInvite(code: string): Promise<{ name: string }> {
  const call = httpsCallable<{ code: string }, { name: string }>(functions, 'previewInvite');
  const result = await call({ code });
  return result.data;
}

/** Family: link to the Senior who owns this code. */
export async function linkWithCode(code: string): Promise<{ seniorName: string }> {
  const call = httpsCallable<{ code: string }, { seniorName: string }>(functions, 'linkWithCode');
  const result = await call({ code });
  return result.data;
}

/**
 * The server tells us why linking failed in `details.reason`.
 * Map that to a message the user can understand.
 */
export function linkErrorKey(error: unknown): StringKey {
  const e = error as { code?: string; details?: { reason?: string } | null };
  switch (e?.details?.reason) {
    case 'invalid':
      return 'link.invalid';
    case 'expired':
      return 'link.expired';
    case 'senior_full':
      return 'link.full';
    case 'self':
      return 'link.self';
    case 'not_family':
      return 'link.notFamily';
    case 'rate_limited':
      return 'link.tooMany';
  }
  if (e?.code?.includes('unavailable')) return 'common.noInternet';
  return 'common.error';
}
