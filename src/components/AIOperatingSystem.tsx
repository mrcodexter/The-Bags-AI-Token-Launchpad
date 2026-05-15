import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Terminal, Cpu, Zap, Activity, Shield, 
  Brain, Command, Search, Sparkles, 
  ChevronRight, Play, Layout, Globe,
  Wallet as WalletIcon, Users, RefreshCw,
  Pause, MoreVertical, Plus, Filter,
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  X, Eye, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletManager } from './WalletManager';
import { toast } from 'sonner';
import { transactionLogger } from '../lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Types
interface Agent {
  id: string;
  name: string;
  type: 'Analysis' | 'Trading' | 'Social' | 'Security';
  status: 'Active' | 'Standby' | 'Analyzing' | 'Working';
  efficiency: number;
  lastActive: string;
  tasks: Task[];
  stats: {
    memory: string;
    compute: string;
    latency: string;
    cpu: number;
    connections: number;
  };
  online: boolean;
  messages: AgentMessage[];
  logs: string[];
}

interface AgentMessage {
  id: string;
  from: string;
  content: string;
  timestamp: number;
}

interface Task {
  id: string;
  title: string;
  progress: number;
  status: 'running' | 'paused' | 'completed';
}

const AGENT_TEMPLATES = [
  { name: 'Market Arbitrageur', type: 'Trading', cost: '5.0 SOL', desc: 'Pre-optimized for high-frequency DEX spreads.' },
  { name: 'Sentiment Siphon', type: 'Social', cost: '2.5 SOL', desc: 'Real-time social sentiment mapping and viral prediction.' },
  { name: 'Fortress Guardian', type: 'Security', cost: '10.0 SOL', desc: 'Advanced on-chain threat detection and smart contract audit.' },
  { name: 'Dataset Oracle', type: 'Analysis', cost: '1.2 SOL', desc: 'Deep data harvesting and pattern recognition across clusters.' },
];

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Neural Arbitrage V4',
    type: 'Trading',
    status: 'Active',
    efficiency: 98.2,
    lastActive: '2m ago',
    online: true,
    stats: { memory: '1.2GB', compute: '14.2 TFLOPs', latency: '12ms', cpu: 45, connections: 124 },
    tasks: [
      { id: 'task-1', title: 'Monitoring SOL/USDC spreads', progress: 100, status: 'running' },
      { id: 'task-2', title: 'Executing partial rebalance', progress: 45, status: 'running' }
    ],
    messages: [
      { id: 'm1', from: 'Sentiment Siphon', content: 'Detected massive inflow on PEPE tokens.', timestamp: Date.now() - 50000 }
    ],
    logs: ['[INFO] Handshake with Raydium successful', '[DEBUG] Reticule adjusted for 0.05% slippage']
  },
  {
    id: 'agent-2',
    name: 'Sentiment Scanner',
    type: 'Social',
    status: 'Analyzing',
    efficiency: 85.5,
    lastActive: 'Just now',
    online: true,
    stats: { memory: '4.5GB', compute: '2.1 TFLOPs', latency: '450ms', cpu: 78, connections: 45 },
    tasks: [
      { id: 'task-3', title: 'Scraping X for neural PEPE keywords', progress: 78, status: 'running' }
    ],
    messages: [],
    logs: ['[WARN] API Rate limit approaching', '[DATA] Keyword "PEPE" frequency +450%']
  },
  {
    id: 'agent-3',
    name: 'Ghost Protocol',
    type: 'Security',
    status: 'Working',
    efficiency: 99.9,
    lastActive: '5m ago',
    online: false,
    stats: { memory: '512MB', compute: '32.0 TFLOPs', latency: '1ms', cpu: 12, connections: 12 },
    tasks: [
      { id: 'task-4', title: 'Deep packet inspection of incoming transactions', progress: 100, status: 'running' }
    ],
    messages: [],
    logs: ['[SAFE] Threat level: Green', '[AUTH] Admin signature verified']
  }
];

export function AIOperatingSystem() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [bootStatus, setBootStatus] = useState('Standby');
  const [logs, setLogs] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'efficiency' | 'status'>('efficiency');
  
  // Modals state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ops' | 'stats' | 'chat' | 'tuning'>('ops');
  const [trainingData, setTrainingData] = useState({ dataset: '', epochs: 10, rate: 0.001 });
  const [chatMessage, setChatMessage] = useState('');
  
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
    if (!connected || !publicKey) {
      toast.error("Neural link required", {
        description: "Please establish a connection to the Solana cycle.",
      });
      return;
    }
    if (!userPrompt.trim()) return;
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] COMMAND: execute prompt-to-launch "${userPrompt}"`]);
    
    transactionLogger.log({
      action: 'deploy_agent',
      status: 'success',
      wallet: publicKey.toBase58(),
      metadata: {
        prompt: userPrompt,
        timestamp: new Date().toISOString()
      },
      signature: 'sim_' + Math.random().toString(36).substring(2, 12)
    });

    setUserPrompt('');
    toast.success('Agent Deployment Sequence Initiated', {
      description: `Analyzing: ${userPrompt.slice(0, 30)}...`
    });
  };

  const filteredAgents = useMemo(() => {
    let result = agents;
    if (filterStatus !== 'All') {
      result = result.filter(a => a.status === filterStatus);
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'efficiency') return b.efficiency - a.efficiency;
      return a.status.localeCompare(b.status);
    });
  }, [agents, filterStatus, sortBy]);

  const toggleTask = (agentId: string, taskId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          tasks: agent.tasks.map(task => {
            if (task.id === taskId) {
              const newStatus = task.status === 'running' ? 'paused' : 'running';
              toast.info(`Task ${newStatus === 'running' ? 'Resumed' : 'Paused'}`, {
                description: `${task.title} updated for ${agent.name}`
              });
              return { ...task, status: newStatus };
            }
            return task;
          })
        };
      }
      return agent;
    }));
  };

  const addNewTask = (agentId: string) => {
    const title = window.prompt("Enter task designation:");
    if (!title) return;

    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title,
          progress: 0,
          status: 'running'
        };
        return {
          ...agent,
          tasks: [...agent.tasks, newTask]
        };
      }
      return agent;
    }));
    toast.success('Task Assigned', { description: title });
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
            <WalletManager />
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-lg">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
             <Filter className="w-3 h-3" /> Filters
           </div>
           {['All', 'Active', 'Standby', 'Analyzing', 'Working'].map(status => (
             <button
               key={status}
               onClick={() => setFilterStatus(status)}
               className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap ${filterStatus === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
             >
               {status}
             </button>
           ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <DropdownMenu>
              <DropdownMenuTrigger className="border border-white/10 bg-white/5 h-9 rounded-xl gap-2 text-[10px] font-black uppercase flex-1 sm:flex-none px-4 flex items-center justify-center transition-colors hover:bg-white/10 outline-none">
                  Sort: {sortBy} <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0a0a0a] border-white/10">
                <DropdownMenuItem onClick={() => setSortBy('efficiency')}>Efficiency</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
           <Button 
            onClick={() => setShowRecruitModal(true)}
            className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl gap-2 text-[10px] font-black uppercase px-6 flex-1 sm:flex-none"
           >
             Recruit <Plus className="w-3 h-3" />
           </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 bg-black/60 border-blue-500/20 text-white backdrop-blur-3xl relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="p-4 sm:p-6 border-b border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold font-mono tracking-tighter">Agent Roster</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-white/40">Active Intelligence Swarm</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{agents.length} Nodes Active</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[600px] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Eye className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${
                          agent.type === 'Trading' ? 'from-green-500 to-blue-500' :
                          agent.type === 'Social' ? 'from-pink-500 to-orange-500' :
                          agent.type === 'Security' ? 'from-red-500 to-purple-500' : 'from-yellow-500 to-green-500'
                        }`} />
                        <Brain className="w-6 h-6 text-white relative z-10" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center ${agent.online ? 'bg-green-500' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate uppercase tracking-tight">{agent.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest border-none p-0 flex items-center gap-1 ${
                          agent.status === 'Active' ? 'text-green-400' :
                          agent.status === 'Analyzing' ? 'text-blue-400' :
                          agent.status === 'Working' ? 'text-purple-400 animate-pulse' : 'text-white/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                             agent.status === 'Active' ? 'bg-green-400 animate-pulse' :
                             agent.status === 'Analyzing' ? 'bg-blue-400 animate-spin' :
                             agent.status === 'Working' ? 'bg-purple-400 animate-bounce' : 'bg-white/40'
                          }`} />
                          {agent.status}
                        </Badge>
                        <span className="text-white/20 text-[8px] uppercase font-black tracking-widest">• {agent.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Efficiency</p>
                      <p className="text-sm font-mono font-black text-blue-400">{agent.efficiency}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Active Tasks</p>
                      <p className="text-sm font-mono font-black">{agent.tasks.length}</p>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden">
                     <div className="h-1 w-full bg-white/5 rounded-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.efficiency}%` }}
                          className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        />
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <div className="mt-auto p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl">
             <div className="relative group flex items-center gap-2">
                <div className="relative flex-1">
                   <Input 
                     placeholder="Ask any agent for status or custom ops..."
                     className="bg-white/5 border-white/10 h-11 pr-12 rounded-xl text-xs focus:ring-blue-500/20"
                     value={userPrompt}
                     onChange={(e) => setUserPrompt(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-20 group-focus-within:opacity-100 transition-opacity">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/10 text-[8px] font-mono">ENTER</kbd>
                   </div>
                </div>
                <Button 
                   onClick={handleLaunch} 
                   className="bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 shrink-0"
                >
                   Execute Launch
                </Button>
             </div>
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {selectedAgent ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/5 border-white/10 text-white p-6 rounded-3xl h-full flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedAgent(null)} className="text-white/20 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-4 mb-8 pt-4">
                   <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-black border border-white/5 flex items-center justify-center p-4 relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/10 blur-xl animate-pulse" />
                        <Brain className="w-10 h-10 text-blue-500 relative z-20" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#050505] relative z-30 ${selectedAgent.online ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black italic tracking-tighter uppercase">{selectedAgent.name}</h3>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Neural ID: {Math.random().toString(16).slice(2, 10)}</p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-8">
                   {[
                     { label: 'Compute', value: selectedAgent.stats.compute, icon: Cpu },
                     { label: 'Memory', value: selectedAgent.stats.memory, icon: Activity },
                     { label: 'Latency', value: selectedAgent.stats.latency, icon: Clock },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
                        <stat.icon className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                        <p className="text-[8px] text-white/20 uppercase font-black truncate">{stat.label}</p>
                        <p className="text-[10px] font-bold text-white truncate">{stat.value}</p>
                     </div>
                   ))}
                </div>                <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/5">
                   {(['ops', 'stats', 'chat', 'tuning'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                         {tab}
                      </button>
                   ))}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                   {activeTab === 'ops' && (
                     <>
                       <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Active Operations</p>
                          <Button variant="ghost" size="icon" onClick={() => addNewTask(selectedAgent.id)} className="h-6 w-6 text-white/20 hover:text-blue-500">
                            <Plus className="w-4 h-4" />
                          </Button>
                       </div>
                       
                       <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                          {selectedAgent.tasks.length > 0 ? selectedAgent.tasks.map((task) => (
                             <div key={task.id} className="bg-black/40 rounded-xl p-3 border border-white/5 group">
                                <div className="flex items-center justify-between mb-2">
                                   <span className="text-[11px] font-bold truncate pr-2 tracking-tight">{task.title}</span>
                                   <div className="flex items-center gap-1">
                                      <button onClick={() => toggleTask(selectedAgent.id, task.id)} className="p-1 hover:text-blue-500 transition-colors text-white/20">
                                         {task.status === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                      </button>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${task.progress}%` }}
                                        className={`h-full rounded-full ${task.status === 'running' ? 'bg-blue-500' : 'bg-white/20'}`} 
                                      />
                                   </div>
                                   <span className="text-[10px] font-mono text-white/40">{task.progress}%</span>
                                </div>
                             </div>
                          )) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-2">
                               <AlertCircle className="w-8 h-8 opacity-20" />
                               <p className="text-[10px] uppercase font-black tracking-widest italic">Idle Status</p>
                            </div>
                          )}
                       </div>
                     </>
                   )}

                   {activeTab === 'stats' && (
                     <div className="space-y-4 overflow-y-auto pr-1">
                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Real-time Performance</p>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-white/20 uppercase font-bold">CPU Usage</p>
                              <div className="flex items-end justify-between mt-1">
                                 <p className="text-xl font-mono font-black">{selectedAgent.stats.cpu}%</p>
                                 <div className="flex items-end gap-1 mb-1">
                                   {[40, 60, 30, 80, 50].map((h, i) => (
                                      <motion.div key={i} animate={{ height: [`${h}%`, `${h+10}%`, `${h}%`] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-1 bg-blue-500 rounded-full" />
                                   ))}
                                 </div>
                              </div>
                           </div>
                           <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-[8px] text-white/20 uppercase font-bold">Connections</p>
                              <p className="text-xl font-mono font-black mt-1">{selectedAgent.stats.connections}</p>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[8px] text-white/20 uppercase font-bold mb-1">Recent Execution Logs</p>
                           <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-[9px] font-mono whitespace-pre-wrap leading-relaxed">
                              {selectedAgent.logs.map((log, i) => (
                                 <div key={i} className={log.includes('[WARN]') ? 'text-yellow-500/80' : log.includes('[SAFE]') ? 'text-green-500/80' : 'text-white/40'}>
                                   {log}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'chat' && (
                     <div className="flex flex-col h-full">
                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-4">Neural Messaging Interface</p>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                           {selectedAgent.messages.map((m) => (
                              <div key={m.id} className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-black text-blue-400 uppercase">{m.from}</span>
                                    <span className="text-[8px] text-white/20 font-mono">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                                 <p className="text-[11px] leading-relaxed text-white/70">{m.content}</p>
                              </div>
                           ))}
                           {selectedAgent.messages.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full opacity-10">
                                 <Users className="w-12 h-12 mb-2" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">No active frequency detected</p>
                              </div>
                           )}
                        </div>
                        <div className="relative">
                           <Input 
                             placeholder="Broadcast to peer agents..."
                             className="bg-white/5 border-white/10 h-10 rounded-xl text-[11px]"
                             value={chatMessage}
                             onChange={(e) => setChatMessage(e.target.value)}
                           />
                           <Button 
                             onClick={() => {
                                if (!chatMessage.trim()) return;
                                toast.success('Neural Pulse Transmitted');
                                setChatMessage('');
                             }}
                             className="absolute right-1 top-1 h-8 w-8 bg-blue-600 rounded-lg p-0"
                           >
                             <ChevronRight className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                   )}

                   {activeTab === 'tuning' && (
                     <div className="space-y-6 overflow-y-auto pr-1">
                        <div className="space-y-4">
                           <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Neural Fine-Tuning</p>
                           <div className="space-y-2">
                             <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Training Dataset URL / Content</label>
                             <Input 
                                placeholder="https://ipfs.io/ipfs/..."
                                className="bg-white/5 border-white/10 h-9 text-[10px]"
                                value={trainingData.dataset}
                                onChange={(e) => setTrainingData({ ...trainingData, dataset: e.target.value })}
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Learning Epochs</label>
                                <Input 
                                   type="number"
                                   className="bg-white/5 border-white/10 h-9 text-[10px]"
                                   value={trainingData.epochs}
                                   onChange={(e) => setTrainingData({ ...trainingData, epochs: parseInt(e.target.value) })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Learning Rate</label>
                                <Input 
                                   type="number"
                                   step="0.0001"
                                   className="bg-white/5 border-white/10 h-9 text-[10px]"
                                   value={trainingData.rate}
                                   onChange={(e) => setTrainingData({ ...trainingData, rate: parseFloat(e.target.value) })}
                                />
                              </div>
                           </div>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-4">
                           <p className="text-[9px] text-blue-200/60 leading-relaxed italic mb-4">
                             "Tuning a node requires significant compute allocation. Efficiency may fluctuate during the induction cycle."
                           </p>
                           <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                              Initialize Induction <Brain className="w-3 h-3" />
                           </Button>
                        </div>
                     </div>
                   )}
                </div>

                <div className="mt-8 space-y-3">
                   <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/10">
                     Force Synchronization <Zap className="w-3 h-3" />
                   </Button>
                   <Button 
                    variant="outline" 
                    onClick={() => {
                      setAgents(prev => prev.filter(a => a.id !== selectedAgent.id));
                      setSelectedAgent(null);
                      toast.info(`${selectedAgent.name} decommissioned`);
                    }}
                    className="w-full border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 h-10 rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest"
                   >
                     Terminate Node <X className="w-3 h-3" />
                   </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-3xl flex flex-col justify-between shadow-xl h-full">
                <div className="space-y-4 sm:space-y-6">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/80">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      Neural Activity
                    </div>
                    <Badge variant="outline" className="text-[8px] sm:text-[9px] border-blue-500/20 text-blue-400 animate-pulse">LIVE</Badge>
                  </CardTitle>
                  
                  <div className="space-y-2 sm:space-y-3 h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                    {[
                      { icon: Zap, label: 'Block Mapped', time: '12ms ago', color: 'text-blue-400' },
                      { icon: Shield, label: 'Entropy Flush', time: '45ms ago', color: 'text-green-400' },
                      { icon: Activity, label: 'Node Resync', time: '1s ago', color: 'text-purple-400' },
                      { icon: TrendingUp, label: 'Volume Spike', time: '5s ago', color: 'text-yellow-400' },
                      { icon: AlertCircle, label: 'Network Congestion', time: '12s ago', color: 'text-red-400' },
                      { icon: CheckCircle2, label: 'Validation Complete', time: '15s ago', color: 'text-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
                        </div>
                        <span className="text-[9px] text-white/20 font-mono italic">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                     <p className="text-[10px] text-purple-300 italic font-bold leading-relaxed relative z-10">
                       "Autonomous Swarm has successfully mapped 4,203 on-chain nodes. Intelligence gathering efficiency at 89.4%."
                     </p>
                  </div>
                </div>
                <Button variant="outline" className="mt-8 border-white/10 bg-white/5 hover:bg-white/10 w-full h-11 rounded-xl gap-2 font-black uppercase tracking-wider text-[10px]">
                  Resync Swarm <RefreshCw className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
            <p className="text-[10px] sm:text-xs font-bold leading-tight uppercase tracking-tighter">{item.label}</p>
            <div className="absolute bottom-0 right-0 p-1 sm:p-2 opacity-[0.05]">
               <item.icon className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </Card>
        ))}
      </div>

      {/* Recruitment Modal */}
      <Dialog open={showRecruitModal} onOpenChange={setShowRecruitModal}>
         <DialogContent className="bg-[#050505] border-white/5 text-white max-w-2xl w-[95vw] sm:w-full overflow-hidden rounded-3xl p-0">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
               <div className="p-6 border-b border-white/5">
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Recruit Elite Agent</DialogTitle>
                  <DialogDescription className="text-white/40 mt-1 uppercase font-bold text-[10px] tracking-widest">Expansion of Intelligence Swarm Initiated</DialogDescription>
               </div>
               
               <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                  <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] mb-4">Tactical Presets</p>
                  {AGENT_TEMPLATES.map((recruit, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-all group relative overflow-hidden">
                       <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 transition-colors">
                             <Brain className="w-6 h-6 text-white/40 group-hover:text-blue-400" />
                          </div>
                          <div>
                             <h4 className="font-bold text-sm uppercase tracking-tight">{recruit.name}</h4>
                             <p className="text-[10px] text-white/40 max-w-[200px] leading-snug">{recruit.desc}</p>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-2 relative z-10">
                          <p className="text-xs font-black italic">{recruit.cost}</p>
                          <Button 
                            className="h-8 rounded-lg bg-white text-black font-black uppercase text-[9px] tracking-widest px-4 hover:scale-105 transition-transform"
                            onClick={() => {
                              if (!publicKey) {
                                toast.error("Neural link required");
                                return;
                              }
                              
                              const newAgent: Agent = {
                                id: `agent-${Date.now()}`,
                                name: recruit.name,
                                type: recruit.type as any,
                                status: 'Active',
                                efficiency: 90 + Math.random() * 10,
                                lastActive: 'Just now',
                                online: true,
                                stats: { memory: '2GB', compute: '10 TFLOPs', latency: '15ms', cpu: 0, connections: 0 },
                                tasks: [],
                                messages: [],
                                logs: [`[INFO] ${recruit.name} Tactical Node Initialized`]
                              };

                              setAgents(prev => [...prev, newAgent]);

                              transactionLogger.log({
                                action: 'trade_buy', 
                                status: 'success',
                                wallet: publicKey.toBase58(),
                                metadata: {
                                  agent: recruit.name,
                                  cost: recruit.cost,
                                  type: recruit.type
                                },
                                signature: 'sim_' + Math.random().toString(36).substring(2, 12)
                              });
                              toast.success(`Recruitment of ${recruit.name} initiated!`, {
                                description: "Interface handshake in progress."
                              });
                              setShowRecruitModal(false);
                            }}
                          >
                            Acquire
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Current Budget</p>
                        <p className="text-lg font-black italic">45.8 SOL</p>
                     </div>
                  </div>
                  <Button variant="ghost" onClick={() => setShowRecruitModal(false)} className="text-white/40 hover:text-white uppercase font-black text-[10px] tracking-widest">
                    Abort Protocol
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
