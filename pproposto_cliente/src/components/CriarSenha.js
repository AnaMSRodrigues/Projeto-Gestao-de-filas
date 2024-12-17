import React, { useState } from 'react';
import { Button, Alert, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { adicionarSenha } from '../services/apiService';
import './css/CriarSenha.css';

const CriarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [idServico, setIdServico] = useState('');

  const criarSenha = async (tipo) => {
    try {
      if (!idServico) {
        setErro('Por favor, selecione um serviço antes de criar a senha.');
        setMensagem('');
        return;
      }

      const novaSenha = {
        tipo,
        estado: 'em espera',
        id_utente: Math.floor(Math.random() * 1000), 
        id_servico: idServico, 
      };

      const resposta = await adicionarSenha(novaSenha);
      setMensagem(`Senha criada com sucesso: ${resposta.senha.id_senha}`);
      setErro('');
    } catch (error) {
      console.error('Erro ao criar a senha:', error.response || error.message);
      setErro('Erro ao criar a senha. Por favor, tente novamente.');
      setMensagem('');
    }
  };

  return (
    <Box className="criar-senha-container">
      <Box className="caixa-tipo-senha">
        <Typography variant="h5" gutterBottom>
          Escolha o Tipo de Senha
        </Typography>
        <Button
          variant="contained"
          onClick={() => criarSenha('geral')}
          className="botao-geral"
        >
          Senha Geral
        </Button>

        <Button
          variant="contained"
          onClick={() => criarSenha('prioritaria')}
          className="botao-prioritaria"
        >
          Senha Prioritária
        </Button>
      </Box>
      <Box className="caixa-servico">
        <Typography variant="h5" gutterBottom>
          Escolha o Serviço
        </Typography>
        <FormControl fullWidth className="form-control">
          <InputLabel id="servico-label">Selecione o Serviço</InputLabel>
          <Select
            labelId="servico-label"
            value={idServico}
            onChange={(e) => setIdServico(e.target.value)}
            className="select-servico"
          >
            <MenuItem value={1}>Aquisição de medicação</MenuItem>
            <MenuItem value={2}>Vacinação</MenuItem>
            <MenuItem value={3}>Atendimento agendado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {mensagem && <Alert severity="success" className="alert">{mensagem}</Alert>}
      {erro && <Alert severity="error" className="alert">{erro}</Alert>}
    </Box>
  );
};

export default CriarSenha;
