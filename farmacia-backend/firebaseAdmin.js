const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json'); // Certifique-se de que o caminho para o arquivo JSON está correto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Cria uma instância do Firestore
module.exports = db;
