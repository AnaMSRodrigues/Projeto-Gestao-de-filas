import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Login from './pages/login';
import OperadorPainel from './components/operadorPainel';
import GestorPainel from './components/gestorPainel';
import Header from './components/header';
import Footer from './components/footer';
import './App.css'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  const handleRedirect = () => {
  <Navigate to="/painel/operador" />
}

  // Função de logout
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
  };

  // Verifica autenticação e tipo de utilizador ao carregar
  useEffect(() => {
    const auth = sessionStorage.getItem('isAuthenticated') === 'true';
    const userRole = sessionStorage.getItem('role');
    setIsAuthenticated(auth);
    setRole(userRole);
  }, []);

  return (
    <Box className="app-container">
      <Router>
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Container component="main" maxWidth="md" className="main-container">
          <Routes>
            {/* Rota Inicial */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  role === 'operador' ? (
                    <Navigate to="/painel/operador" />
                  ) : role === 'gestor' ? (
                    <Navigate to="/painel/gestor" />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Login onLogin={() => {
                    setIsAuthenticated(true);
                    setRole(sessionStorage.getItem('role'));
                  }} />
                )
              }
            />

            {/* Painel do Operador */}
            {isAuthenticated && role === 'operador' && (
              <Route path="/painel/operador" element={<OperadorPainel />} />
            )}

            {/* Painel do Gestor */}
            {isAuthenticated && role === 'gestor' && (
              <Route path="/painel/gestor" element={<GestorPainel />} />
            )}

            {/* Rota Curinga */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
        <Footer />
      </Router>
    </Box>
  );
}

export default App;
