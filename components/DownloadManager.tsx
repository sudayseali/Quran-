import React, { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle2, Clock, AlertCircle, Loader2, Volume2, BookOpen, X, ChevronRight } from 'lucide-react';
import { checkIsDownloaded, setDownloadStatus } from '../services/quranService';

interface DownloadItem {
  id: string;
  name: string;
  type: 'audio' | 'tafsir';
  size: string;
  status: 'none' | 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
}

export const DownloadManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    { id: 'quran_text', name: 'Quran Text (Uthmani)', type: 'tafsir', size: '5.2 MB', status: 'completed', progress: 100 },
    { id: 'audio_alafasy', name: 'Mishary Alafasy (Audio)', type: 'audio', size: '850 MB', status: 'none', progress: 0 },
    { id: 'tafsir_ibn_kathir', name: 'Tafsir Ibn Kathir (English)', type: 'tafsir', size: '12 MB', status: 'none', progress: 0 },
    { id: 'tafsir_jalalayn', name: 'Tafsir Al-Jalalayn (Arabic)', type: 'tafsir', size: '4.5 MB', status: 'none', progress: 0 },
  ]);

  useEffect(() => {
    const updateStatuses = async () => {
      const updated = await Promise.all(downloads.map(async (item) => {
        const isDownloaded = await checkIsDownloaded(item.id);
        return { ...item, status: isDownloaded ? 'completed' : item.status };
      }));
      setDownloads(updated as any);
    };
    updateStatuses();
  }, []);

  const startDownload = (id: string) => {
    setDownloads(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'downloading', progress: 0 } : item
    ));

    // Simulate download for now since actual full audio download is huge
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 10) + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setDownloads(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'completed', progress: 100 } : item
        ));
        setDownloadStatus(id, 'completed');
      } else {
        setDownloads(prev => prev.map(item => 
          item.id === id ? { ...item, progress: p } : item
        ));
      }
    }, 500);
  };

  const removeDownload = async (id: string) => {
    if (id === 'quran_text') return; // Cannot delete core text
    setDownloads(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'none', progress: 0 } : item
    ));
    await setDownloadStatus(id, 'pending');
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
           <div>
             <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Download Manager</h2>
             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Manage Offline Content</p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {downloads.map((item) => (
            <div 
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-2xl ${item.type === 'audio' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                  {item.type === 'audio' ? <Volume2 size={24} /> : <BookOpen size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">
                      {item.size}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{item.type === 'audio' ? 'MP3 Files' : 'JSON Text'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      <div className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
                        <CheckCircle2 size={14} /> Available
                      </div>
                      {item.id !== 'quran_text' && (
                        <button 
                          onClick={() => removeDownload(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ) : item.status === 'downloading' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-600">{item.progress}%</span>
                      <Loader2 className="animate-spin text-emerald-600" size={20} />
                    </div>
                  ) : (
                    <button 
                      onClick={() => startDownload(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <Download size={20} />
                    </button>
                  )}
                </div>
              </div>

              {item.status === 'downloading' && (
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300" 
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                 <AlertCircle size={20} className="text-amber-500" />
              </div>
              <p className="text-xs font-medium leading-relaxed">
                Downloaded content is stored in your browser's IndexedDB. Clearing browser cache may remove these files.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
