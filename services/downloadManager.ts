import { dbService, DownloadMetadata } from './dbService';
import { fetchChapters, fetchVersesByJuz, fetchTafsirContent, fetchTafsirByChapter } from './quranService';
import { Chapter, Verse } from '../types';

export class DownloadManager {
  private static instance: DownloadManager;
  private activeDownloads: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  // --- Quran Text Download ---

  async downloadQuranText(onProgress: (p: number, message: string) => void) {
    const downloadId = 'quran_text';
    if (this.activeDownloads.get(downloadId)) return;
    this.activeDownloads.set(downloadId, true);

    try {
      onProgress(0, 'Initializing Quran download...');
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'quran',
        status: 'downloading',
        progress: 0,
        updatedAt: Date.now()
      });

      // 1. Chapters
      onProgress(2, 'Fetching chapters list...');
      const chaptersData = await fetchChapters();
      await dbService.saveChapters(chaptersData.chapters);

      // 2. Juz by Juz
      const totalJuz = 30;
      for (let i = 1; i <= totalJuz; i++) {
        onProgress(Math.floor((i / (totalJuz + 1)) * 100), `Downloading Juz ${i}/30...`);
        
        let currentPage = 1;
        let hasMore = true;
        while (hasMore) {
          const data = await fetchVersesByJuz(i, currentPage);
          if (data.verses && data.verses.length > 0) {
            await dbService.saveVerses(data.verses);
          }
          
          if (!data.pagination || currentPage >= data.pagination.total_pages) {
            hasMore = false;
          } else {
            currentPage++;
            // Throttling
            await new Promise(r => setTimeout(r, 100));
          }
        }
        
        // Update partial progress in DB
        await dbService.saveDownloadMetadata({
          id: downloadId,
          type: 'quran',
          status: 'downloading',
          progress: Math.floor((i / totalJuz) * 100),
          completedChunks: i,
          totalChunks: totalJuz,
          updatedAt: Date.now()
        });
      }

      // 3. Validation
      onProgress(98, 'Validating data completeness...');
      const count = await dbService.getAllVersesCount();
      if (count < 6236) {
        throw new Error(`Incomplete data: Found only ${count} verses out of 6236. Please retry.`);
      }

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'quran',
        status: 'completed',
        progress: 100,
        updatedAt: Date.now()
      });
      localStorage.setItem('isQuranFullyDownloaded', 'true');
      onProgress(100, 'Quran download complete!');

    } catch (error: any) {
      console.error('Quran download failed:', error);
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'quran',
        status: 'failed',
        progress: 0,
        error: error.message || 'Unknown error',
        updatedAt: Date.now()
      });
      throw error;
    } finally {
      this.activeDownloads.set(downloadId, false);
    }
  }

  // --- Tafsir Download ---

  async downloadTafsir(tafsirId: number, languageName: string, onProgress: (p: number) => void) {
    const downloadId = `tafsir_${tafsirId}`;
    if (this.activeDownloads.get(downloadId)) return;
    this.activeDownloads.set(downloadId, true);

    try {
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'tafsir',
        status: 'downloading',
        progress: 0,
        updatedAt: Date.now()
      });

      const totalChapters = 114;
      for (let i = 1; i <= totalChapters; i++) {
        const tafsirs = await fetchTafsirByChapter(tafsirId, i);
        for (const t of tafsirs) {
          await dbService.saveTafsirContent(tafsirId, t.verse_key, t);
        }
        
        const progress = Math.floor((i / totalChapters) * 100);
        onProgress(progress);
        
        if (i % 10 === 0) {
          await dbService.saveDownloadMetadata({
            id: downloadId,
            type: 'tafsir',
            status: 'downloading',
            progress,
            updatedAt: Date.now()
          });
        }
        // Small delay
        await new Promise(r => setTimeout(r, 100));
      }

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'tafsir',
        status: 'completed',
        progress: 100,
        updatedAt: Date.now()
      });
      onProgress(100);

    } catch (error: any) {
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'tafsir',
        status: 'failed',
        progress: 0,
        error: error.message,
        updatedAt: Date.now()
      });
      throw error;
    } finally {
      this.activeDownloads.set(downloadId, false);
    }
  }

  // --- Audio --- 
  // Audio is handled by audioDownloadService primarily, 
  // but we can wrap it here to track in dbService if needed.
}

export const downloadManager = DownloadManager.getInstance();
