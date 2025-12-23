export const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const MESSAGE_TYPES = {
  EMAIL_DETECTED: 'EMAIL_DETECTED',
  DISMISS_ISSUE: 'DISMISS_ISSUE',
  DISMISS_EMAIL: 'DISMISS_EMAIL',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
} as const;

