import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, List, ListItem, ListItemText, Divider, Grid, Paper } from '@mui/material';
import './css/operadorPainel.css';
import API_URL from '../config/apiConfig';
import {chamarPrimeiraSenha} from '../services/apiService';

const OperadorPainel = () => {
  const [senhas, setSenhas] = useState({
    atendidas: [],
    emEspera: [],
    pendentes: [],
  });

  const [contadores, setContadores] = useState({
    atendidas: 0,
    emEspera: 0,
    pendentes: 0,
    total: 0,
  });

  const [mensagem, setMensagem] = useState('');
  

  const fetchSenhasPorEstado = async (estado) => {
    try {
      // Aqui fazemos a requisição para o backend, usando o estado para a consulta filtrada
      const response = await axios.get(`${API_URL}/senhaOP/${estado}`);
      return response.data; // Retorna os dados recebidos do backend
    } catch (error) {
      console.error(`Erro ao carregar senhas com estado "${estado}":`, error);
      setMensagem(`Erro ao carregar senhas com estado "${estado}".`);
      return []; // Retorna um array vazio em caso de erro
    }
  };
  
  const fetchAllSenhas = async () => {
    const estados = ['atendida', 'em espera', 'pendente'];
    const novasSenhas = {};
    
    for (const estado of estados) {
      const senhasPorEstado = await fetchSenhasPorEstado(estado); // Requisição filtrada por estado
      novasSenhas[estado] = senhasPorEstado;
    }
    console.log('Senhas:', novasSenhas);
    setSenhas(novasSenhas); // Atualiza o estado com as senhas filtradas
    atualizarContadores(novasSenhas); // Atualiza os contadores com os dados
  };
  

  const atualizarContadores = (novasSenhas) => {
    const atendidas = novasSenhas['atendida'] ? novasSenhas['atendida'].length : 0;
    const emEspera = novasSenhas['em espera'] ? novasSenhas['em espera'].length : 0;
    const pendentes = novasSenhas['pendente'] ? novasSenhas['pendente'].length : 0;

    setContadores({
      atendidas,
      emEspera,
      pendentes,
      total: atendidas + emEspera + pendentes,
    });
  };

  useEffect(() => {
    fetchAllSenhas();
  }, []); // Apenas carrega as senhas uma vez ao iniciar o componente

  const handlePendente = (id) => {
    console.log(`Marcando a senha ${id} como "Não Compareceu"`);
    // Aqui você pode adicionar lógica para atualizar o estado da senha no backend
  };

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

      <Button variant="contained" color="primary" onClick={fetchAllSenhas}>
        Atualizar Senhas
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
      <Button
        variant="contained"
        color="secondary"
        onClick={chamarPrimeiraSenha}
        style={{ marginTop: 16 }}
      >
        Chamar Primeira Senha
      </Button>

      <List className="lista-senhas">
        {senhas?.atendidas?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Atendidas
            </Typography>
            {senhas.atendidas.map((senha) => (
              <React.Fragment key={senha.id}>
                <ListItem>
                  <ListItemText
                    primary={`Senha ${senha.id} - ${senha.tipo.toUpperCase()}`}
                    secondary={`Estado: ${senha.estado}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </>
        )}

        {senhas?.emEspera?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Em Espera
            </Typography>
            {senhas.emEspera.map((senha) => (
              <React.Fragment key={senha.id}>
                <ListItem>
                  <ListItemText
                    primary={`Senha ${senha.id} - ${senha.tipo.toUpperCase()}`}
                    secondary={`Estado: ${senha.estado}`}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handlePendente(senha.id)}
                  >
                    Não Compareceu
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </>
        )}

        {senhas?.pendentes?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Pendentes
            </Typography>
            {senhas.pendentes.map((senha) => (
              <React.Fragment key={senha.id}>
                <ListItem>
                  <ListItemText
                    primary={`Senha ${senha.id} - ${senha.tipo.toUpperCase()}`}
                    secondary={`Estado: ${senha.estado}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </>
        )}

        {senhas?.atendidas?.length === 0 && senhas?.emEspera?.length === 0 && senhas?.pendentes?.length === 0 && (
          <Typography variant="body1">Nenhuma senha disponível</Typography>
        )}
      </List>
    </Box>
  );
};

export default OperadorPainel;