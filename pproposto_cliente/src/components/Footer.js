import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 4,
        textAlign: 'center',
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Farmácia. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;
