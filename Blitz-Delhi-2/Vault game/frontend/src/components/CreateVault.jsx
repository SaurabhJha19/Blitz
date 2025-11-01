import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';
import { Shield, Hash, Loader2 } from 'lucide-react';

export default function CreateVault({ onVaultCreated }) {
  const { signer, account } = useWallet();
  const [challengeType, setChallengeType] = useState('CODE');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [codeChallenge, setCodeChallenge] = useState('');
  const [hashSolution, setHashSolution] = useState('');
  const [rewardAmount, setRewardAmount] = useState('0.1');
  const [entryFee, setEntryFee] = useState('0.01');
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [timeoutHours, setTimeoutHours] = useState('1');

  if (!account) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center text-white">
        <p>Please connect your wallet to create a vault</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) return;

    setLoading(true);
    try {
      const contract = getContract(signer);
      const rewardWei = ethers.parseEther(rewardAmount);
      const timeoutSeconds = parseInt(timeoutHours) * 3600;

      let tx;
      if (challengeType === 'CODE') {
        const code = parseInt(codeChallenge);
        if (code < 0 || code > 9999) {
          alert('Code must be between 0 and 9999');
          setLoading(false);
          return;
        }
        tx = await contract.createVaultWithCode(
          code,
          parseInt(maxAttempts),
          timeoutSeconds,
          { value: rewardWei }
        );
      } else {
        const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(hashSolution));
        const entryFeeWei = ethers.parseEther(entryFee);
        tx = await contract.createVaultWithHash(
          solutionHash,
          entryFeeWei,
          parseInt(maxAttempts),
          timeoutSeconds,
          { value: rewardWei }
        );
      }

      const receipt = await tx.wait();
      console.log('Vault created transaction:', receipt);
      
      // Wait a moment for the transaction to be indexed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Vault created successfully! Switching to vault list...');
      if (onVaultCreated) {
        onVaultCreated();
      }
      
      // Reset form
      setCodeChallenge('');
      setHashSolution('');
    } catch (error) {
      console.error('Error creating vault:', error);
      alert('Failed to create vault: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
        <Shield size={24} />
        <span>Create New Vault</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Challenge Type */}
        <div>
          <label className="block text-white/90 mb-2">Challenge Type</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setChallengeType('CODE')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                challengeType === 'CODE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🔢</span>
                <span>Code Challenge (4-digit)</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setChallengeType('HASH')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                challengeType === 'HASH'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Hash size={20} />
                <span>Hash Challenge</span>
              </div>
            </button>
          </div>
        </div>

        {/* Challenge Input */}
        {challengeType === 'CODE' ? (
          <div>
            <label className="block text-white/90 mb-2">Secret Code (0-9999)</label>
            <input
              type="number"
              min="0"
              max="9999"
              value={codeChallenge}
              onChange={(e) => setCodeChallenge(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5678"
              required
            />
            <p className="text-xs text-white/60 mt-1">Keep this code secret! Attackers will try to guess it.</p>
          </div>
        ) : (
          <div>
            <label className="block text-white/90 mb-2">Solution (will be hashed)</label>
            <input
              type="text"
              value={hashSolution}
              onChange={(e) => setHashSolution(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MySecretPassword123!"
              required
            />
            <p className="text-xs text-white/60 mt-1">Attackers need to guess this exact string to win.</p>
          </div>
        )}

        {/* Reward Amount */}
        <div>
          <label className="block text-white/90 mb-2">Reward Amount (ETH)</label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Entry Fee (Hash only) */}
        {challengeType === 'HASH' && (
          <div>
            <label className="block text-white/90 mb-2">Entry Fee (ETH)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Max Attempts */}
        <div>
          <label className="block text-white/90 mb-2">Max Attempts (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Timeout */}
        <div>
          <label className="block text-white/90 mb-2">Timeout (hours)</label>
          <input
            type="number"
            min="1"
            value={timeoutHours}
            onChange={(e) => setTimeoutHours(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Creating Vault...</span>
            </>
          ) : (
            <span>Create Vault</span>
          )}
        </button>
      </form>
    </div>
  );
}
