/**
 * Tests for ../firestore.rules, run against the local Firestore emulator.
 *
 * Run (from this folder):  npm install && npm run test:rules
 * Needs Java installed (the emulator is a Java program).
 *
 * Cast:
 *   kamla  – Senior
 *   rahul  – Family, linked to Kamla
 *   priya  – Family, NOT linked to Kamla
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const PHONES = { kamla: '+919000000001', rahul: '+919000000002', priya: '+919000000003' };

let env: RulesTestEnvironment;

/** A Firestore client signed in as one of our test people. */
const as = (who: keyof typeof PHONES) =>
  env.authenticatedContext(who, { phone_number: PHONES[who] }).firestore();

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rakshak',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

// Fresh data before every test (written with rules turned off).
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [id, role] of [
      ['kamla', 'senior'],
      ['rahul', 'family'],
      ['priya', 'family'],
    ] as const) {
      await setDoc(doc(db, 'users', id), {
        id,
        name: id,
        phone: PHONES[id],
        role,
        language: 'en',
        pushToken: null,
      });
    }
    await setDoc(doc(db, 'settings', 'kamla'), {
      seniorId: 'kamla',
      privacyLevel: 'standard',
      paymentLimit: 5000,
      trustedNumbers: [],
    });
    await setDoc(doc(db, 'links', 'kamla_rahul'), { seniorId: 'kamla', familyId: 'rahul' });
    await setDoc(doc(db, 'invites', '123456'), { seniorId: 'kamla' });
  });
});

const newProfile = (id: string, phone: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: 'New Person',
  phone,
  role: 'senior',
  language: 'hi',
  pushToken: null,
  createdAt: serverTimestamp(),
  ...extra,
});

describe('users', () => {
  test('a new user can create their own profile with their verified phone', async () => {
    const db = env.authenticatedContext('newbie', { phone_number: '+919811111111' }).firestore();
    await assertSucceeds(setDoc(doc(db, 'users', 'newbie'), newProfile('newbie', '+919811111111')));
  });

  test('cannot create a profile with someone else’s phone number', async () => {
    const db = env.authenticatedContext('newbie', { phone_number: '+919811111111' }).firestore();
    await assertFails(setDoc(doc(db, 'users', 'newbie'), newProfile('newbie', PHONES.kamla)));
  });

  test('cannot create a profile with a made-up role', async () => {
    const db = env.authenticatedContext('newbie', { phone_number: '+919811111111' }).firestore();
    await assertFails(
      setDoc(doc(db, 'users', 'newbie'), newProfile('newbie', '+919811111111', { role: 'admin' })),
    );
  });

  test('cannot create a profile for another user', async () => {
    await assertFails(
      setDoc(doc(as('priya'), 'users', 'someoneElse'), newProfile('someoneElse', PHONES.priya)),
    );
  });

  test('can change own language, but not own role', async () => {
    await assertSucceeds(updateDoc(doc(as('kamla'), 'users', 'kamla'), { language: 'hi' }));
    await assertFails(updateDoc(doc(as('kamla'), 'users', 'kamla'), { role: 'family' }));
  });

  test('linked people can read each other’s profiles', async () => {
    await assertSucceeds(getDoc(doc(as('rahul'), 'users', 'kamla')));
    await assertSucceeds(getDoc(doc(as('kamla'), 'users', 'rahul')));
  });

  test('unlinked people cannot read a profile', async () => {
    await assertFails(getDoc(doc(as('priya'), 'users', 'kamla')));
    await assertFails(getDoc(doc(as('kamla'), 'users', 'priya')));
  });

  test('signed-out visitors cannot read anything', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users', 'kamla')));
  });
});

describe('links', () => {
  test('the app cannot create links directly (only the server can)', async () => {
    await assertFails(
      setDoc(doc(as('priya'), 'links', 'kamla_priya'), { seniorId: 'kamla', familyId: 'priya' }),
    );
  });

  test('both sides can read their link; others cannot', async () => {
    await assertSucceeds(getDoc(doc(as('kamla'), 'links', 'kamla_rahul')));
    await assertSucceeds(getDoc(doc(as('rahul'), 'links', 'kamla_rahul')));
    await assertFails(getDoc(doc(as('priya'), 'links', 'kamla_rahul')));
  });

  test('the Senior can remove a Family member', async () => {
    await assertSucceeds(deleteDoc(doc(as('kamla'), 'links', 'kamla_rahul')));
  });

  test('a stranger cannot remove someone else’s link', async () => {
    await assertFails(deleteDoc(doc(as('priya'), 'links', 'kamla_rahul')));
  });

  test('after removal, the Family member loses access', async () => {
    await deleteDoc(doc(as('kamla'), 'links', 'kamla_rahul'));
    await assertFails(getDoc(doc(as('rahul'), 'users', 'kamla')));
    await assertFails(getDoc(doc(as('rahul'), 'settings', 'kamla')));
  });
});

describe('settings', () => {
  test('Senior and linked Family can read settings; others cannot', async () => {
    await assertSucceeds(getDoc(doc(as('kamla'), 'settings', 'kamla')));
    await assertSucceeds(getDoc(doc(as('rahul'), 'settings', 'kamla')));
    await assertFails(getDoc(doc(as('priya'), 'settings', 'kamla')));
  });

  test('Senior can change privacy and trusted numbers', async () => {
    await assertSucceeds(
      updateDoc(doc(as('kamla'), 'settings', 'kamla'), {
        privacyLevel: 'full',
        trustedNumbers: [{ name: 'Rahul', phone: PHONES.rahul }],
      }),
    );
  });

  test('Senior cannot change their own payment limit (view only)', async () => {
    await assertFails(updateDoc(doc(as('kamla'), 'settings', 'kamla'), { paymentLimit: 100000 }));
  });

  test('linked Family can change the payment limit, but not privacy', async () => {
    await assertSucceeds(updateDoc(doc(as('rahul'), 'settings', 'kamla'), { paymentLimit: 10000 }));
    await assertFails(updateDoc(doc(as('rahul'), 'settings', 'kamla'), { privacyLevel: 'full' }));
  });

  test('unlinked Family cannot change the payment limit', async () => {
    await assertFails(updateDoc(doc(as('priya'), 'settings', 'kamla'), { paymentLimit: 0 }));
  });

  test('a privacy level outside basic/standard/full is refused', async () => {
    await assertFails(updateDoc(doc(as('kamla'), 'settings', 'kamla'), { privacyLevel: 'none' }));
  });

  test('a new Senior can create settings with default values only', async () => {
    const db = env.authenticatedContext('newSenior', { phone_number: '+919822222222' }).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'settings', 'newSenior'), {
        seniorId: 'newSenior',
        privacyLevel: 'standard',
        paymentLimit: 5000,
        trustedNumbers: [],
      }),
    );
    await assertFails(
      setDoc(doc(db, 'settings', 'newSenior'), {
        seniorId: 'newSenior',
        privacyLevel: 'standard',
        paymentLimit: 999999,
        trustedNumbers: [],
      }),
    );
  });
});

describe('server-only collections', () => {
  test('invite codes cannot be read or written by the app', async () => {
    await assertFails(getDoc(doc(as('priya'), 'invites', '123456')));
    await assertFails(getDoc(doc(as('kamla'), 'invites', '123456')));
    await assertFails(setDoc(doc(as('kamla'), 'invites', '999999'), { seniorId: 'kamla' }));
  });

  test('rate-limit counters cannot be touched by the app', async () => {
    await assertFails(
      setDoc(doc(as('priya'), 'rateLimits', 'priya_inviteCode'), { minuteCount: 0 }),
    );
  });
});
