import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logoCP.png';
import './Header.css';

function Header() {
  // Language state
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // Translations for header
  const translations = {
    en: {
      login: "Log in",
      czech: "CZ",
      english: "EN"
    },
    cz: {
      login: "Přihlásit se",
      czech: "CZ",
      english: "EN"
    }
  };

  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'cz' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }));
  };

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  return (
    <header className="header">
      <div className="container">
        
        <div className="logo">
          <img src={logo} alt="PoštaOnline" className="logo-image" />
        </div>

        <div className="nav-right">
          <button onClick={toggleLanguage} className="language-btn" type="button">
            {language === 'en' ? t.czech : t.english}
          </button>
          <Link to="/" className="nav-link btn btn-login">{t.login}</Link>
        </div>

      </div>
    </header>
  );
}

export default Header;