import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import { ConfirmDialog } from '../ui';
import type { EmailIssue } from '../../../types';

interface HistoryTabProps {
  issues: EmailIssue[];
  onClearHistory: () => void;
  formatTimestamp: (timestamp: number) => string;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ issues, onClearHistory, formatTimestamp }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClearClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    onClearHistory();
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const sortedIssues = [...issues].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Detection History
      </Typography>

      {issues.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No emails detected yet. Start using ChatGPT!
        </Typography>
      ) : (
        <>
          <List>
            {sortedIssues.map((issue) => (
              <ListItem
                key={issue.id}
                sx={{
                  bgcolor: issue.dismissed ? 'action.hover' : 'background.paper',
                  mb: 0.5,
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="body2">{issue.email}</Typography>
                      {issue.dismissed && <Chip label="Dismissed" size="small" color="default" />}
                    </Box>
                  }
                  secondary={formatTimestamp(issue.timestamp)}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="outlined" color="error" onClick={handleClearClick}>
              Clear History
            </Button>
          </Box>

          <ConfirmDialog
            open={confirmOpen}
            title="Clear History"
            message="Are you sure you want to clear all history? This action cannot be undone."
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            confirmText="Clear All"
            cancelText="Cancel"
            severity="error"
          />
        </>
      )}
    </Box>
  );
};

export default HistoryTab;

