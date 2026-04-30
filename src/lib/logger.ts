
export type LogAction = 'token_creation' | 'fee_claim' | 'authority_update' | 'token_burn' | 'airdrop' | 'trade_buy' | 'trade_sell' | 'deploy_agent' | 'token_transfer';

export interface TransactionLog {
  id: string;
  timestamp: number;
  action: LogAction;
  signature?: string;
  status: 'success' | 'failed';
  metadata: any;
  wallet: string;
}

const LOGS_KEY = 'bags_transaction_logs';

export const transactionLogger = {
  log: (log: Omit<TransactionLog, 'id' | 'timestamp'>) => {
    const logs = transactionLogger.getLogs();
    const newLog: TransactionLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    };
    
    const updatedLogs = [newLog, ...logs].slice(0, 100); // Keep last 100 logs
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    
    // Also trigger a custom event so UI can react
    window.dispatchEvent(new CustomEvent('bags_logs_updated'));
    
    return newLog;
  },

  getLogs: (): TransactionLog[] => {
    const stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  },

  clearLogs: () => {
    localStorage.removeItem(LOGS_KEY);
    window.dispatchEvent(new CustomEvent('bags_logs_updated'));
  }
};
