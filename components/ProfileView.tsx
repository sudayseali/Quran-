import React from 'react';
import { Award, Flame, BookOpen, Settings, Bell, ChevronRight, Moon, User, History } from 'lucide-react';
import { ReadingTracker } from './ReadingTracker';

interface ProfileViewProps {
  versesReadToday: number;
  dailyGoal: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  streak: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ versesReadToday, dailyGoal, isDarkMode, toggleDarkMode, streak }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 transition-colors animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar */}
        <div 
          className="px-6 py-4 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-20 border-b border-transparent transition-colors"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">
            My Profile
          </h1>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User size={32} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-800 dark:text-white">Guest User</h2>
               <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Reading daily since yesterday</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-500 mb-2 flex items-center justify-center">
                 <Flame size={20} className="fill-orange-500" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white">{streak}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Day Streak</p>
            </div>
            
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 mb-2 flex items-center justify-center">
                 <BookOpen size={20} className="fill-blue-500" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white">{versesReadToday}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Ayahs Read</p>
            </div>
          </div>

          <div className="mb-8">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Daily Goal</h3>
             <ReadingTracker versesReadToday={versesReadToday} dailyGoal={dailyGoal} compact />
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Settings</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
             
             <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                   <Moon size={20} />
                 </div>
                 <span className="font-semibold text-slate-700 dark:text-slate-200">Dark Mode</span>
               </div>
               <div className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}></div>
               </div>
             </button>

             <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                   <Bell size={20} />
                 </div>
                 <span className="font-semibold text-slate-700 dark:text-slate-200">Daily Reminders</span>
               </div>
               <ChevronRight size={20} className="text-slate-400" />
             </button>

             <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                   <Award size={20} />
                 </div>
                 <span className="font-semibold text-slate-700 dark:text-slate-200">Achievements</span>
               </div>
               <ChevronRight size={20} className="text-slate-400" />
             </button>

          </div>
        </div>
      </div>
    </div>
  );
};
