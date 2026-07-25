import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import useSettingsStore from './store/settingsStore';

// Fetch settings on app load
useSettingsStore.getState().fetchSettings();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
