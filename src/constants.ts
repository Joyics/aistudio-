import { Asset } from './types';

export const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'nasdaq_huaxia',
    name: '纳指 ETF 华夏',
    category: 'Nasdaq',
    currentValue: 0,
    targetRatio: 0.225, // 22.5%
  },
  {
    id: 'nasdaq_jingshun',
    name: '纳指 ETF 景顺',
    category: 'Nasdaq',
    currentValue: 0,
    targetRatio: 0.225, // 22.5%
  },
  {
    id: 'sp500',
    name: '标普 500',
    category: 'S&P 500',
    currentValue: 0,
    targetRatio: 0.20, // 20%
  },
  {
    id: 'bonds',
    name: '国债',
    category: 'Bonds',
    currentValue: 0,
    targetRatio: 0.20, // 20%
  },
  {
    id: 'gold',
    name: '黄金',
    category: 'Gold',
    currentValue: 0,
    targetRatio: 0.05, // 5%
  },
  {
    id: 'cash',
    name: '现金',
    category: 'Cash',
    currentValue: 0,
    targetRatio: 0.10, // 10%
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Nasdaq': '#2563EB', // Accent
  'S&P 500': '#93C5FD', // Light Accent
  'Bonds': '#10B981', // Success
  'Gold': '#F59E0B', // Warning
  'Cash': '#D1D5DB', // Neutral
};
