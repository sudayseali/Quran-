import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chapter } from '../types';
import { audioService, AudioState } from '../services/audioService';

interface AudioContextType extends AudioState {
  playSurah: (surah: Chapter, playlist?: Chapter[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentSurah: null,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    queue: [],
    currentIndex: -1,
    isBuffering: false,
  });

  useEffect(() => {
    audioService.setStateCallback((newState) => {
      setState((prev) => ({ ...prev, ...newState }));
    });
  }, []);

  const value: AudioContextType = {
    ...state,
    playSurah: (surah, playlist) => audioService.playSurah(surah, playlist),
    togglePlay: () => (state.isPlaying ? audioService.pause() : audioService.play()),
    playNext: () => audioService.playNext(),
    playPrevious: () => audioService.playPrevious(),
    seek: (time) => audioService.seek(time),
    setSpeed: (speed) => audioService.setSpeed(speed),
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
