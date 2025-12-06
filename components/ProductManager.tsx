import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Save, X, PackagePlus, FolderInput, CheckSquare, Square, ArrowUpDown, GripVertical, Ban } from 'lucide-react';
import { playCommitSound, playFocusSound } from '../services/soundService';

interface Props {
  products: Product[];
  onAdd: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchEdit: (ids: string[], updates: Partial<Product>) => void;
  onReorder?: (newOrder: Product[]) => void;
}

type SortKey = 'default' | 'name' | 'category' | 'price';

export const ProductManager: React.FC<Props> = ({ products, onAdd, onEdit, onDelete, onBatchDelete, onBatchEdit, onReorder }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', unit: '瓶', price: 0, category: '其他' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sorting State - 'default' means custom order (draggable)
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    // If default sort, return original array order (to allow drag & drop)
    if (sortKey === 'default') return products;

    return [...products].sort((a, b) => {
      let valA: any = a[sortKey as keyof Product] || '';
      let valB: any = b[sortKey as keyof Product] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB, 'zh-CN') : valB.localeCompare(valA, 'zh-CN');
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if already sorting by this key
      if (sortKey !== 'default') {
          setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const resetSort = () => {
    setSortKey('default');
    playFocusSound();
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    if (sortKey !== 'default') return; // Disable drag if sorted
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (sortKey !== 'default') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Auto-Scroll Logic
    const scrollContainer = e.currentTarget.closest('.overflow-auto');
    if (scrollContainer) {
        const { top, bottom } = scrollContainer.getBoundingClientRect();
        const cursorY = e.clientY;
        const triggerHeight = 150; 
        const scrollSpeed = 15;    

        if (cursorY < top + triggerHeight) {
            scrollContainer.scrollTop -= scrollSpeed;
        } else if (cursorY > bottom - triggerHeight) {
            scrollContainer.scrollTop += scrollSpeed;
        }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    if (sortKey !== 'default') return;
    
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newOrder = [...products];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    if (onReorder) {
        onReorder(newOrder);
        playCommitSound();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onBatchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBatchCategory = () => {
    if (selectedIds.size === 0) return;
    const newCategory = prompt("请输入新的分类名称 (将应用到所有选中的商品):");
    if (newCategory) {
      onBatchEdit(Array.from(selectedIds), { category: newCategory });
      setSelectedIds(new Set());
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ ...p });
    playFocusSound();
  };

  const saveEdit = () => {
    if (editingId && editForm.name) {
      onEdit(editForm as Product);
      setEditingId(null);
      playCommitSound();
    }
  };

  const handleAdd = () => {
    if (newProduct.name) {
      onAdd({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: newProduct.name!,
        unit: newProduct.unit || '瓶',
        price: newProduct.price || 0,
        category: newProduct.category || '其他'
      });
      
      setIsAdding(false);
      setNewProduct({ name: '', unit: '瓶', price: 0, category: '其他' });
      playCommitSound();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 overflow-hidden relative">
      <div className="p-6 border-b border-purple-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PackagePlus size={24} className="text-violet-600"/>
          商品档案管理
        </h2>
        <div className="flex gap-2">
            {sortKey !== 'default' && (
                <button 
                  onClick={resetSort} 
                  className="flex items-center gap-2 px-4 py-2 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl text-sm font-bold transition-colors"
                >
                    <ArrowUpDown size={16} /> 恢复默认排序 (以启用拖拽)
                </button>
            )}
            <button
            onClick={() => { setIsAdding(true); playFocusSound(); }}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-2xl hover:bg-violet-700 text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
            <Plus size={18} /> 新增商品
            </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="absolute top-20 left-6 right-6 z-20 bg-slate-800 text-white rounded-2xl shadow-xl p-3 flex items-center justify-between animate-fade-in border border-slate-700">
          <div className="flex items-center gap-3 ml-2">
            <span className="font-bold bg-violet-500 px-2 py-0.5 rounded-lg text-sm shadow-sm">{selectedIds.size}</span>
            <span className="text-sm font-medium">项已选择</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBatchCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors"
            >
              <FolderInput size={16} />
              批量修改分类
            </button>
            <button 
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              批量删除
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 hover:bg-slate-600 rounded-full transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="p-8 bg-purple-50/50 border-b border-purple-100 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-violet-500 block mb-1.5 ml-1">商品名称</label>
              <input className="w-full border-2 border-purple-100 rounded-xl px-4 py-2.5 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} autoFocus />
            </div>
            <div>
              <label className="text-xs font-bold text-violet-500 block mb-1.5 ml-1">分类</label>
              <input className="w-full border-2 border-purple-100 rounded-xl px-4 py-2.5 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-violet-500 block mb-1.5 ml-1">单位</label>
              <input className="w-full border-2 border-purple-100 rounded-xl px-4 py-2.5 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-violet-500 block mb-1.5 ml-1">单价</label>
              <input type="number" className="w-full border-2 border-purple-100 rounded-xl px-4 py-2.5 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div className="flex gap-4 mt-6 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 bg-white text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold transition-colors">取消</button>
            <button onClick={handleAdd} className="px-8 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-bold transition-all shadow-md">确认添加</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse border-spacing-y-2">
          <thead className="bg-purple-50/50 text-violet-600 uppercase font-bold text-xs tracking-wider">
            <tr>
              <th className="px-3 py-5 w-10 text-center text-purple-300">
                 {sortKey === 'default' ? <ArrowUpDown size={16} /> : <div className="flex justify-center" title="排序模式下禁止拖拽"><Ban size={16} /></div>}
              </th>
              <th className="px-6 py-5 w-10">
                <button onClick={toggleSelectAll} className="text-violet-300 hover:text-violet-600 transition-colors">
                  {selectedIds.size > 0 && selectedIds.size === products.length ? <CheckSquare size={20} className="text-violet-600"/> : <Square size={20} />}
                </button>
              </th>
              <th className="px-6 py-5 cursor-pointer hover:bg-purple-100/50 transition-colors" onClick={() => handleSort('name')}>
                商品名称 <ArrowUpDown size={14} className={`inline ${sortKey === 'name' ? 'opacity-100' : 'opacity-20'}`} />
              </th>
              <th className="px-6 py-5 cursor-pointer hover:bg-purple-100/50 transition-colors" onClick={() => handleSort('category')}>
                分类 <ArrowUpDown size={14} className={`inline ${sortKey === 'category' ? 'opacity-100' : 'opacity-20'}`} />
              </th>
              <th className="px-6 py-5">单位</th>
              <th className="px-6 py-5 text-right cursor-pointer hover:bg-purple-100/50 transition-colors" onClick={() => handleSort('price')}>
                单价 <ArrowUpDown size={14} className={`inline ${sortKey === 'price' ? 'opacity-100' : 'opacity-20'}`} />
              </th>
              <th className="px-6 py-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {sortedProducts.map((p, index) => {
              const isSelected = selectedIds.has(p.id);
              const isDraggable = sortKey === 'default';

              return (
                <tr 
                    key={p.id} 
                    className={`
                      transition-all duration-200 ease-out 
                      ${isSelected ? 'bg-purple-50/80' : 'hover:bg-purple-50/40'} 
                      ${isDraggable ? 'cursor-move' : ''}
                      hover:-translate-y-0.5 hover:shadow-md hover:z-10 relative
                    `}
                    draggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                >
                  <td className="px-3 py-4 text-center text-slate-300">
                    <GripVertical size={16} className={isDraggable ? 'hover:text-violet-500 cursor-grab active:cursor-grabbing' : 'opacity-30 cursor-not-allowed'} />
                  </td>
                  <td className="px-6 py-4">
                     <button onClick={() => toggleSelect(p.id)} className="text-purple-200 hover:text-purple-600 transition-colors block">
                       {isSelected ? <CheckSquare size={20} className="text-violet-600" /> : <Square size={20} />}
                     </button>
                  </td>
                  {editingId === p.id ? (
                    <>
                      <td className="px-6 py-4"><input className="border-2 border-purple-200 rounded-lg px-2 py-2 w-full focus:outline-none focus:border-violet-400" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                      <td className="px-6 py-4"><input className="border-2 border-purple-200 rounded-lg px-2 py-2 w-full focus:outline-none focus:border-violet-400" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} /></td>
                      <td className="px-6 py-4"><input className="border-2 border-purple-200 rounded-lg px-2 py-2 w-20 focus:outline-none focus:border-violet-400" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} /></td>
                      <td className="px-6 py-4 text-right"><input type="number" className="border-2 border-purple-200 rounded-lg px-2 py-2 w-24 text-right focus:outline-none focus:border-violet-400" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} /></td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={saveEdit} className="text-white bg-green-500 hover:bg-green-600 p-2 rounded-xl transition-colors shadow-sm"><Save size={18}/></button>
                           <button onClick={() => setEditingId(null)} className="text-slate-500 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors"><X size={18}/></button>
                         </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-700 text-base">{p.name}</td>
                      <td className="px-6 py-4 text-slate-500"><span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">{p.category}</span></td>
                      <td className="px-6 py-4 text-slate-500">{p.unit}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600 text-base font-mono">¥{p.price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => startEdit(p)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2.5 rounded-xl transition-colors border border-indigo-100"><Edit2 size={18}/></button>
                          <button onClick={() => onDelete(p.id)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-colors border border-red-100"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};