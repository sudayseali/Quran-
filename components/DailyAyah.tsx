import React, { useState } from 'react';
import { ArrowRight, Share2, Play } from 'lucide-react';
import { NavigationContext } from '../types';

import { useAudio } from '../hooks/useAudio';

interface DailyAyahProps {
  onNavigate: (ctx: NavigationContext) => void;
  onShare: (ayah: any) => void;
}

export const DailyAyah: React.FC<DailyAyahProps> = ({ onNavigate, onShare }) => {
  const { playSurah } = useAudio();
  // Hardcoded beautiful ayah for demo (Ayatul Kursi or similar)
  const dailyAyah = {
    verse_key: "2:255",
    text_uthmani: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ...",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence..."
  };

  const handlePlay = () => {
    // Al-Baqarah is ID 2
    playSurah({ 
      id: 2, 
      name_simple: "Al-Baqarah", 
      name_arabic: "البقرة",
      revelation_place: "madinah",
      verses_count: 286
    } as any);
  };

  return (
    <div className="px-6 mb-8 mt-2">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 shadow-2xl shadow-slate-900/20 text-white p-6 md:p-8">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03]"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-bold tracking-widest uppercase text-amber-50">Daily Ayah</span>
             </div>
             <button onClick={() => onShare(dailyAyah)} className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/10">
               <Share2 size={16} className="text-white" />
             </button>
          </div>

          <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-right mb-4 drop-shadow-md text-amber-50" dir="rtl">
            {dailyAyah.text_uthmani}
          </p>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 line-clamp-2 md:line-clamp-none">
            "{dailyAyah.translation}"
          </p>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
             <div className="flex items-center gap-3">
                <button onClick={handlePlay} className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-900 transition-colors shadow-lg shadow-amber-500/20">
                  <Play size={16} className="ml-1" />
                </button>
                <div className="text-sm font-medium text-amber-100">
                  Surah Al-Baqarah
                  <span className="text-xs text-slate-400 block mt-0.5">Ayah 255</span>
                </div>
             </div>
             
             <button 
               onClick={() => onNavigate({ type: 'surah', id: 2 })}
               className="flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors group"
             >
               Read Surah
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
