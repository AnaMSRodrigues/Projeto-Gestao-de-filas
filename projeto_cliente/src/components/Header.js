import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './css/Header.css'; 

const Header = () => {
  return (
    <AppBar position="static" className="header-container"> 
      <Toolbar>
        <Typography variant="h6" component="div" className="header-title"> 
          Sistema de Gestão de Senhas
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
