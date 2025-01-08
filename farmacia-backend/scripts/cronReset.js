const cron = require('node-cron');
const { Pool } = require('pg'); 
const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',       
  database: 'Projeto',    
  password: '1411',        
  port: 5432, 
});

// Rota para eliminar registos das senhas e chamadas, exeto as senhas que estão em estado "pausado"
async function resetSenhas() {
  try {
    const client = await pool.connect();

    await client.query('DELETE FROM senha WHERE estado != $1', ['pausado']);
    await client.query('DELETE FROM chamada');

    console.log('Reset de senhas e chamadas concluído.');
    client.release();
  } catch (err) {
    console.error('Erro ao resetar senhas e chamadas:', err);
  }
}

// Agendamento para fazer o reset à meia-noite todos os dias
cron.schedule('0 0 * * *', () => {
  console.log('Iniciando reset de senhas e chamadas...');
  resetSenhas();
});

