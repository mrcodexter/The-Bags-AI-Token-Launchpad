import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Rocket, ShieldCheck, Zap, MessageSquare, 
  Target, GraduationCap, ClipboardCheck, 
  Lightbulb, AlertTriangle, CheckCircle2,
  BrainCircuit, ChevronRight, Activity
} from 'lucide-react';
import { motion } from 'motion/react';

export function CompetitiveFeatures() {
  const [checklist, setChecklist] = useState([
    { task: 'Metadata configuration', status: 'done' },
    { task: 'Liquidity pool setup', status: 'done' },
    { task: 'Security audit simulation', status: 'in-progress' },
    { task: 'Social engine integration', status: 'pending' },
    { task: 'Market making simulation', status: 'pending' },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Launch Optimization Engine
            </CardTitle>
            <CardDescription className="text-white/40">AI analyzes trillions of on-chain data points to find your perfect launch window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">Market Readiness</span>
                  <span className="text-xs font-mono text-green-500">OPTIMAL</span>
                </div>
                <Progress value={92} className="h-1.5 bg-white/5" />
             </div>
             <div className="space-y-2">
                {[
                  'Low MEV activity detected',
                  'High liquidity influx in niche',
                  'Social sentiment peak at 2PM UTC'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-white/40">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
             </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-10 rounded-xl">Generate Final Plan</Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              AI Creator Coach
            </CardTitle>
            <CardDescription className="text-white/40">Your personal advisor for community building and marketing strategy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 italic text-xs text-purple-300">
               "Hey! I noticed your token description lacks 'utility-first' keywords. Try emphasizing the AI integration more to attract the tech-focused whales."
             </div>
             <div className="space-y-3">
               <h4 className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Suggested Actions</h4>
               {[
                 { label: 'Improve Storytelling', cost: 'Free', icon: MessageSquare },
                 { label: 'Influencer Outreach', cost: '12 SOL', icon: Rocket },
                 { label: 'Tokenomics Refinement', cost: 'Free', icon: Target },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/10">{item.cost}</Badge>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-green-500" />
              Checklist Automation
            </CardTitle>
            <CardDescription className="text-white/40">Eliminate manual errors with automated verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {checklist.map((item, i) => (
               <div key={i} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.status === 'done' ? 'bg-green-500/20 text-green-500' : item.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-500 animate-pulse' : 'bg-white/5 text-white/20'}`}>
                     {item.status === 'done' ? <CheckCircle2 className="w-3 h-3" /> : item.status === 'in-progress' ? <Zap className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                   </div>
                   <span className={`text-xs ${item.status === 'done' ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.task}</span>
                 </div>
                 {item.status === 'done' && <Badge className="bg-green-500/10 text-green-500 shadow-none border-none text-[8px]">PASS</Badge>}
               </div>
             ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold gap-2">
              Run Risk Simulation <Activity className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-white/5 border-white/10 text-white p-6 rounded-3xl group cursor-pointer hover:bg-white/10 transition-all">
           <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">AI Launch Risk Simulator</h3>
                <p className="text-sm text-white/40 mt-1">Stress-test your token against black swan events, massive sell-offs, and Sybil attacks before they happen.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-500 font-bold">
                  Run Simulation <ChevronRight className="w-4 h-4" />
                </div>
              </div>
           </div>
         </Card>

         <Card className="bg-white/5 border-white/10 text-white p-6 rounded-3xl group cursor-pointer hover:bg-white/10 transition-all">
           <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Business Strategy Assistant</h3>
                <p className="text-sm text-white/40 mt-1">Convert your vision into a sustainable growth roadmap. Optimize your treasury for multi-year runways.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-purple-500 font-bold">
                  Start Consultation <ChevronRight className="w-4 h-4" />
                </div>
              </div>
           </div>
         </Card>
       </div>
    </div>
  );
}
