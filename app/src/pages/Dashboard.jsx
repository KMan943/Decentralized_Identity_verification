// Dashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../App';
import { ethers } from 'ethers';
import '../static/Dashboard.css';

const Dashboard = () => {
  const { 
    account, 
    contract, 
    provider, 
    connectWallet 
  } = useContext(Web3Context);

  const [loading, setLoading] = useState(true);
  const [registeredIdentities, setRegisteredIdentities] = useState([]);
  const [identityHash, setIdentityHash] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [verifierAddress, setVerifierAddress] = useState('');
  const [identityStatus, setIdentityStatus] = useState(null);

  useEffect(() => {
    const loadContractData = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get the verifier address from the contract
        const contractVerifier = await contract.verifier();
        setVerifierAddress(contractVerifier);
        
        // In a real implementation, we would use events to get registered identities
        // For this example, we'll use a mock implementation
        // This would be replaced with actual blockchain event queries
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading contract data:", error);
        setStatusMessage(`Error: ${error.message}`);
        setLoading(false);
      }
    };

    loadContractData();
  }, [contract, account]);

  const checkIdentityStatus = async () => {
    if (!account || !contract) {
      setStatusMessage("Please connect your wallet first");
      return;
    }
    
    if (!identityHash) {
      setStatusMessage("Please enter an identity hash to check");
      return;
    }
    
    try {
      setStatusMessage("Checking identity status...");
      setIdentityStatus(null);
      
      // Check if registered
      const isRegistered = await contract.registered(identityHash);
      
      if (isRegistered !== 1) {
        setStatusMessage("This identity is not registered");
        setIdentityStatus({
          registered: false,
          verified: false
        });
        return;
      }
      
      // Check if verified
      const verified = await contract.isVerified(identityHash);
      
      setIdentityStatus({
        registered: true,
        verified: verified
      });
      
      setStatusMessage(`Identity status checked successfully`);
    } catch (error) {
      console.error("Error checking identity status:", error);
      setStatusMessage(`Error: ${error.message}`);
      setIdentityStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container loading">
        <div className="loader"></div>
        <p>Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Decentralized Identity Verification</h1>
        <div className="account-info">
          {account ? (
            <div>
              <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
              <p className="account-type">
                {account.toLowerCase() === verifierAddress.toLowerCase() 
                  ? 'Verifier Account' 
                  : 'User Account'}
              </p>
            </div>
          ) : (
            <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      {statusMessage && (
        <div className={`status-message ${statusMessage.includes('Error') ? 'error' : 'success'}`}>
          {statusMessage}
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Check Identity Status</h2>
          <div className="form-group">
            <label htmlFor="identityHash">Identity Hash:</label>
            <input 
              type="text" 
              id="identityHash" 
              value={identityHash} 
              onChange={(e) => setIdentityHash(e.target.value)} 
              placeholder="Enter identity hash to check"
            />
          </div>
          <button 
            className="action-button check-button" 
            onClick={checkIdentityStatus}
            disabled={!account || !identityHash}
          >
            Check Status
          </button>
          
          {identityStatus && (
            <div className="status-result">
              <h3>Status Result:</h3>
              <div className="status-details">
                <p>
                  <span className="status-label">Registration:</span> 
                  <span className={`status-value ${identityStatus.registered ? 'status-positive' : 'status-negative'}`}>
                    {identityStatus.registered ? 'Registered' : 'Not Registered'}
                  </span>
                </p>
                {identityStatus.registered && (
                  <p>
                    <span className="status-label">Verification:</span> 
                    <span className={`status-value ${identityStatus.verified ? 'status-positive' : 'status-pending'}`}>
                      {identityStatus.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Your Registered Identities</h2>
          {registeredIdentities.length > 0 ? (
            <div className="identities-list">
              {registeredIdentities.map((identity, index) => (
                <div key={index} className="identity-card">
                  <div className="identity-hash">
                    {identity.hash.substring(0, 10)}...{identity.hash.substring(identity.hash.length - 6)}
                  </div>
                  <div className={`identity-status ${identity.isVerified ? 'status-verified' : 'status-pending'}`}>
                    {identity.isVerified ? 'Verified' : 'Pending Verification'}
                  </div>
                  <div className="identity-date">
                    Registered: {new Date(identity.timestamp * 1000).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No identities registered yet. Use the registration form to register your identity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
