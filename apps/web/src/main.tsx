import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App.js';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('DockPilot root element #root is missing.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
