import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para tratar o login
  const handleLogin = () => {
    // Aqui estamos simulando a autenticação para 3 perfis diferentes
    if (username === 'operador' && password === '1234') {
      // Salva a role do usuário na sessionStorage
      sessionStorage.setItem('role', 'operador');
      onLogin(); // Atualiza o estado de autenticação (caso necessário)
      navigate('./OperadorPainel.js'); // Redireciona para o painel do operador
    } else if (username === 'gestor' && password === '1234') {
      sessionStorage.setItem('role', 'gestor');
      onLogin(); // Atualiza o estado de autenticação
      navigate('/GestorPainel.js'); // Redireciona para o painel do gestor
    } else if (username === 'administrador' && password === '1234') {
      sessionStorage.setItem('role', 'administrador');
      onLogin(); // Atualiza o estado de autenticação
      navigate('/AdministradorPainel.js'); // Redireciona para o painel do administrador
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Utilizador"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2 }}
        fullWidth
      />
      <TextField
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 3 }}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Entrar
      </Button>
    </Box>
  );
};

export default Login;
