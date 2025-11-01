import { useWallet } from '../context/WalletContext';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function DemoModeBanner() {
  const { isDemoMode, selectedDemoAccount, disconnectWallet } = useWallet();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-yellow-200">
          <AlertCircle size={18} />
          <span className="text-sm">
            Demo Mode Active: Using <strong>{selectedDemoAccount?.name}</strong>. 
            This account is automatically funded for testing.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-200 hover:text-yellow-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
