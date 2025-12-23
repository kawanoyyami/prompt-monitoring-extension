import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import browser from 'webextension-polyfill';
import type { EmailIssue } from '../../types';
import { MESSAGE_TYPES } from '../../constants';

interface IssuesContextType {
  issues: EmailIssue[];
  loading: boolean;
  activeIssues: EmailIssue[];
  loadIssues: () => Promise<void>;
  dismissIssue: (issueId: string) => Promise<void>;
  dismissEmail: (email: string) => Promise<void>;
  clearHistory: () => Promise<void>;
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

  const loadIssues = async () => {
    try {
      const result = await browser.storage.local.get(['issues']);
      const loadedIssues = (result.issues as EmailIssue[]) || [];
      setIssues(loadedIssues);
      setLoading(false);
    } catch (error) {
      console.error('[Popup] Failed to load issues:', error);
      setLoading(false);
    }
  };

  const dismissIssue = async (issueId: string) => {
    try {
      await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.DISMISS_ISSUE,
        issueId,
      });
      await loadIssues();
    } catch (error) {
      console.error('[Popup] Failed to dismiss issue:', error);
    }
  };

  const dismissEmail = async (email: string) => {
    try {
      await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.DISMISS_EMAIL,
        email,
      });
      await loadIssues();
    } catch (error) {
      console.error('[Popup] Failed to dismiss email:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.CLEAR_HISTORY,
      });
      await loadIssues();
    } catch (error) {
      console.error('[Popup] Failed to clear history:', error);
    }
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
