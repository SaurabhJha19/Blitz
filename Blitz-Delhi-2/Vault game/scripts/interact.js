// Example interaction script
// This demonstrates how to use the VaultGame contract

const hre = require("hardhat");

async function main() {
  // Get signers
  const [owner, defender, attacker] = await hre.ethers.getSigners();
  
  // Get contract address (deploy first or use existing)
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("🔗 Connecting to VaultGame contract...");
  const VaultGame = await hre.ethers.getContractFactory("VaultGame");
  const vaultGame = await VaultGame.attach(CONTRACT_ADDRESS);
  
  console.log("✅ Connected to:", CONTRACT_ADDRESS);
  console.log("👤 Defender:", defender.address);
  console.log("👤 Attacker:", attacker.address);
  
  // ============ Example 1: Code Challenge ============
  console.log("\n📦 Example 1: Creating Code Challenge Vault");
  
  const codeChallenge = 5678;
  const rewardAmount = hre.ethers.parseEther("0.5");
  const maxAttempts = 5;
  const timeoutDuration = 3600; // 1 hour
  
  console.log(`Creating vault with code challenge: ${codeChallenge}`);
  console.log(`Reward: ${hre.ethers.formatEther(rewardAmount)} ETH`);
  
  const tx1 = await vaultGame.connect(defender).createVaultWithCode(
    codeChallenge,
    maxAttempts,
    timeoutDuration,
    { value: rewardAmount }
  );
  const receipt1 = await tx1.wait();
  
  // Get vault ID from event
  const vaultCreatedEvent = receipt1.logs.find(
    log => vaultGame.interface.parseLog(log)?.name === "VaultCreated"
  );
  const vaultId = vaultCreatedEvent ? vaultGame.interface.parseLog(vaultCreatedEvent).args.vaultId : 0n;
  
  console.log(`✅ Vault created! ID: ${vaultId}`);
  
  // ============ Attacker joins ============
  console.log("\n🎯 Attacker joining vault...");
  
  const entryFee = await vaultGame.minimumEntryFee();
  const tx2 = await vaultGame.connect(attacker).joinAsAttacker(vaultId, {
    value: entryFee
  });
  await tx2.wait();
  
  console.log(`✅ Attacker joined! Entry fee: ${hre.ethers.formatEther(entryFee)} ETH`);
  
  // ============ Attacker attempts ============
  console.log("\n🔓 Attacker making attempts...");
  
  // Wrong attempts
  for (let i = 0; i < 2; i++) {
    const wrongGuess = 1000 + i;
    console.log(`Attempt ${i + 1}: Trying code ${wrongGuess}...`);
    const tx = await vaultGame.connect(attacker).attemptCode(vaultId, wrongGuess);
    await tx.wait();
    console.log("❌ Wrong guess!");
  }
  
  // Correct attempt
  console.log(`Attempt 3: Trying code ${codeChallenge}...`);
  const tx3 = await vaultGame.connect(attacker).attemptCode(vaultId, codeChallenge);
  const receipt3 = await tx3.wait();
  
  const vaultCrackedEvent = receipt3.logs.find(
    log => vaultGame.interface.parseLog(log)?.name === "VaultCracked"
  );
  
  if (vaultCrackedEvent) {
    console.log("✅ Vault cracked! Attacker wins!");
    const vault = await vaultGame.getVault(vaultId);
    console.log(`💰 Reward: ${hre.ethers.formatEther(vault.rewardAmount)} ETH`);
  }
  
  // ============ Example 2: Hash Challenge ============
  console.log("\n\n📦 Example 2: Creating Hash Challenge Vault");
  
  const solution = "MySecretPassword2024!";
  const challengeHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(solution));
  const customEntryFee = hre.ethers.parseEther("0.02");
  
  console.log(`Solution: "${solution}"`);
  console.log(`Hash: ${challengeHash}`);
  
  const tx4 = await vaultGame.connect(defender).createVaultWithHash(
    challengeHash,
    customEntryFee,
    maxAttempts,
    timeoutDuration,
    { value: rewardAmount }
  );
  const receipt4 = await tx4.wait();
  
  const vaultCreatedEvent2 = receipt4.logs.find(
    log => vaultGame.interface.parseLog(log)?.name === "VaultCreated"
  );
  const vaultId2 = vaultCreatedEvent2 ? vaultGame.interface.parseLog(vaultCreatedEvent2).args.vaultId : 1n;
  
  console.log(`✅ Hash vault created! ID: ${vaultId2}`);
  
  // Attacker joins and solves
  await vaultGame.connect(attacker).joinAsAttacker(vaultId2, {
    value: customEntryFee
  });
  
  console.log("🔓 Attempting to solve hash challenge...");
  const tx5 = await vaultGame.connect(attacker).attemptHash(vaultId2, solution);
  const receipt5 = await tx5.wait();
  
  const vaultCrackedEvent2 = receipt5.logs.find(
    log => vaultGame.interface.parseLog(log)?.name === "VaultCracked"
  );
  
  if (vaultCrackedEvent2) {
    console.log("✅ Hash challenge solved! Attacker wins!");
  }
  
  // ============ View Functions ============
  console.log("\n\n📊 Checking vault status...");
  
  const vault1 = await vaultGame.getVault(vaultId);
  const vault2 = await vaultGame.getVault(vaultId2);
  
  console.log(`\nVault ${vaultId}:`);
  console.log(`  - Active: ${vault1.isActive}`);
  console.log(`  - Cracked: ${vault1.isCracked}`);
  console.log(`  - Attempts used: ${vault1.attemptsUsed}/${vault1.maxAttempts}`);
  
  console.log(`\nVault ${vaultId2}:`);
  console.log(`  - Active: ${vault2.isActive}`);
  console.log(`  - Cracked: ${vault2.isCracked}`);
  console.log(`  - Attempts used: ${vault2.attemptsUsed}/${vault2.maxAttempts}`);
  
  console.log("\n✨ Examples completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
