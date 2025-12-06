import React, { useState, useMemo } from 'react';
import { TableRowData, DailyLogEntry } from '../types';
import { playFocusSound, playCommitSound } from '../services/soundService';
import { ArrowUpDown, RefreshCcw } from 'lucide-react';

interface Props {
  data: TableRowData[];
  onUpdate: (productId: string, field: keyof DailyLogEntry, value: any, previousValue?: any) => void;
  onOverrideStock: (productId: string, newStock: number) => void; // New Prop
  dateStr: string;
  onToggleHistory: () => void;
}

type SortKey = 'name' | 'price' | 'calculatedStock' | 'salesOut' | null;

export const InventoryTable: React.FC<Props> = ({ data, onUpdate, onOverrideStock, dateStr }) => {
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
            ${type === 'number' ? 'text-xl font-mono tracking-tight font-medium' : 'text-lg'}
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
        <table className="w-full text-left whitespace-nowrap border-separate border-spacing-y-0">
          <thead className="bg-purple-50/90 text-purple-900 font-bold sticky top-0 z-10 backdrop-blur-sm text-lg shadow-sm">
            <tr>
              <th className="px-4 py-5 w-16 text-center sticky left-0 bg-purple-50 z-20">序号</th>
              <th 
                className="px-6 py-5 w-[22%] min-w-[200px] sticky left-16 bg-purple-50 z-20 cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                商品名称 <SortIcon active={sortKey === 'name'} />
              </th>
              <th className="px-4 py-5 w-20 text-center">单位</th>
              <th 
                className="px-4 py-5 w-24 text-right cursor-pointer hover:bg-purple-100/50 transition-colors"
                onClick={() => handleSort('price')}
              >
                售价 <SortIcon active={sortKey === 'price'} />
              </th>
              <th className="px-4 py-5 w-24 text-center text-slate-500">上日库存</th>
              
              <th className="px-2 py-5 w-24 text-center text-blue-600 bg-blue-50/50 rounded-t-xl mx-1">今日进货</th>
              <th className="px-2 py-5 w-20 text-center text-indigo-600 bg-indigo-50/50 rounded-t-xl mx-1">寄存</th>
              
              <th className="px-2 py-5 w-20 text-center text-orange-600 bg-orange-50/20 rounded-t-xl mx-1">寄领</th>
              <th className="px-2 py-5 w-20 text-center text-orange-600 bg-orange-50/20 rounded-t-xl mx-1">赠送</th>
              <th className="px-2 py-5 w-20 text-center text-orange-600 bg-orange-50/20 rounded-t-xl mx-1">回馈</th>
              <th className="px-2 py-5 w-20 text-center text-orange-600 bg-orange-50/20 rounded-t-xl mx-1">套餐赠送</th>
              
              <th 
                className="px-2 py-5 w-24 text-center text-emerald-600 bg-emerald-50/50 rounded-t-xl mx-1 cursor-pointer hover:bg-emerald-100/50"
                onClick={() => handleSort('salesOut')}
              >
                销售 <SortIcon active={sortKey === 'salesOut'} />
              </th>

              {/* Initial Check (Calculated) */}
              <th className="px-2 py-5 w-32 text-center text-purple-800 bg-purple-100/30 rounded-t-xl font-bold border-l border-purple-100">
                初盘
              </th>
              {/* Re-Check (Manual) */}
              <th className="px-2 py-5 w-32 text-center text-purple-800 bg-purple-100/30 rounded-t-xl font-bold border-r border-purple-100">
                复盘
              </th>
              
              <th className="px-8 py-5 min-w-[150px] w-auto">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 text-lg">
            {sortedData.map((row, index) => {
              // Discrepancy Calculation: ReCheck - Initial (Calculated)
              const hasCheck = row.reCheck !== undefined && row.reCheck !== null;
              const diff = hasCheck ? (row.reCheck! - row.calculatedStock) : 0;
              const diffColor = diff === 0 ? 'text-emerald-500' : diff > 0 ? 'text-amber-500' : 'text-red-500';

              return (
                <tr 
                   key={row.id} 
                   className="group hover:bg-white hover:shadow-[0_4px_20px_rgba(139,92,246,0.08)] hover:-translate-y-0.5 transition-all duration-200 ease-out relative z-0 hover:z-10"
                >
                  <td className="px-4 py-3 text-center text-purple-300 font-medium sticky left-0 bg-transparent group-hover:bg-white transition-colors border-r border-transparent group-hover:border-purple-50">{index + 1}</td>
                  <td className="px-6 py-3 font-medium text-slate-700 sticky left-16 bg-transparent group-hover:bg-white transition-colors border-r border-transparent group-hover:border-purple-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-lg">
                    <div className="flex items-center gap-3">
                      {row.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400 text-base">{row.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-lg">¥{row.price}</td>
                  
                  {/* Opening Stock */}
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

                  {/* IN */}
                  <td className="px-1 py-1 bg-blue-50/20 group-hover:bg-blue-50/40 transition-colors">
                    <InputCell value={row.purchaseIn} onChange={(v, pv) => onUpdate(row.id, 'purchaseIn', v, pv)} className="text-blue-600 font-bold" />
                  </td>
                  <td className="px-1 py-1 bg-indigo-50/20 group-hover:bg-indigo-50/40 transition-colors">
                    <InputCell value={row.returnIn} onChange={(v, pv) => onUpdate(row.id, 'returnIn', v, pv)} className="text-indigo-600 font-bold" />
                  </td>

                  {/* OUT */}
                  <td className="px-1 py-1">
                    <InputCell value={row.claimOut} onChange={(v, pv) => onUpdate(row.id, 'claimOut', v, pv)} className="text-orange-600" />
                  </td>
                  <td className="px-1 py-1">
                    <InputCell value={row.giftOut} onChange={(v, pv) => onUpdate(row.id, 'giftOut', v, pv)} className="text-orange-600" />
                  </td>
                  <td className="px-1 py-1">
                    <InputCell value={row.feedbackOut} onChange={(v, pv) => onUpdate(row.id, 'feedbackOut', v, pv)} className="text-orange-600" />
                  </td>
                  <td className="px-1 py-1">
                    <InputCell value={row.packageGiftOut} onChange={(v, pv) => onUpdate(row.id, 'packageGiftOut', v, pv)} className="text-orange-600" />
                  </td>
                  <td className="px-1 py-1 bg-emerald-50/20 group-hover:bg-emerald-50/40 transition-colors">
                    <InputCell value={row.salesOut} onChange={(v, pv) => onUpdate(row.id, 'salesOut', v, pv)} className="text-emerald-600 font-bold" />
                  </td>

                  {/* INITIAL CHECK (NOW EDITABLE VIA OVERRIDE) */}
                  <td className="px-1 py-1 bg-purple-100/30 group-hover:bg-purple-100/50 border-l border-purple-100 transition-colors">
                     <InputCell 
                        value={row.calculatedStock} 
                        onChange={(v) => onOverrideStock(row.id, v)} 
                        className="text-purple-700 font-mono font-bold"
                     />
                  </td>

                  {/* RE-CHECK (MANUAL INPUT) */}
                  <td className="px-1 py-1 bg-purple-100/30 group-hover:bg-purple-100/50 border-r border-purple-100 transition-colors relative">
                     <InputCell 
                        value={row.reCheck ?? ''} 
                        onChange={(v, pv) => onUpdate(row.id, 'reCheck', v === '' ? undefined : v, pv)} 
                        className="text-purple-900 font-bold"
                     />
                     {/* Visual Discrepancy Indicator inside ReCheck cell if present */}
                     {hasCheck && (
                       <div className={`absolute bottom-1 right-2 text-[10px] font-bold ${diffColor} pointer-events-none`}>
                          {diff > 0 ? `+${diff}` : diff < 0 ? diff : '✓'}
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