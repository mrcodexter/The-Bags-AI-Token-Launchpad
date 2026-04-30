import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
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
import { useNetwork } from './context/NetworkContext';

const WalletModal = lazy(() => import('./components/WalletModal').then(m => ({ default: m.WalletModal })));
const FundWalletModal = lazy(() => import('./components/FundWalletModal').then(m => ({ default: m.FundWalletModal })));
import { 
  Rocket, Wallet, Coins, Settings, ExternalLink, RefreshCw, 
  Image as ImageIcon, TrendingUp, Brain, BarChart3, Users, 
  ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Search,
  MessageSquare, Trophy, Activity, LogOut, Download, Menu, X, Loader2,
  Sparkles, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Brush, Legend } from 'recharts';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505]/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-mono border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: item.color || item.stroke }} />
                <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">{item.name}:</span>
              </div>
              <span className="text-xs font-bold font-mono text-white">
                {String(item.name).toLowerCase().includes('price') ? `$${item.value.toFixed(6)}` : 
                 String(item.name).toLowerCase().includes('market') ? `$${(item.value / 1000000).toFixed(2)}M` : 
                 item.value >= 1000000 ? `$${(item.value / 1000000).toFixed(2)}M` :
                 item.value >= 1000 ? `$${(item.value / 1000).toFixed(1)}K` :
                 `$${item.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const { network, setNetwork } = useNetwork();
  const { publicKey, sendTransaction, signTransaction, disconnect, select, wallets: availableWallets, wallet, connecting } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
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
  const [customStrategies, setCustomStrategies] = useState<any[]>([]);
  const [whaleActivity, setWhaleActivity] = useState<any[]>([]);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    actionLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [tradeConfirmation, setTradeConfirmation] = useState<{
    isOpen: boolean;
    type: 'buy' | 'sell' | 'transfer' | null;
    mint: string;
    amount: number;
    recipient?: string;
    priceImpact?: number;
  }>({
    isOpen: false,
    type: null,
    mint: '',
    amount: 0
  });

  // Analytics & Alerts State
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState('');
  const [priceAlerts, setPriceAlerts] = useState<{
    id: string;
    mint: string;
    threshold: number;
    type: 'above' | 'below';
    active: boolean;
  }[]>([]);
  const [newAlertThreshold, setNewAlertThreshold] = useState<number>(0);
  const [newAlertMint, setNewAlertMint] = useState('');

  // Transfer State
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferMint, setTransferMint] = useState('');

  // AI Agent Config State
  const defaultAgentConfig = {
    name: 'Alpha Bot',
    strategy: 'momentum',
    riskTolerance: 'medium',
    budget: 0.5,
    maxDrawdown: 10,
    targetProfit: 20,
    customStrategy: ''
  };

  const [agentConfig, setAgentConfig] = useState(defaultAgentConfig);
  const [customStrategyDescription, setCustomStrategyDescription] = useState('');

  // Validation State
  const [bondingCurveErrors, setBondingCurveErrors] = useState({
    initialPrice: '',
    scalingFactor: '',
    reserveRatio: ''
  });

  // Filter State for History
  const [logFilters, setLogFilters] = useState({
    action: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });

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
    twitter: '',
    telegram: '',
    website: '',
  });
  const [amount, setAmount] = useState<number>(1);
  const [tokenDecimals, setTokenDecimals] = useState<number>(9);
  const [tokenTotalSupply, setTokenTotalSupply] = useState<number>(1000000000);
  const [bondingCurve, setBondingCurve] = useState({
    type: 'linear',
    initialPrice: 0.0001,
    scalingFactor: 1.5,
    reserveRatio: 50
  });

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(mockChartData);
  const [marketStats, setMarketStats] = useState({
    price: 0.0025,
    volume: 850000,
    marketCap: 4200000,
    holders: 12420
  });

  const [selectedAnalyticsToken, setSelectedAnalyticsToken] = useState<string>('');
  const [allTokens, setAllTokens] = useState<any[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokens = await bagsApi.getTokens();
        if (Array.isArray(tokens)) {
          setAllTokens(tokens);
        } else {
          console.error('Bags API Error: Invalid tokens format', tokens);
        }
      } catch (e: any) {
        console.error('Bags API Error: Failed to fetch tokens', e.response?.data || e.message);
      }
    };
    fetchTokens();
  }, [lastMint]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchAnalytics = async () => {
        try {
          const data = await bagsApi.getAnalytics(selectedAnalyticsToken || lastMint || 'default', analyticsDateRange);
          if (data && data.length > 0) {
            setAnalyticsData(data);
            const last = data[data.length - 1];
            setMarketStats({
              price: last.price,
              volume: last.volume || 850000,
              marketCap: last.marketCap || 4200000,
              holders: last.holders || 12420
            });

            // Check Price Alerts
            const currentPrice = last.price;
            priceAlerts.forEach(alert => {
              if (alert.active && (selectedAnalyticsToken === alert.mint || alert.mint === 'all' || alert.mint === lastMint)) {
                if (alert.type === 'above' && currentPrice >= alert.threshold) {
                  toast.info(`Price Alert: ${alert.mint} is above ${alert.threshold}`, {
                    description: `Current price: ${currentPrice.toFixed(6)}`,
                    duration: 10000,
                  });
                  setPriceAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: false } : a));
                } else if (alert.type === 'below' && currentPrice <= alert.threshold) {
                  toast.info(`Price Alert: ${alert.mint} is below ${alert.threshold}`, {
                    description: `Current price: ${currentPrice.toFixed(6)}`,
                    duration: 10000,
                  });
                  setPriceAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: false } : a));
                }
              }
            });
          }
          
          const whaleData = await bagsApi.getWhaleActivity();
          setWhaleActivity(whaleData);
        } catch (error: any) {
          console.error('Bags API Error: Error fetching analytics:', error.response?.data || error.message);
        }
      };

      fetchAnalytics();
      const interval = setInterval(fetchAnalytics, 30000); // Fetch every 30s
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedAnalyticsToken, lastMint, priceAlerts, analyticsDateRange]);

  const handleAddAlert = () => {
    if (!newAlertThreshold || (!newAlertMint && !selectedAnalyticsToken)) {
      toast.error('Please specify a threshold and token');
      return;
    }
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      mint: newAlertMint || selectedAnalyticsToken || lastMint || 'all',
      threshold: newAlertThreshold,
      type: (newAlertThreshold > marketStats.price) ? 'above' : 'below' as 'above' | 'below',
      active: true
    };
    setPriceAlerts([...priceAlerts, alert]);
    toast.success(`Price alert set for ${alert.mint} at ${alert.threshold}`);
    setNewAlertThreshold(0);
    setNewAlertMint('');
  };

  const handleRemoveAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Price alert removed');
  };

  const toggleAlertActive = (id: string) => {
    setPriceAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    toast.success('Alert status updated');
  };

  useEffect(() => {
    const saved = localStorage.getItem('bags-saved-wallets');
    if (saved) setSavedWallets(JSON.parse(saved));

    const savedAgent = localStorage.getItem('bags-agent-config');
    if (savedAgent) setAgentConfig(JSON.parse(savedAgent));
    
    setLogs(transactionLogger.getLogs());
    const handleLogsUpdate = () => setLogs(transactionLogger.getLogs());
    window.addEventListener('bags_logs_updated', handleLogsUpdate);
    return () => window.removeEventListener('bags_logs_updated', handleLogsUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem('bags-agent-config', JSON.stringify(agentConfig));
  }, [agentConfig]);

  const resetAgentConfig = () => {
    setAgentConfig(defaultAgentConfig);
    toast.success('Agent configuration reset to defaults');
  };

  const validateBondingCurve = () => {
    const errors = {
      initialPrice: bondingCurve.initialPrice <= 0 ? 'Initial price must be positive' : '',
      scalingFactor: bondingCurve.scalingFactor <= 0 ? 'Scaling factor must be positive' : '',
      reserveRatio: (bondingCurve.reserveRatio < 0 || bondingCurve.reserveRatio > 100) ? 'Reserve ratio must be between 0 and 100' : ''
    };
    setBondingCurveErrors(errors);
    return !Object.values(errors).some(e => e !== '');
  };

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
    setIsWalletModalOpen(true);
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
        metadata: {
          ...metadata,
          decimals: tokenDecimals,
          supply: tokenTotalSupply
        },
        amount,
        feeRecipient: publicKey.toBase58(),
        creator: publicKey.toBase58(),
        bondingCurve
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

  const handleTrade = (type: 'buy' | 'sell') => {
    if (!publicKey || !tradeMint || tradeAmount <= 0) {
      toast.error('Invalid trade parameters');
      return;
    }
    
    // Simulate price impact (mock logic for UI)
    const estimatedImpact = Math.random() * 2 + 0.5; // 0.5% to 2.5%
    
    setTradeConfirmation({
      isOpen: true,
      type,
      mint: tradeMint,
      amount: tradeAmount,
      priceImpact: estimatedImpact
    });
  };

  const handleTransfer = () => {
    if (!publicKey || !transferMint || !transferRecipient || transferAmount <= 0) {
      toast.error('Invalid transfer parameters');
      return;
    }

    setTradeConfirmation({
      isOpen: true,
      type: 'transfer',
      mint: transferMint,
      amount: transferAmount,
      recipient: transferRecipient
    });
  };

  const executeTrade = async () => {
    const { type, mint, amount, recipient } = tradeConfirmation;
    if (!publicKey || !type || !mint || amount <= 0) return;

    setTradeConfirmation(prev => ({ ...prev, isOpen: false }));
    setLoading(true);
    try {
      let response;
      if (type === 'buy') {
        response = await bagsApi.buyToken(mint, amount, publicKey.toBase58());
      } else if (type === 'sell') {
        response = await bagsApi.sellToken(mint, amount, publicKey.toBase58());
      } else if (type === 'transfer') {
        if (!recipient) throw new Error('Recipient address is required for transfer');
        response = await bagsApi.transferToken(mint, recipient, amount, publicKey.toBase58());
      }
      
      toast.success(`${type.toUpperCase()} successful!`);
      
      transactionLogger.log({
        action: type === 'buy' ? 'trade_buy' : type === 'sell' ? 'trade_sell' : 'token_transfer',
        status: 'success',
        signature: response?.signature,
        wallet: publicKey.toBase58(),
        metadata: { mint, amount, recipient }
      });
      fetchBalance();
    } catch (error: any) {
      transactionLogger.log({
        action: type === 'buy' ? 'trade_buy' : type === 'sell' ? 'trade_sell' : 'token_transfer',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { mint, amount, recipient, error: error.message }
      });
      toast.error(`Failed to ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeUpdateAuthority = async (type: 'mint' | 'freeze') => {
    if (!publicKey || !manageMint || !newAuthority) return;
    setLoading(true);
    try {
      const response = await bagsApi.updateAuthority(manageMint, newAuthority, type, publicKey.toBase58());
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} authority updated!`);
      
      transactionLogger.log({
        action: 'authority_update',
        status: 'success',
        signature: response.signature,
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

  const handleUpdateAuthority = (type: 'mint' | 'freeze') => {
    if (!publicKey || !manageMint || !newAuthority) {
      toast.error('Please fill in all fields');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Update Authority',
      description: `Are you sure you want to transfer ${type} authority for ${manageMint} to ${newAuthority}? This action is permanent.`,
      actionLabel: 'Transfer Authority',
      onConfirm: () => executeUpdateAuthority(type)
    });
  };

  const executeBurnTokens = async () => {
    if (!publicKey || !manageMint || burnAmount <= 0) return;
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
        metadata: { mint: manageMint, amount: burnAmount, error: error.message }
      });
      toast.error(`Failed to burn tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = () => {
    if (!publicKey || !manageMint || burnAmount <= 0) {
      toast.error('Invalid burn parameters');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Burn Tokens',
      description: `Are you sure you want to permanently burn ${burnAmount} tokens of ${manageMint}? This will reduce total supply and cannot be undone.`,
      actionLabel: 'Burn Permanently',
      onConfirm: executeBurnTokens
    });
  };

  const executeAirdropTokens = async (recipients: { address: string, amount: number }[]) => {
    if (!publicKey || !manageMint) return;
    setLoading(true);
    try {
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

  const handleAirdropTokens = () => {
    if (!publicKey || !manageMint || !airdropRecipients) {
      toast.error('Invalid airdrop parameters');
      return;
    }

    try {
      const recipients = airdropRecipients.split('\n').filter(l => l.trim()).map(line => {
        const [address, amount] = line.split(',');
        if (!address || isNaN(parseFloat(amount))) throw new Error('Invalid format');
        return { address: address.trim(), amount: parseFloat(amount) };
      });

      setConfirmDialog({
        isOpen: true,
        title: 'Execute Airdrop',
        description: `Are you sure you want to airdrop tokens to ${recipients.length} recipients? This will transfer tokens from your wallet and incur network fees.`,
        actionLabel: 'Confirm Airdrop',
        onConfirm: () => executeAirdropTokens(recipients)
      });
    } catch (e) {
      toast.error('Invalid airdrop format. Use: address,amount');
    }
  };

  const handleDeployAgent = () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    setLoading(true);
    try {
      // Simulate potential network/fund issues
      if (solBalance < agentConfig.budget) {
        throw new Error('Insufficient SOL balance for agent budget');
      }

      setTimeout(() => {
        const newAgent = {
          id: Math.random().toString(36).substr(2, 9),
          title: agentConfig.name,
          strategy: agentConfig.strategy.charAt(0).toUpperCase() + agentConfig.strategy.slice(1),
          budget: `${agentConfig.budget} SOL`,
          status: 'Active',
          icon: agentConfig.strategy === 'momentum' ? TrendingUp : 
                agentConfig.strategy === 'arbitrage' ? Zap : 
                agentConfig.strategy === 'sentiment' ? MessageSquare : Brain,
          timestamp: Date.now()
        };
        setActiveAgents([newAgent, ...activeAgents]);
        setLoading(false);
        toast.success(`${agentConfig.name} deployed successfully!`);
        
        transactionLogger.log({
          action: 'deploy_agent',
          status: 'success',
          wallet: publicKey.toBase58(),
          metadata: { agent: agentConfig }
        });
      }, 2000);
    } catch (error: any) {
      setLoading(false);
      toast.error(`Agent deployment failed: ${error.message}`);
      transactionLogger.log({
        action: 'deploy_agent',
        status: 'failed',
        wallet: publicKey.toBase58(),
        metadata: { agent: agentConfig, error: error.message }
      });
    }
  };

  const generatePlaceholderImage = () => {
    const keywords = [metadata.name, metadata.symbol, 'crypto', 'abstract', 'tech'].filter(Boolean);
    const seed = keywords.join('-') || 'token';
    const url = `https://picsum.photos/seed/${seed}/400/400`;
    setMetadata({ ...metadata, image: url });
    toast.success('AI Placeholder image generated');
  };

  const generateStrategyParameters = async () => {
    if (!agentConfig.customStrategy) {
      toast.error('Describe your strategy first');
      return;
    }
    setStrategyLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Analyze this trading strategy: "${agentConfig.customStrategy}". 
      Return a JSON object with strictly these keys: budget (number, SOL), maxDrawdown (number, %), targetProfit (number, %), strategy (string, one of: momentum, arbitrage, sentiment, scalping). 
      Format: {"budget": 0.5, "maxDrawdown": 15, "targetProfit": 30, "strategy": "momentum"}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || '';
      const match = text.match(/\{.*\}/s);
      if (match) {
        const params = JSON.parse(match[0]);
        setAgentConfig({
          ...agentConfig,
          budget: params.budget || agentConfig.budget,
          maxDrawdown: params.maxDrawdown || agentConfig.maxDrawdown,
          targetProfit: params.targetProfit || agentConfig.targetProfit,
          strategy: params.strategy || agentConfig.strategy
        });
        toast.success('AI has generated optimized parameters for your strategy!');
      }
    } catch (e) {
      console.error('AI Strategy Error:', e);
      toast.error('Failed to generate AI parameters. Using defaults.');
    } finally {
      setStrategyLoading(false);
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleClaimFees} 
                disabled={!publicKey || loading || !fees?.amount}
                className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold h-10 sm:h-12 transition-all active:scale-95 text-xs sm:text-sm"
              >
                {loading ? <RefreshCw className="animate-spin mr-2 w-3 h-3 sm:w-4 sm:h-4" /> : null}
                Claim Rewards
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-white/10 text-white text-[10px] p-3 max-w-[200px]">
              <p>Rewards are accumulated from protocol fees (0.5% per trade). Claiming transfers SOL directly to your wallet.</p>
            </TooltipContent>
          </Tooltip>
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
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setIsFundingModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-10 sm:h-12 transition-all active:scale-95 text-xs sm:text-sm"
              >
                <Coins className="mr-2 w-4 h-4" />
                Fund Wallet
              </Button>
              <Button 
                onClick={handleSwitchWallet}
                variant="outline" 
                className="w-full text-[9px] sm:text-[10px] h-9 sm:h-10 border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold uppercase tracking-widest"
              >
                Open Wallet Modal
              </Button>
            </div>
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
    <TooltipProvider>
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
            <div className="hidden xs:flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setNetwork(WalletAdapterNetwork.Mainnet)}
                className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${network === WalletAdapterNetwork.Mainnet ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-white/40 hover:text-white'}`}
              >
                Mainnet
              </button>
              <button 
                onClick={() => setNetwork(WalletAdapterNetwork.Devnet)}
                className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${network === WalletAdapterNetwork.Devnet ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'text-white/40 hover:text-white'}`}
              >
                Devnet
              </button>
            </div>
            <Button 
              onClick={() => setIsWalletModalOpen(true)}
              disabled={connecting}
              className="bg-white text-black rounded-full font-bold hover:opacity-90 transition-all h-9 sm:h-11 text-xs sm:text-sm px-4 sm:px-6 min-w-[120px]"
            >
              {connecting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </span>
              ) : publicKey ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              ) : (
                'Connect Wallet'
              )}
            </Button>
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

      <Suspense fallback={null}>
        <WalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
        />
      </Suspense>
      
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
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8 flex flex-nowrap overflow-x-auto no-scrollbar w-full justify-start lg:justify-center scroll-smooth">
                {[
                  { id: 'launch', label: 'Launch', icon: Rocket },
                  { id: 'trade', label: 'Trade', icon: TrendingUp },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'agents', label: 'AI Agents', icon: Brain },
                  { id: 'history', label: 'History', icon: Activity },
                  { id: 'manage', label: 'Manage', icon: Settings },
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

                    <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-8 rounded-3xl backdrop-blur-sm relative overflow-visible">
                      {txStatus === 'pending' && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center space-y-4 p-6 text-center">
                          <RefreshCw className="w-12 h-12 text-white animate-spin" />
                          <div>
                            <h3 className="text-xl font-bold text-white">Launching Token...</h3>
                            <p className="text-sm text-white/40">Please confirm the transaction in your wallet</p>
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
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Token Name</Label>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={runAiAnalysis}
                                disabled={aiLoading || !metadata.name}
                                className="h-6 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5"
                              >
                                {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                                AI Analysis
                              </Button>
                            </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Website</Label>
                            <Input 
                              placeholder="https://..." 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 text-xs sm:text-sm"
                              value={metadata.website}
                              onChange={(e) => setMetadata({ ...metadata, website: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Twitter</Label>
                            <Input 
                              placeholder="@handle" 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 text-xs sm:text-sm"
                              value={metadata.twitter}
                              onChange={(e) => setMetadata({ ...metadata, twitter: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Telegram</Label>
                            <Input 
                              placeholder="t.me/..." 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 text-xs sm:text-sm"
                              value={metadata.telegram}
                              onChange={(e) => setMetadata({ ...metadata, telegram: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Decimals</Label>
                            <Input 
                              type="number"
                              placeholder="9" 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 font-mono text-xs sm:text-sm"
                              value={tokenDecimals}
                              onChange={(e) => setTokenDecimals(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Total Supply</Label>
                            <Input 
                              type="number"
                              placeholder="1,000,000,000" 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 font-mono text-xs sm:text-sm"
                              value={tokenTotalSupply}
                              onChange={(e) => setTokenTotalSupply(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Initial Buy (SOL)</Label>
                            <Input 
                              type="number"
                              placeholder="1" 
                              className="bg-white/5 border-white/10 h-10 sm:h-12 rounded-xl focus:ring-white/20 font-mono text-xs sm:text-sm"
                              value={amount}
                              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Image URL</Label>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={generatePlaceholderImage}
                              className="h-6 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1.5"
                            >
                              <Sparkles className="w-3 h-3" />
                              AI Placeholder
                            </Button>
                          </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Bonding Curve Configuration</Label>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] text-white/40">Curve Type</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-3 h-3 text-white/20 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                      <p><span className="text-white font-bold">Linear:</span> Price increases at a constant rate as supply grows.</p>
                                      <p className="mt-1"><span className="text-white font-bold">Exponential:</span> Price increases more rapidly as supply grows, rewarding early adopters more significantly.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {['linear', 'exponential'].map(t => (
                                    <Button 
                                      key={t}
                                      variant="outline"
                                      onClick={() => setBondingCurve({...bondingCurve, type: t as any})}
                                      className={`text-[10px] h-9 border-white/10 ${bondingCurve.type === t ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}
                                    >
                                      {t.toUpperCase()}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-[10px] text-white/40">Initial Price (SOL)</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="w-3 h-3 text-white/20 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                        <p>The starting price of the token in SOL. A higher initial price increases the cost for the first buyers.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Input 
                                    type="number"
                                    value={bondingCurve.initialPrice}
                                    onChange={(e) => setBondingCurve({...bondingCurve, initialPrice: parseFloat(e.target.value)})}
                                    className={`bg-white/5 border-white/10 h-9 rounded-lg text-xs font-mono ${bondingCurveErrors.initialPrice ? 'border-red-500/50' : ''}`}
                                  />
                                  {bondingCurveErrors.initialPrice && <p className="text-[8px] text-red-500 mt-1">{bondingCurveErrors.initialPrice}</p>}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-[10px] text-white/40">Scaling Factor</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="w-3 h-3 text-white/20 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                        <p>Determines how steeply the price increases as more tokens are minted. Higher values mean faster price growth.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Input 
                                    type="number"
                                    value={bondingCurve.scalingFactor}
                                    onChange={(e) => setBondingCurve({...bondingCurve, scalingFactor: parseFloat(e.target.value)})}
                                    className={`bg-white/5 border-white/10 h-9 rounded-lg text-xs font-mono ${bondingCurveErrors.scalingFactor ? 'border-red-500/50' : ''}`}
                                  />
                                  {bondingCurveErrors.scalingFactor && <p className="text-[8px] text-red-500 mt-1">{bondingCurveErrors.scalingFactor}</p>}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] text-white/40">Reserve Ratio (%)</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-3 h-3 text-white/20 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                      <p>The percentage of the total supply held in reserve to provide liquidity. Affects price stability and slippage.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input 
                                  type="number"
                                  value={bondingCurve.reserveRatio}
                                  onChange={(e) => setBondingCurve({...bondingCurve, reserveRatio: parseFloat(e.target.value)})}
                                  className={`bg-white/5 border-white/10 h-9 rounded-lg text-xs font-mono ${bondingCurveErrors.reserveRatio ? 'border-red-500/50' : ''}`}
                                />
                                {bondingCurveErrors.reserveRatio && <p className="text-[8px] text-red-500 mt-1">{bondingCurveErrors.reserveRatio}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
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
                      <CardFooter className="px-0 pb-0 gap-6 flex-col items-stretch mt-4 sm:mt-6 overflow-visible">
                        <div className="space-y-3">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Live Preview</Label>
                          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 sm:gap-6 group hover:border-white/20 transition-all">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 overflow-hidden shrink-0 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                              {metadata.image ? (
                                <img src={metadata.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/10" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg sm:text-2xl font-bold truncate">{metadata.name || 'Token Name'}</h4>
                                {metadata.symbol && <Badge className="bg-purple-500/20 text-purple-500 border-none text-[10px] px-2">{metadata.symbol}</Badge>}
                              </div>
                              <p className="text-sm sm:text-base font-serif italic text-white/40 mt-1 line-clamp-2">{metadata.description || 'Token story will appear here...'}</p>
                            </div>
                          </div>
                        </div>

                        {!showPreview ? (
                          <Button 
                            onClick={() => {
                              if (!publicKey) {
                                setIsWalletModalOpen(true);
                                return;
                              }
                              if (validateBondingCurve()) {
                                handleSimulate();
                              } else {
                                toast.error('Please fix bonding curve errors');
                              }
                            }}
                            disabled={txStatus === 'simulating'}
                            className={`w-full h-14 sm:h-16 rounded-2xl text-base sm:text-lg font-bold border transition-all ${!publicKey ? 'bg-blue-600 hover:bg-blue-700 text-white border-none' : 'bg-white/5 text-white hover:bg-white/10 border-white/10'}`}
                          >
                            {txStatus === 'simulating' ? <RefreshCw className="animate-spin mr-3 w-5 h-5 sm:w-6 sm:h-6" /> : !publicKey ? <Wallet className="mr-3 w-5 h-5 sm:w-6 sm:h-6" /> : <ShieldCheck className="mr-3 w-5 h-5 sm:w-6 sm:h-6" />}
                            {txStatus === 'simulating' ? 'Simulating...' : !publicKey ? 'Connect Wallet to Launch' : 'Simulate Launch'}
                          </Button>
                        ) : (
                          <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
                            <Button 
                              onClick={() => setShowPreview(false)}
                              className="w-full sm:flex-1 h-12 sm:h-16 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-bold border border-white/10 text-sm sm:text-base"
                            >
                              Edit Config
                            </Button>
                            <Button 
                              onClick={handleCreateToken}
                              disabled={loading || !publicKey}
                              className="w-full sm:flex-[2] h-14 sm:h-16 bg-white text-black hover:bg-white/90 rounded-2xl text-base sm:text-lg font-bold shadow-2xl shadow-white/10 transition-all active:scale-[0.98]"
                            >
                              {loading ? <RefreshCw className="animate-spin mr-3 w-5 h-5 sm:w-6 sm:h-6" /> : <Rocket className="mr-3 w-5 h-5 sm:w-6 sm:h-6" />}
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

                        <Separator className="bg-white/10" />

                        <div className="space-y-4">
                          <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                            Transfer Tokens
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase text-white/40">Recipient Address</Label>
                              <Input 
                                placeholder="Wallet Address" 
                                className="bg-white/5 border-white/10 h-10 rounded-xl text-sm"
                                value={transferRecipient}
                                onChange={(e) => setTransferRecipient(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase text-white/40">Token Mint</Label>
                              <Input 
                                placeholder="Mint Address" 
                                className="bg-white/5 border-white/10 h-10 rounded-xl text-sm"
                                value={transferMint}
                                onChange={(e) => setTransferMint(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase text-white/40">Amount</Label>
                              <Input 
                                type="number"
                                placeholder="0.00" 
                                className="bg-white/5 border-white/10 h-10 rounded-xl text-sm"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={handleTransfer}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 sm:h-12 rounded-xl text-xs sm:text-sm"
                          >
                            Transfer Tokens
                          </Button>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white/5 border-white/10 text-white p-5 rounded-3xl backdrop-blur-sm">
                          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-bold">Agent Config</CardTitle>
                              <CardDescription className="text-white/40 text-xs">Configure your autonomous trading partner.</CardDescription>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={resetAgentConfig}
                              className="h-7 text-[10px] text-white/40 hover:text-white"
                            >
                              Reset
                            </Button>
                          </CardHeader>
                          <CardContent className="px-0 space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase text-white/40">Agent Name</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Search className="w-3 h-3 text-white/20 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black border-white/10 text-[10px]">
                                    <p>A unique identifier for your AI agent.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input 
                                value={agentConfig.name}
                                onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
                                className="bg-white/5 border-white/10 rounded-xl h-10 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase text-white/40">Strategy</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <TrendingUp className="w-3 h-3 text-white/20 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                    <p>The core logic the agent uses to execute trades. Momentum follows trends, Arbitrage exploits price gaps.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <select 
                                value={agentConfig.strategy}
                                onChange={(e) => setAgentConfig({...agentConfig, strategy: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 text-sm px-3 outline-none focus:ring-1 focus:ring-white/20"
                              >
                                <option value="momentum" className="bg-[#050505]">Momentum Trading</option>
                                <option value="arbitrage" className="bg-[#050505]">Cross-DEX Arbitrage</option>
                                <option value="mean_reversion" className="bg-[#050505]">Mean Reversion</option>
                                <option value="sentiment" className="bg-[#050505]">Social Sentiment</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase text-white/40">Risk Tolerance</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <ShieldCheck className="w-3 h-3 text-white/20 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black border-white/10 text-[10px] max-w-[200px]">
                                    <p>Determines how aggressive the agent is with position sizing and stop-loss levels.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map(r => (
                                  <Button 
                                    key={r}
                                    variant="outline"
                                    onClick={() => setAgentConfig({...agentConfig, riskTolerance: r})}
                                    className={`text-[10px] h-9 border-white/10 ${agentConfig.riskTolerance === r ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}
                                  >
                                    {r.toUpperCase()}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase text-white/40">Budget (SOL)</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Coins className="w-3 h-3 text-white/20 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black border-white/10 text-[10px]">
                                    <p>The maximum amount of SOL the agent is allowed to trade with.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input 
                                type="number"
                                value={agentConfig.budget}
                                onChange={(e) => setAgentConfig({...agentConfig, budget: parseFloat(e.target.value)})}
                                className="bg-white/5 border-white/10 rounded-xl h-10 text-sm font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] uppercase text-white/40">Max Drawdown (%)</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ArrowDownRight className="w-3 h-3 text-white/20 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black border-white/10 text-[10px]">
                                      <p>The maximum loss the agent will tolerate before stopping.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input 
                                  type="number"
                                  value={agentConfig.maxDrawdown}
                                  onChange={(e) => setAgentConfig({...agentConfig, maxDrawdown: Math.max(0, parseFloat(e.target.value))})}
                                  className="bg-white/5 border-white/10 rounded-xl h-10 text-sm font-mono"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] uppercase text-white/40">Target Profit (%)</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ArrowUpRight className="w-3 h-3 text-white/20 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black border-white/10 text-[10px]">
                                      <p>The profit goal at which the agent will secure gains.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input 
                                  type="number"
                                  value={agentConfig.targetProfit}
                                  onChange={(e) => setAgentConfig({...agentConfig, targetProfit: Math.max(0, parseFloat(e.target.value))})}
                                  className="bg-white/5 border-white/10 rounded-xl h-10 text-sm font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase text-white/40">Custom Strategy Description</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={generateStrategyParameters}
                                  disabled={strategyLoading || !agentConfig.customStrategy}
                                  className="h-5 text-[9px] text-purple-400 hover:text-purple-300 gap-1 px-1"
                                >
                                  {strategyLoading ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                  AI Optimization
                                </Button>
                              </div>
                              <textarea 
                                value={agentConfig.customStrategy}
                                onChange={(e) => setAgentConfig({...agentConfig, customStrategy: e.target.value})}
                                placeholder="e.g., Only buy tokens with >$100k liquidity and positive social sentiment trend..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 text-sm outline-none focus:ring-1 focus:ring-white/20 resize-none"
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  if (!agentConfig.customStrategy) return;
                                  const newStrat = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: agentConfig.name || 'Untitled Strategy',
                                    description: agentConfig.customStrategy,
                                    active: true
                                  };
                                  setCustomStrategies([...customStrategies, newStrat]);
                                  toast.success('Strategy saved for future agents');
                                }}
                                disabled={!agentConfig.customStrategy}
                                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-11 rounded-xl text-xs font-bold text-white/60"
                              >
                                Save Strategy
                              </Button>
                              <Button 
                                onClick={handleDeployAgent}
                                disabled={loading || !agentConfig.name}
                                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 rounded-xl text-sm"
                              >
                                {loading ? <RefreshCw className="animate-spin mr-2 w-4 h-4" /> : null}
                                Deploy {agentConfig.name || 'Agent'}
                              </Button>
                            </div>

                            {customStrategies.length > 0 && (
                              <div className="space-y-3 pt-4 border-t border-white/10 mt-4">
                                <Label className="text-[10px] uppercase text-white/40 font-bold">Saved Strategy Brains</Label>
                                <div className="space-y-2">
                                  {customStrategies.map(strat => (
                                    <div key={strat.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                      <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="text-[10px] font-bold text-purple-400 truncate">{strat.name}</span>
                                        <span className="text-[9px] text-white/20 truncate">{strat.description}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => setAgentConfig({...agentConfig, customStrategy: strat.description, name: strat.name})}
                                          className="h-7 px-2 text-[10px] text-white/40 hover:text-white"
                                        >
                                          Load
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => setCustomStrategies(prev => prev.filter(s => s.id !== strat.id))}
                                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-3xl backdrop-blur-sm">
                          <CardHeader className="px-0 pt-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                              <CardTitle className="text-lg sm:text-2xl font-bold tracking-tight">Active Agents</CardTitle>
                            </div>
                            <CardDescription className="text-white/40 text-xs sm:text-sm">Monitor your deployed autonomous agents.</CardDescription>
                          </CardHeader>
                          <CardContent className="px-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {activeAgents.length > 0 ? activeAgents.map((agent, i) => (
                                <div key={agent.id || i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                                      <agent.icon className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">
                                      {agent.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <h3 className="text-sm font-bold mb-1">{agent.title}</h3>
                                  <div className="flex items-center justify-between text-[10px] text-white/40">
                                    <span>{agent.strategy}</span>
                                    <span className="font-mono">{agent.budget}</span>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                    <Button variant="ghost" className="flex-1 h-8 text-[10px] hover:bg-white/5">Logs</Button>
                                    <Button 
                                      variant="ghost" 
                                      onClick={() => setActiveAgents(activeAgents.filter(a => a.id !== agent.id))}
                                      className="flex-1 h-8 text-[10px] text-red-500 hover:bg-red-500/10"
                                    >
                                      Stop
                                    </Button>
                                  </div>
                                </div>
                              )) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-3xl">
                                  <Brain className="w-12 h-12 mb-4 opacity-20" />
                                  <p className="text-sm font-medium">No active agents deployed</p>
                                  <p className="text-[10px] mt-1">Configure and deploy an agent to start trading</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="history">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-white/5 border-white/10 text-white p-5 sm:p-8 rounded-3xl backdrop-blur-sm">
                      <CardHeader className="px-0 pt-0 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Transaction History</CardTitle>
                            <CardDescription className="text-white/40 text-xs sm:text-sm">Comprehensive audit trail of your on-chain activity.</CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => transactionLogger.clearLogs()}
                            className="text-[10px] text-red-500 hover:bg-red-500/10 h-8 px-3"
                          >
                            Clear History
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                          <div className="space-y-1.5">
                            <Label className="text-[8px] uppercase text-white/40 ml-1">Search</Label>
                            <div className="relative">
                              <Input 
                                placeholder="Signature or metadata..." 
                                value={logFilters.search}
                                onChange={(e) => setLogFilters({...logFilters, search: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-lg h-8 text-[10px] pl-7 outline-none"
                              />
                              <Search className="w-3 h-3 text-white/20 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[8px] uppercase text-white/40 ml-1">Action Type</Label>
                            <select 
                              value={logFilters.action}
                              onChange={(e) => setLogFilters({...logFilters, action: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-lg h-8 text-[10px] px-2 outline-none"
                            >
                              <option value="all">All Actions</option>
                              <option value="token_creation">Token Creation</option>
                              <option value="trade_buy">Buy</option>
                              <option value="trade_sell">Sell</option>
                              <option value="deploy_agent">Agent Deploy</option>
                              <option value="airdrop">Airdrop</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[8px] uppercase text-white/40 ml-1">Status</Label>
                            <select 
                              value={logFilters.status}
                              onChange={(e) => setLogFilters({...logFilters, status: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-lg h-8 text-[10px] px-2 outline-none"
                            >
                              <option value="all">All Status</option>
                              <option value="success">Success</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[8px] uppercase text-white/40 ml-1">Time Range</Label>
                            <select 
                              value={logFilters.dateRange}
                              onChange={(e) => setLogFilters({...logFilters, dateRange: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-lg h-8 text-[10px] px-2 outline-none"
                            >
                              <option value="all">All Time</option>
                              <option value="1h">Last Hour</option>
                              <option value="24h">Last 24 Hours</option>
                              <option value="7d">Last 7 Days</option>
                            </select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pt-4">
                        {logs.length === 0 ? (
                          <div className="text-center py-20 text-white/20 border border-dashed border-white/10 rounded-2xl">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-medium">No transactions recorded yet</p>
                            <p className="text-[10px] mt-1">Your activity will appear here in real-time.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {logs
                              .filter(log => {
                                if (logFilters.action !== 'all' && log.action !== logFilters.action) return false;
                                if (logFilters.status !== 'all' && log.status !== logFilters.status) return false;
                                if (logFilters.dateRange !== 'all') {
                                  const now = Date.now();
                                  const diff = now - log.timestamp;
                                  if (logFilters.dateRange === '1h' && diff > 3600000) return false;
                                  if (logFilters.dateRange === '24h' && diff > 86400000) return false;
                                  if (logFilters.dateRange === '7d' && diff > 604800000) return false;
                                }
                                if (logFilters.search) {
                                  const s = logFilters.search.toLowerCase();
                                  const signatureMatch = log.signature?.toLowerCase().includes(s);
                                  const metadataMatch = JSON.stringify(log.metadata).toLowerCase().includes(s);
                                  if (!signatureMatch && !metadataMatch) return false;
                                }
                                return true;
                              })
                              .map((log) => (
                              <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {log.action.includes('trade') ? <TrendingUp className="w-5 h-5" /> : 
                                       log.action.includes('token') ? <Rocket className="w-5 h-5" /> : 
                                       <Activity className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold capitalize">{log.action.replace('_', ' ')}</p>
                                        <Badge className={`${log.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} border-none text-[7px] px-1.5 py-0`}>
                                          {log.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <p className="text-[10px] text-white/40">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 sm:justify-end">
                                    {log.signature && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => window.open(`https://solscan.io/tx/${log.signature}`, '_blank')}
                                        className="h-8 border-white/10 bg-white/5 text-[10px] hover:bg-white hover:text-black"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1.5" />
                                        Explorer
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-white/20 hover:text-white"
                                      onClick={() => toast.info('Log Details', { description: JSON.stringify(log.metadata) })}
                                    >
                                      <Search className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/5 overflow-hidden">
                                  <pre className="text-[9px] font-mono text-white/40 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <Input 
                          placeholder="Search tokens by name, symbol, or address..." 
                          className="bg-white/5 border-white/10 pl-10 h-12 rounded-2xl text-sm"
                          value={analyticsSearchQuery}
                          onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Input 
                          placeholder="Token Mint (Optional, defaults to selection)" 
                          className="bg-white/5 border-white/10 h-12 rounded-2xl text-sm flex-1 min-w-[200px]"
                          value={newAlertMint}
                          onChange={(e) => setNewAlertMint(e.target.value)}
                        />
                        <Input 
                          type="number"
                          placeholder="Threshold" 
                          className="bg-white/5 border-white/10 h-12 rounded-2xl text-sm w-32"
                          value={newAlertThreshold || ''}
                          onChange={(e) => setNewAlertThreshold(parseFloat(e.target.value))}
                        />
                        <Button 
                          onClick={handleAddAlert}
                          className="bg-blue-500 hover:bg-blue-600 h-12 rounded-2xl px-6 font-bold"
                        >
                          Set Alert
                        </Button>
                      </div>
                    </div>

                    {priceAlerts.length > 0 && (
                      <Card className="bg-blue-500/5 border-blue-500/10 text-white p-4 rounded-3xl">
                        <div className="flex items-center justify-between mb-4 px-2">
                          <h3 className="text-xs font-bold flex items-center gap-2 text-blue-400">
                            <Activity className="w-4 h-4" />
                            Active Price Alerts
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {priceAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-white/40 truncate w-24">
                                  {alert.mint === 'all' ? 'All Tokens' : alert.mint.slice(0, 4) + '...' + alert.mint.slice(-4)}
                                </span>
                                <span className="text-xs font-bold flex items-center gap-1.5 mt-1">
                                  {alert.type === 'above' ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                                  ${alert.threshold}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[8px] h-5 ${alert.active ? 'border-green-500/50 text-green-500' : 'border-white/10 text-white/20'}`}>
                                  {alert.active ? 'ACTIVE' : 'INACTIVE'}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-white/20 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => toggleAlertActive(alert.id)}
                                >
                                  {alert.active ? <Activity className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveAlert(alert.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <Card className="bg-white/5 border-white/10 text-white p-4 rounded-3xl overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          Token Explorer
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full md:w-auto">
                            {(['24h', '7d', '30d'] as const).map((range) => (
                              <Button
                                key={range}
                                variant="ghost"
                                size="sm"
                                onClick={() => setAnalyticsDateRange(range)}
                                className={`flex-1 md:flex-none px-4 h-8 text-[10px] uppercase font-bold rounded-lg transition-all ${analyticsDateRange === range ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                              >
                                {range}
                              </Button>
                            ))}
                          </div>
                          <Badge variant="outline" className="border-white/10 text-[10px] text-white/40">
                            {analyticsSearchQuery ? 'Filtered' : 'Trending'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-full">
                        <Search className="w-4 h-4 text-white/20 ml-3" />
                        <Input 
                          placeholder="Search tokens..." 
                          value={analyticsSearchQuery}
                          onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                          className="border-none bg-transparent h-9 text-xs focus:ring-0"
                        />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {(allTokens.length > 0 ? allTokens.filter(t => 
                          t.name.toLowerCase().includes(analyticsSearchQuery.toLowerCase()) || 
                          t.symbol.toLowerCase().includes(analyticsSearchQuery.toLowerCase()) ||
                          t.mint.toLowerCase().includes(analyticsSearchQuery.toLowerCase())
                        ) : [
                          { name: 'SOL', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', price: 142.5 },
                          { name: 'Bags Token', symbol: 'BAGS', address: lastMint || 'bags_mint_address', price: 0.0025 },
                          { name: 'Bonk', symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixrk6UM8q6jnRzJvJC7r', price: 0.000024 },
                          { name: 'Jupiter', symbol: 'JUP', address: 'JUPyiZJp7pk346MDSth9Kh7XVfJvY6nZ99Lq2X9R', price: 1.12 },
                        ]).filter(t => 
                          (t.name?.toLowerCase() || '').includes(analyticsSearchQuery.toLowerCase()) || 
                          (t.symbol?.toLowerCase() || '').includes(analyticsSearchQuery.toLowerCase()) ||
                          (t.address?.toLowerCase() || t.mint?.toLowerCase() || '').includes(analyticsSearchQuery.toLowerCase())
                        ).map((token, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            onClick={() => setSelectedAnalyticsToken(token.address || token.mint)}
                            className={`flex flex-col items-start gap-1 p-3 h-auto rounded-2xl border transition-all min-w-[140px] ${selectedAnalyticsToken === (token.address || token.mint) ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold">{token.symbol}</span>
                              <span className="text-[10px] text-green-500 font-mono">+2.4%</span>
                            </div>
                            <span className="text-[10px] text-white/40 truncate w-full font-mono">{(token.address || token.mint).slice(0, 4)}...{(token.address || token.mint).slice(-4)}</span>
                            <span className="text-xs font-mono mt-1">${(token.price || 0).toFixed((token.price || 0) < 1 ? 6 : 2)}</span>
                          </Button>
                        ))}
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3 space-y-6">
                        <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-3xl" id="analytics-price-card">
                        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold">Market Intelligence</CardTitle>
                            <CardDescription className="text-white/40 text-xs italic font-serif opacity-70 uppercase tracking-tighter">Correlated Price, Market Cap & Volume.</CardDescription>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500 border-none text-[10px]">LIVE</Badge>
                        </CardHeader>
                        <CardContent className="px-0 h-[350px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData} syncId="tokenAnalytics">
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="time" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <YAxis yId="left" stroke="#22c55e30" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <YAxis yId="right" orientation="right" stroke="#8b5cf630" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="top" height={36}/>
                              <Area yId="left" name="price" type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                              <Area yId="right" name="marketCap" type="monotone" dataKey="marketCap" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMarketCap)" strokeWidth={1} strokeDasharray="5 5" />
                              <Line yId="right" name="volume" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                              <Brush dataKey="time" height={20} stroke="#ffffff10" fill="#000" travellersWidth={6} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-3xl" id="analytics-market-cap-card">
                        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold">Market Cap</CardTitle>
                            <CardDescription className="text-white/40 text-xs italic font-serif opacity-70 uppercase tracking-tighter">Valuation over time.</CardDescription>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-500 border-none text-[10px]">LIVE</Badge>
                        </CardHeader>
                        <CardContent className="px-0 h-[250px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData} syncId="tokenAnalytics">
                              <defs>
                                <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="time" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Area name="marketCap" type="monotone" dataKey="marketCap" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMarketCap)" strokeWidth={2} />
                              <Brush dataKey="time" height={20} stroke="#ffffff10" fill="#000" travellersWidth={6} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-3xl" id="analytics-volume-card">
                        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold">Volume</CardTitle>
                            <CardDescription className="text-white/40 text-xs italic font-serif opacity-70 uppercase tracking-tighter">Trading activity.</CardDescription>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-500 border-none text-[10px]">24H</Badge>
                        </CardHeader>
                        <CardContent className="px-0 h-[250px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData} syncId="tokenAnalytics">
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="time" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} className="font-mono" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Line name="volume" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} />
                              <Brush dataKey="time" height={20} stroke="#ffffff10" fill="#000" travellersWidth={6} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 text-white p-4 sm:p-6 rounded-3xl lg:col-span-2">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="text-lg font-bold">Holder Distribution</CardTitle>
                          <CardDescription className="text-white/40 text-xs">Top 100 holders concentration.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 h-[200px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Top 1-10', value: 45 },
                              { name: 'Top 11-50', value: 25 },
                              { name: 'Top 51-100', value: 15 },
                              { name: 'Others', value: 15 },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="name" stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                              <YAxis stroke="#ffffff20" fontSize={8} tickLine={false} axisLine={false} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }} />
                              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      <Card className="bg-white/5 border-white/10 text-white p-5 rounded-3xl h-full flex flex-col">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Price Alerts
                          </CardTitle>
                          <CardDescription className="text-[10px] text-white/40">Set thresholds for {selectedAnalyticsToken?.slice(0, 8) || 'automated'} trading.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pt-4 space-y-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">New Threshold ($)</Label>
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={newAlertThreshold || ''}
                                onChange={(e) => setNewAlertThreshold(parseFloat(e.target.value))}
                                className="h-10 bg-white/5 border-white/10 rounded-xl text-xs font-mono"
                              />
                              <Button 
                                size="sm" 
                                onClick={handleAddAlert}
                                className="bg-white text-black hover:bg-white/90 rounded-xl px-4 font-bold text-[10px] uppercase"
                              >
                                Watch
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Active Pipelines</h4>
                            <div className="space-y-2 overflow-y-auto max-h-[400px] scrollbar-hide">
                              {priceAlerts.length === 0 && <p className="text-[10px] text-white/20 italic">No alerts active</p>}
                              {priceAlerts.map(alert => (
                                <div key={alert.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.type === 'above' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {alert.type === 'above' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold font-mono truncate">{alert.mint.slice(0, 4)}...{alert.mint.slice(-4)}</p>
                                      <p className="text-[9px] text-white/40">${alert.threshold}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => toggleAlertActive(alert.id)}
                                      className={`h-7 w-7 p-0 rounded-lg ${alert.active ? 'text-green-500' : 'text-white/10'}`}
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleRemoveAlert(alert.id)}
                                      className="h-7 w-7 p-0 rounded-lg text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="bg-white/5 border-white/10 text-white p-5 rounded-3xl h-full flex flex-col">
                        <CardHeader className="px-0 pt-0">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-orange-500" />
                              Whale Movement
                            </CardTitle>
                            <Badge className="bg-orange-500/20 text-orange-500 border-none text-[8px]">HNI</Badge>
                          </div>
                          <CardDescription className="text-[10px] text-white/40">Real-time alerts for 100+ SOL trades.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pt-4 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
                          <div className="space-y-3">
                            {whaleActivity.map((whale: any, i: number) => (
                              <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                      <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold font-mono">{whale.wallet.slice(0, 4)}...{whale.wallet.slice(-4)}</span>
                                  </div>
                                  <Badge className="bg-white/10 text-white border-none text-[8px]">
                                    {whale.type.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-white/80">{whale.amount} {whale.symbol}</span>
                                  <span className="text-[10px] text-orange-500 font-mono">${whale.value.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[8px] text-white/20">
                                  <span>{new Date(whale.timestamp).toLocaleTimeString()}</span>
                                  <a href={`https://solscan.io/account/${whale.wallet}`} target="_blank" rel="noopener noreferrer" className="group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                    Explorer <ExternalLink className="w-2 h-2" />
                                  </a>
                                </div>
                              </div>
                            ))}
                            {whaleActivity.length === 0 && (
                              <div className="text-center py-20 text-white/10 italic text-xs">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-10 animate-pulse" />
                                Monitoring the depths...
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Market Cap', value: `$${(marketStats.marketCap / 1000000).toFixed(2)}M`, change: '+12.5%', color: 'text-green-500', tooltip: 'The total market value of the token supply.' },
                      { label: '24h Volume', value: `$${(marketStats.volume / 1000).toFixed(0)}K`, change: '+5.2%', color: 'text-green-500', tooltip: 'Total trading volume in the last 24 hours.' },
                      { label: 'Liquidity', value: '$1.1M', change: '-2.1%', color: 'text-red-500', tooltip: 'The amount of funds available in the liquidity pool.' },
                      { label: 'Holders', value: marketStats.holders.toLocaleString(), change: '+142', color: 'text-green-500', tooltip: 'The total number of unique wallet addresses holding the token.' },
                    ].map((stat, i) => (
                      <div key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Card className="bg-white/5 border-white/10 text-white p-4 rounded-2xl cursor-help">
                                <p className="text-[9px] uppercase text-white/40 mb-1 font-bold tracking-wider">{stat.label}</p>
                                <p className="text-lg font-bold font-mono">{stat.value}</p>
                                <p className={`text-[9px] font-bold ${stat.color} mt-1`}>{stat.change}</p>
                              </Card>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black border-white/10 text-[10px]">
                              <p>{stat.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                    </div>

                    <Card className="bg-white/5 border-white/10 text-white p-5 rounded-3xl">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-500" />
                          Recent Transactions
                        </CardTitle>
                        <CardDescription className="text-white/40 text-xs">Latest activity for the selected token.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pt-4">
                        <div className="space-y-3">
                          {logs.filter(l => 
                            !selectedAnalyticsToken || 
                            l.metadata?.mint === selectedAnalyticsToken || 
                            l.metadata?.address === selectedAnalyticsToken
                          ).slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${log.action.includes('buy') ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                  {log.action.includes('buy') ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold capitalize">{log.action.replace('_', ' ')}</p>
                                  <p className="text-[10px] text-white/40 font-mono">{log.signature?.slice(0, 8)}...</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold font-mono">{log.metadata?.amount || '0.00'}</p>
                                <p className="text-[9px] text-white/40">{new Date(log.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))}
                          {logs.length === 0 && (
                            <div className="text-center py-10 text-white/20">
                              <p className="text-xs">No recent transactions found</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
      <Dialog open={tradeConfirmation.isOpen} onOpenChange={(open) => setTradeConfirmation(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Confirm Transaction
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Please review the transaction details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40 uppercase">Type</span>
                <Badge className={`${tradeConfirmation.type === 'buy' ? 'bg-green-500/20 text-green-500' : tradeConfirmation.type === 'sell' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'} border-none`}>
                  {tradeConfirmation.type?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40 uppercase">Token Address</span>
                <span className="text-xs font-mono truncate max-w-[150px]">{tradeConfirmation.mint}</span>
              </div>
              {tradeConfirmation.type === 'transfer' && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 uppercase">Recipient</span>
                  <span className="text-xs font-mono truncate max-w-[150px]">{tradeConfirmation.recipient}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40 uppercase">Amount</span>
                <span className="text-sm font-bold font-mono">
                  {tradeConfirmation.amount} {tradeConfirmation.type === 'buy' ? 'SOL' : 'Tokens'}
                </span>
              </div>
              {tradeConfirmation.type !== 'transfer' && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 uppercase">Price Impact</span>
                  <span className="text-sm font-bold font-mono text-yellow-500">
                    ~{tradeConfirmation.priceImpact?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/60">
                This transaction will be executed on the Solana mainnet. Ensure you have sufficient SOL for network fees.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => setTradeConfirmation(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 border-white/10 hover:bg-white/5 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={executeTrade}
              className="flex-1 bg-white text-black hover:bg-white/90 h-12 rounded-xl font-bold"
            >
              Confirm & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="ghost" 
              className="rounded-xl border-white/5 flex-1" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 rounded-xl flex-1 px-8" 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {confirmDialog.actionLabel || 'Proceed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <FundWalletModal 
          isOpen={isFundingModalOpen} 
          onClose={() => setIsFundingModalOpen(false)} 
          address={publicKey?.toBase58() || ''} 
        />
      </Suspense>
    </TooltipProvider>
  );
}
