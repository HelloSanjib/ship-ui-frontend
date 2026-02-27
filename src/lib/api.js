import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // This allows the browser to send/receive secure httpOnly cookies mapping the backend sessio
});

export default api;
