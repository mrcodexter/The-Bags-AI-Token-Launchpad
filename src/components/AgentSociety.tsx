import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, Bot, Sparkles, Zap, 
  MessageSquare, Shield, Activity, 
  ChevronRight, BrainCircuit, Network,
  Fingerprint, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const mockAgents = [
  { id: 1, name: 'Market-Maker Bot v7', role: 'Liquidity Manager', status: 'Working', efficiency: 98, tasks: ['Managing BTC/SOL pool', 'Executing buybacks'] },
  { id: 2, name: 'Viral Scout', role: 'Social Intelligence', status: 'Scanning', efficiency: 94, tasks: ['Monitoring Twitter Trends', 'Analyzing Meme Velocity'] },
  { id: 3, name: 'Strategy Brain', role: 'Treasury Optimizer', status: 'Analyzing', efficiency: 87, tasks: ['Yield Farm Selection', 'Asset Rebalancing'] },
  { id: 4, name: 'Guard-AI', role: 'Security Sentinel', status: 'Standby', efficiency: 100, tasks: ['DDoS Protection', 'Smart Contract Auditing'] },
];

export function AgentSociety() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-1 bg-white/5 border-white/10 text-white overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Agent Roster
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-white/40">Active autonomous entities.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 max-h-[300px] lg:max-h-none overflow-y-auto custom-scrollbar">
              {mockAgents.map((agent) => (
                <div 
                  key={agent.id} 
                  className={`p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/5 transition-all ${selectedAgent.id === agent.id ? 'bg-white/10' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${selectedAgent.id === agent.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}>
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs sm:text-sm font-bold truncate">{agent.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase truncate">{agent.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[8px] px-1.5 ${agent.status === 'Working' ? 'text-green-500 border-green-500/20' : 'text-blue-400 border-blue-400/20'}`}>
                      {agent.status}
                    </Badge>
                    <span className="text-[9px] font-mono text-white/20 whitespace-nowrap">{agent.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-3 sm:p-4 border-t border-white/5">
            <Button variant="outline" className="w-full border-white/10 bg-white/5 h-10 text-[10px] sm:text-xs gap-2 rounded-xl">
              <Sparkles className="w-3 h-3" /> Recruit Agent
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white relative overflow-hidden backdrop-blur-3xl p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl min-h-[400px]">
          <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
            <Network className="w-48 h-48 sm:w-64 sm:h-64 text-blue-500" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6 sm:space-y-8 h-full flex flex-col"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter truncate uppercase">{selectedAgent.name}</h3>
                  <p className="text-blue-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest mt-1">{selectedAgent.role}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-white/10 text-white border-none py-0.5 text-[9px] font-bold uppercase tracking-widest">GEN 2.5</Badge>
                    <Badge className="bg-white/10 text-white border-none py-0.5 text-[9px] font-bold uppercase tracking-widest">SOULBOUND</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                   <p className="text-[10px] text-white/20 uppercase font-black mb-3 tracking-widest">Active Objectives</p>
                   <ul className="space-y-2">
                     {selectedAgent.tasks.map((task, i) => (
                       <li key={i} className="flex items-center gap-2 text-[10px] sm:text-xs text-white/70 font-medium">
                         <Zap className="w-3 h-3 text-yellow-500 shrink-0" />
                         {task}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                   <p className="text-[10px] text-white/20 uppercase font-black mb-3 tracking-widest">Neural Stats</p>
                   <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs">
                      <span className="text-white/40 font-bold uppercase tracking-tighter">Learning Rate</span>
                      <span className="font-black italic text-blue-400">4.2% daily</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] sm:text-xs">
                      <span className="text-white/40 font-bold uppercase tracking-tighter">Node Trust</span>
                      <span className="font-black italic text-green-500 uppercase tracking-tighter">Excellent</span>
                    </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto pt-4">
                <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest italic rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/20 text-xs">Deploy Mission</Button>
                <Button variant="outline" className="flex-1 h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest italic text-xs">Upgrade Neural</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>

      <div className="p-6 sm:p-10 lg:p-16 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-tr from-purple-600/10 to-blue-600/10 border border-white/10 relative overflow-hidden text-center group shadow-2xl">
         <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <BrainCircuit className="w-full h-full text-white scale-150 rotate-12 blur-sm" />
         </div>
         <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-black rounded-full mx-auto flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-transform">
               <Network className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase leading-tight">Agent Marketplace</h3>
            <p className="text-sm sm:text-lg text-white/60 font-medium">
              Coming Soon: Decentralized coordination for multi-agent launches.
            </p>
            <Button className="w-full sm:w-auto bg-white text-black font-black uppercase tracking-widest italic h-12 sm:h-14 px-8 sm:px-12 rounded-xl sm:rounded-2xl text-xs sm:text-base hover:scale-105 transition-transform shadow-xl shadow-white/5">Access Protocol</Button>
         </div>
      </div>
    </div>

  );
}
