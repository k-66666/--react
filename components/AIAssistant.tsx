import React, { useState } from 'react';
import { Sparkles, X, Loader2, Bot } from 'lucide-react';
import { analyzeInventory } from '../services/geminiService';
import { TableRowData } from '../types';
import ReactMarkdown from 'react-markdown';

interface Props {
  data: TableRowData[];
  dateStr: string;
}

export const AIAssistant: React.FC<Props> = ({ data, dateStr }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    const analysis = await analyzeInventory(data, dateStr);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 z-50 flex items-center gap-2 group animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform text-yellow-200" />
        <span className="font-bold hidden group-hover:block transition-all pr-2">小栗 AI 助手</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white ring-1 ring-rose-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                   <Bot size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">小栗智能分析报告</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50">
              {!result && !loading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">🔮</div>
                  <p className="text-slate-600 mb-8 text-lg font-medium">
                    我是您的专属 AI 助理。<br/>
                    我可以帮您分析今天的库存变动、销售情况，<br/>
                    还会提醒您哪些东西快卖完啦~
                  </p>
                  <button
                    onClick={handleAnalyze}
                    className="bg-violet-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-200 transform hover:-translate-y-1"
                  >
                    ✨ 开始分析
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={56} className="animate-spin text-fuchsia-500 mb-6" />
                  <p className="text-slate-500 animate-pulse font-medium">正在努力思考中... 🧠</p>
                </div>
              )}

              {result && (
                <div className="prose prose-fuchsia max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600">
                   <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
            
            {result && (
              <div className="p-6 bg-white border-t border-rose-50 flex justify-end gap-3">
                <button
                   onClick={handleAnalyze}
                   className="text-violet-600 font-bold hover:bg-violet-50 px-6 py-2.5 rounded-xl transition-colors"
                >
                  🔄 重新分析
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};