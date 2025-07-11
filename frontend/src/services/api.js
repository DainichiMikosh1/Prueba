import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios de la API
export const articulosAPI = {
  obtenerTodos: () => api.get('/articulos'),
  
  obtenerPorId: (id) => api.get(`/articulos/${id}`),
  
  crear: (articulo) => api.post('/articulos', articulo),
};

export default api;
