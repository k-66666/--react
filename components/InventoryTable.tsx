
import React, { useState, useMemo } from 'react';
import { TableRowData, DailyLogEntry } from '../types';
import { playFocusSound, playCommitSound } from '../services/soundService';
import { ArrowUpDown, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react';

interface Props {
  data: TableRowData[];
  onUpdate: (productId: string, field: keyof DailyLogEntry, value: any, previousValue?: any) => void;
  dateStr: string;
  onToggleHistory: () => void;
}

type SortKey = 'name' | 'price' | 'calculatedStock' | 'salesOut' | null;

export const InventoryTable: React.FC<Props> = ({ data, onUpdate, dateStr }) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Sorting Logic
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' 
          ? valA.localeCompare(valB, 'zh-CN') 
          : valB.localeCompare(valA, 'zh-CN');
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  // Input Cell Component
  const InputCell = ({ 
    value, 
    onChange, 
    type = "number", 
    disabled = false, 
    className = "" 
  }: { 
    value: any, 
    onChange: (val: any, prevVal: any) => void, 
    type?: string, 
    disabled?: boolean, 
    className?: string 
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const [startValue, setStartValue] = useState(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleFocus = (e: any) => {
        setStartValue(value);
        playFocusSound();
        e.target.select();
    };

    const handleBlur = () => {
        if (localValue !== startValue) {
            onChange(localValue, startValue);
            playCommitSound();
        }
    };

    const handleChange = (e: any) => {
        const val = type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value;
        setLocalValue(val);
    };

    return (
      <div className="relative group h-full w-full flex items-center justify-center p-0.5">
        <input
          type={type}
          value={localValue === 0 && type === 'number' ? '' : localValue}
          placeholder={type === 'number' && localValue === 0 ? '-' : ''}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full h-14 text-center bg-transparent rounded-xl transition-all duration-200 ease-out 
            focus:outline-none focus:bg-white focus:ring-4 focus:ring-violet-200/50 
            focus:scale-110 focus:shadow-xl focus:z-50 focus:font-bold focus:text-violet-800
            ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-white/40 cursor-text active:bg-white/60'}
            ${type === 'number' ? 'text-2xl font-mono tracking-tight font-medium' : 'text-lg'}
            ${className}
          `}
        />
      </div>
    );
  };

  const SortIcon = ({ active }: { active: boolean }) => (
    <ArrowUpDown size={14} className={`ml-1 inline transition-opacity ${active ? 'opacity-100 text-violet-600' : 'opacity-20'}`} />
  );

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden ring-1 ring-purple-50">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-purple-50/90 text-purple-900 font-bold sticky top-0 z-10 backdrop-blur-sm text-lg shadow-sm">
            <tr>
              <th className="px-4 py-5 w-16 text-center sticky left-0 bg-purple-50 z-20">#</th>
              <th 
                className="px-6 py-5 w-[25%] min-w-[280px] sticky left-16 bg-purple-50 z-20 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                商品名称 <SortIcon active={sortKey === 'name'} />
              </th>
              <th className="px-4 py-5 w-24 text-center">单位</th>
              <th 
                className="px-4 py-5 w-28 text-right cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => handleSort('price')}
              >
                单价 <SortIcon active={sortKey === 'price'} />
              </th>
              <th className="px-4 py-5 w-24 text-center text-slate-500">上日</th>
              <th className="px-2 py-5 w-24 text-center text-blue-600 bg-blue-50/50 rounded-t-xl mx-1">进货</th>
              <th 
                className="px-2 py-5 w-24 text-center text-emerald-600 bg-emerald-50/50 rounded-t-xl mx-1 cursor-pointer hover:bg-emerald-100/50"
                onClick={() => handleSort('salesOut')}
              >
                销售 <SortIcon active={sortKey === 'salesOut'} />
              </th>
              <th className="px-2 py-5 w-20 text-center text-orange-600">赠送</th>
              <th className="px-2 py-5 w-20 text-center text-indigo-600 bg-indigo-50/50 rounded-t-xl mx-1">寄存</th>
              <th className="px-2 py-5 w-20 text-center text-orange-600">套餐</th>
              <th 
                 className="px-4 py-5 w-32 text-center text-violet-700 bg-violet-100/50 text-xl border-x border-violet-200 cursor-pointer hover:bg-violet-200/50"
                 onClick={() => handleSort('calculatedStock')}
              >
                实时库存 <SortIcon active={sortKey === 'calculatedStock'} />
              </th>
              <th className="px-2 py-5 w-28 text-center text-purple-800 bg-purple-100/30 rounded-t-xl font-bold border-l border-purple-100">
                实盘 (点我)
              </th>
              <th className="px-4 py-5 w-32 text-center text-slate-600 bg-slate-50/50">
                核对结果
              </th>
              <th className="px-8 py-5 min-w-[200px] w-auto">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 text-lg">
            {sortedData.map((row, index) => {
              const lowStock = row.calculatedStock <= 5;
              const hasCheck = row.manualCheck !== undefined && row.manualCheck !== null;
              const diff = hasCheck ? (row.manualCheck! - row.calculatedStock) : 0;
              
              return (
                <tr key={row.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-4 py-3 text-center text-purple-300 font-medium sticky left-0 bg-white group-hover:bg-purple-50/30 transition-colors border-r border-transparent group-hover:border-purple-50">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-slate-700 sticky left-16 bg-white group-hover:bg-purple-50/30 transition-colors border-r border-transparent group-hover:border-purple-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-lg">
                    <div className="flex items-center gap-3">
                      {row.name}
                      {lowStock && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-sm" title="库存紧张"></span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400 text-base">{row.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-lg">¥{row.price}</td>
                  
                  {/* Opening Stock with Manual Override Indicator */}
                  <td className="px-4 py-3 text-center font-medium text-xl font-mono relative">
                    <span className={`${row.isManualOpening ? 'text-violet-600 border-b-2 border-violet-300' : 'text-slate-400'}`}>
                        {row.openingStock}
                    </span>
                    {row.isManualOpening && (
                        <div className="absolute top-1 right-2 group-hover:opacity-100 opacity-0 transition-opacity">
                            <RefreshCcw size={10} className="text-violet-400" />
                        </div>
                    )}
                  </td>

                  {/* Inputs - Larger Hit Area */}
                  <td className="px-1 py-1 bg-blue-50/20">
                    <InputCell value={row.purchaseIn} onChange={(v, pv) => onUpdate(row.id, 'purchaseIn', v, pv)} className="text-blue-600 font-bold" />
                  </td>
                  <td className="px-1 py-1 bg-emerald-50/20">
                    <InputCell value={row.salesOut} onChange={(v, pv) => onUpdate(row.id, 'salesOut', v, pv)} className="text-emerald-600 font-bold" />
                  </td>
                  <td className="px-1 py-1">
                    <InputCell value={row.giftOut} onChange={(v, pv) => onUpdate(row.id, 'giftOut', v, pv)} className="text-orange-600" />
                  </td>
                  {/* Deposit (Previously Return) - Now Indigo */}
                  <td className="px-1 py-1 bg-indigo-50/20">
                    <InputCell value={row.returnIn} onChange={(v, pv) => onUpdate(row.id, 'returnIn', v, pv)} className="text-indigo-600 font-bold" />
                  </td>
                  <td className="px-1 py-1">
                    <InputCell value={row.packageGiftOut} onChange={(v, pv) => onUpdate(row.id, 'packageGiftOut', v, pv)} className="text-orange-600" />
                  </td>

                  {/* Calculated Stock */}
                  <td className={`px-4 py-3 text-center font-bold text-2xl font-mono border-x border-violet-100 bg-violet-50/30 ${row.calculatedStock < 0 ? 'text-red-500' : 'text-violet-700'}`}>
                    {row.calculatedStock}
                  </td>

                  {/* Manual Check Input */}
                  <td className="px-1 py-1 bg-purple-100/30 border-l border-purple-100">
                     <InputCell 
                        value={row.manualCheck ?? ''} 
                        onChange={(v, pv) => onUpdate(row.id, 'manualCheck', v === '' ? undefined : v, pv)} 
                        className="text-purple-800 font-bold"
                     />
                  </td>

                  {/* Discrepancy Result */}
                  <td className="px-4 py-3 text-center bg-slate-50/30">
                     {!hasCheck ? (
                        <span className="text-slate-300">-</span>
                     ) : diff === 0 ? (
                        <div className="flex items-center justify-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100">
                           <CheckCircle2 size={14}/> 正常
                        </div>
                     ) : diff > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-sm bg-amber-50 py-1 px-2 rounded-lg border border-amber-100 animate-pulse">
                           <AlertCircle size={14}/> 多了 {diff}
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-1 text-red-500 font-bold text-sm bg-red-50 py-1 px-2 rounded-lg border border-red-100 animate-pulse">
                           <AlertCircle size={14}/> 少了 {Math.abs(diff)}
                        </div>
                     )}
                  </td>

                  <td className="px-2 py-1">
                     <InputCell type="text" value={row.notes} onChange={(v, pv) => onUpdate(row.id, 'notes', v, pv)} className="text-left text-lg text-slate-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
