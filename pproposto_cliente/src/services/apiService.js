import axios from 'axios';
import API_URL from '../config/apiConfig';

// Função para adicionar uma nova senha
export const adicionarSenha = async (novaSenha) => {
  const response = await axios.post(`${API_URL}/senhas`, novaSenha);
  return response.data;
};

// Função para obter todas as senhas
export const obterSenhas = async () => {
  const response = await axios.get(`${API_URL}/senhas`);
  return response.data;
};

// Função para atualizar o estado de uma senha
export const atualizarEstadoSenha = async (id, novoEstado) => {
  const response = await axios.patch(`${API_URL}/senhas/${id}`, { estado: novoEstado });
  return response.data;
};
