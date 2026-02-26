import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// O "INTERCEPTADOR": Ele para a requisição no ar antes de ela sair do navegador
api.interceptors.request.use((configuracao) => {
  // 1. Olha no bolso do navegador para ver se tem um crachá salvo
  const token = localStorage.getItem('token');

  // 2. Se tiver crachá, grampeia ele no cabeçalho (Header) da requisição
  if (token) {
    configuracao.headers.Authorization = `Bearer ${token}`;
  }

  // 3. Libera a requisição para seguir viagem até o Backend
  return configuracao;
}, (erro) => {
  return Promise.reject(erro);
});

export default api;