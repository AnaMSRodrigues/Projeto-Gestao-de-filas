import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import TirarSenha from './components/TirarSenha';
import AgendarSenha from './components/AgendarSenha';

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header /> {/* Cabeçalho no topo da página */}

      <Container
        component="main"
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 5,
          mb: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="textPrimary">
          Bem-vindo ao Sistema de Gestão de Senhas da Farmácia
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TirarSenha />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AgendarSenha />
          </Grid>
        </Grid>
      </Container>

      <Footer /> {/* Rodapé fixo ao final */}
    </Box>
  );
}

export default App;
