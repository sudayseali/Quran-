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
          className="w-full bg-gradient-to-br from-indigo-900 via-emerald-800 to-emerald-950 rounded-[2rem] relative overflow-hidden p-8 flex flex-col shadow-2xl shadow-emerald-900/40 cursor-pointer hover:shadow-emerald-900/50 transition-all group border border-white/10"
        >
          {/* Decorative Elements */}
          <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-[-5%] bottom-[-5%] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="absolute -right-8 -bottom-10 text-white opacity-[0.07] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <BookOpen size={180} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                 <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">{lastRead.context?.type || 'surah'}</span>
              </div>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
                  {lastRead.context?.type === 'surah' ? lastRead.context?.data?.name_simple : 
                   lastRead.context?.type === 'page' ? `Page ${lastRead.context.id}` :
                   lastRead.context?.type === 'juz' ? `Juz ${lastRead.context.id}` :
                   lastRead.context?.id}
                  {!lastRead.context && lastRead.chapter?.name_simple}
                </h3>
                <div className="flex items-center gap-2 text-emerald-200/70">
                   <p className="text-sm font-medium">Ayah {lastRead.verseKey?.split(':')[1] || ''}</p>
                   <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                   <p className="text-xs uppercase tracking-widest font-bold opacity-60">Resume</p>
                </div>
              </div>
              
              <div className="bg-white text-emerald-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-black/20 group-hover:bg-emerald-50 transition-all group-active:scale-95 flex items-center gap-2">
                Continue
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Simulated Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-400 rounded-full w-2/3 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};