const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json'); // Caminho para o arquivo JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Cria uma instância do Firestore
module.exports = db;
