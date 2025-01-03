import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import './css/header.css';

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" className="header-title" sx={{ flexGrow: 1 }}>
          Sistema de Gestão de Senhas - Interface Operador
        </Typography>
        
        {/* O botão de Logout só será visível se o usuário estiver autenticado */}
        {isAuthenticated && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onLogout} // Chama a função de logout
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
