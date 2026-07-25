import axios from 'axios';

// MUHIM: .env fayli .gitignore da bo'lgani uchun GitHub'ga push bo'lmaydi.
// Bu degani, Vercel/Netlify kabi platformalarda VITE_API_URL ni QO'LDA
// (Dashboard -> Settings -> Environment Variables) sozlash SHART, aks holda
// Vite build vaqtida bu qiymatni "undefined" deb biladi.
//
// Shu sababli bu yerda ishonchli zaxira (fallback) qo'shildi: agar
// VITE_API_URL platforma tomonidan sozlanmagan bo'lsa ham, sayt
// production backend bilan ishlashda davom etadi (404 bo'lib qolmaydi).
// Faqat lokal "npm run dev" ishlatilganda vite.config.js dagi proksi
// orqali localhost:5000 ga yo'naltirish uchun nisbiy '/api' ishlatiladi.

const PRODUCTION_BACKEND_URL = 'https://edunova-backend-premium.onrender.com';

function resolveBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  if (import.meta.env.DEV) {
    return '/api'; // vite.config.js proksisi orqali localhost:5000 ga boradi
  }
  // Production build, lekin VITE_API_URL sozlanmagan -> zaxira manzil
  console.warn(
    '⚠️ VITE_API_URL environment variable sozlanmagan. Zaxira manzil ishlatilmoqda: ' +
      PRODUCTION_BACKEND_URL +
      '. Buni Vercel/Netlify Dashboard -> Environment Variables bo\'limida sozlashni tavsiya qilamiz.'
  );
  return `${PRODUCTION_BACKEND_URL}/api`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - avtomatik JWT token qo'shish
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

// Response interceptor - xatoliklarni markazlashtirilgan holda ushlash
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
