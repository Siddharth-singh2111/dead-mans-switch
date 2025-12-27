
const isDevelopment = window.location.hostname === 'localhost';

const API_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://dead-mans-switch-9smm.onrender.com'; 

export default API_URL;