// Aiming/Shooting Game
class TriggeredBattle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = 800;
        this.height = canvas.height = 600;
        
        this.score = 0;
        this.timeLeft = 60; // 60 seconds
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = Date.now();
        
        this.targets = [];
        this.bullets = [];
        this.targetSpeed = 2;
        this.spawnRate = 1000; // Spawn every 1 second
        this.lastSpawn = 0;
        
        this.crosshair = { x: 0, y: 0 };
        this.reloadTime = 300; // milliseconds between shots
        this.lastShot = 0;
        
        this.setupListeners();
        this.animate();
    }
    
    setupListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.crosshair.x = e.clientX - rect.left;
            this.crosshair.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (Date.now() - this.lastShot > this.reloadTime) {
                this.shoot();
                this.lastShot = Date.now();
            }
        });
    }
    
    shoot() {
        const bullet = {
            x: this.width / 2,
            y: this.height / 2,
            targetX: this.crosshair.x,
            targetY: this.crosshair.y,
            speed: 15,
            radius: 5
        };
        
        // Calculate angle
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        bullet.vx = (dx / distance) * bullet.speed;
        bullet.vy = (dy / distance) * bullet.speed;
        
        this.bullets.push(bullet);
        
        // Check collisions
        this.checkCollisions();
    }
    
    spawnTarget() {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.width;
                y = -30;
                vx = (Math.random() - 0.5) * 2;
                vy = this.targetSpeed;
                break;
            case 1: // Right
                x = this.width + 30;
                y = Math.random() * this.height;
                vx = -this.targetSpeed;
                vy = (Math.random() - 0.5) * 2;
                break;
            case 2: // Bottom
                x = Math.random() * this.width;
                y = this.height + 30;
                vx = (Math.random() - 0.5) * 2;
                vy = -this.targetSpeed;
                break;
            case 3: // Left
                x = -30;
                y = Math.random() * this.height;
                vx = this.targetSpeed;
                vy = (Math.random() - 0.5) * 2;
                break;
        }
        
        this.targets.push({
            x, y, vx, vy,
            radius: 30,
            color: `hsl(${Math.random() * 60 + 330}, 70%, 50%)`
        });
    }
    
    checkCollisions() {
        const bullet = this.bullets[this.bullets.length - 1];
        if (!bullet) return;
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            const dx = bullet.x - target.x;
            const dy = bullet.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bullet.radius + target.radius) {
                // Hit!
                this.targets.splice(i, 1);
                this.bullets.pop();
                this.score += 10;
                
                // Increase difficulty
                if (this.score % 100 === 0) {
                    this.targetSpeed += 0.2;
                    this.spawnRate = Math.max(400, this.spawnRate - 50);
                }
                break;
            }
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
        
        // Spawn targets
        if (currentTime - this.lastSpawn > this.spawnRate) {
            this.spawnTarget();
            this.lastSpawn = currentTime;
        }
        
        // Update targets
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            target.x += target.vx;
            target.y += target.vy;
            
            // Remove if off screen
            if (target.x < -50 || target.x > this.width + 50 || 
                target.y < -50 || target.y > this.height + 50) {
                this.targets.splice(i, 1);
            }
        }
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Remove if off screen
            if (bullet.x < 0 || bullet.x > this.width || 
                bullet.y < 0 || bullet.y > this.height) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#020617';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Draw center circle (player position)
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#6366f1';
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw bullets
        this.ctx.fillStyle = '#ec4899';
        for (const bullet of this.bullets) {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw targets
        for (const target of this.targets) {
            this.ctx.fillStyle = target.color;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw inner circle
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw crosshair
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        const size = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(this.crosshair.x - size, this.crosshair.y);
        this.ctx.lineTo(this.crosshair.x + size, this.crosshair.y);
        this.ctx.moveTo(this.crosshair.x, this.crosshair.y - size);
        this.ctx.lineTo(this.crosshair.x, this.crosshair.y + size);
        this.ctx.stroke();
        
        // Draw connecting line
        this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, this.height / 2);
        this.ctx.lineTo(this.crosshair.x, this.crosshair.y);
        this.ctx.stroke();
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
        this.gameWon = this.score >= 300; // Win condition: 300 points
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
    module.exports = TriggeredBattle;
}
