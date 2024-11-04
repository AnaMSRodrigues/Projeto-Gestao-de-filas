import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import Login from './pages/Login';
import OperadorPainel from './components/OperadorPainel';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Header />
      <Container maxWidth="md" sx={{ mt: 5, flexGrow: 1 }}>
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
      <Footer />
    </Router>
  );
}

export default App;
