import React, { useState } from 'react';
import { Button, Alert, Box } from '@mui/material';
import { adicionarSenha } from '../services/apiService';
import './css/CriarSenha.css';

const CriarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const criarSenha = async (tipo) => {
    try {
      const novaSenha = {
        tipo,
        estado: 'em espera',
        id_utente: Math.floor(Math.random() * 1000),
        id_servico: 1, 
      };

      const resposta = await adicionarSenha(novaSenha); 
      setMensagem(`Senha criada com sucesso: ${resposta.id_senha}`);
      setErro('');
    } catch (error) {
      console.error('Erro ao criar a senha:', error.response || error.message);
      setErro('Erro ao criar a senha. Por favor, tente novamente.');
      setMensagem('');
    }
  };

  return (
    <Box className="criar-senha-container">
      <Button
        variant="contained"
        color="primary"
        onClick={() => criarSenha('geral')}
        className="botao-geral"
      >
        Senha Geral
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => criarSenha('prioritaria')}
        className="botao-prioritaria"
      >
        Senha Prioritária
      </Button>

      {mensagem && <Alert severity="success" className="alert">{mensagem}</Alert>}
      {erro && <Alert severity="error" className="alert">{erro}</Alert>}
    </Box>
  );
};

export default CriarSenha;
