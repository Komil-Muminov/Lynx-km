import axios from 'axios';

// В будущем здесь можно будет использовать getEnvVar из @shared/config
const BASE_URL = ''; 

export const _axios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для обработки ошибок или добавления токенов можно добавить здесь
_axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Единая точка обработки ошибок
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
