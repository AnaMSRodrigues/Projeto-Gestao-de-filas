const express = require('express');
const app = express();
const senhasRoutes = require('./routes/senhasRoutes'); // Importa as rotas das senhas

app.use(express.json());

// Usa as rotas definidas no arquivo `senhasRoutes.js`
// Todas as requisições para `/api/senhas` serão tratadas pelo `senhasRoutes`
app.use('/api', senhasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
