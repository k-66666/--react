import React, { useState, useEffect } from 'react';
import { playFocusSound } from '../services/soundService';

export const CuteFeatures: React.FC = () => {
  const [showMealReminder, setShowMealReminder] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      // Meal Reminder at 23:00 (11 PM)
      if (current.getHours() === 23 && current.getMinutes() === 0 && current.getSeconds() === 0) {
        setShowMealReminder(true);
        playFocusSound();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* 23:00 Meal Reminder Modal */}
      {showMealReminder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl border-2 border-purple-200 transform animate-float">
              <div className="text-6xl mb-4">🍱</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">夜宵时间到</h2>
              <p className="text-slate-600 mb-6">已经是 23:00 了，记得按时吃饭补充能量哦。<br/>身体健康最重要！</p>
              <button 
                onClick={() => setShowMealReminder(false)}
                className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg"
              >
                好的，去吃饭
              </button>
           </div>
        </div>
      )}
    </>
  );
};