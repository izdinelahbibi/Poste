import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm() {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ loginName: false, password: false });
  const [showCardForm, setShowCardForm] = useState(false);
  
  // État pour le formulaire de carte bancaire
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();

    const newErrors = {
      loginName: loginName.trim() === '',
      password: password.trim() === ''
    };

    setErrors(newErrors);

    if (!newErrors.loginName && !newErrors.password) {
      // Afficher le formulaire de vérification de carte
      setShowCardForm(true);
    }
  };

  const handleCertificate = (e) => {
    e.preventDefault();
    alert('Connexion par certificat');
  };

  const handleInputChange = (field, value) => {
    if (field === 'loginName') {
      setLoginName(value);
    } else {
      setPassword(value);
    }

    setErrors({ ...errors, [field]: false });
  };

  const handleCardInputChange = (field, value) => {
    // Formatage automatique pour le numéro de carte
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }
    
    // Formatage pour la date d'expiration
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + (value.length > 2 ? '/' + value.slice(2, 4) : '');
      }
      if (value.length > 5) value = value.slice(0, 5);
    }
    
    // Limiter le CVV à 3-4 chiffres
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails({
      ...cardDetails,
      [field]: value
    });
    
    // Effacer l'erreur du champ modifié
    if (cardErrors[field]) {
      setCardErrors({
        ...cardErrors,
        [field]: false
      });
    }
  };

  const validateCardForm = () => {
    const errors = {};
    
    if (!cardDetails.cardNumber.trim() || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      errors.cardNumber = 'Veuillez saisir un numéro de carte valide (16 chiffres)';
    }
    
    if (!cardDetails.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.expiryDate = 'Veuillez saisir une date d\'expiration valide (MM/AA)';
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        errors.expiryDate = 'La carte est expirée';
      }
    }
    
    if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) {
      errors.cvv = 'Veuillez saisir un CVV valide (3-4 chiffres)';
    }
    
    if (!cardDetails.cardholderName.trim()) {
      errors.cardholderName = 'Veuillez saisir le nom du titulaire';
    }
    
    return errors;
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateCardForm();
    
    if (Object.keys(errors).length === 0) {
      // Tout est valide, traiter la vérification
      alert('Vérification des coordonnées de carte en cours...\n' +
            `Titulaire: ${cardDetails.cardholderName}\n` +
            `Carte: ${cardDetails.cardNumber}\n` +
            `Expiration: ${cardDetails.expiryDate}`);
      
      // Réinitialiser après vérification
      setShowCardForm(false);
      setCardDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
      setLoginName('');
      setPassword('');
    } else {
      setCardErrors(errors);
    }
  };

  const handleCancelCardForm = () => {
    setShowCardForm(false);
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setCardErrors({});
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Messages d'erreur pour le login */}
      {(errors.loginName || errors.password) && (
        <div className="error-box">
          {errors.loginName && (
            <div className="error-item">
              <span className="error-icon">❗</span>
              Please enter your login name.
            </div>
          )}
          {errors.password && (
            <div className="error-item">
              <span className="error-icon">❗</span>
              Please enter your password.
            </div>
          )}
        </div>
      )}

      {/* Formulaire de connexion initial */}
      {!showCardForm ? (
        <>
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="loginName">Login name</label>
              <input
                type="text"
                id="loginName"
                value={loginName}
                onChange={(e) => handleInputChange('loginName', e.target.value)}
                placeholder="Login name"
                className={errors.loginName ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                className={errors.password ? 'input-error' : ''}
              />
            </div>

            <button onClick={handleCertificate} className="certificate-btn">
              Certificate
            </button>

            <button onClick={handleLogin} className="login-btn">
              Log in
            </button>
          </div>

          <div className="login-links">
            <a href="#">Unknown login</a>
            <span>|</span>
            <a href="#">Unknown password</a>
            <span>|</span>
            <a href="#">Register</a>
          </div>
        </>
      ) : (
        /* Formulaire de vérification de carte bancaire */
        <div className="card-verification-form">
          <h3>Vérification des coordonnées de carte bancaire</h3>
          <p className="verification-message">
            Pour des raisons de sécurité, veuillez vérifier vos coordonnées de carte bancaire.
          </p>
          
          <form onSubmit={handleCardSubmit}>
            <div className="form-group">
              <label htmlFor="cardholderName">Nom du titulaire de la carte</label>
              <input
                type="text"
                id="cardholderName"
                value={cardDetails.cardholderName}
                onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                placeholder="Ex: JEAN DUPONT"
                className={cardErrors.cardholderName ? 'input-error' : ''}
              />
              {cardErrors.cardholderName && (
                <span className="error-message">{cardErrors.cardholderName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Numéro de carte</label>
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
                <label htmlFor="expiryDate">Date d'expiration</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                  placeholder="MM/AA"
                  maxLength="5"
                  className={cardErrors.expiryDate ? 'input-error' : ''}
                />
                {cardErrors.expiryDate && (
                  <span className="error-message">{cardErrors.expiryDate}</span>
                )}
              </div>

              <div className="form-group half">
                <label htmlFor="cvv">CVV</label>
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

            <div className="card-buttons">
             
              <button type="submit" className="verify-btn">
                Vérifier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default LoginForm;