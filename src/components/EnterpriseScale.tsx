import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Building2, ShieldCheck, Zap, Layers, 
  MessageSquare, Users, Globe, Lock,
  FileText, Briefcase, Network, Server,
  ArrowUpRight
} from 'lucide-react';

export function EnterpriseScale() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Institutional Vaults', icon: Lock, color: 'text-purple-500' },
          { label: 'Multi-Sig Launch', icon: ShieldCheck, color: 'text-blue-500' },
          { label: 'Custody Partners', icon: Building2, color: 'text-orange-500' },
          { label: 'KYB Verification', icon: FileText, color: 'text-green-500' },
        ].map((item, i) => (
          <Card key={i} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 cursor-pointer transition-all">
            <item.icon className={`w-5 h-5 mb-3 ${item.color}`} />
            <p className="text-xs font-bold">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10 text-white rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 space-y-6 border-b md:border-b-0 md:border-r border-white/10">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-500" />
              White Label SDK
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Power your own launchpad with our core infrastructure. Full access to the Bags SDK, customized for your brand identity.
            </p>
            <div className="space-y-3">
              {[
                'Enterprise-grade API uptime (99.9%)',
                'Dedicated infrastructure nodes',
                'Priority technical support channel',
                'Custom fee structure integration'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  {feat}
                </div>
              ))}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-xl">Contact Sales</Button>
          </div>
          <div className="p-8 bg-black/40 flex flex-col justify-between">
             <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Network Status</h4>
               <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-xs">Mainnet Node Cluster</span>
                   <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">STABLE</Badge>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-xs">Proprietary RPC</span>
                   <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">ACTIVE</Badge>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-xs">Security Firewall</span>
                   <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">PROTECTING</Badge>
                 </div>
               </div>
             </div>
             <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] text-white/20 italic">"Global infrastructure powering over $1B in weekly transaction volume."</p>
             </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 text-white p-6 rounded-3xl">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Server className="w-5 h-5 text-orange-500" />
               Dedicated Market Making
             </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
             <p className="text-xs text-white/40">Professional liquidity management and spread maintenance for enterprise launches.</p>
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                 <p className="text-[8px] uppercase font-bold text-white/20">Min TVL</p>
                 <p className="text-lg font-bold font-mono">10k SOL</p>
               </div>
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                 <p className="text-[8px] uppercase font-bold text-white/20">Target Spread</p>
                 <p className="text-lg font-bold font-mono">0.05%</p>
               </div>
             </div>
          </CardContent>
          <CardFooter className="px-0">
             <Button variant="outline" className="w-full border-white/10 bg-white/5 text-xs">Request Prospectus</Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white p-6 rounded-3xl">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-purple-500" />
               Institution Onboarding
             </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
             <p className="text-xs text-white/40">Concierge service for hedge funds and venture capital firms entering the ecosystem.</p>
             <div className="space-y-2">
                {[
                  'Custom regulatory compliance maps',
                  'Venture allocation management',
                  'OTC desk integration',
                  'Portfolio reporting tools'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                    <ArrowUpRight className="w-3 h-3 text-purple-500" />
                    {item}
                  </div>
                ))}
             </div>
          </CardContent>
          <CardFooter className="px-0">
             <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold text-xs h-10 rounded-xl">Schedule Onboarding</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
