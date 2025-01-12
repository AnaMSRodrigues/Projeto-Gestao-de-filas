const express = require('express');
const router = express.Router();


const { Client } = require('pg');

// Configuração da conexão a base de dados PostgreSQL
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
  const query = 'SELECT * FROM senha';

  client.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao efetuar pesquisa', err.stack);
      return res.status(500).json({ error: 'Erro ao procurar as senhas' });
    }
    res.json(result.rows);  // Devolve as linhas encontradas na BD
  });
});

// Rota para obter uma senha específica pelo ID
router.get('/senha/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM senha WHERE id_senha = $1'; // Filtra pesquisa por ID
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
// Estado da senha é "em espera" por default
router.post('/criasenha', async (req, res) => {
  const { tipo, id_servico } = req.body; // Recebe o tipo de senha e id_servico

  // Verifica se o tipo e id_servico foram enviados
  if (!tipo || !id_servico) {
    return res.status(400).json({ error: 'O tipo de senha e id_servico são obrigatórios' });
  }

  try {
    // Obtém o maior id_utente atual
    const maxIdUtenteQuery = 'SELECT COALESCE(MAX(id_utente), 0) AS max_id FROM utente';
    const maxIdResult = await client.query(maxIdUtenteQuery);
    const novoIdUtente = maxIdResult.rows[0].max_id + 1;

    // Insere o novo utente
    const novoUtenteQuery = 'INSERT INTO utente (id_utente) VALUES ($1)';
    await client.query(novoUtenteQuery, [novoIdUtente]);

    // Cria a nova senha
    const novaSenhaQuery = `
      INSERT INTO senha (tipo, estado, id_utente, id_servico) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const valoresSenha = [tipo, 'em espera', novoIdUtente, id_servico];
    const senhaResult = await client.query(novaSenhaQuery, valoresSenha);

    // Devolve ao cliente os detalhes da senha criada
    res.status(201).json({
      message: 'Senha criada com sucesso',
      senha: senhaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar a senha', err.stack);
    res.status(500).json({ error: 'Erro ao criar a senha' });
  }
});

// Rota para criar uma nova senhaAgendada , com código de acesso associado
// Estado da senha é pausado por default
router.post('/criasenhaAgendada', async (req, res) => {
  const { tipo, id_servico, codigo_acesso, data, horario } = req.body; // Recebe data e horário separados

  // Verifica se os campos obrigatórios foram enviados
  if (!tipo || !id_servico || !codigo_acesso || !data || !horario) {
    return res.status(400).json({ error: 'O tipo de senha, id_servico, codigo_acesso, data e horário são obrigatórios' });
  }

  try {
    // Combina a data e o horário em um timestamp válido
    const data_ini = new Date(`${data}T${horario}`).toISOString(); // Constrói o timestamp no formato ISO 8601

    // Obtém o maior id_utente atual
    const maxIdUtenteQuery = 'SELECT COALESCE(MAX(id_utente), 0) AS max_id FROM utente';
    const maxIdResult = await client.query(maxIdUtenteQuery);
    const novoIdUtente = maxIdResult.rows[0].max_id + 1;

    // Insere o novo utente
    const novoUtenteQuery = 'INSERT INTO utente (id_utente) VALUES ($1)';
    await client.query(novoUtenteQuery, [novoIdUtente]);

    // Cria a nova senha com data_ini
    const novaSenhaQuery = `
      INSERT INTO senha (tipo, estado, id_utente, id_servico, codigo_acesso, data_senha) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    const valoresSenha = [tipo, 'pausado', novoIdUtente, id_servico, codigo_acesso, data_ini];
    const senhaResult = await client.query(novaSenhaQuery, valoresSenha);

    // Devolve ao cliente os detalhes da senha criada
    res.status(201).json({
      message: 'Senha criada com sucesso',
      senha: senhaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar a senha', err.stack);
    res.status(500).json({ error: 'Erro ao criar a senha' });
  }
});


// Rota para atualizar o estado de uma senha pelo ID
router.put('/senha/:id_senha', (req, res) => {
  const { id_senha } = req.params;
  const { estado } = req.body;      // O novo estado (caso contrário, a lógica será automática)

  // Lista dos estados válidos 
  const estadosValidos = ['em espera', 'pendente', 'em atendimento', 'cancelado', 'atendido'];

  // Verifica se o estado fornecido é válido
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  // Verifica se a senha existe
  const queryVerificaSenha = 'SELECT * FROM senha WHERE id_senha = $1';
  client.query(queryVerificaSenha, [id_senha], (err, result) => {
    if (err) {
      console.error('Erro ao verificar a senha', err.stack);
      return res.status(500).json({ error: 'Erro ao verificar a senha' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    // Verifica a chamada associada à senha
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

// Rota que organiza as senhas por estado , data e hora 
router.get('/senhaOPordena', async (req, res) => {
  try {
    // Consulta SQL para filtrar por estado "em espera", ordenar por prioridade e data
    const result = await client.query(`
      SELECT * FROM senha
      WHERE estado = 'em espera'  
      ORDER BY 
        CASE 
          WHEN tipo = 'prioritaria' THEN 1
          WHEN tipo = 'geral' THEN 2
          ELSE 3 
        END,
        data_senha ASC  
    `);
    res.status(200).json(result.rows); // Devolve as senhas filtradas e ordenadas
  } catch (err) {
    console.error('Erro ao procurar senhas:', err.stack);
    res.status(500).json({ error: 'Erro ao procurar senhas', message: err.message });
  }
});

// Rota para obter a lista de senhas de um estado
router.get('/senhaOP/:estado', async (req, res) => {
  const { estado } = req.params;
  try {
    const result = await client.query('SELECT * FROM senha WHERE estado = $1', [estado]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Nenhuma senha encontrada no estado: ${estado}` });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao procurar senhas:', err);
    res.status(500).json({ error: 'Erro ao procurar senhas' });
  }
});

// Rota para chamar (colocar estado em atendimento) de uma senha específica
router.post('/senhaOP/:id/atender', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE senha SET estado = $1 WHERE id = $2 RETURNING *', ['atendida', id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Senha não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atender senha:', err);
    res.status(500).json({ error: 'Erro ao atender a senha' });
  }
});

// Rota combinada - organiza as senhas por estado, data e hora e seleciona a primeira, criando uma chamada associada
router.get('/chamarPrimeiraSenha', async (req, res) => {
  try {
    // Consulta para obter a primeira senha "em espera" ordenada
    const result = await client.query(`
      SELECT * FROM senha
      WHERE estado = 'em espera'
      ORDER BY 
        CASE 
          WHEN tipo = 'prioritaria' THEN 1
          WHEN tipo = 'geral' THEN 2
          ELSE 3 
        END,
        data_senha ASC  
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhuma senha em espera encontrada' });
    }

    const senha = result.rows[0];
    const idSenha = senha.id_senha;

    // Atualiza o estado da senha para "em atendimento"
    await client.query('UPDATE senha SET estado = $1 WHERE id_senha = $2', ['em atendimento', idSenha]);

    // Regista a chamada (hora_ini é o timestamp atual, hora_fim será NULL por enquanto)
    const horaIni = new Date().toISOString(); // Hora atual em formato timestamp ISO
    const idOperador = 1;  // Coloca 1 como id_operador, até implementar lógica dos balcões 
    const atendimento = '1';

    const queryChamada = `
      INSERT INTO chamada (hora_ini, hora_fim, atendimento, id_senha, id_operador)
      VALUES ($1, NULL, $2, $3, $4)
      RETURNING id_chamada, hora_ini, hora_fim, atendimento, id_senha, id_operador;
    `;

    const chamadaResult = await client.query(queryChamada, [horaIni, atendimento, idSenha, idOperador]);

    // Retorna a resposta com os detalhes da senha atualizada e a chamada criada
    res.status(201).json({
      message: 'Senha chamada com sucesso',
      senha: result.rows[0],
      chamada: chamadaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao chamar a primeira senha:', err.stack);
    res.status(500).json({ error: 'Erro ao chamar a senha' });
  }
});

// Rota combinada - mantém a lógica do chamarPrimeiraSenha + adiciona as senhas com estado pendente ao inicio da lista
router.post('/chamarPrimeiraSenhaAtualizada', async (req, res) => {
  try {
    // Consulta para obter a próxima senha com base nas regras de prioridade
    const result = await client.query(`
      SELECT s.*, c.atendimento, c.id_chamada
      FROM senha s
      LEFT JOIN chamada c ON s.id_senha = c.id_senha
      WHERE 
        (s.estado = 'pendente' AND s.tipo = 'prioritaria')
        OR (s.estado = 'pendente' AND s.tipo = 'geral')
        OR (s.estado = 'em espera' AND s.tipo = 'prioritaria')
        OR (s.estado = 'em espera' AND s.codigo_acesso IS NOT NULL AND s.tipo = 'prioritaria')
        OR (s.estado = 'em espera' AND s.codigo_acesso IS NOT NULL AND s.tipo = 'geral')
        OR (s.estado = 'em espera' AND s.tipo = 'geral')
      ORDER BY 
        CASE 
          WHEN s.estado = 'pendente' AND s.tipo = 'prioritaria' THEN 1
          WHEN s.estado = 'pendente' AND s.tipo = 'geral' THEN 2
          WHEN s.estado = 'em espera' AND s.tipo = 'prioritaria' THEN 3
          WHEN s.estado = 'em espera' AND s.codigo_acesso IS NOT NULL AND s.tipo = 'prioritaria' THEN 4
          WHEN s.estado = 'em espera' AND s.codigo_acesso IS NOT NULL AND s.tipo = 'geral' THEN 5
          WHEN s.estado = 'em espera' AND s.tipo = 'geral' THEN 6
          ELSE 7
        END,
        s.data_senha ASC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhuma senha disponível para chamada' });
    }

    const senha = result.rows[0];
    const idSenha = senha.id_senha;

    // Se o atendimento for 3, altera o estado da senha para cancelado
    if (senha.atendimento === 3) {
      await client.query('UPDATE senha SET estado = $1 WHERE id_senha = $2', ['cancelada', idSenha]);
      return res.status(200).json({ message: 'Senha cancelada por não comparência à 3ª vez', senha });
    }

    // Atualiza o estado da senha para "em atendimento"
    await client.query('UPDATE senha SET estado = $1 WHERE id_senha = $2', ['em atendimento', idSenha]);

    // Verifica se já existe uma chamada para essa senha
    if (senha.id_chamada) {
      let novoAtendimento = senha.atendimento;

      // Incrementa o atendimento
      if (novoAtendimento === 2) {
        novoAtendimento = 3;
      } else if (novoAtendimento === 1) {
        novoAtendimento = 2;
      }

      const chamadaResult = await client.query(`
        UPDATE chamada 
        SET atendimento = $1
        WHERE id_chamada = $2
        RETURNING hora_ini, atendimento;
      `, [novoAtendimento, senha.id_chamada]);

      return res.status(200).json({
        message: 'Atendimento atualizado com sucesso.',
        senha,
        atendimento: novoAtendimento, 
        chamada: chamadaResult.rows[0],
      });
    }

    // Se não houver chamada associada, regista uma nova chamada
    const horaIni = new Date().toISOString();
    const idOperador = 1; // Define id_operador como 1 até lógica do balcão ser implementada
    const atendimento = 1;

    const queryChamada = `
      INSERT INTO chamada (hora_ini, hora_fim, atendimento, id_senha, id_operador)
      VALUES ($1, NULL, $2, $3, $4)
      RETURNING id_chamada, hora_ini, hora_fim, atendimento, id_senha, id_operador;
    `;

    const chamadaResult = await client.query(queryChamada, [horaIni, atendimento, idSenha, idOperador]);

    // Retorna a resposta com os detalhes da senha atualizada e a chamada criada
    res.status(201).json({
      message: 'Senha chamada com sucesso',
      senha: result.rows[0],
      chamada: chamadaResult.rows[0],
    });

  } catch (err) {
    console.error('Erro ao chamar a primeira senha:', err.stack);
    res.status(500).json({ error: 'Erro ao chamar a senha' });
  }
});


// Rota que insere receita na BD 
// Limita a inserção com validação através de expressoes regulares 
router.post('/insereReceita', async (req, res) => {
  const { n_receita, pin_acesso, pin_opcao } = req.body;
  const n_receitaInt = Number(n_receita);
  const pin_acessoInt = Number(pin_acesso);
  const pin_opcaoInt = Number(pin_opcao);

  if (!/^\d{19}$/.test(n_receita) || !/^\d{6}$/.test(pin_acesso) || !/^\d{4}$/.test(pin_opcao)) {
    return res.status(400).json({ sucesso: false, erro: 'Parametros inválidos.' });
  }

  try {
    const query = `
      INSERT INTO receita (n_receita, cod_acesso, pin_opcao)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const chamadaResult = await client.query(query, [n_receitaInt, pin_acessoInt, pin_opcaoInt]);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Receita criada com sucesso',
      receita: chamadaResult.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ sucesso: false, erro: 'O número da receita já existe.' });
    }
    res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor.' });
  }
});

// Rota que permite eliminar uma senha pelo ID
router.delete('/deleteSenha/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Executa a query de exclusão
    const result = await client.query('DELETE FROM senha WHERE id_senha = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    res.status(200).json({ message: 'Senha eliminada com sucesso' });
  } catch (err) {
    console.error('Erro ao eliminar senha:', err.stack);
    res.status(500).json({ error: 'Erro ao eliminar senha', message: err.message });
  }
});

// Rota para alterar o estado de "pausado" para "em espera"
router.post('/alteraEstadoSenha/:codigo', async (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ error: 'O codigo de acesso é obrigatório.' });
  }

  try {
    // Atualiza o estado da senha para "em espera" apenas se ela estiver "pausado"
    const updateResult = await client.query(
      `UPDATE senha 
       SET estado = $1 
       WHERE codigo_acesso = $2 AND estado = $3 
       RETURNING *;`,
      ['em espera', codigo, 'pausado']
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Senha não encontrada ou estado inválido.' });
    }

    // Devolve a senha atualizada
    res.status(200).json({
      message: 'Estado da senha atualizado com sucesso.',
      senha: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar o estado da senha:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar o estado da senha.' });
  }
});

// Rota para alterar o estado de "em atendimento" para "pendente"
router.post('/alteraPendente/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'O ID da senha é obrigatório.' });
  }

  try {
    // Verifica se a senha existe com o estado 'em atendimento'
    console.log(`Procurando por senha com id_senha: ${id} e estado = 'em atendimento'`);

    const senhaResult = await client.query(
      `SELECT * FROM senha WHERE id_senha = $1 AND estado = $2`,
      [id, 'em atendimento']
    );

    if (senhaResult.rowCount === 0) {
      console.log(`Senha não encontrada com id_senha: ${id} e estado 'em atendimento'`);
      return res.status(404).json({ error: 'Senha não encontrada ou estado inválido.' });
    }

    // Atualiza o estado da senha para "pendente"
    console.log(`Atualizando estado da senha com id_senha: ${id} para 'pendente'`);
    const updateSenhaResult = await client.query(
      `UPDATE senha 
       SET estado = $1 
       WHERE id_senha = $2 AND estado = $3 
       RETURNING *;`,
      ['pendente', id, 'em atendimento']
    );

    if (updateSenhaResult.rowCount === 0) {
      return res.status(404).json({ error: 'Erro ao atualizar o estado da senha.' });
    }

    // Verifica se há uma chamada associada com atendimento em progresso
    const chamadaResult = await client.query(
      `SELECT * FROM chamada WHERE id_senha = $1 AND hora_fim IS NULL`,
      [id]
    );

    if (chamadaResult.rowCount === 0) {
      console.log(`Chamada não encontrada ou já finalizada para a senha com id_senha: ${id}`);
      return res.status(404).json({ error: 'Chamada não encontrada ou já finalizada.' });
    }

    const chamada = chamadaResult.rows[0];
    let novoAtendimento = chamada.atendimento;

    // Atualiza o atendimento
    if (novoAtendimento === 1) {
      novoAtendimento = 2;
    } else if (novoAtendimento === 2) {
      novoAtendimento = 3;
    }

    console.log(`Atualizando atendimento da chamada com id_chamada: ${chamada.id_chamada} para ${novoAtendimento}`);
    await client.query(
      `UPDATE chamada 
       SET atendimento = $1 
       WHERE id_chamada = $2`,
      [novoAtendimento, chamada.id_chamada]
    );

    // Devolve a senha e os novos valores de atendimento
    res.status(200).json({
      message: 'Estado da senha e atendimento atualizado com sucesso.',
      senha: updateSenhaResult.rows[0],
      atendimento: novoAtendimento,
    });
  } catch (error) {
    console.error('Erro ao atualizar o estado da senha:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar o estado da senha.' });
  }
});

//Rota para terminar atendimento por ID da senha 
router.get('/finalizarSenha/:idSenha', async (req, res) => {
  const { idSenha } = req.params;

  try {
    // Verifica se a senha existe e se o seu estado é "em atendimento"
    const result = await client.query('SELECT * FROM senha WHERE id_senha = $1 AND estado = $2', [idSenha, 'em atendimento']);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Senha não encontrada ou não está em atendimento' });
    }

    const senha = result.rows[0];

    // Atualiza o estado da senha para "atendida"
    await client.query('UPDATE senha SET estado = $1 WHERE id_senha = $2', ['atendida', idSenha]);

    // Atualiza a hora_fim da chamada com o timestamp atual
    const horaFim = new Date().toISOString();  // Hora atual em formato timestamp ISO

    const queryAtualizarChamada = `
      UPDATE chamada
      SET hora_fim = $1
      WHERE id_senha = $2 AND hora_fim IS NULL
      RETURNING id_chamada, hora_ini, hora_fim, atendimento, id_senha, id_operador;
    `;

    const chamadaResult = await client.query(queryAtualizarChamada, [horaFim, idSenha]);

    if (chamadaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Chamada não encontrada ou já finalizada' });
    }

    // Devolve a resposta com os detalhes da senha atualizada e da chamada finalizada
    res.status(200).json({
      message: 'Senha atendida e chamada finalizada com sucesso',
      senha: senha,  // Detalhes da senha que foi atendida
      chamada: chamadaResult.rows[0],  // Detalhes da chamada finalizada
    });
  } catch (err) {
    console.error('Erro ao finalizar a senha:', err.stack);
    res.status(500).json({ error: 'Erro ao finalizar a senha' });
  }
});

router.post('/validaCodigo/:codigo', async (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ error: 'Código de agendamento é obrigatório.' });
  }

  try {
    const query = 'SELECT * FROM senha WHERE codigo_acesso = $1';
    const result = await client.query(query, [codigo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada para o código fornecido.' });
    }

    const senha = result.rows[0];
    res.status(200).json({ senha });
  } catch (error) {
    console.error('Erro ao validar o código de agendamento:', error);
    res.status(500).json({ error: 'Erro ao validar o código de agendamento.' });
  }
});

// Rota que verifica se existe senhas agendadas num certo dia e hora 
router.post('/verificarSenhaExistente', async (req, res) => {
  let { data, horario } = req.body;

  if (!data || !horario) {
    return res.status(400).json({ error: 'Data e horário são obrigatórios.' });
  }

  try {
    // Converte a data para o formato YYYY-MM-DD
    const dataFormatada = new Date(data).toISOString().split('T')[0];
    // Converte o horário para o formato HH:MM
    const horarioFormatado = horario.split(':').slice(0, 2).join(':');

    const query = `
      SELECT COUNT(*) as count
      FROM senha
      WHERE DATE(data_senha) = $1 
        AND TO_CHAR(data_senha, 'HH24:MI') = $2
        AND estado = 'pausado';
    `;
    const result = await client.query(query, [dataFormatada, horarioFormatado]);

    res.status(200).json({ existe: result.rows[0].count > 0 });
  } catch (error) {
    console.error('Erro ao verificar senha existente:', error);
    res.status(500).json({ error: 'Erro ao verificar senha existente.' });
  }
});

// Exporta as rotas
module.exports = router;

