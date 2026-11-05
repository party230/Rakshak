/**
 * App-wide constants. Change values here, not inside screens.
 */

/** Region where our Cloud Functions run (Mumbai, closest to users in India). */
export const FUNCTIONS_REGION = 'asia-south1';

/** A Senior can link at most this many Family members. */
export const MAX_FAMILY_PER_SENIOR = 5;

/** How long a Senior's invite code stays valid. */
export const INVITE_VALID_HOURS = 24;

/** Default payment limit in rupees, set when a Senior account is created. */
export const DEFAULT_PAYMENT_LIMIT = 5000;

/**
 * Demo accounts. These numbers are registered as Firebase "test phone numbers"
 * with the fixed code 123456, so no real SMS is sent.
 * Keep in sync with functions/scripts/seed.ts.
 */
export const DEMO_PHONE_NUMBERS = ['+919000000001', '+919000000002', '+919000000003'];

/** Seconds before the user may ask for another login code. */
export const OTP_RESEND_SECONDS = 30;
