import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, ChevronUp, ChevronDown, Repeat, ListMusic, Timer } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export const AudioPlayer: React.FC = () => {
  const { 
    isPlaying, 
    currentSurah, 
    currentTime, 
    duration, 
    playbackSpeed, 
    togglePlay, 
    playNext, 
    playPrevious, 
    seek, 
    setSpeed,
    isBuffering,
    hasError,
    isLooping,
    toggleLoop
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentSurah) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'h-[90vh] rounded-t-[3rem]' : 'h-24'
        }`}
      >
        {/* Progress Bar (at very top when collapsed) */}
        {!isExpanded && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="max-w-md mx-auto h-full flex flex-col p-4">
          {/* Header (Expand/Collapse) */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center text-slate-400 dark:text-slate-500"
            >
              {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>

          {isExpanded ? (
            /* Expanded View */
            <div className="flex-1 flex flex-col items-center justify-around py-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-64 h-64 bg-emerald-100 dark:bg-emerald-900/30 rounded-[3rem] flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-8"
              >
                <div className="text-center">
                  <div className="text-6xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {currentSurah.id}
                  </div>
                  <div className="text-sm font-bold text-emerald-500/60 dark:text-emerald-400/40 uppercase tracking-widest">
                    Surah
                  </div>
                </div>
              </motion.div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                  {currentSurah.name_simple}
                </h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-2">
                  {currentSurah.name_arabic}
                </p>
                {hasError && (
                  <p className="text-red-500 font-medium text-sm animate-pulse">
                    Please check internet connection or download audio
                  </p>
                )}
              </div>

              {/* Progress Slider */}
              <div className="w-full space-y-4 mb-10">
                <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-600 border-2 border-white dark:border-slate-900 rounded-full shadow-md"
                    style={{ left: `calc(${progress}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 tracking-tighter">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full px-4 mb-12">
                <button 
                  onClick={() => setSpeed(playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5)}
                  className="p-3 text-slate-400 font-black text-xs active:scale-90 transition-all flex flex-col items-center gap-1"
                >
                  <Timer size={20} />
                  {playbackSpeed}x
                </button>

                <div className="flex items-center gap-8">
                  <button onClick={playPrevious} className="p-2 text-slate-800 dark:text-white active:scale-90 transition-all">
                    <SkipBack size={32} fill="currentColor" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    {isBuffering ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={36} fill="currentColor" />
                    ) : (
                      <Play size={36} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button onClick={playNext} className="p-2 text-slate-800 dark:text-white active:scale-90 transition-all">
                    <SkipForward size={32} fill="currentColor" />
                  </button>
                </div>

                <button 
                  onClick={toggleLoop}
                  className={`p-3 active:scale-90 transition-all ${isLooping ? 'text-emerald-500' : 'text-slate-400'}`}
                >
                  <Repeat size={20} />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed View */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 h-12 overflow-hidden">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                  {currentSurah.id}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate leading-tight">
                    {currentSurah.name_simple}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                    {hasError ? <span className="text-red-500">No internet</span> : (isPlaying ? 'Now Reciting' : 'Paused')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={playPrevious} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {isBuffering ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button onClick={playNext} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
