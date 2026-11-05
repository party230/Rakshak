/**
 * Seed data for demos and testing.
 *
 * Run from the functions/ folder:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed
 *
 * What it does (safe to run again; it resets the demo accounts):
 *   1. Registers the demo phone numbers as Firebase "test phone numbers" with
 *      the fixed code 123456 (no real SMS is sent).
 *   2. Creates three accounts:
 *        Kamla Sharma  (Senior)  +91 90000 00001
 *        Rahul Sharma  (Family)  +91 90000 00002   linked to Kamla
 *        Priya Sharma  (Family)  +91 90000 00003   NOT linked (use her to test linking)
 *   3. Gives Kamla default settings (Standard privacy, ₹5,000 limit) and saves
 *      Rahul and Priya as her trusted numbers.
 */
import { readFileSync } from 'node:fs';

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { GoogleAuth } from 'google-auth-library';

const TEST_CODE = '123456';

const PEOPLE = [
  { uid: 'demo-senior-kamla', name: 'Kamla Sharma', phone: '+919000000001', role: 'senior' },
  { uid: 'demo-family-rahul', name: 'Rahul Sharma', phone: '+919000000002', role: 'family' },
  { uid: 'demo-family-priya', name: 'Priya Sharma', phone: '+919000000003', role: 'family' },
] as const;

// ---------- Set up the Admin SDK ----------

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error(
    '\nSet GOOGLE_APPLICATION_CREDENTIALS to your service account key file.\n' +
      'Example: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed\n',
  );
  process.exit(1);
}
const projectId: string = JSON.parse(readFileSync(keyPath, 'utf8')).project_id;
initializeApp({ credential: cert(keyPath), projectId });

const auth = getAuth();
const db = getFirestore();

// ---------- 1. Test phone numbers ----------

/**
 * Adds our demo numbers to Firebase Authentication's "Phone numbers for
 * testing" list, keeping any numbers already there. Uses the Identity Toolkit
 * admin API because the Admin SDK has no function for this.
 */
async function registerTestPhoneNumbers() {
  const client = await new GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  }).getClient();
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

  const current = await client.request<{
    signIn?: { phoneNumber?: { testPhoneNumbers?: Record<string, string> } };
  }>({ url });
  const existing = current.data.signIn?.phoneNumber?.testPhoneNumbers ?? {};

  const testPhoneNumbers = { ...existing };
  for (const p of PEOPLE) testPhoneNumbers[p.phone] = TEST_CODE;

  await client.request({
    url: `${url}?updateMask=signIn.phoneNumber.enabled,signIn.phoneNumber.testPhoneNumbers`,
    method: 'PATCH',
    data: { signIn: { phoneNumber: { enabled: true, testPhoneNumbers } } },
  });
}

// ---------- 2 & 3. Accounts, profiles, settings, links ----------

/** Find the account for this phone number, or create it with our fixed ID. */
async function ensureAuthUser(p: (typeof PEOPLE)[number]): Promise<string> {
  try {
    const existing = await auth.getUserByPhoneNumber(p.phone);
    return existing.uid;
  } catch {
    const created = await auth.createUser({
      uid: p.uid,
      phoneNumber: p.phone,
      displayName: p.name,
    });
    return created.uid;
  }
}

async function main() {
  console.log(`Seeding project: ${projectId}\n`);

  try {
    await registerTestPhoneNumbers();
    console.log('✓ Test phone numbers registered (code 123456)');
  } catch (e) {
    console.warn(
      '! Could not register test phone numbers automatically:',
      (e as Error).message,
      '\n  Add them by hand: Firebase console → Authentication → Sign-in method → Phone →',
      'Phone numbers for testing.',
    );
  }

  // Real account IDs, by demo ID (they differ if an account already existed).
  const uids: Record<string, string> = {};
  for (const p of PEOPLE) {
    const uid = await ensureAuthUser(p);
    uids[p.uid] = uid;
    await db.collection('users').doc(uid).set({
      id: uid,
      name: p.name,
      phone: p.phone,
      role: p.role,
      language: 'en',
      pushToken: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`✓ ${p.name} (${p.role}) ${p.phone}  uid=${uid}`);
  }

  const kamla = uids['demo-senior-kamla'];
  const rahul = uids['demo-family-rahul'];

  await db
    .collection('settings')
    .doc(kamla)
    .set({
      seniorId: kamla,
      privacyLevel: 'standard',
      paymentLimit: 5000,
      trustedNumbers: [
        { name: 'Rahul', phone: '+919000000002' },
        { name: 'Priya', phone: '+919000000003' },
      ],
    });
  console.log('✓ Kamla settings: Standard privacy, ₹5,000 limit, 2 trusted numbers');

  // Reset links: Kamla <-> Rahul linked, Priya not linked.
  const oldLinks = await db.collection('links').where('seniorId', '==', kamla).get();
  const batch = db.batch();
  oldLinks.docs.forEach((d) => batch.delete(d.ref));
  batch.set(db.collection('links').doc(`${kamla}_${rahul}`), {
    seniorId: kamla,
    familyId: rahul,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  console.log('✓ Linked Kamla ↔ Rahul (Priya is not linked)');

  console.log('\nDone. Log in with any demo number and the code 123456.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
