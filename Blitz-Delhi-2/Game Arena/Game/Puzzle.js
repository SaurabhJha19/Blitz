// Puzzle Game
class Puzzle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = 800;
        this.height = canvas.height = 600;
        
        this.score = 0;
        this.timeLeft = 120;
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = Date.now();
        
        this.gridSize = 8;
        this.grid = [];
        this.selectedTile = null;
        this.matches = [];
        this.combo = 0;
        
        this.initializeGrid();
        this.setupListeners();
        this.animate();
    }
    
    initializeGrid() {
        // Create grid with random colors
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
        
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                let color;
                do {
                    color = colors[Math.floor(Math.random() * colors.length)];
                } while ((row >= 2 && this.grid[row - 1][col] === color && this.grid[row - 2][col] === color) ||
                         (col >= 2 && this.grid[row][col - 1] === color && this.grid[row][col - 2] === color));
                
                this.grid[row][col] = color;
            }
        }
        
        // Find and remove initial matches
        this.findAndRemoveMatches();
    }
    
    setupListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const tileSize = Math.min(this.width, this.height) / this.gridSize;
            const offsetX = (this.width - tileSize * this.gridSize) / 2;
            const offsetY = (this.height - tileSize * this.gridSize) / 2;
            
            const col = Math.floor((x - offsetX) / tileSize);
            const row = Math.floor((y - offsetY) / tileSize);
            
            if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
                if (!this.selectedTile) {
                    this.selectedTile = { row, col };
                } else {
                    this.swapTiles(this.selectedTile.row, this.selectedTile.col, row, col);
                    this.selectedTile = null;
                }
            }
        });
    }
    
    swapTiles(row1, col1, row2, col2) {
        // Check if adjacent
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        if (rowDiff + colDiff !== 1) {
            this.selectedTile = null;
            return;
        }
        
        // Swap
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
        
        // Check if swap creates matches
        const matches = this.findMatches();
        if (matches.length === 0) {
            // Swap back
            const temp = this.grid[row1][col1];
            this.grid[row1][col1] = this.grid[row2][col2];
            this.grid[row2][col2] = temp;
        } else {
            // Remove matches and cascade
            this.removeMatches(matches);
            this.cascade();
        }
    }
    
    findMatches() {
        const matches = [];
        const processed = new Set();
        
        // Check horizontal matches
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize - 2; col++) {
                const color = this.grid[row][col];
                if (color && this.grid[row][col + 1] === color && this.grid[row][col + 2] === color) {
                    let length = 3;
                    while (col + length < this.gridSize && this.grid[row][col + length] === color) {
                        length++;
                    }
                    
                    for (let i = 0; i < length; i++) {
                        const key = `${row},${col + i}`;
                        if (!processed.has(key)) {
                            matches.push({ row, col: col + i });
                            processed.add(key);
                        }
                    }
                }
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < this.gridSize; col++) {
            for (let row = 0; row < this.gridSize - 2; row++) {
                const color = this.grid[row][col];
                if (color && this.grid[row + 1][col] === color && this.grid[row + 2][col] === color) {
                    let length = 3;
                    while (row + length < this.gridSize && this.grid[row + length][col] === color) {
                        length++;
                    }
                    
                    for (let i = 0; i < length; i++) {
                        const key = `${row + i},${col}`;
                        if (!processed.has(key)) {
                            matches.push({ row: row + i, col });
                            processed.add(key);
                        }
                    }
                }
            }
        }
        
        return matches;
    }
    
    findAndRemoveMatches() {
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.removeMatches(matches);
            this.cascade();
        }
    }
    
    removeMatches(matches) {
        if (matches.length === 0) return;
        
        this.combo++;
        const baseScore = 10;
        const comboMultiplier = Math.min(this.combo, 5);
        this.score += baseScore * matches.length * comboMultiplier;
        
        for (const match of matches) {
            this.grid[match.row][match.col] = null;
        }
    }
    
    cascade() {
        // Drop gems
        for (let col = 0; col < this.gridSize; col++) {
            let writePos = this.gridSize - 1;
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.grid[row][col]) {
                    if (row !== writePos) {
                        this.grid[writePos][col] = this.grid[row][col];
                        this.grid[row][col] = null;
                    }
                    writePos--;
                }
            }
            
            // Fill empty spaces at top
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
            while (writePos >= 0) {
                this.grid[writePos][col] = colors[Math.floor(Math.random() * colors.length)];
                writePos--;
            }
        }
        
        // Check for new matches after cascade
        setTimeout(() => {
            const newMatches = this.findMatches();
            if (newMatches.length > 0) {
                this.removeMatches(newMatches);
                this.cascade();
            } else {
                this.combo = 0;
            }
        }, 100);
    }
    
    update() {
        if (this.gameOver) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.startTime) / 1000;
        this.timeLeft = Math.max(0, 120 - elapsed);
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    render() {
        // Background
        const gradient = this.ctx.createRadialGradient(this.width/2, this.height/2, 0, this.width/2, this.height/2, Math.max(this.width, this.height));
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Calculate tile size and position
        const tileSize = Math.min(this.width, this.height) / this.gridSize;
        const offsetX = (this.width - tileSize * this.gridSize) / 2;
        const offsetY = (this.height - tileSize * this.gridSize) / 2;
        
        // Draw grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = offsetX + col * tileSize;
                const y = offsetY + row * tileSize;
                
                // Background
                this.ctx.fillStyle = '#0f172a';
                this.ctx.fillRect(x, y, tileSize, tileSize);
                
                // Border
                this.ctx.strokeStyle = '#334155';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, tileSize, tileSize);
                
                // Selected tile highlight
                if (this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col) {
                    this.ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
                    this.ctx.fillRect(x, y, tileSize, tileSize);
                    
                    this.ctx.strokeStyle = '#6366f1';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(x, y, tileSize, tileSize);
                }
                
                // Gem
                if (this.grid[row][col]) {
                    const padding = 4;
                    this.ctx.fillStyle = this.grid[row][col];
                    this.ctx.fillRect(x + padding, y + padding, tileSize - padding * 2, tileSize - padding * 2);
                    
                    // Highlight
                    const highlight = this.ctx.createLinearGradient(x + padding, y + padding, x + tileSize / 2, y + tileSize / 2);
                    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = highlight;
                    this.ctx.fillRect(x + padding, y + padding, tileSize - padding * 2, tileSize - padding * 2);
                    
                    // Shadow
                    const shadow = this.ctx.createLinearGradient(x + padding, y + tileSize - padding, x + tileSize / 2, y + tileSize / 2);
                    shadow.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
                    shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    this.ctx.fillStyle = shadow;
                    this.ctx.fillRect(x + padding, y + tileSize / 2, tileSize - padding * 2, tileSize / 2 - padding);
                }
            }
        }
        
        // Combo indicator
        if (this.combo > 1) {
            this.ctx.fillStyle = `hsl(${Math.min(this.combo * 30, 360)}, 70%, 60%)`;
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`x${this.combo}`, this.width - 20, 60);
        }
    }
    
    animate() {
        this.update();
        this.render();
        
        if (!this.gameOver) {
            requestAnimationFrame(() => this.animate());
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameWon = this.score >= 2000; // Win condition: 2000 points
    }
    
    getScore() {
        return this.score;
    }
    
    getTimeLeft() {
        return this.timeLeft;
    }
    
    getGameWon() {
        return this.gameWon;
    }
}

// Export for Node.js/ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Puzzle;
}
