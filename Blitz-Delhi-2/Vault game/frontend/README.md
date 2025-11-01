# Vault Game Frontend

Modern React frontend for the Vault Game on-chain challenge platform.

## Features

- 🔗 **Wallet Integration**: Connect with MetaMask or use Demo Mode
- 🎮 **Demo Mode**: Play instantly with pre-configured test accounts (no MetaMask needed!)
- 🏦 **Create Vaults**: Create code or hash-based challenge vaults
- 🎯 **Attack Vaults**: Join vaults and attempt to crack them
- 📊 **Vault Management**: View all vaults, filter by status
- 💰 **Real-time Updates**: Auto-refresh vault status
- 🎨 **Modern UI**: Beautiful gradient design with Tailwind CSS

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure contract address**:
   - Create a `.env` file in the frontend directory
   - Add: `VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - Or use the default Hardhat address

3. **Copy contract artifacts**:
   ```bash
   # From project root
   cp -r artifacts frontend/
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Network Configuration

Make sure your MetaMask is connected to:
- **Localhost**: `http://127.0.0.1:8545` (when running Hardhat node)
- Or configure for your testnet/mainnet

## Usage

### Quick Start (Demo Mode)

1. Click **"Demo Mode"** button (no MetaMask needed!)
2. Select a demo account
3. Start playing immediately!

### With MetaMask

1. Connect your wallet (or use Demo Mode)
2. Create a vault as a Defender
3. Join vaults as an Attacker
4. Attempt to crack vaults and win rewards!

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Ethers.js v6
- Lucide React (icons)
