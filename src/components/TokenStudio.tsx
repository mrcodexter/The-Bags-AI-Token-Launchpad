import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Rocket, Coins, Zap, Shield, Search, 
  ArrowUpRight, Info, Plus, Trash2, 
  Cpu, Activity, CheckCircle2, FlaskConical,
  Wand2, Network, Fingerprint, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function TokenStudio() {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '1000000',
    description: '',
    decimals: '9'
  });
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    if (!formData.name || !formData.symbol) {
      toast.error('Token identities missing', { description: 'Name and symbol are required for neural imprint.' });
      return;
    }
    setIsDeploying(true);
    toast.info('Initiating Token Deployment...', { description: 'Hashing neural metadata onto Solana blockspace.' });
    
    // Simulate deployment steps
    setTimeout(() => toast.info('Creating Mint Account...'), 1000);
    setTimeout(() => toast.info('Initializing Metadata...'), 2000);
    setTimeout(() => {
      setIsDeploying(false);
      toast.success('Token Successfully Deployed!', { 
        description: `${formData.name} (${formData.symbol}) is now live on-chain.`,
      });
    }, 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">Token Studio</h2>
          <p className="text-white/40 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-1">Imprint new tokens onto the Solana Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/20 animate-pulse uppercase tracking-widest text-[9px] px-3">On-Chain Ready</Badge>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <Card className="lg:col-span-3 bg-black/60 border-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <CardHeader className="p-6 sm:p-8 border-b border-white/5">
             <div className="flex items-center gap-3 mb-2">
                <FlaskConical className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base uppercase font-black italic tracking-widest">Token Parameters</CardTitle>
             </div>
             <CardDescription className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Define the technical DNA of your asset</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Token Name</Label>
                <div className="relative group">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Bags AI"
                    className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/10 transition-all font-bold placeholder:text-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Symbol</Label>
                <div className="relative group">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    placeholder="BAGS"
                    className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/10 transition-all font-bold placeholder:text-white/10 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Initial Supply</Label>
                <Input 
                  type="number"
                  value={formData.supply}
                  onChange={(e) => setFormData({...formData, supply: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/10 transition-all font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Decimals</Label>
                <Input 
                  type="number"
                  value={formData.decimals}
                  onChange={(e) => setFormData({...formData, decimals: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/10 transition-all font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Project Summary</Label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the neural purpose of this token..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[100px] text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-white/10"
              />
            </div>
          </CardContent>
          <CardFooter className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/5">
             <Button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl gap-3 font-black uppercase italic tracking-tighter text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
             >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Neural Imprint in Progress
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Launch Token to Solana
                  </>
                )}
             </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
           <Card className="bg-white/5 border-white/5 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm uppercase font-black italic tracking-widest">Market Preview</h3>
              </div>
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center font-black text-2xl text-white italic border border-white/5 shadow-2xl">
                    {formData.symbol ? formData.symbol[0] : '?'}
                 </div>
                 <div>
                    <p className="text-xl font-black italic uppercase tracking-tighter text-white">{formData.name || 'Untitled Agent'}</p>
                    <p className="text-blue-500 font-mono font-bold text-xs">${formData.symbol || 'SYMBOL'}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/5">
                    <div className="text-left">
                       <p className="text-[8px] uppercase font-black text-white/20 tracking-widest">Initial MC</p>
                       <p className="text-xs font-bold font-mono">$12.5k</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] uppercase font-black text-white/20 tracking-widest">Bonding Curve</p>
                       <p className="text-xs font-bold font-mono text-green-500">Standard</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Shield className="w-12 h-12" />
              </div>
              <div className="relative z-10 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Network className="w-3 h-3" /> AI Verification
                 </h3>
                 <p className="text-xs text-white/70 italic leading-relaxed">
                   "Neural scanner indicates a 98% validity score for this configuration. Automated launch insurance recommended for high-volatility imprints."
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Neural integrity verified.
                 </div>
              </div>
           </Card>

           <Card className="bg-black/40 border-white/5 p-6 rounded-3xl border-dashed">
              <div className="text-center space-y-2">
                 <p className="text-[10px] uppercase font-black tracking-widest text-white/20">System Cost</p>
                 <p className="text-2xl font-black italic">~0.05 SOL</p>
                 <p className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">Network fee + OS tax included</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
