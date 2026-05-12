import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.global = window;
window.process = {
  nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
  env: { NODE_ENV: 'production' }
} as any;

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
