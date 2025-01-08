import axios from 'axios';
import API_URL from '../config/apiConfig';

// Função para adicionar uma nova senha agendada
export const adicionarSenhaAgendada = async (novaSenhaAgendada) => {
  const response = await axios.post(`${API_URL}/criasenhaAgendada`, novaSenhaAgendada);
  return response.data;
};

// Função para verificar e inserir receita
export const verificarReceita = async ({ n_receita, pin_acesso, pin_opcao }) => {
  try {
    const resposta = await axios.post(`${API_URL}/insereReceita`, {
      n_receita,
      pin_acesso,
      pin_opcao
    });
    return resposta.data; 
  } catch (error) {
    console.error('Erro ao verificar a receita:', error);
    throw error; 
  }
};
