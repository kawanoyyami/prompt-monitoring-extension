export interface MessageData {
  type: 'EMAIL_DETECTED' | 'DISMISS_ISSUE' | 'DISMISS_EMAIL' | 'CLEAR_HISTORY';
  emails?: string[];
  timestamp?: number;
  issueId?: string;
  email?: string;
}

