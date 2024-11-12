import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, TextField, Alert, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Select, MenuItem } from '@mui/material';

const AgendarSenha = () => {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('geral');  // Tipo de senha: Geral ou Prioritária
  const [idServico, setIdServico] = useState('');  // ID do serviço selecionado
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleAgendarSenha = async () => {
    if (!data || !hora || !idServico) {
      setErro('Por favor, selecione a data, hora e serviço.');
      setMensagem('');
      return;
    }

    try {
      // Preparar a data e hora juntas
      const dataCompleta = `${data}T${hora}`;

      // Dados a serem enviados para o backend
      const agendamentoData = {
        tipo,
        data: dataCompleta,
        estado: 'em espera',  // Estado inicial
        id_servico: idServico  // ID do serviço selecionado
      };

      // Requisição POST para a API
      const response = await axios.post('http://localhost:3001/api/senhas', agendamentoData);
      setMensagem(`Senha ${tipo} agendada com sucesso para ${data} às ${hora}.`);
      setErro('');
    } catch (error) {
      console.error('Erro ao agendar senha', error);
      setErro('Erro ao agendar senha. Tente novamente.');
      setMensagem('');
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        mt: 5,
        boxShadow: 4,
        borderRadius: 3,
        width: '100%',
        maxWidth: 450,
        bgcolor: '#f9f9f9',
      }}
    >
      <Typography variant="h4" gutterBottom color="primary">
        Agendar Senha
      </Typography>

      <TextField
        label="Data"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Hora"
        type="time"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <FormControl component="fieldset" sx={{ width: '100%', mb: 2, textAlign: 'center', bgcolor: '#e3f2fd', p: 2, borderRadius: 2 }}>
        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Tipo de Senha</FormLabel>
        <RadioGroup
          row
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          sx={{ justifyContent: 'center' }}
        >
          <FormControlLabel value="geral" control={<Radio />} label="Geral" />
          <FormControlLabel value="prioritaria" control={<Radio />} label="Prioritária" />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel>Serviço</FormLabel>
        <Select
          value={idServico}
          onChange={(e) => setIdServico(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>Selecione o serviço</MenuItem>
          <MenuItem value="servico1">Serviço 1</MenuItem>
          <MenuItem value="servico2">Serviço 2</MenuItem>
          <MenuItem value="servico3">Serviço 3</MenuItem>
          {/* Adicione mais serviços conforme necessário */}
        </Select>
      </FormControl>

      <Button variant="contained" color="secondary" onClick={handleAgendarSenha} fullWidth>
        Agendar Senha
      </Button>

      {mensagem && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{mensagem}</Alert>}
      {erro && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{erro}</Alert>}
    </Box>
  );
};

export default AgendarSenha;
