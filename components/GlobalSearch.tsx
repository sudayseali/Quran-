import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, BookOpen, Clock, Loader2 } from 'lucide-react';
import { searchQuran } from '../services/quranService';
import { NavigationContext } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (ctx: NavigationContext) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('quran_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchQuran(query);
        setResults(data.search.results);
        
        // Save to recent searches if result found
        if (data.search.results.length > 0) {
            const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
            setRecentSearches(newRecent);
            localStorage.setItem('quran_recent_searches', JSON.stringify(newRecent));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 animate-in fade-in duration-200">
      <div className="h-full flex flex-col max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
            <input 
              autoFocus
              type="text"
              placeholder="Search ayah, translation, word..."
              className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium text-slate-800 dark:text-white placeholder-slate-400 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {loading && <Loader2 className="animate-spin text-emerald-500" size={20} />}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!query && (
            <div className="space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <button 
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                 <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-emerald-500" size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Search the Holy Quran</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                   Type words or ayahs to find their location in the Quran and read their translations.
                 </p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4 pb-8">
              {results.map((result, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    const [surah] = result.verse_key.split(':');
                    onNavigate({ type: 'surah', id: parseInt(surah) });
                    // Todo: Scroll to specific verse in detail view
                    onClose();
                  }}
                  className="w-full text-left p-5 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                         {result.verse_key}
                       </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>

                  <p className="font-arabic text-right text-xl mb-3 text-slate-800 dark:text-slate-100 leading-loose" dir="rtl">
                    {result.text.replace(/<[^>]*>/g, '')}
                  </p>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic" 
                      dangerouslySetInnerHTML={{ __html: result.translations[0]?.text || '' }} 
                  />
                </button>
              ))}
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                <BookOpen size={40} className="text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">No results found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Try searching for other keywords.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
