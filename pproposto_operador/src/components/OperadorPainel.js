import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, List, ListItem, ListItemText, Divider, Grid, Paper,} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './css/operadorPainel.css'; 

const OperadorPainel = () => {
  const [senhas, setSenhas] = useState([]);
  const [contadores, setContadores] = useState({
    atendidas: 0,
    emEspera: 0,
    pendentes: 0,
    total: 0,
  });
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const fetchSenhas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/senha');
      setSenhas(response.data);
      atualizarContadores(response.data);
    } catch (error) {
      console.error('Erro ao carregar senha:', error);
    }
  };

  const atualizarContadores = (senha) => {
    const atendidas = senha.filter((s) => s.estado === 'atendida').length;
    const emEspera = senha.filter((s) => s.estado === 'em espera').length;
    const pendentes = senha.filter((s) => s.estado === 'pendente').length;

    setContadores({
      atendidas,
      emEspera,
      pendentes,
      total: senha.length,
    });
  };

  const handleChamarProximaSenha = async () => {
    const proximaSenha = senhas.find((s) => s.estado === 'em espera' || s.estado === 'pendente');
    if (proximaSenha) {
      setMensagem(`Chamar a próxima senha: ${proximaSenha.id} - ${proximaSenha.tipo}`);
      handleAtender(proximaSenha.id);
    } else {
      setMensagem('Nenhuma senha em espera ou pendente.');
    }
  };

  const handleAtender = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/senha/${id}/atender`);
      setSenhas((prevSenhas) => prevSenhas.filter((s) => s.id !== id));
      setMensagem(`Senha ${id} marcada como atendida.`);
      fetchSenhas();
    } catch (error) {
      console.error('Erro ao atender senha:', error);
      setMensagem('Erro ao atender a senha.');
    }
  };

  const handlePendente = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/senha/${id}/pendente`);
      setMensagem(`Senha ${id} marcada como pendente.`);
      fetchSenhas();
    } catch (error) {
      console.error('Erro ao marcar senha como pendente:', error);
      setMensagem('Erro ao marcar a senha como pendente.');
    }
  };

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role !== 'operador') {
      navigate('/login');
    } else {
      fetchSenhas();
    }
  }, [navigate]);

  return (
    <Box className="painel-operador">
      <Typography variant="h4" gutterBottom color="primary">
        Painel do Operador
      </Typography>

      {mensagem && (
        <Typography variant="body1" color="secondary" className="mensagem">
          {mensagem}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleChamarProximaSenha}
        className="botao-chamar"
      >
        Chamar Próxima Senha
      </Button>

      <Grid container spacing={3} className="grid-container">
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className="contador-paper">
            <Typography variant="h6">Atendidas</Typography>
            <Typography variant="h4">{contadores.atendidas}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className="contador-paper">
            <Typography variant="h6">Em Espera</Typography>
            <Typography variant="h4">{contadores.emEspera}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className="contador-paper">
            <Typography variant="h6">Pendentes</Typography>
            <Typography variant="h4">{contadores.pendentes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className="contador-paper">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h4">{contadores.total}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <List className="lista-senhas">
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
                className="botao-atender"
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
