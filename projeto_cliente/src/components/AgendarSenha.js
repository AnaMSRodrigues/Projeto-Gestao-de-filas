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
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { adicionarSenhaAgendada, verificarReceita } from '../services/apiService';
import './css/AgendarSenha.css';

const AgendarSenha = () => {
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [idServico, setIdServico] = useState('');
  const [numeroReceita, setNumeroReceita] = useState('');
  const [pinOpcao, setPinOpcao] = useState('');
  const [pinAcesso, setPinAcesso] = useState('');
  const [codigoGerado, setCodigoGerado] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null); // Armazena o horário escolhido

  const gerarCodigoAcesso = () => {
    const codigo = Math.floor(100000 + Math.random() * 900000); // Gera um código de 6 dígitos
    setCodigoGerado(codigo);
    return codigo;
  };

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

      if (!dataSelecionada) {
        setErro('Por favor, selecione uma data de agendamento.');
        return;
      }

      if (!horarioSelecionado) {
        setErro('Por favor, selecione um horário.');
        return;
      }

      // Verifica se a receita existe no sistema e guarda-a
      const respostaReceita = await verificarReceita({
        n_receita: numeroReceita,
        pin_acesso: pinAcesso,
        pin_opcao: pinOpcao,
      });

      if (!respostaReceita || !respostaReceita.sucesso) {
        setErro('Receita não encontrada ou os PINs estão incorretos.');
        return;
      }

      const novoCodigoAcesso = gerarCodigoAcesso();

      // Objeto da nova senha que será enviado para o backend
      const novaSenhaAgendada = {
        tipo,
        estado: 'pausado',
        id_servico: idServico,
        codigo_acesso: novoCodigoAcesso,
        data: new Date(dataSelecionada).toISOString().split('T')[0], // Data selecionada
        horario: horarioSelecionado.toLocaleTimeString('pt-BR'), // Horário selecionado
      };

      await adicionarSenhaAgendada(novaSenhaAgendada);

      setMensagem(
        `Senha criada com sucesso para ${new Date(dataSelecionada).toLocaleDateString(
          'pt-BR'
        )} às ${horarioSelecionado.toLocaleTimeString('pt-BR')}. Código de acesso: ${novoCodigoAcesso}`
      );
      setErro('');
      setCodigoGerado(novoCodigoAcesso);

      setNumeroReceita('');
      setPinOpcao('');
      setPinAcesso('');
      setDataSelecionada(null);
      setHorarioSelecionado(null);
    } catch (error) {
      console.error('Erro ao criar a senha:', error);
      setErro('Erro ao criar a senha. Por favor, tente novamente.');
      setMensagem('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box className="criar-senha-container">
        <Box className="caixa-tipo-senha">
          <Typography variant="h5" gutterBottom>
            Selecione o tipo de senha
          </Typography>

          <DatePicker
            label="Selecione a Data de Agendamento"
            value={dataSelecionada}
            onChange={(newValue) => setDataSelecionada(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          <TimePicker
            label="Selecione o Horário"
            value={horarioSelecionado}
            onChange={(newValue) => setHorarioSelecionado(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          <Button
            variant="contained"
            onClick={() => verificarEAdicionarSenha('geral')}
            className="botao-geral"
            disabled={!idServico || !dataSelecionada || !horarioSelecionado}
          >
            Senha Geral
          </Button>

          <Button
            variant="contained"
            onClick={() => verificarEAdicionarSenha('prioritaria')}
            className="botao-prioritaria"
            disabled={!idServico || !dataSelecionada || !horarioSelecionado}
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
            label="Pin de Acesso (6 dígitos)"
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
    </LocalizationProvider>
  );
};

export default AgendarSenha;
