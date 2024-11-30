import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Login from './pages/login';
import OperadorPainel from './components/operadorPainel';
import GestorPainel from './components/gestorPainel';
import Header from './components/header';
import Footer from './components/footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  // Verifica autenticação e tipo de usuário ao carregar
  useEffect(() => {
    const auth = sessionStorage.getItem('isAuthenticated') === 'true';
    const userRole = sessionStorage.getItem('role');
    setIsAuthenticated(auth);
    setRole(userRole);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Router>
        <Header />
        <Container
          component="main"
          maxWidth="md"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 5,
          }}
        >
          <Routes>
            <Route 
              path="/" 
              element={<Login onLogin={() => {
                setIsAuthenticated(true);
                setRole(sessionStorage.getItem('role'));
              }} />} 
            />
            <Route
              path="/painel"
              element={
                isAuthenticated ? (
                  role === 'operador' ? (
                    <OperadorPainel />
                  ) : role === 'gestor' ? (
                    <GestorPainel />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
        <Footer />
      </Router>
    </Box>
  );
}

export default App;

