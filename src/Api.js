import axios from 'axios';

// Criamos uma "instância" do Axios com o endereço base do nosso Backend
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export default api;