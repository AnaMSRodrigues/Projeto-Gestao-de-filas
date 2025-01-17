const express = require('express');
const { Client } = require('pg');
const cors = require('cors'); // Permite requisições de diferentes origens (CORS)
const router = require('./routes/senhasRoutes');
const app = express();

require('../farmacia-backend/scripts/cronReset'); // Importa o script para o reset 24h
require('../farmacia-backend/scripts/estatistica'); //Importa o script para gerar o relatorio estatistico às 23:30h


// Configuração do acesso à BD PostgreSQL 
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Projeto',
  password: '1411',
  port: 5432,
});

// Conneção WebService 
const axios = require('axios');
app.use(cors());

// Endpoint para consultar medicamentos
app.get('/api/Stock', async (req, res) => {
  const idPro = req.query.id_pro;
  if (!idPro) {
    return res.status(400).json({ error: 'ID do produto é obrigatório.' });
  }

  try {
    const response = await axios.get(`http://172.20.10.2/api/Stock?id_pro=${idPro}`);

    // Transformar a resposta para corresponder ao formato esperado no frontend
    const data = response.data.map((item) => ({
      id: item.id_produto,
      nome: item.nome_produto,
      disponibilidade: item.disponibilidade,
      tempoEntrega: item.tempo_entrega,
    }));
    console.log('Dados transformados:', data);

    res.json(data); // Enviar a resposta transformada
  } catch (error) {
    console.error('Erro ao acessar o web service:', error.message);
    res.status(500).json({ error: 'Erro ao acessar o web service externo.' });
  }
});

// Endpoint para consultar medicamentos de receitas
app.get('/api/Receitas', async (req, res) => {
  const n_receita = req.query.n_receita;
  const cod_acesso = req.query.cod_acesso;
  const pin_opcao = req.query.pin_opcao;
  if (!n_receita || !cod_acesso || !pin_opcao) {
    return res.status(400).json({ error: 'Codigos de receita obrigatórios' });
  }

  try {
    const response = await axios.get(`http://172.20.10.2:81/api/Receitas`, { params: { numero_rec: n_receita, pin_ace: cod_acesso, pin_op: pin_opcao },
});

    // Transformar a resposta para corresponder ao formato esperado no frontend
    const data = response.data.map((item) => ({
      id: item.id_pro,
      nome: item.nome_produto,
      data: item.data,
    }));
    console.log('Dados transformados:', data);

    res.json(data); // Enviar a resposta transformada
  } catch (error) {
    console.error('Erro ao acessar o web service:', error.message);
    res.status(500).json({ error: 'Erro ao acessar o web service externo.' });
  }
});

// Conectar a BD PostgreSQL
client.connect()
  .then(() => {
    console.log('Conexão bem-sucedida ao PostgreSQL!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  });

// Configurações do Express
app.use(express.json()); // Para lidar com corpo das requisições em formato JSON
app.use(cors()); // Ativar CORS para permitir que o front-end se conecte de qualquer fonte
app.use(router); // Assume as rotas definidas 

const PORT = process.env.PORT || 3001; // Utiliza a porta 3001 por padrão
app.listen(PORT, () => {
  console.log(`Servidor aberto na porta ${PORT}`);
});