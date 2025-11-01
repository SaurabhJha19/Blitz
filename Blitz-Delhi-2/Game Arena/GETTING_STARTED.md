# Getting Started Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
NETWORK_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

## Smart Contract Deployment

### Option 1: Using Hardhat

1. Install Hardhat:
   ```bash
   npm install --save-dev hardhat
   ```

2. Initialize Hardhat:
   ```bash
   npx hardhat init
   ```

3. Compile contracts:
   ```bash
   npx hardhat compile
   ```

4. Deploy to network:
   ```bash
   npx hardhat deploy --network sepolia
   ```

### Option 2: Using Remix

1. Go to https://remix.ethereum.org
2. Create new file: `rewardNFT.sol`
3. Copy the contract code
4. Compile the contract
5. Deploy to your preferred network

## Wallet Connection

1. Install MetaMask browser extension
2. Create or import a wallet
3. Switch to testnet (Sepolia, Goerli, etc.)
4. Get testnet ETH from faucets
5. Connect wallet in the game portal

## Game Instructions

### Aiming Battle 🎯
- Use mouse to aim
- Click to shoot targets
- Score 300+ points to win NFT

### Road Runner 🏃
- Press Space/Up to jump
- Double tap to double jump
- Score 500+ points to win NFT

### Color Match 🧩
- Click gems to swap
- Match 3 or more
- Score 2000+ points to win NFT

## Troubleshooting

### "Cannot connect to server"
- Make sure server is running: `npm start`
- Check if port 3000 is available
- Try `npm run dev` for auto-reload

### "MetaMask not found"
- Install MetaMask extension
- Refresh the page after installation

### "Transaction failed"
- Check if you have enough gas
- Verify network connection
- Check contract deployment

## Next Steps

- Deploy to production
- Add more games
- Implement leaderboards
- Create NFT marketplace
- Add social features

## Support

For issues or questions:
- Check the main README.md
- Open a GitHub issue
- Contact the development team

