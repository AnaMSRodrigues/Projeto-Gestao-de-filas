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
 
/////////////////////////////////////////////////ARTICULACAO CLIENTE 
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

router.post('/criasenha', async (req, res) => {
  const { tipo, id_servico } = req.body; // Recebe o tipo de senha e id_servico da requisição

  // Verifica se o tipo e id_servico foram enviados
  if (!tipo || !id_servico) {
    return res.status(400).json({ error: 'O tipo de senha e id_servico são obrigatórios' });
  }

  try {
    // 1. Obtém o maior id_utente atual
    const maxIdUtenteQuery = 'SELECT COALESCE(MAX(id_utente), 0) AS max_id FROM utente';
    const maxIdResult = await client.query(maxIdUtenteQuery);
    const novoIdUtente = maxIdResult.rows[0].max_id + 1;

    // 2. Insere o novo utente
    const novoUtenteQuery = 'INSERT INTO utente (id_utente) VALUES ($1)';
    await client.query(novoUtenteQuery, [novoIdUtente]);

    // 3. Cria a nova senha
    const novaSenhaQuery = `
      INSERT INTO senha (tipo, estado, id_utente, id_servico) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const valoresSenha = [tipo, 'em espera', novoIdUtente, id_servico]; 
    const senhaResult = await client.query(novaSenhaQuery, valoresSenha);

    // 4. Responde ao cliente com os detalhes da senha criada
    res.status(201).json({
      message: 'Senha criada com sucesso',
      senha: senhaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar a senha', err.stack);
    res.status(500).json({ error: 'Erro ao criar a senha' });
  }
});

router.post('/criasenhaAgendada', async (req, res) => {
  const { tipo, id_servico, codigo_acesso } = req.body; // Recebe o tipo de senha e id_servico da requisição

  // Verifica se o tipo e id_servico foram enviados
  if (!tipo || !id_servico || !codigo_acesso) {
    return res.status(400).json({ error: 'O tipo de senha , id_servico e codigo_acesso são obrigatórios' });
  }

  try {
    // 1. Obtém o maior id_utente atual
    const maxIdUtenteQuery = 'SELECT COALESCE(MAX(id_utente), 0) AS max_id FROM utente';
    const maxIdResult = await client.query(maxIdUtenteQuery);
    const novoIdUtente = maxIdResult.rows[0].max_id + 1;

    // 2. Insere o novo utente
    const novoUtenteQuery = 'INSERT INTO utente (id_utente) VALUES ($1)';
    await client.query(novoUtenteQuery, [novoIdUtente]);

    // 3. Cria a nova senha
    const novaSenhaQuery = `
      INSERT INTO senha (tipo, estado, id_utente, id_servico, codigo_acesso) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const valoresSenha = [tipo, 'pausado', novoIdUtente, id_servico, codigo_acesso]; 
    const senhaResult = await client.query(novaSenhaQuery, valoresSenha);

    // 4. Responde ao cliente com os detalhes da senha criada
    res.status(201).json({
      message: 'Senha criada com sucesso',
      senha: senhaResult.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar a senha', err.stack);
    res.status(500).json({ error: 'Erro ao criar a senha' });
  }
});

// Rota para atualizar o estado de uma senha
router.put('/senha/:id_senha', (req, res) => {
  const { id_senha } = req.params;  // ID da senha que será atualizada
  const { estado } = req.body;      // O novo estado (caso contrário, a lógica será automática)

  // Lista dos estados válidos (não inclui "atendido" ou "em atendimento" diretamente)
  const estadosValidos = ['em espera', 'pendente', 'em atendimento'];

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

///////////////////////////////////////////////////////ARTICULACAO OPERADOR 

//Metodo que organiza as senhas por estado , data e hora 
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
    res.status(200).json(result.rows); // Retorna as senhas filtradas e ordenadas
  } catch (err) {
    console.error('Erro ao procurar senhas:', err.stack);
    res.status(500).json({ error: 'Erro ao procurar senhas', message: err.message });
  }
});

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

// Rota para chamar uma senha específica
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

router.get('/chamarPrimeiraSenha', async (req, res) => {
  try {
    // 1. Consulta para obter a primeira senha "em espera" ordenada
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

    const senha = result.rows[0];  // Primeira senha da lista
    const idSenha = senha.id_senha;

    // 2. Atualiza o estado da senha para "em atendimento"
    await client.query('UPDATE senha SET estado = $1 WHERE id_senha = $2', ['em atendimento', idSenha]);

    // 3. Registra a chamada (hora_ini é o timestamp atual, hora_fim será NULL por enquanto)
    const horaIni = new Date().toISOString(); // Hora atual em formato timestamp ISO
    const idOperador = 1;  // Colocando 1 como id_operador, conforme solicitado
    const atendimento = '1'; // Pode ser ajustado conforme o seu sistema de atendimento

    const queryChamada = `
      INSERT INTO chamada (hora_ini, hora_fim, atendimento, id_senha, id_operador)
      VALUES ($1, NULL, $2, $3, $4)
      RETURNING id_chamada, hora_ini, hora_fim, atendimento, id_senha, id_operador;
    `;

    const chamadaResult = await client.query(queryChamada, [horaIni, atendimento, idSenha, idOperador]);

    // 4. Retorna a resposta com os detalhes da senha atualizada e a chamada criada
    res.status(201).json({
      message: 'Senha chamada com sucesso',
      senha: result.rows[0],  // Detalhes da senha que foi chamada
      chamada: chamadaResult.rows[0],  // Detalhes da chamada registrada, incluindo id_chamada
    });
  } catch (err) {
    console.error('Erro ao chamar a primeira senha:', err.stack);
    res.status(500).json({ error: 'Erro ao chamar a senha' });
  }
});


router.post('/insereReceita', async (req, res) => {
  const { n_receita, pin_acesso, pin_opcao } = req.body;
  const n_receitaInt = Number(n_receita);
  const pin_acessoInt = Number(pin_acesso);
  const pin_opcaoInt = Number(pin_opcao);

  if (!/^\d{19}$/.test(n_receita) || !/^\d{6}$/.test(pin_acesso) || !/^\d{4}$/.test(pin_opcao)) {
    return res.status(400).json({ sucesso: false, erro: 'Parâmetros inválidos.' });
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
      return res.status(400).json({ sucesso: false, erro: 'O número da receita já está cadastrado.' });
    }
    res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor.' });
  }
});


router.delete('/deleteSenha/:id', async (req, res) => {
  const { id } = req.params; // Captura o ID da URL
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
  const { codigo } = req.params; // Recebe o ID da senha do corpo da requisição

  if (!codigo) {
    return res.status(400).json({ error: 'O Codigo da senha é obrigatório.' });
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

    // Retorna a senha atualizada
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
  const { id } = req.params; // Recebe o ID da senha do corpo da requisição

  if (!id) {
    return res.status(400).json({ error: 'O ID da senha é obrigatório.' });
  }

  try {
    // Atualiza o estado da senha para "em espera" apenas se ela estiver "pausado"
    const updateResult = await client.query(
      `UPDATE senha 
       SET estado = $1 
       WHERE id_senha = $2 AND estado = $3 
       RETURNING *;`,
      ['em atendimento', id, 'pendente']
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Senha não encontrada ou estado inválido.' });
    }

    // Retorna a senha atualizada
    res.status(200).json({
      message: 'Estado da senha atualizado com sucesso.',
      senha: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar o estado da senha:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar o estado da senha.' });
  }
});

// Exporta as rotas
module.exports = router;

