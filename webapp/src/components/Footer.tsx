import React from 'react';
import { Box, Typography } from '@mui/material';

const AppFooter = () => (
  <Box
    component="footer"
    tabIndex={0}
    sx={{
      textAlign: 'center',
      bottom: 0,
      width: '100%',
      p: 2, // padding inside the footer
      bgcolor: '#b43135', // background color of the footer
    }}
  >
    <Typography variant="body2" color="white">
      Swarthmore A11yGator Copyright &copy; {new Date().getFullYear()}
    </Typography>
  </Box>
);

export default AppFooter;
