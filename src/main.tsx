import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import './index.css';
import { SolanaWalletProvider } from './components/WalletProvider.tsx';
import { NetworkProvider } from './context/NetworkContext.tsx';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';

// Polyfill Buffer for WalletConnect and Solana adapters
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworkProvider>
      <SolanaWalletProvider>
        <TooltipProvider>
          <App />
          <Toaster />
        </TooltipProvider>
      </SolanaWalletProvider>
    </NetworkProvider>
  </StrictMode>,
);
