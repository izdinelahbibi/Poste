// src/components/Ok.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Ok.css';

const Ok = ({ message, onTimeout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds if no action is taken
    const timer = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        navigate('/');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, onTimeout]);

  return (
    <div className="ok-container">
      <div className="ok-card">
        <div className="ok-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h1 className="ok-title">Succès!</h1>
        <p className="ok-message">{message || "Opération approuvée avec succès!"}</p>
        <div className="ok-buttons">
          <button 
            className="ok-button ok-button-primary"
            onClick={() => window.location.reload()}
          >
            Nouvelle Transaction
          </button>
          <button 
            className="ok-button ok-button-secondary"
            onClick={() => window.close()}
          >
            Fermer
          </button>
        </div>
        <p className="ok-redirect">Redirection dans 5 secondes...</p>
      </div>
    </div>
  );
};

export default Ok;