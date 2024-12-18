const express = require('express');
const { Client } = require('pg'); 
const cors = require('cors'); // Permite requisições de diferentes origens (CORS)
const router = require('./routes/senhasRoutes');
const app = express();

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',      
  host: 'localhost',       
  database: 'Projeto',    
  password: '1411',        
  port: 5432,            
});

// Conectar a BD
client.connect()
  .then(() => {
    console.log('Conexão bem-sucedida ao PostgreSQL!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  });

// Configurações do Express
app.use(express.json()); // Para lidar com corpo das requisições em formato JSON
app.use(cors()); // Ativar CORS para permitir que o front-end se conecte
app.use(router); // Assume as rotas definidas 

const PORT = process.env.PORT || 3001; // Utiliza a porta 3001 por padrão
app.listen(PORT, () => {
  console.log(`Servidor aberto na porta ${PORT}`);
});