import React, { useState } from 'react';
import { Button, Alert, Box, FormControl, InputLabel, Select, MenuItem, Typography, TextField } from '@mui/material';
import { adicionarSenha, atualizarEstadoSenhaAuto } from '../services/apiService';
import './css/CriarSenha.css';

const CriarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [idServico, setIdServico] = useState('');
  const [codigo, setCodigo] = useState('');

  const criarSenha = async (tipo) => {
    try {
      if (!idServico) {
        setErro('Por favor, selecione um serviço antes de criar a senha.');
        setMensagem('');
        return;
      }

      if (idServico === 3 && !codigo.trim()) {
        setErro('Por favor, insira o código de agendamento para o serviço selecionado.');
        setMensagem('');
        return;
      }

      const novaSenha = {
        tipo: idServico === 3 ? 'agendado' : tipo, // Define tipo como "agendado" para o serviço 3
        estado: 'em espera',
        id_servico: idServico,
        codigo: idServico === 3 ? codigo.trim() : null, // Inclui o código apenas para "Atendimento agendado"
      };

      const resposta = await adicionarSenha(novaSenha);
      setMensagem(`Senha criada com sucesso: ${resposta.senha.id_senha}`);
      setErro('');
    } catch (error) {
      console.error('Erro ao criar a senha:', error.response || error.message);
      setErro(error.response?.data?.error || 'Erro ao criar a senha. Por favor, tente novamente.');
      setMensagem('');
    }
  };

  return (
    <Box className="criar-senha-container">
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

      {idServico === 3 && (
        <Box className="caixa-codigo">
          <Typography variant="h6" gutterBottom>
            Insira o Código de Agendamento
          </Typography>
          <TextField
            fullWidth
            label="Código de Agendamento"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value) }}
            className="input-codigo"
          />
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const resposta = await atualizarEstadoSenhaAuto(codigo);
                setMensagem(`A sua senha é o número: ${resposta.senha.id_senha}`);
                setErro('');
              } catch (error) {
                console.error('Erro ao selecionar senha agendada:', error.response || error.message);
                setErro(error.response?.data?.error || 'Erro ao selecionar a senha agendada.');
                setMensagem('');
              }
            }}
            className="botao-criar-senha"
            disabled={!codigo.trim()}
          >
            Selecionar Senha Agendada
          </Button>
        </Box>
      )}

      {idServico !== 3 && (
        <Box className="caixa-tipo-senha">
          <Typography variant="h5" gutterBottom>
            Escolha o Tipo de Senha
          </Typography>
          <Button
            variant="contained"
            onClick={() => criarSenha('geral')}
            className="botao-geral"
            disabled={!idServico}
          >
            Senha Geral
          </Button>

          <Button
            variant="contained"
            onClick={() => criarSenha('prioritaria')}
            className="botao-prioritaria"
            disabled={!idServico}
          >
            Senha Prioritária
          </Button>
        </Box>
      )}

      {mensagem && <Alert severity="success" className="alert">{mensagem}</Alert>}
      {erro && <Alert severity="error" className="alert">{erro}</Alert>}
    </Box>
  );
};

export default CriarSenha;
