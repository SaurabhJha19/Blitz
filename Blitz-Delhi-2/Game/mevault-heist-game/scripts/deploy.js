const hre = require("hardhat");

async function main() {
    // Deploy the VaultHeist contract
    const VaultHeist = await hre.ethers.getContractFactory("VaultHeist");
    const vaultHeist = await VaultHeist.deploy();
    await vaultHeist.deployed();
    console.log("VaultHeist deployed to:", vaultHeist.address);

    // Deploy the VaultBadge contract
    const VaultBadge = await hre.ethers.getContractFactory("VaultBadge");
    const vaultBadge = await VaultBadge.deploy();
    await vaultBadge.deployed();
    console.log("VaultBadge deployed to:", vaultBadge.address);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });