// src/components/BlockedPage.js
import React from 'react';
import './BlockedPage.css';

function BlockedPage() {
  return (
    <div className="blocked-container">
      <div className="blocked-content">
        <div className="blocked-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>Your IP address has been blocked.</p>
        <p>Please contact support if you believe this is an error.</p>
        <hr />
        <p className="error-code">Error 403 - Forbidden</p>
      </div>
    </div>
  );
}

export default BlockedPage;