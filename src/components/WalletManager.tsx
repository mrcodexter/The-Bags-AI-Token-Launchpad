import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet as WalletIcon, 
  ChevronDown, 
  Copy, 
  LogOut, 
  RefreshCw, 
  Smartphone,
  Trash2,
  Zap,
  ArrowRight,
  Shield,
  ExternalLink,
  X
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { toast } from 'sonner';

// Mobile detection
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const isInAppBrowser = () => {
    if (typeof window === 'undefined') return false;
    return !!((window as any).solana || (window as any).phantom || (window as any).solflare || (window as any).trustWallet || (window as any).ethereum);
};

// Emergency cleanup of stale sessions
const clearStaleWalletSessions = () => {
    if (typeof window === 'undefined') return;
    console.log('[DEBUG] Purging stale neural links...');
    
    // Nuclear option: clear everything to ensure no stale state
    localStorage.clear();
    sessionStorage.clear();
    
    // Explicitly set some flags if needed by the adapter, but usually clearing is enough
    console.log('[DEBUG] Memory banks wiped successfully.');
};

export const WalletManager: FC = () => {
    const { connected, publicKey, wallet, disconnect, select, wallets, connecting } = useWallet();
    const { setVisible } = useWalletModal();
    const [isResetting, setIsResetting] = useState(false);
    const [showMobileModal, setShowMobileModal] = useState(false);

    // Filter wallets for featured display - STRICTLY Trust and Binance
    const featuredWallets = useMemo(() => {
        return wallets
            .filter(w => {
                const name = w.adapter.name.toLowerCase();
                // ONLY Trust and WalletConnect (which we use for Binance)
                return name.includes('trust') || name.includes('walletconnect');
            })
            .sort((a, b) => {
                const aName = a.adapter.name.toLowerCase();
                if (aName.includes('trust')) return -1;
                return 1;
            });
    }, [wallets]);

    // Clear stale state on mount if not connected
    useEffect(() => {
        if (!connected && !connecting) {
            // Check if we have stale keys but no active connection
            const lastWallet = localStorage.getItem('solana-wallet-adapter-last-wallet');
            if (lastWallet) {
                console.log('[DEBUG] Detected stale session keys without connection. Cleaning up.');
                clearStaleWalletSessions();
            }
        }
    }, [connected, connecting]);

    // Monitor for disconnects to clear cache
    useEffect(() => {
        if (!connected && !connecting) {
            const lastWallet = localStorage.getItem('solana-wallet-adapter-last-wallet');
            if (lastWallet) {
                console.log('[DEBUG] Connection lost or terminated. Purging local cache.');
                clearStaleWalletSessions();
            }
        }
    }, [connected, connecting]);

    const handleConnectClick = useCallback(() => {
        if (connected) return;
        
        // Mobile-first approach: Show selection modal immediately for better control
        if (isMobileDevice()) {
            setShowMobileModal(true);
            return;
        }

        // If in-app browser on desktop (unlikely but possible), show selector
        if (isInAppBrowser()) {
            setVisible(true);
            return;
        }

        setVisible(true);
    }, [connected, setVisible]);

    const handleMobileWalletSelect = useCallback(async (walletName: string) => {
        setShowMobileModal(false);
        console.log(`[DEBUG] Initiating mobile link for: ${walletName}`);
        
        // Full reset before new connection attempt to prevent session mismatch
        clearStaleWalletSessions();

        // Deep Link logic for Mobile Browsers
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        
        let deepLink = '';
        if (walletName.toLowerCase().includes('trust')) {
            // For Trust Wallet, we often use WalletConnect as the bridge in external browsers
            // Set the preference for WC to pick up Trust Wallet
            localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', JSON.stringify({ name: 'Trust Wallet', href: 'trust://' }));
            walletName = 'WalletConnect';
        } else if (walletName.toLowerCase().includes('binance')) {
            // For Binance Web3 Wallet, we use WalletConnect but target their deep link
            localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', JSON.stringify({ name: 'Binance Web3 Wallet', href: 'bnc://app.binance.com/' }));
            walletName = 'WalletConnect';
            deepLink = `bnc://app.binance.com/web3wallet/dapp?url=${encodedUrl}`;
        }

        try {
            console.log(`[DEBUG] Selecting adapter: ${walletName}`);
            await select(walletName as any);
            
            // If we have a specific deep link, we trigger it
            if (deepLink) {
                setTimeout(() => {
                    window.location.href = deepLink;
                }, 800);
            }
        } catch (error) {
            console.error('[DEBUG] Failed to establish mobile neural link:', error);
            toast.error('Connection Aborted');
            clearStaleWalletSessions();
        }
    }, [select]);

    const handleDisconnect = useCallback(async () => {
        console.log('[DEBUG] Terminating connection...');
        try {
            await disconnect();
            clearStaleWalletSessions();
            toast.success('Session Terminated', {
                description: 'Neural signature purged from cache.',
            });
        } catch (error) {
            console.error('[DEBUG] Disconnect failed:', error);
            clearStaleWalletSessions();
            window.location.reload();
        }
    }, [disconnect]);

    const resetWallet = useCallback(async () => {
        setIsResetting(true);
        console.log('[DEBUG] Executing full system purge...');
        try {
            if (connected) {
                await disconnect();
            }
            clearStaleWalletSessions();
            toast.success('System Reset Complete', {
                description: 'All neural signatures purged. Refreshing...',
            });
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            setIsResetting(false);
            console.error('[DEBUG] Purge failed:', error);
            clearStaleWalletSessions();
            setTimeout(() => window.location.reload(), 1000);
        }
    }, [connected, disconnect]);

    const copyAddress = useCallback(() => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            toast.success('Address Copied');
        }
    }, [publicKey]);

    if (!connected) {
        return (
            <>
                <Button 
                    onClick={handleConnectClick}
                    disabled={connecting}
                    className="!bg-white !text-black !font-black !italic !rounded-xl !px-4 sm:!px-6 !h-10 sm:!h-11 hover:!scale-105 !transition-transform !shadow-xl !shadow-white/5 !text-[10px] sm:!text-xs uppercase tracking-widest relative overflow-hidden group border-none"
                >
                    {connecting ? (
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>SYNCING...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-black" />
                            <span>CONNECT OS</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                </Button>

                <Dialog open={showMobileModal} onOpenChange={setShowMobileModal}>
                    <DialogContent className="bg-[#050505] border-white/5 text-white p-0 overflow-hidden sm:rounded-3xl max-w-[95vw] w-[400px] z-[1000]">
                        <div className="absolute inset-0 bg-blue-600/5 blur-3xl pointer-events-none" />
                        
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">Neural Link</h2>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Select Interface Protocol</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowMobileModal(false)} className="text-white/20 hover:text-white">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {featuredWallets.length > 0 ? (
                                    featuredWallets.map((w) => (
                                        <button
                                            key={w.adapter.name}
                                            onClick={() => handleMobileWalletSelect(w.adapter.name)}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group active:scale-95"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors shrink-0">
                                                    {w.adapter.icon && (
                                                        <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-sm tracking-tight">{w.adapter.name}</p>
                                                    <p className="text-[9px] text-white/40 uppercase font-black italic">Production Ready</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-xs text-white/40">No wallets detected</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        setShowMobileModal(false);
                                        setVisible(true);
                                    }}
                                    className="w-full p-4 bg-transparent hover:bg-white/5 rounded-2xl border border-dashed border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Smartphone className="w-3 h-3" />
                                    <span>Other Interfaces</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] text-blue-300 uppercase font-black tracking-widest opacity-60">Mobile Protocol Active</span>
                            </div>
                            <span className="text-[9px] text-white/20 font-mono tracking-tighter italic">Bags OS v1.0.42</span>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="!bg-white/5 !text-white border border-white/10 !font-black !rounded-xl !px-3 sm:!px-4 !h-10 sm:!h-11 hover:!bg-white/10 !transition-all !shadow-lg backdrop-blur-xl group inline-flex items-center justify-center outline-none shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/40 transition-colors">
                        {wallet?.adapter.icon ? (
                            <img src={wallet.adapter.icon} alt="" className="w-4 h-4" />
                        ) : (
                            <WalletIcon className="w-3 h-3 text-blue-400" />
                        )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono tracking-tighter truncate font-bold">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/40 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-[1000] outline-none">
                <DropdownMenuLabel className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                        <p className="text-[9px] uppercase font-black tracking-widest text-white/30 italic">Linked Interface</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase italic tracking-tighter">{wallet?.adapter.name}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                
                <DropdownMenuItem onClick={copyAddress} className="rounded-xl p-3 focus:bg-white/5 transition-colors cursor-pointer group outline-none m-1">
                    <Copy className="w-4 h-4 mr-3 text-white/40 group-hover:text-blue-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Copy Address</span>
                        <span className="text-[9px] text-white/40 font-mono italic">Extract signature</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => {
                     if (isMobileDevice()) setShowMobileModal(true);
                     else setVisible(true);
                }} className="rounded-xl p-3 focus:bg-white/5 transition-colors cursor-pointer group outline-none m-1">
                    <RefreshCw className="w-4 h-4 mr-3 text-white/40 group-hover:text-purple-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Re-route Link</span>
                        <span className="text-[9px] text-white/40 font-mono italic">Switch interface</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />

                <DropdownMenuItem 
                    onClick={resetWallet}
                    disabled={isResetting}
                    className="rounded-xl p-3 focus:bg-red-500/10 transition-colors cursor-pointer group outline-none m-1"
                >
                    <Trash2 className="w-4 h-4 mr-3 text-white/40 group-hover:text-red-400 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase group-hover:text-red-400">Total Wipe</span>
                        <span className="text-[9px] text-white/40 font-mono italic">Purge all sessions</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleDisconnect} className="rounded-xl p-3 focus:bg-red-500/10 transition-colors cursor-pointer group outline-none m-1">
                    <LogOut className="w-4 h-4 mr-3 text-white/40 group-hover:text-red-500 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase group-hover:text-red-500">Terminate</span>
                        <span className="text-[9px] text-white/40 font-mono italic">Disconnect cycle</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
