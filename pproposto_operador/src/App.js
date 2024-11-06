import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Login from './pages/Login';
import OperadorPainel from './components/OperadorPainel';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Altura mínima da viewport para manter o footer no final
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
              element={<Login onLogin={() => setIsAuthenticated(true)} />} 
            />
            <Route
              path="/painel"
              element={isAuthenticated ? <OperadorPainel /> : <Navigate to="/" />}
            />
          </Routes>
        </Container>
        <Footer /> {/* O Footer será fixado ao final da página */}
      </Router>
    </Box>
  );
}

export default App;
