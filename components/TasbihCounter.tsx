import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Plus, Activity } from 'lucide-react';
import { NavigationContext } from '../types';

export const TasbihCounter = ({ onNavigate }: { onNavigate: (ctx: NavigationContext) => void }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('tasbih_total');
    if (saved) setTotalCount(parseInt(saved, 10));
  }, []);

  const handleTap = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    const newCount = count + 1;
    setCount(newCount);
    
    const newTotal = totalCount + 1;
    setTotalCount(newTotal);
    localStorage.setItem('tasbih_total', newTotal.toString());
    
    if (newCount === target) {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 transition-colors animate-fade-in">
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center gap-4 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
        <button 
          onClick={() => onNavigate({ type: 'home' })}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Tasbih Counter</h1>
      </div>

      <div className="p-6 max-w-sm mx-auto flex flex-col items-center mt-10">
        <div className="w-full flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-12 border border-slate-100 dark:border-slate-700">
           <div className="text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
             <div className="flex items-center gap-2">
               <button onClick={() => setTarget(33)} className={`px-3 py-1 rounded-lg text-sm font-bold ${target === 33 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'text-slate-500'}`}>33</button>
               <button onClick={() => setTarget(99)} className={`px-3 py-1 rounded-lg text-sm font-bold ${target === 99 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'text-slate-500'}`}>99</button>
             </div>
           </div>
           <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
           <div className="text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime</p>
             <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalCount.toLocaleString()}</p>
           </div>
        </div>

        <div className="relative mb-12">
          {/* Progress circle */}
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-200 dark:text-slate-800"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - Math.min(count / target, 1))}
              className="text-emerald-500 transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter">{count}</span>
             <span className="text-sm font-medium text-slate-400 mt-2">/ {target}</span>
          </div>
        </div>

        <div className="flex gap-6 w-full justify-center items-center">
           <button 
             onClick={handleReset}
             className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex justify-center items-center active:scale-95 transition-transform"
           >
             <RotateCcw size={24} />
           </button>

           <button 
             onClick={handleTap}
             className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full flex justify-center items-center shadow-xl shadow-emerald-600/30 active:scale-95 transition-all transform hover:scale-105"
           >
             <Plus size={48} strokeWidth={3} />
           </button>
        </div>
      </div>
    </div>
  );
};
