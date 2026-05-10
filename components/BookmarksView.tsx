import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { Chapter, NavigationContext } from '../types';

interface BookmarksViewProps {
  bookmarks: string[];
  chapters: Chapter[];
  toggleBookmark: (verseKey: string) => void;
  onNavigate: (ctx: NavigationContext, specificVerse?: string) => void;
  onBack: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ bookmarks, chapters, toggleBookmark, onNavigate, onBack }) => {
  const [bookmarkDetails, setBookmarkDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarkDetails = () => {
      setLoading(true);
      const details = [];
      
      for (const verseKey of bookmarks) {
        const [surahIdStr, ayahStr] = verseKey.split(':');
        const surahId = parseInt(surahIdStr, 10);
        const ayah = parseInt(ayahStr, 10);
        
        const chapter = chapters.find(c => c.id === surahId);
        
        details.push({
          verseKey,
          surahId,
          ayah,
          chapter,
          surahName: chapter ? `${chapter.id}. ${chapter.name_simple}` : `Surah ${surahId}`,
        });
      }
      
      details.sort((a, b) => {
        if (a.surahId !== b.surahId) return a.surahId - b.surahId;
        return a.ayah - b.ayah;
      });
      
      setBookmarkDetails(details);
      setLoading(false);
    };

    if (chapters.length > 0) {
      loadBookmarkDetails();
    }
  }, [bookmarks, chapters]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 transition-colors animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar */}
        <div 
        className="px-6 py-4 flex items-center gap-4 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-20 border-b border-transparent transition-colors"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
      >
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
              <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
            Saved Bookmarks
          </h1>
        </div>

        <div className="p-6">
          {loading ? (
             <div className="flex justify-center p-12">
               <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
             </div>
          ) : bookmarkDetails.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Bookmarks Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[250px] mx-auto">
                Save verses while reading to quickly access them later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkDetails.map((bookmark) => (
                <div key={bookmark.verseKey} className="group bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                        if (bookmark.chapter) {
                            onNavigate({ type: 'surah', data: bookmark.chapter }, bookmark.verseKey);
                        }
                    }}
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold relative overflow-hidden group-hover:scale-105 transition-transform">
                          <span className="relative z-10 text-sm">{bookmark.surahId}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{bookmark.surahName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ayah {bookmark.ayah}</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(bookmark.verseKey); }}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                          if (bookmark.chapter) {
                              onNavigate({ type: 'surah', data: bookmark.chapter }, bookmark.verseKey);
                          }
                      }}
                      className="p-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-full transition-colors"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
