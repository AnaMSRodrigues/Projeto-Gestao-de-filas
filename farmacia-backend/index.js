const express = require('express');
const app = express();
const senhasRoutes = require('./routes/senhasRoutes'); // Caminho para o arquivo de rotas

app.use(express.json());

// Configura o prefixo da rota como /api
app.use('/api', senhasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

