import axios from 'axios';
import API_URL from '../config/apiConfig';


// Função para adicionar uma nova senha
export const adicionarSenha = async (novaSenha) => {
  const response = await axios.post(`${API_URL}/criasenha`, novaSenha)
  return response.data;
};

// Função para atualizar o estado de uma senha de forma automática
export const atualizarEstadoSenhaAuto = async (codigo) => {
  const response = await axios.post(`${API_URL}/alteraEstadoSenha/${codigo}`);
  return response.data;
};