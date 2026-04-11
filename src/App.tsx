import { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { bagsApi, TokenMetadata } from './lib/bags';
import { transactionLogger, TransactionLog } from './lib/logger';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { toast } from 'sonner';
import { 
  Rocket, Wallet, Coins, Settings, ExternalLink, RefreshCw, 
  Image as ImageIcon, TrendingUp, Brain, BarChart3, Users, 
  ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Search,
  MessageSquare, Trophy, Activity, LogOut, Download, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Mock data for charts
const mockChartData = [
  { time: '00:00', price: 0.0012 },
  { time: '04:00', price: 0.0015 },
  { time: '08:00', price: 0.0013 },
  { time: '12:00', price: 0.0018 },
  { time: '16:00', price: 0.0022 },
  { time: '20:00', price: 0.0020 },
  { time: '23:59', price: 0.0025 },
];

export default function App() {
  const { publicKey, sendTransaction, signTransaction, disconnect, select, wallets: availableWallets, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('launch');
  const [savedWallets, setSavedWallets] = useState<string[]>([]);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [txStatus, setTxStatus] = useState<'idle' | 'simulating' | 'pending' | 'success' | 'failed'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [lastMint, setLastMint] = useState<string>('');
  const [lastSignature, setLastSignature] = useState<string>('');
  const [trustScore, setTrustScore] = useState<number>(85);
  const [storageProvider, setStorageProvider] = useState<'centralized' | 'arweave' | 'ipfs'>('arweave');
  const [mevProtection, setMevProtection] = useState(true);
  const [privateRelay, setPrivateRelay] = useState(false);
  const [activeAgents, setActiveAgents] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Management State
  const [manageMint, setManageMint] = useState('');
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [airdropRecipients, setAirdropRecipients] = useState('');
  const [newAuthority, setNewAuthority] = useState('');
  const [tradeMint, setTradeMint] = useState('');
  const [tradeAmount, setTradeAmount] = useState<number>(0);

  // Token Creation State
  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    description: '',
    image: '',
  });
  const [amount, setAmount] = useState<number>(1);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bags-saved-wallets');
    if (saved) setSavedWallets(JSON.parse(saved));
    
    setLogs(transactionLogger.getLogs());
    const handleLogsUpdate = () => setLogs(transactionLogger.getLogs());
    window.addEventListener('bags_logs_updated', handleLogsUpdate);
    return () => window.removeEventListener('bags_logs_updated', handleLogsUpdate);
  }, []);

  useEffect(() => {
    if (publicKey) {
      const address = publicKey.toBase58();
      setSavedWallets(prev => {
        if (prev.includes(address)) return prev;
        const next = [...prev, address].slice(-5); // Keep last 5
        localStorage.setItem('bags-saved-wallets', JSON.stringify(next));
        return next;
      });
      fetchFees();
      fetchBalance();
    }
  }, [publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / 1e9);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSimulate = async () => {
    if (!publicKey) return;
    setTxStatus('simulating');
    try {
      // Mock simulation for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimulationResult({
        fee: 0.005,
        computeUnits: 200000,
        success: true
      });
      setShowPreview(true);
    } catch (error) {
      toast.error('Simulation failed');
    } finally {
      setTxStatus('idle');
    }
  };

  const applyTemplate = (type: 'meme' | 'utility' | 'ai') => {
    const templates = {
      meme: { name: 'Doge Bag', symbol: 'DBAG', description: 'The ultimate meme bag on Solana.', image: 'https://picsum.photos/seed/doge/400/400' },
      utility: { name: 'Bags Utility', symbol: 'BUTIL', description: 'Powering the Bags ecosystem.', image: 'https://picsum.photos/seed/utility/400/400' },
      ai: { name: 'Neural Bag', symbol: 'NBAG', description: 'AI-driven tokenomics.', image: 'https://picsum.photos/seed/ai/400/400' }
    };
    setMetadata(templates[type]);
    toast.success(`${type.toUpperCase()} template applied`);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (e) {
      toast.error('Failed to disconnect');
    }
  };

  const handleSwitchWallet = () => {
    setVisible(true);
  };

  const fetchFees = async () => {
    if (!publicKey) return;
    try {
      const data = await bagsApi.getFees(publicKey.toBase58());
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!metadata.name || !metadata.symbol || !metadata.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (solBalance < 0.05) {
      toast.error('Low SOL balance', {
        description: 'You need at least 0.05 SOL to cover creation fees and rent.'
      });
      return;
    }

    setLoading(true);
    setTxStatus('pending');
    try {
      const { transaction: txBase64, mint } = await bagsApi.createToken({
        metadata,
        amount,
        feeRecipient: publicKey.toBase58(),
        creator: publicKey.toBase58(),
      });

      const transaction = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
      
      if (signTransaction) {
        const signedTx = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        setLastSignature(signature);
        await connection.confirmTransaction(signature);
        
        setLastMint(mint);
        setTxStatus('success');
        fetchBalance();
        
        transactionLogger.log({
          action: 'token_creation',
          status: 'success',
          signature,
          wallet: publicKey.toBase58(),
          metadata: { mint, name: metadata.name, symbol: metadata.symbol }
        });
        
        toast.success('Token created successfully!', {
          description: `Mint: ${mint.slice(0, 8)}...`,
          action: {
            label: 'View on Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
          },
        });
      }
    } catch (error: any) {
      console.error('Error creating token:', error);
      setTxStatus('failed');
      
      transactionLogger.log({
        action: 'token_creation',
        status: 'failed',
        wallet: publicKey?.toBase58() || 'unknown',
        metadata: { error: error.message, name: metadata.name }
      });
      
      toast.error('Failed to create token', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const shareOnTwitter = (mint: string) => {
    const text = `I just launched a new token on @TheBagsSolana! 🚀\n\nMint: ${mint}\n\nCheck it out here: ${window.location.origin}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleClaimFees = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const { transaction: txBase64 } = await bagsApi.claimFees(publicKey.toBase58());
      const transaction = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
      
      if (signTransaction) {
        const signedTx = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(signature);
        toast.success('Fees claimed successfully!');
        fetchFees();
        
        transactionLogger.log({
          action: 'fee_claim',
          status: 'success',
          signature,
          wallet: publicKey.toBase58(),
          metadata: { amount: fees?.totalFees }
        });
      }
    } catch (error: any) {
      console.error('Error claiming fees:', error);
      
      transactionLogger.log({
        action: 'fee_claim',
        status: 'failed',
        wallet: publicKey?.toBase58() || 'unknown',
        metadata: { error: error.message }
      });
      
      toast.error('Failed to claim fees');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!publicKey || !tradeMint || tradeAmount <= 0) {
      toast.error('Invalid trade parameters');
      return;
    }
    setLoading(true);
    try {
      const response = type === 'buy' 
        ? await bagsApi.buyToken(tradeMint, tradeAmount, publicKey.toBase58())
        : await bagsApi.sellToken(tradeMint, tradeAmount, publicKey.toBase58());
      
      toast.success(`${type.toUpperCase()} successful!`);
      
      transactionLogger.log({
        action: type === 'buy' ? 'trade_buy' : 'trade_sell',
        status: 'success',
        signature: response.signature,
        wallet: publicKey.toBase58(),
        metadata: { mint: tradeMint, amount: tradeAmount }
      });
      fetchBalance();
    } catch (error: any) {
      transactionLogger.log({
        action: type === 'buy' ? 'trade_buy' : 'trade_sell',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { mint: tradeMint, error: error.message }
      });
      toast.error(`Failed to ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAuthority = async (type: 'mint' | 'freeze') => {
    if (!publicKey || !manageMint || !newAuthority) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await bagsApi.updateAuthority(manageMint, newAuthority, type, publicKey.toBase58());
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} authority updated!`);
      
      transactionLogger.log({
        action: 'authority_update',
        status: 'success',
        signature: response.signature, // Assuming backend returns signature if it sends it
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, newAuthority, type }
      });
    } catch (error: any) {
      transactionLogger.log({
        action: 'authority_update',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, error: error.message }
      });
      toast.error('Failed to update authority');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!publicKey || !manageMint || burnAmount <= 0) {
      toast.error('Invalid burn parameters');
      return;
    }
    setLoading(true);
    try {
      const response = await bagsApi.burnTokens(manageMint, burnAmount, publicKey.toBase58());
      toast.success('Tokens burned successfully!');
      
      transactionLogger.log({
        action: 'token_burn',
        status: 'success',
        signature: response.signature,
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, amount: burnAmount }
      });
    } catch (error: any) {
      transactionLogger.log({
        action: 'token_burn',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, error: error.message }
      });
      toast.error('Failed to burn tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleAirdropTokens = async () => {
    if (!publicKey || !manageMint || !airdropRecipients) {
      toast.error('Invalid airdrop parameters');
      return;
    }
    setLoading(true);
    try {
      const recipients = airdropRecipients.split('\n').map(line => {
        const [address, amount] = line.split(',');
        return { address: address.trim(), amount: parseFloat(amount) };
      });
      const response = await bagsApi.airdropTokens(manageMint, recipients, publicKey.toBase58());
      toast.success('Airdrop completed!');
      
      transactionLogger.log({
        action: 'airdrop',
        status: 'success',
        signature: response.signature,
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, recipientCount: recipients.length }
      });
    } catch (error: any) {
      transactionLogger.log({
        action: 'airdrop',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { mint: manageMint, error: error.message }
      });
      toast.error('Failed to complete airdrop');
    } finally {
      setLoading(false);
    }
  };

  const runAiAnalysis = async () => {
    if (!metadata.name) {
      toast.error('Enter a token name for AI analysis');
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Analyze the potential of a Solana token named "${metadata.name}" with symbol "${metadata.symbol}". Description: "${metadata.description}". Provide a brief risk analysis and market sentiment prediction. Be concise and professional.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiAnalysis(response.text || 'No analysis generated.');
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('AI Analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const renderSidebarContent = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-white/5 border-white/10 text-white overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Portfolio</CardTitle>
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-white/20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">
            {publicKey ? solBalance.toFixed(4) : '---'} <span className="text-xs sm:text-sm text-white/40">SOL</span>
          </div>
          {publicKey && (
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] sm:text-[10px]">
                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 h-3 mr-1" /> +12.5%
                </Badge>
                <p className="text-[9px] sm:text-[10px] text-white/40 font-mono truncate max-w-[120px] sm:max-w-[150px]">
                  {publicKey.toBase58()}
                </p>
              </div>
              {solBalance < 0.05 && (
                <div className="p-1.5 sm:p-2 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <Zap className="w-2.5 h-2.5 sm:w-3 h-3 text-red-500" />
                  <span className="text-[7px] sm:text-[8px] text-red-500 font-bold uppercase">Low Balance</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Claimable Rewards</CardTitle>
            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-white/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">
            {fees?.amount || '0.00'} <span className="text-xs sm:text-sm text-white/40">SOL</span>
          </div>
          <Button 
            onClick={handleClaimFees} 
            disabled={!publicKey || loading || !fees?.amount}
            className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold h-10 sm:h-12 transition-all active:scale-95 text-xs sm:text-sm"
          >
            {loading ? <RefreshCw className="animate-spin mr-2 w-3 h-3 sm:w-4 sm:h-4" /> : null}
            Claim Rewards
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Wallet Manager</CardTitle>
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${publicKey ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">{publicKey ? 'Connected' : 'Disconnected'}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/40">{publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : 'No active session'}</span>
                </div>
              </div>
              {publicKey && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDisconnect}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[7px] sm:text-[8px] uppercase font-bold text-white/20 tracking-widest px-1">Available Wallets</p>
              <div className="grid grid-cols-1 gap-1 sm:gap-1.5 max-h-[160px] sm:max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {availableWallets.map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => {
                      if (w.readyState === 'Installed') {
                        select(w.adapter.name);
                      } else {
                        window.open(w.adapter.url, '_blank');
                      }
                    }}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all group ${
                      wallet?.adapter.name === w.adapter.name 
                        ? 'bg-white/10 border-white/20' 
                        : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img src={w.adapter.icon} alt={w.adapter.name} className="w-4 h-4 sm:w-5 sm:h-5" referrerPolicy="no-referrer" />
                      <span className="text-[10px] sm:text-[11px] font-medium text-white/80 group-hover:text-white">{w.adapter.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {w.readyState === 'Installed' ? (
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0">INSTALLED</Badge>
                      ) : (
                        <Download className="w-2.5 h-2.5 sm:w-3 h-3 text-white/20 group-hover:text-white/40" />
                      )}
                      {wallet?.adapter.name === w.adapter.name && (
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleSwitchWallet}
              variant="outline" 
              className="w-full text-[9px] sm:text-[10px] h-9 sm:h-10 border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold uppercase tracking-widest"
            >
              Open Wallet Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white/40" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Security Status</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">API Authentication</span>
          <Badge className="bg-green-500/20 text-green-500 border-none text-[10px]">SECURE</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Wallet Encryption</span>
          <Badge className="bg-green-500/20 text-green-500 border-none text-[10px]">ACTIVE</Badge>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Top Traders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'SolWhale', profit: '+1,240 SOL' },
            { name: 'BagsMaster', profit: '+850 SOL' },
            { name: 'AlphaGen', profit: '+620 SOL' },
          ].map((trader, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold group-hover:bg-white group-hover:text-black transition-all">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{trader.name}</span>
              </div>
              <span className="text-xs text-green-500 font-mono">{trader.profit}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black font-sans w-full overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Rocket className="text-black w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">THE BAGS</h1>
              <p className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-widest hidden xs:block">AI-Powered Launchpad</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10">
              <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-mono text-white/60">SOL: $142.50</span>
            </div>
            <div className="hidden xs:flex items-center gap-2 bg-green-500/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-green-500/20">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500" />
              <span className="text-[7px] sm:text-[8px] font-bold text-green-500 uppercase tracking-widest">Mainnet</span>
            </div>
            <WalletMultiButton className="!bg-white !text-black !rounded-full !font-bold hover:!opacity-90 transition-all !h-9 sm:!h-11 !text-xs sm:!text-sm !px-4 sm:!px-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden h-9 w-9 sm:h-11 sm:w-11 text-white/60 hover:text-white hover:bg-white/5 rounded-full"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] sm:w-[350px] bg-[#0b0b0b] border-l border-white/10 z-[70] lg:hidden overflow-y-auto custom-scrollbar p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold tracking-tight">Dashboard</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Sidebar / Stats - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-4">
            {renderSidebarContent()}
          </div>

          {/* Main Content - Full width on mobile */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8 flex overflow-x-auto no-scrollbar">
                {[
                  { id: 'launch', label: 'Launch', icon: Rocket },
                  { id: 'trade', label: 'Trade', icon: TrendingUp },
                  { id: 'agents', label: 'AI Agents', icon: Brain },
                  { id: 'automation', label: 'Automation', icon: Zap },
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'manage', label: 'Manage', icon: Settings },
                  { id: 'social', label: 'Social', icon: Users },
                  { id: 'profile', label: 'Profile', icon: Wallet },
                ].map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="rounded-xl px-3 sm:px-6 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:text-black transition-all flex items-center gap-2 shrink-0 text-xs sm:text-sm"
                    >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="launch">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Templates */}
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { id: 'meme', label: 'Meme', icon: Rocket, color: 'text-pink-500' },
                        { id: 'utility', label: 'Utility', icon: Zap, color: 'text-yellow-500' },
                        { id: 'ai', label: 'AI Token', icon: Brain, color: 'text-purple-500' }
                      ].map(t => (
                        <button 
                          key={t.id}
                          onClick={() => applyTemplate(t.id as any)}
                          className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-1.5 sm:gap-2 group"
                        >
                          <t.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${t.color} group-hover:scale-110 transition-transform`} />
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">{t.label}</span>
                        </button>
                      ))}
                    </div>

                    <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden">
                      {txStatus === 'pending' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
                          <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin" />
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold">Launching Token...</h3>
                            <p className="text-xs sm:text-sm text-white/40">Please confirm the transaction in your wallet</p>
                          </div>
                        </div>
                      )}

                      {txStatus === 'success' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Launch Successful!</h3>
                            <p className="text-white/40 mt-1 sm:mt-2 text-xs sm:text-sm">Your token is now live on the Solana blockchain.</p>
                          </div>
                          <div className="flex flex-col w-full gap-2 sm:gap-3">
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => copyToClipboard(lastMint, 'Mint Address')}
                                className="flex-1 bg-white/10 hover:bg-white/20 h-10 sm:h-12 rounded-xl text-[10px] sm:text-xs"
                              >
                                Copy Address
                              </Button>
                              <Button 
                                onClick={() => window.open(`https://solscan.io/tx/${lastSignature}`, '_blank')}
                                className="flex-1 bg-white/10 hover:bg-white/20 h-10 sm:h-12 rounded-xl text-[10px] sm:text-xs"
                              >
                                View Transaction
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => shareOnTwitter(lastMint)}
                                className="flex-1 bg-[#1DA1F2] hover:opacity-90 h-10 sm:h-12 rounded-xl text-[10px] sm:text-xs font-bold"
                              >
                                Share on X
                              </Button>
                              <Button 
                                onClick={() => setTxStatus('idle')}
                                className="flex-1 bg-white text-black hover:bg-white/90 h-10 sm:h-12 rounded-xl text-[10px] sm:text-xs font-bold"
                              >
                                Create Another
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Token Studio</CardTitle>
                        <CardDescription className="text-white/40 text-xs sm:text-sm">Launch your next-gen Solana token with AI-optimized parameters.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-6 sm:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Token Name</Label>
                            <Input 
                              placeholder="e.g. Bags AI" 
                              className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl focus:ring-white/20 text-base sm:text-lg font-medium"
                              value={metadata.name}
                              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Symbol</Label>
                            <Input 
                              placeholder="e.g. BAGS" 
                              className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl focus:ring-white/20 text-base sm:text-lg font-mono uppercase"
                              value={metadata.symbol}
                              onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Description</Label>
                          <Input 
                            placeholder="AI-powered token for..." 
                            className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl focus:ring-white/20 text-sm sm:text-base"
                            value={metadata.description}
                            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Initial Supply</Label>
                            <Input 
                              type="number"
                              placeholder="1,000,000" 
                              className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl focus:ring-white/20 font-mono text-sm sm:text-base"
                              value={amount}
                              onChange={(e) => setAmount(parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Image URL</Label>
                            <div className="relative">
                              <Input 
                                placeholder="https://example.com/image.png" 
                                className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl pl-10 sm:pl-12 focus:ring-white/20 text-sm sm:text-base"
                                value={metadata.image}
                                onChange={(e) => setMetadata({ ...metadata, image: e.target.value })}
                              />
                              <ImageIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/20" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Storage Provider</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['centralized', 'arweave', 'ipfs'] as const).map(p => (
                                <Button 
                                  key={p}
                                  variant="outline"
                                  onClick={() => setStorageProvider(p)}
                                  className={`text-[10px] h-10 border-white/10 ${storageProvider === p ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}
                                >
                                  {p.toUpperCase()}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Privacy & MEV</Label>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => setMevProtection(!mevProtection)}
                                className={`flex-1 text-[10px] h-10 border-white/10 ${mevProtection ? 'bg-blue-500/20 text-blue-500 border-blue-500/40' : 'bg-white/5 text-white/60'}`}
                              >
                                MEV Protection
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setPrivateRelay(!privateRelay)}
                                className={`flex-1 text-[10px] h-10 border-white/10 ${privateRelay ? 'bg-purple-500/20 text-purple-500 border-purple-500/40' : 'bg-white/5 text-white/60'}`}
                              >
                                Private Relay
                              </Button>
                            </div>
                          </div>
                        </div>

                        {showPreview && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Launch Simulation</h4>
                              <Badge className="bg-green-500/20 text-green-500 border-none">READY</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] text-white/40 uppercase">Estimated Fee</p>
                                <p className="text-sm font-mono">{simulationResult?.fee} SOL</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-white/40 uppercase">Compute Units</p>
                                <p className="text-sm font-mono">{simulationResult?.computeUnits}</p>
                              </div>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden shrink-0">
                                {metadata.image && <img src={metadata.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{metadata.name} ({metadata.symbol})</p>
                                <p className="text-[10px] text-white/40 truncate max-w-[200px]">{metadata.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <div>
                              <p className="text-xs font-bold">Priority Fees</p>
                              <p className="text-[10px] text-white/40">Auto-optimized for speed</p>
                            </div>
                          </div>
                          <Badge className="bg-white/10 text-white border-none">0.003 SOL</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="px-0 pb-0 gap-4">
                        {!showPreview ? (
                          <Button 
                            onClick={handleSimulate}
                            disabled={txStatus === 'simulating' || !publicKey}
                            className="w-full h-16 bg-white/5 text-white hover:bg-white/10 rounded-2xl text-lg font-bold border border-white/10 transition-all"
                          >
                            {txStatus === 'simulating' ? <RefreshCw className="animate-spin mr-3 w-6 h-6" /> : <ShieldCheck className="mr-3 w-6 h-6" />}
                            {txStatus === 'simulating' ? 'Simulating...' : 'Simulate Launch'}
                          </Button>
                        ) : (
                          <div className="flex w-full gap-4">
                            <Button 
                              onClick={() => setShowPreview(false)}
                              className="flex-1 h-16 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-bold border border-white/10"
                            >
                              Edit Config
                            </Button>
                            <Button 
                              onClick={handleCreateToken}
                              disabled={loading || !publicKey}
                              className="flex-[2] h-16 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-bold shadow-2xl shadow-white/10 transition-all active:scale-[0.98]"
                            >
                              {loading ? <RefreshCw className="animate-spin mr-3 w-6 h-6" /> : <Rocket className="mr-3 w-6 h-6" />}
                              {loading ? 'Launching...' : 'Confirm & Launch'}
                            </Button>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="trade">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-6 rounded-3xl">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="text-base sm:text-lg font-bold">Quick Buy</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-white/40">Token Address</Label>
                            <Input 
                              placeholder="Enter Mint Address" 
                              className="bg-white/5 border-white/10 rounded-xl h-10 sm:h-11 text-sm" 
                              value={tradeMint}
                              onChange={(e) => setTradeMint(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-white/40">Amount (SOL)</Label>
                            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                              {[0.1, 0.5, 1, 5].map(v => (
                                <Button 
                                  key={v} 
                                  variant="outline" 
                                  onClick={() => setTradeAmount(v)}
                                  className={`border-white/10 bg-white/5 hover:bg-white hover:text-black text-[10px] sm:text-xs h-9 sm:h-10 ${tradeAmount === v ? 'bg-white text-black' : ''}`}
                                >
                                  {v}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleTrade('buy')}
                            disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-11 sm:h-12 rounded-xl text-sm"
                          >
                            {loading ? <RefreshCw className="animate-spin mr-2 w-4 h-4" /> : null}
                            Buy Now
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-6 rounded-3xl">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="text-base sm:text-lg font-bold">Quick Sell</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-white/40">Token Address</Label>
                            <Input 
                              placeholder="Enter Mint Address" 
                              className="bg-white/5 border-white/10 rounded-xl h-10 sm:h-11 text-sm" 
                              value={tradeMint}
                              onChange={(e) => setTradeMint(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-white/40">Amount (Tokens)</Label>
                            <Input 
                              type="number"
                              placeholder="Amount to Sell" 
                              className="bg-white/5 border-white/10 rounded-xl h-10 sm:h-11 text-sm" 
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(parseFloat(e.target.value))}
                            />
                          </div>
                          <Button 
                            onClick={() => handleTrade('sell')}
                            disabled={loading}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-11 sm:h-12 rounded-xl text-sm"
                          >
                            {loading ? <RefreshCw className="animate-spin mr-2 w-4 h-4" /> : null}
                            Sell Now
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="manage">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg sm:text-xl font-bold">Token Management</CardTitle>
                        <CardDescription className="text-white/40 text-xs sm:text-sm">Manage authorities, burn tokens, and perform airdrops.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-6 sm:space-y-8">
                        <div className="space-y-3 sm:space-y-4">
                          <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Target Mint Address</Label>
                          <Input 
                            placeholder="Enter Mint Address" 
                            className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl text-sm"
                            value={manageMint}
                            onChange={(e) => setManageMint(e.target.value)}
                          />
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                              Authorities
                            </h3>
                            <Input 
                              placeholder="New Authority Address" 
                              className="bg-white/5 border-white/10 h-9 sm:h-10 rounded-xl text-xs sm:text-sm"
                              value={newAuthority}
                              onChange={(e) => setNewAuthority(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateAuthority('mint')} className="flex-1 bg-white/10 hover:bg-white/20 text-[10px] sm:text-xs h-9 sm:h-10">Update Mint</Button>
                              <Button onClick={() => handleUpdateAuthority('freeze')} className="flex-1 bg-white/10 hover:bg-white/20 text-[10px] sm:text-xs h-9 sm:h-10">Update Freeze</Button>
                            </div>
                          </div>

                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                              Burn Tokens
                            </h3>
                            <Input 
                              type="number"
                              placeholder="Amount to Burn" 
                              className="bg-white/5 border-white/10 h-9 sm:h-10 rounded-xl text-xs sm:text-sm"
                              value={burnAmount}
                              onChange={(e) => setBurnAmount(parseFloat(e.target.value))}
                            />
                            <Button onClick={handleBurnTokens} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/20 h-9 sm:h-10 text-[10px] sm:text-xs">Burn Tokens</Button>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                            Bulk Airdrop
                          </h3>
                          <textarea 
                            placeholder="address1, amount1&#10;address2, amount2" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 h-28 sm:h-32 text-xs sm:text-sm font-mono focus:ring-1 focus:ring-white/20 outline-none resize-none"
                            value={airdropRecipients}
                            onChange={(e) => setAirdropRecipients(e.target.value)}
                          />
                          <Button onClick={handleAirdropTokens} className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/20 h-10 sm:h-12 font-bold text-xs sm:text-sm">Execute Airdrop</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="agents">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-3xl backdrop-blur-sm">
                      <CardHeader className="px-0 pt-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                          <CardTitle className="text-lg sm:text-2xl font-bold tracking-tight">AI Agents</CardTitle>
                        </div>
                        <CardDescription className="text-white/40 text-xs sm:text-sm">Deploy autonomous agents for trading, liquidity management, and risk monitoring.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-6 sm:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          {[
                            { title: 'Auto-Trading Agent', desc: 'Executes trades based on sentiment and volume spikes.', icon: TrendingUp, status: 'Ready' },
                            { title: 'Liquidity Optimizer', desc: 'Self-optimizing liquidity provision across pools.', icon: Zap, status: 'Active' },
                            { title: 'Risk Manager', desc: 'Monitors wallet for suspicious activity and front-running.', icon: ShieldCheck, status: 'Ready' },
                            { title: 'Autonomous Launcher', desc: 'Fully autonomous token launch and marketing agent.', icon: Rocket, status: 'Beta' },
                          ].map((agent, i) => (
                            <div key={i} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                  <agent.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <Badge className={`${agent.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'} border-none text-[7px] sm:text-[8px]`}>
                                  {agent.status.toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold mb-1">{agent.title}</h3>
                              <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed mb-3 sm:mb-4">{agent.desc}</p>
                              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-[9px] sm:text-[10px] h-8 sm:h-9 hover:bg-white hover:text-black">
                                {agent.status === 'Active' ? 'Manage Agent' : 'Deploy Agent'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="automation">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold">Lifecycle Automation</CardTitle>
                        <CardDescription className="text-white/40">Set up intent-based rules for automated token growth and marketing.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Active Workflows</h3>
                          <div className="space-y-3">
                            {[
                              { name: 'Viral Loop Trigger', desc: 'Auto-reward referrers when volume hits 100 SOL.', icon: Users },
                              { name: 'Growth Hacking Bot', desc: 'Auto-post to X/Telegram on price milestones.', icon: Zap },
                              { name: 'Liquidity Lock', desc: 'Auto-lock liquidity after 24 hours of stability.', icon: ShieldCheck },
                            ].map((rule, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                  <rule.icon className="w-4 h-4 text-white/40" />
                                  <div>
                                    <p className="text-sm font-bold">{rule.name}</p>
                                    <p className="text-[10px] text-white/40">{rule.desc}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" className="text-[10px] h-8 text-red-500 hover:bg-red-500/10">Disable</Button>
                              </div>
                            ))}
                          </div>
                          <Button className="w-full bg-white text-black font-bold h-12 rounded-xl mt-4">
                            Create New Workflow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold">Market Performance</CardTitle>
                          <CardDescription className="text-white/40">Real-time price tracking for Bags ecosystem.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-white/10 text-white">1H</Badge>
                          <Badge className="bg-white text-black">24H</Badge>
                          <Badge className="bg-white/10 text-white">7D</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 h-[300px] mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData}>
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#ffffff" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                        <p className="text-[10px] uppercase text-white/40 mb-1">24h Volume</p>
                        <p className="text-2xl font-bold font-mono">$1.2M</p>
                        <p className="text-[10px] text-green-500 mt-1">+24.5%</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Total Launches</p>
                        <p className="text-2xl font-bold font-mono">1,420</p>
                        <p className="text-[10px] text-white/40 mt-1">Across all protocols</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Active Users</p>
                        <p className="text-2xl font-bold font-mono">8.5K</p>
                        <p className="text-[10px] text-green-500 mt-1">+120 today</p>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="dashboard">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Total Volume', value: '$12.4M', icon: TrendingUp, color: 'text-blue-500' },
                        { label: 'Fees Earned', value: '42.5 SOL', icon: Coins, color: 'text-yellow-500' },
                        { label: 'Tokens Launched', value: '12', icon: Rocket, color: 'text-purple-500' },
                        { label: 'Referral Earnings', value: '5.2 SOL', icon: Users, color: 'text-green-500' },
                      ].map((stat, i) => (
                        <Card key={i} className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <Badge variant="outline" className="text-[8px] border-white/10">LIVE</Badge>
                          </div>
                          <p className="text-[10px] uppercase text-white/40 mb-1">{stat.label}</p>
                          <p className="text-xl font-bold font-mono">{stat.value}</p>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="text-xl font-bold">Earnings History</CardTitle>
                          <CardDescription className="text-white/40">Detailed breakdown of your revenue from launches and referrals.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <div className="space-y-4">
                            {[
                              { type: 'Launch Fee', token: 'AI-SOL', amount: '2.5 SOL', time: '2h ago' },
                              { type: 'Referral', user: '0x42...f2', amount: '0.1 SOL', time: '5h ago' },
                              { type: 'Trading Fee', token: 'BAGS', amount: '0.8 SOL', time: '1d ago' },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">{item.type}</p>
                                    <p className="text-[10px] text-white/40">{item.token || item.user}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold font-mono text-green-500">+{item.amount}</p>
                                  <p className="text-[10px] text-white/40">{item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold">Transaction Logs</CardTitle>
                            <CardDescription className="text-white/40">Detailed audit trail of all actions.</CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => transactionLogger.clearLogs()}
                            className="text-[10px] text-red-500 hover:bg-red-500/10"
                          >
                            Clear
                          </Button>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {logs.length === 0 ? (
                            <div className="text-center py-12 text-white/20">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-xs">No logs found</p>
                            </div>
                          ) : (
                            logs.map((log) => (
                              <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge className={`${log.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} border-none text-[8px]`}>
                                    {log.action.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <span className="text-[10px] text-white/20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                {log.signature && (
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-mono text-white/40 truncate flex-1">{log.signature}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6"
                                      onClick={() => window.open(`https://solscan.io/tx/${log.signature}`, '_blank')}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                                <div className="text-[10px] text-white/60 bg-black/20 p-2 rounded-lg">
                                  <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                                </div>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="social">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold">Community Feed</CardTitle>
                        <CardDescription className="text-white/40">Latest activity and social signals from the Bags community.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-6">
                        {[
                          { user: 'SolDev', action: 'launched', token: 'AI-SOL', time: '2m ago' },
                          { user: 'WhaleWatcher', action: 'bought', token: 'BAGS', amount: '50 SOL', time: '5m ago' },
                          { user: 'CryptoKing', action: 'claimed', amount: '12.5 SOL', time: '12m ago' },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-bold">{item.user}</p>
                                <span className="text-[10px] text-white/20 font-mono">{item.time}</span>
                              </div>
                              <p className="text-xs text-white/60 mt-1">
                                {item.action === 'launched' && `Launched a new token: ${item.token}`}
                                {item.action === 'bought' && `Bought ${item.amount} of ${item.token}`}
                                {item.action === 'claimed' && `Claimed ${item.amount} in rewards`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter className="px-0">
                        <Button variant="ghost" className="w-full text-white/40 hover:text-white hover:bg-white/5">View All Activity</Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="dev">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold">Developer Portal</CardTitle>
                        <CardDescription className="text-white/40">Manage API keys, webhooks, and monitor usage.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold">API Key</h3>
                              <p className="text-xs text-white/40">Used for SDK and REST API authentication.</p>
                            </div>
                            <Button variant="outline" className="border-white/10 bg-white/5 text-xs h-9">Regenerate</Button>
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              readOnly 
                              value="bags_live_xxxxxxxxxxxxxxxxxxxxxxxx" 
                              className="bg-black/40 border-white/10 font-mono text-xs h-11"
                            />
                            <Button className="bg-white text-black h-11 px-4">Copy</Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">API Usage</h4>
                            <div className="space-y-4">
                              <div className="flex justify-between text-xs">
                                <span>Requests (24h)</span>
                                <span className="font-mono">1,240 / 10,000</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[12.4%]" />
                              </div>
                              <p className="text-[10px] text-white/40">Rate limit: 10 req/sec</p>
                            </div>
                          </Card>

                          <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Webhooks</h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Token Launch</span>
                                <Badge className="bg-green-500/20 text-green-500 border-none text-[10px]">ACTIVE</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Large Trade</span>
                                <Badge className="bg-white/10 text-white/40 border-none text-[10px]">DISABLED</Badge>
                              </div>
                              <Button variant="ghost" className="w-full text-[10px] h-8 hover:bg-white/5">Configure Endpoints</Button>
                            </div>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="profile">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0 flex flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/20 to-transparent border border-white/10 flex items-center justify-center">
                          <Users className="w-12 h-12 text-white/40" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold tracking-tight">
                            {publicKey ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-6)}` : 'Not Connected'}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-white/10 text-white">LEVEL 12</Badge>
                            <Badge className="bg-yellow-500/20 text-yellow-500 border-none">PRO CREATOR</Badge>
                            <Badge className="bg-blue-500/20 text-blue-500 border-none">DID VERIFIED</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pt-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="bg-white/5 border-white/10 text-white p-4 rounded-2xl text-center">
                            <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Trust Score</p>
                            <p className="text-2xl font-bold text-green-500">{trustScore}/100</p>
                            <p className="text-[8px] text-white/20 mt-1">Sybil-resistant</p>
                          </Card>
                          <Card className="bg-white/5 border-white/10 text-white p-4 rounded-2xl text-center">
                            <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">On-chain Rep</p>
                            <p className="text-2xl font-bold text-blue-500">EXCELLENT</p>
                            <p className="text-[8px] text-white/20 mt-1">Based on 142 txs</p>
                          </Card>
                          <Card className="bg-white/5 border-white/10 text-white p-4 rounded-2xl text-center">
                            <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Identity</p>
                            <p className="text-sm font-mono text-white/60">did:sol:{publicKey?.toBase58().slice(0, 4)}...</p>
                            <p className="text-[8px] text-white/20 mt-1">Soulbound Linked</p>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Your Tokens</h3>
                            <div className="space-y-2">
                              {['BAGS', 'AI-SOL', 'MEME-X'].map(t => (
                                <div key={t} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                                    <span className="text-sm font-bold">{t}</span>
                                  </div>
                                  <Button variant="ghost" className="h-8 px-3 text-[10px] hover:bg-white/10">Manage</Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Account Settings</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Public Profile</span>
                                <Badge className="bg-green-500/20 text-green-500 border-none">ENABLED</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Email Notifications</span>
                                <Badge className="bg-white/10 text-white/40 border-none">DISABLED</Badge>
                              </div>
                              <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 h-10 text-xs">Edit Profile</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="dev">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl font-bold">Developer Portal</CardTitle>
                        <CardDescription className="text-white/40">Manage API keys, webhooks, and monitor usage.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 space-y-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold">API Key</h3>
                              <p className="text-xs text-white/40">Used for SDK and REST API authentication.</p>
                            </div>
                            <Button variant="outline" className="border-white/10 bg-white/5 text-xs h-9">Regenerate</Button>
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              readOnly 
                              value="bags_live_xxxxxxxxxxxxxxxxxxxxxxxx" 
                              className="bg-black/40 border-white/10 font-mono text-xs h-11"
                            />
                            <Button className="bg-white text-black h-11 px-4">Copy</Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">API Usage</h4>
                            <div className="space-y-4">
                              <div className="flex justify-between text-xs">
                                <span>Requests (24h)</span>
                                <span className="font-mono">1,240 / 10,000</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[12.4%]" />
                              </div>
                              <p className="text-[10px] text-white/40">Rate limit: 10 req/sec</p>
                            </div>
                          </Card>

                          <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Webhooks</h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Token Launch</span>
                                <Badge className="bg-green-500/20 text-green-500 border-none text-[10px]">ACTIVE</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Large Trade</span>
                                <Badge className="bg-white/10 text-white/40 border-none text-[10px]">DISABLED</Badge>
                              </div>
                              <Button variant="ghost" className="w-full text-[10px] h-8 hover:bg-white/5">Configure Endpoints</Button>
                            </div>
                          </Card>
                        </div>

                        <div className="p-4 sm:p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-start gap-4">
                            <ExternalLink className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                            <div>
                              <h4 className="text-sm font-bold text-blue-500">SDK Documentation</h4>
                              <p className="text-xs text-white/60 mt-1">Learn how to integrate @bagsfm/bags-sdk into your automated workflows and trading bots.</p>
                              <Button variant="link" className="text-blue-500 p-0 h-auto mt-2 text-xs">Read Docs →</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white/40">
            <Badge variant="outline" className="border-white/20 text-white/40 font-mono">V2.0.1-AI</Badge>
            <span className="text-xs font-mono uppercase tracking-widest">Bags AI Studio</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Status</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
