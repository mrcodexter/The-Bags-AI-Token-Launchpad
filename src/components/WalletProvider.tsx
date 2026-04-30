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
    BitKeepWalletAdapter,
    MathWalletAdapter,
    SafePalWalletAdapter,
    Coin98WalletAdapter,
    LedgerWalletAdapter,
    NightlyWalletAdapter,
    XDEFIWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from 'sonner';
import { useNetwork } from '../context/NetworkContext';

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { network } = useNetwork();

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
            new BitKeepWalletAdapter(),
            new MathWalletAdapter(),
            new SafePalWalletAdapter(),
            new Coin98WalletAdapter(),
            new LedgerWalletAdapter(),
            new NightlyWalletAdapter(),
            new XDEFIWalletAdapter(),
            new WalletConnectWalletAdapter({
                network,
                options: {
                    projectId: 'c6677464082211603ba077435f1f728c', // Using existing working ID
                    metadata: {
                        name: 'The Bags',
                        description: 'Solana Token Studio',
                        url: window.location.origin,
                        icons: ['https://picsum.photos/seed/bags/200/200']
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
                {children}
            </WalletProvider>
        </ConnectionProvider>
    );
};
