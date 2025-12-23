import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Email as EmailIcon, History as HistoryIcon } from '@mui/icons-material';

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab icon={<EmailIcon />} label="Issues Found" iconPosition="start" />
        <Tab icon={<HistoryIcon />} label="History" iconPosition="start" />
      </Tabs>
    </Box>
  );
};

export default TabNavigation;

