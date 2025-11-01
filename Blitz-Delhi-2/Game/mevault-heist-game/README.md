# Vault Heist Game

Welcome to the Vault Heist Game project! This project is a decentralized game built using React and Hardhat, where players can create vaults, attack them, and compete on a leaderboard.

## Project Structure

The project is organized as follows:

```
mevault-heist-game
├── public                # Public assets
├── src                   # Source code for the React application
│   ├── assets            # Static assets (images, etc.)
│   ├── components        # React components
│   │   ├── CreateVault.jsx
│   │   ├── VaultList.jsx
│   │   ├── AttackVault.jsx
│   │   ├── Leaderboard.jsx
│   │   └── Navigation.jsx
│   ├── config            # Configuration files
│   │   └── wagmi.config.js
│   ├── contracts         # Smart contract ABIs
│   │   └── abis
│   │       ├── VaultHeist.json
│   │       └── VaultBadge.json
│   ├── styles            # CSS styles
│   │   └── App.css
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Entry point for React
│   └── index.css         # Global styles
├── contracts             # Smart contracts
│   ├── VaultHeist.sol
│   └── VaultBadge.sol
├── scripts               # Deployment scripts
│   └── deploy.js
├── test                  # Test files
├── hardhat.config.js     # Hardhat configuration
├── package.json          # NPM configuration
├── vite.config.js        # Vite configuration
└── README.md             # Project documentation
```

## Getting Started

To get started with the Vault Heist Game, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mevault-heist-game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Deploy the smart contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.