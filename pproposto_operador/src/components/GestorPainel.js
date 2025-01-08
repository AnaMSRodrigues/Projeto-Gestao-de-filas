import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import Footer from './footer';
import Papa from 'papaparse'; // Biblioteca para importar ficheiros CSV
import './css/gestorPainel.css';
import { useNavigate } from 'react-router-dom';
import { solicitaMedicamento } from '../services/apiService';


const GestorPainel = ({ isAuthenticated, role }) => {
  const [horarios, setHorarios] = useState([]);
  const [novoHorario, setNovoHorario] = useState('');
  const [consumiveis, setConsumiveis] = useState([]);
  const [novoConsumivel, setNovoConsumivel] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [horariosCSV, setHorariosCSV] = useState([]); // Armazenar horários do CSV

  const navigate = useNavigate(); // Hook para navegar entre páginas

  // Função para redirecionar para o painel do operador
  //const handleNavigateToOperador = () => {
  // console.log('Navegando para /operador');
  //   navigate('/operador');
  // };

  // Função para adicionar manualmente um novo horário
  const handleAdicionarHorario = () => {
    if (novoHorario.trim()) {
      setHorarios([...horarios, novoHorario]);
      setNovoHorario('');
      setMensagem('Horário adicionado com sucesso!');
    } else {
      setErro('Por favor, insira um horário válido.');
    }
  };
  // Função para alterar horários
  const handleAlterarHorario = (index, novoValor) => {
    const horariosAtualizados = [...horarios];
    horariosAtualizados[index] = novoValor;
    setHorarios(horariosAtualizados);
    setMensagem('Horário alterado com sucesso!');
  };
  // Função para manipular a solicitação de consumível
  const handleSolicitarConsumivel = async () => {
    try {
      // Solicita os consumíveis através da função 'solicitaMedicamento'
      const dadosConsumiveis = await solicitaMedicamento();  // Chama a função do apiService que busca os consumíveis

      // Atualiza o estado com os dados recebidos
      setConsumiveis(dadosConsumiveis);
      setErro(null);  // Reseta qualquer erro anterior

    } catch (error) {
      console.error('Erro ao solicitar consumíveis:', error);
      setErro('Erro ao buscar os consumíveis');  // Define o erro caso a requisição falhe
    }
  };
  // Função para fazer upload de um ficheiro CSV
  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // Considera a primeira linha como cabeçalho
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data.map((row) => row.Horario); // Assume que há uma coluna "Horario"
        if (data.length > 0) {
          setHorariosCSV([...horariosCSV, ...data]);
          setMensagem(`Foram carregados ${data.length} horários do arquivo.`);
        } else {
          setErro('O arquivo não contém dados válidos.');
        }
      },
      error: (error) => {
        setErro(`Erro ao processar o arquivo: ${error.message}`);
      },
    });
  };

  return (
    <Box className="gestor-container">
      <Box className="gestor-content">
        <Typography variant="h4" gutterBottom color="primary">
          Painel do Gestor
        </Typography>

        {mensagem && (
          <Alert severity="info" className="gestor-alert">
            {mensagem}
          </Alert>
        )}
        {erro && (
          <Alert severity="error" className="gestor-alert">
            {erro}
          </Alert>
        )}

        <Paper elevation={3} className="gestor-section">
          <Typography variant="h5" gutterBottom>
            Gestão de Horários
          </Typography>
          <Box className="gestor-input-group">
            <TextField
              label="Novo Horário"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleAdicionarHorario}>
              Adicionar
            </Button>
          </Box>
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload CSV
            <input type="file" hidden accept=".csv" onChange={handleUploadCSV} />
          </Button>

          <Typography variant="h6" gutterBottom>
            Horário Carregado
          </Typography>
          <List>
            {horariosCSV.length === 0 ? (
              <Typography variant="body1">Sem horários carregados.</Typography>
            ) : (
              horariosCSV.map((horario, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={`Horário: ${horario}`} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>

        <Paper elevation={3} className="gestor-section">
          <Typography variant="h5" gutterBottom>
            Solicitação de Consumíveis
          </Typography>
          <Box className="gestor-input-group">
            <TextField
              label="Nome do Consumível"
              value={novoConsumivel}
              onChange={(e) => setNovoConsumivel(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSolicitarConsumivel}>
              Solicitar
            </Button>
          </Box>

          {erro && <Typography color="error">{erro}</Typography>}

          <Typography variant="h6" gutterBottom>
            Consumíveis Solicitados
          </Typography>
          <List>
            {consumiveis.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={`Consumível ${index + 1}`} secondary={item} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              console.log('Role atual:', role);
              console.log('isAuthenticated:', isAuthenticated);
              navigate('/operador2');
            }}
          >
            Aceder ao painel do Operador
          </Button>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default GestorPainel;
