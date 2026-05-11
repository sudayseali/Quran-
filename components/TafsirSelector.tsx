import React, { useState, useEffect } from 'react';
import { X, Search, Check, Globe, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { TafsirInfo } from '../types';
import { fetchTafsirList } from '../services/quranService';
import { downloadManager } from '../services/downloadManager';
import { dbService, DownloadMetadata } from '../services/dbService';
import { Loading } from './Loading';

interface TafsirSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TafsirSelector: React.FC<TafsirSelectorProps> = ({ isOpen, onClose }) => {
  const [tafsirs, setTafsirs] = useState<TafsirInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingStates, setDownloadingStates] = useState<Record<number, number>>({});
  const [downloadMetadata, setDownloadMetadata] = useState<Record<string, DownloadMetadata>>({});

  const loadTafsirs = async () => {
    setLoading(true);
    try {
      const data = await fetchTafsirList();
      setTafsirs(data.tafsirs);
      
      const allDownloads = await dbService.getAllDownloads();
      const metaMap: Record<string, DownloadMetadata> = {};
      allDownloads.forEach(d => {
        if (d.type === 'tafsir') metaMap[d.id] = d;
      });
      setDownloadMetadata(metaMap);
    } catch (error) {
      console.error("Failed to load tafsirs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTafsirs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTafsirs = tafsirs.filter(t => 
    t.language_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startDownload = async (tafsir: TafsirInfo) => {
    try {
      await downloadManager.downloadTafsir(tafsir.id, tafsir.language_name, (p) => {
        setDownloadingStates(prev => ({ ...prev, [tafsir.id]: p }));
      });
      // Refresh metadata
      const meta = await dbService.getDownloadMetadata(`tafsir_${tafsir.id}`);
      if (meta) setDownloadMetadata(prev => ({ ...prev, [`tafsir_${tafsir.id}`]: meta }));
    } catch (err) {
      console.error("Download failed", err);
      alert(`Download failed for ${tafsir.name}. Please try again.`);
    } finally {
      setDownloadingStates(prev => {
        const next = { ...prev };
        delete next[tafsir.id];
        return next;
      });
    }
  };

  const deleteTafsir = async (tafsirId: number) => {
    if (confirm('Are you sure you want to delete this downloaded Tafsir?')) {
      // Implement deletion logic in dbService if needed, or just remove metadata
      // For now, let's just clear the download flag
      await dbService.deleteDownload(`tafsir_${tafsirId}`);
      setDownloadMetadata(prev => {
        const next = { ...prev };
        delete next[`tafsir_${tafsirId}`];
        return next;
      });
    }
  };

  // Group by language
  const groupedTafsirs = filteredTafsirs.reduce((acc, t) => {
    const lang = t.language_name;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(t);
    return acc;
  }, {} as Record<string, TafsirInfo[]>);

  const sortedLanguages = Object.keys(groupedTafsirs).sort();

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl h-[85vh] sm:h-[75vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl z-10 flex flex-col animate-slide-up relative overflow-hidden border border-white/10">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Globe size={24} />
             </div>
             <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-xl">Tafsir Languages</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Download for offline reading</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
           <div className="relative">
              <Search className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                 type="text" 
                 placeholder="Search by language, name or author..."
                 className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-slate-400 font-medium">Loading tafsir resources...</p>
             </div>
          ) : (
             <div className="space-y-8 pb-10">
               {sortedLanguages.map(lang => (
                 <div key={lang}>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-2 z-10">{lang}</h4>
                   <div className="grid grid-cols-1 gap-3">
                     {groupedTafsirs[lang].map(t => {
                       const meta = downloadMetadata[`tafsir_${t.id}`];
                       const isDownloading = downloadingStates[t.id] !== undefined;
                       const progress = downloadingStates[t.id] || 0;
                       const isCompleted = meta?.status === 'completed';

                       return (
                         <div
                           key={t.id}
                           className={`group relative flex items-center justify-between p-4 rounded-3xl transition-all border ${
                             isCompleted 
                             ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/40' 
                             : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-emerald-200/50 dark:hover:border-emerald-800/50 hover:bg-white dark:hover:bg-slate-800'
                           }`}
                         >
                           <div className="flex-1 min-w-0 pr-4">
                              <p className={`font-bold text-sm truncate ${isCompleted ? 'text-emerald-950 dark:text-emerald-50' : 'text-slate-800 dark:text-slate-200'}`}>
                                {t.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate italic">{t.author_name}</p>
                           </div>

                           <div className="flex items-center gap-2">
                             {isDownloading ? (
                               <div className="flex flex-col items-end gap-1.5 min-w-[60px]">
                                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{progress}%</span>
                                 <div className="w-16 h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                                     style={{ width: `${progress}%` }}
                                   />
                                 </div>
                               </div>
                             ) : isCompleted ? (
                               <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                   <Check size={14} strokeWidth={3} />
                                 </div>
                                 <button 
                                   onClick={() => deleteTafsir(t.id)}
                                   className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                                   title="Remove"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => startDownload(t)}
                                 className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95"
                               >
                                 <Download size={14} />
                                 Download
                               </button>
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               ))}
               
               {sortedLanguages.length === 0 && (
                 <div className="text-center py-20 px-6">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-2">No tafsirs found</p>
                    <p className="text-slate-400 text-sm max-w-[240px] mx-auto">Try searching with a different keyword or language.</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
