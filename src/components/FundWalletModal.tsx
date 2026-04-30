import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ExternalLink, Wallet, Landmark, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export const FundWalletModal: React.FC<FundWalletModalProps> = ({ isOpen, onClose, address }) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const openMoonPay = () => {
    const apiKey = process.env.MOONPAY_API_KEY || 'customer_api_key';
    window.open(`https://buy.moonpay.com?apiKey=${apiKey}&currencyCode=sol&walletAddress=${address}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] z-[101] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-blue-500" />
                  Fund Wallet
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5 text-white/40">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Your Wallet Address</p>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs font-mono text-white/60 truncate">{address}</code>
                    <Button variant="ghost" size="icon" onClick={copyAddress} className="h-8 w-8 shrink-0 hover:bg-white/10">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={openMoonPay}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-4 text-left group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Buy with Card</p>
                      <p className="text-xs text-white/40">MoonPay, Banxa, or Simplex</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => window.open('https://www.coinbase.com', '_blank')}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-4 text-left group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Transfer from Exchange</p>
                      <p className="text-xs text-white/40">Coinbase, Binance, or Kraken</p>
                    </div>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-400/60 leading-relaxed">
                    Send only SOL to this address. Sending other tokens may result in permanent loss of funds.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
