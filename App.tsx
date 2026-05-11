import React, { useState, useEffect, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Menu, Moon, Sun } from 'lucide-react';
import { fetchChapters, getAudioUrl } from './services/quranService';
import { AudioProvider } from './hooks/useAudio';
import { AudioPlayer } from './components/AudioPlayer';
import { Chapter, NavigationContext } from './types';
import { ChapterRow } from './components/ChapterRow';
import { LastRead } from './components/LastRead';
import { BottomNav } from './components/BottomNav';
import { DetailView } from './components/DetailView';
import { Loading } from './components/Loading';
import { Sidebar } from './components/Sidebar';
import { LanguageSelector } from './components/LanguageSelector';
import { ReadingTracker } from './components/ReadingTracker';
import { DailyAyah } from './components/DailyAyah';
import { MoodQuran } from './components/MoodQuran';
import { AyahImageShare } from './components/AyahImageShare';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { GoToPageModal } from './components/GoToPageModal';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DownloadManager } from './components/DownloadManager';
import { TafsirSelector } from './components/TafsirSelector';
import { GlobalSearch } from './components/GlobalSearch';
import { useSettings } from './hooks/useSettings';
import { TasbihCounter } from './components/TasbihCounter';
import { PrayerTimes } from './components/PrayerTimes';
import { MoreVertical, HelpCircle, Info, ExternalLink, Hash, Book, Compass, Clock, Activity } from 'lucide-react';

// Main Home Component
const Home = ({ 
  onNavigate, 
  onOpenSidebar, 
  versesReadToday, 
  dailyGoal,
  lastRead,
  chapters,
  setChapters,
  onOpenGoToPage,
  onOpenSearch
}: { 
  onNavigate: (ctx: NavigationContext) => void, 
  onOpenSidebar: () => void,
  versesReadToday: number,
  dailyGoal: number,
  lastRead: any,
  chapters: Chapter[],
  setChapters: (chapters: Chapter[]) => void,
  onOpenGoToPage: () => void,
  onOpenSearch: () => void
}) => {
  const [loading, setLoading] = useState(chapters.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [listType, setListType] = useState<'surah' | 'hizb' | 'juz' | 'page'>('surah');
  const [shareVerse, setShareVerse] = useState<any>(null);
  const [showTopMenu, setShowTopMenu] = useState(false);

  useEffect(() => {
    const loadChapters = async () => {
      if (chapters.length > 0) return;
      try {
        const data = await fetchChapters();
        setChapters(data.chapters);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadChapters();
  }, [chapters]);

  const filteredChapters = chapters.filter(c => 
    c.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name_arabic.includes(searchQuery) ||
    String(c.id).includes(searchQuery)
  );

  const getTabLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar */}
        <div 
          className="px-6 py-4 flex justify-between items-center bg-[#F8FAFC]/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-transparent transition-all"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
        >
          <div className="flex items-center gap-3">
              <button 
                onClick={onOpenSidebar}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                id="sidebar-toggle"
                title="Menu"
              >
                  <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1" id="animated-icons-container">
                  <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm z-10 flex items-center justify-center">
                    <Book size={16} className="text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent tracking-tight ml-1">
                  Al Quran Pro
                </h1>
              </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowTopMenu(!showTopMenu)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <MoreVertical size={24} />
            </button>

            {showTopMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTopMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 py-1">
                  <button 
                    onClick={() => { onOpenGoToPage(); setShowTopMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Hash size={18} className="text-emerald-600" />
                    <span>Go to page</span>
                  </button>
                  <button 
                    onClick={() => { onNavigate({ type: 'settings' }); setShowTopMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Menu size={18} className="text-emerald-600" />
                    <span>Settings</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button onClick={() => { alert('Dhawaan la filayo...'); setShowTopMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <HelpCircle size={18} className="text-slate-400" />
                    <span>Help</span>
                  </button>
                  <button onClick={() => { alert('Dhawaan la filayo...'); setShowTopMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <Info size={18} className="text-slate-400" />
                    <span>About Us</span>
                  </button>
                  <button onClick={() => { alert('Dhawaan la filayo...'); setShowTopMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <ExternalLink size={18} className="text-slate-400" />
                    <span>Other apps</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <DailyAyah 
          onNavigate={onNavigate} 
          onShare={setShareVerse} 
        />

        <MoodQuran onShare={setShareVerse} onNavigate={onNavigate} />

        <ReadingTracker versesReadToday={versesReadToday} dailyGoal={dailyGoal} />
        <LastRead lastRead={lastRead} onNavigate={onNavigate} />

        {/* Quick Filter Tabs */}
        <div className="px-6 mb-6 overflow-x-auto scrollbar-hide py-1">
          <div className="flex space-x-2 bg-white dark:bg-slate-800/80 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl">
              {['surah', 'juz', 'hizb', 'page', 'tasbih'].map((type) => (
                <button 
                  key={type}
                  onClick={() => {
                     if (type === 'tasbih') {
                        onNavigate({ type: 'tasbih' });
                     } else {
                        setListType(type as any);
                     }
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${listType === type ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-900/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  {getTabLabel(type)}
                </button>
              ))}
          </div>
        </div>

        {/* Search */}
        {listType === 'surah' && (
          <div className="px-6 mb-4 sticky top-[72px] z-10 py-2 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-lg -mx-6 px-6">
            <div className="relative group max-w-3xl mx-auto">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search Surah Name, Translation..."
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={onOpenSearch}
                  className="absolute right-3 top-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-800"
                >
                  Global Search
                </button>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="px-6">
          {loading ? (
            <Loading />
          ) : (
            <>
              {listType === 'surah' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredChapters.map(chapter => (
                    <ChapterRow 
                      key={chapter.id} 
                      chapter={chapter} 
                      onClick={() => onNavigate({ type: 'surah', data: chapter })} 
                    />
                  ))}
                </div>
              )}

              {listType === 'juz' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(juzId => (
                    <button
                      key={juzId}
                      onClick={() => onNavigate({ type: 'juz', id: juzId })}
                      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">{juzId}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Juz</span>
                    </button>
                  ))}
                </div>
              )}

              {listType === 'page' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 604 }, (_, i) => i + 1).map(pageId => (
                    <button
                      key={pageId}
                      onClick={() => onNavigate({ type: 'page', id: pageId })}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">{pageId}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Page</span>
                    </button>
                  ))}
                </div>
              )}

              {listType === 'juz' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(juzId => (
                    <button
                      key={juzId}
                      onClick={() => onNavigate({ type: 'juz', id: juzId })}
                      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-1 group-hover:scale-110 transition-transform">{juzId}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Juz</span>
                    </button>
                  ))}
                </div>
              )}

              {listType === 'page' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {Array.from({ length: 604 }, (_, i) => i + 1).map(pageId => (
                    <button
                      key={pageId}
                      onClick={() => onNavigate({ type: 'page', id: pageId })}
                      className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base mb-1 group-hover:scale-110 transition-transform">{pageId}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Page</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {shareVerse && (
          <AyahImageShare 
             verse={shareVerse} 
             translation={shareVerse.translation} 
             contextName="Surah Al-Baqarah" 
             onClose={() => setShareVerse(null)} 
          />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [tafsirModalOpen, setTafsirModalOpen] = useState(false);

  useEffect(() => {
    (window as any).dispatchOpenTafsir = () => setTafsirModalOpen(true);
    return () => { delete (window as any).dispatchOpenTafsir; };
  }, []);
  const [activeTab, setActiveTab] = useState('home');
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isDownloaded, setIsDownloaded] = useState<boolean | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    const checkDownload = async () => {
      const { dbService } = await import('./services/dbService');
      const count = await dbService.getAllVersesCount();
      const isFull = localStorage.getItem('isQuranFullyDownloaded') === 'true';
      
      if (count >= 6236 && isFull) {
        setIsDownloaded(true);
      } else {
        localStorage.setItem('isQuranFullyDownloaded', 'false');
        setIsDownloaded(false);
      }
    };
    checkDownload();
  }, []);
  const isDarkMode = settings.nightMode;
  const toggleDarkMode = () => updateSetting('nightMode', !settings.nightMode);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleBookmark = (verseKey: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(verseKey) 
        ? prev.filter(k => k !== verseKey)
        : [...prev, verseKey];
      localStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  // Reading Tracker State
  const [versesReadToday, setVersesReadToday] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('quran_reading_tracker');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) return data.count;
    }
    return 0;
  });
  const dailyGoal = 50; // Default goal: 50 verses

  // Streak System
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('quran_streak');
    if (saved) {
      const data = JSON.parse(saved);
      const lastDate = new Date(data.lastDate);
      const today = new Date();
      // Calculate difference in days
      const diffTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 0) {
        return data; // Already read today
      } else if (diffDays === 1) {
        return data; // Read yesterday, streak intact
      } else {
        // Broken streak
        const newStreak = { count: 0, lastDate: today.toDateString() };
        localStorage.setItem('quran_streak', JSON.stringify(newStreak));
        return newStreak;
      }
    }
    return { count: 0, lastDate: new Date().toDateString() };
  });

  const incrementVersesRead = () => {
    setVersesReadToday(prev => {
      const newCount = prev + 1;
      
      // Update streak if it's the first verse read today
      if (prev === 0) {
        setStreak(s => {
           const today = new Date().toDateString();
           if (s.lastDate !== today) {
              const newStreak = { count: s.count + 1, lastDate: today };
              localStorage.setItem('quran_streak', JSON.stringify(newStreak));
              return newStreak;
           }
           return s;
        });
      }

      localStorage.setItem('quran_reading_tracker', JSON.stringify({
        date: new Date().toDateString(),
        count: newCount
      }));
      return newCount;
    });
  };

  const [lastRead, setLastRead] = useState<any>(() => {
    const saved = localStorage.getItem('quran_last_read');
    return saved ? JSON.parse(saved) : null;
  });

  const saveLastRead = (context: NavigationContext, verseKey: string) => {
    const data = { context, verseKey, timestamp: Date.now() };
    setLastRead(data);
    localStorage.setItem('quran_last_read', JSON.stringify(data));
  };

  // Global Audio State (Legacy removed, using AudioProvider)
  const [isGoToPageOpen, setIsGoToPageOpen] = useState(false);
  
  // Translation State
  // Default to 131 (Sahih International - English)
  const [selectedTranslationId, setSelectedTranslationId] = useState(() => {
    const saved = localStorage.getItem('selectedTranslationId');
    return saved ? parseInt(saved, 10) : 131;
  });
  const [selectedTranslationName, setSelectedTranslationName] = useState(() => {
    return localStorage.getItem('selectedTranslationName') || 'Sahih International';
  });
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  const handleTranslationSelect = (id: number, name: string) => {
    setSelectedTranslationId(id);
    setSelectedTranslationName(name);
    localStorage.setItem('selectedTranslationId', id.toString());
    localStorage.setItem('selectedTranslationName', name);
    updateSetting('translationId', id.toString());
    updateSetting('translationName', name);
  };

  // Helper to render content based on navigation
  const renderContent = () => {
    if (isDownloaded !== true) return null;

    if (navigationContext?.type === 'settings') {
      return <SettingsView onBack={() => setNavigationContext(null)} onOpenLanguage={() => setLanguageModalOpen(true)} />;
    }
    
    if (navigationContext?.type === 'tasbih') {
      return <TasbihCounter onNavigate={setNavigationContext} />;
    }

    if (navigationContext?.type === 'prayertimes') {
      return <PrayerTimes onNavigate={setNavigationContext} />;
    }

    if (navigationContext?.type === 'surah' || navigationContext?.type === 'juz' || navigationContext?.type === 'hizb' || navigationContext?.type === 'page') {
      return (
        <DetailView 
          context={navigationContext} 
          onBack={() => setNavigationContext(null)} 
          translationId={selectedTranslationId}
          translationName={selectedTranslationName}
          bookmarks={bookmarks}
          toggleBookmark={toggleBookmark}
          onVerseRead={incrementVersesRead}
          saveLastRead={saveLastRead}
        />
      );
    }

    return (
      <>
        {activeTab === 'bookmarks' ? (
          <BookmarksView 
            bookmarks={bookmarks}
            chapters={chapters}
            toggleBookmark={toggleBookmark}
            onNavigate={(ctx, verse) => {
               setNavigationContext(ctx);
               if (verse) {
                 setTimeout(() => {
                     const el = document.getElementById(`verse-${verse}`);
                     if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }, 500);
               }
            }}
            onBack={() => setActiveTab('home')}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView 
            versesReadToday={versesReadToday}
            dailyGoal={dailyGoal}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            streak={streak.count}
          />
        ) : (
          <Home 
            onNavigate={setNavigationContext} 
            onOpenSidebar={() => setSidebarOpen(true)}
            versesReadToday={versesReadToday}
            dailyGoal={dailyGoal}
            lastRead={lastRead}
            chapters={chapters}
            setChapters={setChapters}
            onOpenGoToPage={() => setIsGoToPageOpen(true)}
            onOpenSearch={() => setIsGlobalSearchOpen(true)}
          />
        )}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </>
    );
  };

  return (
    <AudioProvider>
      <HashRouter>
        <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors overflow-x-hidden">
            {isDownloaded === false && (
              <OnboardingScreen onComplete={() => setIsDownloaded(true)} />
            )}

            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
              onNavigate={setNavigationContext}
              onOpenLanguage={() => setLanguageModalOpen(true)}
              onOpenDownloads={() => setShowDownloadManager(true)}
              onOpenSearch={() => setIsGlobalSearchOpen(true)}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />

            <LanguageSelector 
              isOpen={languageModalOpen}
              onClose={() => setLanguageModalOpen(false)}
              selectedId={selectedTranslationId}
              onSelect={handleTranslationSelect}
            />

            <TafsirSelector 
              isOpen={tafsirModalOpen}
              onClose={() => setTafsirModalOpen(false)}
            />

            <GoToPageModal 
              isOpen={isGoToPageOpen}
              onClose={() => setIsGoToPageOpen(false)}
              onGo={(page) => setNavigationContext({ type: 'page', id: page })}
            />

            {showDownloadManager && (
              <DownloadManager onClose={() => setShowDownloadManager(false)} />
            )}

            {isGlobalSearchOpen && (
              <GlobalSearch 
                isOpen={isGlobalSearchOpen} 
                onClose={() => setIsGlobalSearchOpen(false)} 
                onNavigate={setNavigationContext} 
              />
            )}
            
            {renderContent()}

            <AudioPlayer />
        </div>
      </HashRouter>
    </AudioProvider>
  );
};

export default App;