export interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed: boolean;
  dismissedUntil?: number;
}

