import axios from 'axios';
import API_URL from '../config/apiConfig';

// Endpoint para adicionar uma nova senha agendada
export const adicionarSenhaAgendada = async (novaSenhaAgendada) => {
  try {
    const response = await axios.post(`${API_URL}/criasenhaAgendada`, novaSenhaAgendada);
    return response.data;
  } catch (error) {
    console.error('Erro ao agendar a senha:', error);
    throw error;
  }
};

// Endpoint para verificar e inserir receita
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

// Endpoint para verificar se existe senha agendada em determinada data e hora 
export const verificarSenhaExistente = async ({ data, horario }) => {
  try {
    const response = await axios.post(`${API_URL}/verificarSenhaExistente`, { data, horario });
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar a senha:', error);
    throw error;
  }
};

// Endpoint que solicita disponibilidade de medicamento por dados de receita - conexão WebService
export const solicitaMedicamentoPorReceita = async (n_receita, cod_acesso, pin_opcao) => {
  try {
    const response = await axios.get(`${API_URL}/api/Receitas`, {
      params: { n_receita, cod_acesso, pin_opcao },
    });
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao verificar receita: ${error.message}`);
    throw error;
  }
};


