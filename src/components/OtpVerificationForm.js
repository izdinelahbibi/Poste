import React from 'react';

function OtpVerificationForm({ otpCode, otpError, isLoading, t, onOtpChange, onSubmit, onBack }) {
  return (
    <div className="otp-verification-form">
      <h3>{t.twoFactor}</h3>
      <p className="verification-message">{t.enterOtp}</p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="otpCode">{t.otpCode}</label>
          <input
            type="text"
            id="otpCode"
            value={otpCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              onOtpChange(value);
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
          <button type="button" onClick={onBack} className="back-btn">
            {t.back}
          </button>
          <button type="submit" className="verify-btn" disabled={isLoading}>
            {isLoading ? t.verifying : t.verifyCode}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OtpVerificationForm;