import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

class AudioDownloadService {
  private static instance: AudioDownloadService;
  
  private constructor() {}

  static getInstance() {
    if (!AudioDownloadService.instance) {
      AudioDownloadService.instance = new AudioDownloadService();
    }
    return AudioDownloadService.instance;
  }

  async downloadSurah(surahId: number, reciterId: string, onProgress?: (p: number) => void): Promise<string> {
    const padId = surahId.toString().padStart(3, '0');
    const url = `https://download.quranicaudio.com/quran/${reciterId}/${padId}.mp3`;
    const fileName = `surah_${surahId}_${reciterId}.mp3`;

    if (Capacitor.getPlatform() === 'web') {
      // In web, we could use Cache API
      const cache = await caches.open('quran-audio-cache');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      // Note: Truly tracking progress in fetch requires readable stream, 
      // skipping for brevity or implement if critical.
      await cache.put(url, response.clone());
      return url; // Still use URL as key for cache
    }

    // Capacitor Native
    try {
        const downloadResult = await Filesystem.downloadFile({
            url,
            path: `audio/${fileName}`,
            directory: Directory.Data,
            recursive: true,
            progress: true,
        });

        return downloadResult.path || '';
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
  }

  async getLocalPath(surahId: number, reciterId: string): Promise<string | null> {
    const fileName = `surah_${surahId}_${reciterId}.mp3`;
    
    if (Capacitor.getPlatform() === 'web') {
        const cache = await caches.open('quran-audio-cache');
        const url = `https://download.quranicaudio.com/quran/${reciterId}/${surahId.toString().padStart(3, '0')}.mp3`;
        const match = await cache.match(url);
        return match ? url : null;
    }

    try {
        const result = await Filesystem.stat({
            path: `audio/${fileName}`,
            directory: Directory.Data,
        });
        
        const uri = await Filesystem.getUri({
            path: `audio/${fileName}`,
            directory: Directory.Data,
        });
        
        return Capacitor.convertFileSrc(uri.uri);
    } catch {
        return null;
    }
  }

  async deleteSurah(surahId: number, reciterId: string) {
     const fileName = `surah_${surahId}_${reciterId}.mp3`;
     if (Capacitor.getPlatform() === 'web') {
         const cache = await caches.open('quran-audio-cache');
         const url = `https://download.quranicaudio.com/quran/${reciterId}/${surahId.toString().padStart(3, '0')}.mp3`;
         await cache.delete(url);
         return;
     }

     await Filesystem.deleteFile({
         path: `audio/${fileName}`,
         directory: Directory.Data,
     });
  }
}

export const audioDownloadService = AudioDownloadService.getInstance();
