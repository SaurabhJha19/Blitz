const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultGame", function () {
  let vaultGame;
  let owner, defender, attacker, other;
  
  const minimumReward = ethers.parseEther("0.1");
  const minimumEntryFee = ethers.parseEther("0.01");
  const platformFee = 100; // 1%

  beforeEach(async function () {
    [owner, defender, attacker, other] = await ethers.getSigners();

    const VaultGame = await ethers.getContractFactory("VaultGame");
    vaultGame = await VaultGame.deploy(minimumReward, minimumEntryFee, platformFee);
    await vaultGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right minimum reward and entry fee", async function () {
      expect(await vaultGame.minimumReward()).to.equal(minimumReward);
      expect(await vaultGame.minimumEntryFee()).to.equal(minimumEntryFee);
      expect(await vaultGame.platformFee()).to.equal(platformFee);
    });

    it("Should set the right owner", async function () {
      expect(await vaultGame.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Vaults", function () {
    const rewardAmount = ethers.parseEther("1.0");
    const maxAttempts = 5;
    const timeoutDuration = 3600; // 1 hour

    it("Should create a vault with code challenge", async function () {
      const codeChallenge = 1234;
      
      await expect(
        vaultGame.connect(defender).createVaultWithCode(
          codeChallenge,
          maxAttempts,
          timeoutDuration,
          { value: rewardAmount }
        )
      ).to.emit(vaultGame, "VaultCreated");

      const vault = await vaultGame.getVault(0);
      expect(vault.defender).to.equal(defender.address);
      expect(vault.rewardAmount).to.equal(rewardAmount);
      expect(vault.codeChallenge).to.equal(codeChallenge);
      expect(vault.maxAttempts).to.equal(maxAttempts);
      expect(vault.challengeType).to.equal(0); // CODE
      expect(vault.isActive).to.be.true;
    });

    it("Should create a vault with hash challenge", async function () {
      const solution = "mySecretPassword123";
      const challengeHash = ethers.keccak256(ethers.toUtf8Bytes(solution));
      const entryFee = ethers.parseEther("0.02");
      
      await expect(
        vaultGame.connect(defender).createVaultWithHash(
          challengeHash,
          entryFee,
          maxAttempts,
          timeoutDuration,
          { value: rewardAmount }
        )
      ).to.emit(vaultGame, "VaultCreated");

      const vault = await vaultGame.getVault(0);
      expect(vault.defender).to.equal(defender.address);
      expect(vault.rewardAmount).to.equal(rewardAmount);
      expect(vault.entryFee).to.equal(entryFee);
      expect(vault.challengeHash).to.equal(challengeHash);
      expect(vault.challengeType).to.equal(1); // HASH
    });

    it("Should reject vault creation with insufficient reward", async function () {
      await expect(
        vaultGame.connect(defender).createVaultWithCode(
          1234,
          maxAttempts,
          timeoutDuration,
          { value: ethers.parseEther("0.05") } // Below minimum
        )
      ).to.be.revertedWith("Reward too low");
    });

    it("Should reject code challenge with invalid code", async function () {
      await expect(
        vaultGame.connect(defender).createVaultWithCode(
          10000, // More than 4 digits
          maxAttempts,
          timeoutDuration,
          { value: rewardAmount }
        )
      ).to.be.revertedWith("Code must be 4 digits");
    });

    it("Should reject vault with invalid max attempts", async function () {
      await expect(
        vaultGame.connect(defender).createVaultWithCode(
          1234,
          0, // Invalid
          timeoutDuration,
          { value: rewardAmount }
        )
      ).to.be.revertedWith("Invalid max attempts");

      await expect(
        vaultGame.connect(defender).createVaultWithCode(
          1234,
          15, // Too high
          timeoutDuration,
          { value: rewardAmount }
        )
      ).to.be.revertedWith("Invalid max attempts");
    });
  });

  describe("Attacker Joining", function () {
    const rewardAmount = ethers.parseEther("1.0");
    const codeChallenge = 5678;
    const maxAttempts = 3;
    const timeoutDuration = 3600;

    beforeEach(async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );
    });

    it("Should allow attacker to join with correct entry fee", async function () {
      await expect(
        vaultGame.connect(attacker).joinAsAttacker(0, {
          value: minimumEntryFee
        })
      ).to.emit(vaultGame, "AttackerJoined");

      const vault = await vaultGame.getVault(0);
      expect(vault.attacker).to.equal(attacker.address);
    });

    it("Should refund excess entry fee", async function () {
      const excessAmount = ethers.parseEther("0.05");
      const initialBalance = await ethers.provider.getBalance(attacker.address);
      
      const tx = await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee + excessAmount
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(attacker.address);
      const balanceChange = initialBalance - finalBalance;
      
      // Should only pay entry fee + gas
      expect(balanceChange).to.be.closeTo(
        ethers.parseBigInt(minimumEntryFee) + gasUsed,
        ethers.parseEther("0.001")
      );
    });

    it("Should reject joining with insufficient entry fee", async function () {
      await expect(
        vaultGame.connect(attacker).joinAsAttacker(0, {
          value: ethers.parseEther("0.005") // Too low
        })
      ).to.be.revertedWith("Insufficient entry fee");
    });

    it("Should reject joining if vault already has attacker", async function () {
      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee
      });

      await expect(
        vaultGame.connect(other).joinAsAttacker(0, {
          value: minimumEntryFee
        })
      ).to.be.revertedWith("Vault already has an attacker");
    });
  });

  describe("Attempting to Crack Vault", function () {
    const rewardAmount = ethers.parseEther("2.0");
    const codeChallenge = 9999;
    const maxAttempts = 3;
    const timeoutDuration = 3600;

    beforeEach(async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );
      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee
      });
    });

    it("Should successfully crack vault with correct code", async function () {
      const initialBalance = await ethers.provider.getBalance(attacker.address);
      
      const tx = await vaultGame.connect(attacker).attemptCode(0, codeChallenge);
      await expect(tx).to.emit(vaultGame, "VaultCracked");

      const vault = await vaultGame.getVault(0);
      expect(vault.isCracked).to.be.true;
      expect(vault.isActive).to.be.false;

      // Check reward payment (minus platform fee)
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(attacker.address);
      const platformFeeAmount = (rewardAmount * BigInt(platformFee)) / BigInt(10000);
      const expectedReward = rewardAmount - platformFeeAmount;
      
      expect(finalBalance - initialBalance + gasUsed).to.equal(expectedReward);
    });

    it("Should fail with incorrect code and reduce attempts", async function () {
      const wrongGuess = 1234;
      
      await expect(
        vaultGame.connect(attacker).attemptCode(0, wrongGuess)
      ).to.emit(vaultGame, "AttemptMade")
        .withArgs(0, attacker.address, false, maxAttempts - 1);

      const vault = await vaultGame.getVault(0);
      expect(vault.attemptsUsed).to.equal(1);
      expect(vault.isCracked).to.be.false;
      expect(vault.isActive).to.be.true;
    });

    it("Should deactivate vault when all attempts exhausted", async function () {
      const wrongGuesses = [1111, 2222, 3333];
      
      for (const guess of wrongGuesses) {
        await vaultGame.connect(attacker).attemptCode(0, guess);
      }

      const vault = await vaultGame.getVault(0);
      expect(vault.attemptsUsed).to.equal(maxAttempts);
      expect(vault.isActive).to.be.false;
      expect(vault.isCracked).to.be.false;

      // Should not allow more attempts
      await expect(
        vaultGame.connect(attacker).attemptCode(0, 4444)
      ).to.be.revertedWith("No attempts remaining");
    });

    it("Should reject attempt from non-attacker", async function () {
      await expect(
        vaultGame.connect(other).attemptCode(0, codeChallenge)
      ).to.be.revertedWith("Not the attacker");
    });

    it("Should allow cracking on final attempt", async function () {
      // Use up attempts
      await vaultGame.connect(attacker).attemptCode(0, 1111);
      await vaultGame.connect(attacker).attemptCode(0, 2222);
      
      // Final attempt with correct code
      await expect(
        vaultGame.connect(attacker).attemptCode(0, codeChallenge)
      ).to.emit(vaultGame, "VaultCracked");

      const vault = await vaultGame.getVault(0);
      expect(vault.isCracked).to.be.true;
    });
  });

  describe("Hash Challenge", function () {
    const rewardAmount = ethers.parseEther("1.5");
    const solution = "SuperSecretPassword2024!";
    const challengeHash = ethers.keccak256(ethers.toUtf8Bytes(solution));
    const entryFee = ethers.parseEther("0.02");
    const maxAttempts = 5;
    const timeoutDuration = 3600;

    beforeEach(async function () {
      await vaultGame.connect(defender).createVaultWithHash(
        challengeHash,
        entryFee,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );
      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: entryFee
      });
    });

    it("Should successfully crack vault with correct hash solution", async function () {
      await expect(
        vaultGame.connect(attacker).attemptHash(0, solution)
      ).to.emit(vaultGame, "VaultCracked");

      const vault = await vaultGame.getVault(0);
      expect(vault.isCracked).to.be.true;
    });

    it("Should fail with incorrect solution", async function () {
      await expect(
        vaultGame.connect(attacker).attemptHash(0, "WrongPassword")
      ).to.emit(vaultGame, "AttemptMade")
        .withArgs(0, attacker.address, false, maxAttempts - 1);
    });

    it("Should reject code attempt on hash challenge", async function () {
      await expect(
        vaultGame.connect(attacker).attemptCode(0, 1234)
      ).to.be.revertedWith("Wrong challenge type");
    });
  });

  describe("Reclaiming Vault", function () {
    const rewardAmount = ethers.parseEther("1.0");
    const codeChallenge = 1234;
    const maxAttempts = 3;
    const timeoutDuration = 3600;

    it("Should allow defender to reclaim vault after timeout", async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [timeoutDuration + 1]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await ethers.provider.getBalance(defender.address);
      
      await expect(
        vaultGame.connect(defender).reclaimVault(0)
      ).to.emit(vaultGame, "VaultReclaimed");

      const finalBalance = await ethers.provider.getBalance(defender.address);
      expect(finalBalance - initialBalance).to.equal(rewardAmount);

      const vault = await vaultGame.getVault(0);
      expect(vault.isActive).to.be.false;
    });

    it("Should allow defender to reclaim if no attacker joined", async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );

      await expect(
        vaultGame.connect(defender).reclaimVault(0)
      ).to.emit(vaultGame, "VaultReclaimed");
    });

    it("Should allow defender to reclaim after attacker exhausted attempts", async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );

      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee
      });

      // Exhaust all attempts
      for (let i = 0; i < maxAttempts; i++) {
        await vaultGame.connect(attacker).attemptCode(0, 9999);
      }

      // Defender should be able to reclaim
      await expect(
        vaultGame.connect(defender).reclaimVault(0)
      ).to.emit(vaultGame, "VaultReclaimed");
    });

    it("Should reject reclaim if vault is still active", async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );

      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee
      });

      // Attacker still has attempts and time hasn't expired
      await expect(
        vaultGame.connect(defender).reclaimVault(0)
      ).to.be.revertedWith("Vault still active or attacker in progress");
    });

    it("Should reject reclaim from non-defender", async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );

      await expect(
        vaultGame.connect(attacker).reclaimVault(0)
      ).to.be.revertedWith("Not the defender");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update minimum reward", async function () {
      const newMinimum = ethers.parseEther("0.2");
      await vaultGame.connect(owner).setMinimumReward(newMinimum);
      expect(await vaultGame.minimumReward()).to.equal(newMinimum);
    });

    it("Should allow owner to update minimum entry fee", async function () {
      const newFee = ethers.parseEther("0.02");
      await vaultGame.connect(owner).setMinimumEntryFee(newFee);
      expect(await vaultGame.minimumEntryFee()).to.equal(newFee);
    });

    it("Should allow owner to update platform fee", async function () {
      const newFee = 200; // 2%
      await vaultGame.connect(owner).setPlatformFee(newFee);
      expect(await vaultGame.platformFee()).to.equal(newFee);
    });

    it("Should reject platform fee that's too high", async function () {
      await expect(
        vaultGame.connect(owner).setPlatformFee(1500) // 15%
      ).to.be.revertedWith("Fee too high (max 10%)");
    });

    it("Should allow owner to pause and unpause", async function () {
      await vaultGame.connect(owner).pause();
      expect(await vaultGame.paused()).to.be.true;

      await vaultGame.connect(owner).unpause();
      expect(await vaultGame.paused()).to.be.false;
    });

    it("Should reject non-owner from admin functions", async function () {
      await expect(
        vaultGame.connect(defender).setMinimumReward(ethers.parseEther("0.2"))
      ).to.be.revertedWithCustomError(vaultGame, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    const rewardAmount = ethers.parseEther("1.0");
    const codeChallenge = 5678;
    const maxAttempts = 5;
    const timeoutDuration = 3600;

    beforeEach(async function () {
      await vaultGame.connect(defender).createVaultWithCode(
        codeChallenge,
        maxAttempts,
        timeoutDuration,
        { value: rewardAmount }
      );
    });

    it("Should return correct remaining attempts", async function () {
      expect(await vaultGame.getRemainingAttempts(0)).to.equal(maxAttempts);
      
      await vaultGame.connect(attacker).joinAsAttacker(0, {
        value: minimumEntryFee
      });
      
      await vaultGame.connect(attacker).attemptCode(0, 1111);
      expect(await vaultGame.getRemainingAttempts(0)).to.equal(maxAttempts - 1);
    });

    it("Should correctly check if vault is expired", async function () {
      expect(await vaultGame.isVaultExpired(0)).to.be.false;
      
      await ethers.provider.send("evm_increaseTime", [timeoutDuration + 1]);
      await ethers.provider.send("evm_mine", []);
      
      expect(await vaultGame.isVaultExpired(0)).to.be.true;
    });
  });
});
