# 🚀 Quick Start Guide

Get up and running with Vault Game in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Compile Contracts

```bash
npm run compile
```

This will compile your Solidity contracts and check for any errors.

## Step 3: Run Tests

```bash
npm test
```

Verify everything works correctly with the test suite.

## Step 4: Start Local Blockchain

In one terminal, start a local Hardhat node:

```bash
npm run node
```

This starts a local blockchain on `http://127.0.0.1:8545` with test accounts pre-funded with ETH.

## Step 5: Deploy Contract

In another terminal, deploy the contract:

```bash
npm run deploy
```

You'll see output like:
```
✅ VaultGame deployed successfully!
📋 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Step 6: Interact with the Contract (Optional)

You can use the example interaction script to see the game in action:

```bash
# Set the contract address (from deployment)
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Run interaction script
npx hardhat run scripts/interact.js
```

## 🎮 Playing the Game

### As a Defender (Create a Vault)

```javascript
const { ethers } = require("hardhat");

// Connect to your deployed contract
const vaultGame = await ethers.getContractAt("VaultGame", CONTRACT_ADDRESS);

// Create a code challenge vault
const codeChallenge = 5678; // Your secret code
const reward = ethers.parseEther("1.0"); // 1 ETH reward
const maxAttempts = 5;
const timeout = 3600; // 1 hour

const tx = await vaultGame.createVaultWithCode(
  codeChallenge,
  maxAttempts,
  timeout,
  { value: reward }
);

const receipt = await tx.wait();
console.log("Vault created!");
```

### As an Attacker (Crack a Vault)

```javascript
// Join the vault
const entryFee = await vaultGame.minimumEntryFee();
await vaultGame.joinAsAttacker(vaultId, { value: entryFee });

// Try to crack it
await vaultGame.attemptCode(vaultId, 5678); // Your guess
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [test/VaultGame.test.js](test/VaultGame.test.js) for more examples
- Deploy to a testnet (Sepolia, Mumbai, etc.) for real-world testing

## 🐛 Troubleshooting

**Compilation errors?**
- Make sure all dependencies are installed: `npm install`
- Check Solidity version compatibility

**Deployment failed?**
- Ensure your local node is running
- Check you have enough balance in your test account

**Tests failing?**
- Run `npm run compile` first
- Make sure you're using the correct Hardhat version

## 💡 Tips

- Use the Hardhat console for interactive testing: `npx hardhat console`
- Enable auto-completion in your IDE for better development experience
- Check contract events using `vaultGame.queryFilter()` to track game actions

Happy gaming! 🎮
