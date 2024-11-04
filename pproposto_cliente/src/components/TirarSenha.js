import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';

const TirarSenha = () => {
  const [tipo, setTipo] = useState('normal');
  const [mensagem, setMensagem] = useState('');

  const handleTirarSenha = async () => {
    try {
      const response = await axios.post('http://localhost:3001/senhas', { tipo });
      setMensagem(`Senha ${response.data.id} do tipo ${response.data.tipo} foi gerada com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar senha', error);
      setMensagem('Erro ao gerar senha. Tente novamente.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, mt: 4, boxShadow: 3, borderRadius: 2, width: '100%', maxWidth: 400 }}>
      <Typography variant="h4" gutterBottom color="primary">Tirar Senha</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="tipo-senha-label">Tipo de Senha</InputLabel>
        <Select
          labelId="tipo-senha-label"
          value={tipo}
          label="Tipo de Senha"
          onChange={(e) => setTipo(e.target.value)}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="prioritaria">Prioritária</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleTirarSenha} fullWidth sx={{ mb: 2 }}>
        Gerar Senha
      </Button>

      {mensagem && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{mensagem}</Alert>}
    </Box>
  );
};

export default TirarSenha;
