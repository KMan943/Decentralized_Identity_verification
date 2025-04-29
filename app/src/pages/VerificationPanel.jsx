// src/pages/VerificationPanel.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../App'; 
import { ethers } from 'ethers';
import '../static/VerificationPanel.css';

const VerificationPanel = () => {
  const [formData, setFormData] = useState({
    name: '',
    documentHash: ''
  });
  const [generatedHash, setGeneratedHash] = useState('');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { account, contract } = useContext(Web3Context);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is the verifier
    const checkVerifierAccess = async () => {
      if (!contract || !account) return;
      
      try {
        const contractVerifier = await contract.verifier();
        if (contractVerifier.toLowerCase() !== account.toLowerCase()) {
          navigate('/verifier-login');
        }
      } catch (error) {
        console.error("Failed to check verifier access:", error);
        navigate('/verifier-login');
      }
    };
    
    checkVerifierAccess();
    
    // Load pending verifications when component mounts
    loadPendingVerifications();
    
    // Set up event listener for new registrations
    if (contract) {
      const identityRegisteredFilter = contract.filters.IdentityRegistered();
      const identityVerifiedFilter = contract.filters.IdentityVerified();
      
      contract.on(identityRegisteredFilter, (hash) => {
        console.log("New identity registered:", hash);
        loadPendingVerifications();
      });
      
      contract.on(identityVerifiedFilter, (hash) => {
        console.log(`Identity ${hash} verified`);
        loadPendingVerifications();
      });
      
      // Clean up event listeners when component unmounts
      return () => {
        contract.off(identityRegisteredFilter);
        contract.off(identityVerifiedFilter);
      };
    }
  }, [contract, account, navigate]);

  const loadPendingVerifications = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const filter = contract.filters.IdentityRegistered();
      const events = await contract.queryFilter(filter);
      
      // Process events to get unique identity hashes
      const pendingHashes = [];
      for (const event of events) {
        const hash = event.args[0]; // Get the identity hash from the event
        
        // Check if this identity is already verified
        const isVerified = await contract.isVerified(hash);
        if (!isVerified) {
          pendingHashes.push(hash);
        }
      }
      
      setPendingVerifications(pendingHashes);
    } catch (error) {
      console.error("Failed to load pending verifications:", error);
      setMessage({
        text: "Failed to load pending verifications. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear the generated hash when inputs change
    setGeneratedHash('');
  };

  const generateIdentityHash = () => {
    if (!formData.name || !formData.documentHash) {
      setMessage({
        text: "Please enter both name and document hash",
        type: "error"
      });
      return;
    }

    try {
      // Using solidityPackedKeccak256 to generate the hash
      const hash = ethers.solidityPackedKeccak256(
        ['string', 'string'],
        [formData.name, formData.documentHash]
      );
      
      setGeneratedHash(hash);
      setMessage({
        text: "Identity hash generated successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error generating identity hash:", error);
      setMessage({
        text: `Error: ${error.message}`,
        type: "error"
      });
    }
  };

  const handleVerify = async (hash) => {
    setVerifyLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      
      const tx = await contract.verifyIdentity(hash);
      await tx.wait();
      
      setMessage({
        text: `Identity ${hash.substring(0, 10)}... verified successfully!`,
        type: "success"
      });
      
      // Refresh the list of pending verifications
      loadPendingVerifications();
      
      // Clear the form and generated hash
      if (generatedHash === hash) {
        setFormData({ name: '', documentHash: '' });
        setGeneratedHash('');
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setMessage({
        text: error.reason || error.message || "Verification failed. Please try again.",
        type: "error"
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!generatedHash) {
      generateIdentityHash();
      return;
    }
    
    await handleVerify(generatedHash);
  };

  return (
    <div className="verification-panel-container">
      <div className="verification-panel-card">
        <div className="verification-panel-header">
          <h2>Identity Verification Panel</h2>
          <p>Authorized verifier can confirm user identities</p>
        </div>
        
        <div className="verifier-status">
          <div className="status-badge">Authorized Verifier</div>
          <p className="connected-address">
            Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
          </p>
        </div>
        
        <div className="manual-verification-section">
          <h3>Verify Identity</h3>
          <form onSubmit={handleManualVerify}>
            <div className="input-wrapper">
              <i className="icon">👤</i>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-wrapper">
              <i className="icon">🔐</i>
              <input
                type="text"
                name="documentHash"
                placeholder="Enter document hash"
                value={formData.documentHash}
                onChange={handleInputChange}
              />
            </div>
            
            {generatedHash && (
              <div className="generated-hash-display">
                <span className="hash-label">Generated Identity Hash:</span>
                <span className="hash-value">
                  {`${generatedHash.substring(0, 10)}...${generatedHash.substring(generatedHash.length - 8)}`}
                </span>
              </div>
            )}
            
            <div className="button-group">
              <button 
                type="button" 
                className="generate-button"
                onClick={generateIdentityHash}
                disabled={!formData.name || !formData.documentHash}
              >
                Generate Hash
              </button>
              <button 
                type="submit" 
                className="verify-button"
                disabled={verifyLoading || !generatedHash}
              >
                {verifyLoading ? 'Verifying...' : 'Verify Identity'}
              </button>
            </div>
          </form>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="pending-verifications-section">
          <div className="section-header">
            <h3>Pending Verifications</h3>
            <button 
              className="refresh-button"
              onClick={loadPendingVerifications}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Loading pending verifications...</div>
          ) : pendingVerifications.length > 0 ? (
            <ul className="pending-list">
              {pendingVerifications.map((hash, index) => (
                <li key={index} className="pending-item">
                  <div className="hash-display">
                    <span className="hash-label">Hash:</span>
                    <span className="hash-value">{`${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`}</span>
                  </div>
                  <button
                    className="verify-button small"
                    onClick={() => handleVerify(hash)}
                    disabled={verifyLoading}
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No pending verifications found</p>
            </div>
          )}
        </div>
        
        <div className="back-link">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;
