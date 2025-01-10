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
// Método para validar o código de agendamento
export const validarCodigoAgendado = async (codigo) => {
  try {
    const response = await axios.post(`${API_URL}/validaCodigo/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao validar o código de agendamento:', error);
    throw error;
  }
};
