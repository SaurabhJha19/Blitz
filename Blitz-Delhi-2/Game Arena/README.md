# 🎮 Monad Blitz 2 - Web3 Game Arena

A cutting-edge Web3 gaming platform where players compete in three exciting games to earn NFT rewards! Built with modern web technologies and blockchain integration.

## 🌟 Features

### 🎯 Three Engaging Games

1. **Aiming Battle** 🎯
   - Genre: First-person shooter
   - Difficulty: Hard
   - Objective: Shoot moving targets as they appear from all sides
   - Win Condition: Score 300 points in 60 seconds
   - Features:
     - Dynamic target spawning
     - Increasing difficulty
     - Precision aiming mechanics

2. **Road Runner** 🏃
   - Genre: Endless runner
   - Difficulty: Medium
   - Objective: Jump over obstacles and collect power-ups
   - Win Condition: Score 500 points in 60 seconds
   - Features:
     - Double jump mechanics
     - Multiple obstacle types
     - Power-up collection
     - Progressive difficulty

3. **Color Match** 🧩
   - Genre: Puzzle/match-3
   - Difficulty: Easy
   - Objective: Match 3 or more gems to score points
   - Win Condition: Score 2000 points in 2 minutes
   - Features:
     - Cascading gem drops
     - Combo multipliers
     - Strategic matching

### 🏆 NFT Rewards

- **Unique NFTs**: Mint exclusive NFTs when you win
- **On-chain Storage**: All game data stored on blockchain
- **Achievement System**: Different NFTs for different games
- **Collectible Series**: Build your gaming achievement collection

### 🔗 Web3 Integration

- **MetaMask Support**: Connect your Ethereum wallet
- **Smart Contracts**: Deploy and interact with NFT contracts
- **Decentralized Rewards**: Transparent and verifiable

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- A Web3 wallet with testnet ETH (for deployment)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd "Monad Blitz 2"
```

2. Install dependencies
```bash
npm install
```

3. Install OpenZeppelin contracts (for smart contract development)
```bash
cd "Game Arena/Contracts"
npm install @openzeppelin/contracts
cd ../..
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

### Smart Contract Deployment

1. Configure your environment variables:
   - Create a `.env` file in the root directory
   - Add your private key or mnemonic (for testing only!)
   - Configure network RPC endpoints

2. Compile and deploy the contract:
```bash
npx hardhat compile
npx hardhat deploy --network <your-network>
```

3. Update the contract address in your server configuration

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection
2. **Choose Game**: Click on any of the three game cards
3. **Play & Win**: Achieve the target score within the time limit
4. **Claim NFT**: If you win, click "Claim NFT Reward" to mint your NFT

### Game Controls

- **Aiming Battle**: 
  - Mouse: Aim and click to shoot
  
- **Road Runner**: 
  - Space / Up Arrow / W: Jump
  - Double Jump: Jump again while in the air
  
- **Color Match**: 
  - Click: Select a gem
  - Click adjacent gem: Swap and match

## 📁 Project Structure

```
Game Arena/
├── index.html              # Main HTML portal
├── style.css               # Global styles
├── app.js                  # Main application logic
├── README.md               # This file
│
├── Game/                   # Game implementations
│   ├── triggeredBattle.js  # Aiming/Shooting game
│   ├── RoadRunner.js       # Jumping/Running game
│   └── Puzzle.js           # Puzzle/Match-3 game
│
├── Contracts/              # Smart contracts
│   └── rewardNFT.sol       # NFT reward contract
│
└── Server/                 # Backend server
    ├── index.js            # Express server setup
    └── routes/
        └── mint.js         # NFT minting API

```

## 🔧 Technologies Used

### Frontend
- **HTML5 Canvas**: For game rendering
- **JavaScript (ES6+)**: Game logic and interactivity
- **CSS3**: Modern responsive design
- **Ethers.js**: Web3 wallet integration

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server
- **CORS**: Cross-origin resource sharing

### Blockchain
- **Solidity**: Smart contract development
- **OpenZeppelin**: Battle-tested contract libraries
- **ERC-721**: NFT standard
- **Ethereum**: Blockchain network

## 🎨 Features & Design

- **Modern UI**: Gradient backgrounds, smooth animations
- **Responsive Design**: Works on desktop and tablet
- **Real-time Stats**: Live score and timer updates
- **Game Over Screens**: Beautiful modal presentations
- **Loading States**: Visual feedback for async operations

## 🔐 Security Considerations

- ✅ Smart contract follows best practices
- ✅ Access control with OpenZeppelin's Ownable
- ✅ Prevents duplicate NFT claims for same game
- ✅ Input validation on all user actions
- ⚠️ Store private keys securely
- ⚠️ Use environment variables for sensitive data

## 🌐 Deployment

### Frontend Deployment

Host on any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- IPFS

### Backend Deployment

Deploy to cloud services:
- Heroku
- Railway
- Digital Ocean
- AWS EC2

### Smart Contract Deployment

Use deployment frameworks:
- Hardhat
- Truffle
- Foundry

Deploy to networks:
- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- BSC

## 🚧 Future Enhancements

- [ ] Leaderboard with blockchain storage
- [ ] Tournament mode
- [ ] Multiplayer functionality
- [ ] More game variants
- [ ] NFT marketplace integration
- [ ] Staking mechanisms
- [ ] Governance tokens
- [ ] Mobile app development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Ethers.js team for Web3 integration
- All game developers and testers

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the Web3 gaming community**

🎮 Play now at: `http://localhost:3000`
