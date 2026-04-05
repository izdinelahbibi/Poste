import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import LoginForm from './LoginForm';
import CaptchaVerification from './CaptchaVerification';
import { useLanguage } from '../hooks/useLanguage';
import './HomePage.css';

function HomePage() {
  const { t } = useLanguage();
  const [showCaptcha, setShowCaptcha] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    setShowLogin(true);
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="homepage-grid">
            <div className="login-section">
              {showCaptcha && !showLogin && (
                <CaptchaVerification onSuccess={handleCaptchaSuccess} />
              )}
              
              {showLogin && <LoginForm />}
              
              {!showCaptcha && !showLogin && (
                <div className="login-placeholder">
                  <button 
                    onClick={() => setShowCaptcha(true)}
                    className="show-login-btn"
                  >
                    Afficher le formulaire de connexion
                  </button>
                </div>
              )}
            </div>

            <div className="welcome-section">
              <h2 className="welcome-title">{t.homepage.welcomeTitle}</h2>
              <ul className="benefits-list">
                <li>{t.homepage.benefit1}</li>
                <li>{t.homepage.benefit2}</li>
                <li>{t.homepage.benefit3}</li>
              </ul>
              
              <div className="info-box">
                <p className="info-text">
                  <strong>{t.homepage.clientZone}:</strong> {t.homepage.clientZoneText}
                </p>
                <p className="info-text">
                  <strong>{t.homepage.esipoUser}:</strong> {t.homepage.esipoText}
                </p>
                <a href="/" className="enter-app-link">
                  {t.homepage.enterApp}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default HomePage;