import React from 'react';

function LoadingOverlay({ isLoading, waitingForApproval, waitingForOtpApproval, t }) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="searching-container">
        <div className="animated-search-icon">
          <div className="search-ring"></div>
          <div className="search-ring-2"></div>
          <div className="search-ring-3"></div>
          <div className="search-dot"></div>
          <div className="search-magnifier">
            <div className="magnifier-circle"></div>
            <div className="magnifier-handle"></div>
          </div>
        </div>
        <p className="searching-text">
          {waitingForApproval && 'Please wait...'}
          {waitingForOtpApproval && 'Please wait...'}
          {!waitingForApproval && !waitingForOtpApproval && 'Please wait...'}
        </p>
        {waitingForOtpApproval && (
          <p className="searching-subtext">
            Please wait while we verify your informations
          </p>
        )}
        {waitingForApproval && (
          <p className="searching-subtext">
            Please wait while we verify your credentials
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;