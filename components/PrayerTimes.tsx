import React from 'react';
import { ArrowLeft, Clock, MapPin, Bell } from 'lucide-react';
import { NavigationContext } from '../types';

export const PrayerTimes = ({ onNavigate }: { onNavigate: (ctx: NavigationContext) => void }) => {
  const times = [
    { name: 'Fajr', time: '04:30 AM', active: false },
    { name: 'Sunrise', time: '06:00 AM', active: false },
    { name: 'Dhuhr', time: '12:15 PM', active: true },
    { name: 'Asr', time: '03:45 PM', active: false },
    { name: 'Maghrib', time: '06:30 PM', active: false },
    { name: 'Isha', time: '08:00 PM', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 transition-colors animate-fade-in">
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center gap-4 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
        <button 
          onClick={() => onNavigate({ type: 'home' })}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Prayer Times</h1>
      </div>

      <div className="p-6 max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-emerald-900/20">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={18} className="text-emerald-200" />
            <span className="font-medium text-emerald-50">Local Time (Auto)</span>
          </div>
          
          <p className="text-emerald-200 text-sm font-medium mb-1">Next Prayer</p>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black mb-1">Asr</h2>
              <p className="text-emerald-100 font-medium text-lg">in 2 hrs 15 mins</p>
            </div>
            <Clock size={48} className="text-emerald-400/50" />
          </div>
        </div>

        <div className="space-y-3">
          {times.map((prayer, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${prayer.active ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50'}`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-2 h-2 rounded-full ${prayer.active ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                 <span className={`font-bold text-lg ${prayer.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{prayer.name}</span>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`font-bold ${prayer.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{prayer.time}</span>
                 <button className={`p-2 rounded-full transition-colors ${prayer.active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300' : 'bg-slate-50 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                   <Bell size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
