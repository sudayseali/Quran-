import React from 'react';
import { X, Home, BookOpen, Settings, Globe, Share2, Heart, Compass, Clock, Calendar, Moon, Sun, Download, Search, HelpCircle, Info, ExternalLink } from 'lucide-react';
import { NavigationContext } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (ctx: NavigationContext | null) => void;
  onOpenLanguage: () => void;
  onOpenDownloads: () => void;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onOpenLanguage, onOpenDownloads, onOpenSearch, isDarkMode, toggleDarkMode }) => {
  const handleNav = (ctx: NavigationContext | null) => {
    onNavigate(ctx);
    onClose();
  };

  const handleLanguageClick = () => {
    onOpenLanguage();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Al Quran <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">Pro</span>
              </h2>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            <SidebarItem icon={Home} label="Home" active onClick={() => handleNav(null)} />
            <SidebarItem icon={Search} label="Global Search" onClick={() => { onOpenSearch(); onClose(); }} />
            <SidebarItem icon={Download} label="Offline Manager" onClick={() => { onOpenDownloads(); onClose(); }} />
            <SidebarItem icon={BookOpen} label="Reading History" onClick={onClose} />
            <SidebarItem icon={Globe} label="Language" onClick={handleLanguageClick} />
            
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={toggleDarkMode} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Dark Mode</span>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            <SidebarItem icon={Settings} label="Settings" onClick={() => handleNav({ type: 'settings' })} />
            
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">Community & Support</h3>
                <SidebarItem icon={Share2} label="Share App" onClick={async () => {
                   if (navigator.share) {
                     try {
                       await navigator.share({
                         title: 'Al Quran Pro',
                         text: 'Check out this amazing offline Quran app with audio and tafsir!',
                         url: window.location.href
                       });
                     } catch (e) {
                       console.log('Share failed');
                     }
                   } else {
                     alert('Sharing is not supported on this browser.');
                   }
                   onClose();
                }} />
                <SidebarItem icon={Heart} label="Support (WhatsApp: 0657864155 - No Voice Only Text)" onClick={() => {
                  window.open('https://api.whatsapp.com/send?phone=252657864155&text=Assalamu%20Alaikum%2C%20I%20need%20help%20with%20Al%20Quran%20Pro%20App', '_blank');
                  onClose();
                }} />
                <SidebarItem icon={HelpCircle} label="Help" onClick={() => { alert('Coming soon / dhawan la filayo'); onClose(); }} />
                <SidebarItem icon={Info} label="About Us" onClick={() => { alert('Coming soon / dhawan la filayo'); onClose(); }} />
                <SidebarItem icon={ExternalLink} label="Other Apps" onClick={() => { alert('Coming soon / dhawan la filayo'); onClose(); }} />
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">Version 2.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    <Icon size={20} />
    <span>{label}</span>
  </button>
);