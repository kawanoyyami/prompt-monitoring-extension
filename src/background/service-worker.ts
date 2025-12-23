import browser from 'webextension-polyfill';

console.log('[Service Worker] Started');

interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed: boolean;
  dismissedUntil?: number;
}

interface MessageData {
  type: string;
  emails?: string[];
  timestamp?: number;
  issueId?: string;
  email?: string;
}

browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log('[Service Worker] Message received:', message);
  
  if (message.type === 'EMAIL_DETECTED') {
    const emails = message.emails || [];
    const timestamp = message.timestamp || Date.now();
    
    console.log('[Service Worker] Processing emails:', emails);
    
    browser.storage.local.get(['issues', 'dismissedEmails']).then((result) => {
      const existingIssues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
      const dismissedEmails: Record<string, number> = (result.dismissedEmails as Record<string, number>) || {};
      const now = Date.now();
      
      console.log('[Service Worker] Existing issues:', existingIssues.length);
      
      let hasActiveEmail = false;
      
      (emails || []).forEach((email: string) => {
        const dismissedUntil = dismissedEmails[email];
        const isDismissed = dismissedUntil && dismissedUntil > now;
        
        const newIssue: EmailIssue = {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          timestamp: timestamp,
          dismissed: isDismissed || false,
          dismissedUntil: isDismissed ? dismissedUntil : undefined
        };
        
        if (!isDismissed) {
          hasActiveEmail = true;
        }
        
        existingIssues.push(newIssue);
        console.log('[Service Worker] Added issue:', newIssue, isDismissed ? '(auto-dismissed)' : '');
      });
      
      browser.storage.local.set({ issues: existingIssues }).then(() => {
        console.log('[Service Worker] Issues saved to storage. Total:', existingIssues.length);
        
        if (hasActiveEmail) {
          try {
            browser.action.openPopup();
            console.log('[Service Worker] Popup opened');
          } catch (error) {
            console.log('[Service Worker] Could not auto-open popup:', error);
          }
        }
        
        if (sendResponse) {
          sendResponse({ success: true });
        }
      });
    });
    
    return true;
  }
  
  if (message.type === 'DISMISS_ISSUE') {
    const issueId = message.issueId;
    
    console.log('[Service Worker] Dismissing issue:', issueId);
    
    browser.storage.local.get(['issues']).then((result) => {
      const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
      
      const updatedIssues = issues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            dismissed: true,
            dismissedUntil: Date.now() + (24 * 60 * 60 * 1000)
          };
        }
        return issue;
      });
      
      browser.storage.local.set({ issues: updatedIssues }).then(() => {
        console.log('[Service Worker] Issue dismissed:', issueId);
        if (sendResponse) {
          sendResponse({ success: true });
        }
      });
    });
    
    return true;
  }

  if (message.type === 'DISMISS_EMAIL') {
    const email = message.email;
    
    console.log('[Service Worker] Dismissing all instances of email:', email);
    
    browser.storage.local.get(['issues', 'dismissedEmails']).then((result) => {
      const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
      const dismissedEmails: Record<string, number> = (result.dismissedEmails as Record<string, number>) || {};
      
      dismissedEmails[email] = Date.now() + (24 * 60 * 60 * 1000);
      
      const updatedIssues = issues.map(issue => {
        if (issue.email === email) {
          return {
            ...issue,
            dismissed: true,
            dismissedUntil: dismissedEmails[email]
          };
        }
        return issue;
      });
      
      browser.storage.local.set({ issues: updatedIssues, dismissedEmails }).then(() => {
        console.log('[Service Worker] All instances of email dismissed:', email);
        if (sendResponse) {
          sendResponse({ success: true });
        }
      });
    });
    
    return true;
  }
  
  if (message.type === 'CLEAR_HISTORY') {
    console.log('[Service Worker] Clearing all issues and dismissed emails');
    
    browser.storage.local.set({ issues: [], dismissedEmails: {} }).then(() => {
      console.log('[Service Worker] All issues and dismissals cleared');
      if (sendResponse) {
        sendResponse({ success: true });
      }
    });
    
    return true;
  }
  
  return true;
});

browser.storage.local.get(['issues']).then((result) => {
  const issues: EmailIssue[] = (result.issues as EmailIssue[]) || [];
  const now = Date.now();
  
  const cleanedIssues = issues.map(issue => {
    if (issue.dismissed && issue.dismissedUntil && issue.dismissedUntil < now) {
      return {
        ...issue,
        dismissed: false,
        dismissedUntil: undefined
      };
    }
    return issue;
  });
  
  const hasChanges = cleanedIssues.some((issue, index) => 
    issue.dismissed !== issues[index].dismissed
  );
  
  if (hasChanges) {
    browser.storage.local.set({ issues: cleanedIssues }).then(() => {
      console.log('[Service Worker] Cleaned up expired dismissals');
    });
  }
});

console.log('[Service Worker] Ready to receive messages');
