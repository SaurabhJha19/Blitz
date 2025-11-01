const hre = require("hardhat");

async function main() {
  console.log("Deploying VaultGame contract...");

  // Contract parameters
  const minimumReward = hre.ethers.parseEther("0.1"); // 0.1 ETH minimum reward
  const minimumEntryFee = hre.ethers.parseEther("0.01"); // 0.01 ETH minimum entry fee
  const platformFee = 100; // 1% platform fee (in basis points)

  const VaultGame = await hre.ethers.getContractFactory("VaultGame");
  const vaultGame = await VaultGame.deploy(
    minimumReward,
    minimumEntryFee,
    platformFee
  );

  await vaultGame.waitForDeployment();
  const address = await vaultGame.getAddress();

  console.log("\n✅ VaultGame deployed successfully!");
  console.log("📋 Contract Address:", address);
  console.log("📋 Network:", hre.network.name);
  console.log("\nConfiguration:");
  console.log("  - Minimum Reward:", hre.ethers.formatEther(minimumReward), "ETH");
  console.log("  - Minimum Entry Fee:", hre.ethers.formatEther(minimumEntryFee), "ETH");
  console.log("  - Platform Fee:", platformFee / 100, "%");
  
  // Verify on block explorer if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await vaultGame.deploymentTransaction().wait(5);
    
    console.log("✅ Ready for verification!");
    console.log(`Run: npx hardhat verify --network ${hre.network.name} ${address} "${minimumReward}" "${minimumEntryFee}" ${platformFee}`);
  }

  console.log("\n🎮 Vault Game is ready to use!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
