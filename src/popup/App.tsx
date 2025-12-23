import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  ThemeProvider,
  createTheme,
  CircularProgress,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Email as EmailIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useIssues } from './context/IssuesContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { issues, loading, activeIssues, dismissIssue, clearHistory } = useIssues();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDismiss = (issueId: string) => {
    dismissIssue(issueId);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: 400,
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: 400, minHeight: 500, bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <ShieldIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Prompt Monitor
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<EmailIcon />} label="Issues Found" />
            <Tab icon={<HistoryIcon />} label="History" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Alert severity={activeIssues.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
            {activeIssues.length > 0
              ? `${activeIssues.length} email(s) detected and anonymized`
              : 'Extension is monitoring your prompts'}
          </Alert>

          <Typography variant="h6" gutterBottom>
            Current Issues
          </Typography>

          {activeIssues.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No active issues. All detected emails have been dismissed.
            </Typography>
          ) : (
            <List>
              {activeIssues.map((issue) => (
                <Card key={issue.id} sx={{ mb: 1 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Detected Email
                        </Typography>
                        <Chip label={issue.email} color="warning" size="small" sx={{ mt: 1 }} />
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDismiss(issue.id)}
                      >
                        Dismiss
                      </Button>
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {formatTimestamp(issue.timestamp)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
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
                {issues.map((issue) => (
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
                        <Box display="flex" alignItems="center" gap={1}>
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
                <Button variant="outlined" color="error" onClick={handleClearHistory}>
                  Clear History
                </Button>
              </Box>
            </>
          )}
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
};

export default App;
