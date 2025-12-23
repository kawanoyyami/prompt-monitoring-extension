import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import browser from 'webextension-polyfill';

interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed: boolean;
  dismissedUntil?: number;
}

interface IssuesContextType {
  issues: EmailIssue[];
  loading: boolean;
  activeIssues: EmailIssue[];
  loadIssues: () => void;
  dismissIssue: (issueId: string) => void;
  dismissEmail: (email: string) => void;
  clearHistory: () => void;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within IssuesProvider');
  }
  return context;
};

interface IssuesProviderProps {
  children: ReactNode;
}

export const IssuesProvider: React.FC<IssuesProviderProps> = ({ children }) => {
  const [issues, setIssues] = useState<EmailIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();

    const listener = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.issues) {
        console.log('[Context] Storage changed, updating issues');
        setIssues(changes.issues.newValue || []);
      }
    };

    browser.storage.onChanged.addListener(listener);

    return () => {
      browser.storage.onChanged.removeListener(listener);
    };
  }, []);

  const loadIssues = () => {
    console.log('[Context] Loading issues from storage');
    browser.storage.local.get(['issues']).then((result) => {
      const loadedIssues = (result.issues as EmailIssue[]) || [];
      console.log('[Context] Loaded issues:', loadedIssues.length);
      setIssues(loadedIssues);
      setLoading(false);
    });
  };

  const dismissIssue = (issueId: string) => {
    console.log('[Context] Dismissing issue:', issueId);
    browser.runtime.sendMessage({
      type: 'DISMISS_ISSUE',
      issueId: issueId,
    }).then((response) => {
      console.log('[Context] Dismiss response:', response);
      loadIssues();
    });
  };

  const dismissEmail = (email: string) => {
    console.log('[Context] Dismissing all instances of email:', email);
    browser.runtime.sendMessage({
      type: 'DISMISS_EMAIL',
      email: email,
    }).then((response) => {
      console.log('[Context] Dismiss email response:', response);
      loadIssues();
    });
  };

  const clearHistory = () => {
    console.log('[Context] Clearing all history');
    browser.runtime.sendMessage({
      type: 'CLEAR_HISTORY',
    }).then((response) => {
      console.log('[Context] Clear history response:', response);
      loadIssues();
    });
  };

  const activeIssues = issues.filter((issue) => !issue.dismissed);

  const value: IssuesContextType = {
    issues,
    loading,
    activeIssues,
    loadIssues,
    dismissIssue,
    dismissEmail,
    clearHistory,
  };

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
};

