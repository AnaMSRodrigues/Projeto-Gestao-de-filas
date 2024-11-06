const express = require('express');
const db = require('../adminFirebase'); // Importa o Firestore configurado no `adminFirebase.js`
const router = express.Router();

// Adicionar uma nova senha
router.post('/senhas', async (req, res) => {
  try {
    const { tipo } = req.body;
    const novaSenha = {
      tipo,
      estado: 'em espera',
      tentativasPendentes: 0,
      dataCriacao: new Date(),
    };
    const docRef = await db.collection('senhas').add(novaSenha); // Adiciona a senha ao Firestore
    res.status(201).json({ id: docRef.id, ...novaSenha });
  } catch (error) {
    console.error('Erro ao adicionar senha:', error);
    res.status(500).json({ error: 'Erro ao adicionar senha' });
  }
});

// Obter todas as senhas
router.get('/teste', async (req, res) => {
  try {
    const testeRef = db.collection('teste').doc('testeDoc');
    await testeRef.set({ mensagem: 'Conexão bem-sucedida!' });
    res.status(200).json({ message: 'Conexão com o Firebase Firestore bem-sucedida!' });
  } catch (error) {
    console.error('Erro na conexão com o Firestore:', error);
    res.status(500).json({ error: 'Erro na conexão com o Firestore' });
  }
});

// Atualizar o estado de uma senha
router.patch('/senhas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const senhaRef = db.collection('senhas').doc(id);

    await senhaRef.update({ estado });
    res.status(200).json({ message: 'Estado atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    res.status(500).json({ error: 'Erro ao atualizar estado' });
  }
});

// Marcar uma senha como pendente e atualizar o contador de tentativas
router.patch('/senhas/:id/pendente', async (req, res) => {
  try {
    const { id } = req.params;
    const senhaRef = db.collection('senhas').doc(id);
    const doc = await senhaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Senha não encontrada' });
    }

    const senhaData = doc.data();
    const novasTentativas = (senhaData.tentativasPendentes || 0) + 1;
    const novoEstado = novasTentativas >= 3 ? 'cancelada' : 'pendente';

    await senhaRef.update({
      estado: novoEstado,
      tentativasPendentes: novasTentativas,
    });

    res.status(200).json({ message: 'Estado atualizado com sucesso', novoEstado, novasTentativas });
  } catch (error) {
    console.error('Erro ao atualizar senha para pendente:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha para pendente' });
  }
});

module.exports = router;
