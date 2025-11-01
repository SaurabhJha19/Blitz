import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// Hardhat default test accounts (for demo mode only - local dev)
const DEMO_ACCOUNTS = [
  {
    name: 'Account 1 (Owner)',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    name: 'Account 2 (Defender)',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    name: 'Account 3 (Attacker)',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    name: 'Account 4',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    name: 'Account 5',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  },
];

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.formatEther(balance));

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setBalance(ethers.formatEther(balance));
      setIsDemoMode(false);
    }
  };

  const connectDemoAccount = async (demoAccount) => {
    setIsConnecting(true);
    try {
      // Use JSON-RPC provider for local Hardhat node
      const rpcUrl = 'http://127.0.0.1:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(demoAccount.privateKey, provider);
      const address = wallet.address;
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(wallet);
      setAccount(address);
      setBalance(ethers.formatEther(balance));
      setIsDemoMode(true);
      setSelectedDemoAccount(demoAccount);
      
      // Store in localStorage for persistence
      localStorage.setItem('demoMode', 'true');
      localStorage.setItem('demoAccount', JSON.stringify(demoAccount));
    } catch (error) {
      console.error('Error connecting demo account:', error);
      alert('Failed to connect demo account. Make sure Hardhat node is running on http://127.0.0.1:8545');
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshBalance = async () => {
    if (account && provider) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setIsDemoMode(false);
    setSelectedDemoAccount(null);
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoAccount');
  };

  useEffect(() => {
    // Check if demo mode was previously used
    const restoreConnection = async () => {
      const savedDemoMode = localStorage.getItem('demoMode');
      const savedDemoAccount = localStorage.getItem('demoAccount');
      
      if (savedDemoMode === 'true' && savedDemoAccount) {
        try {
          const demoAccount = JSON.parse(savedDemoAccount);
          setIsConnecting(true);
          const rpcUrl = 'http://127.0.0.1:8545';
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(demoAccount.privateKey, provider);
          const address = wallet.address;
          const balance = await provider.getBalance(address);

          setProvider(provider);
          setSigner(wallet);
          setAccount(address);
          setBalance(ethers.formatEther(balance));
          setIsDemoMode(true);
          setSelectedDemoAccount(demoAccount);
          setIsConnecting(false);
        } catch (error) {
          console.error('Error restoring demo account:', error);
          setIsConnecting(false);
        }
      } else {
        // Check if MetaMask wallet is already connected
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
            if (accounts.length > 0) {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              const balance = await provider.getBalance(address);

              setProvider(provider);
              setSigner(signer);
              setAccount(address);
              setBalance(ethers.formatEther(balance));
              setIsDemoMode(false);
            }
          });
        }
      }
    };

    restoreConnection();
  }, []);

  const value = {
    account,
    provider,
    signer,
    balance,
    isConnecting,
    isDemoMode,
    selectedDemoAccount,
    demoAccounts: DEMO_ACCOUNTS,
    connectWallet,
    connectDemoAccount,
    disconnectWallet,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
