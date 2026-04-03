// src/utils/antiBot.js

let loginStartTime = null;
let userInteracted = false;
let keyPressCount = 0;

// Start timer when page loads
const startTimer = () => {
  loginStartTime = Date.now();
  console.log('⏰ Timer started');
};

// Check if form was filled too fast
const checkTimer = () => {
  if (!loginStartTime) {
    return { valid: false, reason: 'No timer' };
  }
  
  const timeSpent = (Date.now() - loginStartTime) / 1000;
  console.log(`Time spent: ${timeSpent} seconds`);
  
  if (timeSpent < 2) {
    return { valid: false, reason: `Too fast: ${timeSpent}s` };
  }
  
  return { valid: true, reason: `Normal: ${timeSpent}s` };
};

// Track user interaction (touch or mouse)
const trackInteraction = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', () => { userInteracted = true; });
    window.addEventListener('mousemove', () => { userInteracted = true; });
    window.addEventListener('click', () => { userInteracted = true; });
  }
};

// Check if user interacted
const checkInteraction = () => {
  if (!userInteracted) {
    return { valid: false, reason: 'No interaction' };
  }
  return { valid: true, reason: 'Interaction detected' };
};

// Track typing
const trackTyping = () => {
  keyPressCount++;
};

// Check if user typed
const checkTyping = () => {
  if (keyPressCount < 2) {
    return { valid: false, reason: 'No typing detected' };
  }
  return { valid: true, reason: 'Typing detected' };
};

// Main check
const checkAntiBot = () => {
  const timer = checkTimer();
  const interaction = checkInteraction();
  const typing = checkTyping();
  
  const allValid = timer.valid && interaction.valid && typing.valid;
  
  return {
    passed: allValid,
    details: { timer, interaction, typing }
  };
};

// Reset everything
const resetAntiBot = () => {
  loginStartTime = null;
  userInteracted = false;
  keyPressCount = 0;
};

export {
  startTimer,
  checkTimer,
  trackInteraction,
  checkInteraction,
  trackTyping,
  checkTyping,
  checkAntiBot,
  resetAntiBot
};