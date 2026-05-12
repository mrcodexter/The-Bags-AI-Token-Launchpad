import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, 
  Filter, Calendar, Info, Brain, Zap, ArrowUpRight,
  Target, Rocket, Shield, Activity, Globe, Waves, Users, ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const mockData = {
  '1h': Array.from({ length: 60 }, (_, i) => ({ time: `${i}m`, price: 0.1 + Math.random() * 0.05 })),
  '24h': Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, price: 0.1 + Math.random() * 0.2 })),
  '7d': Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, price: 0.5 + Math.random() * 1.5 })),
  '30d': Array.from({ length: 30 }, (_, i) => ({ time: `D${i+1}`, price: 1.0 + Math.random() * 10 })),
};

export function TokenAnalytics({ tokenName = "BAGS TOKEN", symbol = "BAGS" }) {
  const [range, setRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showAdvisor, setShowAdvisor] = useState(false);

  const data = useMemo(() => mockData[range], [range]);
  
  const currentPrice = data[data.length - 1].price.toFixed(4);
  const prevPrice = data[0].price;
  const change = (((parseFloat(currentPrice) - prevPrice) / prevPrice) * 100).toFixed(2);
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="lg:col-span-3 bg-black/60 border-white/5 text-white backdrop-blur-3xl p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
            <BarChart3 className="w-16 h-16 sm:w-32 sm:h-32 text-blue-500" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center font-black italic text-blue-400 shrink-0">
                  {symbol[0]}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase truncate">{tokenName} / SOL</h3>
                  <p className="text-[10px] sm:text-xs text-white/40 font-mono tracking-widest uppercase truncate">Contract: 5K7...9X1</p>
                </div>
              </div>
              <div className="flex items-baseline gap-3 sm:gap-4 mt-2">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tighter">${currentPrice}</span>
                <Badge variant="outline" className={`border-none px-0 text-xs sm:text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {isPositive ? '+' : ''}{change}%
                </Badge>
              </div>
            </div>

            <Tabs value={range} onValueChange={(v: any) => setRange(v)} className="bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent gap-1 w-full justify-between sm:justify-start">
                {['1h', '24h', '7d', '30d'].map((r) => (
                  <TabsTrigger 
                    key={r} 
                    value={r} 
                    className="flex-1 sm:flex-initial rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="h-[250px] sm:h-[350px] w-full relative z-10 transition-all">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#ffffff20" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false} 
                  padding={{ left: 10, right: 10 }}
                  hide={range === '1h'} // Hide labels on very dense ranges on small screens if needed
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#ffffff40', fontSize: '9px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? "#22c55e" : "#ef4444"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
          <Card className="bg-white/5 border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-3xl shadow-xl">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-white/40 mb-4 sm:mb-6 flex items-center justify-between">
              Statistics <Activity className="w-4 h-4 text-blue-500" />
            </CardTitle>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {[
                { label: 'Market Cap', value: '$45.8M', icon: Globe },
                { label: 'Vol (24h)', value: '$1.2M', icon: Zap },
                { label: 'Liquidity', value: '$250K', icon: Waves },
                { label: 'Holders', value: '2,405', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 group cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <stat.icon className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] sm:text-xs font-bold text-white/60">{stat.label}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black font-mono">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-blue-500/20 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-3xl relative overflow-hidden group cursor-pointer shadow-xl" onClick={() => setShowAdvisor(!showAdvisor)}>
            <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Brain className="w-16 h-16 sm:w-24 sm:h-24" />
            </div>
            <div className="relative z-10">
              <Badge className="bg-blue-500 text-white mb-2 sm:mb-4 text-[8px] sm:text-[9px] font-black uppercase tracking-widest italic">AI Advisor</Badge>
              <h4 className="text-base sm:text-lg font-black italic tracking-tighter leading-tight mb-2 uppercase">OPTIMIZATION BRAIN</h4>
              <p className="text-[9px] sm:text-[10px] text-white/60 leading-relaxed font-bold">
                Our model observed 12% increase in velocity.
              </p>
              <Button variant="ghost" className="p-0 h-auto mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:translate-x-1 transition-all">
                STRATEGY <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showAdvisor && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-black/40 border-white/5 p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative border-none">
               <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none" />
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 relative z-10">
                  <div className="lg:col-span-1 space-y-4">
                     <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center">
                        <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                     </div>
                     <CardTitle className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase">AI Launch Strategy</CardTitle>
                     <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
                        Our agent analyzed current Solana trends for ${symbol}. 
                        Actionable recommendations for growth.
                     </p>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     {[
                       { title: 'Dynamic Bonding', desc: 'Scale reserve ratio to 15% to buffer selloffs.', icon: Target, color: 'text-blue-500' },
                       { title: 'Social Sync', desc: 'Auto-post alpha updates to AI Societies.', icon: Sparkles, color: 'text-pink-500' },
                       { title: 'Sentinel Guard', desc: 'Activate MEV protection with 0.5% tip.', icon: Shield, color: 'text-green-500' },
                       { title: 'Viral Velocity', desc: 'Incentivize holders with prestige points.', icon: Rocket, color: 'text-orange-500' },
                     ].map((rec, i) => (
                       <div key={i} className="glass p-4 sm:p-6 rounded-[1.25rem] sm:rounded-3xl border-white/5 flex gap-4 hover:bg-white/5 transition-colors">
                          <rec.icon className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 ${rec.color}`} />
                          <div>
                             <h4 className="font-black italic text-xs sm:text-sm mb-1 uppercase">{rec.title}</h4>
                             <p className="text-[9px] sm:text-[10px] text-white/60 leading-relaxed font-bold">{rec.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
