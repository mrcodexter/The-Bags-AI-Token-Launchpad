import React, { useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope';
import { 
    TrustWalletAdapter,
    CoinbaseWalletAdapter,
    TokenPocketWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from 'sonner';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new BackpackWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new TrustWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TokenPocketWalletAdapter(),
            new WalletConnectWalletAdapter({
                network,
                options: {
                    projectId: 'c6677464082211603ba077435f1f728c', // Example project ID
                    metadata: {
                        name: 'The Bags',
                        description: 'Solana Token Studio',
                        url: 'https://thebags.solana',
                        icons: ['https://picsum.photos/200']
                    }
                }
            }),
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) => {
            console.error('Wallet Error:', error);
            toast.error('Wallet Error', {
                description: error.message || 'An error occurred with the wallet connection.'
            });
        },
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect localStorageKey="bags-wallet-session" onError={onError}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
