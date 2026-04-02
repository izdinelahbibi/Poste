import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logoCP.png';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        
        <div className="logo">
          <img src={logo} alt="PoštaOnline" className="logo-image" />
        </div>

       <div className="nav-right">
  <Link to="/login" className="nav-link btn btn-login">Log in</Link>
</div>

      </div>
    </header>
  );
}

export default Header;