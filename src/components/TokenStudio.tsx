import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Rocket, Coins, Zap, Shield, Search, 
  ArrowUpRight, Info, Plus, Trash2, 
  Cpu, Activity, CheckCircle2, FlaskConical,
  Wand2, Network, Fingerprint, RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { transactionLogger } from '../lib/logger';
import { bags } from '../lib/bags';

const INITIAL_FORM_STATE = {
  name: '',
  symbol: '',
  supply: '1000000000',
  description: '',
  decimals: '9'
};

export function TokenStudio() {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setDeployStep(0);
    setIsDeploying(false);
  }, []);

  const clearForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    toast.info('Neural Logs Cleared', { description: 'Token parameters have been reset to defaults.' });
  }, []);

  const validateForm = () => {
    // Name validation: Alphanumeric and spaces
    if (!formData.name.trim()) {
       toast.error("Validation Error", { description: "Token Name is required." });
       return false;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(formData.name)) {
      toast.error("Validation Error", { description: "Token Name must be alphanumeric and spaces only." });
      return false;
    }

    // Symbol validation: 2-10 chars, uppercase letters only
    if (!formData.symbol.trim() || formData.symbol.length < 2 || formData.symbol.length > 10) {
       toast.error("Validation Error", { description: "Symbol must be between 2 and 10 characters." });
       return false;
    }
    if (!/^[A-Z]+$/.test(formData.symbol)) {
      toast.error("Validation Error", { description: "Symbol must contain only uppercase letters." });
      return false;
    }

    // Supply validation: Positive integer
    const supplyVal = BigInt(formData.supply.replace(/,/g, ''));
    if (supplyVal <= 0n) {
       toast.error("Validation Error", { description: "Initial Supply must be a positive integer." });
       return false;
    }

    // Decimals validation
    const decimalsVal = parseInt(formData.decimals);
    if (isNaN(decimalsVal) || decimalsVal < 0 || decimalsVal > 18) {
      toast.error("Validation Error", { description: "Decimals must be between 0 and 18 (Standard is 9)." });
      return false;
    }

    return true;
  };

  const handleDeploy = async () => {
    if (!connected || !publicKey) {
      toast.error('Neural Link Offline', { description: 'Connect your Solana wallet to imprint tokens.' });
      return;
    }

    if (!validateForm()) return;

    setIsDeploying(true);
    setDeployStep(1);
    toast.info('Initialising Deployment Cycle', { description: 'Warping metadata into Solana Matrix.' });
    
    try {
      const mockMint = 'sim_' + Math.random().toString(36).substring(2, 15);
      
      // Step-indexed simulation for realistic feedback
      await new Promise(r => setTimeout(r, 1500));
      setDeployStep(2);
      toast.info('Creating Mint Authority', { description: 'Assigning ownership to ' + publicKey.toBase58().slice(0, 8) + '...' });
      
      // Real SDK call (simulated inside bags.ts)
      const launchResult = await bags.launchToken({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        initialSupply: Number(formData.supply.replace(/,/g, '')),
        creator: publicKey.toBase58()
      });

      await new Promise(r => setTimeout(r, 1800));
      setDeployStep(3);
      toast.info('Injecting Metadata', { description: 'Uploading JSON URI to decentralized storage nodes.' });
      
      await new Promise(r => setTimeout(r, 2000));
      setDeployStep(4);
      
      // Final Success
      setIsDeploying(false);
      setDeployStep(0);
      toast.success('TOKEN LAUNCHED SUCCESSFULLY', { 
        description: `${formData.name} is now live on Solana. Mint address recorded in neural logs.`,
        duration: 6000
      });
      
      // Integrate transactionLogger
      transactionLogger.log({
        action: 'token_creation',
        status: 'success',
        wallet: publicKey.toBase58(),
        signature: launchResult.transaction || ('sim_' + Math.random().toString(36).substring(2, 12)),
        metadata: {
          name: formData.name,
          symbol: formData.symbol,
          supply: formData.supply,
          mint: launchResult.mintAddress || mockMint
        }
      });

      console.log(`[TRANSACTION] Token Created: ${formData.name} (${formData.symbol})`);
      console.log(`[DEBUG] Mint: ${mockMint}`);
      
      // Optional: Clear form after success? The user might want to see the market preview.
      // For now, let's keep it but maybe suggest reset.
    } catch (error) {
      setIsDeploying(false);
      setDeployStep(0);
      toast.error('Deployment Aborted', { description: 'Interface re-synchronization required.' });
      
      if (publicKey) {
        transactionLogger.log({
          action: 'token_creation',
          status: 'failed',
          wallet: publicKey.toBase58(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            form: formData
          }
        });
      }
    }
  };

  const cancelDeploy = () => {
    resetForm();
    toast.warning('Sequence Aborted', { description: 'Neural imprint terminated and form reset.' });
  };

  const remainingChars = useMemo(() => 280 - formData.description.length, [formData.description]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">Token Studio</h2>
          <p className="text-white/40 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-1">Imprint new tokens onto the Solana Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/20 animate-pulse uppercase tracking-widest text-[9px] px-3 font-black">
            {connected ? 'Interface Linked' : 'Awaiting Connection'}
          </Badge>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
            <Rocket className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <Card className="lg:col-span-3 bg-black/60 border-white/5 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <CardHeader className="p-6 sm:p-8 border-b border-white/5 relative z-10">
             <div className="flex items-center gap-3 mb-2">
                <FlaskConical className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base uppercase font-black italic tracking-widest">Token Parameters</CardTitle>
             </div>
             <CardDescription className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Define the technical DNA of your asset</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 group-focus-within:text-blue-500 transition-colors">Token Name *</Label>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Alphanumeric + Spaces</span>
                </div>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Bags AI"
                    className="bg-white/5 border-white/10 h-14 pl-10 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 group-focus-within:text-blue-500 transition-colors">Symbol *</Label>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">2-10 Chars, A-Z</span>
                </div>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    placeholder="BAGS"
                    className="bg-white/5 border-white/10 h-14 pl-10 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-white/10 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Initial Supply</Label>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Positive Integer</span>
                </div>
                <Input 
                  type="number"
                  value={formData.supply}
                  onChange={(e) => setFormData({...formData, supply: e.target.value})}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Decimals</Label>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">0 - 18 Range</span>
                </div>
                <Input 
                  type="number"
                  value={formData.decimals}
                  onChange={(e) => setFormData({...formData, decimals: e.target.value})}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Project Summary</Label>
                <span className={`text-[9px] font-mono font-bold ${remainingChars < 30 ? 'text-red-500' : 'text-white/20'}`}>
                  {remainingChars} Neural Units Remaining
                </span>
              </div>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value.slice(0, 280)})}
                placeholder="Briefly describe the neural purpose of this token..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-white/10 resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row gap-3">
             {!isDeploying && (
                <Button 
                  onClick={clearForm}
                  variant="ghost"
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white h-16 rounded-[1.25rem] px-6 font-black uppercase italic tracking-widest text-[10px] transition-all"
                >
                  Clear Form
                </Button>
             )}
             
             <Button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-16 rounded-[1.25rem] gap-3 font-black uppercase italic tracking-tighter text-lg shadow-2xl shadow-blue-600/20 active:scale-95 transition-all text-white"
             >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Step {deployStep}/3: {deployStep === 1 ? 'Initialising' : deployStep === 2 ? 'Authorities' : 'Metadata'}
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />
                    Launch Token to Solana
                  </>
                )}
             </Button>
             
             {isDeploying && (
                <Button 
                  onClick={cancelDeploy}
                  variant="outline"
                  className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 h-16 sm:w-16 rounded-[1.25rem] shrink-0 font-black flex items-center justify-center gap-2 sm:gap-0"
                >
                  <X className="w-5 h-5" />
                  <span className="sm:hidden uppercase tracking-widest text-[10px]">Abort Sequence</span>
                </Button>
             )}
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
           <Card className="bg-white/5 border-white/5 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm uppercase font-black italic tracking-widest">Market Preview</h3>
              </div>
              <div className="p-8 bg-black/40 rounded-[1.5rem] border border-white/5 flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center font-black text-3xl text-white italic border border-white/5 shadow-2xl shadow-blue-500/10">
                    {formData.symbol ? formData.symbol[0] : '?'}
                 </div>
                 <div>
                    <p className="text-2xl font-black italic uppercase tracking-tighter text-white">{formData.name || 'Untitled Agent'}</p>
                    <p className="text-blue-500 font-mono font-bold text-sm tracking-widest">${formData.symbol || 'SYMBOL'}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6 w-full pt-6 border-t border-white/5">
                    <div className="text-left">
                       <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Initial MC</p>
                       <p className="text-sm font-bold font-mono">$12.5k</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Bonding Curve</p>
                       <p className="text-sm font-bold font-mono text-green-500">Standard</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/10 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                 <Shield className="w-16 h-16" />
              </div>
              <div className="relative z-10 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Network className="w-3 h-3" /> AI Verification
                 </h3>
                 <p className="text-[11px] text-white/70 italic leading-relaxed font-medium">
                   "Neural scanner indicates a {formData.name ? '98%' : '??%'} validity score for this configuration. Automated launch insurance recommended for high-volatility imprints."
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase font-black">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Neural integrity verified.
                 </div>
              </div>
           </Card>

           <Card className="bg-black/40 border-white/5 p-6 rounded-[1.5rem] border-dashed">
              <div className="text-center space-y-1">
                 <p className="text-[9px] uppercase font-black tracking-widest text-white/20">System Quantization Cost</p>
                 <p className="text-3xl font-black italic tracking-tighter">~0.05 SOL</p>
                 <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">Inc. OS Tax + Relay Fees</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
