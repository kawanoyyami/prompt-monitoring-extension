import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  const isActive = value === index;
  
  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${index}`}
      sx={{
        height: '100%',
        width: '100%',
        display: isActive ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      {...other}
    >
      {children}
    </Box>
  );
};

export default TabPanel;

