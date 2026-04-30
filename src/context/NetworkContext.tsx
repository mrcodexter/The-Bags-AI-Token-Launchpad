import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface NetworkContextType {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<WalletAdapterNetwork>(() => {
    const saved = localStorage.getItem('bags-network');
    return (saved as WalletAdapterNetwork) || WalletAdapterNetwork.Mainnet;
  });

  const setNetwork = (newNetwork: WalletAdapterNetwork) => {
    setNetworkState(newNetwork);
    localStorage.setItem('bags-network', newNetwork);
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
