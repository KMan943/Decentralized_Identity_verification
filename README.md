# Decentralized Identity Verification

## *Team: Third Level*
- Mani      230001050
- Rohan     230001069
- Parth     230001062
- Maahir    230041019
- Kushagra  230041017
- Pranav    230005026


A decentralized identity verification system leveraging blockchain technology to provide secure, user-controlled digital identity management. This project aims to address privacy, security, and compliance challenges by eliminating reliance on centralized authorities and giving users full control over their personal data.

---

**Table of Contents**
- Overview
- Features
- Technology Stack
- Folder Structure
- Installation & Setup
- Usage
- Contributing
- License

---

## **Overview**

This project implements a decentralized identity verification system using blockchain (with Solidity smart contracts) and a web application frontend. It allows users to create, manage, and verify digital identities in a trustless environment, supporting use cases such as KYC compliance, secure document signing, and interoperability with decentralized applications (dApps).

---

## **Features**

- **Decentralized Identity Registration**: Users create unique decentralized identifiers (DIDs) linked to their public keys and service endpoints, stored immutably on the blockchain.
- **KYC Compliance Integration**: DIDs can be marked as verified, with compliance status recorded on-chain for tamper-proof verification.
- **DID Resolution**: Retrieve DID documents for third-party verification without exposing sensitive data.
- **Digital Signature Verification**: Verify digital signatures against registered DIDs to ensure authenticity and integrity of documents and messages.
- **User-Controlled Privacy**: Users decide what data to share, reducing risks of data breaches and misuse.

---

## **Technology Stack**

- **Ethereum Blockchain**: Stores DIDs and verification data.
- **Solidity**: Smart contract development.
- **JavaScript/CSS/HTML**: Web application frontend.
- **(Optional) React/Ethers.js**: For enhanced DApp UI and blockchain interaction.
- **Remix IDE**: For smart contract deployment and testing.

---

## **Folder Structure**

```
Decentralized_Identity_verification/
├── app/         # Frontend application
├── backend/     # Backend logic and smart contracts
```
*Languages used: JavaScript, CSS, Solidity, HTML*

---

## **Installation & Setup**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/KMan943/Decentralized_Identity_verification.git
   cd Decentralized_Identity_verification
   ```

2. **Install Dependencies**
   - For the frontend (`app/`), install required packages (e.g., with `npm install`).
   - For smart contracts, use Remix IDE or your preferred Solidity development environment.

3. **Deploy Smart Contracts**
   - Open the smart contract files in Remix IDE.
   - Compile and deploy to an Ethereum testnet (e.g., Sepolia, Goerli) or a local blockchain (e.g., Ganache).

4. **Configure Environment**
   - Set up environment variables or configuration files as needed for blockchain endpoints and contract addresses.

5. **Running the Dapp**
   - Open 3 terminals and do the following in them
   - Terminal 1
   ```bash
   cd backend
   npx hardhat run scripts/deploy.js --network localhost
   ```
   - Terminal 2
   ```bash
   cd backend
   npx hardhat node
   ```
   - Terminal 3
   ```bash
   cd app
   npm run dev
   ```
   - The website will then be run on the localhost port 5173 by default
---

## **Usage**

- **Register a DID**: Use the frontend to create a new decentralized identity, which will be recorded on the blockchain.
- **Verify Identity**: Submit documents for verification; once approved, the status is updated on-chain.
- **Resolve a DID**: Retrieve a DID's public information and verification status for third-party verification.

---
