import React from 'react';
import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';

interface GlobalAudioPlayerProps {
  playingVerse: string | null;
  isPlaying: boolean;
  audioProgress: number;
  onTogglePlay: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  playingVerse,
  isPlaying,
  audioProgress,
  onTogglePlay,
  onClose,
  onNext,
  onPrev
}) => {
  if (!playingVerse) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2 animate-slide-up">
      <div className="max-w-3xl mx-auto backdrop-blur-2xl bg-slate-900/85 dark:bg-slate-800/85 text-white rounded-3xl p-3 shadow-2xl shadow-emerald-900/20 flex items-center justify-between border border-white/10 relative overflow-hidden">
        
        {/* Progress Bar Background */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-100 ease-linear rounded-r-full"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        <div className="flex items-center gap-4 pl-2">
          <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden border border-emerald-400/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20"></div>
            <span className="relative z-10 text-white drop-shadow-md">{playingVerse.split(':')[1]}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white drop-shadow-sm">Surah {playingVerse.split(':')[0]}</p>
            <p className="text-xs text-emerald-200/80 font-medium tracking-wider">Ayah {playingVerse.split(':')[1]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {onPrev && (
            <button onClick={onPrev} className="text-slate-300 hover:text-white transition-colors p-2 hidden sm:block">
              <SkipBack size={20} className="fill-current" />
            </button>
          )}
          
          <button 
            onClick={onTogglePlay}
            className="w-12 h-12 bg-white text-emerald-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-1" />}
          </button>

          {onNext && (
            <button onClick={onNext} className="text-slate-300 hover:text-white transition-colors p-2 hidden sm:block">
              <SkipForward size={20} className="fill-current" />
            </button>
          )}

          <div className="w-px h-8 bg-white/10 mx-2"></div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
