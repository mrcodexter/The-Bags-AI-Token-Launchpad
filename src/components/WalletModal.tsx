import React, { useState, useMemo } from 'react';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Wallet as WalletIcon, Smartphone, 
  ExternalLink, Check, ChevronRight, Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallets, select, wallet: activeWallet, connecting } = useWallet();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'qr'>('list');
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<{ name: string; message: string } | null>(null);

  const filteredWallets = useMemo(() => {
    const list = [...wallets];
    
    // Add virtual wallets that should trigger WalletConnect fallback
    const virtualWallets = [
      { name: 'Binance Wallet', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/binance.svg' },
      { name: 'OKX Wallet', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/okx.svg' },
      { name: 'Trust Wallet', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/trust.svg' },
      { name: 'Coinbase Wallet', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/coinbase.svg' },
    ];

    virtualWallets.forEach(v => {
      if (!list.find(w => w.adapter.name === v.name)) {
        // Create a mock wallet object for the UI
        list.push({
          adapter: {
            name: v.name,
            icon: v.icon,
            readyState: 'NotDetected',
            url: 'https://walletconnect.com',
          },
          readyState: 'NotDetected',
        } as any);
      }
    });

    return list.filter(w => 
      w.adapter.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      // WalletConnect always at the top if not searching
      if (!search) {
        if (a.adapter.name === 'WalletConnect') return -1;
        if (b.adapter.name === 'WalletConnect') return 1;
      }
      // Sort installed wallets first
      if (a.readyState === 'Installed' && b.readyState !== 'Installed') return -1;
      if (a.readyState !== 'Installed' && b.readyState === 'Installed') return 1;
      return 0;
    });
  }, [wallets, search]);

  const handleSelect = async (wallet: Wallet) => {
    setConnectingWallet(wallet.adapter.name);
    setError(null);
    try {
      if (wallet.adapter.name === 'WalletConnect') {
        await select(wallet.adapter.name);
        onClose();
        return;
      }

      if (wallet.readyState === 'NotDetected') {
        // Fallback to WalletConnect if direct wallet is not detected
        const wcWallet = wallets.find(w => w.adapter.name === 'WalletConnect');
        if (wcWallet) {
          await select(wcWallet.adapter.name);
          toast.info(`Connecting ${wallet.adapter.name} via WalletConnect`);
          onClose();
        } else {
          window.open(wallet.adapter.url, '_blank');
        }
      } else {
        await select(wallet.adapter.name);
        // We don't close immediately if it's a browser extension as it might take time
        // The useEffect or useWallet state will handle it
      }
    } catch (err: any) {
      console.error('Wallet selection error:', err);
      setError({ name: wallet.adapter.name, message: err.message || 'Failed to connect' });
      toast.error('Failed to connect wallet');
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md w-full bg-[#0a0a0a] border-t lg:border border-white/10 rounded-t-[2rem] lg:rounded-[2rem] z-[101] overflow-hidden shadow-2xl"
          >
            {/* Handle for mobile */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 lg:hidden" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Connect Wallet
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/40">SOLANA</Badge>
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Select your preferred wallet to continue</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-white/5 text-white/40"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input 
                  placeholder="Search wallets..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:ring-white/10"
                />
              </div>

              <div className="h-[400px] overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                <div className="space-y-2">
                  {filteredWallets.map((w) => {
                    const isConnecting = connectingWallet === w.adapter.name || (connecting && activeWallet?.adapter.name === w.adapter.name);
                    const isConnected = activeWallet?.adapter.name === w.adapter.name;
                    const hasError = error?.name === w.adapter.name;

                    return (
                      <div key={w.adapter.name} className="space-y-1">
                        <button
                          onClick={() => handleSelect(w)}
                          disabled={connecting && !isConnecting}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                            isConnected 
                              ? 'bg-white/10 border-white/20 ring-1 ring-white/20' 
                              : 'bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-white/5 p-2 flex items-center justify-center transition-transform ${!isConnecting && 'group-hover:scale-110'}`}>
                              {isConnecting ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <img 
                                  src={w.adapter.icon} 
                                  alt={w.adapter.name} 
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + w.adapter.name;
                                  }}
                                />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white flex items-center gap-2">
                                {w.adapter.name}
                                {w.readyState === 'Installed' && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                )}
                              </div>
                              <div className="text-xs text-white/40">
                                {w.readyState === 'Installed' ? 'Installed' : w.adapter.name === 'WalletConnect' ? 'Universal Connection' : 'Connect via WalletConnect'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isConnected ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-500/20 text-green-500 border-none">CONNECTED</Badge>
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                            ) : isConnecting ? (
                              <span className="text-[10px] text-white/40 font-mono">CONNECTING...</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                            )}
                          </div>
                        </button>
                        {hasError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {error.message}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}

                  {filteredWallets.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-white/40">No wallets found matching "{search}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Mobile User?</p>
                    <p className="text-[10px] text-blue-400/60">WalletConnect supports 100+ mobile wallets including Trust & Coinbase.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
