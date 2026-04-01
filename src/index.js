import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// S'assurer que l'élément root existe avant de rendre l'application
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Élément avec id "root" non trouvé dans le DOM');
}