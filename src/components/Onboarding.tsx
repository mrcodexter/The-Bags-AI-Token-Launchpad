import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Rocket, ShieldCheck, Zap, 
  Wallet, Sparkles, ChevronRight, 
  CheckCircle2, Bot, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Sync Neural Wallet', description: 'Connect your Solana wallet to establish a secure neural link with Bags OS.', icon: Wallet },
  { id: 2, title: 'Identity Initialization', description: 'Mint your Soulbound Creator ID to unlock prestige levels and agent access.', icon: ShieldCheck },
  { id: 3, title: 'Launch Your First Bag', icon: Rocket, description: 'Use the Prompt-to-Launch engine to create your first autonomous token.' },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const { connected, publicKey, connecting } = useWallet();

  const handleNext = () => {
    if (currentStep === 1 && !connected) {
      toast.error('Neural link required. Please connect your wallet.');
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Card className="max-w-xl mx-auto bg-black/60 border-blue-500/20 text-white rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1">
         <Progress value={(currentStep / steps.length) * 100} className="rounded-none h-1 bg-white/5" />
      </div>
      
      <CardHeader className="text-center pt-12">
        <div className="w-20 h-20 bg-blue-600/20 rounded-[2rem] mx-auto flex items-center justify-center mb-6">
           {(() => {
             const Icon = steps[currentStep-1].icon;
             return <Icon className="w-10 h-10 text-blue-400" />;
           })()}
        </div>
        <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">
          Step {currentStep}: {steps[currentStep-1].title}
        </CardTitle>
        <CardDescription className="text-white/40 text-lg max-w-sm mx-auto mt-2 text-center">
          {steps[currentStep-1].description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-12 pt-0 space-y-8">
         {currentStep === 1 && (
           <div className="flex flex-col items-center gap-6 p-8 glass rounded-[2rem] border-blue-500/10">
             <p className="text-sm text-center text-white/60 font-medium">
               {connected 
                 ? `Neural link established: ${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`
                 : "Establish a secure connection to the Solana network to bridge your identity."}
             </p>
             <div className="wallet-adapter-custom">
                <WalletMultiButton className="!bg-blue-600 !h-14 !rounded-2xl !font-black !italic !px-8 hover:!bg-blue-700 transition-colors" />
             </div>
           </div>
         )}

         <div className="p-6 glass rounded-3xl border-white/5 space-y-4">
            <div className="flex items-start gap-4">
               <Bot className="w-5 h-5 text-purple-400 shrink-0" />
               <p className="text-xs text-white/60 italic leading-relaxed">
                 {currentStep === 1 && connected 
                   ? "Link confirmed. The system is now ready for identity initialization. Let's proceed."
                   : currentStep === 1 
                   ? "I'm Bags Assistant. First, we need to locate your neural wallet on the Solana sequence."
                   : steps[currentStep-1].id === 2 
                   ? "Your ID will be permanent and unique to your creative output. Choose your handle wisely."
                   : "Launching a Bag requires 0.1 SOL for the initial bonding curve. Your agent will handle the rest."}
               </p>
            </div>
         </div>
      </CardContent>

      <CardFooter className="p-12 pt-0">
         <Button 
           disabled={currentStep === 1 && !connected}
           onClick={handleNext} 
           className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-lg font-black italic rounded-2xl group"
         >
            {connecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {currentStep === steps.length ? 'INITIALIZE ENGINE' : 'NEXT SEQUENCE'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
         </Button>
      </CardFooter>
    </Card>
  );
}
