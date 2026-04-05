import React from 'react';

function LoginScreen({ loginName, password, errors, isLoading, t, onInputChange, onLogin }) {
  // Fonctions pour gérer les clics sur les liens
  const handleUnknownLoginClick = (e) => {
    e.preventDefault();
    // Ajoutez ici la logique pour "Nom d'utilisateur inconnu"
    console.log('Unknown login clicked');
    // Par exemple: ouvrir un modal, rediriger vers une page d'aide, etc.
  };

  const handleUnknownPasswordClick = (e) => {
    e.preventDefault();
    // Ajoutez ici la logique pour "Mot de passe oublié"
    console.log('Unknown password clicked');
    // Par exemple: ouvrir un modal de récupération de mot de passe
  };

  return (
    <>
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

      <div className="login-form">
        <div className="form-group">
          <label htmlFor="loginName">{t.loginName}</label>
          <input
            type="text"
            id="loginName"
            value={loginName}
            onChange={(e) => onInputChange('loginName', e.target.value)}
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
            onChange={(e) => onInputChange('password', e.target.value)}
            placeholder={t.password}
            className={errors.password ? 'input-error' : ''}
          />
        </div>

        <button onClick={onLogin} className="login-btn" disabled={isLoading}>
          {t.logIn}
        </button>
      </div>

      <div className="login-links">
        <button 
          onClick={handleUnknownLoginClick} 
          className="link-button"
        >
          {t.unknownLogin}
        </button>
        <span>|</span>
        <button 
          onClick={handleUnknownPasswordClick} 
          className="link-button"
        >
          {t.unknownPassword}
        </button>
      </div>
    </>
  );
}

export default LoginScreen;