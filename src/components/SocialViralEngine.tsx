import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Zap, TrendingUp, Share2, MessageSquare, 
  Trophy, Users, Sparkles, Hash, 
  BarChart3, Heart, Repeat, Globe, Cloud,
  Flame, Radio, Target
} from 'lucide-react';
import { motion } from 'motion/react';

export function SocialViralEngine() {
  const [activeEngine, setActiveEngine] = useState('Narrative Warfare');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent border-white/10 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] overflow-hidden relative shadow-2xl">
          <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-pink-500/20 rounded-full blur-[80px] sm:blur-[100px] animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div>
              <CardTitle className="text-xl sm:text-3xl font-black italic tracking-tighter flex items-center gap-2 sm:gap-3 uppercase">
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 shrink-0" />
                AI NARRATIVE HUB
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs text-white/40 mt-1 max-w-sm font-medium tracking-tight">
                Dominate the social layer with AI-optimized memes and sentiment manipulation.
              </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
               <Button className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-white text-black font-black italic hover:scale-105 transition-transform text-[10px] sm:text-xs uppercase tracking-widest">INITIALIZE</Button>
               <Button variant="outline" className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-xl border-white/10 bg-white/5 font-black italic text-[10px] sm:text-xs uppercase tracking-widest">SCAN</Button>
            </div>
          </div>

          <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative z-10">
             <div className="p-4 sm:p-6 glass rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl border-white/5">
                <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-500" /> Viral Hook Gen
                </h4>
                <p className="text-[9px] sm:text-[10px] text-white/40 italic font-medium leading-relaxed">"The bags are packed. Are you in?"</p>
                <div className="flex flex-wrap gap-2">
                   <Badge className="bg-pink-500/20 text-pink-400 border-none text-[8px] font-bold uppercase tracking-wider">#BagsOS</Badge>
                   <Badge className="bg-pink-500/20 text-pink-400 border-none text-[8px] font-bold uppercase tracking-wider">#SOL_AI</Badge>
                </div>
             </div>
             <div className="p-4 sm:p-6 glass rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl border-white/5">
                <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-400" /> Sentiment Mod
                </h4>
                <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                   <span className="text-white/40 font-bold uppercase">GLOBAL FOMO</span>
                   <span className="font-black italic text-orange-500">PEAK (98%)</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '98%' }}
                     className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500"
                   />
                </div>
             </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl">
           <div className="space-y-4 sm:space-y-6">
              <CardTitle className="text-base sm:text-lg font-black italic uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                Emoji Engine
              </CardTitle>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {['🚀', '💰', '🎒', '🔥', '🤖', '💼', '📊', '🌐'].map(emoji => (
                  <div key={emoji} className="aspect-square glass rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform cursor-pointer shadow-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 sm:pt-6">
                 <p className="text-[8px] sm:text-[10px] uppercase font-black text-white/20 tracking-widest italic">Top Meta Trends</p>
                 {[
                   { name: 'DePIN AI', score: 98 },
                   { name: 'Modular Memes', score: 87 },
                   { name: 'Solana Mobile', score: 72 },
                 ].map(trend => (
                   <div key={trend.name} className="flex justify-between items-center">
                     <span className="text-[10px] sm:text-xs font-black italic uppercase tracking-tighter">{trend.name}</span>
                     <span className="text-[10px] font-mono font-black italic text-green-500">+{trend.score}%</span>
                   </div>
                 ))}
              </div>
           </div>
           <Button variant="ghost" className="mt-6 sm:mt-8 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white rounded-xl">View Full Meta Map</Button>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6">
        {[
          { label: 'Radar', icon: Users, info: '42 Raids' },
          { label: 'Narrative', icon: MessageSquare, info: 'Bullish' },
          { label: 'Velocity', icon: Zap, info: '12.5k / min' },
          { label: 'Attention', icon: Heart, info: 'Locked' },
        ].map((item, i) => (
          <div key={i} className="glass p-3 sm:p-5 rounded-xl sm:rounded-3xl group cursor-pointer hover:bg-white/10 transition-all border-none relative overflow-hidden shadow-lg">
            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 group-hover:text-pink-500 transition-colors mb-2 sm:mb-3" />
            <p className="text-[8px] sm:text-[10px] uppercase font-black text-white/20 tracking-widest font-mono italic">{item.label}</p>
            <p className="text-sm sm:text-lg font-black italic uppercase tracking-tighter mt-1">{item.info}</p>
            <div className="absolute top-0 right-0 p-2 opacity-[0.03] pointer-events-none">
               <item.icon className="w-8 h-8 sm:w-16 sm:h-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

  );
}
