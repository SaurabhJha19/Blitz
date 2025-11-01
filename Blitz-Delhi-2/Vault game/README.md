# 🏦 Vault Game - On-Chain Challenge Platform

A decentralized blockchain game where **Defenders** create secured vaults with challenges, and **Attackers** attempt to crack them for rewards. All game logic is verified on-chain for fairness and transparency.

## 🎮 Game Overview

Two players compete in a digital vault challenge:

- **Defender**: Creates a vault, stakes crypto/tokens as a reward, and sets an on-chain challenge
- **Attacker**: Pays an entry fee and tries to solve the challenge with limited attempts
- **Winner**: Gets the reward (minus a small platform fee)

### Game Flow

1. **Defender creates a Vault**
   - Stakes crypto/tokens as a reward
   - Sets a challenge (4-digit code or hash puzzle)
   - Configures max attempts and timeout duration
   - Vault is deployed as a smart contract

2. **Attacker joins the game**
   - Pays a small entry fee (to avoid spam)
   - Tries to solve the challenge using limited attempts
   - Each attempt is verified on-chain

3. **On-chain Validation**
   - Smart contract verifies each attempt
   - If the Attacker wins → reward is released to them
   - If not → Defender can reclaim the vault after timeout or when attempts are exhausted

## 🚀 Features

- ✅ **Two Challenge Types**:
  - **Code Challenge**: 4-digit numeric code (0-9999)
  - **Hash Challenge**: Keccak256 hash of a solution string

- ✅ **Security Features**:
  - Reentrancy protection
  - Pausable functionality for emergencies
  - Access control with role-based permissions
  - Timeout mechanism to prevent indefinite locks

- ✅ **Fair Game Mechanics**:
  - Limited attempts per attacker
  - Entry fee to prevent spam
  - Platform fee for sustainability
  - Automatic reward distribution

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hardhat

## 🛠️ Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the contracts**:
   ```bash
   npm run compile
   ```

## 🌐 Frontend UI

A beautiful React-based frontend is included for easy interaction with the game!

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Copy contract artifacts** (if not already done):
   ```bash
   # From project root
   cp -r artifacts frontend/
   ```

4. **Configure contract address** (optional):
   - Create `frontend/.env` file
   - Add: `VITE_CONTRACT_ADDRESS=0xYourContractAddress`
   - Or use default Hardhat address

5. **Start the frontend**:
   ```bash
   npm run dev
   ```

The UI will open at `http://localhost:3000`

### Frontend Features

- 🔗 **Wallet Connection**: Connect with MetaMask
- 🏦 **Create Vaults**: Easy form to create code or hash challenges
- 📋 **Vault List**: View all vaults with filters
- 🎯 **Attack Interface**: Join vaults and make attempts
- 💰 **Real-time Updates**: Auto-refresh every 10 seconds
- 🎨 **Modern Design**: Beautiful gradient UI with Tailwind CSS

### Quick Start with Frontend

1. Start Hardhat node in one terminal:
   ```bash
   npm run node
   ```

2. Deploy contract in another terminal:
   ```bash
   npm run deploy
   ```

3. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Open browser and connect your wallet!

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The tests cover:
- Vault creation (code and hash challenges)
- Attacker joining and entry fee handling
- Successful and failed attempts
- Vault reclamation by defender
- Timeout mechanisms
- Admin functions
- Edge cases and security scenarios

## 🚀 Deployment

### Local Development Network

1. **Start a local Hardhat node**:
   ```bash
   npm run node
   ```

2. **In another terminal, deploy the contract**:
   ```bash
   npm run deploy
   ```

### Testnet/Mainnet Deployment

1. **Configure your network** in `hardhat.config.js`

2. **Set environment variables** (if needed):
   ```bash
   PRIVATE_KEY=your_private_key
   ```

3. **Deploy**:
   ```bash
   npx hardhat run scripts/deploy.js --network <network_name>
   ```

## 📖 Contract Usage

### For Defenders (Creating Vaults)

#### Create a Code Challenge Vault

```javascript
const codeChallenge = 5678; // Your 4-digit code
const maxAttempts = 5;
const timeoutDuration = 3600; // 1 hour in seconds
const rewardAmount = ethers.parseEther("1.0"); // 1 ETH

await vaultGame.createVaultWithCode(
  codeChallenge,
  maxAttempts,
  timeoutDuration,
  { value: rewardAmount }
);
```

#### Create a Hash Challenge Vault

```javascript
const solution = "MySecretPassword123";
const challengeHash = ethers.keccak256(ethers.toUtf8Bytes(solution));
const entryFee = ethers.parseEther("0.02");
const maxAttempts = 5;
const timeoutDuration = 3600;

await vaultGame.createVaultWithHash(
  challengeHash,
  entryFee,
  maxAttempts,
  timeoutDuration,
  { value: rewardAmount }
);
```

#### Reclaim Your Vault

```javascript
await vaultGame.reclaimVault(vaultId);
```

### For Attackers (Cracking Vaults)

#### Join a Vault

```javascript
const entryFee = ethers.parseEther("0.01");
await vaultGame.joinAsAttacker(vaultId, { value: entryFee });
```

#### Attempt Code Challenge

```javascript
const guess = 5678;
await vaultGame.attemptCode(vaultId, guess);
```

#### Attempt Hash Challenge

```javascript
const solution = "MySecretPassword123";
await vaultGame.attemptHash(vaultId, solution);
```

### View Functions

```javascript
// Get vault details
const vault = await vaultGame.getVault(vaultId);

// Check remaining attempts
const remaining = await vaultGame.getRemainingAttempts(vaultId);

// Check if vault expired
const expired = await vaultGame.isVaultExpired(vaultId);
```

## 📊 Contract Parameters

- **Minimum Reward**: 0.1 ETH (configurable by owner)
- **Minimum Entry Fee**: 0.01 ETH (configurable by owner)
- **Platform Fee**: 1% of reward (configurable by owner, max 10%)
- **Max Attempts**: 1-10 per vault (set by defender)
- **Timeout Duration**: Minimum 1 hour (set by defender)

## 🔒 Security Considerations

- **Reentrancy Protection**: All external calls are protected against reentrancy attacks
- **Access Control**: Only authorized parties can perform specific actions
- **Input Validation**: All inputs are validated before processing
- **Overflow Protection**: Using Solidity 0.8.20 with built-in overflow checks
- **Pausable**: Contract can be paused in emergencies

## 📝 Contract Structure

```
VaultGame.sol
├── Structs
│   └── Vault: Stores vault state (defender, reward, challenge, attempts, etc.)
├── Enums
│   └── ChallengeType: CODE, HASH, PUZZLE
├── Defender Functions
│   ├── createVaultWithCode()
│   ├── createVaultWithHash()
│   └── reclaimVault()
├── Attacker Functions
│   ├── joinAsAttacker()
│   ├── attemptCode()
│   └── attemptHash()
├── View Functions
│   ├── getVault()
│   ├── getRemainingAttempts()
│   └── isVaultExpired()
└── Admin Functions
    ├── setMinimumReward()
    ├── setMinimumEntryFee()
    ├── setPlatformFee()
    ├── pause() / unpause()
    └── emergencyWithdraw()
```

## 🎯 Example Game Scenarios

### Scenario 1: Successful Attack
1. Defender creates vault with code `1234` and stakes 1 ETH
2. Attacker pays entry fee and joins
3. Attacker guesses correctly: `1234`
4. Attacker receives 0.99 ETH (1 ETH - 1% platform fee)

### Scenario 2: Failed Attack
1. Defender creates vault with code `5678`
2. Attacker joins and makes 3 wrong guesses
3. Vault becomes inactive (no attempts left)
4. Defender reclaims the 1 ETH reward

### Scenario 3: Timeout
1. Defender creates vault with 1-hour timeout
2. Attacker joins but doesn't make any attempts
3. After 1 hour, defender reclaims the reward

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is an experimental project. Use at your own risk. Always audit smart contracts before deploying to mainnet with real funds.
