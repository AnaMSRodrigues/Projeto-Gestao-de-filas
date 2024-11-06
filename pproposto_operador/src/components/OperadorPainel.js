import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, List, ListItem, ListItemText, Divider, Grid, Paper } from '@mui/material';

const OperadorPainel = () => {
  const [senhas, setSenhas] = useState([]);
  const [contadores, setContadores] = useState({
    atendidas: 0,
    emEspera: 0,
    pendentes: 0,
    total: 0,
  });
  const [mensagem, setMensagem] = useState('');

  // Função para carregar as senhas em espera e pendentes
  const fetchSenhas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/senhas');
      setSenhas(response.data);
      atualizarContadores(response.data);
    } catch (error) {
      console.error('Erro ao carregar senhas:', error);
    }
  };

  // Função para atualizar contadores de acordo com o estado das senhas
  const atualizarContadores = (senhas) => {
    const atendidas = senhas.filter((s) => s.estado === 'atendida').length;
    const emEspera = senhas.filter((s) => s.estado === 'em espera').length;
    const pendentes = senhas.filter((s) => s.estado === 'pendente').length;

    setContadores({
      atendidas,
      emEspera,
      pendentes,
      total: senhas.length,
    });
  };

  useEffect(() => {
    fetchSenhas();
  }, []);

  // Função para chamar a próxima senha
  const handleChamarProximaSenha = async () => {
    const proximaSenha = senhas.find((s) => s.estado === 'em espera' || s.estado === 'pendente');
    if (proximaSenha) {
      setMensagem(`Chamar a próxima senha: ${proximaSenha.id} - ${proximaSenha.tipo}`);
      handleAtender(proximaSenha.id);
    } else {
      setMensagem('Nenhuma senha em espera ou pendente.');
    }
  };

  // Função para marcar uma senha como atendida
  const handleAtender = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/senhas/${id}/atender`);
      setSenhas((prevSenhas) => prevSenhas.filter((s) => s.id !== id));
      setMensagem(`Senha ${id} marcada como atendida.`);
      fetchSenhas();
    } catch (error) {
      console.error('Erro ao atender senha:', error);
      setMensagem('Erro ao atender a senha.');
    }
  };

  // Função para marcar uma senha como pendente
  const handlePendente = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/senhas/${id}/pendente`);
      setMensagem(`Senha ${id} marcada como pendente.`);
      fetchSenhas();
    } catch (error) {
      console.error('Erro ao marcar senha como pendente:', error);
      setMensagem('Erro ao marcar a senha como pendente.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Painel do Operador
      </Typography>

      {mensagem && (
        <Typography variant="body1" color="secondary" sx={{ mb: 2 }}>
          {mensagem}
        </Typography>
      )}

      {/* Botão para chamar a próxima senha */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleChamarProximaSenha}
        sx={{ mb: 3 }}
      >
        Chamar Próxima Senha
      </Button>

      {/* Contadores de senhas por estado */}
    <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item xs={6} sm={3}>
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', minWidth: 120, minHeight: 100 }}>
      <Typography variant="h6">Atendidas</Typography>
      <Typography variant="h4">{contadores.atendidas}</Typography>
    </Paper>
    </Grid>
    <Grid item xs={6} sm={3}>
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', minWidth: 120, minHeight: 100 }}>
      <Typography variant="h6">Em Espera</Typography>
      <Typography variant="h4">{contadores.emEspera}</Typography>
    </Paper>
    </Grid>
    <Grid item xs={6} sm={3}>
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', minWidth: 120, minHeight: 100 }}>
      <Typography variant="h6">Pendentes</Typography>
      <Typography variant="h4">{contadores.pendentes}</Typography>
    </Paper>
    </Grid>
    <Grid item xs={6} sm={3}>
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', minWidth: 120, minHeight: 100 }}>
      <Typography variant="h6">Total</Typography>
      <Typography variant="h4">{contadores.total}</Typography>
     </Paper>
     </Grid>
  </Grid>

    {/* Lista de senhas */}
      <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
        {senhas.map((senha) => (
          <React.Fragment key={senha.id}>
            <ListItem>
              <ListItemText
                primary={`Senha ${senha.id} - ${senha.tipo.toUpperCase()}`}
                secondary={`Estado: ${senha.estado}`}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAtender(senha.id)}
                sx={{ mr: 2 }}
              >
                Atender
              </Button>
              {senha.estado === 'em espera' && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handlePendente(senha.id)}
                >
                  Não Compareceu
                </Button>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default OperadorPainel;
