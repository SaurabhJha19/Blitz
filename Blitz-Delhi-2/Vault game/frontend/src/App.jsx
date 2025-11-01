import { useState } from 'react';
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';
import CreateVault from './components/CreateVault';
import VaultList from './components/VaultList';
import DemoModeBanner from './components/DemoModeBanner';
import { Plus, List } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('vaults');

  return (
    <div className="min-h-screen">
      <Header />
      <DemoModeBanner />
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('vaults')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'vaults'
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <List size={20} />
            <span>All Vaults</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Plus size={20} />
            <span>Create Vault</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <CreateVault onVaultCreated={() => setActiveTab('vaults')} />
        ) : (
          <VaultList />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-white/60 text-sm">
        <p>Vault Game - On-Chain Challenge Platform</p>
        <p className="mt-1">Built with ❤️ for blockchain gaming</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
