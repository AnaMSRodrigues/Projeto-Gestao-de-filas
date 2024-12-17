import axios from 'axios';
import API_URL from '../config/apiConfig';

// Se você precisar de autenticação (exemplo com token JWT)
const getAuthToken = () => {
  return sessionStorage.getItem('authToken') || null; // ou use localStorage, dependendo da sua lógica de autenticação
};

// Adicionar o token ao cabeçalho, se houver
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Exemplo de função para usar a instância do Axios
const fetchSenhas = async () => {
  try {
    const response = await axios.get(`${API_URL}/senhaOP`);
    console.log(response.data); 
    setSenhas(response.data); 
    atualizarContadores(response.data); 
  } catch (error) {
    console.error('Erro ao carregar senhas:', error);
  }
};

export { api, fetchSenhas };

