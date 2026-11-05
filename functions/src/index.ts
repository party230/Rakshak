/**
 * Rakshak Cloud Functions. Every function the app can call is exported here.
 *
 * Phase 1: linking Seniors and Family (links.ts).
 * Later phases add: Claude scam checks, alerts + push, payments, assistant.
 *
 * Deploy with:  npm run deploy   (from the functions/ folder)
 */
import { setGlobalOptions } from 'firebase-functions/v2';

// Mumbai region (close to users in India). maxInstances caps cost if
// something goes wrong.
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

export { getInvite, linkWithCode, previewInvite } from './links';
