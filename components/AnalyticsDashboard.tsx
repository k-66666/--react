
import React, { useMemo } from 'react';
import { AppData, TableRowData } from '../types';
import { getTableDataForDate, getPreviousDate, getFormattedDate } from '../services/storageService';
import { PieChart, TrendingUp, AlertTriangle, Coins, Package, BarChart3, AlertOctagon } from 'lucide-react';

interface Props {
  data: AppData;
  dateStr: string;
}

export const AnalyticsDashboard: React.FC<Props> = ({ data, dateStr }) => {
  const tableData = getTableDataForDate(data, dateStr);
  
  // Stats
  const totalSalesAmount = tableData.reduce((acc, curr) => acc + (curr.salesOut * curr.price), 0);
  const totalItemsSold = tableData.reduce((acc, curr) => acc + curr.salesOut, 0);
  const lowStockItems = tableData.filter(item => item.calculatedStock <= 5);
  
  // Top Selling Items
  const topSellingItems = [...tableData]
    .sort((a, b) => b.salesOut - a.salesOut)
    .filter(item => item.salesOut > 0)
    .slice(0, 5);

  // Category Breakdown
  const categoryStats: Record<string, number> = {};
  tableData.forEach(item => {
    const cat = item.category || '其他';
    categoryStats[cat] = (categoryStats[cat] || 0) + item.salesOut;
  });
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .filter(([, val]) => val > 0);

  // Last 7 Days Trend
  const sevenDayStats = useMemo(() => {
    const stats = [];
    let current = dateStr;
    for (let i = 0; i < 7; i++) {
        const rows = getTableDataForDate(data, current);
        const dailyTotal = rows.reduce((acc, curr) => acc + (curr.salesOut * curr.price), 0);
        stats.unshift({ date: current.slice(5), amount: dailyTotal }); // MM-DD
        current = getPreviousDate(current);
    }
    return stats;
  }, [data, dateStr]);

  const maxDailySales = Math.max(...sevenDayStats.map(s => s.amount), 1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-200">
            <div className="flex items-center gap-3 mb-2 opacity-80">
               <Coins size={20} />
               <span className="font-bold">今日销售额</span>
            </div>
            <div className="text-4xl font-bold">¥ {totalSalesAmount.toFixed(2)}</div>
            <div className="mt-4 text-sm bg-white/20 inline-block px-3 py-1 rounded-lg">
               共售出 {totalItemsSold} 件商品
            </div>
         </div>

         <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-slate-500">
               <AlertTriangle size={20} className="text-amber-500"/>
               <span className="font-bold">库存预警</span>
            </div>
            <div className="text-4xl font-bold text-slate-800">{lowStockItems.length} <span className="text-base text-slate-400 font-normal">个商品</span></div>
            <div className="mt-2 text-xs text-slate-400">库存少于 5 件</div>
         </div>

         <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-slate-500">
               <Package size={20} className="text-blue-500"/>
               <span className="font-bold">商品总数</span>
            </div>
            <div className="text-4xl font-bold text-slate-800">{tableData.length} <span className="text-base text-slate-400 font-normal">种</span></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* 7 Day Trend */}
         <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <BarChart3 className="text-violet-500" /> 近7天销售趋势
             </h3>
             <div className="h-48 flex items-end justify-between gap-2">
                 {sevenDayStats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="relative w-full flex justify-center items-end h-32">
                             <div 
                                className="w-full max-w-[30px] bg-violet-200 rounded-t-lg group-hover:bg-violet-400 transition-colors relative"
                                style={{ height: `${(stat.amount / maxDailySales) * 100}%` }}
                             >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                   ¥{stat.amount}
                                </div>
                             </div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">{stat.date}</div>
                    </div>
                 ))}
             </div>
         </div>

         {/* Low Stock List */}
         <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm flex flex-col">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <AlertOctagon className="text-red-500" /> 补货清单 (库存≤5)
             </h3>
             <div className="flex-1 overflow-auto custom-scrollbar max-h-48">
                 {lowStockItems.length === 0 ? (
                    <div className="text-slate-400 text-center py-10">库存充足，暂无预警</div>
                 ) : (
                    <table className="w-full text-sm">
                       <thead className="text-slate-500 text-xs border-b border-slate-100">
                          <tr>
                             <th className="text-left pb-2">商品</th>
                             <th className="text-center pb-2">库存</th>
                             <th className="text-right pb-2">状态</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {lowStockItems.map(item => (
                             <tr key={item.id}>
                                <td className="py-2.5 font-medium text-slate-700">{item.name}</td>
                                <td className="py-2.5 text-center font-bold text-violet-700 font-mono">{item.calculatedStock}</td>
                                <td className="py-2.5 text-right">
                                   <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100">
                                      {item.calculatedStock <= 0 ? '缺货' : '紧张'}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Top Selling Chart */}
         <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <TrendingUp className="text-emerald-500" /> 
               今日热销 (Top 5)
            </h3>
            <div className="space-y-5">
               {topSellingItems.length === 0 ? (
                 <div className="text-slate-400 text-center py-10">今日暂无销售数据</div>
               ) : (
                 topSellingItems.map((item, idx) => (
                   <div key={item.id} className="relative">
                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-1 z-10 relative">
                         <span>{idx + 1}. {item.name}</span>
                         <span>{item.salesOut} {item.unit}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                           style={{ width: `${(item.salesOut / topSellingItems[0].salesOut) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Category Breakdown */}
         <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <PieChart className="text-blue-500" /> 
               销售分类占比
            </h3>
            <div className="space-y-4">
               {sortedCategories.length === 0 ? (
                  <div className="text-slate-400 text-center py-10">今日暂无分类数据</div>
               ) : (
                  sortedCategories.map(([cat, val], idx) => (
                     <div key={cat} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-bold text-slate-600">{cat}</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-indigo-500 rounded-full opacity-80"
                              style={{ width: `${(val / totalItemsSold) * 100}%` }}
                           ></div>
                        </div>
                        <div className="w-12 text-right text-xs text-slate-400">{val}</div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
