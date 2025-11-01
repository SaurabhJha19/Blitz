import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { User, Loader2, X } from 'lucide-react';

export default function DemoAccountSelector({ onClose }) {
  const { demoAccounts, connectDemoAccount, isConnecting } = useWallet();
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelectAccount = async (account, index) => {
    setSelectedIndex(index);
    await connectDemoAccount(account);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <User size={24} />
            <span>Select Demo Account</span>
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <p className="text-white/70 mb-4 text-sm">
          Choose a demo account to play with. These accounts are pre-funded with test ETH from Hardhat.
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {demoAccounts.map((account, index) => (
            <button
              key={account.address}
              onClick={() => handleSelectAccount(account, index)}
              disabled={isConnecting}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedIndex === index
                  ? 'bg-blue-500/30 border-blue-400'
                  : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
              } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{account.name}</div>
                  <div className="text-xs text-white/60 font-mono mt-1">
                    {account.address.slice(0, 10)}...{account.address.slice(-8)}
                  </div>
                </div>
                {selectedIndex === index && isConnecting && (
                  <Loader2 size={20} className="animate-spin text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-200">
            ⚠️ Demo mode requires Hardhat node running on <code className="bg-black/30 px-1 rounded">http://127.0.0.1:8545</code>
          </p>
        </div>
      </div>
    </div>
  );
}
