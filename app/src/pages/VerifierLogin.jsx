// src/pages/VerifierLogin.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../App'; 
import '../static/VerifierLogin.css';

const VerifierLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract, account } = useContext(Web3Context);
  const navigate = useNavigate();

  const checkVerifierStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!account) {
        throw new Error('Please connect your wallet first');
      }
      
      if (!contract) {
        throw new Error('Contract not initialized. Please refresh the page and try again.');
      }
      
      console.log("Contract object:", contract);
      
      // Get the verifier address from the contract
      const contractVerifier = await contract.verifier();
      console.log("Contract verifier:", contractVerifier);
      console.log("Current account:", account);
      
      // Compare addresses in a case-insensitive way
      const isVerifier = contractVerifier.toLowerCase() === account.toLowerCase();
      console.log("Is verifier:", isVerifier);
      
      if (isVerifier) {
        navigate('/verification-panel');
      } else {
        setError('This account is not authorized as the verifier');
      }
    } catch (error) {
      console.error('Verification check failed:', error);
      setError(error.message || 'Failed to check verifier status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verifier-login-container">
      <div className="verifier-login-card">
        <h2>Verifier Login</h2>
        <p>Connect your wallet to access the verification panel</p>
        
        {!account ? (
          <div className="connect-wallet-section">
            <p>You need to connect your wallet to continue</p>
            <button 
              className="connect-wallet-button"
              onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="wallet-connected-section">
            <p className="connected-address">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button 
              className="verify-access-button"
              onClick={checkVerifierStatus}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Access Verification Panel'}
            </button>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="back-link">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifierLogin;
