/**
 * Design tokens taken from the approved mockups (design/mockups.html).
 * Every screen should use these instead of hard-coded values.
 */

export const colors = {
  // One main colour for the whole app.
  primary: '#1A4FA0',
  primarySoft: '#E8EFFA',

  // Status colours. Always pair them with an icon and words.
  safe: '#1B7F3B',
  safeBg: '#E7F5EC',
  warn: '#8A5A00',
  warnBg: '#FFF4CC',
  warnLine: '#F2B705',
  scam: '#C62828',
  scamBg: '#FDECEC',

  ink: '#111827', // main text
  muted: '#4B5563', // secondary text (still high contrast)
  line: '#D1D5DB', // card borders
  inputBorder: '#9CA3AF',
  divider: '#EEF0F3',
  background: '#FFFFFF',
  white: '#FFFFFF',
};

/** Font sizes. Body text is never below 18; headings are 26+. */
export const font = {
  small: 16, // only for hints under a button
  body: 18,
  large: 20,
  button: 20,
  title: 28,
  heading: 26,
  huge: 40,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  button: 14,
  card: 16,
  pill: 999,
};

/** Buttons are at least this tall (spec: 56px or more). */
export const BUTTON_HEIGHT = 60;
