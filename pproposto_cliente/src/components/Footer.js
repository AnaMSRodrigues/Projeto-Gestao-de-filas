import React from 'react';
import { Box, Typography } from '@mui/material';
import './css/Footer.css';

const Footer = () => {
  return (
    <Box component="footer" className="footer-container">
      <Typography variant="body2" className="footer-text">
        &copy; {new Date().getFullYear()} Farmácia. Todos os direitos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;
