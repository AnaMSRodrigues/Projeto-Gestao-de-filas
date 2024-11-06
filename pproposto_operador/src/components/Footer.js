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
        mt: 'auto', // "Empurra" o footer para o final da página
        width: '100%', // Garante que o footer ocupe a largura total
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Farmácia. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;
