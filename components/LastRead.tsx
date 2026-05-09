import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { NavigationContext } from '../types';

interface LastReadProps {
  lastRead?: any;
  onNavigate?: (ctx: NavigationContext) => void;
}

export const LastRead: React.FC<LastReadProps> = ({ lastRead, onNavigate }) => {
  if (!lastRead) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-baseline px-6 mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Continue Reading</h2>
      </div>
      
      <div className="px-6">
        <div 
          onClick={() => onNavigate && onNavigate(lastRead.context || { type: 'surah', data: lastRead.chapter })}
          className="w-full bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl relative overflow-hidden p-6 flex flex-col justify-between shadow-lg shadow-emerald-900/20 cursor-pointer hover:shadow-xl transition-all group"
        >
          <div className="absolute -right-6 -bottom-8 text-white opacity-10 group-hover:scale-110 transition-transform duration-500">
            <BookOpen size={140} />
          </div>
          <div className="relative z-10 flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">{lastRead.context?.type || 'surah'}</span>
                <span className="text-sm font-bold text-white">
                  {lastRead.context?.type === 'surah' ? lastRead.context?.data?.name_simple : lastRead.context?.id}
                  {!lastRead.context && lastRead.chapter?.name_simple}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Ayah {lastRead.verseKey?.split(':')[1] || ''}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md group-hover:bg-white/30 transition-colors">
              <ArrowRight className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};