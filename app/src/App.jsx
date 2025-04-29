// App.jsx
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useState, useEffect, createContext} from 'react';
import { ethers } from 'ethers';
import Homepage from './pages/Homepage';
import MainLayout from './pages/MainLayout';
import Register from './pages/Register';
import VerifierLogin from './pages/VerifierLogin';
import VerificationPanel from './pages/VerificationPanel';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import contractABI from '../../backend/artifacts/contracts/Box.sol/IdentityVerification.json';

// Create Web3 Context
export const Web3Context = createContext(null);

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isVerifier, setIsVerifier] = useState(false);

  // Initialize Web3 connection
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Connect to provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Initialize contract
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(
              import.meta.env.VITE_CONTRACT_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3',
              contractABI.abi,
              signer
            );
            setContract(contractInstance);
            
            // Check if account is the verifier
            try {
              const contractVerifier = await contractInstance.verifier();
              console.log("Contract verifier:", contractVerifier);
              console.log("Current account:", accounts[0]);
              
              // Compare addresses in a case-insensitive way
              const isAccountVerifier = 
                contractVerifier.toLowerCase() === accounts[0].toLowerCase();
              
              setIsVerifier(isAccountVerifier);
              console.log("Is verifier:", isAccountVerifier);
            } catch (verifierError) {
              console.error("Failed to check verifier status:", verifierError);
              setIsVerifier(false);
            }
          }
        } catch (error) {
          console.error("Web3 initialization error:", error);
        }
      }
    };

    
    initWeb3();
    
    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Check verifier status after connecting
        if (contract) {
          checkVerifierStatus(accounts[0], contract);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask to use this application");
    }
  };
  
  const checkVerifierStatus = async (address, contractInstance) => {
    if (address && contractInstance) {
      try {
        const verifierStatus = await contractInstance.isVerified(address);
        setIsVerifier(verifierStatus);
      } catch (error) {
        console.error("Failed to check verifier status:", error);
        setIsVerifier(false);
      }
    } else {
      setIsVerifier(false);
    }
  };

  // Defining routes with Web3 context
  const router = createBrowserRouter([
    {
      path: "/", 
      element: <MainLayout />, 
      children: [
        {
          path: "/",
          element: <Homepage />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/verifier-login",
          element: <VerifierLogin />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/verification-panel",
          element: <ProtectedRoute element={<VerificationPanel />} verifierOnly={true} />,
        }
      ]
    },
  ]);

  // Web3 context value
  const web3ContextValue = {
    account,
    contract,
    provider,
    isVerifier,
    connectWallet,
  };

  return (
    <Web3Context.Provider value={web3ContextValue}>
      <RouterProvider router={router} />
    </Web3Context.Provider>
  );
};

export default App;
