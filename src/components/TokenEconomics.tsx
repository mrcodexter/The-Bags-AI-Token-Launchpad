import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Coins, TrendingUp, ShieldCheck, Activity, 
  Lock, PieChart as PieChartIcon, ArrowRight,
  Database, RefreshCcw, Sparkles, Layout
} from 'lucide-react';

const mockEmissionData = [
  { month: 'M1', amount: 100 }, { month: 'M2', amount: 80 },
  { month: 'M3', amount: 64 }, { month: 'M4', amount: 51 },
  { month: 'M5', amount: 41 }, { month: 'M6', amount: 33 },
  { month: 'M7', amount: 26 }, { month: 'M8', amount: 21 },
  { month: 'M9', amount: 17 }, { month: 'M10', amount: 14 },
  { month: 'M11', amount: 11 }, { month: 'M12', amount: 9 },
];

export function TokenEconomics() {
  const [allocation, setAllocation] = useState([
    { name: 'Public Sale', value: 40, color: '#3b82f6' },
    { name: 'Liquidity', value: 30, color: '#8b5cf6' },
    { name: 'Team', value: 15, color: '#f59e0b' },
    { name: 'Marketing', value: 10, color: '#22c55e' },
    { name: 'Foundation', value: 5, color: '#ef4444' },
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] overflow-hidden group shadow-2xl">
          <CardHeader className="p-0 mb-4 sm:mb-6">
            <CardTitle className="text-xl sm:text-2xl font-black italic tracking-tight flex items-center gap-2 sm:gap-3 uppercase">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 shrink-0" />
              ADAPTIVE ALLOCATION
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-white/40 font-medium tracking-tight">Self-balancing engine adjusting to volatility.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6 sm:space-y-8">
             <div className="h-[200px] sm:h-[250px] w-full relative">
               <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-blue-500 rounded-full animate-ping" />
               </div>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={allocation}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={6}
                     dataKey="value"
                   >
                     {allocation.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                     itemStyle={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
               {allocation.slice(0, 3).map((item) => (
                 <div key={item.name} className="p-2 sm:p-3 glass rounded-xl sm:rounded-2xl shadow-lg border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                       <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/30 truncate">{item.name}</span>
                    </div>
                    <p className="text-sm sm:text-lg font-black italic tracking-tighter">{item.value}%</p>
                 </div>
               ))}
             </div>
          </CardContent>
          <CardFooter className="p-0 mt-6 sm:mt-8">
            <Button className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest italic rounded-xl sm:rounded-2xl gap-2 shadow-lg shadow-blue-600/20 text-xs">
               INITIALIZE AUTO <RefreshCcw className="w-3 h-3" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-2xl">
          <CardHeader className="p-0 mb-4 sm:mb-6">
            <CardTitle className="text-xl sm:text-2xl font-black italic tracking-tight flex items-center gap-2 sm:gap-3 uppercase">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
              EMISSION ENGINE
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs text-white/40 font-medium tracking-tight">AI-predicted supply release optimizer.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6 sm:space-y-8">
             <div className="h-[200px] sm:h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={mockEmissionData}>
                   <defs>
                     <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="month" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                   <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                     itemStyle={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEmission)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
             
             <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                    <span>Pressure</span>
                    <span className="text-blue-500 font-mono font-black italic">24.1%</span>
                  </div>
                  <Slider defaultValue={[24]} max={50} step={1} className="py-2" />
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 sm:gap-4 shadow-inner">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                      <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                   </div>
                   <p className="text-[9px] sm:text-[10px] text-blue-300 font-bold leading-relaxed italic">
                     Buyback recommendation: Scale intensity if volume {'>'} 50k SOL.
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6">
         <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-xl sm:rounded-3xl group cursor-pointer hover:bg-white/10 transition-all shadow-lg">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-3 sm:mb-4" />
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest mb-2 italic">Smart Vesting</h4>
            <div className="space-y-1.5">
               <div className="flex justify-between text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                 <span>CLIFF</span>
                 <span className="font-mono text-white italic">6M</span>
               </div>
               <div className="flex justify-between text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                 <span>VESTING</span>
                 <span className="font-mono text-white italic">18M</span>
               </div>
            </div>
         </Card>

         <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-xl sm:rounded-3xl group cursor-pointer hover:bg-white/10 transition-all col-span-1 md:col-span-2 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
               <div className="min-w-0">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-3 sm:mb-4" />
                  <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest mb-2 italic truncate">AI Treasury Swarm</h4>
                  <p className="text-[9px] sm:text-[10px] text-white/40 max-w-sm font-medium leading-relaxed italic">Autonomous protocol securing 12,450 SOL across nodes.</p>
               </div>
               <Button variant="outline" className="w-full sm:w-auto text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic border-white/10 h-10 rounded-xl px-6">Manage</Button>
            </div>
         </Card>
       </div>
    </div>
  );
}
