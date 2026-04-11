import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SolanaWalletProvider } from './components/WalletProvider.tsx';
import { Toaster } from './components/ui/sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletProvider>
      <App />
      <Toaster />
    </SolanaWalletProvider>
  </StrictMode>,
);
