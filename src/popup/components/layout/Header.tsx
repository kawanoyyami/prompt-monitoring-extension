import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Shield as ShieldIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <ShieldIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Prompt Monitor
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

