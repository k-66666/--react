import React from 'react';
import { OperationLog } from '../types';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Package, Gift, RefreshCcw, Search, Clock, ArrowDown, ExternalLink, HeartHandshake } from 'lucide-react';

interface Props {
  logs: OperationLog[];
}

export const OperationHistory: React.FC<Props> = ({ logs }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'STOCK_IN': return <ArrowDownLeft className="text-blue-500" size={20} />;
      case 'SALE': return <ArrowUpRight className="text-emerald-500" size={20} />;
      case 'CHECK': return <CheckCircle className="text-purple-500" size={20} />;
      case 'RECHECK': return <CheckCircle className="text-purple-700" size={20} />;
      case 'GIFT': return <Gift className="text-orange-500" size={20} />;
      case 'RETURN': return <ArrowDown className="text-indigo-500" size={20} />; // Deposit
      case 'CLAIM': return <ExternalLink className="text-amber-600" size={20} />;
      case 'FEEDBACK': return <HeartHandshake className="text-rose-500" size={20} />;
      case 'PACKAGE': return <Package className="text-orange-400" size={20} />;
      default: return <Package className="text-slate-400" size={20} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'STOCK_IN': return '进货';
      case 'SALE': return '销售';
      case 'CHECK': return '初盘';
      case 'RECHECK': return '复盘';
      case 'GIFT': return '赠送';
      case 'RETURN': return '寄存'; 
      case 'CLAIM': return '寄领';
      case 'FEEDBACK': return '回馈';
      case 'PACKAGE': return '套餐';
      default: return '修改';
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'STOCK_IN': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'SALE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CHECK': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'RECHECK': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'GIFT': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'RETURN': return 'bg-indigo-50 text-indigo-700 border-indigo-100'; // Deposit
      case 'CLAIM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'FEEDBACK': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'PACKAGE': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <Clock className="text-violet-600" size={28} />
              对账记录
            </h2>
            <p className="text-slate-500 mt-2 text-sm">记录今天的每一笔变动，方便核对账目</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-purple-100 shadow-sm text-sm text-slate-500 font-medium">
             共 {logs.length} 条记录
          </div>
        </div>

        <div className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <p className="font-medium">还没有操作记录哦~</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-8 py-4 w-32">时间</th>
                  <th className="px-6 py-4 w-32">类型</th>
                  <th className="px-6 py-4">商品名称</th>
                  <th className="px-6 py-4">变动详情</th>
                  <th className="px-6 py-4 text-right">变动数值</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-8 py-4 text-slate-500 font-mono text-sm">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getColorClass(log.type)}`}>
                        {getLabel(log.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {log.productName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                       {log.detail}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.delta !== undefined && (
                        <span className={`font-bold font-mono text-base ${log.delta > 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {log.delta > 0 ? '+' : ''}{log.delta}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};