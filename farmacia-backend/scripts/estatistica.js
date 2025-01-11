const cron = require('node-cron');
const { Pool } = require('pg'); 

const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',       
  database: 'Projeto',    
  password: '1411',        
  port: 5432, 
});

// Função para converter JSON em CSV
const jsonToCsv = (json, fields) => {
  const csvRows = [];
  
  // Adiciona cabeçalhos
  csvRows.push(fields.join(','));
  
  // Adiciona dados
  const values = fields.map((field) => json[field]);
  csvRows.push(values.join(','));

  return csvRows.join('\n'); // Retorna o CSV como string
};

// Função para gerar relatório estatístico e guarda-lo na BD
const gerarEstatisticasEDescarregar = async () => {
  try {
    console.log('Iniciando geração de estatísticas...');

    // Query para obter estatísticas do dia
    const result = await pool.query(`
      SELECT 
        CURRENT_DATE AS data_relatorio,
        COUNT(senha.id_senha) AS total_atendidas,
        COALESCE(AVG(EXTRACT(EPOCH FROM (chamada.hora_ini - senha.data_senha))) / 60, 0) AS tempo_medio_espera,
        COALESCE(AVG(EXTRACT(EPOCH FROM (chamada.hora_fim - chamada.hora_ini))) / 60, 0) AS tempo_medio_atendimento
      FROM senha
      JOIN chamada ON senha.id_senha = chamada.id_senha
      WHERE DATE(senha.data_senha) = CURRENT_DATE
        AND senha.estado = 'atendida';
    `);

    const estatisticas = result.rows[0];

    // Verifica se há dados para guardar
    if (!estatisticas || estatisticas.total_atendidas === 0) {
      console.log('Sem informações para gerar relatório.');
      return;
    }

    // Define os campos para o CSV
    const fields = ['data_relatorio', 'total_atendidas', 'tempo_medio_espera', 'tempo_medio_atendimento'];
    
    // Converte os dados para CSV
    const csv = jsonToCsv(estatisticas, fields);

    // Converte o CSV para um buffer para ser inserido como `bytea`
    const csvBuffer = Buffer.from(csv, 'utf-8');

    // Insere o CSV como binário na tabela estatistica
    const insertResult = await pool.query(`
      INSERT INTO relatorio (ID_Relatorio, Data_relatorio, Relatorio_csv)
      VALUES (
        (SELECT COALESCE(MAX(ID_Relatorio), 0) + 1 FROM relatorio), 
        $1, 
        $2
      );
    `, [estatisticas.data_relatorio, csvBuffer]);

    console.log(`Relatório salvo com ID: ${insertResult.rows[0]?.id_relatorio || 'N/A'}`);
    
  } catch (error) {
    console.error('Erro ao gerar estatísticas ou salvar relatório:', error.stack);
  }
};

// Agendamento diário para as 23h:30min
cron.schedule('30 23 * * *', gerarEstatisticasEDescarregar);

