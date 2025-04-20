// src/pages/Home.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../App';
import '../static/Homepage.css';

const Homepage = () => {
  const { account, connectWallet } = useContext(Web3Context);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Decentralized Identity Verification</h1>
        <p className="subtitle">Secure, private, and blockchain-based identity management</p>
        
        <div className="wallet-section">
          {!account ? (
            <button className="connect-wallet-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-connected">
              <span className="wallet-address">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <Link to="/dashboard" className="dashboard-button">
                View Dashboard
              </Link>
            </div>
          )}
        </div>
        
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
        
        {/* {account && (
          <div className="dashboard-shortcut">
            <Link to="/dashboard" className="dashboard-link">
              Go to Dashboard →
            </Link>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Homepage;
