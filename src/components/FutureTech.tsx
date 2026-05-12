import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Zap, Cloud, Fingerprint, Lock,
  Cpu, Network, Globe, Radio,
  Sparkles, Layers, ShieldX
} from 'lucide-react';
import { motion } from 'motion/react';

export function FutureTech() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-25 transition-opacity">
            <Lock className="w-32 h-32 text-green-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldX className="w-5 h-5 text-green-500" />
              ZK-Launch Privacy
            </CardTitle>
            <CardDescription className="text-white/40">Zero-Knowledge proofs for anonymous yet verified token launches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
               <p className="text-xs text-green-400 font-bold">Protocol Status: EXPERIMENTAL</p>
               <p className="text-[10px] text-white/40 mt-1">Launching a token soon? Hide your dev wallet identity while proving liquidity backing via ZK-SNARKs.</p>
             </div>
             <div className="space-y-3">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-white/40">Privacy Score</span>
                 <span className="font-bold text-green-500">MAXIMIZED</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-white/40">Audibility</span>
                 <span className="font-bold text-blue-400">Verifiable</span>
               </div>
             </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700 font-bold h-10 rounded-xl">Initialize ZK Probe</Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-25 transition-opacity">
            <Fingerprint className="w-32 h-32 text-blue-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-500" />
              Soulbound Reputation
            </CardTitle>
            <CardDescription className="text-white/40">Non-transferable on-chain credit scores for elite traders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
               <p className="text-xs text-blue-400 font-bold">Eligibility: LEVEL 10+</p>
               <p className="text-[10px] text-white/40 mt-1">Unlock lower fees and private launch access based on your historical trading performance recorded in your soulbound SBT.</p>
             </div>
             <div className="flex gap-2">
               <Badge className="bg-white/10 text-white border-none text-[8px]">HODL KING</Badge>
               <Badge className="bg-white/10 text-white border-none text-[8px]">LIQUIDITY PRO</Badge>
               <Badge className="bg-white/10 text-white border-none text-[8px]">EARLY BIRD</Badge>
             </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-10 text-xs">View My SBT Details</Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 text-white p-8 rounded-[2rem] relative overflow-hidden text-center">
         <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute bg-white rounded-full blur-xl"
                style={{
                  width: '100px',
                  height: '100px',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`
                }}
              />
            ))}
         </div>
         <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/20">
               <Radio className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold tracking-tighter">Bags AI Quantum Mesh</h3>
            <p className="text-lg text-white/60 font-light leading-relaxed">
              We're building the first decentralized AI mesh network on Solana. Distributed inference for smart agents, powered by excess GPU cycles of the Bags community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <Badge variant="outline" className="px-4 py-2 border-white/10 bg-white/5 text-sm uppercase tracking-widest text-white/40">Decentralized LLM</Badge>
               <Badge variant="outline" className="px-4 py-2 border-white/10 bg-white/5 text-sm uppercase tracking-widest text-white/40">GPU Staking</Badge>
               <Badge variant="outline" className="px-4 py-2 border-white/10 bg-white/5 text-sm uppercase tracking-widest text-white/40">AI Oracles</Badge>
            </div>
            <Button className="bg-white text-black font-bold h-14 px-12 rounded-2xl text-lg hover:scale-105 transition-transform">Join the Beta</Button>
         </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Neural Bridges', icon: Cpu },
           { label: 'Quantum Security', icon: Radio },
           { label: 'Elastic Nodes', icon: Layers },
           { label: 'Multiverse Launch', icon: Globe },
         ].map((item, i) => (
           <Card key={i} className="bg-white/5 border-white/10 p-5 rounded-2xl text-center group cursor-pointer hover:border-white/20 transition-all">
              <item.icon className="w-8 h-8 text-white/20 group-hover:text-white mx-auto mb-3 transition-colors" />
              <p className="text-sm font-bold opacity-40 group-hover:opacity-100">{item.label}</p>
           </Card>
         ))}
      </div>
    </div>
  );
}
