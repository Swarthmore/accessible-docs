import React from 'react';
import { Lock } from '@mui/icons-material';
import { Typography, Box } from '@mui/material';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        className="p-6"
      >
        <Lock style={{ fontSize: 80, color: '#f44336', marginBottom: 16 }} />
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1">
          You do not have permission to access this page.
        </Typography>
      </Box>
    </div>
  );
};

export default Unauthorized;
