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

// Exemplo de função para usar a instância do Axios
// export const fetchSenhas = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/senhaOP`);
//     console.log(response.data); 
//     setSenhas(response.data); 
//     atualizarContadores(response.data); 
//   } catch (error) {
//     console.error('Erro ao carregar senhas:', error);
//   }
// };
export const fetchSenhasPorEstado = async (estado) => {
  try {
    const response = await axios.get(`${API_URL}/senhaOP/${estado}`);
    return response.data; // Retorna os dados recebidos do backend
  } catch (error) {
    console.error(`Erro ao carregar senhas com estado "${estado}":`, error);
    return []; // Retorna um array vazio em caso de erro
  }
};

export const chamarPrimeiraSenha = async () => {
  const response = await axios.post(`${API_URL}/chamarPrimeiraSenhaAtualizada`);
  return response.data;
};

export const alteraPendente = async (id) => {
  const response = await axios.post(`${API_URL}/alteraPendente/${id}`);
  return response.data;
}

export const finalizarSenha = async(idSenha) => {
  const response = await axios.get(`${API_URL}/finalizarSenha/${idSenha}`);
  return response.data;
}

export const solicitaMedicamento = async() => {
  const response = await axios.get(`${'http://172.20.10.2:80/api/Stock'}`);
  return response.data;
}
