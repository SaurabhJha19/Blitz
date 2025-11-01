// Jumping/Running Game
class RoadRunner {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = 800;
        this.height = canvas.height = 600;
        
        this.score = 0;
        this.timeLeft = 60;
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = Date.now();
        
        // Player
        this.player = {
            x: 100,
            y: this.height - 100,
            width: 40,
            height: 60,
            speed: 5,
            jumpPower: 18,
            velocity: 0,
            isJumping: false,
            isDoubleJump: false,
            color: '#6366f1'
        };
        
        // Ground and obstacles
        this.groundY = this.height - 100;
        this.obstacles = [];
        this.obstacleSpeed = 5;
        this.spawnRate = 1500;
        this.lastSpawn = 0;
        
        // Power-ups
        this.powerUps = [];
        
        // Particles
        this.particles = [];
        
        // Background elements
        this.clouds = this.createClouds();
        this.parallax = 0;
        
        this.setupListeners();
        this.animate();
    }
    
    createClouds() {
        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.3,
                size: 40 + Math.random() * 40
            });
        }
        return clouds;
    }
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                if (!this.player.isJumping) {
                    this.player.velocity = -this.player.jumpPower;
                    this.player.isJumping = true;
                    this.player.isDoubleJump = false;
                } else if (!this.player.isDoubleJump && this.player.velocity > 0) {
                    this.player.velocity = -this.player.jumpPower;
                    this.player.isDoubleJump = true;
                }
            }
        });
    }
    
    spawnObstacle() {
        const types = ['cactus', 'bird', 'barrier'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.width,
            y: this.groundY,
            width: 40,
            height: 60,
            type: type,
            color: '#ef4444'
        };
        
        if (type === 'bird') {
            obstacle.y = this.groundY - 100;
            obstacle.width = 50;
            obstacle.height = 40;
            obstacle.vy = Math.sin(Date.now() * 0.003) * 2;
        } else if (type === 'barrier') {
            obstacle.width = 30;
            obstacle.height = 80;
        }
        
        this.obstacles.push(obstacle);
        
        // Chance to spawn power-up
        if (Math.random() < 0.2) {
            this.powerUps.push({
                x: this.width,
                y: this.groundY - 30,
                width: 30,
                height: 30,
                type: 'speed'
            });
        }
    }
    
    update() {
        if (this.gameOver) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.startTime) / 1000;
        this.timeLeft = Math.max(0, 60 - elapsed);
        
        if (this.timeLeft <= 0) {
            this.endGame();
            return;
        }
        
        // Spawn obstacles
        if (currentTime - this.lastSpawn > this.spawnRate) {
            this.spawnObstacle();
            this.lastSpawn = currentTime;
        }
        
        // Update player
        this.player.velocity += 0.8; // Gravity
        this.player.y += this.player.velocity;
        
        if (this.player.y >= this.groundY) {
            this.player.y = this.groundY;
            this.player.velocity = 0;
            this.player.isJumping = false;
            this.player.isDoubleJump = false;
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.obstacleSpeed;
            
            // Bird movement
            if (obstacle.type === 'bird') {
                obstacle.y += obstacle.vy || 0;
                obstacle.vy = Math.sin(Date.now() * 0.003) * 2;
            }
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.endGame();
                return;
            }
            
            // Remove if off screen
            if (obstacle.x + obstacle.width < 0) {
                this.score += 10;
                this.obstacles.splice(i, 1);
            }
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.x -= this.obstacleSpeed;
            
            if (this.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            } else if (powerUp.x + powerUp.width < 0) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Parallax
        this.parallax -= this.obstacleSpeed * 0.5;
        
        // Increase difficulty
        if (this.score > 0 && this.score % 100 === 0) {
            this.obstacleSpeed += 0.5;
            this.spawnRate = Math.max(800, this.spawnRate - 50);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    collectPowerUp(powerUp) {
        this.score += 50;
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: powerUp.x + powerUp.width / 2,
                y: powerUp.y + powerUp.height / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#10b981',
                life: 30
            });
        }
    }
    
    render() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(1, '#0284c7');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const cloud of this.clouds) {
            const cloudX = (cloud.x + this.parallax * 0.1) % (this.width + 100);
            this.drawCloud(cloudX, cloud.y, cloud.size);
        }
        
        // Ground
        this.ctx.fillStyle = '#84cc16';
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        
        // Ground pattern
        this.ctx.strokeStyle = '#65a30d';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.width; x += 100) {
            const xPos = (x - this.parallax) % 100;
            this.ctx.beginPath();
            this.ctx.moveTo(xPos, this.groundY);
            this.ctx.lineTo(xPos + 50, this.groundY + 10);
            this.ctx.stroke();
        }
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = obstacle.color;
            
            if (obstacle.type === 'cactus') {
                this.ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
                // Draw spikes
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(obstacle.x + (obstacle.width / 4) * i, obstacle.y - obstacle.height);
                    this.ctx.lineTo(obstacle.x + (obstacle.width / 4) * i + obstacle.width / 8, obstacle.y - obstacle.height - 15);
                    this.ctx.lineTo(obstacle.x + (obstacle.width / 4) * (i + 1), obstacle.y - obstacle.height);
                    this.ctx.fill();
                }
            } else if (obstacle.type === 'bird') {
                // Simple bird shape
                this.ctx.beginPath();
                this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (obstacle.type === 'barrier') {
                this.ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
            }
        }
        
        // Draw power-ups
        for (const powerUp of this.powerUps) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate(Date.now() * 0.005);
            this.ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
            this.ctx.restore();
        }
        
        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y - this.player.height, this.player.width, this.player.height);
        
        // Player face
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.player.x + 10, this.player.y - this.player.height + 10, 8, 8);
        this.ctx.fillRect(this.player.x + 22, this.player.y - this.player.height + 10, 8, 8);
        
        // Draw particles
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.globalAlpha = 1;
        }
        
        // Trail effect
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x - 5, this.player.y - this.player.height + 5, this.player.width + 10, this.player.height - 10);
        this.ctx.globalAlpha = 1;
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.2, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
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
        this.gameWon = this.score >= 500; // Win condition: 500 points
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
    module.exports = RoadRunner;
}
