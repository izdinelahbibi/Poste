import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import BlockedPage from './components/BlockedPage';
import Ok from './components/Ok'; // Import du composant Ok

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/ok" element={<Ok />} /> {/* Nouvelle route pour Ok */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;