const express = require('express');
const { Client } = require('pg'); // Importando a biblioteca pg
const app = express();
const senhasRoutes = require('./routes/senhasRoutes'); // Caminho para o arquivo de rotas

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',        
  host: 'localhost',         
  database: 'Projeto',      
  password: '1411',      
  port: 5432,                 
});

// Conectar ao banco de dados
client.connect()
  .then(() => {
    console.log('Conexão bem-sucedida ao PostgreSQL!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL', err.stack);
  });

app.use(express.json());

// Configura o prefixo da rota como /api
app.use('/api', senhasRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor aberto na porta ${PORT}`);
});

