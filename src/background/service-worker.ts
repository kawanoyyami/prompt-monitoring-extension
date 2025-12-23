import browser from 'webextension-polyfill';
import type { EmailIssue, MessageData } from '../types';
import { DISMISS_DURATION_MS, MESSAGE_TYPES } from '../constants';

browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.EMAIL_DETECTED) {
    handleEmailDetected(message, sendResponse);
    return true;
  }

  if (message.type === MESSAGE_TYPES.DISMISS_ISSUE) {
    handleDismissIssue(message, sendResponse);
    return true;
  }

  if (message.type === MESSAGE_TYPES.DISMISS_EMAIL) {
    handleDismissEmail(message, sendResponse);
    return true;
  }

  if (message.type === MESSAGE_TYPES.CLEAR_HISTORY) {
    handleClearHistory(sendResponse);
    return true;
  }

  return true;
});

async function handleEmailDetected(message: MessageData, sendResponse: (response: any) => void) {
  const emails = message.emails || [];
  const timestamp = message.timestamp || Date.now();

  const result = await browser.storage.local.get(['issues', 'dismissedEmails']);
  const existingIssues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
  const dismissedEmails: Record<string, number> = (result.dismissedEmails as Record<string, number>) || {};
  const now = Date.now();

  let hasActiveEmail = false;

  emails.forEach((email: string) => {
    const dismissedUntil = dismissedEmails[email];
    const isDismissed = dismissedUntil && dismissedUntil > now;

    const newIssue: EmailIssue = {
      // Generate unique ID, timestamp + random string, like "1234567890-k3j5h2m9p"
      // Good enough for local storage, no need for external UUID library
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      timestamp,
      dismissed: isDismissed || false,
      dismissedUntil: isDismissed ? dismissedUntil : undefined,
    };

    if (!isDismissed) {
      hasActiveEmail = true;
    }

    existingIssues.push(newIssue);
  });

  await browser.storage.local.set({ issues: existingIssues });

  if (hasActiveEmail) {
    try {
      await browser.action.openPopup();
    } catch (error) {
      // Popup can't be opened automatically in Firefox
      console.warn(error);
    }
  }

  sendResponse({ success: true });
}

async function handleDismissIssue(message: MessageData, sendResponse: (response: any) => void) {
  const issueId = message.issueId;

  const result = await browser.storage.local.get(['issues']);
  const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];

  const updatedIssues = issues.map((issue) => {
    if (issue.id === issueId) {
      return {
        ...issue,
        dismissed: true,
        dismissedUntil: Date.now() + DISMISS_DURATION_MS,
      };
    }
    return issue;
  });

  await browser.storage.local.set({ issues: updatedIssues });
  sendResponse({ success: true });
}

async function handleDismissEmail(message: MessageData, sendResponse: (response: any) => void) {
  const email = message.email;

  const result = await browser.storage.local.get(['issues', 'dismissedEmails']);
  const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
  const dismissedEmails: Record<string, number> = (result.dismissedEmails as Record<string, number>) || {};

  const dismissUntil = Date.now() + DISMISS_DURATION_MS;
  dismissedEmails[email!] = dismissUntil;

  const updatedIssues = issues.map((issue) => {
    if (issue.email === email) {
      return {
        ...issue,
        dismissed: true,
        dismissedUntil: dismissUntil,
      };
    }
    return issue;
  });

  await browser.storage.local.set({ issues: updatedIssues, dismissedEmails });
  sendResponse({ success: true });
}

async function handleClearHistory(sendResponse: (response: any) => void) {
  await browser.storage.local.set({ issues: [], dismissedEmails: {} });
  sendResponse({ success: true });
}

browser.storage.local.get(['issues', 'dismissedEmails']).then((result) => {
  const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
  const dismissedEmails: Record<string, number> = (result.dismissedEmails as Record<string, number>) || {};
  const now = Date.now();

  const cleanedIssues = issues.map((issue) => {
    if (issue.dismissed && issue.dismissedUntil && issue.dismissedUntil < now) {
      return {
        ...issue,
        dismissed: false,
        dismissedUntil: undefined,
      };
    }
    return issue;
  });

  const cleanedDismissedEmails: Record<string, number> = {};
  for (const email in dismissedEmails) {
    if (dismissedEmails[email] > now) {
      cleanedDismissedEmails[email] = dismissedEmails[email];
    }
  }

  const hasIssuesChanges = cleanedIssues.some(
    (issue, index) => issue.dismissed !== issues[index].dismissed
  );
  const hasDismissedEmailsChanges =
    Object.keys(cleanedDismissedEmails).length !== Object.keys(dismissedEmails).length ||
    Object.keys(cleanedDismissedEmails).some(
      (email) => cleanedDismissedEmails[email] !== dismissedEmails[email]
    );

  if (hasIssuesChanges || hasDismissedEmailsChanges) {
    browser.storage.local.set({ issues: cleanedIssues, dismissedEmails: cleanedDismissedEmails });
  }
});
