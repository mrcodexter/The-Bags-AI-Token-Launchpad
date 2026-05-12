import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Terminal, Cpu, Zap, Activity, Shield, 
  Brain, Command, Search, Sparkles, 
  ChevronRight, Play, Layout, Globe,
  Wallet as WalletIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';

export function AIOperatingSystem() {
  const [bootStatus, setBootStatus] = useState('Standby');
  const [logs, setLogs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const messages = [
      'Initializing Neural Core...',
      'Scaling AI Swarm...',
      'Mapping Solana Ecosystem Nodes...',
      'Connecting to On-chain Intelligence Hub...',
      'Bags OS v2.0 Tactical Ready.'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${messages[i]}`]);
        i++;
      } else {
        setBootStatus('Active');
        clearInterval(interval);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    if (!connected) {
      toast.error("Neural link required", {
        description: "Please establish a connection to the Solana cycle.",
      });
      return;
    }
    if (!prompt.trim()) return;
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] COMMAND: execute prompt-to-launch "${prompt}"`]);
    setPrompt('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {!connected && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/20 text-white p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
              <WalletIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-black italic tracking-tighter uppercase">NEURAL LINK REQUIRED</CardTitle>
              <CardDescription className="text-white/40 font-medium tracking-tight">Initialize a secure connection to unlock autonomous engine capabilities.</CardDescription>
            </div>
          </div>
          <div className="relative z-10 w-full sm:w-auto wallet-adapter-custom shrink-0">
            <WalletMultiButton className="!bg-white !text-black !font-black !italic !rounded-xl !px-8 !h-12 hover:!scale-105 !transition-transform !shadow-xl !shadow-white/5 !w-full sm:!w-auto" />
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 bg-black/60 border-blue-500/20 text-white backdrop-blur-3xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="overflow-hidden">
                  <CardTitle className="text-lg sm:text-xl font-bold font-mono tracking-tighter truncate">Bags AI Engine</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-white/40 truncate">Autonomous Task Execution Interface</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={`hidden sm:flex text-[9px] ${bootStatus === 'Active' ? 'text-green-400 border-green-400/20' : 'text-yellow-400 border-yellow-400/20'} animate-pulse`}>
                {bootStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6 flex-1 flex flex-col">
            <div className="bg-black/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[200px] h-[30vh] max-h-[400px] font-mono text-[9px] sm:text-[10px] space-y-1 overflow-y-auto scrollbar-hide border border-white/5 flex-1 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-white/20 whitespace-nowrap">{log.split(']')[0]}]</span>
                  <span className={log.includes('COMMAND') ? 'text-blue-400 font-bold' : 'text-white/70'}>{log.split(']')[1]}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <span>_</span>
              </div>
            </div>

            <div className="relative group mt-auto">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex gap-2">
                <Input 
                  placeholder="Ask Bags AI..."
                  className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl text-xs sm:text-sm focus:ring-blue-500/20"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                />
                <Button onClick={handleLaunch} className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                  <Command className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4 sm:space-y-6">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Live Feed
              </div>
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-blue-500/20 text-blue-400 animate-pulse">LIVE</Badge>
            </CardTitle>
            
            <div className="space-y-2 sm:space-y-3 h-[180px] sm:h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {[
                { name: 'Solana AI', symbol: 'SAI', mc: '$1.2M', growth: '+124%' },
                { name: 'Bags Token', symbol: 'BAGS', mc: '$45.8M', growth: '+5.2%' },
                { name: 'Neural Pepe', symbol: 'NPEPE', mc: '$890K', growth: '-12%' },
                { name: 'Core Agent', symbol: 'CORE', mc: '$2.5M', growth: '+88%' },
              ].map((bag, i) => (
                <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center font-bold text-[9px] sm:text-[10px] text-blue-400">
                      {bag.symbol[0]}
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold">${bag.symbol}</p>
                      <p className="text-[8px] sm:text-[9px] text-white/40 truncate max-w-[80px] sm:max-w-none">{bag.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold">{bag.mc}</p>
                    <p className={`text-[8px] sm:text-[9px] ${bag.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{bag.growth}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-500/10 border border-purple-500/20">
               <p className="text-[9px] sm:text-[10px] text-purple-300 italic font-bold leading-relaxed">
                 "Observed 12% increase in meme-token velocity. Recommending AI Launch Insurance."
               </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-8 border-white/10 bg-white/5 hover:bg-white/10 w-full h-10 sm:h-11 rounded-xl gap-2 font-black uppercase tracking-wider text-[9px] sm:text-[10px]">
            Sync Mind <Activity className="w-3 h-3" />
          </Button>
        </Card>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Autonomous Treasury', icon: Layout, color: 'text-orange-500' },
          { label: 'Neural Search', icon: Search, color: 'text-blue-500' },
          { label: 'Meta Prediction', icon: Sparkles, color: 'text-purple-500' },
          { label: 'Consciousness Node', icon: Cpu, color: 'text-green-500' },
        ].map((item, i) => (
          <Card key={i} className="bg-white/5 border-white/10 p-3 sm:p-4 hover:bg-white/10 cursor-pointer transition-all group overflow-hidden relative rounded-xl sm:rounded-2xl min-h-[80px] flex flex-col justify-center shadow-lg">
            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
            <p className="text-[10px] sm:text-xs font-bold leading-tight">{item.label}</p>
            <div className="absolute bottom-0 right-0 p-1 sm:p-2 opacity-[0.03]">
               <item.icon className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </Card>
        ))}
      </div>
    </div>

  );
}
