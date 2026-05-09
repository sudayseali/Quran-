import React from 'react';
import { Home, BookOpen, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'bookmarks', icon: BookOpen, label: 'Read' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-sm mx-auto h-16 relative">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 group"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-b-full -mt-2"></div>
              )}
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors'}`}
              />
              <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};