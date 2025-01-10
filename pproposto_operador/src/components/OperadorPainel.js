import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Divider, Grid, Paper } from '@mui/material';
import './css/operadorPainel.css';
import { alteraPendente, chamarPrimeiraSenha, fetchSenhasPorEstado, finalizarSenha } from '../services/apiService';
import { Link } from 'react-router-dom';


const OperadorPainel = ({ isAuthenticated, role }) => {
  const [senhas, setSenhas] = useState({
    atendidas: [],
    emEspera: [],
    pendentes: [],
    emAtendimento: [],
    canceladas: [],
    pausadas: [],
  });

  const [contadores, setContadores] = useState({
    atendidas: 0,
    emEspera: 0,
    pendentes: 0,
    emAtendimento: 0,
    canceladas: 0,
    pausadas: 0,
    total: 0,
  });

  const [mensagem, setMensagem] = useState('');
  const [senhaAtual, setSenhaAtual] = useState(null);

  const fetchAllSenhas = async () => {
    const estados = ['atendida', 'em espera', 'pendente', 'em atendimento', 'cancelada', 'pausada'];
    const novasSenhas = {};

    for (const estado of estados) {
      const senhasPorEstado = await fetchSenhasPorEstado(estado);
      console.log(`Senhas para o estado ${estado}:`, senhasPorEstado);
      novasSenhas[estado] = senhasPorEstado;
    }
    setSenhas(novasSenhas); // Atualiza o estado com as senhas filtradas
    console.log('Senhas atualizadas:', novasSenhas);
    atualizarContadores(novasSenhas); // Atualiza os contadores 
  };

  const atualizarContadores = (novasSenhas) => {
    const atendidas = novasSenhas['atendida'] ? novasSenhas['atendida'].length : 0;
    const emEspera = novasSenhas['em espera'] ? novasSenhas['em espera'].length : 0;
    const pendentes = novasSenhas['pendente'] ? novasSenhas['pendente'].length : 0;
    const emAtendimento = novasSenhas['em atendimento'] ? novasSenhas['em atendimento'].length : 0;
    const canceladas = novasSenhas['cancelada'] ? novasSenhas['cancelada'].length : 0;
    const pausadas = novasSenhas['pausada'] ? novasSenhas['pausada'].length : 0;

    setContadores({
      atendidas,
      emEspera,
      pendentes,
      emAtendimento,
      canceladas,
      pausadas,
      total: atendidas + emEspera + pendentes + emAtendimento + canceladas + pausadas,
    });
  };

  const getClassForEstado = (estado) => {
    switch (estado) {
      case 'atendida':
        return 'MuiListItem-root atendida';
      case 'em-espera':
        return 'MuiListItem-root em-espera';
      case 'pendente':
        return 'MuiListItem-root pendente';
      case 'em-atendimento':
        return 'MuiListItem-root em-atendimento';
      case 'cancelada':
        return 'MuiListItem-root cancelada';
      case 'pausada':
        return 'MuiListItem-root pausada';
      default:
        return '';
    }
  }

  // Apenas carrega as senhas uma vez ao iniciar o componente
  useEffect(() => {
    fetchAllSenhas();
  }, []);

  const handlePendente = async (id) => {
    try {
      const response = await alteraPendente(id);
      console.log(response);

      if (response && response.senha) {
        setMensagem(`Senha ${id} marcada como "Não Compareceu".`);
        setSenhaAtual(null); // Limpa a senha atual do estado
        await fetchAllSenhas(); // Atualiza a lista de senhas
      } else {
        setMensagem(`Erro ao marcar a senha ${id} como "Não Compareceu".`);
      }
    } catch (error) {
      console.error('Erro ao alterar para pendente:', error);
      setMensagem('Erro ao marcar a senha como "Não Compareceu".');
    }
  };

  const handleChamarPrimeiraSenha = async () => {
    try {
      const response = await chamarPrimeiraSenha();
      console.log('Resposta recebida:', response);  // Adicione este log para inspecionar a resposta

      if (response && response.chamada) {
        setSenhaAtual({
          id: response.senha.id_senha,
          tipo: response.senha.tipo,
          atendimento: response.chamada.atendimento,
          horaInicio: response.chamada.hora_ini, // Hora exata do backend
        });
        setMensagem('');
      } else {
        setMensagem('Nenhuma senha disponível para chamada.');
      }
    } catch (error) {
      console.error('Erro ao chamar a primeira senha:', error);
      setMensagem('Erro ao chamar a senha.');
    }
  };

  const handleFinalizarSenha = async (id) => {
    try {
      const response = await finalizarSenha(id); // Chama o endpoint para finalizar a senha
      if (response && response.senha && response.chamada) {
        // Atualiza os dados da senha e da chamada com os novos valores
        setSenhaAtual({
          id: response.senha.id_senha,
          tipo: response.senha.tipo,
          atendimento: response.chamada.atendimento,
          horaInicio: response.chamada.hora_ini, // Hora de início da chamada
          horaFim: response.chamada.hora_fim,   // Hora de fim da chamada
        });
        setMensagem('Senha finalizada com sucesso.');
      } else {
        setMensagem('Erro ao finalizar a senha ou chamada não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao finalizar a senha:', error);
      setMensagem('Erro ao finalizar a senha.');
    }
  };

  // if (!isAuthenticated || role !== 'operador') {
  //   return (
  //     <Box className="access-denied">
  //       <Typography variant="h6" color="error">
  //         Acesso negado. Você não tem permissão para acessar este painel.
  //       </Typography>
  //     </Box>
  //   );
  // }

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
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('atendida')}`}>
            <Typography variant="h6">Atendidas</Typography>
            <Typography variant="h4">{contadores.atendidas}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('em-espera')}`}>
            <Typography variant="h6">Em Espera</Typography>
            <Typography variant="h4">{contadores.emEspera}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('pendente')}`}>
            <Typography variant="h6">Pendentes</Typography>
            <Typography variant="h4">{contadores.pendentes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('em-atendimento')}`}>
            <Typography variant="h6">Em Atendimento</Typography>
            <Typography variant="h4">{contadores.emAtendimento}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('cancelada')}`}>
            <Typography variant="h6">Canceladas</Typography>
            <Typography variant="h4">{contadores.canceladas}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={3} className={`contador-paper ${getClassForEstado('pausada')}`}>
            <Typography variant="h6">Pausadas</Typography>
            <Typography variant="h4">{contadores.pausadas}</Typography>
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
        onClick={handleChamarPrimeiraSenha}
        style={{ marginTop: 16 }}
      >
        Chamar próxima senha
      </Button>
      {senhaAtual && (
        <Box mt={3} p={2} border={1} borderColor="grey.300" borderRadius={4}>
          <Typography variant="h6">Atendimento Atual</Typography>
          <Typography variant="body1">
            <strong>Nº Senha:</strong> {senhaAtual.id}
          </Typography>
          <Typography variant="body1">
            <strong>Tipo de Senha:</strong> {senhaAtual.tipo.toUpperCase()}
          </Typography>
          <Typography variant="body1">
            <strong>Nº de atendimento:</strong> {senhaAtual.atendimento}
          </Typography>
          <Typography variant="body1">
            <strong>Hora de Início:</strong> {new Date(senhaAtual.horaInicio).toLocaleString()}
          </Typography>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleFinalizarSenha(senhaAtual.id)}
              style={{ marginRight: 8 }}
            >
              Terminar Atendimento
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handlePendente(senhaAtual.id)}
            >
              Não Compareceu
            </Button>
          </Box>
        </Box>
      )}

      <List className="lista-senhas">
        {senhas?.atendidas?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>Atendidas</Typography>
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
            <Typography variant="h6" gutterBottom>Em Espera</Typography>
            {senhas.emEspera.map((senha) => (
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

        {senhas?.pendentes?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>Pendentes</Typography>
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
      {isAuthenticated && role === 'gestor' && (
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/gestor"
          sx={{ mt: 2 }}
        >
          Voltar ao Painel do Gestor
        </Button>
      )}
    </Box>
  );
};

export default OperadorPainel;