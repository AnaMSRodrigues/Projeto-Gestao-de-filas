import axios from 'axios';
import API_URL from '../config/apiConfig';


// Função para adicionar uma nova senha
export const adicionarSenha = async (novaSenha) => {
  const response = await axios.post(`${API_URL}/criasenha`, novaSenha)
  return response.data;
};

// Função para obter todas as senhas
export const obterSenhas = async () => {
  const response = await axios.get(`${API_URL}/senha`);
  return response.data;
};

// Função para atualizar o estado de uma senha
export const atualizarEstadoSenhaAuto = async (codigo) => {
  const response = await axios.post(`${API_URL}/alteraEstadoSenha/${codigo}`);
  return response.data;
};