import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // Default to mainnet, but allow devnet override via env
    const network = import.meta.env.VITE_SOLANA_NETWORK === 'devnet' 
        ? WalletAdapterNetwork.Devnet 
        : WalletAdapterNetwork.Mainnet;
    
    // Provide a reliable RPC endpoint
    const endpoint = useMemo(() => 
        import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network), 
    [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new BackpackWalletAdapter(),
            new TrustWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new GlowWalletAdapter(),
            new WalletConnectWalletAdapter({
                network: network,
                options: {
                    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '825902120dbbaaba30164627d2c3882f',
                    metadata: {
                        name: 'Bags OS',
                        description: 'Autonomous Solana AI Operating System',
                        url: window.location.origin,
                        icons: [`${window.location.origin}/logo.png`],
                    },
                },
            }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
