import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { fetchChapterAudioUrl } from './quranService';

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
    const fileName = `surah_${surahId}_${reciterId}.mp3`;
    
    let url = '';
    try {
       const saved = localStorage.getItem('app_settings');
       let recitationApiId = 7;
       if (saved) {
         const settings = JSON.parse(saved);
         if (settings.recitationApiId) recitationApiId = settings.recitationApiId;
       }
       const fetchedUrl = await fetchChapterAudioUrl(recitationApiId, surahId);
       if (fetchedUrl) url = fetchedUrl;
    } catch(e) {}

    if (!url) {
       const padId = surahId.toString().padStart(3, '0');
       url = `https://download.quranicaudio.com/quran/${reciterId}/${padId}.mp3`;
    }

    if (Capacitor.getPlatform() === 'web') {
      const cache = await caches.open('quran-audio-cache');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      if (total && response.body && onProgress) {
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              loaded += value.length;
              onProgress(Math.round((loaded / total) * 100));
              controller.enqueue(value);
            }
            controller.close();
            reader.releaseLock();
          }
        });
        const newResponse = new Response(stream, { headers: response.headers });
        const cacheKey = new URL(`/cache/audio/${fileName}`, location.origin).toString();
        await cache.put(cacheKey, newResponse);
        return cacheKey;
      } else {
        const cacheKey = new URL(`/cache/audio/${fileName}`, location.origin).toString();
        await cache.put(cacheKey, response.clone());
        return cacheKey;
      }
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
        const cacheKey = new URL(`/cache/audio/${fileName}`, location.origin).toString();
        const match = await cache.match(cacheKey);
        
        // Also check old hardcoded format for backwards compatibility
        if (!match) {
           const oldUrl = `https://download.quranicaudio.com/quran/${reciterId}/${surahId.toString().padStart(3, '0')}.mp3`;
           const oldMatch = await cache.match(oldUrl);
           return oldMatch ? oldUrl : null;
        }
        return cacheKey;
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
         const cacheKey = new URL(`/cache/audio/${fileName}`, location.origin).toString();
         await cache.delete(cacheKey);
         
         const oldUrl = `https://download.quranicaudio.com/quran/${reciterId}/${surahId.toString().padStart(3, '0')}.mp3`;
         await cache.delete(oldUrl);
         return;
     }

     await Filesystem.deleteFile({
         path: `audio/${fileName}`,
         directory: Directory.Data,
     });
  }
}

export const audioDownloadService = AudioDownloadService.getInstance();
