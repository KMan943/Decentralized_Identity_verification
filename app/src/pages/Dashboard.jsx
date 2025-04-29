// Dashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../App';
import { ethers } from 'ethers';
import '../static/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { 
    account, 
    contract, 
    provider, 
    connectWallet 
  } = useContext(Web3Context);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [registeredIdentities, setRegisteredIdentities] = useState([]);
  const [name, setName] = useState('');
  const [documentHash, setDocumentHash] = useState('');
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
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading contract data:", error);
        setStatusMessage(`Error: ${error.message}`);
        setLoading(false);
      }
    };

    loadContractData();
  }, [contract, account]);

  const generateIdentityHash = () => {
    if (!name || !documentHash) {
      setStatusMessage("Please enter both name and document hash");
      return false;
    }
  
    try {
      // Using solidityPackedKeccak256 to generate hash
      const generatedHash = ethers.solidityPackedKeccak256(
        ['string', 'string'],
        [name, documentHash]
      );
      
      setIdentityHash(generatedHash);
      setStatusMessage("Identity hash generated successfully");
      return true;
    } catch (error) {
      console.error("Error generating identity hash:", error);
      setStatusMessage(`Error: ${error.message}`);
      return false;
    }
  };
  
  const checkIdentityStatus = async () => {
    if (!account || !contract) {
      setStatusMessage("Please connect your wallet first");
      return;
    }
    
    // Generate identity hash if not already done
    if (!identityHash) {
      const hashGenerated = generateIdentityHash();
      if (!hashGenerated) return;
    }
    
    try {
      setStatusMessage("Checking identity status...");
      setIdentityStatus(null);
      
      // Check if registered
      const isRegistered = await contract.registered(identityHash);
      
      if (isRegistered.toString() !== "1") {
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
      <div className="dash-dashboard-container loading">
        <div className="dash-loader"></div>
        <p>Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="dash-dashboard-container">
      <header className="dash-dashboard-header">
        <h1>Dashboard</h1>
        <div className="dash-account-info">
          {account ? (
            <div>
              <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
              <p className="dash-account-type">
                {account.toLowerCase() === verifierAddress.toLowerCase() 
                  ? 'Verifier Account' 
                  : 'User Account'}
              </p>
            </div>
          ) : (
            <button className="dash-connect-button" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      {statusMessage && (
        <div className={`dash-status-message ${statusMessage.includes('Error') ? 'error' : 'success'}`}>
          {statusMessage}
        </div>
      )}

      <div className="dash-dashboard-content">
        <div className="dash-dashboard-section">
          <h2>Check Identity Status</h2>
          <div className="dash-form-group">
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
            />
          </div>
          <div className="dash-form-group">
            <label htmlFor="documentHash">Document Hash:</label>
            <input 
              type="text" 
              id="documentHash" 
              value={documentHash} 
              onChange={(e) => setDocumentHash(e.target.value)} 
              placeholder="Enter document hash"
            />
          </div>
          {identityHash && (
            <div className="dash-form-group">
              <label>Generated Identity Hash:</label>
              <div className="dash-hash-display">
                {identityHash.substring(0, 10)}...{identityHash.substring(identityHash.length - 8)}
                <button 
                  className="dash-copy-button" 
                  onClick={() => {
                    navigator.clipboard.writeText(identityHash);
                    setStatusMessage("Identity hash copied to clipboard");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
          <div className="dash-button-group">
            <button 
              className="dash-action-button dash-generate-button" 
              onClick={generateIdentityHash}
              disabled={!account || !name || !documentHash}
            >
              Generate Identity Hash
            </button>
            <button 
              className="dash-action-button dash-check-button" 
              onClick={checkIdentityStatus}
              disabled={!account || (!identityHash && (!name || !documentHash))}
            >
              Check Status
            </button>
          </div>
          
          {identityStatus && (
            <div className="dash-status-result">
              <h3>Status Result:</h3>
              <div className="dash-status-details">
                <p>
                  <span className="dash-status-label">Registration:</span> 
                  <span className={`dash-status-value ${identityStatus.registered ? 'dash-status-positive' : 'dash-status-negative'}`}>
                    {identityStatus.registered ? 'Registered' : 'Not Registered'}
                  </span>
                </p>
                {identityStatus.registered && (
                  <p>
                    <span className="dash-status-label">Verification:</span> 
                    <span className={`dash-status-value ${identityStatus.verified ? 'dash-status-positive' : 'dash-status-pending'}`}>
                      {identityStatus.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </p>
                )}
              </div>
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

export default Dashboard;
