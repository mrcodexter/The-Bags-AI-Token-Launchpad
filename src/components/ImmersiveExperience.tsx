import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Map, Compass, HelpCircle, LayoutDashboard,
  Bell, CheckCircle2, ChevronRight, Zap, 
  Sparkles, Globe, Target, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ImmersiveExperience() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: 'Project Vision', desc: 'Define your token purpose and metadata with AI co-pilot.', icon: Target },
    { title: 'Econ Modeling', desc: 'Simulate bonding curves and vesting schedules.', icon: Briefcase },
    { title: 'Social Seed', desc: 'Generate viral assets and influencer strategy.', icon: Globe },
    { title: 'Pre-Launch Audit', desc: 'On-chain risk assessment and final checklist.', icon: CheckCircle2 },
    { title: 'Ignition', desc: 'Execute atomic transaction and start LP.', icon: Rocket },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Compass className="w-6 h-6 text-orange-500" />
            Smart Onboarding Journey
          </CardTitle>
          <CardDescription className="text-white/40">Our step-by-step guided experience for successful token launches.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group cursor-pointer" onClick={() => setActiveStep(i)}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeStep === i ? 'bg-orange-500 text-black shadow-xl shadow-orange-500/20 scale-110' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <h4 className={`text-xs font-bold font-sans uppercase tracking-widest ${activeStep === i ? 'text-white' : 'text-white/20'}`}>{step.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-12 p-8 rounded-3xl bg-white/5 border border-white/5"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                 <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = steps[activeStep].icon;
                      return <Icon className="w-8 h-8 text-orange-500" />;
                    })()}
                 </div>
                 <div className="flex-1 text-center md:text-left">
                   <h3 className="text-xl font-bold uppercase tracking-tighter">Step {activeStep + 1}: {steps[activeStep].title}</h3>
                   <p className="text-white/60 mt-2 max-w-xl">{steps[activeStep].desc}</p>
                 </div>
                 <Button className="bg-white text-black font-bold h-12 px-8 rounded-xl shrink-0">
                   {activeStep === 4 ? 'Launch Now' : 'Enter Module'}
                 </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden group">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-500" />
              AI Ecosystem Map
            </CardTitle>
            <CardDescription className="text-white/40">Visualizing your token's position in the global Solanascape.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative overflow-hidden bg-black/20">
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
             </div>
             <div className="relative text-center">
               <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full animate-pulse" />
                  <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center relative z-10">
                    <Sparkles className="w-10 h-10 text-blue-500" />
                  </div>
               </div>
               <p className="mt-6 text-[10px] uppercase font-bold tracking-widest text-white/20">Synthesizing Topology...</p>
             </div>
          </CardContent>
          <CardFooter className="justify-center border-t border-white/5 bg-white/5">
             <Button variant="ghost" className="text-xs text-blue-500 font-bold hover:bg-transparent">Explore Connections <ChevronRight className="w-4 h-4" /></Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white rounded-3xl p-6 flex flex-col justify-between">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  AI Intelligence Hub
                </CardTitle>
                <Badge className="bg-yellow-500/20 text-yellow-500 border-none">ACTIVE</Badge>
              </div>
              <p className="text-sm text-white/40 leading-relaxed italic">
                "Our troubleshooting engine detected a potential liquidity bottleneck in your bonding curve setup. We've auto-adjusted your slippage tolerance thresholds to prevent launch failure."
              </p>
              <div className="space-y-3">
                 {[
                   { label: 'Auto Troubleshooting', status: 'Healthy' },
                   { label: 'Growth Planner', status: 'New Alpha' },
                   { label: 'Risk Monitor', status: 'Scanning' },
                 ].map((hub, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                     <span className="text-xs font-medium">{hub.label}</span>
                     <span className="text-[10px] text-green-500 font-mono">{hub.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           <Button className="mt-8 bg-blue-600 hover:bg-blue-700 font-bold w-full h-11 rounded-xl">View Full Insights</Button>
        </Card>
      </div>
    </div>
  );
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2s-7 7-7 7a22 22 0 0 1-3.95 2A12.88 12.88 0 0 1 2 22s7-7 7-7z" />
      <path d="M9 15c-1-1-1-2.5 0-3.5" />
      <path d="M15 9c1 1 2.5 1 3.5 0" />
      <path d="m12 12 3 3" />
    </svg>
  );
}
