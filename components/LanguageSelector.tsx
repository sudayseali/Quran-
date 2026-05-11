import React, { useState, useEffect } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { TranslationResource } from '../types';
import { fetchTranslationResources } from '../services/quranService';
import { Loading } from './Loading';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: number;
  onSelect: (id: number, name: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  isOpen, 
  onClose, 
  selectedId, 
  onSelect 
}) => {
  const [translations, setTranslations] = useState<TranslationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && translations.length === 0) {
      const loadTranslations = async () => {
        setLoading(true);
        try {
          const data = await fetchTranslationResources();
          setTranslations(data.translations);
        } catch (error) {
          console.error("Failed to load translations", error);
        } finally {
          setLoading(false);
        }
      };
      loadTranslations();
    }
  }, [isOpen, translations.length]);

  if (!isOpen) return null;

  const filteredTranslations = translations.filter(t => 
    t.language_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by language
  const groupedTranslations = filteredTranslations.reduce((acc, t) => {
    const lang = t.language_name;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(t);
    return acc;
  }, {} as Record<string, TranslationResource[]>);

  const sortedLanguages = Object.keys(groupedTranslations).sort();

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col animate-slide-up relative">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Globe size={20} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 dark:text-emerald-50 text-lg">Select Language</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose translation language</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onClose();
                // We'll need a callback to open Tafsir selector from App
                (window as any).dispatchOpenTafsir?.(); 
              }}
              className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Tafsir Offline
            </button>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
           <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search language or author..."
                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900 rounded-b-3xl">
          {loading ? (
             <Loading />
          ) : (
             <div className="space-y-6">
               {sortedLanguages.map(lang => (
                 <div key={lang}>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 sticky top-0 bg-white dark:bg-slate-900 py-1 z-10">{lang}</h4>
                   <div className="grid grid-cols-1 gap-1">
                     {groupedTranslations[lang].map(t => (
                       <button
                         key={t.id}
                         onClick={() => {
                           onSelect(t.id, t.name);
                           onClose();
                         }}
                         className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${selectedId === t.id ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                       >
                         <div>
                            <p className={`font-medium text-sm ${selectedId === t.id ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{t.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{t.author_name}</p>
                         </div>
                         <div className="flex items-center gap-3">
                           {selectedId !== t.id && (
                             <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors" title="Download">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                             </div>
                           )}
                           {selectedId === t.id && (
                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                               <Check size={14} strokeWidth={3} />
                             </div>
                           )}
                         </div>
                       </button>
                     ))}
                   </div>
                 </div>
               ))}
               
               {sortedLanguages.length === 0 && (
                 <div className="text-center py-10 text-slate-400">
                    <p>No languages found</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};