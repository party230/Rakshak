/**
 * End-to-end checks for the invite / linking Cloud Functions
 * (functions/src/links.ts), run against the local emulators.
 *
 * Run (from this folder):  npm run test:functions
 *
 * Calls the real functions over HTTP, the same way the app does, using
 * unsigned sign-in tokens (the emulator accepts these; real Firebase never does).
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
initializeApp({ projectId: 'demo-rakshak' });
const db = getFirestore();
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const token = (uid) =>
  b64({ alg: 'none', typ: 'JWT' }) +
  '.' +
  b64({
    iss: 'https://securetoken.google.com/demo-rakshak',
    aud: 'demo-rakshak',
    sub: uid,
    user_id: uid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    auth_time: Math.floor(Date.now() / 1000),
    firebase: { sign_in_provider: 'phone', identities: {} },
  }) +
  '.';
async function call(name, uid, data) {
  const r = await fetch(`http://127.0.0.1:5001/demo-rakshak/asia-south1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token(uid)}` },
    body: JSON.stringify({ data: data ?? null }),
  });
  return r.json();
}
const check = (label, ok, got) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '  got: ' + JSON.stringify(got)}`);
  if (!ok) process.exitCode = 1;
};
(async () => {
  const mk = (id, role) =>
    db.doc(`users/${id}`).set({
      id,
      name: id,
      phone: '+91900000000' + id.length,
      role,
      language: 'en',
      pushToken: null,
    });
  await mk('kamla', 'senior');
  for (const f of ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']) await mk(f, 'family');
  let r = await call('getInvite', 'f1');
  check('family cannot get an invite', r.error?.details?.reason === 'not_senior', r);
  r = await call('getInvite', 'kamla');
  const code = r.result?.code;
  check('senior gets 6-digit code', /^\d{6}$/.test(code), r);
  r = await call('getInvite', 'kamla');
  check('same code reused', r.result?.code === code, r);
  r = await call('previewInvite', 'f1', { code });
  check('preview shows senior name', r.result?.name === 'kamla', r);
  r = await call('previewInvite', 'f1', { code: '000000' === code ? '111111' : '000000' });
  check('wrong code -> invalid', r.error?.details?.reason === 'invalid', r);
  r = await call('linkWithCode', 'kamla', { code });
  check('senior cannot link as family', r.error?.details?.reason === 'not_family', r);
  for (const f of ['f1', 'f2', 'f3', 'f4', 'f5']) {
    r = await call('linkWithCode', f, { code });
    check(`${f} links`, r.result?.seniorName === 'kamla', r);
  }
  r = await call('linkWithCode', 'f1', { code });
  check('linking twice is harmless', r.result?.seniorName === 'kamla', r);
  r = await call('linkWithCode', 'f6', { code });
  check('6th family member refused', r.error?.details?.reason === 'senior_full', r);
  const links = await db.collection('links').where('seniorId', '==', 'kamla').get();
  check('exactly 5 links', links.size === 5, links.size);
  await db.doc(`invites/${code}`).update({ expiresAt: Timestamp.fromMillis(Date.now() - 1000) });
  r = await call('previewInvite', 'f6', { code });
  check('expired code -> expired', r.error?.details?.reason === 'expired', r);
  r = await call('getInvite', 'kamla');
  check('new code after expiry', r.result?.code && r.result.code !== code, r);
  let limited = false;
  for (let i = 0; i < 12; i++) {
    r = await call('previewInvite', 'f6', { code: '999999' });
    if (r.error?.details?.reason === 'rate_limited') {
      limited = true;
      break;
    }
  }
  check('code guessing gets rate-limited', limited, r);
})();
