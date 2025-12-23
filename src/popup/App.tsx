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
  IconButton,
  Alert,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Email as EmailIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock data pentru demo
  const mockIssues = [
    { id: 1, email: 'user@example.com', timestamp: new Date().toLocaleString() },
    { id: 2, email: 'test@domain.com', timestamp: new Date().toLocaleString() },
  ];

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
          <Alert severity="success" sx={{ mb: 2 }}>
            Extension is monitoring your prompts
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Current Issues
          </Typography>
          
          <List>
            {mockIssues.map((issue) => (
              <Card key={issue.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Detected Email
                      </Typography>
                      <Chip
                        label={issue.email}
                        color="warning"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                    >
                      Dismiss
                    </Button>
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {issue.timestamp}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Detection History
          </Typography>
          
          <List>
            {mockIssues.map((issue) => (
              <ListItem
                key={issue.id}
                secondaryAction={
                  <IconButton edge="end">
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={issue.email}
                  secondary={issue.timestamp}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="outlined" color="error">
              Clear History
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
};

export default App;
