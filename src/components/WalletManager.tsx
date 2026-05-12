import { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet as WalletIcon, 
  ChevronDown, 
  Copy, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

export const WalletManager: FC = () => {
    const { connected, publicKey, wallet, disconnect, select, wallets, connecting } = useWallet();
    const { setVisible } = useWalletModal();
    const [isResetting, setIsResetting] = useState(false);

    // Deep link detection and handling
    const handleConnectClick = useCallback(async () => {
        if (connected) return;

        // On mobile, if we have a wallet selected but not connected, try to reconnect or open modal
        if (!wallet) {
            setVisible(true);
            return;
        }

        try {
            await select(wallet.adapter.name);
            // On mobile, some adapters need a direct nudge or use deep links
            // The adapter handles this, but we ensure we don't just hang
        } catch (error) {
            console.error('Connection error:', error);
            setVisible(true);
        }
    }, [connected, wallet, setVisible, select]);

    const copyAddress = useCallback(() => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            toast.success('Address Copied', {
                description: 'Neural signature ready for transmission',
            });
        }
    }, [publicKey]);

    const resetSession = useCallback(async () => {
        setIsResetting(true);
        try {
            await disconnect();
            // Clear all local storage related to wallets and WC
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('wallet') || key.includes('wc@2') || key.includes('WalletConnect'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            sessionStorage.clear();
            
            toast.success('Session Reset', {
                description: 'All stale neural links purged. System clean.',
            });
            
            // Reload to ensure clean state
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            setIsResetting(false);
            toast.error('Reset Failed');
        }
    }, [disconnect]);

    if (!connected) {
        return (
            <Button 
                onClick={handleConnectClick}
                disabled={connecting}
                className="!bg-white !text-black !font-black !italic !rounded-xl !px-4 sm:!px-6 !h-10 sm:!h-11 hover:!scale-105 !transition-transform !shadow-xl !shadow-white/5 !text-[10px] sm:!text-xs uppercase tracking-widest relative overflow-hidden group"
            >
                {connecting ? (
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>LINKING...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <WalletIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>CONNECT NEURAL LINK</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="!bg-white/5 !text-white border border-white/10 !font-black !rounded-xl !px-3 sm:!px-4 !h-10 sm:!h-11 hover:!bg-white/10 !transition-all !shadow-lg backdrop-blur-xl group inline-flex items-center justify-center">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/40 transition-colors">
                        {wallet?.adapter.icon ? (
                            <img src={wallet.adapter.icon} alt="" className="w-4 h-4" />
                        ) : (
                            <WalletIcon className="w-3 h-3 text-blue-400" />
                        )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono tracking-tighter truncate">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-[#0a0a0a] border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1 italic">Neural Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase italic tracking-tighter">Connected: {wallet?.adapter.name}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                
                <DropdownMenuItem onClick={copyAddress} className="rounded-xl p-3 focus:bg-white/5 transition-colors cursor-pointer group">
                    <Copy className="w-4 h-4 mr-3 text-white/40 group-hover:text-blue-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Copy Address</span>
                        <span className="text-[9px] text-white/40 font-mono">Neural signature extraction</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setVisible(true)} className="rounded-xl p-3 focus:bg-white/5 transition-colors cursor-pointer group">
                    <RefreshCw className="w-4 h-4 mr-3 text-white/40 group-hover:text-purple-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Switch Wallet</span>
                        <span className="text-[9px] text-white/40 font-mono">Re-route neural pathways</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />

                <DropdownMenuItem 
                    onClick={resetSession}
                    disabled={isResetting}
                    className="rounded-xl p-3 focus:bg-red-500/10 transition-colors cursor-pointer group"
                >
                    <Trash2 className="w-4 h-4 mr-3 text-white/40 group-hover:text-red-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase group-hover:text-red-400">Reset All Sessions</span>
                        <span className="text-[9px] text-white/40 font-mono">Total memory wipe if stuck</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => disconnect()} className="rounded-xl p-3 focus:bg-red-500/10 transition-colors cursor-pointer group">
                    <LogOut className="w-4 h-4 mr-3 text-white/40 group-hover:text-red-500 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase group-hover:text-red-500">Terminate Link</span>
                        <span className="text-[9px] text-white/40 font-mono">Disconnect from Solana cycle</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
