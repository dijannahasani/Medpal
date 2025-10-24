// API Configuration
// This file centralizes the API URL configuration

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;

// Helper function to create full API endpoint URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};

