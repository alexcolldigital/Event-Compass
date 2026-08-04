import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles/globals.css';
import App from './App';

const container = document.getElementById('root') || document.createElement('div');
container.id = 'root';
document.body.appendChild(container);

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
