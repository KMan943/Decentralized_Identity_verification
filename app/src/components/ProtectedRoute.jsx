import { useLocation, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../App';

const ProtectedRoute = ({ element, verifierOnly = false }) => {
  const location = useLocation();
  const { account, contract } = useContext(Web3Context);
  const [isVerifier, setIsVerifier] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkVerifierStatus = async () => {
      if (!contract || !account) {
        setIsVerifier(false);
        setLoading(false);
        return;
      }
      
      try {
        const contractVerifier = await contract.verifier();
        const isAccountVerifier = contractVerifier.toLowerCase() === account.toLowerCase();
        setIsVerifier(isAccountVerifier);
      } catch (error) {
        console.error("Failed to check verifier status:", error);
        setIsVerifier(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkVerifierStatus();
  }, [contract, account]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!account) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (verifierOnly && !isVerifier) {
    return <Navigate to="/verifier-login" replace />;
  }
  
  return element;
};

export default ProtectedRoute;
