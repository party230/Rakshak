/**
 * Helpers for Indian mobile numbers.
 * We store numbers in the international format Firebase uses: +91XXXXXXXXXX.
 */

/** Turn what the user typed into +91XXXXXXXXXX, or null if it isn't a valid mobile number. */
export function toE164India(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  // Indian mobile numbers are 10 digits and start with 6, 7, 8 or 9.
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

/** +919876543210 -> "+91 98765 43210" (easier to read). */
export function formatPhone(e164: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}
