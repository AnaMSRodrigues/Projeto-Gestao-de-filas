import React, { useState } from 'react';
import { Button, Alert, Box, FormControl, InputLabel, Select, MenuItem, Typography, TextField } from '@mui/material';
import { adicionarSenha } from '../services/apiService';
import './css/AgendarSenha.css';

const AgendarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [idServico, setIdServico] = useState('');
  const [numeroReceita, setNumeroReceita] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [pinOpcao, setPinOpcao] = useState('');

  const criarSenha = async (tipo) => {
    try {
      if (!idServico) {
        setErro('Por favor, selecione um serviço antes de criar a senha.');
        setMensagem('');
        return;
      }

      if (!numeroReceita.match(/^\d{19}$/)) {
        setErro('O número de receita deve ter 19 dígitos.');
        setMensagem('');
        return;
      }

      if (!codigoAcesso.match(/^\d{6}$/)) {
        setErro('O código de acesso deve ter 6 dígitos.');
        setMensagem('');
        return;
      }

      if (!pinOpcao.match(/^\d{4}$/)) {
        setErro('O PIN de opção deve ter 4 dígitos.');
        setMensagem('');
        return;
      }

      const novaSenha = {
        tipo,
        estado: 'em espera',
        id_utente: Math.floor(Math.random() * 1000), 
        id_servico: idServico, 
        numero_receita: numeroReceita,
        codigo_acesso: codigoAcesso,
        pin_opcao: pinOpcao
      };

      const resposta = await adicionarSenha(novaSenha);
      setMensagem(`Senha criada com sucesso: ${resposta.senha.id_senha}`);
      setErro('');
      setNumeroReceita('');
      setCodigoAcesso('');
      setPinOpcao('');
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

      <Box className="caixa-receita">
        <Typography variant="h5" gutterBottom>
          Introduza os Códigos de Receita
        </Typography>

        <TextField 
          label="Número de Receita (19 dígitos)" 
          value={numeroReceita} 
          onChange={(e) => setNumeroReceita(e.target.value)} 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 19 }} 
        />

        <TextField 
          label="Código de Acesso (6 dígitos)" 
          value={codigoAcesso} 
          onChange={(e) => setCodigoAcesso(e.target.value)} 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 6 }} 
        />

        <TextField 
          label="PIN de Opção (4 dígitos)" 
          value={pinOpcao} 
          onChange={(e) => setPinOpcao(e.target.value)} 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 4 }} 
        />
      </Box>

      {mensagem && <Alert severity="success" className="alert">{mensagem}</Alert>}
      {erro && <Alert severity="error" className="alert">{erro}</Alert>}
    </Box>
  );
};

export default AgendarSenha;
