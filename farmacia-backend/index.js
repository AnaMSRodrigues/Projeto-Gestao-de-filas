const express = require('express');
const { Client } = require('pg'); // Bibliotecas necessárias para conexão com o banco
const cors = require('cors'); // Para permitir requisições de diferentes origens (CORS)
const app = express();

// Configuração do cliente PostgreSQL
const client = new Client({
  user: 'postgres',        // Usuário do banco
  host: 'localhost',       // Host do banco (localhost para seu ambiente local)
  database: 'Projeto',     // Nome do banco de dados
  password: '1411',        // Senha do banco
  port: 5432,              // Porta padrão do PostgreSQL
});

// Conectar ao banco de dados
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

// Rota para buscar senhas por estado
app.get('/api/senhaOP/:estado', async (req, res) => {
  const { estado } = req.params; // Pega o parâmetro 'estado' da URL

  try {
    // Query SQL para buscar senhas com o estado especificado
    const query = 'SELECT * FROM senha WHERE estado = $1'; 
    const result = await client.query(query, [estado]);  // Executa a query com o estado passado

    // Se houver senhas com o estado solicitado, retorna as senhas
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      // Se não houver senhas, retorna uma mensagem de erro
      res.status(404).json({ message: `Nenhuma senha encontrada com o estado "${estado}"` });
    }
  } catch (error) {
    console.error('Erro ao buscar senhas por estado:', error.message);  // Logando o erro detalhado
    console.error(error.stack); // Logando o stack trace
    res.status(500).json({ error: 'Erro ao procurar senhas', details: error.message }); // Retorna o erro com detalhes
  }
});

// Porta do servidor
const PORT = process.env.PORT || 3001; // Usando a porta 3001 por padrão
app.listen(PORT, () => {
  console.log(`Servidor aberto na porta ${PORT}`);
});
