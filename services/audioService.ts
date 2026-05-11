import { Howl } from 'howler';
import { Chapter } from '../types';
import { audioDownloadService } from './audioDownloadService';
import { fetchChapterAudioUrl } from './quranService';

export interface AudioState {
  isPlaying: boolean;
  currentSurah: Chapter | null;
  currentVerseKey: string | null;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  queue: Chapter[];
  currentIndex: number;
  isBuffering: boolean;
  hasError: boolean;
  isLooping: boolean;
}

class AudioService {
  private howl: Howl | null = null;
  private onStateChange: (state: Partial<AudioState>) => void = () => {};
  private currentSurah: Chapter | null = null;
  private queue: Chapter[] = [];
  private currentIndex: number = -1;
  private playbackSpeed: number = 1;
  private currentPlayId: number = 0;
  private loopSurah: boolean = false;
  private progressAnimationFrame: number | null = null;

  constructor() {
    this.setupMediaSession();
  }

  private startProgressTracker() {
    const updateProgress = () => {
      if (this.howl && this.howl.playing()) {
        const seek = this.howl.seek();
        if (typeof seek === 'number') {
          this.onStateChange({ currentTime: seek });
        }
      }
      this.progressAnimationFrame = requestAnimationFrame(updateProgress);
    };
    if (this.progressAnimationFrame !== null) {
      cancelAnimationFrame(this.progressAnimationFrame);
    }
    updateProgress();
  }

  private stopProgressTracker() {
    if (this.progressAnimationFrame !== null) {
      cancelAnimationFrame(this.progressAnimationFrame);
      this.progressAnimationFrame = null;
    }
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.max(0, (this.howl?.seek() as number || 0) - skipTime));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.min(this.howl?.duration() || 0, (this.howl?.seek() as number || 0) + skipTime));
      });
      
      // Update position state for better lock screen progress
      setInterval(() => {
        if (this.howl && this.howl.playing()) {
          navigator.mediaSession.setPositionState({
            duration: this.howl.duration(),
            playbackRate: this.playbackSpeed,
            position: this.howl.seek() as number,
          });
        }
      }, 1000);
    }
  }

  private updateMetadata() {
    if ('mediaSession' in navigator && this.currentSurah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentSurah.name_simple,
        artist: 'Sheikh Mishary Rashid Alafasy',
        album: 'The Holy Quran',
        artwork: [
          { src: 'https://api.quran.com/favicon.ico', sizes: '96x96', type: 'image/png' },
          { src: 'https://api.quran.com/favicon.ico', sizes: '512x512', type: 'image/png' },
        ],
      });
    }
  }

  setStateCallback(callback: (state: Partial<AudioState>) => void) {
    this.onStateChange = callback;
  }

  async playSurah(surah: Chapter, playlist: Chapter[] = []) {
    const playId = Date.now();
    this.currentPlayId = playId;

    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }

    this.currentSurah = surah;
    this.queue = playlist.length > 0 ? playlist : [surah];
    this.currentIndex = this.queue.findIndex(s => s.id === surah.id);
    
    // Get settings
    let reciterId = 'mishari_al-afasy';
    let recitationApiId = 7;
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.selectedReciter) reciterId = settings.selectedReciter;
        if (settings.recitationApiId) recitationApiId = settings.recitationApiId;
      }
    } catch(e) {}
    
    // Check for offline version first
    const localPath = await audioDownloadService.getLocalPath(surah.id, reciterId);
    
    // If a new play request was issued while we were fetching the path, abort.
    if (this.currentPlayId !== playId) {
      return;
    }
    
    let url;
    let urlList: string[] = [];
    if (localPath) {
        urlList = [localPath];
        console.log('Playing from local storage:', localPath);
    } else {
        try {
          const fetchedUrl = await fetchChapterAudioUrl(recitationApiId, surah.id);
          if (fetchedUrl) {
            urlList.push(fetchedUrl);
          }
        } catch(e) {
          console.error("Quran api hit limit, falling back", e);
        }
        
        // 100% free fallback
        const padId = surah.id.toString().padStart(3, '0');
        const fallbackUrl = `https://download.quranicaudio.com/quran/${reciterId}/${padId}.mp3`;
        urlList.push(fallbackUrl);
        console.log('Streaming from web URLs:', urlList);
    }
    
    // Abort again just in case fetchChapterAudioUrl took some time
    if (this.currentPlayId !== playId) {
      return;
    }

    if (this.howl) {
      this.howl.unload();
    }

    this.onStateChange({ isBuffering: true, hasError: false, currentSurah: surah, queue: this.queue, currentIndex: this.currentIndex });

    this.howl = new Howl({
      src: urlList,
      html5: true, // Crucial for background audio and larger files
      rate: this.playbackSpeed,
      onplay: () => {
        this.onStateChange({ isPlaying: true, isBuffering: false, hasError: false, duration: this.howl?.duration() });
        this.updateMetadata();
        this.startProgressTracker();
      },
      onpause: () => {
        this.onStateChange({ isPlaying: false });
        this.stopProgressTracker();
      },
      onstop: () => {
        this.onStateChange({ isPlaying: false });
        this.stopProgressTracker();
      },
      onend: () => {
        if (this.loopSurah) {
           this.howl?.play();
        } else {
           this.playNext();
        }
      },
      onload: () => this.onStateChange({ duration: this.howl?.duration() }),
      onseek: () => {
         const seek = this.howl?.seek();
         if (typeof seek === 'number') this.onStateChange({ currentTime: seek });
      },
      onloaderror: (id, err) => {
        console.error('Howl load error:', err);
        this.onStateChange({ isBuffering: false, isPlaying: false, hasError: true });
      },
      onplayerror: (id, err) => {
        console.error('Howl play error:', err);
        this.onStateChange({ isBuffering: false, isPlaying: false });
        this.howl?.once('unlock', () => {
          this.howl?.play();
        });
      }
    });

    try {
      this.howl.play();
    } catch (e) {
      console.error('Playback initiation error:', e);
      this.onStateChange({ isBuffering: false, isPlaying: false });
    }
  }

  play() {
    this.howl?.play();
  }

  pause() {
    this.howl?.pause();
  }

  seek(time: number) {
    if (this.howl) {
      this.howl.seek(time);
      this.onStateChange({ currentTime: time });
    }
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
    if (this.howl) {
      this.howl.rate(speed);
    }
    this.onStateChange({ playbackSpeed: speed });
  }

  playNext() {
    if (this.currentIndex < this.queue.length - 1) {
      this.playSurah(this.queue[this.currentIndex + 1], this.queue);
    }
  }

  playPrevious() {
    if (this.currentIndex > 0) {
      this.playSurah(this.queue[this.currentIndex - 1], this.queue);
    }
  }

  toggleLoop() {
    this.loopSurah = !this.loopSurah;
    this.onStateChange({ isLooping: this.loopSurah });
  }
}

export const audioService = new AudioService();
