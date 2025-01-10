import React, { useState } from 'react';
import {
  Button,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
} from '@mui/material';
import { adicionarSenha, atualizarEstadoSenhaAuto, validarCodigoAgendado } from '../services/apiService';
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
        tipo, 
        estado: 'em espera', 
        id_servico: idServico, 
        codigo: idServico === 3 ? codigo.trim() : null, 
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

  const validarSenhaAgendada = async () => {
    try {
      if (!codigo.trim()) {
        setErro('Por favor, insira o código de agendamento.');
        return;
      }
  
      // Valida o código de agendamento e obtém os dados da senha
      const resposta = await validarCodigoAgendado(codigo);
  
      if (!resposta || !resposta.senha) {
        setErro('Código de agendamento inválido ou senha não encontrada.');
        return;
      }
  
      const { data_senha, estado } = resposta.senha; // Data/hora e estado da senha
  
      // Valida o estado da senha primeiro
      if (estado !== 'pausado') {
        if (estado === 'em espera') {
          setMensagem('Senha já está no estado "em espera".');
        } else {
          setErro('A senha não está no estado válido para validação.');
        }
        return; // Impede que prossiga para a validação de horário
      }
  
      // Validação de hora e data
      const horaAgendada = new Date(data_senha);
      const horaAtual = new Date();
  
      // Calcula intervalo de 15 minutos antes e depois
      const intervaloInicio = new Date(horaAgendada.getTime() - 15 * 60000); // 15 minutos antes
      const intervaloFim = new Date(horaAgendada.getTime() + 15 * 60000); // 15 minutos depois
  
      // Verifica se a hora atual está dentro do intervalo permitido
      if (horaAtual < intervaloInicio || horaAtual > intervaloFim) {
        setErro(
          `A senha só pode ser validada entre ${intervaloInicio.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })} e ${intervaloFim.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}.`
        );
        setMensagem('');
        return;
      }
  
      // Atualiza estado para "em espera"
      const atualizacao = await atualizarEstadoSenhaAuto(codigo);
      setMensagem(
        `Senha validada e atualizada com sucesso. Nova senha: ${atualizacao.senha.id_senha}`
      );
      setErro('');
    } catch (error) {
      console.error('Erro ao validar senha agendada:', error.response || error.message);
      const mensagemErro = error.response?.data?.error || 'Erro ao validar a senha agendada.';
      setErro(mensagemErro);
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
            onChange={(e) => {
              setCodigo(e.target.value);
            }}
            className="input-codigo"
          />
          <Button
            variant="contained"
            onClick={validarSenhaAgendada}
            className="botao-criar-senha"
            disabled={!codigo.trim()}
          >
            Validar Senha Agendada
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
