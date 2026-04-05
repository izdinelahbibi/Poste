import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>© 2025 Česká pošta</p>
          <nav className="footer-links">
            <a href="/sitemap">Site map</a>
            <a href="/cookies">About Site and Cookies</a>
            <a href="/contacts">Contacts</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;