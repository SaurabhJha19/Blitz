import { ethers } from 'ethers';
import VaultGameABI from '../../artifacts/contracts/VaultGame.sol/VaultGame.json';

// Update this with your deployed contract address
// For localhost: 0x5FbDB2315678afecb367f032d93F642f64180aa3 (default Hardhat)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VaultGameABI.abi, signer);
};

export const getContractWithProvider = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VaultGameABI.abi, provider);
};

export const parseVault = (vaultArray) => {
  return {
    defender: vaultArray[0],
    rewardAmount: vaultArray[1],
    entryFee: vaultArray[2],
    challengeType: Number(vaultArray[3]),
    challengeHash: vaultArray[4],
    codeChallenge: Number(vaultArray[5]),
    maxAttempts: Number(vaultArray[6]),
    attemptsUsed: Number(vaultArray[7]),
    attacker: vaultArray[8],
    createdAt: Number(vaultArray[9]),
    timeoutDuration: Number(vaultArray[10]),
    isActive: vaultArray[11],
    isCracked: vaultArray[12],
  };
};

export const CHALLENGE_TYPES = {
  0: 'CODE',
  1: 'HASH',
  2: 'PUZZLE',
};
