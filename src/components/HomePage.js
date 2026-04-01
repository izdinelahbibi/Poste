import React from 'react';
import Header from './Header';
import Footer from './Footer';
import LoginForm from './LoginForm';
import './HomePage.css';

function HomePage() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="homepage-grid">
            <div className="login-section">
              <LoginForm />
            </div>

            <div className="welcome-section">
              <h2 className="welcome-title">Login to get a lot of benefits!</h2>
              <ul className="benefits-list">
                <li>Easy access to consignments and their history</li>
                <li>Automatically filled out forms</li>
                <li>Simple archive of orders and services</li>
              </ul>
              
              <div className="info-box">
                <p className="info-text">
                  <strong>Are you a Client Zone user?</strong> Just enter your ordinary login details to enter.
                </p>
                <p className="info-text">
                  <strong>Are you an eSIPO user?</strong> Use the following link to enter the application:
                </p>
                <a href="#" className="enter-app-link">
                  Enter the application: Go to application.
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default HomePage;