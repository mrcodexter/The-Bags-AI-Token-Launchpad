import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Users, Search, Activity, ShieldCheck, Zap, 
  ArrowUpRight, ArrowDownRight, Globe, Share2,
  Lock, Network, Database, Fingerprint, Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';

const mockRadarData = [
  { subject: 'Influence', A: 120, fullMark: 150 },
  { subject: 'Engagement', A: 98, fullMark: 150 },
  { subject: 'Liquidity', A: 86, fullMark: 150 },
  { subject: 'Virality', A: 99, fullMark: 150 },
  { subject: 'Alpha', A: 85, fullMark: 150 },
  { subject: 'Risk', A: 65, fullMark: 150 },
];

export function OnchainIntelligence() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 text-white col-span-1 md:col-span-2 overflow-hidden relative min-h-[350px] sm:min-h-[400px] rounded-2xl sm:rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.1, 0.5, 0.1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 4,
                    repeat: Infinity,
                  }}
                  className="absolute w-[1px] h-[1px] bg-blue-500 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
             ))}
          </div>
          <CardHeader className="relative z-10 p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-lg sm:text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Neural Relationship Graph
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-white/40 font-medium tracking-tight">Detecting coordinated activity and insider clusters.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative z-10">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-blue-500/10 rounded-full animate-pulse" />
              <div className="w-48 h-48 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center relative">
                 <Globe className="w-12 h-12 text-blue-500/20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 20 + i * 5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                      />
                    ))}
                 </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
               <div className="p-3 glass rounded-xl text-[10px] space-y-1">
                 <p className="text-white/40 uppercase font-bold">Detected Clusters</p>
                 <p className="text-blue-400 font-mono">12 WHALE NODES</p>
               </div>
               <div className="p-3 glass rounded-xl text-[10px] space-y-1 text-right">
                 <p className="text-white/40 uppercase font-bold">Coordination Index</p>
                 <p className="text-red-500 font-mono">MODERATE (64%)</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg font-black italic uppercase flex items-center gap-2">
              <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              Mood Tracker
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-white/40 font-medium tracking-tight">Traders psychology analysis.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" stroke="#ffffff40" fontSize={10} />
                <PolarRadiusAxis stroke="#ffffff10" />
                <Radar
                  name="Intelligence"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Tooltip contentStyle={{ background: '#000', border: '1px solid #333' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Insider Sync', value: 'None', status: 'SAFE', color: 'text-green-500', icon: ShieldCheck },
          { label: 'Market Anomaly', value: 'Detected', status: 'ALERT', color: 'text-red-500', icon: Activity },
          { label: 'Liq. Defense', value: 'Active', status: 'ARMED', color: 'text-blue-500', icon: Lock },
          { label: 'Retention AI', value: '92%', status: 'HIGH', color: 'text-green-500', icon: Zap },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 border-white/10 p-4 sm:p-5 hover:bg-white/10 transition-all group rounded-xl sm:rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
              <Badge variant="outline" className={`text-[8px] sm:text-[9px] ${stat.color} border-none font-black tracking-widest italic animate-pulse`}>{stat.status}</Badge>
            </div>
            <p className="text-[8px] sm:text-[10px] text-white/40 uppercase font-black tracking-[0.1em] text-center sm:text-left">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-black italic tracking-tighter mt-1 text-center sm:text-left">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10 text-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border-none shadow-2xl">
        <CardHeader className="p-5 sm:p-8 pb-0 sm:pb-0">
          <CardTitle className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase">Onchain Intelligence</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs text-white/40 font-medium tracking-tight">Wallet behavior analysis across cycles.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="space-y-1 sm:space-y-4">
            {[
              { name: 'Diamond Hand Node', score: 99, info: 'Held through 4 cycles', risk: 'Low' },
              { name: 'Cyclical Arb Cluster', score: 78, info: 'Predictable patterns', risk: 'Medium' },
              { name: 'Alpha Influx Hub', score: 45, info: '42 coordinated entry', risk: 'High' },
              { name: 'Paper Hand Shadow', score: 12, info: 'Sell-offs at peaks', risk: 'Ignore' },
            ].map((node, i) => (
              <div key={i} className="px-4 py-3 sm:p-4 flex items-center justify-between gap-4 group cursor-pointer hover:bg-blue-500/5 transition-all border-b border-white/5 sm:border sm:rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                   <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center font-mono font-black text-xs ${node.score > 80 ? 'bg-green-500/20 text-green-400' : node.score > 40 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                     {node.score}
                   </div>
                   <div className="min-w-0">
                     <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter flex items-center gap-2 truncate">
                        {node.name}
                        <Badge className="bg-white/5 text-[8px] font-bold text-white/40 border-none shrink-0">GENOS {i+1}</Badge>
                     </h4>
                     <p className="text-[9px] sm:text-xs text-white/40 font-medium truncate">{node.info}</p>
                   </div>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[8px] sm:text-[9px] uppercase font-black text-white/20 mb-1">Risk</p>
                   <span className={`text-[10px] font-black italic uppercase tracking-tighter ${node.risk === 'Low' ? 'text-green-500' : node.risk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>{node.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
