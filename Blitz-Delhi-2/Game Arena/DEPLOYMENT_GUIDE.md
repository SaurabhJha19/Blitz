# 🚀 Deployment Guide

## Production Deployment

Your Monad Blitz 2 game portal is ready to deploy! Follow these steps:

## 1. Smart Contract Deployment

### Using Hardhat (Recommended)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle

# Initialize
npx hardhat init

# Compile
npx hardhat compile

# Deploy to Sepolia (testnet)
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Mainnet (production)
npx hardhat run scripts/deploy.js --network mainnet
```

### Contract Deployment Script

Create `scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying RewardNFT contract...");
  const RewardNFT = await ethers.getContractFactory("RewardNFT");
  const nft = await RewardNFT.deploy("Monad Blitz 2 Rewards", "MB2R");
  
  await nft.deployed();
  
  console.log("RewardNFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 2. Backend Deployment

### Option A: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create monad-blitz-2

# Set environment variables
heroku config:set PORT=5000
heroku config:set CONTRACT_ADDRESS=<your_contract_address>
heroku config:set PRIVATE_KEY=<your_private_key>

# Deploy
git push heroku main
```

### Option B: Railway

1. Connect GitHub repo to Railway
2. Set environment variables in dashboard
3. Deploy automatically on push

### Option C: AWS EC2

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo>
cd monad-blitz-2

# Install dependencies
npm install

# Setup PM2
npm install -g pm2
pm2 start "node Game Arena/Server/index.js"
pm2 startup
pm2 save
```

### Option D: Digital Ocean Droplet

Same process as AWS EC2

## 3. Frontend Deployment

### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd "Game Arena"
vercel
```

### Option B: Netlify

1. Connect GitHub repo
2. Set build directory: `Game Arena`
3. Publish directory: `Game Arena`
4. Deploy

### Option C: GitHub Pages

```bash
# Build and push to gh-pages branch
npm run build
npm run deploy
```

## 4. Environment Configuration

### Backend .env

```env
PORT=3000
NODE_ENV=production
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
NETWORK_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

### Frontend Config

Update API URLs in `app.js`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

## 5. Domain & DNS

### Custom Domain Setup

1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Point DNS to deployment:
   - Vercel: Add DNS records
   - Netlify: Configure custom domain
   - AWS: Use CloudFront + Route 53

### SSL Certificate

- Vercel/Netlify: Automatic SSL
- AWS: Use ACM (Amazon Certificate Manager)
- Other: Use Let's Encrypt

## 6. CDN & Optimization

### Cloudflare

1. Add site to Cloudflare
2. Enable caching
3. Set up SSL
4. Configure firewall rules

### Content Optimization

```bash
# Minify JavaScript
npm install -g uglify-js
uglifyjs app.js -o app.min.js

# Minify CSS
npm install -g clean-css-cli
cleancss -o style.min.css style.css
```

## 7. Monitoring & Analytics

### Set Up Monitoring

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, Rollbar
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Lighthouse, WebPageTest

### Logging

```bash
# Use winston for logging
npm install winston

# Create logger.js
const winston = require('winston');
module.exports = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 8. Security Checklist

### Pre-Deployment

- [ ] Remove console.logs
- [ ] Sanitize inputs
- [ ] Enable CORS properly
- [ ] Use environment variables
- [ ] Test smart contract
- [ ] Audit gas costs
- [ ] Check for vulnerabilities

### Security Tools

```bash
# Audit dependencies
npm audit
npm audit fix

# Check smart contract
npx hardhat verify CONTRACT_ADDRESS --network mainnet
```

## 9. Testing Production Build

### Local Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run serve
```

### End-to-End Testing

```bash
# Install Playwright
npm install --save-dev playwright

# Run tests
npx playwright test
```

## 10. Post-Deployment

### Verify Deployment

- [ ] All games load
- [ ] Wallet connects
- [ ] NFT minting works
- [ ] API endpoints respond
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### SEO Setup

Add to `index.html`:

```html
<meta name="description" content="Play Web3 games and earn NFT rewards">
<meta name="keywords" content="web3, nft, gaming, blockchain">
<meta property="og:title" content="Monad Blitz 2">
<meta property="og:image" content="https://your-domain.com/og-image.png">
```

### Social Sharing

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Monad Blitz 2">
```

## 11. Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Security patches
npm audit fix

# Smart contract upgrades (if needed)
npm run upgrade:contract
```

### Backup Strategy

- Database: Automated backups
- Smart Contract: Verify on multiple block explorers
- Code: Version control (Git)
- Assets: IPFS pinning

## 12. Scaling

### Load Balancing

- AWS: ELB (Elastic Load Balancer)
- Google Cloud: Cloud Load Balancing
- Azure: Load Balancer

### Auto-Scaling

```javascript
// Use cluster mode for Node.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

## Cost Estimates

### Testnet (Free)
- Sepolia ETH: Free from faucets
- Heroku: Free tier
- Vercel: Free tier

### Mainnet Estimates
- Gas fees: 0.01-0.05 ETH per NFT
- Hosting: $5-20/month
- Domain: $10-20/year
- Monitoring: Free tier available

## Support & Resources

- **Documentation**: README.md, GETTING_STARTED.md
- **Issues**: GitHub Issues
- **Community**: Discord, Telegram
- **Updates**: Watch repository

---

🎉 **Your deployment is ready!**

For questions or issues, check the main README or open an issue.

