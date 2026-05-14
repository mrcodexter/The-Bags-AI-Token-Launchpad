import { useState, useEffect, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { 
  Rocket, TrendingUp, BarChart3, Brain, Activity, 
  Settings, Shield, Zap, Layout, Command,
  Terminal, Globe, Users, Network, Database,
  Search, Lock, Compass, Sparkles, History,
  ChevronRight, ArrowUpRight, Menu, X, Bell, LogOut, ArrowLeftRight,
  Briefcase, Fingerprint, Waves, Target, Share2, Download, Coins,
  Wallet as WalletIcon, Copy, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletManager } from './components/WalletManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

// Lazy load feature components
import { AIOperatingSystem } from './components/AIOperatingSystem';
import { AgentSociety } from './components/AgentSociety';
import { EcosystemBrain } from './components/EcosystemBrain';
import { OnchainIntelligence } from './components/OnchainIntelligence';
import { SocialViralEngine } from './components/SocialViralEngine';
import { TokenEconomics } from './components/TokenEconomics';
import { Onboarding } from './components/Onboarding';
import { TokenAnalytics } from './components/TokenAnalytics';
import { TokenStudio } from './components/TokenStudio';
import { TradeInterface } from './components/TradeInterface';
import { 
  CompetitiveFeatures, 
  EnterpriseScale, 
  FutureTech, 
  ImmersiveExperience 
} from './components/stubs';

import { transactionLogger, TransactionLog } from './lib/logger';

// Mock initial data if no real logs exist, to keep the UI populated as an example
const DEFAULT_LOGS: TransactionLog[] = [
  { id: '1', timestamp: Date.now() - 3600000, action: 'token_creation', status: 'success', wallet: 'demo', metadata: { name: 'PEPE_AI', symbol: 'PEPE', supply: '1B' } },
  { id: '2', timestamp: Date.now() - 7200000, action: 'trade_buy', status: 'success', wallet: 'demo', metadata: { token: 'SOL -> BAGS', amount: '12.5 SOL' } },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('launch');
  const [logs, setLogs] = useState<TransactionLog[]>([]);

  // Sync logs
  useEffect(() => {
    const refreshLogs = () => {
      const realLogs = transactionLogger.getLogs();
      setLogs(realLogs.length > 0 ? realLogs : DEFAULT_LOGS);
    };
    refreshLogs();
    window.addEventListener('bags_logs_updated', refreshLogs);
    return () => window.removeEventListener('bags_logs_updated', refreshLogs);
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bags-os-theme') as 'dark' | 'light') || 'dark';
  });
  
  const { connected, publicKey, disconnecting, connecting, select, wallets, wallet, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  // Handle theme persistence
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('bags-os-theme', theme);
  }, [theme]);

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search features"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notifications for wallet events
  useEffect(() => {
    if (connected && publicKey) {
      toast.success(`Neural Link Established`, {
        description: `Wallet ${publicKey.toBase58().slice(0, 4)}... connected to Bags OS`,
        duration: 3000,
      });
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (disconnecting) {
      toast.info('Neural Link Terminating...', { duration: 2000 });
    }
  }, [disconnecting]);

  // Handle resizing for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsSidebarOpen(isLarge);
      if (isLarge) setIsMobileSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>
        <div className="w-full max-w-4xl">
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        </div>
      </div>
    );
  }

  const NavItems = [
    { id: 'launch', label: 'Launchpad', icon: Rocket, color: 'text-blue-500' },
    { id: 'trade', label: 'Trade', icon: ArrowLeftRight, color: 'text-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-green-500' },
    { id: 'os', label: 'AI Agents', icon: Terminal, color: 'text-blue-400' },
    { id: 'mind', label: 'Brain', icon: Brain, color: 'text-purple-400' },
    { id: 'society', label: 'Societies', icon: Users, color: 'text-orange-400' },
    { id: 'intel', label: 'Onchain', icon: Network, color: 'text-green-400' },
    { id: 'viral', label: 'Viral', icon: Share2, color: 'text-pink-400' },
    { id: 'econ', label: 'Econ', icon: Coins, color: 'text-yellow-400' },
    { id: 'history', label: 'History', icon: History, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <Toaster position="top-right" theme="dark" />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100" />
      </div>

      {/* Sidebar Backdrop (Mobile) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 'var(--sidebar-width, 280px)' : '80px',
          x: (typeof window !== 'undefined' && window.innerWidth < 1024) ? (isMobileSidebarOpen ? 0 : -320) : 0
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{ '--sidebar-width': '280px' } as React.CSSProperties}
        className={`fixed lg:relative z-50 lg:z-30 border-r border-white/5 bg-black/60 lg:bg-black/40 backdrop-blur-3xl flex flex-col h-screen shrink-0 shadow-2xl lg:shadow-none`}
      >
        <div className="p-5 sm:p-6 flex items-center justify-between">
           <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group overflow-hidden relative">
                 <Rocket className="w-5 h-5 text-white relative z-10" />
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase select-none">BAGS <span className="text-blue-500 text-xs not-italic align-top">OS</span></h1>
           </div>
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
              else setIsSidebarOpen(!isSidebarOpen);
            }} 
            className="text-white/40 hover:text-white hover:bg-white/5 transition-colors"
           >
              {window.innerWidth < 1024 ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
           </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2 pt-4">
           {NavItems.map((item) => (
             <button
               key={item.id}
               onClick={() => {
                 setActiveTab(item.id);
                 if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
               }}
               className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all relative group ${activeTab === item.id ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
             >
               <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? item.color : 'text-current opacity-40 group-hover:opacity-100'}`} />
               <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ${!isSidebarOpen && 'lg:opacity-0 lg:pointer-events-none'}`}>
                 {item.label}
               </span>
               {activeTab === item.id && (
                 <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/40" />
               )}
             </button>
           ))}
        </nav>

        <div className="p-4 space-y-4 border-t border-white/5">
           <div className={`p-4 glass rounded-[1.5rem] space-y-4 shadow-lg ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="flex items-center justify-between">
                 <p className="text-[10px] uppercase font-black text-white/20 tracking-wider">Soulbound ID</p>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-1 hover:text-blue-500 transition-colors"
                      title="Toggle Neural HUD Theme"
                    >
                      {theme === 'dark' ? <Sparkles className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    </button>
                    <Fingerprint className="w-3 h-3 text-blue-500" />
                 </div>
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-xs ring-1 ring-white/10 uppercase italic shrink-0">
                   {connected ? publicKey?.toBase58().charAt(0) : '?'}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">
                      {connected ? `${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}` : 'Disconnected'}
                    </p>
                    <p className={`text-[9px] uppercase font-bold ${connected ? 'text-blue-400' : 'text-white/20'}`}>
                      {connected ? 'Prestige Lvl 12' : 'Neural Link Off'}
                    </p>
                 </div>
                 {connected && (
                    <DropdownMenu>
                       <DropdownMenuTrigger className="w-6 h-6 p-0 text-white/20 hover:text-blue-500 flex items-center justify-center rounded-md transition-colors outline-none">
                          <Settings className="w-3 h-3" />
                       </DropdownMenuTrigger>
                       <DropdownMenuContent side="right" align="end" className="bg-[#0a0a0a] border-white/10 rounded-xl">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(publicKey?.toBase58() || '');
                            toast.success('Address Copied');
                          }}>
                             <Copy className="w-3 h-3 mr-2" /> Copy Address
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setVisible(true)}>
                             <RefreshCw className="w-3 h-3 mr-2" /> Change Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                              console.log('[DEBUG] Initiating full system purge from profile...');
                              if (connected) await disconnect();
                              localStorage.clear();
                              sessionStorage.clear();
                              toast.info('Neural session reset initiates...');
                              setTimeout(() => window.location.reload(), 1000);
                          }}>
                             <Zap className="w-3 h-3 mr-2" /> Reset Session
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem onClick={async () => {
                             await disconnect();
                             localStorage.clear();
                             sessionStorage.clear();
                             toast.success('Interface Terminated');
                          }} className="text-red-400">
                             <LogOut className="w-3 h-3 mr-2" /> Terminate Link
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 )}
              </div>
           </div>
           {!isSidebarOpen && (
             <div className="hidden lg:flex justify-center py-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             </div>
           )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-3xl border-b border-white/5 p-4 flex items-center justify-between px-4 lg:px-8 shrink-0">
           <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-2xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileSidebarOpen(true)} 
                className="lg:hidden text-white/40 hover:text-white"
              >
                 <Menu className="w-5 h-5" />
              </Button>
              
              <div className={`flex items-center gap-2 lg:hidden ${connected ? 'hidden sm:flex' : ''}`}>
                 <Rocket className="w-5 h-5 text-blue-500" />
                 <span className="font-black italic text-sm tracking-tighter">BAGS</span>
              </div>

              <div className="relative flex-1 group hidden md:block max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                 <input 
                   placeholder="Search features (OS, Brain, History...)" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       const match = NavItems.find(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
                       if (match) {
                         setActiveTab(match.id);
                         setSearchQuery('');
                         toast.info(`Navigating to ${match.label}`);
                       } else {
                         toast.error('Command not recognized');
                       }
                     }
                   }}
                   className="w-full bg-white/5 border border-white/5 h-10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/10"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono text-white/20 pointer-events-none uppercase flex items-center gap-1">
                   <kbd className="font-sans">⌘</kbd>K
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4 ml-4">
              <div className="hidden sm:flex items-center gap-2 p-2 px-4 glass rounded-xl border-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-[10px] font-bold font-mono">2,450.12 SOL</p>
              </div>
              <Button variant="ghost" size="icon" className="relative text-white/40 hover:text-white glass border-none shrink-0">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-black" />
              </Button>
              <div className="wallet-adapter-custom scale-90 sm:scale-100 origin-right">
                <WalletManager />
              </div>
           </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 flex-1 flex flex-col w-full max-w-screen-2xl mx-auto">
           <AnimatePresence mode="wait">
              {activeTab === 'launch' && (
                <motion.div key="launch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                  <TokenStudio />
                </motion.div>
              )}
              {activeTab === 'trade' && (
                <motion.div key="trade" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                  <TradeInterface />
                </motion.div>
              )}
              {activeTab === 'os' && (
               <motion.div 
                 key="os" 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -10 }} 
                 className="flex-1"
                >
                 <AIOperatingSystem />
               </motion.div>
             )}
             {activeTab === 'analytics' && (
               <motion.div key="analytics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <TokenAnalytics />
               </motion.div>
             )}
             {activeTab === 'mind' && (
               <motion.div key="mind" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <EcosystemBrain />
               </motion.div>
             )}
             {activeTab === 'society' && (
               <motion.div key="society" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <AgentSociety />
               </motion.div>
             )}
              {activeTab === 'intel' && (
               <motion.div key="intel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <OnchainIntelligence />
               </motion.div>
             )}
              {activeTab === 'viral' && (
               <motion.div key="viral" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <SocialViralEngine />
               </motion.div>
             )}
              {activeTab === 'econ' && (
               <motion.div key="econ" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                 <TokenEconomics />
               </motion.div>
             )}
             {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="w-full">
                  <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden backdrop-blur-3xl border-none shadow-2xl">
                    <CardHeader className="p-6 sm:p-8">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-2xl font-black italic tracking-tighter">TRANSACTION HISTORY</CardTitle>
                            <CardDescription className="text-white/40">Full auditable log of your OS operations.</CardDescription>
                          </div>
                          <Button variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2">
                            <Download className="w-4 h-4" /> Export
                          </Button>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="overflow-x-auto">
                          <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-white/5 border-y border-white/5">
                               <tr className="text-[10px] uppercase font-black text-white/20 tracking-wider">
                                  <th className="px-8 py-4">Transaction Hub</th>
                                  <th className="px-8 py-4">Target Node</th>
                                  <th className="px-8 py-4">Value</th>
                                  <th className="px-8 py-4">Status</th>
                                  <th className="px-8 py-4 text-right">Time</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
                               {logs.map((tx) => (
                                 <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                       <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.action === 'token_creation' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {tx.action === 'token_creation' ? <Rocket className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                          </div>
                                          <span className="font-bold uppercase tracking-widest text-[10px]">{tx.action.replace('_', ' ')}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-white/60 font-mono">
                                       {tx.metadata.name || tx.metadata.token || 'N/A'}
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 font-black font-mono">
                                       {tx.metadata.supply || tx.metadata.amount || '-'}
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                       <Badge variant="outline" className={`text-[10px] font-black tracking-widest border-none px-0 ${tx.status === 'success' ? 'text-green-500' : 'text-red-400'}`}>
                                          {tx.status.toUpperCase()}
                                       </Badge>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right text-white/20 font-mono text-[10px]">
                                       {new Date(tx.timestamp).toLocaleString()}
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                          </table>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Global Floating Status Bar */}
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-fit">
           <div className="glass px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border-white/10 flex items-center gap-4 sm:gap-8 shadow-2xl shadow-black/80 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-3 pr-4 sm:pr-8 border-r border-white/10 shrink-0">
                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-ping" />
                 <div className="whitespace-nowrap">
                    <p className="text-[8px] sm:text-[10px] uppercase font-black text-white/20">AI Core</p>
                    <p className="text-[10px] sm:text-xs font-bold font-mono">42.5%</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 pr-4 sm:pr-8 border-r border-white/10 shrink-0">
                 <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                 <div className="whitespace-nowrap">
                    <p className="text-[8px] sm:text-[10px] uppercase font-black text-white/20">Net TPS</p>
                    <p className="text-[10px] sm:text-xs font-bold font-mono">1.4K</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                 <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                 <div className="whitespace-nowrap">
                    <p className="text-[8px] sm:text-[10px] uppercase font-black text-white/20">Defense</p>
                    <p className="text-[10px] sm:text-xs font-bold font-mono">100%</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

