import React from 'react';

function LoginScreen({ loginName, password, errors, isLoading, t, onInputChange, onLogin }) {
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
        <a href="#">{t.unknownLogin}</a>
        <span>|</span>
        <a href="#">{t.unknownPassword}</a>
      </div>
    </>
  );
}

export default LoginScreen;