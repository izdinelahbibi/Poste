import React from 'react';
import Header from './Header';
import Footer from './Footer';
import LoginForm from './LoginForm';
import { useLanguage } from '../hooks/useLanguage';
import './HomePage.css';

function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="homepage-grid">
            <div className="login-section">
              <LoginForm />
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
                <a href="#" className="enter-app-link">
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