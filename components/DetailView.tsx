import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreHorizontal, Play, Pause, Share2, Bookmark, Search, X, Book, ChevronDown, Check, Loader2, Download } from 'lucide-react';
import { audioDownloadService } from '../services/audioDownloadService';
import { NavigationContext, Verse, TafsirInfo, ApiVerseResponse } from '../types';
import { fetchVerses, fetchVersesByHizb, fetchVersesByJuz, fetchVersesByPage, getAudioUrl, fetchTafsirList, fetchTafsirContent, fetchChapterAudioTimings } from '../services/quranService';
import { Loading } from './Loading';
import { QuickTools } from './QuickTools';

import { AyahImageShare } from './AyahImageShare';
import { useSettings } from '../hooks/useSettings';

import { useAudio } from '../hooks/useAudio';

interface DetailViewProps {
  context: NavigationContext;
  onBack: () => void;
  translationId: number;
  translationName: string;
  bookmarks: string[];
  toggleBookmark: (verseKey: string) => void;
  onVerseRead: () => void;
  saveLastRead: (context: NavigationContext, verseKey: string) => void;
}

// Utility to convert numbers to Arabic-Indic digits
const toArabicNumerals = (n: number | string) => {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export const DetailView: React.FC<DetailViewProps> = ({ 
  context, 
  onBack, 
  translationId, 
  translationName,
  bookmarks,
  toggleBookmark,
  onVerseRead,
  saveLastRead
}) => {
  const { 
    currentSurah, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    playSurah 
  } = useAudio();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [verseTimings, setVerseTimings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<ApiVerseResponse['pagination'] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Audio UI Helpers
  const audioProgress = (currentTime / duration) * 100 || 0;
  
  const getContextId = () => {
    if (context.type === 'surah') return context.id || (context as any).data?.id;
    if (context.type === 'settings') return undefined;
    if ('id' in context) return (context as any).id;
    return undefined;
  };

  const isSurahPlaying = isPlaying && currentSurah?.id === getContextId();

  // Reading Progress State
  const [readingProgress, setReadingProgress] = useState(0);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const checkDownloaded = async () => {
      const id = getContextId();
      if (context.type === 'surah' && id) {
        const path = await audioDownloadService.getLocalPath(id, 'mishari_al-afasy');
        setIsDownloaded(!!path);
      }
    };
    checkDownloaded();
  }, [context]);

  const handleDownload = async () => {
    const id = getContextId();
    if (context.type === 'surah' && id) {
      setDownloading(true);
      setDownloadProgress(0);
      try {
        await audioDownloadService.downloadSurah(id, 'mishari_al-afasy', (p) => setDownloadProgress(p));
        setIsDownloaded(true);
      } catch (err) {
        console.error('Download failed', err);
      } finally {
        setDownloading(false);
        setDownloadProgress(0);
      }
    }
  };

  // View Settings
  const [showTools, setShowTools] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTajweed, setShowTajweed] = useState(false);
  
  const { settings, updateSetting } = useSettings();
  const fontSize = settings.ayahTextSize;
  const setFontSize = (size: number) => updateSetting('ayahTextSize', size);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'book'>('list');
  
  // Hifdh Mode State
  const [isHifdhMode, setIsHifdhMode] = useState(false);
  const [revealedVerses, setRevealedVerses] = useState<Set<string>>(new Set());

  // Tafsir State
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(169); // Default to Ibn Kathir (English) or similar
  const [tafsirList, setTafsirList] = useState<TafsirInfo[]>([]);
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<Verse | null>(null);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [showTafsirSelector, setShowTafsirSelector] = useState(false);

  // Sharing State
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);

  const versesRef = useRef<Verse[]>([]); // To access latest verses in closures

  const activeVerseKeyRef = useRef<string | null>(null);

  // Sync activeVerseKey with verseTimings
  useEffect(() => {
    if (isPlaying && currentSurah?.id === getContextId() && verseTimings.length > 0) {
      const currentMillis = currentTime * 1000;
      const timing = verseTimings.find(t => currentMillis >= t.timestamp_from && currentMillis <= t.timestamp_to);
      if (timing && timing.verse_key !== activeVerseKeyRef.current) {
        activeVerseKeyRef.current = timing.verse_key;
        // Scroll to it
        setTimeout(() => {
          const el = document.getElementById(`verse-${timing.verse_key}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else if (!isPlaying) {
      activeVerseKeyRef.current = null;
    }
  }, [currentTime, isPlaying, currentSurah, verseTimings, context]);

  // Track read verses
  const readVersesRef = useRef<Set<string>>(new Set());

  // Update verses ref whenever verses change
  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  useEffect(() => {
    if (isPlaying && currentSurah) {
        // ... scrolling logic if needed
    }
  }, [isPlaying, currentSurah]);

  // Load Content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setVerses([]); // Clear verses on context change
      setPagination(null); // Reset pagination
      try {
        let data;
        let targetId: number | undefined;
        if (context.type === 'surah') targetId = context.id || (context as any).data?.id;
        else if (context.type !== 'settings') targetId = (context as any).id;

        if (context.type === 'surah' && targetId) {
          data = await fetchVerses(targetId, 1, translationId);
        } else if (context.type === 'hizb') {
          data = await fetchVersesByHizb(context.id, 1, translationId);
        } else if (context.type === 'juz') {
          data = await fetchVersesByJuz(context.id, 1, translationId);
        } else if (context.type === 'page') {
          data = await fetchVersesByPage(context.id, 1, translationId);
        }

        if (data) {
          setVerses(data.verses);
          setPagination(data.pagination);
        }

        if (context.type === 'surah' && targetId) {
          const timings = await fetchChapterAudioTimings(settings.recitationApiId, targetId);
          setVerseTimings(timings);
        } else {
          setVerseTimings([]);
        }

        // Pre-load Tafsir list
        const tafsirs = await fetchTafsirList();
        setTafsirList(tafsirs.tafsirs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [context, translationId, settings.recitationApiId]);

  // Load More Verses Handler
  const handleLoadMore = async () => {
    if (!pagination?.next_page || loadingMore) return;
    
    setLoadingMore(true);
    try {
      let data;
    const nextPage = pagination.next_page;
    let targetId: number | undefined;
    if (context.type === 'surah') targetId = context.id || (context as any).data?.id;
    else if (context.type !== 'settings') targetId = (context as any).id;
    
    if (context.type === 'surah' && targetId) {
      data = await fetchVerses(targetId, nextPage, translationId);
    } else if (context.type === 'hizb') {
      data = await fetchVersesByHizb(context.id, nextPage, translationId);
    } else if (context.type === 'juz') {
      data = await fetchVersesByJuz(context.id, nextPage, translationId);
    } else if (context.type === 'page') {
      data = await fetchVersesByPage(context.id, nextPage, translationId);
    }

      if (data) {
        setVerses(prev => [...prev, ...data.verses]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load more verses", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle Reading Progress (Scroll)
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const maxScroll = documentHeight - windowHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Check which verses are visible to mark as read
      const verseElements = document.querySelectorAll('[id^="verse-"]');
      verseElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= windowHeight) {
          const verseKey = el.id.replace('verse-', '');
          
          // Save Last Read
          saveLastRead(context, verseKey);

          if (!readVersesRef.current.has(verseKey)) {
            readVersesRef.current.add(verseKey);
            onVerseRead(); // Increment global tracker
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [verses, fontSize, showTranslation]);

  // Core Play Logic
  const playVerse = (verseKey: string, continuous: boolean) => {
    // For now, we'll just play the surah if they click a verse, 
    // or we could implement per-verse in audioService.
    if (context.type === 'surah' && context.data) {
        if (currentSurah?.id === context.data.id) {
            // If it's already the loaded surah, just resume playing to avoid restarting
            if (!isPlaying) {
                togglePlay();
            }
        } else {
            playSurah(context.data);
        }
    }
  };

  const toggleAudio = (verseKey: string) => {
    if (isSurahPlaying) {
      togglePlay();
    } else {
      playVerse(verseKey, false);
    }
  };

  const handlePlaySurah = () => {
    if (context.type === 'surah' && context.data) {
        if (currentSurah?.id === context.data.id) {
            togglePlay();
        } else {
            playSurah(context.data);
        }
    }
  };

  const openTafsir = async (verse: Verse, tafsirId: number = selectedTafsirId) => {
    setActiveTafsirVerse(verse);
    setLoadingTafsir(true);
    setTafsirContent('');
    try {
      const data = await fetchTafsirContent(tafsirId, verse.verse_key);
      setTafsirContent(data.text);
    } catch (err) {
      console.error(err);
      setTafsirContent('Failed to load Tafsir.');
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleShare = async (verse: Verse) => {
    setShareVerse(verse); // Open Share Modal
  };

  const filteredVerses = verses.filter(verse => {
    const query = searchQuery.toLowerCase();
    const translation = verse.translations?.[0]?.text.toLowerCase() || '';
    const arabic = verse.text_uthmani; 
    const key = verse.verse_key;
    const verseNum = verse.verse_key.split(':')[1];

    return translation.includes(query) || 
           arabic.includes(query) || 
           key.includes(query) ||
           verseNum === query;
  });

  const getHeaderTitle = () => {
    if (context.type === 'surah') return `${context.id || (context as any).data?.id}. ${(context as any).data?.name_simple || 'Surah'}`;
    if (context.type === 'hizb') return `Hizb ${(context as any).id}`;
    if (context.type === 'juz') return `Juz ${(context as any).id}`;
    if (context.type === 'page') return `Page ${(context as any).id}`;
    return 'Al Quran';
  };

  const getHeaderSubtitle = () => {
    if (context.type === 'surah') return (context as any).data?.translated_name?.name || 'Surah';
    return 'Quran Juzu Part';
  };

  // Highlight Text Helper
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span className="break-words">
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-emerald-200 dark:bg-emerald-800 text-transparent bg-clip-text text-emerald-900 dark:text-emerald-100 px-1 rounded font-bold underline decoration-emerald-500/50">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Group Tafsirs by language for the selector
  const groupedTafsirs = tafsirList.reduce((acc, tafsir) => {
    const lang = tafsir.language_name;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(tafsir);
    return acc;
  }, {} as Record<string, TafsirInfo[]>);

  const MidSurahHeader = ({ verse }: { verse: Verse }) => {
    const chapterId = verse.verse_key.split(':')[0];
    return (
      <div className="my-12 text-center animate-fade-in">
        <div className="inline-flex items-center gap-4 mb-4">
          <div className="h-px w-12 md:w-20 bg-emerald-200 dark:bg-emerald-800" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">Surah Transition</span>
          <div className="h-px w-12 md:w-20 bg-emerald-200 dark:bg-emerald-800" />
        </div>
        <div className="bg-emerald-950/5 dark:bg-emerald-500/5 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group">
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none group-hover:opacity-10 transition-opacity" 
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }} />
           <h2 className="font-arabic text-4xl text-emerald-900 dark:text-emerald-100 relative z-10">سُورَةُ {verse.verse_key.split(':')[0]}</h2>
           <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-4 relative z-10">Surah No. {chapterId}</p>
        </div>
        {verse.verse_key.split(':')[1] === '1' && chapterId !== '1' && chapterId !== '9' && (
          <div className="font-arabic text-3xl mt-8 text-slate-800 dark:text-slate-200 opacity-90">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        )}
      </div>
    );
  };

  // Render Book Mode (Mushaf View)
  const renderBookMode = () => {
    let lastChapter = '';
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 relative transition-colors">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-[0.02] dark:opacity-5 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
         />
         
         <div 
           dir="rtl" 
           className="font-arabic text-slate-800 dark:text-slate-200 text-justify"
           style={{ 
             fontSize: `${fontSize}px`, 
             lineHeight: '2.4' 
           }}
         >
           {filteredVerses.map((verse) => {
              const chapterId = verse.verse_key.split(':')[0];
              const verseNum = verse.verse_key.split(':')[1];
              let isPlayingVerse = false;
              if (currentSurah?.id === getContextId() && isPlaying) {
                 const currentMillis = currentTime * 1000;
                 const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
                 if (timing) {
                   isPlayingVerse = currentMillis >= timing.timestamp_from && currentMillis <= timing.timestamp_to;
                 }
              }
              
              const showHeader = lastChapter && lastChapter !== chapterId;
              lastChapter = chapterId;

              return (
                 <React.Fragment key={verse.id}>
                   {showHeader && (
                     <div className="w-full text-center my-10 py-6 border-y border-emerald-100/50 dark:border-emerald-900/30 font-arabic text-3xl text-emerald-800 dark:text-emerald-200" dir="rtl">
                        سُورَةُ {chapterId}
                        {verseNum === '1' && chapterId !== '1' && chapterId !== '9' && (
                          <div className="text-2xl mt-4 opacity-80">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                        )}
                     </div>
                   )}
                   <span 
                     id={`verse-${verse.verse_key}`}
                   className={`rounded transition-colors px-1 ${isPlayingVerse ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100' : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30'}`}
                   style={{ fontFamily: settings.arabicFont === 'indopak' ? "'Lateef', 'Meiryo', serif" : undefined }}
                 >
                   {showTajweed && verse.text_uthmani_tajweed ? (
                     <span dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
                   ) : (
                     settings.arabicFont === 'indopak' ? (verse.text_indopak || verse.text_uthmani) : verse.text_uthmani
                   )}
                 </span>
                 {/* Verse Marker */}
                 <span className="inline-flex items-center justify-center mx-2 align-middle relative select-none">
                    <span className="text-emerald-500 dark:text-emerald-600 text-[0.9em] leading-none opacity-80 font-serif">۝</span>
                    <span className="absolute inset-0 flex items-center justify-center text-[0.35em] pt-0.5 font-bold text-emerald-800 dark:text-emerald-200">
                      {toArabicNumerals(verseNum)}
                    </span>
                 </span>
               </React.Fragment>
            );
         })}
       </div>

       {/* Book Mode Translation Overlay (Optional: only show if toggled) */}
       {showTranslation && (
         <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Translation ({translationName})</h4>
            <div className="space-y-4">
              {filteredVerses.map(verse => (
                <div key={`trans-${verse.id}`} className="flex gap-4">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 h-6 w-6 rounded flex items-center justify-center flex-shrink-0">
                    {verse.verse_key.split(':')[1]}
                  </span>
                  <p 
                    className="text-slate-600 dark:text-slate-300 leading-relaxed"
                    style={{ fontSize: `${settings.translationTextSize}px` }}
                  >
                    {verse.translations?.[0]?.text.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 animate-fade-in relative transition-colors">
      {/* Header */}
      <div 
        className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-30 border-b border-emerald-100 dark:border-emerald-900/30 shadow-sm transition-colors"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center px-4 py-4">
            <button onClick={onBack} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 justify-center text-lg">
                <span>{getHeaderTitle()}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getHeaderSubtitle()}</p>
            </div>
            <button onClick={() => setShowTools(true)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>
        </div>

        {/* Global Reading Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
           <div 
             className="h-full bg-emerald-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(5,150,105,0.4)]"
             style={{ width: `${readingProgress}%` }}
           />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Banner */}
        <div className="px-4 mt-6 mb-6">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-8 pb-10 text-white text-center shadow-2xl shadow-emerald-900/40 relative overflow-hidden ring-1 ring-white/10 mx-1">
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay" 
                   style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none translate-x-8 -translate-y-8">
                 <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"/>
                   <circle cx="12" cy="12" r="6"/>
                   <path d="M12 2v20M2 12h20"/>
                 </svg>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                {context.type === 'surah' ? (
                  <>
                    <h1 className="font-arabic text-6xl mb-4 drop-shadow-lg text-emerald-50 font-normal leading-tight">{(context as any).data?.name_arabic || ''}</h1>
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/20 text-[11px] font-bold tracking-widest uppercase backdrop-blur-md mb-8 border border-white/10 shadow-inner">
                      <span className="text-emerald-100">{(context as any).data?.revelation_place || ''}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-emerald-100">{(context as any).data?.verses_count || ''} Verses</span>
                    </div>
                  </>
                ) : (
                  <h1 className="font-arabic text-5xl mb-8 drop-shadow-md text-emerald-50">
                    {context.type === 'hizb' && `Al-Hizb ${(context as any).id}`}
                    {context.type === 'juz' && `Al-Juz ${(context as any).id}`}
                    {context.type === 'page' && `Page ${(context as any).id}`}
                  </h1>
                )}

                {/* Play All Button */}
                <div className="flex justify-center gap-3 mb-8 w-full max-w-[280px]">
                  <button 
                      onClick={handlePlaySurah}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white backdrop-blur-md px-6 py-3.5 rounded-2xl font-bold transition-all group shadow-lg shadow-emerald-500/20"
                  >
                      {isSurahPlaying ? (
                          <>
                              <Pause size={20} className="fill-current" />
                              <span>Pause</span>
                          </>
                      ) : (
                          <>
                              <Play size={20} className="fill-current ml-1" />
                              <span>Play Audio</span>
                          </>
                      )}
                  </button>

                  {context.type === 'surah' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownload}
                        disabled={downloading || isDownloaded}
                        className={`flex flex-col items-center justify-center backdrop-blur-md w-14 h-14 rounded-2xl transition-all shadow-lg border relative overflow-hidden ${
                          isDownloaded 
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                            : 'bg-black/20 border-white/10 text-emerald-100/70 hover:bg-black/30'
                        }`}
                        title={isDownloaded ? "Downloaded" : "Download for offline"}
                      >
                          {downloading && (
                            <div className="absolute bottom-0 left-0 h-1 bg-emerald-400" style={{ width: `${downloadProgress}%` }} />
                          )}
                          {downloading ? (
                             <span className="text-[10px] font-black">{downloadProgress}%</span>
                          ) : isDownloaded ? (
                            <Check size={24} />
                          ) : (
                            <Download size={24} />
                          )}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Audio Status</span>
                        <span className="text-xs font-bold text-white">
                          {downloading ? 'Downloading...' : isDownloaded ? 'Offline Ready' : 'Online Only'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Tajweed Toggle */}
                  <button 
                      onClick={() => setShowTajweed(!showTajweed)}
                      className={`flex items-center justify-center backdrop-blur-md w-14 h-14 rounded-2xl font-semibold transition-all shadow-lg border ${showTajweed ? 'bg-emerald-50/20 border-emerald-400/50 text-white' : 'bg-black/20 border-white/10 text-emerald-100/70 hover:bg-black/30'}`}
                      title="Toggle Tajweed"
                  >
                      <span className="font-arabic text-xl leading-none pt-1">ت</span>
                  </button>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent mb-6 mx-auto max-w-[200px]" />
                <div className="font-arabic text-3xl tracking-wide opacity-90 text-emerald-50">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
              </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={`Search text...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-10 text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="px-4 space-y-4">
            {filteredVerses.length > 0 ? (
               viewMode === 'book' ? (
                 renderBookMode()
               ) : (
                 // List View
                 filteredVerses.map((verse) => {
                  let isCurrent = false;
                  if (currentSurah?.id === getContextId() && isPlaying) {
                     const currentMillis = currentTime * 1000;
                     const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
                     if (timing) {
                       isCurrent = currentMillis >= timing.timestamp_from && currentMillis <= timing.timestamp_to;
                     } else if (verseTimings.length === 0) {
                       isCurrent = true; // Fallback to highlighting all if no timings available
                     }
                  }
                  
                  const isBookmarked = bookmarks.includes(verse.verse_key);
                  
                  let verseProgress = audioProgress;
                  if (isCurrent && verseTimings.length > 0) {
                     const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
                     if (timing) {
                       const currentMillis = currentTime * 1000;
                       verseProgress = Math.min(100, Math.max(0, ((currentMillis - timing.timestamp_from) / (timing.timestamp_to - timing.timestamp_from)) * 100));
                     }
                  }

                  return (
                    <div 
                      key={verse.id} 
                      id={`verse-${verse.verse_key}`}
                      className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border transition-all duration-300 relative overflow-hidden group
                      ${isCurrent ? 'border-emerald-500 ring-4 ring-emerald-500/5 shadow-lg scale-[1.01]' : 'border-slate-100 dark:border-slate-700 hover:border-emerald-100 dark:hover:border-emerald-800 hover:shadow-md'}`}
                    >
                      
                      {/* Audio Progress Bar */}
                      {isCurrent && (
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-100 dark:bg-emerald-900/50 w-full z-10">
                          <div 
                            className="h-full bg-emerald-600 transition-all duration-100 ease-linear"
                            style={{ width: `${verseProgress}%` }}
                          />
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className={`flex justify-between items-start mb-6 rounded-xl p-2 transition-colors ${isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                        <div className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg shadow-sm transition-colors border ${isCurrent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-600'}`}>
                          {verse.verse_key.split(':')[1]}
                        </div>
                        <div className="flex items-center gap-1">
                          {isHifdhMode && (
                             <button
                               onClick={() => {
                                 setRevealedVerses(prev => {
                                   const newSet = new Set(prev);
                                   if (newSet.has(verse.verse_key)) {
                                     newSet.delete(verse.verse_key);
                                   } else {
                                     newSet.add(verse.verse_key);
                                   }
                                   return newSet;
                                 });
                               }}
                               className="px-3 py-1 text-xs font-bold rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 text-slate-600 dark:text-slate-300 transition-colors mr-2"
                             >
                               {revealedVerses.has(verse.verse_key) ? 'Hide' : 'Reveal'}
                             </button>
                          )}
                          <button 
                            onClick={() => openTafsir(verse)}
                            className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Read Tafsir"
                          >
                            <Book size={20} />
                          </button>
                          <button 
                            onClick={() => toggleBookmark(verse.verse_key)}
                            className={`p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors ${isBookmarked ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                            title="Bookmark"
                          >
                            <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                          </button>
                          <button 
                            onClick={() => handleShare(verse)}
                            className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Verse Content Layering based on Settings */}
                      {!settings.ayahBeforeTranslation && showTranslation && (
                        <div className="text-slate-600 dark:text-slate-400 leading-relaxed pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                            {translationName}
                          </p>
                          <div style={{ fontSize: `${settings.translationTextSize}px` }}>
                            {searchQuery ? 
                               highlightText(verse.translations?.[0]?.text.replace(/<[^>]*>/g, '') || '', searchQuery) 
                             : verse.translations?.[0]?.text.replace(/<[^>]*>/g, '')}
                          </div>
                        </div>
                      )}

                      {/* Arabic Text */}
                      <p 
                        onClick={() => {
                          if (isHifdhMode && !revealedVerses.has(verse.verse_key)) {
                            setRevealedVerses(prev => new Set(prev).add(verse.verse_key));
                          }
                        }}
                        className={`text-right font-arabic text-slate-800 dark:text-slate-200 leading-[2.6] mb-8 transition-all duration-300 ${isHifdhMode && !revealedVerses.has(verse.verse_key) ? 'filter blur-[8px] opacity-40 cursor-pointer select-none hover:opacity-60' : ''}`}
                        style={{ fontSize: `${fontSize}px`, fontFamily: settings.arabicFont === 'indopak' ? "'Lateef', 'Meiryo', serif" : undefined }}
                      >
                        {showTajweed && verse.text_uthmani_tajweed ? (
                          <span dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
                        ) : searchQuery ? (
                          highlightText(settings.arabicFont === 'indopak' ? (verse.text_indopak || verse.text_uthmani) : verse.text_uthmani, searchQuery)
                        ) : (
                          settings.arabicFont === 'indopak' ? (verse.text_indopak || verse.text_uthmani) : verse.text_uthmani
                        )}
                      </p>

                      {/* Translation (if ayah before translation) */}
                      {settings.ayahBeforeTranslation && showTranslation && (
                        <div className="text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-6">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                            {translationName}
                          </p>
                          <div style={{ fontSize: `${settings.translationTextSize}px` }}>
                            {searchQuery ? 
                               highlightText(verse.translations?.[0]?.text.replace(/<[^>]*>/g, '') || '', searchQuery) 
                             : verse.translations?.[0]?.text.replace(/<[^>]*>/g, '')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
               )
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
                  <Search size={40} />
                </div>
                <p className="text-slate-600 font-semibold text-lg">No verses found</p>
                <p className="text-sm text-slate-400 mt-2">Try adjusting your search query.</p>
              </div>
            )}
            
            {/* Load More Button */}
            {pagination && pagination.next_page && (
              <div className="py-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-full hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Loading...
                    </>
                  ) : (
                    'Load More Verses'
                  )}
                </button>
              </div>
            )}
            
            {filteredVerses.length > 0 && !pagination?.next_page && (
              <div className="text-center py-10">
                  <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full mb-3"></div>
                  <p className="text-slate-400 text-sm font-medium">End of Section</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tafsir Modal/Drawer */}
      {activeTafsirVerse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveTafsirVerse(null)} />
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col animate-slide-up relative border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-3xl">
              <div>
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg">Tafsir</h3>
                 <button 
                  onClick={() => setShowTafsirSelector(!showTafsirSelector)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5 hover:underline"
                 >
                   {tafsirList.find(t => t.id === selectedTafsirId)?.name || 'Select Tafsir'}
                   <ChevronDown size={14} />
                 </button>
              </div>
              <button onClick={() => setActiveTafsirVerse(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>

            {/* Tafsir Selector Dropdown (Absolute overlay) */}
            {showTafsirSelector && (
              <div className="absolute top-[70px] left-0 right-0 bottom-0 bg-white dark:bg-slate-900 z-20 overflow-y-auto p-4 animate-fade-in">
                 {Object.keys(groupedTafsirs).sort().map(lang => (
                   <div key={lang} className="mb-6">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{lang}</h4>
                     <div className="grid grid-cols-1 gap-1">
                       {groupedTafsirs[lang].map(tafsir => (
                         <button
                           key={tafsir.id}
                           onClick={() => {
                             setSelectedTafsirId(tafsir.id);
                             setShowTafsirSelector(false);
                             // Reload tafsir content
                             if(activeTafsirVerse) openTafsir(activeTafsirVerse, tafsir.id);
                           }}
                           className={`flex items-center justify-between px-3 py-3 rounded-lg text-left text-sm ${selectedTafsirId === tafsir.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                         >
                           <span>{tafsir.name} <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">- {tafsir.author_name}</span></span>
                           {selectedTafsirId === tafsir.id && <Check size={16} />}
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-arabic text-xl text-right leading-loose text-slate-800 dark:text-slate-200">{activeTafsirVerse.text_uthmani}</p>
              </div>
              
              {loadingTafsir ? (
                <div className="flex justify-center py-10"><Loading /></div>
              ) : (
                <div className="prose prose-emerald dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-7">
                   <div dangerouslySetInnerHTML={{ __html: tafsirContent }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <QuickTools 
        isOpen={showTools} 
        onClose={() => setShowTools(false)} 
        showTranslation={showTranslation}
        toggleTranslation={() => setShowTranslation(!showTranslation)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedReciter={settings.selectedReciter}
        setSelectedReciter={(r) => updateSetting('selectedReciter', r)}
        isHifdhMode={isHifdhMode}
        setIsHifdhMode={setIsHifdhMode}
      />

      {/* Share Modal */}
      {shareVerse && (
        <AyahImageShare 
          verse={shareVerse}
          translation={shareVerse.translations?.[0]?.text.replace(/<[^>]*>/g, '') || ''}
          contextName={getHeaderTitle()}
          onClose={() => setShareVerse(null)}
        />
      )}
    </div>
  );
};