import React, { useState, useEffect, useMemo, Component, ErrorInfo } from 'react';
import { AppData, DailyLogEntry, Product, ViewMode, OperationLog } from './types';
import { loadData, saveData, getFormattedDate, getTableDataForDate, getTodaysOperations } from './services/storageService';
import { InventoryTable } from './components/InventoryTable';
import { ProductManager } from './components/ProductManager';
import { Settings } from './components/Settings';
import { AIAssistant } from './components/AIAssistant';
import { CuteFeatures } from './components/CuteFeatures';
import { OperationHistory } from './components/OperationHistory';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WeatherWidget } from './components/WeatherWidget';
import { DraggableMascot } from './components/DraggableMascot';
import { LayoutDashboard, Package, Calendar, Settings as SettingsIcon, ChevronLeft, ChevronRight, Sun, Moon, CloudSun, Clock, Star, PieChart, History as HistoryIcon, Search, Download, TrendingUp, Cat, AlertTriangle } from 'lucide-react';
import { playFocusSound, playCommitSound } from './services/soundService';
import * as XLSX from 'xlsx';

// Error Boundary to catch crashes
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">出了一点小问题</h2>
            <p className="text-slate-500 mb-6">页面遇到错误停止了运行。请尝试刷新页面。</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<AppData>(loadData());
  const [currentDate, setCurrentDate] = useState<string>(getFormattedDate(new Date()));
  const [view, setView] = useState<ViewMode>(ViewMode.INVENTORY);
  const [greeting, setGreeting] = useState<{text: string, icon: React.ReactNode}>({ text: '早安', icon: <Sun /> });
  const [countdown, setCountdown] = useState<string>('');
  const [workProgress, setWorkProgress] = useState<number>(0);
  
  // Search state lifted to App
  const [searchTerm, setSearchTerm] = useState('');

  // --- Effects ---
  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      // Greeting Logic
      if (hour >= 5 && hour < 11) {
        setGreeting({ text: '早安，新的一天开始了', icon: <Sun className="text-amber-500" /> });
      } else if (hour >= 11 && hour < 13) {
        setGreeting({ text: '午餐时间，记得按时吃饭', icon: <CloudSun className="text-orange-500" /> });
      } else if (hour >= 13 && hour < 18) {
        setGreeting({ text: '下午好，注意劳逸结合', icon: <CloudSun className="text-amber-600" /> });
      } else if (hour >= 18 && hour < 22) {
        setGreeting({ text: '晚上好，今天辛苦了', icon: <Moon className="text-indigo-400" /> });
      } else {
        setGreeting({ text: '夜深了，注意早点休息', icon: <Star className="text-violet-400" /> });
      }

      // Countdown Logic (Target 02:00)
      let target = new Date(now);
      target.setHours(2, 0, 0, 0);
      if (now.getHours() >= 2) {
         target.setDate(target.getDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${h}小时 ${m}分`);

      // Progress Bar Logic (Shift: 17:00 to 02:00 = 9 hours)
      let shiftStart = new Date(now);
      shiftStart.setHours(17, 0, 0, 0);
      if (now.getHours() < 12) {
        shiftStart.setDate(shiftStart.getDate() - 1);
      }
      const elapsed = now.getTime() - shiftStart.getTime();
      const duration = 9 * 60 * 60 * 1000;
      let progress = (elapsed / duration) * 100;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;
      setWorkProgress(progress);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); 
    return () => clearInterval(interval);
  }, []);

  // --- Derived Data ---
  const tableData = useMemo(() => {
    return getTableDataForDate(data, currentDate);
  }, [data, currentDate]);
  
  // Create a map of ID -> Stock for ProductManager
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    tableData.forEach(row => {
      map[row.id] = row.calculatedStock;
    });
    return map;
  }, [tableData]);
  
  // Filtered Data for Inventory View
  const filteredInventoryData = useMemo(() => {
    return tableData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableData, searchTerm]);

  // Daily Stats Calculation based on FILTERED data
  const dailyStats = useMemo(() => {
    return filteredInventoryData.reduce((acc, curr) => acc + (curr.salesOut * curr.price), 0);
  }, [filteredInventoryData]);

  const todaysLogs = useMemo(() => {
    if (!data.operations) return [];
    return getTodaysOperations(data, currentDate);
  }, [data, currentDate]);

  // --- Handlers ---
  const handleDateChange = (offset: number) => {
    playFocusSound();
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    setCurrentDate(getFormattedDate(date));
  };

  const handleExport = () => {
    playCommitSound();
    const exportData = filteredInventoryData.map(row => ({
      '商品名称': row.name,
      '单位': row.unit,
      '单价': row.price,
      '上日库存': row.openingStock,
      '今日进货': row.purchaseIn,
      '销售': row.salesOut,
      '赠送': row.giftOut,
      '回馈': row.returnIn,
      '套餐赠送': row.packageGiftOut,
      '计算库存': row.calculatedStock,
      '实际盘点': row.manualCheck ?? '',
      '备注': row.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentDate);
    XLSX.writeFile(wb, `小栗库存表_${currentDate}.xlsx`);
  };

  const updateLog = (productId: string, field: keyof DailyLogEntry, value: any, previousValue?: any) => {
    setData(prev => {
      const dayLog = prev.logs[currentDate] || {};
      const productLog = dayLog[productId] || { productId, openingStock: 0, purchaseIn: 0, salesOut: 0, giftOut: 0, returnIn: 0, packageGiftOut: 0, notes: '', manualCheck: undefined };
      
      const newLogs = {
          ...prev.logs,
          [currentDate]: {
            ...dayLog,
            [productId]: {
              ...productLog,
              [field]: value
            }
          }
      };

      let newOperations = prev.operations || [];
      if (previousValue !== undefined && previousValue !== value) {
         const product = prev.products.find(p => p.id === productId);
         if (product) {
           let type: OperationLog['type'] = 'MODIFY';
           if (field === 'purchaseIn') type = 'STOCK_IN';
           if (field === 'salesOut') type = 'SALE';
           if (field === 'giftOut') type = 'GIFT';
           if (field === 'returnIn') type = 'RETURN';
           if (field === 'packageGiftOut') type = 'PACKAGE';
           if (field === 'manualCheck') type = 'CHECK';
           
           const delta = typeof value === 'number' && typeof previousValue === 'number' ? value - previousValue : undefined;

           const opLog: OperationLog = {
             // Robust ID generation to avoid duplicate keys during rapid updates
             id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             timestamp: Date.now(),
             type,
             productName: product.name,
             detail: `从 ${previousValue} 修改为 ${value}`,
             delta
           };
           newOperations = [opLog, ...newOperations];
         }
      }

      return {
        ...prev,
        logs: newLogs,
        operations: newOperations
      };
    });
  };
  
  // Handler to update stock from Product Manager
  const handleProductStockUpdate = (productId: string, newStock: number) => {
    const currentRow = tableData.find(r => r.id === productId);
    if (!currentRow) return;

    const currentCalculated = currentRow.calculatedStock;
    const diff = newStock - currentCalculated;
    
    // We adjust the opening stock for today to align the final calculated stock
    // New Opening = Old Opening + Diff
    const newOpening = currentRow.openingStock + diff;
    
    updateLog(productId, 'openingStock', newOpening, currentRow.openingStock);
  };

  const handleProductAdd = (p: Product, initialStock: number) => {
    setData(prev => {
      const newData = { ...prev, products: [...prev.products, p] };
      if (initialStock > 0) {
        const dayLog = newData.logs[currentDate] || {};
        newData.logs[currentDate] = {
          ...dayLog,
          [p.id]: {
             productId: p.id,
             openingStock: initialStock,
             purchaseIn: 0,
             salesOut: 0,
             giftOut: 0,
             returnIn: 0,
             packageGiftOut: 0,
             notes: '初始入库',
             manualCheck: undefined
          }
        };
      }
      return newData;
    });
  };

  const handleProductEdit = (p: Product) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(prod => prod.id === p.id ? p : prod)
    }));
  };

  const handleProductDelete = (id: string) => {
    if (confirm('确认要删除这个商品吗？')) {
      setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    }
  };

  const handleBatchProductDelete = (ids: string[]) => {
    if (confirm(`确认删除选中的 ${ids.length} 个商品吗？`)) {
      setData(prev => ({ ...prev, products: prev.products.filter(p => !ids.includes(p.id)) }));
    }
  };

  const handleBatchProductEdit = (ids: string[], updates: Partial<Product>) => {
    setData(prev => ({ ...prev, products: prev.products.map(p => ids.includes(p.id) ? { ...p, ...updates } : p) }));
  };
  
  const handleDataImport = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const distanceToHome = Math.max(0, 100 - workProgress);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-purple-200 cursor-default">
      
      {/* Floating Cat Mascot */}
      <DraggableMascot />

      {/* Sidebar - Purple Theme */}
      <aside className="bg-white/80 backdrop-blur-md border-r border-purple-100 w-full md:w-72 flex-shrink-0 flex flex-col transition-all z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
        
        {/* Modern Brand Card Header */}
        <div className="p-6 pb-2">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 shadow-xl shadow-purple-200/50 text-white relative overflow-hidden group cursor-pointer" onClick={playFocusSound}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-fuchsia-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Cat size={28} className="text-white drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-tight">小栗系统</h1>
                        <p className="text-[10px] font-medium text-purple-100 opacity-90 uppercase tracking-wider">Inventory Master</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-4 mx-4 mt-2 bg-gradient-to-br from-violet-50 to-white rounded-xl border border-purple-50">
           <div className="flex items-center gap-2 mb-1 text-sm font-bold text-slate-700">
             {greeting.icon}
             <span>今日寄语</span>
           </div>
           <p className="text-xs text-slate-500 leading-relaxed">{greeting.text}</p>
        </div>

        {/* Sidebar Weather Widget */}
        <WeatherWidget />
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-0 relative z-10 custom-scrollbar">
          <button onClick={() => { setView(ViewMode.INVENTORY); playFocusSound(); }} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${view === ViewMode.INVENTORY ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 font-medium' : 'text-slate-500 hover:bg-purple-50 hover:text-violet-600'}`}>
            <LayoutDashboard size={18} /> <span className="text-sm">库存日报</span>
          </button>
          <button onClick={() => { setView(ViewMode.ANALYTICS); playFocusSound(); }} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${view === ViewMode.ANALYTICS ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 font-medium' : 'text-slate-500 hover:bg-purple-50 hover:text-violet-600'}`}>
            <PieChart size={18} /> <span className="text-sm">数据看板</span>
          </button>
          <button onClick={() => { setView(ViewMode.HISTORY); playFocusSound(); }} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${view === ViewMode.HISTORY ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 font-medium' : 'text-slate-500 hover:bg-purple-50 hover:text-violet-600'}`}>
            <HistoryIcon size={18} /> <span className="text-sm">对账记录</span>
          </button>
          <button onClick={() => { setView(ViewMode.PRODUCTS); playFocusSound(); }} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${view === ViewMode.PRODUCTS ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 font-medium' : 'text-slate-500 hover:bg-purple-50 hover:text-violet-600'}`}>
            <Package size={18} /> <span className="text-sm">商品管理</span>
          </button>
          <button onClick={() => { setView(ViewMode.SETTINGS); playFocusSound(); }} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${view === ViewMode.SETTINGS ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 font-medium' : 'text-slate-500 hover:bg-purple-50 hover:text-violet-600'}`}>
            <SettingsIcon size={18} /> <span className="text-sm">系统设置</span>
          </button>
        </nav>

        {/* Sidebar Footer with Liquid Drain Effect */}
        <div className="relative border-t border-purple-100 bg-white h-40 group select-none">
           <div className="absolute inset-0 overflow-hidden z-0">
             <div className="absolute bottom-0 left-0 w-full bg-violet-200/60 transition-all duration-[2000ms] ease-in-out" style={{ height: `${distanceToHome}%` }}>
                <div className="absolute -top-4 left-0 w-full h-4 overflow-hidden">
                  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave fill-violet-200/60"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path></svg>
                </div>
             </div>
           </div>
           <div className="absolute inset-0 flex flex-col justify-center items-center p-6 z-20 pointer-events-auto">
              <div className="text-center w-full bg-white/40 backdrop-blur-[2px] p-2 rounded-xl border border-white/50 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1"><Clock size={16} className="text-violet-700" /><span className="text-xs font-bold text-violet-800 uppercase tracking-wider">距离下班</span></div>
                <div className="text-4xl font-black text-violet-900 font-mono tracking-tight leading-none mb-1">{Math.round(distanceToHome)}%</div>
                <div className="text-sm font-medium text-violet-800 opacity-90">{countdown}</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Header - MERGED CONTROLS HERE */}
        <header className="bg-white/60 backdrop-blur-sm border-b border-purple-50 h-20 flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
             {/* Title & Date Picker */}
             {view === ViewMode.INVENTORY ? (
               <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-purple-100">
                 <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-purple-50 rounded-full transition-colors text-slate-400 hover:text-violet-600"><ChevronLeft size={20} /></button>
                 <div className="flex items-center gap-2 px-4 font-bold text-slate-700 text-base">
                    <Calendar size={18} className="text-violet-500 mb-0.5" />
                    {currentDate}
                 </div>
                 <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-purple-50 rounded-full transition-colors text-slate-400 hover:text-violet-600"><ChevronRight size={20} /></button>
               </div>
             ) : (
                <h2 className="text-xl font-bold text-slate-800 tracking-tight pl-2">
                  {view === ViewMode.PRODUCTS && '商品档案'}
                  {view === ViewMode.SETTINGS && '数据安全'}
                  {view === ViewMode.ANALYTICS && '经营数据看板'}
                  {view === ViewMode.HISTORY && '操作对账记录'}
                </h2>
             )}
          </div>

          {/* Integrated Toolbar for Inventory View */}
          {view === ViewMode.INVENTORY && (
            <div className="flex items-center gap-4 animate-fade-in">
                {/* Search */}
                <div className="relative group w-48 md:w-64 transition-all focus-within:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-purple-300 group-focus-within:text-purple-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索商品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-purple-100 bg-white/80 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all text-sm font-medium"
                  />
                </div>

                {/* Stats Pill */}
                <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                   <TrendingUp size={16} />
                   <span className="text-sm font-bold">¥{dailyStats.toFixed(2)}</span>
                </div>

                {/* Export Button */}
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-bold"
                >
                  <Download size={16} />
                  <span>导出</span>
                </button>
            </div>
          )}
        </header>

        {/* View Content */}
        <div className="flex-1 p-6 md:p-8 overflow-hidden relative">
          {view === ViewMode.INVENTORY ? (
            <div className="h-full flex flex-col animate-fade-in space-y-4">
              <InventoryTable 
                data={filteredInventoryData} 
                onUpdate={updateLog}
                dateStr={currentDate}
                onToggleHistory={() => setView(ViewMode.HISTORY)}
              />
              <AIAssistant data={tableData} dateStr={currentDate} />
              <CuteFeatures />
            </div>
          ) : view === ViewMode.PRODUCTS ? (
            <div className="h-full overflow-auto animate-fade-in custom-scrollbar pb-12">
              <ProductManager 
                products={data.products} 
                onAdd={handleProductAdd}
                onEdit={handleProductEdit}
                onDelete={handleProductDelete}
                onBatchDelete={handleBatchProductDelete}
                onBatchEdit={handleBatchProductEdit}
                stockMap={stockMap}
                onUpdateStock={handleProductStockUpdate}
              />
            </div>
          ) : view === ViewMode.ANALYTICS ? (
            <div className="h-full overflow-auto animate-fade-in custom-scrollbar">
               <AnalyticsDashboard data={data} dateStr={currentDate} />
            </div>
          ) : view === ViewMode.HISTORY ? (
            <div className="h-full overflow-auto animate-fade-in custom-scrollbar">
               <OperationHistory logs={todaysLogs} />
            </div>
          ) : (
            <div className="h-full overflow-auto animate-fade-in custom-scrollbar">
              <Settings data={data} onImport={handleDataImport} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Wrap main app with Error Boundary
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;