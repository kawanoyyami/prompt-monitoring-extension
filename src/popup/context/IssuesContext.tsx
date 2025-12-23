import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import browser from 'webextension-polyfill';
import type { EmailIssue } from '../../types';
import { MESSAGE_TYPES } from '../../constants';

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
        setIssues(changes.issues.newValue || []);
      }
    };

    browser.storage.onChanged.addListener(listener);

    return () => {
      browser.storage.onChanged.removeListener(listener);
    };
  }, []);

  const loadIssues = () => {
    browser.storage.local.get(['issues']).then((result) => {
      const loadedIssues = (result.issues as EmailIssue[]) || [];
      setIssues(loadedIssues);
      setLoading(false);
    });
  };

  const dismissIssue = (issueId: string) => {
    browser.runtime.sendMessage({
      type: MESSAGE_TYPES.DISMISS_ISSUE,
      issueId,
    }).then(() => loadIssues());
  };

  const dismissEmail = (email: string) => {
    browser.runtime.sendMessage({
      type: MESSAGE_TYPES.DISMISS_EMAIL,
      email,
    }).then(() => loadIssues());
  };

  const clearHistory = () => {
    browser.runtime.sendMessage({
      type: MESSAGE_TYPES.CLEAR_HISTORY,
    }).then(() => loadIssues());
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
