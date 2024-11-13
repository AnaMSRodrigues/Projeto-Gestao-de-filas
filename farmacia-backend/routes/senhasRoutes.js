const express = require('express');
const router = express.Router();

const { Client } = require('pg');

// Configuração da conexão PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',   
  database: 'Projeto',
  password: '1411', 
  port: 5432,
});

// Conecta à BD
client.connect();

// Rota para obter todas as senhas
router.get('/senha', (req, res) => {
  const query = 'SELECT * FROM senhas';

  client.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao executar a consulta', err.stack);
      return res.status(500).json({ error: 'Erro ao consultar as senhas' });
    }
    res.json(result.rows);  // Devolve as linhas encontradas no banco
  });
});

// Rota para obter uma senha específica pelo ID
router.get('/senha/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM senha WHERE id = $1';  // Consulta SQL com um filtro pelo ID
  const values = [id];

  client.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao executar a consulta', err.stack);
      return res.status(500).json({ error: 'Erro ao consultar a senha' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }
    res.json(result.rows[0]);  // Devolve a senha encontrada
  });
});

// Rota para criar uma nova senha
router.post('/senha', (req, res) => {
  const { tipo, estado, id_utente, id_servico } = req.body;  // Campos necessários

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!tipo || !estado || !id_utente || !id_servico) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Verifica se o id_utente existe
  const verificaUtenteQuery = 'SELECT * FROM utente WHERE id_utente = $1';
  client.query(verificaUtenteQuery, [id_utente], (err, result) => {
    if (err) {
      console.error('Erro ao verificar utente', err.stack);
      return res.status(500).json({ error: 'Erro ao verificar o utente' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }

    // Verifica se o id_servico existe
    const verificaServicoQuery = 'SELECT * FROM servico WHERE id_servico = $1';
    client.query(verificaServicoQuery, [id_servico], (err, result) => {
      if (err) {
        console.error('Erro ao verificar serviço', err.stack);
        return res.status(500).json({ error: 'Erro ao verificar o serviço' });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Cria a senha
      const query = `
        INSERT INTO senha (tipo, estado, id_utente, id_servico) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
      `;
      const values = [tipo, estado, id_utente, id_servico];  // Passa todos os valores para a query

      client.query(query, values, (err, result) => {
        if (err) {
          console.error('Erro ao inserir a senha', err.stack);
          return res.status(500).json({ error: 'Erro ao inserir a senha' });
        }
        res.status(201).json(result.rows[0]);  // Devolve a senha criada
      });
    });
  });
});


// Rota para atualizar o estado de uma senha
router.put('/senha/:id_senha', (req, res) => {
  const { id_senha } = req.params;  // ID da senha que será atualizada
  const { estado } = req.body;      // O novo estado (caso contrário, a lógica será automática)

  // Lista dos estados válidos (não inclui "atendido" ou "em atendimento" diretamente)
  const estadosValidos = ['em espera', 'pendente'];

  // Verifica se o estado fornecido é válido
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido. Os estados válidos são: "em espera", "pendente".' });
  }

  // Verificar se a senha existe
  const queryVerificaSenha = 'SELECT * FROM senha WHERE id_senha = $1';
  client.query(queryVerificaSenha, [id_senha], (err, result) => {
    if (err) {
      console.error('Erro ao verificar a senha', err.stack);
      return res.status(500).json({ error: 'Erro ao verificar a senha' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    //Verifica a chamada associada à senha
    const queryVerificaChamada = 'SELECT * FROM chamada WHERE id_senha = $1';
    client.query(queryVerificaChamada, [id_senha], (err, resultChamada) => {
      if (err) {
        console.error('Erro ao verificar chamadas', err.stack);
        return res.status(500).json({ error: 'Erro ao verificar chamadas associadas à senha' });
      }

      let novoEstado = result.rows[0].estado; 

      // Lógica para atualizar o estado com base nas chamadas associadas
      if (resultChamada.rows.length > 0) {
        const chamada = resultChamada.rows[0]; // Considerando que a senha tem apenas uma chamada associada

        // Se há tanto hora_ini quanto hora_fim, a senha está "atendida"
        if (chamada.hora_ini && chamada.hora_fim) {
          novoEstado = 'atendido';
        }
        // Se há apenas hora_ini (sem hora_fim), a senha está "em atendimento"
        else if (chamada.hora_ini && !chamada.hora_fim) {
          novoEstado = 'em atendimento';
        }
      }

      // Se o novo estado for diferente do estado atual, atualizar a senha
      if (estado && estado !== novoEstado) {
        novoEstado = estado;  // Se o estado for enviado na requisição, sobrepõe o estado calculado
      }

      // Atualiza o estado da senha
      const queryAtualizaEstado = 'UPDATE senha SET estado = $1 WHERE id_senha = $2 RETURNING *';
      client.query(queryAtualizaEstado, [novoEstado, id_senha], (err, result) => {
        if (err) {
          console.error('Erro ao atualizar o estado da senha', err.stack);
          return res.status(500).json({ error: 'Erro ao atualizar o estado da senha' });
        }

        // Devolve a senha com o novo estado
        res.status(200).json(result.rows[0]);
      });
    });
  });
});

// Exporta as rotas
module.exports = router;
