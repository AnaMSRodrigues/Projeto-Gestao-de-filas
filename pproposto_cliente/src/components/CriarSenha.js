import React, { useState } from 'react';
import { Button, Alert, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { adicionarSenha } from '../services/apiService'; // Função que faz o POST para o servidor
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
        id_servico: idServico, // Pegamos diretamente o valor do state
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
            onChange={(e) => setIdServico(e.target.value)} // Atualiza o estado do idServico
            className="select-servico"
          >
            <MenuItem value={1}>Aquisição de medicação</MenuItem>
            <MenuItem value={2}>Vacinação</MenuItem>
            <MenuItem value={3}>Atendimento agendado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box className="caixa-tipo-senha">
        <Typography variant="h5" gutterBottom>
          Escolha o Tipo de Senha
        </Typography>
        <Button
          variant="contained"
          onClick={() => criarSenha('geral')} // Apenas passamos o tipo
          className="botao-geral"
          disabled={!idServico} // Desativa o botão se nenhum serviço for selecionado
        >
          Senha Geral
        </Button>

        <Button
          variant="contained"
          onClick={() => criarSenha('prioritaria')} // Apenas passamos o tipo
          className="botao-prioritaria"
          disabled={!idServico} // Desativa o botão se nenhum serviço for selecionado
        >
          Senha Prioritária
        </Button>
      </Box>

      {mensagem && <Alert severity="success" className="alert">{mensagem}</Alert>}
      {erro && <Alert severity="error" className="alert">{erro}</Alert>}
    </Box>
  );
};

export default CriarSenha;
