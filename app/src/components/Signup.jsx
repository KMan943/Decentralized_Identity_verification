import React, { useState } from 'react';
import { ethers } from 'ethers';
import './SignupForm.css';

const Signup = ( { contract } ) => {

    const [formData, setFormData] = useState({
    name: '',
    documentHash: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value
    });
    };

    const generateIdentityHash = () => {
    // Using keccak256 to hash the combined data
    return ethers.utils.solidityKeccak256(
        ['string', 'string'],
        [formData.name, formData.documentHash]
    );
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
        // Generate hash client-side for privacy
        const identityHash = generateIdentityHash();
        
        // Call the smart contract function
        const tx = await contract.registerIdentity(identityHash);
        await tx.wait();
        
        setMessage({
        text: 'Identity registered successfully! Your identity hash is: ' + identityHash.substring(0, 10) + '...',
        type: 'success'
        });
        
        // Reset form after successful submission
        setFormData({ name: '', documentHash: '' });
    } catch (error) {
        console.error('Registration error:', error);
        setMessage({
        text: error.reason || 'Registration failed. Please try again.',
        type: 'error'
        });
    } finally {
        setLoading(false);
    }
    };

    return (
        <div className="signup-container">
        <div className="signup-card">
            <div className="signup-header">
            <h2>Register Your Identity</h2>
            <p>Your data is hashed locally for privacy</p>
            </div>
            
            <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                <i className="icon">👤</i>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                />
                </div>
                <small className="field-info">
                Your name is hashed before being sent to the blockchain
                </small>
            </div>
            
            <div className="form-group">
                <label htmlFor="documentHash">Document Hash</label>
                <div className="input-wrapper">
                <i className="icon">🔐</i>
                <input
                    type="text"
                    id="documentHash"
                    name="documentHash"
                    value={formData.documentHash}
                    onChange={handleChange}
                    placeholder="Enter your document hash"
                    required
                />
                </div>
                <small className="field-info">
                This should be a hash of your identity document (passport, ID, etc.)
                </small>
            </div>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                {message.text}
                </div>
            )}
            
            <button 
                type="submit" 
                className="register-button"
                disabled={loading || !formData.name || !formData.documentHash}
            >
                {loading ? 'Processing...' : 'Register Identity'}
            </button>
            </form>
            
            <div className="privacy-notice">
            <p>
                <strong>Privacy Notice:</strong> Your personal information is never stored directly on the blockchain. 
                We only store a cryptographic hash of your data, which cannot be reversed to reveal your original information.
            </p>
            </div>
        </div>
        </div>
    )
}

export default Signup