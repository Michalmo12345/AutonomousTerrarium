// authService.js
import axios from 'axios';

const API_URL = 'http://13.51.108.48:5000/api/auth';

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data.token;
};

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, { email, password }); // Adjust based on backend
  return response.data.token; // Assuming backend returns token on register
};
