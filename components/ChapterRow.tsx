import React from 'react';
import { Chapter } from '../types';
import { useSettings } from '../hooks/useSettings';

interface ChapterRowProps {
  chapter: Chapter;
  onClick: (id: number) => void;
}

export const ChapterRow: React.FC<ChapterRowProps> = ({ chapter, onClick }) => {
  const { settings } = useSettings();

  return (
    <div 
      onClick={() => onClick(chapter.id)}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg hover:shadow-emerald-900/5 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Subtle hover background sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      <div className="flex items-center space-x-4 relative z-10">
        {/* Number Badge (Premium Geometric Style) */}
        <div className="relative flex items-center justify-center w-11 h-11 bg-slate-50 dark:bg-slate-900/50 rounded-xl group-hover:bg-emerald-500 transition-colors shadow-inner dark:shadow-none border border-slate-200/60 dark:border-slate-700 group-hover:border-emerald-500">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.05] group-hover:opacity-20 transition-opacity"></div>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors">{chapter.id}</span>
        </div>
        
        {/* Info */}
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{chapter.name_simple}</h3>
            {settings.surahTranslatedName && chapter.translated_name?.name && (
               <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">({chapter.translated_name.name})</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
            {chapter.revelation_place} <span className="mx-1 text-slate-300 dark:text-slate-600">•</span> {chapter.verses_count} Verses
          </p>
        </div>
      </div>

      {/* Arabic Name */}
      <div className="text-right relative z-10">
        <span className="font-arabic text-2xl text-emerald-800 dark:text-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm">{chapter.name_arabic}</span>
      </div>
    </div>
  );
};