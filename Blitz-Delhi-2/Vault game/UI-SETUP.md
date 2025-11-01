# 🎨 Vault Game UI Setup Guide

## Quick Start

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Application

You need three things running:

#### Terminal 1: Hardhat Node
```bash
npm run node
```

#### Terminal 2: Deploy Contract (one-time)
```bash
npm run deploy
```

Copy the contract address shown (default: `0x5FbDB2315678afecb367f032d93F642f64180aa3`)

#### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
```

The UI will open at `http://localhost:3000`

### 3. Connect Your Wallet

1. Make sure MetaMask is installed
2. Add the Hardhat network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. Import one of the test accounts from Hardhat (private keys are shown in the Hardhat node output)

4. Click "Connect Wallet" in the UI

## Using the UI

### Demo Mode (No MetaMask Required!)

You can play the game **without MetaMask** using pre-configured demo accounts:

1. Click the **"Demo Mode"** button in the header
2. Select from 5 pre-funded test accounts:
   - Account 1 (Owner)
   - Account 2 (Defender) 
   - Account 3 (Attacker)
   - Account 4
   - Account 5
3. Start playing immediately!

**Benefits of Demo Mode:**
- ✅ No MetaMask setup required
- ✅ Instant connection
- ✅ Pre-funded with test ETH
- ✅ Perfect for testing and demonstrations
- ✅ Session persists (remembers your selection)

**Note:** Demo mode requires Hardhat node running on `http://127.0.0.1:8545`

### Connect MetaMask (Alternative)

If you prefer using MetaMask:

1. Make sure MetaMask is installed
2. Add the Hardhat network (Chain ID: 1337)
3. Click "Connect Wallet"
4. Import test account private keys from Hardhat node output

### As a Defender (Create Vaults)

1. Click **"Create Vault"** tab
2. Choose challenge type:
   - **Code Challenge**: 4-digit number (0-9999)
   - **Hash Challenge**: String solution that gets hashed
3. Fill in the form:
   - Set your secret code/solution
   - Enter reward amount (minimum 0.1 ETH)
   - Set max attempts (1-10)
   - Set timeout (hours)
4. Click **"Create Vault"** and confirm in MetaMask

### As an Attacker (Crack Vaults)

1. View all vaults in the **"All Vaults"** tab
2. Filter vaults:
   - **All Vaults**: See everything
   - **Active**: Currently crackable
   - **Available to Attack**: No attacker yet
   - **My Vaults**: Vaults you created
3. Click **"Join as Attacker"** on an available vault
4. Pay the entry fee (confirm in MetaMask)
5. Click **"Make Attempt"** and enter your guess
6. Submit and wait for on-chain confirmation

### Viewing Vault Status

- **ACTIVE**: Currently in play
- **CRACKED**: Successfully solved
- **INACTIVE**: Expired or all attempts used

## Features

✅ **Real-time Updates**: Vault list refreshes every 10 seconds  
✅ **Wallet Integration**: Full MetaMask support  
✅ **Transaction Notifications**: Alerts for success/failure  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Beautiful UI**: Modern gradient design  

## Troubleshooting

### "Cannot connect to network"
- Make sure Hardhat node is running
- Check MetaMask is connected to Hardhat network (Chain ID 1337)

### "Insufficient funds"
- Import a test account with ETH from Hardhat node
- Or send ETH to your account

### "Contract not found"
- Verify contract is deployed: `npm run deploy`
- Check contract address in `frontend/src/utils/contract.js`

### Frontend won't start
- Make sure you're in the `frontend` directory
- Run `npm install` again
- Check Node.js version (v16+)

## Customization

### Change Contract Address

Edit `frontend/src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xYourContractAddress';
```

Or create `frontend/.env`:
```
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

### Change Network

Update Hardhat config for different networks, then update the contract address in the frontend.

## Build for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## Next Steps

- Deploy to a testnet (Sepolia, Mumbai, etc.)
- Update contract address for production
- Add more features (vault history, statistics, etc.)
- Customize styling

Enjoy playing the Vault Game! 🎮
