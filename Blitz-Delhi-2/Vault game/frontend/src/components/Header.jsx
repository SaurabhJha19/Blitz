import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, User } from 'lucide-react';
import DemoAccountSelector from './DemoAccountSelector';

export default function Header() {
  const { account, balance, connectWallet, disconnectWallet, isConnecting, isDemoMode, selectedDemoAccount } = useWallet();
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏦</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vault Game</h1>
              <p className="text-sm text-white/70">On-Chain Challenge Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {account ? (
              <>
                {isDemoMode && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 text-white">
                    <div className="text-xs text-green-300">Demo Mode</div>
                    <div className="text-xs font-semibold">{selectedDemoAccount?.name}</div>
                  </div>
                )}
                <div className="bg-white/10 rounded-lg px-4 py-2 text-white">
                  <div className="text-xs text-white/70">Balance</div>
                  <div className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-white">
                  <div className="text-xs text-white/70">{isDemoMode ? 'Demo Account' : 'Account'}</div>
                  <div className="font-mono text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDemoSelector(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                >
                  <User size={18} />
                  <span>Demo Mode</span>
                </button>
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Wallet size={20} />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showDemoSelector && (
        <DemoAccountSelector onClose={() => setShowDemoSelector(false)} />
      )}
    </header>
  );
}
