const express = require('express');
const db = require('../firebaseAdmin'); // Importa o Firestore configurado no `adminFirebase.js`
const router = express.Router();

router.get('/senhas', async (req, res) => {
  try {
    const snapshot = await db.collection('senhas').get();
    const senhas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(senhas);
  } catch (error) {
    console.error('Erro ao obter senhas:', error);
    res.status(500).json({ error: 'Erro ao obter senhas' });
  }
});

// Adicionar uma nova senha
router.post('/senhas', async (req, res) => {
  try {
    const { tipo, idUtente, idServico } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!tipo || !idUtente || !idServico) {
      return res.status(400).json({ error: 'Os campos "tipo", "idUtente" e "idServico" são obrigatórios.' });
    }

    // Verificar se o utente existe no Firestore
    const utenteRef = db.collection('utentes').doc(idUtente);
    const utenteDoc = await utenteRef.get();
    if (!utenteDoc.exists) {
      return res.status(404).json({ error: 'Utente não encontrado.' });
    }

    // Verificar se o serviço existe no Firestore
    const servicoRef = db.collection('servicos').doc(idServico);
    const servicoDoc = await servicoRef.get();
    if (!servicoDoc.exists) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    // Criar a nova senha com todos os campos
    const novaSenha = {
      tipo,
      estado: 'em espera',
      dataCriacao: new Date(),
      idUtente,      // Referência ao ID do utente
      idServico,     // Referência ao ID do serviço
      tentativasPendentes: 0,
    };

    // Adicionar a nova senha ao Firestore
    const docRef = await db.collection('senhas').add(novaSenha);
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
