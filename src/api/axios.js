import axios from 'axios';

// IMPORTANT: the .env file is in .gitignore, so it is not pushed to GitHub.
// This means that on platforms like Vercel/Netlify, VITE_API_URL MUST be set
// MANUALLY (Dashboard -> Settings -> Environment Variables), otherwise Vite
// will treat this value as "undefined" at build time.
//
// For this reason a reliable fallback is included here: even if
// VITE_API_URL isn't configured by the platform, the site will keep
// working against the production backend (instead of failing with 404).
// Only when running locally with "npm run dev" is the relative '/api'
// path used, routed to localhost:5000 via the proxy in vite.config.js.

const PRODUCTION_BACKEND_URL = 'https://edunova-backend-premium.onrender.com';

function resolveBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  if (import.meta.env.DEV) {
    return '/api'; // routed to localhost:5000 via the vite.config.js proxy
  }
  // Production build, but VITE_API_URL is not set -> use the fallback URL
  console.warn(
    '⚠️ VITE_API_URL environment variable is not set. Using fallback URL: ' +
      PRODUCTION_BACKEND_URL +
      '. We recommend setting this in the Vercel/Netlify Dashboard -> Environment Variables.'
  );
  return `${PRODUCTION_BACKEND_URL}/api`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
