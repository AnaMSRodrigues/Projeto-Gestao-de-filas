import React, { useState } from 'react';
import { Button, Alert, Box, FormControl, InputLabel, Select, MenuItem, Typography, TextField } from '@mui/material';
import { adicionarSenhaAgendada, verificarReceita } from '../services/apiService'; // Importa as funções da API
import './css/AgendarSenha.css';

const AgendarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [idServico, setIdServico] = useState('');
  const [numeroReceita, setNumeroReceita] = useState('');
  const [pinOpcao, setPinOpcao] = useState('');
  const [pinAcesso, setPinAcesso] = useState('');
  const [codigoGerado, setCodigoGerado] = useState(''); // Código de acesso gerado

  // Função para gerar o código de acesso de 6 dígitos
  const gerarCodigoAcesso = () => {
    const codigo = Math.floor(100000 + Math.random() * 900000); // Gera um código de 6 dígitos
    setCodigoGerado(codigo);
    return codigo;
  };

  // Função para verificar os parametros inseridos na receita antes de criar a senha
  const verificarEAdicionarSenha = async (tipo) => {
    try {
      // Validações de campos
      if (!idServico) {
        setErro('Por favor, selecione um serviço antes de criar a senha.');
        return;
      }

      if (numeroReceita.length !== 19) {
        setErro('O número de receita deve ter exatamente 19 dígitos.');
        return;
      }

      if (pinAcesso.length !== 6) {
        setErro('O PIN de acesso deve ter exatamente 6 dígitos.');
        return;
      }

      if (pinOpcao.length !== 4) {
        setErro('O PIN de opção deve ter exatamente 4 dígitos.');
        return;
      }

      // Verificar se a receita existe no sistema e guarda-a
      const respostaReceita = await verificarReceita({
        n_receita: numeroReceita,
        pin_acesso: pinAcesso,
        pin_opcao: pinOpcao
      });

      if (!respostaReceita || !respostaReceita.sucesso) {
        setErro('Receita não encontrada ou os PINs estão incorretos.');
        return;
      }

      // Gera o código de acesso para a nova senha
      const novoCodigoAcesso = gerarCodigoAcesso();

      // Objeto da nova senha que será enviado para a API
      const novaSenhaAgendada = {
        tipo, // Tipo de senha (geral ou prioritária)
        estado: 'pausado',
        id_servico: idServico, // ID do serviço selecionado
        codigo_acesso: novoCodigoAcesso // Código de acesso gerado
      };

      // Envia a senha para o backend, mas não precisa da resposta
      await adicionarSenhaAgendada(novaSenhaAgendada);
      
      // Se a senha for criada com sucesso
      setMensagem(`Senha criada com sucesso. Código de acesso: ${novoCodigoAcesso}`);
      setErro('');
      setCodigoGerado(novoCodigoAcesso); // Exibe o código gerado na tela

      // Limpa os campos de entrada
      setNumeroReceita('');
      setPinOpcao('');
      setPinAcesso('');
    } catch (error) {
      console.error('Erro ao criar a senha:', error);
      setErro('Erro ao criar a senha. Por favor, tente novamente.');
      setMensagem('');
    }
  };

  return (
    <Box className="criar-senha-container">
      <Box className="caixa-tipo-senha">
        <Typography variant="h5" gutterBottom>
          Selecione o tipo de senha
        </Typography>

        <Button
          variant="contained"
          onClick={() => verificarEAdicionarSenha('geral')}
          className="botao-geral"
          disabled={!idServico}
        >
          Senha Geral
        </Button>

        <Button
          variant="contained"
          onClick={() => verificarEAdicionarSenha('prioritaria')}
          className="botao-prioritaria"
          disabled={!idServico}
        >
          Senha Prioritária
        </Button>
      </Box>

      {codigoGerado && (
        <Box className="codigo-gerado">
          <Typography variant="h6" gutterBottom>
            Código de Acesso Gerado: <strong>{codigoGerado}</strong>
          </Typography>
        </Box>
      )}

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
          </Select>
        </FormControl>

        <TextField 
          label="Número de Receita (19 dígitos)" 
          value={numeroReceita} 
          onChange={(e) => setNumeroReceita(e.target.value)} 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 19 }} 
        />

        <TextField 
          label="Pin de Acesso(6 dígitos)" 
          value={pinAcesso} 
          onChange={(e) => setPinAcesso(e.target.value)} 
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

