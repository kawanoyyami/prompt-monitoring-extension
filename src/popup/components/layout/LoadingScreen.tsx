import React from 'react';
import { Box, CircularProgress, ThemeProvider } from '@mui/material';
import { theme } from '../../theme';

const LoadingScreen: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: 400,
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    </ThemeProvider>
  );
};

export default LoadingScreen;

