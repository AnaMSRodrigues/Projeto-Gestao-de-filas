import axios from 'axios';
import API_URL from '../config/apiConfig';

// Se você precisar de autenticação (exemplo com token JWT)
// export const getAuthToken = () => {
//   return sessionStorage.getItem('authToken') || null; // ou use localStorage, dependendo da sua lógica de autenticação
// };

// Adicionar o token ao cabeçalho, se houver
// api.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

//Endpoint que permite organizar as senhas por estado
export const fetchSenhasPorEstado = async (estado) => {
  try {
    const response = await axios.get(`${API_URL}/senhaOP/${estado}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao carregar senhas com estado "${estado}":`, error);
    return [];
  }
};

//Endpoint que permite chamar a primeira senha na lista de espera
export const chamarPrimeiraSenha = async () => {
  try {
    const response = await axios.post(`${API_URL}/chamarPrimeiraSenhaAtualizada`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao chamar a primeira senha`, error);
    return [];
  }
};

// Endpoint que permite alterar o estado da senha para pendente (quando estado = "em atendimento")
export const alteraPendente = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/alteraPendente/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao alterar estado da senha`, error);
    return [];
  }
}

// Endpoint que permite finalizar o atendimento de uma senha
export const finalizarSenha = async (idSenha) => {
  try {
    const response = await axios.get(`${API_URL}/finalizarSenha/${idSenha}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao chamar a primeira senha`, error);
    return [];
  }
};

//Endpoint que permite solicitar medicamento - WebService
export const solicitaMedicamento = async (idPro) => {
  try {
    const response = await axios.get(`${API_URL}/api/Stock?id_pro=${idPro}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao solicitar medicamento: ${error.message}`);
    throw error;
  }
};



