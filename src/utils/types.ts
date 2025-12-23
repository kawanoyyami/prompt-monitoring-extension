export interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed?: boolean;
  dismissedUntil?: number;
}

export interface StorageData {
  issues: EmailIssue[];
}

export type TabType = 'issues' | 'history';

