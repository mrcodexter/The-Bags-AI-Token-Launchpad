import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Brain, Zap, Activity, Globe, 
  Target, Network, Sparkles, Radio,
  Heart, Microscope, Waves
} from 'lucide-react';
import { motion } from 'motion/react';

export function EcosystemBrain() {
  const [synapseCount, setSynapseCount] = useState(1240590);

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapseCount(prev => prev + Math.floor(Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-black/40 border-purple-500/20 text-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden min-h-[400px] sm:min-h-[500px] relative flex flex-col items-center justify-center text-center p-6 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[#050505]" />
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
           {[...Array(15)].map((_, i) => (
             <motion.div
               key={i}
               animate={{
                 scale: [1, 1.2, 1],
                 opacity: [0.1, 0.2, 0.1],
                 x: Math.random() * 100 - 50 + '%',
                 y: Math.random() * 100 - 50 + '%',
               }}
               transition={{
                 duration: 12 + Math.random() * 10,
                 repeat: Infinity,
                 ease: "linear"
               }}
               className="absolute w-48 sm:w-64 h-48 sm:h-64 bg-purple-500 rounded-full blur-[80px] sm:blur-[120px]"
             />
           ))}
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-10 max-w-2xl px-2">
           <div className="relative inline-block scale-75 sm:scale-100">
              <div className="absolute inset-0 blur-3xl bg-purple-500/20 rounded-full animate-pulse" />
              <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-blue-500 p-[1px] relative z-10 rotate-3 animate-spin-slow">
                 <div className="w-full h-full bg-[#050505] rounded-[1.4rem] sm:rounded-[2.4rem] flex items-center justify-center">
                    <Brain className="w-10 h-10 sm:w-16 sm:h-16 text-white animate-pulse" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] sm:leading-none">
                Eco-System consciousness
              </h3>
              <p className="text-sm sm:text-xl text-white/40 font-medium tracking-tight max-w-lg mx-auto">
                currently processing unified network empathy.
              </p>
           </div>

           <div className="flex justify-center gap-6 sm:gap-12 pt-4 sm:pt-6">
              <div className="text-center">
                 <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-white/20 mb-1 sm:mb-2 italic">Synapses</p>
                 <p className="text-xl sm:text-4xl font-black italic tracking-tighter text-purple-400">{synapseCount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                 <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-white/20 mb-1 sm:mb-2 italic">Empathy</p>
                 <p className="text-xl sm:text-4xl font-black italic tracking-tighter text-blue-400">92.4%</p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button className="w-full sm:w-auto h-12 sm:h-16 px-8 sm:px-12 bg-white text-black font-black italic text-xs sm:text-lg rounded-xl sm:rounded-3xl hover:scale-105 transition-transform shadow-2xl shadow-white/5 uppercase tracking-widest">
                Access Mind
              </Button>
              <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-16 px-8 sm:px-12 border-white/10 bg-white/5 font-black italic text-xs sm:text-lg rounded-xl sm:rounded-3xl uppercase tracking-widest">
                Override
              </Button>
           </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
         {[
           { label: 'Prediction', icon: Waves, info: 'Bullish' },
           { label: 'Psychology', icon: Heart, info: 'Greed' },
           { label: 'Conviction', icon: Target, info: 'Optimal' },
         ].map((item, i) => (
           <Card key={i} className="bg-white/5 border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all cursor-pointer shadow-lg group">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                 </div>
                 <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter leading-tight truncate">{item.label}</h4>
              </div>
              <div className="flex justify-between items-end">
                 <span className="text-[8px] sm:text-[10px] text-white/20 font-black uppercase tracking-widest font-mono italic">Insight</span>
                 <Badge className="bg-purple-500/20 text-purple-400 border-none px-2 sm:px-3 font-black text-[9px] sm:text-xs italic uppercase tracking-tighter">{item.info}</Badge>
              </div>
           </Card>
         ))}
      </div>
    </div>

  );
}
