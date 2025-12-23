import React, { useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import { useIssues } from './context/IssuesContext';
import { theme } from './theme';
import { formatTimestamp } from '../utils/formatters';
import {
  Header,
  LoadingScreen,
  TabNavigation,
  IssuesTab,
  HistoryTab,
} from './components';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { issues, loading, activeIssues, dismissIssue, dismissEmail, clearHistory } = useIssues();

  const handleDismiss = async (issueId: string) => {
    await dismissIssue(issueId);
  };

  const handleDismissEmail = async (email: string) => {
    await dismissEmail(email);
  };

  const handleClearHistory = async () => {
    await clearHistory();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: 400, maxHeight: 600, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <TabNavigation activeTab={activeTab} onTabChange={(e, val) => setActiveTab(val)} />

        <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
          {activeTab === 0 && (
            <IssuesTab
              issues={activeIssues}
              onDismiss={handleDismiss}
              onDismissEmail={handleDismissEmail}
              formatTimestamp={formatTimestamp}
            />
          )}
          {activeTab === 1 && (
            <HistoryTab
              issues={issues}
              onClearHistory={handleClearHistory}
              formatTimestamp={formatTimestamp}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
