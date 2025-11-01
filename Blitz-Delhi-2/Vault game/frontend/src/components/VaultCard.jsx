import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getContract, CHALLENGE_TYPES } from '../utils/contract';
import { ethers } from 'ethers';
import { Lock, Unlock, Clock, Users, Trophy, Target, Hash as HashIcon, Loader2 } from 'lucide-react';

export default function VaultCard({ vault, account, onUpdate }) {
  const { signer } = useWallet();
  const [showAttack, setShowAttack] = useState(false);
  const [codeGuess, setCodeGuess] = useState('');
  const [hashGuess, setHashGuess] = useState('');
  const [loading, setLoading] = useState(false);

  const isDefender = account?.toLowerCase() === vault.defender.toLowerCase();
  const isAttacker = account?.toLowerCase() === vault.attacker.toLowerCase();
  const canJoin = vault.isActive && !vault.isCracked && vault.attacker === '0x0000000000000000000000000000000000000000';
  const canAttack = vault.isActive && !vault.isCracked && isAttacker;
  const isExpired = Date.now() / 1000 > vault.createdAt + vault.timeoutDuration;
  const remainingAttempts = vault.maxAttempts - vault.attemptsUsed;

  const handleJoin = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.joinAsAttacker(vault.id, { value: vault.entryFee });
      await tx.wait();
      alert('Successfully joined as attacker!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error joining:', error);
      alert('Failed to join: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const contract = getContract(signer);
      let tx;
      if (vault.challengeType === 0) {
        // CODE
        const guess = parseInt(codeGuess);
        if (guess < 0 || guess > 9999) {
          alert('Code must be between 0 and 9999');
          setLoading(false);
          return;
        }
        tx = await contract.attemptCode(vault.id, guess);
      } else {
        // HASH
        tx = await contract.attemptHash(vault.id, hashGuess);
      }
      const receipt = await tx.wait();
      
      // Check if vault was cracked
      const vaultCrackedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'VaultCracked';
        } catch {
          return false;
        }
      });

      if (vaultCrackedEvent) {
        alert('🎉 Vault cracked! You won!');
      } else {
        alert(`Wrong guess! ${remainingAttempts - 1} attempts remaining.`);
      }
      
      setCodeGuess('');
      setHashGuess('');
      setShowAttack(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error attempting:', error);
      alert('Failed to make attempt: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReclaim = async () => {
    if (!signer) return;
    if (!confirm('Are you sure you want to reclaim this vault?')) return;
    
    setLoading(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.reclaimVault(vault.id);
      await tx.wait();
      alert('Vault reclaimed successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error reclaiming:', error);
      alert('Failed to reclaim: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {vault.isCracked ? (
              <Unlock size={20} className="text-green-400" />
            ) : (
              <Lock size={20} className="text-yellow-400" />
            )}
            <span className="text-white font-semibold">Vault #{vault.id}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            {vault.challengeType === 0 ? (
              <span>🔢 Code Challenge</span>
            ) : (
              <span><HashIcon size={14} className="inline" /> Hash Challenge</span>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          vault.isCracked ? 'bg-green-500/20 text-green-300' :
          vault.isActive ? 'bg-blue-500/20 text-blue-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {vault.isCracked ? 'CRACKED' : vault.isActive ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>

      {/* Reward */}
      <div className="bg-yellow-500/20 rounded-lg p-3 mb-4">
        <div className="text-xs text-yellow-200 mb-1">Reward</div>
        <div className="text-xl font-bold text-yellow-300">
          {ethers.formatEther(vault.rewardAmount)} ETH
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 text-sm text-white/80">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Users size={14} />
            <span>Defender:</span>
          </span>
          <span className="font-mono text-xs">
            {vault.defender.slice(0, 6)}...{vault.defender.slice(-4)}
          </span>
        </div>
        {vault.attacker !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Target size={14} />
              <span>Attacker:</span>
            </span>
            <span className="font-mono text-xs">
              {vault.attacker.slice(0, 6)}...{vault.attacker.slice(-4)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Trophy size={14} />
            <span>Attempts:</span>
          </span>
          <span>{vault.attemptsUsed}/{vault.maxAttempts}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Clock size={14} />
            <span>Entry Fee:</span>
          </span>
          <span>{ethers.formatEther(vault.entryFee)} ETH</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {isDefender && !vault.isCracked && (isExpired || !vault.isActive) && (
          <button
            onClick={handleReclaim}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Reclaiming...</span>
              </>
            ) : (
              <span>Reclaim Vault</span>
            )}
          </button>
        )}

        {canJoin && account && !isDefender && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join as Attacker'}
          </button>
        )}

        {canAttack && (
          <>
            {!showAttack ? (
              <button
                onClick={() => setShowAttack(true)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Make Attempt ({remainingAttempts} left)
              </button>
            ) : (
              <div className="space-y-2">
                {vault.challengeType === 0 ? (
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={codeGuess}
                    onChange={(e) => setCodeGuess(e.target.value)}
                    placeholder="Enter 4-digit code"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={hashGuess}
                    onChange={(e) => setHashGuess(e.target.value)}
                    placeholder="Enter solution"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleAttempt}
                    disabled={loading || (vault.challengeType === 0 ? !codeGuess : !hashGuess)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAttack(false);
                      setCodeGuess('');
                      setHashGuess('');
                    }}
                    className="px-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
