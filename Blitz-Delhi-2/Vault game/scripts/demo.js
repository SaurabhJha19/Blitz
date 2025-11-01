const hre = require("hardhat");

async function main() {
  console.log("🎮 Vault Game Demo - Starting Full Game Flow\n");
  console.log("=".repeat(60));

  // Get signers
  const [owner, defender, attacker] = await hre.ethers.getSigners();
  
  console.log("\n👥 Players:");
  console.log("  Owner:", owner.address);
  console.log("  Defender:", defender.address);
  console.log("  Attacker:", attacker.address);

  // Deploy contract
  console.log("\n📦 Step 1: Deploying VaultGame Contract...");
  const minimumReward = hre.ethers.parseEther("0.1");
  const minimumEntryFee = hre.ethers.parseEther("0.01");
  const platformFee = 100; // 1%

  const VaultGame = await hre.ethers.getContractFactory("VaultGame");
  const vaultGame = await VaultGame.deploy(
    minimumReward,
    minimumEntryFee,
    platformFee
  );
  await vaultGame.waitForDeployment();
  const contractAddress = await vaultGame.getAddress();
  
  console.log("✅ Contract deployed at:", contractAddress);
  console.log("   Minimum Reward:", hre.ethers.formatEther(minimumReward), "ETH");
  console.log("   Minimum Entry Fee:", hre.ethers.formatEther(minimumEntryFee), "ETH");
  console.log("   Platform Fee:", platformFee / 100, "%");

  // ============ GAME 1: Code Challenge ============
  console.log("\n" + "=".repeat(60));
  console.log("🎯 GAME 1: CODE CHALLENGE");
  console.log("=".repeat(60));

  // Defender creates vault
  console.log("\n📦 Defender creating vault with CODE challenge...");
  const codeChallenge = 5678;
  const rewardAmount = hre.ethers.parseEther("1.0");
  const maxAttempts = 5;
  const timeoutDuration = 3600;

  console.log(`   Secret Code: ${codeChallenge}`);
  console.log(`   Reward: ${hre.ethers.formatEther(rewardAmount)} ETH`);
  console.log(`   Max Attempts: ${maxAttempts}`);
  console.log(`   Timeout: ${timeoutDuration} seconds (1 hour)`);

  const tx1 = await vaultGame.connect(defender).createVaultWithCode(
    codeChallenge,
    maxAttempts,
    timeoutDuration,
    { value: rewardAmount }
  );
  const receipt1 = await tx1.wait();
  
  const vaultCreatedEvent = receipt1.logs.find(
    log => {
      try {
        const parsed = vaultGame.interface.parseLog(log);
        return parsed && parsed.name === "VaultCreated";
      } catch {
        return false;
      }
    }
  );
  const vaultId1 = vaultCreatedEvent ? 
    vaultGame.interface.parseLog(vaultCreatedEvent).args.vaultId : 0n;
  
  console.log(`✅ Vault created! ID: ${vaultId1}`);

  // Check defender balance
  const defenderBalanceBefore = await hre.ethers.provider.getBalance(defender.address);
  console.log(`   Defender balance: ${hre.ethers.formatEther(defenderBalanceBefore)} ETH`);

  // Attacker joins
  console.log("\n🎯 Attacker joining the vault...");
  const tx2 = await vaultGame.connect(attacker).joinAsAttacker(vaultId1, {
    value: minimumEntryFee
  });
  await tx2.wait();
  console.log(`✅ Attacker joined! Entry fee paid: ${hre.ethers.formatEther(minimumEntryFee)} ETH`);

  // Attacker attempts
  console.log("\n🔓 Attacker attempting to crack the vault...");
  
  const attackerBalanceBefore = await hre.ethers.provider.getBalance(attacker.address);
  
  // Wrong attempts
  const wrongGuesses = [1234, 9999];
  for (let i = 0; i < wrongGuesses.length; i++) {
    console.log(`\n   Attempt ${i + 1}/${maxAttempts}: Trying code ${wrongGuesses[i]}...`);
    const tx = await vaultGame.connect(attacker).attemptCode(vaultId1, wrongGuesses[i]);
    const receipt = await tx.wait();
    
    const attemptEvent = receipt.logs.find(
      log => {
        try {
          const parsed = vaultGame.interface.parseLog(log);
          return parsed && parsed.name === "AttemptMade";
        } catch {
          return false;
        }
      }
    );
    
    if (attemptEvent) {
      const args = vaultGame.interface.parseLog(attemptEvent).args;
      console.log(`   ❌ Wrong guess! Attempts remaining: ${args.attemptsRemaining}`);
    }
  }

  // Correct attempt
  console.log(`\n   Attempt 3/${maxAttempts}: Trying code ${codeChallenge}...`);
  const tx3 = await vaultGame.connect(attacker).attemptCode(vaultId1, codeChallenge);
  const receipt3 = await tx3.wait();
  
  const vaultCrackedEvent = receipt3.logs.find(
    log => {
      try {
        const parsed = vaultGame.interface.parseLog(log);
        return parsed && parsed.name === "VaultCracked";
      } catch {
        return false;
      }
    }
  );
  
  if (vaultCrackedEvent) {
    const args = vaultGame.interface.parseLog(vaultCrackedEvent).args;
    console.log(`   ✅✅✅ VAULT CRACKED! ✅✅✅`);
    console.log(`   Attacker wins: ${hre.ethers.formatEther(args.rewardAmount)} ETH`);
    
    const attackerBalanceAfter = await hre.ethers.provider.getBalance(attacker.address);
    const gasUsed = receipt3.gasUsed * receipt3.gasPrice;
    const netGain = (attackerBalanceAfter - attackerBalanceBefore) + gasUsed;
    console.log(`   Net gain (after gas): ${hre.ethers.formatEther(netGain)} ETH`);
  }

  // Check vault status
  const vault1 = await vaultGame.getVault(vaultId1);
  console.log(`\n📊 Vault ${vaultId1} Status:`);
  console.log(`   Active: ${vault1.isActive}`);
  console.log(`   Cracked: ${vault1.isCracked}`);
  console.log(`   Attempts used: ${vault1.attemptsUsed}/${vault1.maxAttempts}`);

  // ============ GAME 2: Hash Challenge ============
  console.log("\n" + "=".repeat(60));
  console.log("🎯 GAME 2: HASH CHALLENGE");
  console.log("=".repeat(60));

  // Defender creates hash vault
  console.log("\n📦 Defender creating vault with HASH challenge...");
  const solution = "MySecretPassword2024!";
  const challengeHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(solution));
  const customEntryFee = hre.ethers.parseEther("0.02");

  console.log(`   Solution: "${solution}"`);
  console.log(`   Hash: ${challengeHash.slice(0, 20)}...`);
  console.log(`   Reward: ${hre.ethers.formatEther(rewardAmount)} ETH`);
  console.log(`   Entry Fee: ${hre.ethers.formatEther(customEntryFee)} ETH`);

  const tx4 = await vaultGame.connect(defender).createVaultWithHash(
    challengeHash,
    customEntryFee,
    maxAttempts,
    timeoutDuration,
    { value: rewardAmount }
  );
  const receipt4 = await tx4.wait();
  
  const vaultCreatedEvent2 = receipt4.logs.find(
    log => {
      try {
        const parsed = vaultGame.interface.parseLog(log);
        return parsed && parsed.name === "VaultCreated";
      } catch {
        return false;
      }
    }
  );
  const vaultId2 = vaultCreatedEvent2 ? 
    vaultGame.interface.parseLog(vaultCreatedEvent2).args.vaultId : 1n;
  
  console.log(`✅ Vault created! ID: ${vaultId2}`);

  // Attacker joins
  console.log("\n🎯 Attacker joining the vault...");
  await vaultGame.connect(attacker).joinAsAttacker(vaultId2, {
    value: customEntryFee
  });
  console.log(`✅ Attacker joined!`);

  // Attacker solves immediately (knows the solution)
  console.log("\n🔓 Attacker attempting to solve hash challenge...");
  console.log(`   Trying solution: "${solution}"`);
  
  const tx5 = await vaultGame.connect(attacker).attemptHash(vaultId2, solution);
  const receipt5 = await tx5.wait();
  
  const vaultCrackedEvent2 = receipt5.logs.find(
    log => {
      try {
        const parsed = vaultGame.interface.parseLog(log);
        return parsed && parsed.name === "VaultCracked";
      } catch {
        return false;
      }
    }
  );
  
  if (vaultCrackedEvent2) {
    const args = vaultGame.interface.parseLog(vaultCrackedEvent2).args;
    console.log(`   ✅✅✅ VAULT CRACKED ON FIRST ATTEMPT! ✅✅✅`);
    console.log(`   Attacker wins: ${hre.ethers.formatEther(args.rewardAmount)} ETH`);
  }

  const vault2 = await vaultGame.getVault(vaultId2);
  console.log(`\n📊 Vault ${vaultId2} Status:`);
  console.log(`   Active: ${vault2.isActive}`);
  console.log(`   Cracked: ${vault2.isCracked}`);
  console.log(`   Attempts used: ${vault2.attemptsUsed}/${vault2.maxAttempts}`);

  // ============ Summary ============
  console.log("\n" + "=".repeat(60));
  console.log("📊 GAME SUMMARY");
  console.log("=".repeat(60));
  
  const totalVaults = await vaultGame.vaultCount();
  console.log(`\n✅ Total Vaults Created: ${totalVaults}`);
  console.log(`✅ Games Completed: 2`);
  console.log(`✅ Attacker Success Rate: 100%`);
  
  console.log("\n🎮 Vault Game Demo Complete!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
