import React, { useState, useEffect, useCallback } from 'react';
import './CaptchaVerification.css';

function CaptchaVerification({ onSuccess }) {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');

  // Dessiner le CAPTCHA sur canvas
  const drawCaptcha = useCallback((code) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    // Fond avec dégradé
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ajouter des lignes parasites
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Ajouter des points parasites
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Dessiner les chiffres avec style
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillStyle = '#1f2937';
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    
    // Positionner chaque chiffre avec une rotation aléatoire
    code.split('').forEach((char, index) => {
      const x = 30 + (index * 30);
      const y = 40 + Math.random() * 10;
      const rotation = (Math.random() - 0.5) * 0.3;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Ajouter du bruit visuel
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
      ctx.fillText(
        String.fromCharCode(65 + Math.random() * 26),
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
    }

    setCaptchaImage(canvas.toDataURL());
  }, []);

  // Générer un code CAPTCHA aléatoire à 6 chiffres
  const generateCaptcha = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(code);
    drawCaptcha(code);
  }, [drawCaptcha]);

  const handleVerify = () => {
    if (userInput === captchaCode) {
      setError('');
      onSuccess(); // Appeler la fonction pour afficher le login
    } else {
      setError('Code CAPTCHA incorrect. Veuillez réessayer.');
      generateCaptcha(); // Générer un nouveau CAPTCHA
      setUserInput('');
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
    setUserInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  return (
    <div className="captcha-overlay">
      <div className="captcha-container">
        <div className="captcha-card">
          <h3 className="captcha-title">Vérification de sécurité</h3>
          
          <div className="captcha-image-container">
            <img src={captchaImage} alt="CAPTCHA" className="captcha-image" />
            <button 
              onClick={handleRefresh} 
              className="refresh-btn"
              title="Rafraîchir"
            >
              🔄
            </button>
          </div>

          <p className="captcha-instruction">
            Veuillez entrer les chiffres affichés ci-dessus :
          </p>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Entrez le code"
            className="captcha-input"
            maxLength={6}
            autoFocus
          />

          {error && <div className="captcha-error">{error}</div>}

          <button onClick={handleVerify} className="captcha-confirm-btn">
            Confirmer
          </button>

          <p className="captcha-note">
            <small>Code composé de 6 chiffres</small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CaptchaVerification;