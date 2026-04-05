// src/utils/antiBot.js

let loginStartTime = null;
let firstKeyPressTime = null;
let keyPressCount = 0;
let mouseMovements = 0;
let interactionCount = 0;
let suspiciousPatterns = 0;
let visibilityChanges = 0;

// Start timer when page loads
const startTimer = () => {
  loginStartTime = Date.now();
  firstKeyPressTime = null;
  keyPressCount = 0;
  mouseMovements = 0;
  interactionCount = 0;
  suspiciousPatterns = 0;
  visibilityChanges = 0;
  console.log('⏰ Timer started at:', loginStartTime);
};

// Track typing with better metrics
const trackTyping = () => {
  keyPressCount++;
  if (firstKeyPressTime === null) {
    firstKeyPressTime = Date.now();
    console.log('⌨️ First key press at:', firstKeyPressTime);
  }
  
  // Detect suspicious patterns
  if (keyPressCount > 50 && (Date.now() - firstKeyPressTime) < 2000) {
    suspiciousPatterns++;
    console.log('⚠️ Suspicious: Too many keys in short time');
  }
  
  console.log('⌨️ Key press count:', keyPressCount);
};

// Track mouse movements (humans move mouse, bots often don't)
const trackInteraction = () => {
  mouseMovements++;
  interactionCount++;
  
  // Humans typically have mouse movements before typing
  if (mouseMovements === 1 && keyPressCount === 0) {
    console.log('🖱️ Mouse movement detected before typing');
  }
};

// Track page visibility (bots often run in background)
const trackVisibility = () => {
  if (document.hidden) {
    visibilityChanges++;
    console.log('👁️ Page hidden - possible human behavior');
  }
};

// Add visibility change listener
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', trackVisibility);
}

// Check for browser automation
const detectAutomation = () => {
  const automationIndicators = [];
  
  // Check for common automation properties
  if (typeof navigator !== 'undefined' && navigator.webdriver === true) automationIndicators.push('webdriver');
  if (typeof window !== 'undefined') {
    if (window.callPhantom || window._phantom) automationIndicators.push('phantomjs');
    if (window.__webdriver_evaluate) automationIndicators.push('webdriver_evaluate');
    if (window.__selenium_evaluate) automationIndicators.push('selenium_evaluate');
    if (window.__webdriver_script_function) automationIndicators.push('webdriver_script');
    if (window.__webdriver_script_func) automationIndicators.push('webdriver_script_func');
    if (window.__webdriver_script_fn) automationIndicators.push('webdriver_script_fn');
    if (window.__fxdriver_evaluate) automationIndicators.push('fxdriver_evaluate');
    if (window.__driver_unwrapped) automationIndicators.push('driver_unwrapped');
    if (window.__webdriver_unwrapped) automationIndicators.push('webdriver_unwrapped');
    if (window.__selenium_unwrapped) automationIndicators.push('selenium_unwrapped');
    if (window.__webdriver_wdcb) automationIndicators.push('webdriver_wdcb');
  }
  
  return automationIndicators;
};

// Check for human-like behavior
const isHumanBehavior = () => {
  const timeOnPage = (Date.now() - loginStartTime) / 1000;
  const hasMouseMovement = mouseMovements > 0;
  const hasReasonableTypingSpeed = checkTypingSpeed();
  const hasVisibilityChanges = visibilityChanges > 0;
  const hasInteractions = interactionCount > 3;
  
  // Human characteristics:
  // 1. Takes time to read page (at least 2 seconds)
  // 2. Has mouse movements
  // 3. Types at reasonable speed
  // 4. Might switch tabs (visibility changes)
  // 5. Has multiple interactions
  
  const humanScore = [
    timeOnPage >= 2,
    hasMouseMovement,
    hasReasonableTypingSpeed,
    hasVisibilityChanges,
    hasInteractions
  ].filter(Boolean).length;
  
  console.log(`👤 Human behavior score: ${humanScore}/5`);
  
  return humanScore >= 2; // At least 2 human characteristics
};

// Check typing speed with human limits
const checkTypingSpeed = () => {
  if (keyPressCount === 0) return true; // No typing is fine
  
  const timeSpent = (Date.now() - firstKeyPressTime) / 1000;
  if (timeSpent === 0) return false;
  
  const speed = keyPressCount / timeSpent;
  
  // Human typing speeds:
  // Slow: 2-3 keys/sec (hunt and peck)
  // Average: 4-6 keys/sec (typical typist)
  // Fast: 7-9 keys/sec (expert typist)
  // Superhuman: 10+ keys/sec (bot or cheating)
  
  const isHumanSpeed = speed <= 9.5; // Allow expert typists
  const isMinimumTyping = keyPressCount >= 3 ? speed > 0.5 : true; // At least half a key per second if typed
  
  console.log(`⚡ Typing speed: ${speed.toFixed(1)} keys/sec - ${isHumanSpeed ? 'HUMAN' : 'BOT'}`);
  
  return isHumanSpeed && isMinimumTyping;
};

// Main check - Multi-factor bot detection
const checkAntiBot = () => {
  // Check if timer was started
  if (loginStartTime === null) {
    console.log('⚠️ Anti-bot timer not started, starting now...');
    startTimer();
  }
  
  // Check for automation tools
  const automationIndicators = detectAutomation();
  if (automationIndicators.length > 0) {
    console.log('🚫 BOT DETECTED: Automation indicators found:', automationIndicators);
    return { 
      passed: false, 
      reason: `Automation detected: ${automationIndicators.join(', ')}`,
      isBot: true 
    };
  }
  
  // Check for suspicious patterns
  if (suspiciousPatterns > 2) {
    console.log('🚫 BOT DETECTED: Multiple suspicious typing patterns');
    return { 
      passed: false, 
      reason: 'Suspicious typing patterns detected',
      isBot: true 
    };
  }
  
  // If user never interacted, might be bot or very fast human
  if (keyPressCount === 0 && mouseMovements === 0) {
    const timeOnPage = (Date.now() - loginStartTime) / 1000;
    
    // If page loaded and immediately submitted without any interaction
    if (timeOnPage < 1) {
      console.log('🚫 BOT DETECTED: No interaction and very fast submission');
      return { 
        passed: false, 
        reason: 'No human interaction detected',
        isBot: true 
      };
    }
    
    console.log('✅ No interaction but reasonable time - PASS');
    return { passed: true, reason: 'No typing required' };
  }
  
  // Check typing speed
  const hasReasonableSpeed = checkTypingSpeed();
  if (!hasReasonableSpeed && keyPressCount >= 3) {
    console.log('🚫 BOT DETECTED: Unreasonable typing speed');
    const timeSpent = (Date.now() - firstKeyPressTime) / 1000;
    const speed = keyPressCount / timeSpent;
    return { 
      passed: false, 
      reason: `Typing speed too ${speed > 10 ? 'fast' : 'slow'}: ${speed.toFixed(1)} keys/sec`,
      isBot: true 
    };
  }
  
  // Check for human-like behavior
  const isHuman = isHumanBehavior();
  if (!isHuman && keyPressCount > 0) {
    console.log('🚫 BOT DETECTED: Missing human behavior patterns');
    return { 
      passed: false, 
      reason: 'Missing human behavior patterns',
      isBot: true 
    };
  }
  
  console.log('✅ Human behavior confirmed - PASS');
  return { 
    passed: true, 
    reason: `Human verified - ${keyPressCount} keys, ${mouseMovements} mouse movements`,
    isBot: false 
  };
};

// Reset everything
const resetAntiBot = () => {
  loginStartTime = null;
  firstKeyPressTime = null;
  keyPressCount = 0;
  mouseMovements = 0;
  interactionCount = 0;
  suspiciousPatterns = 0;
  visibilityChanges = 0;
  console.log('🔄 Anti-bot reset');
};

// Cleanup function to remove event listener
const cleanupAntiBot = () => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', trackVisibility);
  }
  resetAntiBot();
};

export {
  startTimer,
  trackInteraction,
  trackTyping,
  checkAntiBot,
  resetAntiBot,
  cleanupAntiBot
};