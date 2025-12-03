// config.js - Simple and working version
const getAPIBaseURL = () => {
  // Development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production - direct URL
  return 'https://bubt-server.onrender.com';
};

export const API_BASE_URL = getAPIBaseURL();