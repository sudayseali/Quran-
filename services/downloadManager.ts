import { dbService, DownloadMetadata } from './dbService';
import { fetchChapters, fetchVersesByJuz, fetchTafsirByChapter, fetchVerses } from './quranService';
import { audioDownloadService } from './audioDownloadService';

const EXPECTED_VERSES_BY_SURAH: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 47, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

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

  // --- Quran Text Download (Improved) ---

  async downloadQuranText(onProgress: (p: number, message: string) => void) {
    const downloadId = 'quran_text';
    if (this.activeDownloads.get(downloadId)) return;
    this.activeDownloads.set(downloadId, true);

    try {
      onProgress(0, 'Initializing Quran download...');
      
      // Get existing status to resume
      const meta = await dbService.getDownloadMetadata(downloadId);
      let startSurah = 1;
      if (meta && meta.status === 'downloading' && meta.completedChunks) {
        startSurah = meta.completedChunks;
      }

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'quran',
        status: 'downloading',
        progress: meta?.progress || 0,
        updatedAt: Date.now()
      });

      // 1. Chapters (Always refresh)
      onProgress(2, 'Fetching chapters list...');
      const chaptersData = await fetchChapters();
      await dbService.saveChapters(chaptersData.chapters);

      // 2. Surah by Surah (More granular than Juz for easy validation)
      const totalSurahs = 114;
      for (let i = startSurah; i <= totalSurahs; i++) {
        onProgress(Math.floor((i / totalSurahs) * 100), `Surah ${i}/114: Downloading verses...`);
        
        let currentPage = 1;
        let hasMore = true;
        let surahVersesCollected = 0;

        while (hasMore) {
          const data = await fetchVerses(i, currentPage);
          if (data.verses && data.verses.length > 0) {
            await dbService.saveVerses(data.verses);
            surahVersesCollected += data.verses.length;
          }
          
          if (!data.pagination || currentPage >= data.pagination.total_pages) {
            hasMore = false;
          } else {
            currentPage++;
            await new Promise(r => setTimeout(r, 100)); // Throttling
          }
        }

        // Verify this surah's completeness
        const expectedCount = EXPECTED_VERSES_BY_SURAH[i];
        const dbCount = (await dbService.getVersesByChapter(i)).length;
        
        if (dbCount < expectedCount) {
           console.warn(`Surah ${i} incomplete in DB: ${dbCount}/${expectedCount}. Retrying Surah ${i}...`);
           i--; // Decrement to retry this surah
           await new Promise(r => setTimeout(r, 1000));
           continue; 
        }
        
        // Update status for resmue point
        await dbService.saveDownloadMetadata({
          id: downloadId,
          type: 'quran',
          status: 'downloading',
          progress: Math.floor((i / totalSurahs) * 100),
          completedChunks: i,
          totalChunks: totalSurahs,
          updatedAt: Date.now()
        });
      }

      // 3. Final Validation
      onProgress(98, 'Performing final validation...');
      const count = await dbService.getAllVersesCount();
      if (count < 6236) {
        throw new Error(`Incomplete Quran data: ${count}/6236 verses. Please retry.`);
      }

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'quran',
        status: 'completed',
        progress: 100,
        updatedAt: Date.now()
      });
      localStorage.setItem('isQuranFullyDownloaded', 'true');
      onProgress(100, 'Quran text fully downloaded and verified!');

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

  // --- Tafsir Download (Improved) ---

  async downloadTafsir(tafsirId: number, languageName: string, onProgress: (p: number) => void) {
    const downloadId = `tafsir_${tafsirId}`;
    if (this.activeDownloads.get(downloadId)) return;
    this.activeDownloads.set(downloadId, true);

    try {
      const meta = await dbService.getDownloadMetadata(downloadId);
      let startChapter = 1;
      if (meta && meta.status === 'downloading' && meta.completedChunks) {
        startChapter = meta.completedChunks;
      }

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'tafsir',
        status: 'downloading',
        progress: meta?.progress || 0,
        updatedAt: Date.now()
      });

      const totalChapters = 114;
      for (let i = startChapter; i <= totalChapters; i++) {
        // Retry logic for each chapter if needed can be added here
        try {
          const tafsirs = await fetchTafsirByChapter(tafsirId, i);
          for (const t of tafsirs) {
            await dbService.saveTafsirContent(tafsirId, t.verse_key, t);
          }
        } catch (chapterError) {
          console.error(`Failed to fetch Tafsir for chapter ${i}:`, chapterError);
          i--; // Retry
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        
        const progress = Math.floor((i / totalChapters) * 100);
        onProgress(progress);
        
        await dbService.saveDownloadMetadata({
          id: downloadId,
          type: 'tafsir',
          status: 'downloading',
          progress,
          completedChunks: i,
          totalChunks: totalChapters,
          updatedAt: Date.now()
        });
        
        await new Promise(r => setTimeout(r, 150));
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

  // --- Audio Download tracking ---
  async downloadAudioSurah(surahId: number, reciterId: string, onProgress: (p: number) => void) {
    const downloadId = `audio_${surahId}_${reciterId}`;
    if (this.activeDownloads.get(downloadId)) return;
    this.activeDownloads.set(downloadId, true);

    try {
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'audio',
        name: `Surah ${surahId} Audio`,
        status: 'downloading',
        progress: 0,
        updatedAt: Date.now()
      });

      await audioDownloadService.downloadSurah(surahId, reciterId, (p) => {
        onProgress(p);
        // Throttle DB updates for performance
        if (p % 10 === 0) {
          dbService.saveDownloadMetadata({
            id: downloadId,
            type: 'audio',
            status: 'downloading',
            progress: p,
            updatedAt: Date.now()
          });
        }
      });

      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'audio',
        status: 'completed',
        progress: 100,
        updatedAt: Date.now()
      });
      onProgress(100);
    } catch (error: any) {
      await dbService.saveDownloadMetadata({
        id: downloadId,
        type: 'audio',
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
}

export const downloadManager = DownloadManager.getInstance();
