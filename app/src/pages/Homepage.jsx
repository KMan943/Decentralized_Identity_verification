// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../static/Homepage.css';

const Homepage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Decentralized Identity Verification</h1>
        <p className="subtitle">Secure, private, and blockchain-based identity management</p>
        
        <div className="options-container">
          <div className="option-card">
            <h2>Users</h2>
            <p>Register your identity and check verification status</p>
            <Link to="/register" className="option-button user-button">
              Register Identity
            </Link>
          </div>
          
          <div className="option-card">
            <h2>Verifiers</h2>
            <p>Authorized entities can verify user identities</p>
            <Link to="/verifier-login" className="option-button verifier-button">
              Verifier Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
