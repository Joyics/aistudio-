import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowRightLeft, 
  Plus, 
  Info,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Settings2,
  ChevronRight,
  History as HistoryIcon,
  Bell,
  Calendar,
  X,
  FileText,
  User,
  LayoutGrid,
  Trash2,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend
} from 'recharts';
import { Asset, RebalanceRecord } from './types';
import { DEFAULT_ASSETS, CATEGORY_COLORS } from './constants';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_assets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved assets', e);
        }
      }
    }
    return DEFAULT_ASSETS;
  });

  const [history, setHistory] = useState<RebalanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse history', e);
        }
      }
    }
    return [];
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReminder, setShowReminder] = useState(true);

  const isReminderMonth = useMemo(() => {
    const month = new Date().getMonth() + 1; // 1-indexed
    return [3, 6, 12].includes(month);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_assets', JSON.stringify(assets));
      localStorage.setItem('portfolio_history', JSON.stringify(history));
    }
  }, [assets, history]);

  const totalValue = useMemo(() => assets.reduce((sum, a) => sum + (a.currentValue || 0), 0), [assets]);

  const categoryValues = useMemo(() => {
    const summary: Record<string, number> = {};
    assets.forEach(a => {
      summary[a.category] = (summary[a.category] || 0) + (a.currentValue || 0);
    });
    return summary;
  }, [assets]);

  const assetsWithCalculations = useMemo(() => {
    return assets.map(asset => {
      const assetTargetValue = totalValue * asset.targetRatio;
      
      // Calculate deviation for this specific asset
      const assetDifference = assetTargetValue - (asset.currentValue || 0);
      const currentRatio = totalValue > 0 ? (asset.currentValue || 0) / totalValue : 0;
      
      return {
        ...asset,
        categoryDifference: assetDifference, // Still using this property name but with corrected logic
        currentRatio
      };
    });
  }, [assets, totalValue]);

  const handleValueChange = (id: string, val: string) => {
    const numVal = parseFloat(val) || 0;
    setAssets(prev => prev.map(a => a.id === id ? { ...a, currentValue: numVal } : a));
  };

  const handleRatioChange = (id: string, val: string) => {
    const numVal = (parseFloat(val) || 0) / 100;
    setAssets(prev => prev.map(a => a.id === id ? { ...a, targetRatio: numVal } : a));
  };

  const addAsset = () => {
    const name = prompt('输入资产名称:');
    if (!name) return;
    const category = prompt('输入类别 (Nasdaq, S&P 500, Bonds, Gold, Cash):') as any;
    if (!['Nasdaq', 'S&P 500', 'Bonds', 'Gold', 'Cash'].includes(category)) {
      alert('无效类别');
      return;
    }
    
    const existing = assets.find(a => a.category === category);
    const targetRatio = existing ? existing.targetRatio : 0;

    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name,
      category,
      currentValue: 0,
      targetRatio
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const executeRebalance = () => {
    if (totalValue === 0) return;
    
    const record: RebalanceRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      totalValue: totalValue,
      summary: `持仓调仓快照：总额 ¥${totalValue.toLocaleString()}`,
      assetsSnapshot: assetsWithCalculations.map(a => ({
        name: a.name,
        value: a.currentValue,
        diff: a.categoryDifference
      }))
    };

    setHistory(prev => [record, ...prev]);
    alert('已记录调仓快照。');
  };

  const chartData = useMemo(() => {
    return Object.entries(categoryValues).map(([name, value]) => ({
      name,
      value: totalValue > 0 ? ((value as number) / totalValue) * 100 : 0,
      actualAmount: value as number
    }));
  }, [categoryValues, totalValue]);

  const stockRatioTotal = useMemo(() => {
    const total = Object.entries(categoryValues)
      .filter(([cat]) => cat === 'Nasdaq' || cat === 'S&P 500')
      .reduce((sum, [, val]) => sum + (val as number), 0);
    return totalValue > 0 ? total / totalValue : 0;
  }, [categoryValues, totalValue]);

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex flex-col selection:bg-blue-100 transition-colors">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 bg-surface border-b border-border-theme flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            Portfolio Monitor
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold flex items-center gap-1">
              <TrendingUp size={10} /> 智能平衡中
            </span>
          </h1>
          <p className="text-sm text-text-secondary mt-1 tracking-tight">管理您的资产配置并保持目标比例</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">当前持仓总额</p>
            <div className="text-2xl font-bold font-mono tracking-tight text-accent-theme">
              ¥ {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-text-secondary transition-all active:scale-95 relative"
          >
            <HistoryIcon size={22} />
            {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1240px] mx-auto w-full grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 p-6 md:p-10">
        <aside className="space-y-6">
          <section className="bg-surface border border-border-theme rounded-2xl p-6 shadow-sm">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-4">资产分布</h2>
            <div className="aspect-square relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#eee'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Equity</span>
                <span className="text-xl font-black">{(stockRatioTotal * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }} />
                    <span className="font-bold text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl shadow-blue-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl"><Briefcase size={20} /></div>
                <h3 className="font-black text-sm uppercase tracking-widest">调仓策略</h3>
             </div>
             <p className="text-xs opacity-80 leading-relaxed font-bold">
               系统将根据您的目标比例和当前市值计算每类资产的偏差值。正值表示需要补仓，负值表示需要减仓。
             </p>
          </section>
        </aside>

        <div className="space-y-8">
          {isReminderMonth && showReminder && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent-theme text-white p-6 rounded-3xl shadow-xl shadow-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center gap-4 relative">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                   <Bell size={24} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">季度再平衡提醒</h3>
                  <p className="text-xs opacity-90 font-bold">现在是 {new Date().getMonth() + 1} 月，是时候检查您的资产配比了。</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative">
                <button 
                  onClick={executeRebalance}
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-black shadow-lg hover:bg-gray-50 transition-all active:scale-95"
                >
                  记录当前快照
                </button>
                <button 
                  onClick={() => setShowReminder(false)}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}

          <section className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-border-theme bg-gray-50/20 flex items-center justify-between">
               <h2 className="text-base font-bold text-text-primary tracking-tight">资产明细</h2>
               <button 
                 onClick={addAsset}
                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all"
               >
                 <Plus size={14} /> 添加资产
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/10">
                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">资产 & 类别</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">持仓额 (¥)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">目标占比</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">调仓建议</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme">
                  {assetsWithCalculations.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50/30 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary tracking-tight inline-flex items-center gap-2">
                            {asset.name}
                            <button onClick={() => deleteAsset(asset.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-600 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </span>
                          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-0.5 opacity-50">{asset.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 font-mono">¥</span>
                            <input 
                              type="number" 
                              value={asset.currentValue || ''} 
                              onChange={(e) => handleValueChange(asset.id, e.target.value)}
                              className="w-28 px-2 py-1.5 bg-gray-50 border border-border-theme rounded-xl text-xs font-mono font-bold text-right pl-6 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 opacity-40">
                             <span className="text-[9px] font-mono font-black">{(asset.currentRatio * 100).toFixed(1)}%</span>
                             <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, asset.currentRatio * 100)}%` }} />
                             </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {showSettings ? (
                          <div className="flex items-center justify-end gap-1">
                            <input 
                              type="number" 
                              value={Math.round(asset.targetRatio * 100)} 
                              onChange={(e) => handleRatioChange(asset.id, e.target.value)}
                              className="w-12 px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs font-mono font-bold text-blue-600 text-center outline-none"
                            />
                            <span className="text-[10px] text-blue-300 font-bold">%</span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-text-secondary">{(asset.targetRatio * 100).toFixed(1)}%</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-bold whitespace-nowrap tracking-tight ${Math.abs(asset.categoryDifference) < 50 ? 'text-gray-300' : asset.categoryDifference > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Math.abs(asset.categoryDifference) < 50 ? '仓位均衡' : 
                             asset.categoryDifference > 0 ? `需补 ¥${Math.round(asset.categoryDifference).toLocaleString()}` : 
                             `需减 ¥${Math.round(Math.abs(asset.categoryDifference)).toLocaleString()}`}
                          </span>
                          <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest opacity-40 mt-1">
                            Asset Deviation
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Slide-over components */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white z-[101] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter flex items-center gap-3"><HistoryIcon size={24} className="text-blue-600" /> 历史对账记录</h2>
                <button onClick={() => setShowHistory(false)} className="px-2 py-1 hover:bg-gray-50 rounded-lg text-gray-400 Transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {history.map(record => (
                  <div key={record.id} className="relative pl-6 border-l-2 border-gray-50 space-y-2 pb-6">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-sm font-black text-text-primary">总市值 ¥{record.totalValue.toLocaleString()}</p>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                       {record.assetsSnapshot.slice(0, 3).map((s, i) => (
                         <div key={i} className="flex justify-between text-[10px] font-bold">
                           <span className="text-gray-400">{s.name}</span>
                           <span className={s.diff > 0 ? 'text-emerald-600' : 'text-rose-600'}>{s.diff > 0 ? '补' : '减'}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="px-6 md:px-10 py-6 bg-surface border-t border-border-theme flex items-center justify-between sticky bottom-0 z-40 bg-white/80 backdrop-blur-md">
        <button onClick={() => setShowSettings(!showSettings)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showSettings ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-text-secondary hover:bg-gray-100'}`}>
          {showSettings ? '保存配置' : '配置目标比例'}
        </button>
        
        <button 
          onClick={executeRebalance}
          className="px-8 py-3 rounded-2xl bg-black text-white text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-100 active:scale-95 flex items-center gap-3"
        >
          <CheckCircle2 size={18} /> 执行调仓并记录
        </button>
      </footer>
    </div>
  );
}
