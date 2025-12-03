import React, { useRef } from 'react';
import { AppData } from '../types';
import { Download, Upload, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { playCommitSound } from '../services/soundService';

interface Props {
  data: AppData;
  onImport: (data: AppData) => void;
}

export const Settings: React.FC<Props> = ({ data, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    playCommitSound();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `XiaoLi_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && json.logs) {
          if (confirm('确认恢复备份吗？这将覆盖当前的所有数据。')) {
            onImport(json);
            alert('数据恢复成功');
          }
        } else {
          alert('文件格式不正确');
        }
      } catch (err) {
        alert('解析文件失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
       <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <ShieldCheck className="text-violet-600" size={28} />
              系统数据管理
            </h2>
            <p className="text-slate-500 mt-2 text-sm">请定期备份您的数据，以防丢失</p>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 gap-8">
             {/* Export Section */}
             <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-8 border border-violet-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <Download size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">下载备份</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  将当前所有数据导出为文件保存。<br/>建议每周进行一次备份。
                </p>
                <button 
                  onClick={handleExport}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  📥 导出数据
                </button>
             </div>

             {/* Import Section */}
             <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">恢复备份</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  使用之前的备份文件恢复数据。<br/>注意：这会覆盖当前内容。
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white border-2 border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 rounded-xl font-bold transition-all shadow-sm"
                >
                  📤 选择备份文件
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                  accept=".json" 
                  className="hidden" 
                />
             </div>
          </div>
       </div>

       <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
          <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-amber-900 mb-2">重要提示</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
               所有数据均保存在当前浏览器中。刷新网页或重启电脑数据不会丢失。<br/>
               <span className="opacity-80 mt-1 block">但如果更换电脑或清空浏览器缓存，数据将会丢失。请务必养成定期导出备份的习惯。</span>
            </p>
          </div>
       </div>
    </div>
  );
};