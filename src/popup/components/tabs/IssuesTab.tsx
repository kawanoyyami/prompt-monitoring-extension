import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { EmailIssue } from '../../../types';

interface IssuesTabProps {
  issues: EmailIssue[];
  onDismiss: (issueId: string) => Promise<void>;
  onDismissEmail: (email: string) => Promise<void>;
  formatTimestamp: (timestamp: number) => string;
}

const IssuesTab: React.FC<IssuesTabProps> = ({ issues, onDismiss, onDismissEmail, formatTimestamp }) => {
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.email]) {
      acc[issue.email] = [];
    }
    acc[issue.email].push(issue);
    return acc;
  }, {} as Record<string, EmailIssue[]>);

  const emailAddresses = Object.keys(groupedIssues);
  const totalDetections = issues.length;

  const sortedEmailAddresses = emailAddresses.sort((a, b) => {
    const latestA = Math.max(...groupedIssues[a].map((i: EmailIssue) => i.timestamp));
    const latestB = Math.max(...groupedIssues[b].map((i: EmailIssue) => i.timestamp));
    return latestB - latestA;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Issues
      </Typography>

      {emailAddresses.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No active issues. All detected emails have been dismissed.
        </Typography>
      ) : (
        sortedEmailAddresses.map((email) => {
          const emailIssues = groupedIssues[email];
          const latestIssue = emailIssues[emailIssues.length - 1];
          
          return (
            <Card key={email} sx={{ mb: 2, bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      Detected Email
                    </Typography>
                    <Chip 
                      label={`${email} (${emailIssues.length}×)`} 
                      color="error" 
                      size="small" 
                      sx={{ mt: 1 }} 
                    />
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDismissEmail(email)}
                  >
                    Dismiss
                  </Button>
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Last: {formatTimestamp(latestIssue.timestamp)}
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default IssuesTab;

