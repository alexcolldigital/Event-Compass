import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') || document.createElement('div')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
