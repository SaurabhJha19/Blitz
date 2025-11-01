import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getContractWithProvider, parseVault, CHALLENGE_TYPES, CONTRACT_ADDRESS } from '../utils/contract';
import { ethers } from 'ethers';
import { Lock, Unlock, Clock, Users, Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import VaultCard from './VaultCard';

export default function VaultList() {
  const { provider, account } = useWallet();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, MY_VAULTS, ATTACKABLE

  useEffect(() => {
    if (provider) {
      loadVaults();
      // Refresh every 10 seconds
      const interval = setInterval(loadVaults, 10000);
      return () => clearInterval(interval);
    } else {
      setError('Please connect a wallet or use Demo Mode');
      setLoading(false);
    }
  }, [provider, account]);

  const loadVaults = async () => {
    if (!provider) {
      setError('No provider connected. Please connect a wallet or use Demo Mode.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const contract = getContractWithProvider(provider);
      
      // First, verify the contract exists at this address
      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x' || code === '0x0') {
          setError(`No contract found at address ${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}. Please deploy the contract using: npm run deploy --network localhost`);
          setLoading(false);
          return;
        }
      } catch (codeError) {
        console.error('Error checking contract code:', codeError);
      }
      
      // Check if contract exists
      const vaultCount = await contract.vaultCount();
      const count = Number(vaultCount);

      console.log(`Found ${count} vaults`);

      if (count === 0) {
        setVaults([]);
        setLoading(false);
        return;
      }

      const vaultPromises = [];
      for (let i = 0; i < count; i++) {
        vaultPromises.push(contract.getVault(i));
      }

      const vaultData = await Promise.all(vaultPromises);
      const parsedVaults = vaultData.map((v, index) => ({
        ...parseVault(v),
        id: index,
      }));

      console.log('Loaded vaults:', parsedVaults);
      setVaults(parsedVaults);
      setError(null);
    } catch (error) {
      console.error('Error loading vaults:', error);
      let errorMsg = `Error loading vaults: ${error.message}`;
      
      if (error.message.includes('could not decode result data') || error.code === 'BAD_DATA') {
        errorMsg = `Contract not found at address ${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}. ` +
          `Make sure Hardhat node is running (npm run node) and deploy the contract (npm run deploy --network localhost)`;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredVaults = vaults.filter((vault) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return vault.isActive && !vault.isCracked;
    if (filter === 'MY_VAULTS') return vault.defender.toLowerCase() === account?.toLowerCase();
    if (filter === 'ATTACKABLE') return vault.isActive && !vault.isCracked && vault.attacker === '0x0000000000000000000000000000000000000000';
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4">Loading vaults...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status & Refresh */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white/70 text-sm">Contract Address</div>
            <div className="font-mono text-xs text-white">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</div>
          </div>
          <button
            onClick={loadVaults}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'ALL', label: 'All Vaults' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'ATTACKABLE', label: 'Available to Attack' },
            { value: 'MY_VAULTS', label: 'My Vaults' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === f.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vault List */}
      {filteredVaults.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center text-white">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-2">No vaults found</p>
          <p className="text-white/70">Be the first to create a vault!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVaults.map((vault) => (
            <VaultCard key={vault.id} vault={vault} account={account} onUpdate={loadVaults} />
          ))}
        </div>
      )}
    </div>
  );
}
