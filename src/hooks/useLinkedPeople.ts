/**
 * Live list of the people linked to the signed-in user.
 * Senior -> their Family members. Family -> the Seniors they look after.
 */
import { useEffect, useState } from 'react';

import { watchLinkedPeople, type LinkedPerson } from '../services/links';
import { useSession } from '../session/SessionContext';

export function useLinkedPeople(): { people: LinkedPerson[]; loaded: boolean } {
  const { profile } = useSession();
  const uid = profile?.id;
  const role = profile?.role;

  // The latest list, tagged with whose list it is, so a list belonging to a
  // previous user is never shown.
  const [result, setResult] = useState<{ uid: string; people: LinkedPerson[] } | null>(null);

  useEffect(() => {
    if (!uid || !role) return;
    return watchLinkedPeople(uid, role, (people) => setResult({ uid, people }));
  }, [uid, role]);

  const loaded = !!uid && result?.uid === uid;
  return { people: loaded ? result.people : [], loaded };
}
