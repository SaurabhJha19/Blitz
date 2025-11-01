// Main Application Controller
class GameArena {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.currentGame = null;
        this.scoreUpdateInterval = null;
        
        this.games = [
            {
                id: 'triggeredBattle',
                name: 'Aiming Battle',
                icon: '🎯',
                description: 'Shoot targets as they appear. Score 300 points to win an NFT!',
                difficulty: 'Hard',
                file: 'triggeredBattle.js',
                class: TriggeredBattle
            },
            {
                id: 'roadRunner',
                name: 'Road Runner',
                icon: '🏃',
                description: 'Jump over obstacles and collect power-ups. Score 500 points to win!',
                difficulty: 'Medium',
                file: 'RoadRunner.js',
                class: RoadRunner
            },
            {
                id: 'puzzle',
                name: 'Color Match',
                icon: '🧩',
                description: 'Match 3 or more gems to score points. Reach 2000 points to win!',
                difficulty: 'Easy',
                file: 'Puzzle.js',
                class: Puzzle
            }
        ];
        
        this.init();
    }
    
    async init() {
        this.setupElements();
        this.setupEventListeners();
        this.renderGameGrid();
        
        // Check if MetaMask is installed
        if (window.ethereum) {
            console.log('MetaMask detected');
        } else {
            console.warn('MetaMask not detected - please install MetaMask extension');
        }
    }
    
    setupElements() {
        this.elements = {
            connectWallet: document.getElementById('connectWallet'),
            walletInfo: document.getElementById('walletInfo'),
            gameGrid: document.getElementById('gameGrid'),
            gameContainer: document.getElementById('gameContainer'),
            gameCanvas: document.getElementById('gameCanvas'),
            gameTitle: document.getElementById('gameTitle'),
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            gameOver: document.getElementById('gameOver'),
            finalScore: document.getElementById('finalScore'),
            rewardMessage: document.getElementById('rewardMessage'),
            claimNFT: document.getElementById('claimNFT'),
            playAgain: document.getElementById('playAgain'),
            backToMenu: document.getElementById('backToMenu'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };
    }
    
    setupEventListeners() {
        this.elements.connectWallet.addEventListener('click', () => this.connectWallet());
        this.elements.backToMenu.addEventListener('click', () => this.backToMenu());
        this.elements.playAgain.addEventListener('click', () => this.playAgain());
        this.elements.claimNFT.addEventListener('click', () => this.claimNFT());
    }
    
    async connectWallet() {
        if (!window.ethereum) {
            alert('Please install MetaMask to connect your wallet!\n\nDownload from: https://metamask.io');
            window.open('https://metamask.io', '_blank');
            return;
        }
        
        try {
            console.log('Requesting account access...');
            
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Accounts received:', accounts);
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }
            
            // Initialize provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            
            console.log('Connected to:', this.userAddress);
            
            // Update UI
            this.elements.connectWallet.classList.add('hidden');
            this.elements.walletInfo.classList.remove('hidden');
            this.elements.walletInfo.textContent = `Connected: ${this.userAddress.substring(0, 6)}...${this.userAddress.substring(this.userAddress.length - 4)}`;
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
                console.log('Accounts changed:', newAccounts);
                if (newAccounts.length > 0) {
                    this.userAddress = newAccounts[0];
                    this.elements.walletInfo.textContent = `Connected: ${this.userAddress.substring(0, 6)}...${this.userAddress.substring(this.userAddress.length - 4)}`;
                } else {
                    // User disconnected
                    this.elements.connectWallet.classList.remove('hidden');
                    this.elements.walletInfo.classList.add('hidden');
                    this.userAddress = null;
                }
            });
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            
            // Provide specific error messages
            if (error.code === 4001) {
                alert('Connection rejected. Please approve the connection in MetaMask to continue.');
            } else if (error.code === -32002) {
                alert('Connection request already pending. Please check your MetaMask extension.');
            } else {
                alert('Failed to connect wallet:\n' + error.message);
            }
        }
    }
    
    renderGameGrid() {
        this.elements.gameGrid.innerHTML = '';
        
        this.games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-icon">${game.icon}</div>
                <h3 class="game-title">${game.name}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-difficulty difficulty-${game.difficulty.toLowerCase()}">
                    Difficulty: ${game.difficulty}
                </div>
            `;
            card.addEventListener('click', () => this.startGame(game));
            this.elements.gameGrid.appendChild(card);
        });
    }
    
    startGame(gameData) {
        // Hide game grid, show game container
        this.elements.gameGrid.classList.add('hidden');
        this.elements.gameContainer.classList.remove('hidden');
        
        // Set game title
        this.elements.gameTitle.textContent = gameData.name;
        
        // Initialize game
        if (gameData.class) {
            this.currentGame = new gameData.class(this.elements.gameCanvas);
            this.startScoreUpdate();
        } else {
            console.error('Game class not loaded:', gameData.id);
        }
    }
    
    startScoreUpdate() {
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
        }
        
        this.scoreUpdateInterval = setInterval(() => {
            if (this.currentGame && !this.currentGame.gameOver) {
                this.elements.score.textContent = this.currentGame.getScore();
                const timeLeft = Math.ceil(this.currentGame.getTimeLeft());
                this.elements.timer.textContent = timeLeft + 's';
                
                // Check if game ended
                if (this.currentGame.gameOver) {
                    this.endGame();
                }
            }
        }, 100);
    }
    
    endGame() {
        clearInterval(this.scoreUpdateInterval);
        
        const finalScore = this.currentGame.getScore();
        const gameWon = this.currentGame.getGameWon();
        
        this.elements.finalScore.textContent = finalScore;
        this.elements.gameOver.classList.remove('hidden');
        
        if (gameWon) {
            this.elements.rewardMessage.textContent = '🎉 Congratulations! You won! Claim your NFT reward!';
            this.elements.claimNFT.classList.remove('hidden');
        } else {
            this.elements.rewardMessage.textContent = 'Keep trying! You need a higher score to win an NFT.';
            this.elements.claimNFT.classList.add('hidden');
        }
    }
    
    backToMenu() {
        if (this.currentGame) {
            this.currentGame.gameOver = true;
            this.currentGame = null;
        }
        
        clearInterval(this.scoreUpdateInterval);
        
        this.elements.gameGrid.classList.remove('hidden');
        this.elements.gameContainer.classList.add('hidden');
        this.elements.gameOver.classList.add('hidden');
    }
    
    playAgain() {
        this.elements.gameOver.classList.add('hidden');
        this.elements.currentGame = null;
        
        // Reload the page to reset everything
        location.reload();
    }
    
    async claimNFT() {
        if (!this.userAddress) {
            alert('Please connect your wallet first!');
            return;
        }
        
        this.elements.loadingOverlay.classList.remove('hidden');
        
        try {
            // Call backend API to mint NFT
            const response = await fetch('http://localhost:3000/api/mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: this.userAddress,
                    game: this.currentGame.constructor.name,
                    score: this.currentGame.getScore()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('🎉 NFT minted successfully! Check your wallet!');
            } else {
                alert('Failed to mint NFT: ' + result.error);
            }
        } catch (error) {
            console.error('Error claiming NFT:', error);
            alert('Failed to claim NFT. Please try again.');
        } finally {
            this.elements.loadingOverlay.classList.add('hidden');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if ethers is loaded
    if (typeof ethers === 'undefined') {
        console.error('Ethers.js not loaded! Please check the CDN link in index.html');
        alert('Error: Web3 library not loaded. Please refresh the page.');
        return;
    }
    
    console.log('Initializing Game Arena...');
    console.log('Ethers version:', ethers.version);
    
    // All game scripts are now loaded in HTML
    window.gameArena = new GameArena();
});
