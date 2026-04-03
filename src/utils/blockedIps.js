// src/utils/blockedIps.js

// Store blocked IPs in localStorage
const STORAGE_KEY = 'blocked_ips';

export const getBlockedIPs = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addBlockedIP = (ip) => {
  const blockedIPs = getBlockedIPs();
  if (!blockedIPs.includes(ip)) {
    blockedIPs.push(ip);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blockedIPs));
  }
};

export const isIPBlocked = (ip) => {
  const blockedIPs = getBlockedIPs();
  return blockedIPs.includes(ip);
};