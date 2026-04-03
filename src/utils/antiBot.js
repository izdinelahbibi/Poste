// src/utils/antiBot.js

let loginStartTime = null;
let firstKeyPressTime = null;
let keyPressCount = 0;

// Start timer when page loads
const startTimer = () => {
  loginStartTime = Date.now();
  firstKeyPressTime = null;
  keyPressCount = 0;
  console.log('⏰ Timer started at:', loginStartTime);
};

// Track typing
const trackTyping = () => {
  keyPressCount++;
  if (firstKeyPressTime === null) {
    firstKeyPressTime = Date.now();
    console.log('⌨️ First key press at:', firstKeyPressTime);
  }
  console.log('⌨️ Key press count:', keyPressCount);
};

// Main check - ONLY checks typing speed
const checkAntiBot = () => {
  // If user never typed anything, don't block
  if (keyPressCount === 0) {
    console.log('✅ No typing - PASS');
    return { passed: true, reason: 'No typing' };
  }
  
  // Calculate time from first key press to now
  const timeSpent = (Date.now() - firstKeyPressTime) / 1000;
  console.log(`⏱️ Time from first key: ${timeSpent.toFixed(2)} seconds`);
  console.log(`⌨️ Total keys pressed: ${keyPressCount}`);
  
  // Calculate typing speed (keys per second)
  const speed = keyPressCount / timeSpent;
  console.log(`⚡ Typing speed: ${speed.toFixed(1)} keys/second`);
  
  // BLOCK if: typed more than 3 keys AND speed > 10 keys/second (too fast)
  // Normal human: 3-5 keys/second
  // Bot: 20+ keys/second
  if (keyPressCount >= 3 && speed > 10) {
    console.log('🚫 BOT DETECTED: Typing too fast!');
    return { 
      passed: false, 
      reason: `Typing too fast: ${speed.toFixed(1)} keys/sec`,
      isBot: true 
    };
  }
  
  console.log('✅ Human typing speed - PASS');
  return { passed: true, reason: `Normal speed: ${speed.toFixed(1)} keys/sec` };
};

// Track user interaction (touch or mouse)
const trackInteraction = () => {
  // Not needed for this version, but kept for compatibility
};

// Reset everything
const resetAntiBot = () => {
  loginStartTime = null;
  firstKeyPressTime = null;
  keyPressCount = 0;
  console.log('🔄 Anti-bot reset');
};

export {
  startTimer,
  trackInteraction,
  trackTyping,
  checkAntiBot,
  resetAntiBot
};