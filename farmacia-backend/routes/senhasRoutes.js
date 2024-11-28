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

// Rota para criar uma nova senha e um novo utente
router.post('/criasenha', async (req, res) => {
  const { tipo } = req.body; // Recebe o tipo de senha ("geral" ou "prioritaria")

  if (!tipo) {
    return res.status(400).json({ error: 'O tipo de senha é obrigatório' });
  }

  try {
    // 1. Obtenha o maior id_utente atual
    const maxIdUtenteQuery = 'SELECT COALESCE(MAX(id_utente), 0) AS max_id FROM utente';
    const maxIdResult = await client.query(maxIdUtenteQuery);
    const novoIdUtente = maxIdResult.rows[0].max_id + 1;

    // 2. Insira o novo utente
    const novoUtenteQuery = 'INSERT INTO utente (id_utente) VALUES ($1)';
    await client.query(novoUtenteQuery, [novoIdUtente]);

    // 3. Crie a nova senha
    const novaSenhaQuery = `
      INSERT INTO senha (tipo, estado, id_utente, id_servico) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const valoresSenha = [tipo, 'em espera', novoIdUtente, 1]; // id_servico fixo como exemplo
    const senhaResult = await client.query(novaSenhaQuery, valoresSenha);

    // 4. Responda ao cliente com os detalhes
    res.status(201).json({
      message: 'Senha criada com sucesso',
      senha: senhaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar a senha', err.stack);
    res.status(500).json({ error: 'Erro ao criar a senha' });
  }
});

// Rota para obter todas as senhas
router.get('/senha', (req, res) => {
  const query = 'SELECT * FROM senha';

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
  const query = 'SELECT * FROM senha WHERE id_senha = $1';  // Consulta SQL com um filtro pelo ID
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
