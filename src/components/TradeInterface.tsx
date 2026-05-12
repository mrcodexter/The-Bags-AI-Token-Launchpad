import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ArrowDownCircle, RefreshCw, Zap, TrendingUp, 
  Settings2, Activity, Wallet, Info,
  ChevronRight, ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { transactionLogger } from '../lib/logger';

export function TradeInterface() {
  const { connected, publicKey } = useWallet();
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = () => {
    if (!connected || !publicKey) {
      toast.error('Neural Link Offline', { description: 'Connect your Solana wallet to commit exchanges.' });
      return;
    }
    if (!payAmount) {
      toast.error('Quantization failed', { description: 'Please enter an input amount.' });
      return;
    }
    setIsSwapping(true);
    toast.info('Neural Swap Initiated', { description: 'Re-routing assets through liquidity nodes.' });
    
    setTimeout(() => {
      setIsSwapping(false);
      
      transactionLogger.log({
        action: 'trade_buy',
        status: 'success',
        wallet: publicKey.toBase58(),
        metadata: {
          from: 'SOL',
          to: 'BAGS',
          payAmount,
          receiveAmount: receiveAmount || '125,000'
        },
        signature: 'sim_' + Math.random().toString(36).substring(2, 12)
      });

      toast.success('Trade Execution Successful', { 
        description: `Exchanged ${payAmount} SOL for ${receiveAmount || '12,500'} BAGS`,
      });
      setPayAmount('');
      setReceiveAmount('');
    }, 3000);
  };

  const handlePayAmountChange = (val: string) => {
    setPayAmount(val);
    if (val) {
      // Mock exchange rate: 1 SOL = 125,000 BAGS
      const calc = (parseFloat(val) * 125000).toLocaleString();
      setReceiveAmount(calc);
    } else {
      setReceiveAmount('');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">NEURAL SWAP</h2>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">Asset Re-quantization Protocol</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>

      <Card className="bg-black/60 border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-40 bg-blue-600/5 blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-colors" />
        
        <CardContent className="p-6 sm:p-8 space-y-4">
          {/* Pay Section */}
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black text-white/40 tracking-widest">You Discard</Label>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase font-bold">
                   <Wallet className="w-3 h-3" /> Bal: 42.50 SOL
                </div>
             </div>
             <div className="flex items-center gap-4">
                <input 
                  type="number"
                  value={payAmount}
                  onChange={(e) => handlePayAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-3xl font-black italic tracking-tighter w-full placeholder:text-white/10"
                />
                <button className="flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-xl border border-white/10 transition-all shrink-0">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-black/20" />
                  </div>
                  <span className="text-xs font-black italic uppercase tracking-tighter">SOL</span>
                </button>
             </div>
          </div>

          {/* Swap Divider */}
          <div className="relative h-2 flex items-center justify-center">
             <div className="absolute inset-x-0 h-[1px] bg-white/5" />
             <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center text-blue-500 relative z-10 shadow-xl group-hover:rotate-180 transition-transform duration-500">
                <ArrowDownCircle className="w-6 h-6" />
             </div>
          </div>

          {/* Receive Section */}
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black text-white/40 tracking-widest">You Acquire</Label>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase font-bold">
                   <Wallet className="w-3 h-3" /> Bal: 1.2M
                </div>
             </div>
             <div className="flex items-center gap-4">
                <input 
                  readOnly
                  value={receiveAmount}
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-3xl font-black italic tracking-tighter w-full placeholder:text-white/10"
                />
                <button className="flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-xl border border-white/10 transition-all shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                     <Zap className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="text-xs font-black italic uppercase tracking-tighter">BAGS</span>
                </button>
             </div>
          </div>

          {/* Details */}
          <div className="px-4 py-2 space-y-2">
             <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-white/20">
                <span>Exchange Rate</span>
                <span>1 SOL ≈ 125,000 BAGS</span>
             </div>
             <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-white/20">
                <span>Neural Slippage</span>
                <span className="text-green-500/60">0.5% (Optimized)</span>
             </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 sm:p-8 pt-0">
           <Button 
              onClick={handleSwap}
              disabled={isSwapping}
              className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl gap-3 font-black uppercase italic tracking-tighter text-lg shadow-xl relative overflow-hidden group active:scale-95 transition-all"
           >
              {isSwapping ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Recalibrating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black" />
                  Commit Exchange
                </>
              )}
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform" />
           </Button>
        </CardFooter>
      </Card>

      {/* Floating Info */}
      <div className="flex items-center justify-center gap-4 p-4 glass rounded-2xl border-white/5 border-none shadow-xl">
         <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-[10px] uppercase font-black font-mono">1.4s Speed</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] uppercase font-black font-mono">Low Impact</span>
         </div>
      </div>
    </div>
  );
}
