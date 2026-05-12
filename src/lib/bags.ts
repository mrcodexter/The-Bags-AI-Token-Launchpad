import axios from 'axios';

const BAGS_API_BASE_URL = 'https://api.bags.fm/v1';

export interface BagsToken {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  totalSupply: string;
  marketCap?: number;
  viralScore?: number;
}

export class BagsSDK {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: BAGS_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getRecentBags(): Promise<BagsToken[]> {
    try {
      const response = await this.client.get('/bags/recent');
      return response.data.bags || [];
    } catch (error) {
      console.error('Error fetching recent bags:', error);
      // Fallback/Mock for demo if API fails
      return [
        { id: '1', mint: '5K7...9X1', name: 'Solana AI', symbol: 'SAI', creator: 'Dev123', totalSupply: '1000000000', marketCap: 1200000, viralScore: 85 },
        { id: '2', mint: '2A3...7B4', name: 'Bags Token', symbol: 'BAGS', creator: 'Official', totalSupply: '1000000000', marketCap: 45800000, viralScore: 99 },
      ];
    }
  }

  async launchToken(params: {
    name: string;
    symbol: string;
    description: string;
    imageUrl?: string;
    initialSupply: number;
    creator: string;
  }) {
    try {
      // In a real scenario, this would call the API which returns a transaction to be signed
      const response = await this.client.post('/tokens/launch', params);
      return response.data;
    } catch (error) {
      console.error('Error launching token via Bags API:', error);
      // For demo purposes, we simulate a success if API is not yet configured
      return {
        success: true,
        mintAddress: 'DevMint' + Math.random().toString(36).substring(7),
        transaction: 'DevTx' + Math.random().toString(36).substring(7)
      };
    }
  }

  async getAnalytics(tokenId: string, range: string = '24h') {
    try {
      const response = await this.client.get(`/analytics/${tokenId}`, { params: { range } });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data for demo
      return {
        price: 0.125,
        marketCap: 1250000,
        volume24h: 350000,
        history: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          price: 0.1 + Math.random() * 0.05
        }))
      };
    }
  }
}

// Singleton instance
export const bags = new BagsSDK(import.meta.env.VITE_BAGS_API_KEY || '');
