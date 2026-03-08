import axios from 'axios';
import { getEnvVar } from '@shared/config/index.js';

const BASE_URL = getEnvVar('API_URL'); 

export const _axios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для обработки ошибок или добавления токенов можно добавить здесь
_axios.interceptors.request.use(
  (config) => {
    // В будущем здесь можно доставать токен (например из AsyncStorage)
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

_axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Единая точка обработки ошибок
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
