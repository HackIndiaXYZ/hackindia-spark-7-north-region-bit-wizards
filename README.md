# Decentralized Evidence Chain 



## 🚀 Overview
This project is a blockchain-based platform developed to address the problem of digital evidence tampering and lack of trust in verification systems.

It allows users to securely upload files, generate a SHA-256 cryptographic hash, and store proof of authenticity on the blockchain. By integrating IPFS for decentralized storage and smart contracts for immutable record-keeping, the system ensures that once evidence is recorded, it cannot be altered or disputed.

The platform also enables anyone to independently verify a file’s authenticity at any time, making it useful for journalism, investigations, and transparency-focused applications.

---

## 🎯 Problem Statement
In journalism and investigations, digital evidence can be altered, deleted, or disputed.

There is no easy way to:
- Prove originality of files
- Verify authenticity later
- Maintain trust without centralized control

---

## 💡 Solution
This Project solves this by:

1. Generating a SHA-256 hash of files on the client side  
2. Uploading files to IPFS Pinata (decentralized storage)  
3. Storing the hash + metadata on blockchain 
4. Allowing anyone to verify authenticity by re-hashing the file  

---

## 🛠 Tech Stack

### Frontend
- React.js  
- Ethers.js  

### Backend
- Node.js  
- Express.js  
- IPFS (for file storage)  

### Blockchain
- Solidity Smart Contract  
- Sepolia Testnet  

---

## ⚙️ How It Works

### Upload Flow
1. User selects a file  
2. File is hashed using SHA-256 in browser  
3. File is uploaded to IPFS → CID generated  
4. Hash + CID stored on blockchain  

### Verification Flow
1. User uploads file again  
2. System re-generates hash  
3. Smart contract checks if hash exists  
4. Returns authenticity result  

---

## 🔗 Smart Contract

- Address: `0x366C5AE2d6D9bbbFDc1e1379AE157C589556066b`  
- Network: `Sepolia Testnet`  

---

## 📂 Project Structure
- frontend/ → React application (UI + hashing + wallet connection)
- backend/ → Express server (IPFS upload + API)


---


## 🧪 How to Run Locally

### 1. Clone repository
```bash
git clone https://github.com/HackIndiaXYZ/hackindia-spark-7-north-region-bit-wizards.git
cd hackindia-spark-7-north-region-bit-wizards

```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
```

---

## ✨ Key Features

- 🔐 Client-side SHA-256 hashing  
- ⛓ Immutable blockchain storage  
- 🌐 IPFS decentralized file storage  
- ✅ Instant verification system  
- 📜 Transparent evidence timeline  


## 🚀 Future Improvements

- User authentication system  
- Role-based access (journalist/admin)  
- AI-based evidence classification  
- Mobile responsiveness  
- Multi-chain support  