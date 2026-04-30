import axios from 'axios';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // URL or base64
  supply?: number;
  decimals?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface CreateTokenRequest {
  metadata: TokenMetadata;
  amount: number; // Initial buy amount
  feeRecipient: string;
  creator: string;
  bondingCurve?: {
    type: string;
    initialPrice: number;
    scalingFactor: number;
    reserveRatio: number;
  };
}

export interface BagsTokenResponse {
  transaction: string; // Base64 encoded transaction
  mint: string;
}

export const bagsApi = {
  createToken: async (data: CreateTokenRequest): Promise<BagsTokenResponse> => {
    const response = await axios.post('/api/bags/launch', data);
    return response.data;
  },
  
  getFees: async (address: string) => {
    const response = await axios.get(`/api/bags/fees/${address}`);
    return response.data;
  },

  claimFees: async (address: string) => {
    const response = await axios.post(`/api/bags/fees/claim`, { address });
    return response.data;
  },

  getTokens: async () => {
    const response = await axios.get('/api/bags/tokens');
    return response.data;
  },

  buyToken: async (mint: string, amount: number, buyer: string) => {
    const response = await axios.post('/api/bags/trade/buy', { mint, amount, buyer });
    return response.data;
  },

  sellToken: async (mint: string, amount: number, seller: string) => {
    const response = await axios.post('/api/bags/trade/sell', { mint, amount, seller });
    return response.data;
  },

  // Advanced Management
  updateAuthority: async (mint: string, newAuthority: string, type: 'mint' | 'freeze', owner: string) => {
    const response = await axios.post('/api/bags/manage/authority', { mint, newAuthority, type, owner });
    return response.data;
  },

  burnTokens: async (mint: string, amount: number, owner: string) => {
    const response = await axios.post('/api/bags/manage/burn', { mint, amount, owner });
    return response.data;
  },

  airdropTokens: async (mint: string, recipients: { address: string, amount: number }[], sender: string) => {
    const response = await axios.post('/api/bags/manage/airdrop', { mint, recipients, sender });
    return response.data;
  },

  transferToken: async (mint: string, recipient: string, amount: number, sender: string) => {
    const response = await axios.post('/api/bags/manage/transfer', { mint, recipient, amount, sender });
    return response.data;
  },

  getAnalytics: async (mint: string, range?: string) => {
    const response = await axios.get(`/api/bags/analytics/${mint}`, { params: { range } });
    return response.data;
  },

  getWhaleActivity: async () => {
    const response = await axios.get('/api/bags/analytics/whales');
    return response.data;
  }
};
