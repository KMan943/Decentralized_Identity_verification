// src/pages/VerificationPanel.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../App'; 
import '../static/VerificationPanel.css';

const VerificationPanel = () => {
  const [identityHash, setIdentityHash] = useState('');
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
      // This is a simplified approach - in a real application, you would
      // need to query past events or have an indexing service
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
      
      // Clear the input field if it matches the verified hash
      if (identityHash === hash) {
        setIdentityHash('');
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
    if (!identityHash) return;
    
    await handleVerify(identityHash);
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
        
        {/* Rest of your component remains the same */}
        
        <div className="manual-verification-section">
          <h3>Verify by Hash</h3>
          <form onSubmit={handleManualVerify}>
            <div className="input-wrapper">
              <i className="icon">🔍</i>
              <input
                type="text"
                placeholder="Enter identity hash to verify"
                value={identityHash}
                onChange={(e) => setIdentityHash(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="verify-button"
              disabled={verifyLoading || !identityHash}
            >
              {verifyLoading ? 'Verifying...' : 'Verify Identity'}
            </button>
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
