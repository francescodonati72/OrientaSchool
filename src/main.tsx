import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root')!;
const fallback = document.getElementById('fallback');
if (fallback) fallback.remove();

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
