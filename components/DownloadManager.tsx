import React, { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle2, Clock, AlertCircle, Loader2, Volume2, BookOpen, X, ChevronRight, Globe } from 'lucide-react';
import { dbService, DownloadMetadata } from '../services/dbService';

export const DownloadManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [downloads, setDownloads] = useState<DownloadMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const all = await dbService.getAllDownloads();
      setDownloads(all.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 2000); // Poll for progress
    return () => clearInterval(interval);
  }, []);

  const removeDownload = async (id: string) => {
    if (confirm('Are you sure you want to remove this offline content?')) {
      await dbService.deleteDownload(id);
      fetchDownloads();
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'quran': return 'Quran Text';
      case 'tafsir': return 'Tafsir Content';
      case 'audio': return 'Surah Audio';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Download size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Downloads</h2>
               <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Manage Offline System</p>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading && downloads.length === 0 ? (
            <div className="flex items-center justify-center py-20">
               <Loader2 className="animate-spin text-emerald-500" />
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-20 px-6">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Download size={40} />
               </div>
               <p className="text-slate-500 font-bold">No active downloads</p>
               <p className="text-slate-400 text-sm mt-1">Download Quran text or Tafsirs for offline use.</p>
            </div>
          ) : (
            downloads.map((item) => (
              <div 
                key={item.id}
                className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3.5 rounded-2xl ${
                    item.type === 'audio' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 
                    item.type === 'tafsir' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                  }`}>
                    {item.type === 'audio' ? <Volume2 size={24} /> : 
                     item.type === 'tafsir' ? <Globe size={24} /> : 
                     <BookOpen size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{getTypeName(item.type)}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                        item.status === 'completed' ? 'bg-emerald-500 text-white' : 
                        item.status === 'downloading' ? 'bg-amber-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {item.status}
                      </span>
                      {item.error && <span className="text-[10px] text-red-500 font-bold truncate">Error: {item.error}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'completed' && (
                      <button 
                        onClick={() => removeDownload(item.id)}
                        className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    {item.status === 'downloading' && (
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    )}
                  </div>
                </div>

                {item.status === 'downloading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Progress</span>
                       <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.totalChunks && (
                       <p className="text-[10px] text-slate-400 font-bold text-center">
                          Completed {item.completedChunks}/{item.totalChunks} Chunks
                       </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shrink-0">
                 <AlertCircle size={20} className="text-amber-500" />
              </div>
              <p className="text-[11px] font-medium leading-relaxed">
                Offline content is stored in your device's persistent storage (IndexedDB). DO NOT clear site data if you want to keep them.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
