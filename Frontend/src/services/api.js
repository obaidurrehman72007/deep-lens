import axios from 'axios';

const api = axios.create({
  // Use the variable from your .env
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Crucial for cookies/sessions
});

export default api;