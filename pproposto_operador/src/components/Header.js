import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './css/header.css'; 

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" className="header-title">
          Sistema de Gestão de Senhas - Interface Operador
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

