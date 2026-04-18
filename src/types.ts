export interface Asset {
  id: string;
  name: string;
  category: 'Nasdaq' | 'S&P 500' | 'Bonds' | 'Gold' | 'Cash';
  currentValue: number;
  targetRatio: number;
}

export interface RebalanceRecord {
  id: string;
  date: string;
  totalValue: number;
  summary: string;
  assetsSnapshot: {
    name: string;
    value: number;
    diff: number;
  }[];
}

export interface Portfolio {
  assets: Asset[];
  history: RebalanceRecord[];
}
