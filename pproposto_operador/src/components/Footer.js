import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        mt: 'auto',
        width: '100%',
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Farmácia X. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;
