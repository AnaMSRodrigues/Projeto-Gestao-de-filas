const express = require('express');
const app = express();
app.use(express.json());

let senhas = []; // Simulação de um banco de dados em memória

// Função para obter a próxima senha em espera ou pendente
const obterProximaSenha = () => {
  const senhasEmEspera = senhas.filter(s => s.estado === 'em espera' || s.estado === 'pendente');
  const senhaPrioritaria = senhasEmEspera.find(s => s.tipo === 'prioritaria');
  return senhaPrioritaria || senhasEmEspera[0];
};

// Rota para criar uma nova senha
app.post('/senhas', (req, res) => {
  const { tipo } = req.body;
  const novaSenha = {
    id: senhas.length + 1,
    tipo,
    estado: 'em espera',
    tentativasPendentes: 0,
  };
  senhas.push(novaSenha);
  res.status(201).json(novaSenha);
});

// Rota para listar senhas em espera e pendentes
app.get('/senhas', (req, res) => {
  const senhasEmEspera = senhas.filter(s => s.estado === 'em espera' || s.estado === 'pendente');
  res.json(senhasEmEspera);
});

// Rota para marcar uma senha como atendida
app.patch('/senhas/:id/atender', (req, res) => {
  const { id } = req.params;
  const senha = senhas.find(s => s.id == id);
  if (senha && senha.estado !== 'cancelada') {
    senha.estado = 'atendida';
    res.json(senha);
  } else {
    res.status(404).json({ message: 'Senha não encontrada ou já cancelada' });
  }
});

// Rota para marcar uma senha como pendente e automatizar a chamada
app.patch('/senhas/:id/pendente', (req, res) => {
  const { id } = req.params;
  const senha = senhas.find(s => s.id == id);
  if (senha) {
    senha.estado = 'pendente';
    senha.tentativasPendentes += 1;

    // Verificar se a senha já foi chamada 3 vezes como pendente
    if (senha.tentativasPendentes >= 3) {
      senha.estado = 'cancelada';
    }
    res.json(senha);
  } else {
    res.status(404).json({ message: 'Senha não encontrada' });
  }
});

// Inicializar o servidor na porta 3001
app.listen(3001, () => console.log('API rodando na porta 3001'));
