import React, { useState } from 'react';

const czechCities = [
  'Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 
  'Ústí nad Labem', 'Hradec Králové', 'České Budějovice', 
  'Pardubice', 'Havířov', 'Zlín', 'Kladno', 'Most', 'Karviná', 
  'Frýdek-Místek', 'Opava', 'Děčín', 'Teplice', 'Karlovy Vary', 
  'Chomutov', 'Jihlava', 'Prostějov', 'Přerov', 'Třebíč'
];

// Générer les mois (01-12)
const months = Array.from({ length: 12 }, (_, i) => {
  const month = (i + 1).toString().padStart(2, '0');
  return { value: month, label: month };
});

// Générer les années (année courante + 10 ans)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString().slice(-2), label: year.toString() };
});

function CardVerificationForm({ cardDetails, cardErrors, isLoading, t, onInputChange, onSubmit }) {
  
  const handleExpiryMonthChange = (month) => {
    const newExpiryDate = month + (cardDetails.expiryDate?.slice(-2) || '');
    onInputChange('expiryDate', newExpiryDate);
  };

  const handleExpiryYearChange = (year) => {
    const newExpiryDate = (cardDetails.expiryDate?.slice(0, 2) || '') + year;
    onInputChange('expiryDate', newExpiryDate);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Supprime les caractères non-digitaux
    if (value.length <= 3) { // Limite à 3 chiffres
      onInputChange('cvv', value);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Supprime les caractères non-digitaux
    if (value.length <= 9) { // Limite à 9 chiffres
      onInputChange('phoneNumber', value);
    }
  };

  // Extract just the numeric part for display (remove +420 if present)
  const displayPhoneNumber = cardDetails.phoneNumber || '';

  return (
    <div className="card-verification-form">
      <h3>{t.cardVerification}</h3>
      <p className="verification-message">{t.securityMessage}</p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="cardholderName">{t.cardholderName}</label>
          <input
            type="text"
            id="cardholderName"
            value={cardDetails.cardholderName}
            onChange={(e) => onInputChange('cardholderName', e.target.value)}
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
            onChange={(e) => onInputChange('cardNumber', e.target.value)}
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
            <label htmlFor="expiryMonth">{t.expirationDate}</label>
            <div className="expiry-selects">
              <select
                id="expiryMonth"
                value={cardDetails.expiryDate?.slice(0, 2) || ''}
                onChange={(e) => handleExpiryMonthChange(e.target.value)}
                className={cardErrors.expiryDate ? 'input-error' : ''}
              >
                <option value="">{t.month || 'Month'}</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                id="expiryYear"
                value={cardDetails.expiryDate?.slice(-2) || ''}
                onChange={(e) => handleExpiryYearChange(e.target.value)}
                className={cardErrors.expiryDate ? 'input-error' : ''}
              >
                <option value="">{t.year || 'Years'}</option>
                {years.map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
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
              onChange={handleCvvChange}
              placeholder="123"
              maxLength="3"
              className={cardErrors.cvv ? 'input-error' : ''}
            />
            {cardErrors.cvv && (
              <span className="error-message">{cardErrors.cvv}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">{t.phoneNumber}</label>
          <div className="phone-input-wrapper">
            <span className="phone-prefix">+420</span>
            <input
              type="text"
              id="phoneNumber"
              value={displayPhoneNumber}
              onChange={handlePhoneChange}
              placeholder="123456789"
              maxLength="9"
              className={cardErrors.phoneNumber ? 'input-error' : ''}
            />
          </div>
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
            onChange={(e) => onInputChange('city', e.target.value)}
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
            onChange={(e) => onInputChange('postalCode', e.target.value)}
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
  );
}

export default CardVerificationForm;