import './patch-fetch'; // Must be imported first to patch window.fetch before any other package loads

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './styles-fallback.css'; // Use fallback CSS without Tailwind for Netlify

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);