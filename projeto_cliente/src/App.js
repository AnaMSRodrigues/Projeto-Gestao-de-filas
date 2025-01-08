import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import AgendarSenha from './components/AgendarSenha';
import './App.css';

function App() {
  return (
    <Box className="app-container">
      <Header />

      <Container component="main" maxWidth="md" className="main-container">
        <Typography variant="h4" className="title" gutterBottom>
          Bem vindo! Por favor selecione uma senha
        </Typography>

        <Grid container spacing={4} className="grid-container">
          <Grid item xs={12} sm={6} className="grid-item">
            <AgendarSenha />
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default App;