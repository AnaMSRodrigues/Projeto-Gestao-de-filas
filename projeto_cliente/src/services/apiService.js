import axios from 'axios';
import API_URL from '../config/apiConfig';


// Função para adicionar uma nova senha
export const adicionarSenha = async (novaSenha) => {
  const response = await axios.post(`${API_URL}/criasenha`, novaSenha);
  return response.data;
};

// Função para adicionar uma nova senha agendada
export const adicionarSenhaAgendada = async (novaSenhaAgendada) => {
  const response = await axios.post(`${API_URL}/criasenhaAgendada`, novaSenhaAgendada);
  return response.data;
};

// Função para obter todas as senhas
export const obterSenhas = async () => {
  const response = await axios.get(`${API_URL}/senha`);
  return response.data;
};

// Função para atualizar o estado de uma senha
export const atualizarEstadoSenha = async (id, novoEstado) => {
  const response = await axios.put(`${API_URL}/senha/${id}`, { estado: novoEstado });
  return response.data;
};

export const verificarCodigoAcesso = async (codigoAcesso) => {
  try {
    const resposta = await axios.get(`${API_URL}/senhaCod/${codigoAcesso}`);
    if (resposta.data) {
      return resposta.data; // Retorna a senha se encontrada
    } else {
      throw new Error('Código de acesso não encontrado');
    }
  } catch (error) {
    throw new Error('Erro ao verificar o código de acesso: ' + error.message);
  }
};

export const verificarReceita = async ({ n_receita, pin_acesso, pin_opcao }) => {
  try {
    const resposta = await axios.post(`${API_URL}/insereReceita`, {
      n_receita,
      pin_acesso,
      pin_opcao
    });
    return resposta.data; // Retorna o conteúdo da resposta (ex: { sucesso: true } ou { sucesso: false, erro: 'Receita não encontrada' })
  } catch (error) {
    console.error('Erro ao verificar a receita:', error);
    throw error; // Lança o erro para ser tratado no componente que chamou a função
  }
};
