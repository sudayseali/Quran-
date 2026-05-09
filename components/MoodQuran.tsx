import React, { useState } from 'react';
import { Heart, Smile, CloudRain, Shield, Compass, BatteryCharging, Share2, ArrowRight } from 'lucide-react';
import { NavigationContext } from '../types';

interface MoodQuranProps {
  onShare: (ayah: any, contextName: string) => void;
  onNavigate: (ctx: NavigationContext, specificVerse?: string) => void;
}

const MOODS = [
  { id: 'sad', label: 'Sad', icon: CloudRain, color: 'bg-blue-500', 
    ayah: {
      verse_key: "9:40",
      text_uthmani: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
      translation: "Do not be sad, indeed Allah is with us.",
      surahName: "Surah At-Tawbah",
      surahId: 9
    }
  },
  { id: 'anxious', label: 'Anxious', icon: Heart, color: 'bg-rose-500', 
    ayah: {
      verse_key: "13:28",
      text_uthmani: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Unquestionably, by the remembrance of Allah hearts are assured.",
      surahName: "Surah Ar-Ra'd",
      surahId: 13
    }
  },
  { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-amber-500', 
    ayah: {
      verse_key: "14:7",
      text_uthmani: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
      translation: "If you are grateful, I will surely increase you [in favor].",
      surahName: "Surah Ibrahim",
      surahId: 14
    }
  },
  { id: 'tired', label: 'Tired', icon: BatteryCharging, color: 'bg-indigo-500', 
    ayah: {
      verse_key: "94:5",
      text_uthmani: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "For indeed, with hardship [will be] ease.",
      surahName: "Surah Ash-Sharh",
      surahId: 94
    }
  },
  { id: 'lost', label: 'Lost', icon: Compass, color: 'bg-emerald-500', 
    ayah: {
      verse_key: "93:7",
      text_uthmani: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ",
      translation: "And He found you lost and guided [you].",
      surahName: "Surah Ad-Duhaa",
      surahId: 93
    }
  },
  { id: 'fearful', label: 'Fearful', icon: Shield, color: 'bg-slate-700', 
    ayah: {
      verse_key: "3:173",
      text_uthmani: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      translation: "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
      surahName: "Surah Ali 'Imran",
      surahId: 3
    }
  }
];

export const MoodQuran: React.FC<MoodQuranProps> = ({ onShare, onNavigate }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const activeMood = MOODS.find(m => m.id === selectedMood);

  return (
    <div className="px-6 mb-8 mt-4 animate-fade-in">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">How do you feel?</h2>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Mood Quran</span>
      </div>

      {!selectedMood ? (
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map(mood => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group active:scale-95"
              >
                <div className={`w-10 h-10 rounded-full ${mood.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={mood.color.replace('bg-', 'text-')} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{mood.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-700/50 relative overflow-hidden animate-slide-up">
           <button 
             onClick={() => setSelectedMood(null)}
             className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full transition-colors"
           >
             Close
           </button>
           
           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${activeMood?.color} bg-opacity-10 dark:bg-opacity-20 mb-6`}>
              {activeMood && <activeMood.icon size={16} className={activeMood.color.replace('bg-', 'text-')} />}
              <span className={`text-xs font-bold ${activeMood?.color.replace('bg-', 'text-')}`}>You feel {activeMood?.label.toLowerCase()}</span>
           </div>

           <p className="font-arabic text-3xl leading-[2.2] text-right mb-4 drop-shadow-sm text-slate-800 dark:text-white" dir="rtl">
              {activeMood?.ayah.text_uthmani}
           </p>

           <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
              "{activeMood?.ayah.translation}"
           </p>

           <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                {activeMood?.ayah.surahName} • {activeMood?.ayah.verse_key.split(':')[1]}
              </div>
              <div className="flex gap-2">
                <button 
                   onClick={() => onNavigate({ type: 'surah', id: activeMood?.ayah.surahId as number }, activeMood?.ayah.verse_key)}
                   className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full transition-colors"
                   title="Read Ayah"
                >
                   <ArrowRight size={18} />
                </button>
                <button 
                   onClick={() => onShare(activeMood?.ayah, activeMood?.ayah.surahName as string)}
                   className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                   <Share2 size={16} />
                   Share
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
