import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import BlockedPage from './components/BlockedPage';
import NextStepAppr from './components/NextStepAppr';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/nextstepappr" element={<NextStepAppr />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 