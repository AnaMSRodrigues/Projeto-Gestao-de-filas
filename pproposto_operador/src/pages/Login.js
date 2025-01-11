import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './css/login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

// Função que gere o login e roteamento consoante perfil
const handleLogin = () => {
  if (username === 'operador' && password === '1234') {
    sessionStorage.setItem('role', 'operador');
    sessionStorage.setItem('isAuthenticated', 'true');
    onLogin();
    console.log(sessionStorage.getItem('isAuthenticated'));
    navigate('/operador');
  } else if (username === 'gestor' && password === '1234') {
    sessionStorage.setItem('role', 'gestor');
    sessionStorage.setItem('isAuthenticated', 'true');
    onLogin();
    console.log(sessionStorage.getItem('isAuthenticated'));
    navigate('/gestor');
  } else {
    setError('Credenciais inválidas');
  }
};

  return (
    <Box className="login-container">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" className="login-alert">{error}</Alert>}
      <TextField
        label="Utilizador"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="login-input"
      />
      <TextField
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        className="login-button"
      >
        Entrar
      </Button>
    </Box>
  );
};

export default Login;
