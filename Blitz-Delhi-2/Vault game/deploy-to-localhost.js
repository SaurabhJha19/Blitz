// Quick script to deploy to localhost
const hre = require("hardhat");

async function main() {
  console.log("Deploying VaultGame to localhost network...");
  console.log("Make sure Hardhat node is running on http://127.0.0.1:8545\n");

  const minimumReward = hre.ethers.parseEther("0.1");
  const minimumEntryFee = hre.ethers.parseEther("0.01");
  const platformFee = 100;

  const VaultGame = await hre.ethers.getContractFactory("VaultGame");
  const vaultGame = await VaultGame.deploy(
    minimumReward,
    minimumEntryFee,
    platformFee
  );

  await vaultGame.waitForDeployment();
  const address = await vaultGame.getAddress();

  console.log("✅ VaultGame deployed successfully!");
  console.log("📋 Contract Address:", address);
  console.log("\n⚠️  IMPORTANT: Update frontend/src/utils/contract.js with this address:");
  console.log(`   CONTRACT_ADDRESS = '${address}';`);
  console.log("\nOr create frontend/.env file with:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
