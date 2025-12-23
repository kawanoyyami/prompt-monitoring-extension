console.log('[Service Worker] Started');

interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed: boolean;
  dismissedUntil?: number;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] Message received:', message);
  
  if (message.type === 'EMAIL_DETECTED') {
    const { emails, timestamp } = message;
    
    console.log('[Service Worker] Processing emails:', emails);
    
    chrome.storage.local.get(['issues'], (result) => {
      const existingIssues: EmailIssue[] = result.issues || [];
      
      console.log('[Service Worker] Existing issues:', existingIssues.length);
      
      emails.forEach((email: string) => {
        const newIssue: EmailIssue = {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          timestamp: timestamp,
          dismissed: false
        };
        
        existingIssues.push(newIssue);
        console.log('[Service Worker] Added issue:', newIssue);
      });
      
      chrome.storage.local.set({ issues: existingIssues }, () => {
        console.log('[Service Worker] Issues saved to storage. Total:', existingIssues.length);
        
        try {
          chrome.action.openPopup();
          console.log('[Service Worker] Popup opened');
        } catch (error) {
          console.log('[Service Worker] Could not auto-open popup:', error);
        }
        
        if (sendResponse) {
          sendResponse({ success: true });
        }
      });
    });
    
    return true;
  }
  
  if (message.type === 'DISMISS_ISSUE') {
    const { issueId } = message;
    
    console.log('[Service Worker] Dismissing issue:', issueId);
    
    chrome.storage.local.get(['issues'], (result) => {
      const issues: EmailIssue[] = result.issues || [];
      
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
      
      chrome.storage.local.set({ issues: updatedIssues }, () => {
        console.log('[Service Worker] Issue dismissed:', issueId);
        if (sendResponse) {
          sendResponse({ success: true });
        }
      });
    });
    
    return true;
  }
  
  if (message.type === 'CLEAR_HISTORY') {
    console.log('[Service Worker] Clearing all issues');
    
    chrome.storage.local.set({ issues: [] }, () => {
      console.log('[Service Worker] All issues cleared');
      if (sendResponse) {
        sendResponse({ success: true });
      }
    });
    
    return true;
  }
});

chrome.storage.local.get(['issues'], (result) => {
  const issues: EmailIssue[] = result.issues || [];
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
    chrome.storage.local.set({ issues: cleanedIssues }, () => {
      console.log('[Service Worker] Cleaned up expired dismissals');
    });
  }
});

console.log('[Service Worker] Ready to receive messages');
