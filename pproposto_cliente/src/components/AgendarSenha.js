import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';

const AgendarSenha = () => {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleAgendarSenha = async () => {
    if (!data || !hora) {
      setMensagem('Por favor, selecione a data e a hora.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/senhas', { tipo: 'agendada', data, hora });
      setMensagem(`Senha agendada com sucesso para ${data} às ${hora}.`);
    } catch (error) {
      console.error('Erro ao agendar senha', error);
      setMensagem('Erro ao agendar senha. Tente novamente.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, mt: 4, boxShadow: 3, borderRadius: 2, width: '100%', maxWidth: 400 }}>
      <Typography variant="h4" gutterBottom color="primary">Agendar Senha</Typography>

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

      <Button variant="contained" color="secondary" onClick={handleAgendarSenha} fullWidth>
        Agendar Senha
      </Button>

      {mensagem && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{mensagem}</Alert>}
    </Box>
  );
};

export default AgendarSenha;
