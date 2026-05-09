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
      <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col animate-slide-up relative">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Globe size={20} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-lg">Select Language</h3>
                <p className="text-xs text-slate-500">Choose translation language</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-50">
           <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search language or author..."
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
             <Loading />
          ) : (
             <div className="space-y-6">
               {sortedLanguages.map(lang => (
                 <div key={lang}>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 sticky top-0 bg-white py-1">{lang}</h4>
                   <div className="grid grid-cols-1 gap-1">
                     {groupedTranslations[lang].map(t => (
                       <button
                         key={t.id}
                         onClick={() => {
                           onSelect(t.id, t.name);
                           onClose();
                         }}
                         className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${selectedId === t.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'}`}
                       >
                         <div>
                            <p className={`font-medium text-sm ${selectedId === t.id ? 'text-emerald-800' : 'text-slate-700'}`}>{t.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{t.author_name}</p>
                         </div>
                         {selectedId === t.id && (
                           <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                             <Check size={14} strokeWidth={3} />
                           </div>
                         )}
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