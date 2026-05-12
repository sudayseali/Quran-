import { ApiChapterResponse, ApiVerseResponse, ApiTafsirListResponse, TafsirContent, ApiTranslationResourceResponse } from '../types';
import { openDB, IDBPDatabase } from 'idb';
import DOMPurify from 'dompurify';
import { dbService } from './dbService';
import { BACKUP_CHAPTERS } from '../src/data/backupChapters';

const DB_NAME = 'QuranAppDB';
const STORE_NAME = 'api_cache';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('downloads')) {
            db.createObjectStore('downloads');
          }
        }
      },
    });
  }
  return dbPromise;
};

const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    const cachedItem = await db.get(STORE_NAME, key);
    if (cachedItem) {
      return cachedItem.data;
    }
  } catch (error) {
    console.error('Error reading from IndexedDB:', error);
  }
  return null;
};

const saveToCache = async (key: string, data: any) => {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, { data, timestamp: Date.now() }, key);
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

const API_SOURCES = [
  { base: 'https://api.quran.com/api/v4', type: 'quran.com' },
  { base: 'https://api.alquran.cloud/v1', type: 'alquran.cloud' },
];

async function fetchWithFallback<T>(path: string, options: RequestInit = {}): Promise<T> {
  let lastError: any;
  
  for (const source of API_SOURCES) {
    try {
      const url = source.type === 'quran.com' 
        ? `${source.base}${path}`
        : transformRequest(source.base, path);
      
      if (!url) continue; // Skip if transformation was impossible
      
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status} from ${source.type}`);
      }
      
      const data = await response.json();
      return normalizeResponse(source.type, path, data);
    } catch (error) {
      console.warn(`Fetch failed from ${source.base}:`, error);
      lastError = error;
    }
  }
  
  throw lastError || new Error('All API sources failed');
}

// Simple path mapping for alquran.cloud
function transformRequest(base: string, path: string): string | null {
  if (path.includes('/chapters')) return `${base}/surah`;
  if (path.includes('/verses/by_chapter/')) {
    const chapterId = path.split('/').pop()?.split('?')[0];
    return `${base}/surah/${chapterId}/editions/quran-uthmani,en.sahih,en.transliteration`;
  }
  // alquran.cloud doesn't support the full API scope of quran.com easily without complex mapping.
  // For critical fallbacks (chapters/verses), it works.
  return null; 
}

function normalizeResponse(type: string, path: string, data: any): any {
  if (type === 'quran.com') return data;
  
  // Normalize alquran.cloud to quran.com format
  if (path.includes('/chapters')) {
    return {
      chapters: data.data.map((s: any) => ({
        id: s.number,
        name_simple: s.englishName,
        name_arabic: s.name,
        verses_count: s.numberOfAyahs,
        revelation_place: s.revelationType.toLowerCase()
      }))
    };
  }
  
  if (path.includes('/verses/by_chapter/')) {
    // data.data is an array of editions
    const uthmani = data.data[0].ayahs;
    const translation = data.data[1].ayahs;
    return {
      verses: uthmani.map((a: any, idx: number) => ({
        id: a.number,
        verse_key: `${a.surah.number}:${a.numberInSurah}`,
        text_uthmani: a.text,
        translations: [{ text: translation[idx].text, resource_id: 131 }]
      })),
      pagination: { total_pages: 1, current_page: 1 } // alquran.cloud returns full surah
    };
  }
  
  return data;
}

export const fetchRecitations = async (): Promise<any> => {
  const cacheKey = 'recitations_list';
  const cachedData = await getFromCache<any>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<any>('/resources/recitations?language=en');
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchChapterAudioUrl = async (recitationId: number, chapterId: number): Promise<string> => {
  const cacheKey = `chapter_audio_${recitationId}_${chapterId}`;
  const cachedData = await getFromCache<string>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<any>(`/chapter_recitations/${recitationId}/${chapterId}`);
    const audioUrl = data?.audio_file?.audio_url;
    if (audioUrl) {
      await saveToCache(cacheKey, audioUrl);
    }
    return audioUrl;
  } catch (error) {
    throw error;
  }
};

export const fetchChapterAudioTimings = async (recitationId: number, chapterId: number): Promise<any[]> => {
  const cacheKey = `chapter_timings_${recitationId}_${chapterId}`;
  const cachedData = await getFromCache<any[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    // This one uses a different base usually, but we'll try to keep it standard or use fallback if needed
    const response = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${recitationId}/audio_files?chapter=${chapterId}&segments=true`);
    if (!response.ok) throw new Error('Failed to fetch chapter timings');
    const data = await response.json();
    const timings = data?.audio_files?.[0]?.verse_timings || [];
    if (timings.length > 0) {
      await saveToCache(cacheKey, timings);
    }
    return timings;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchChapters = async (): Promise<ApiChapterResponse> => {
  const offlineChapters = await dbService.getChapters();
  if (offlineChapters.length > 0) {
    return { chapters: offlineChapters };
  }

  const cacheKey = 'chapters_list';
  const cachedData = await getFromCache<ApiChapterResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiChapterResponse>('/chapters?language=en');
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    console.warn("All API sources failed to fetch chapters. Using backup JSON.", error);
    return { chapters: BACKUP_CHAPTERS };
  }
};

export const fetchVerses = async (chapterId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  const perPage = 50; 
  
  // Try IndexedDB first if we have full download
  const isFull = localStorage.getItem('isQuranFullyDownloaded') === 'true';
  // Note: Only use DB if the translation matches what we stored 
  // (We assume the default translation 131 is what's downloaded)
  if (isFull && translationId === 131) {
    const allVerses = await dbService.getVersesByChapter(chapterId);
    if (allVerses.length > 0) {
      // Reconstruct pagination
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedVerses = allVerses.slice(start, end);
      return {
        verses: paginatedVerses,
        pagination: {
          per_page: perPage,
          current_page: page,
          next_page: end < allVerses.length ? page + 1 : null,
          total_pages: Math.ceil(allVerses.length / perPage),
          total_records: allVerses.length
        }
      };
    }
  }

  const cacheKey = `verses_chapter_${chapterId}_page_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiVerseResponse>(
      `/verses/by_chapter/${chapterId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed,text_indopak&page=${page}&per_page=${perPage}`
    );
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchVersesByHizb = async (hizbId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  const perPage = 50;
  const cacheKey = `verses_hizb_${hizbId}_page_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiVerseResponse>(
      `/verses/by_hizb/${hizbId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed,text_indopak&page=${page}&per_page=${perPage}`
    );
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchVersesByJuz = async (juzId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  const perPage = 50;
  const cacheKey = `verses_juz_${juzId}_page_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiVerseResponse>(
      `/verses/by_juz/${juzId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed,text_indopak&page=${page}&per_page=${perPage}`
    );
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchVersesByPage = async (pageId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  const perPage = 50; 
  const cacheKey = `verses_page_${pageId}_p_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiVerseResponse>(
      `/verses/by_page/${pageId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed,text_indopak&page=${page}&per_page=${perPage}`
    );
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTranslationResources = async (): Promise<ApiTranslationResourceResponse> => {
  const cacheKey = 'translation_resources_list';
  const cachedData = await getFromCache<ApiTranslationResourceResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiTranslationResourceResponse>('/resources/translations?language=en');
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTafsirList = async (): Promise<ApiTafsirListResponse> => {
  const cacheKey = 'tafsir_resources_list';
  const cachedData = await getFromCache<ApiTafsirListResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<ApiTafsirListResponse>('/resources/tafsirs');
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTafsirContent = async (tafsirId: number, verseKey: string): Promise<TafsirContent> => {
  const offlineTafsir = await dbService.getTafsirContent(tafsirId, verseKey);
  if (offlineTafsir) return offlineTafsir;

  const cacheKey = `tafsir_${tafsirId}_${verseKey}`;
  const cachedData = await getFromCache<TafsirContent>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const data = await fetchWithFallback<any>(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    const result = data.tafsir;
    await saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchTafsirByChapter = async (tafsirId: number, chapterId: number): Promise<any[]> => {
  try {
    const data = await fetchWithFallback<any>(`/tafsirs/${tafsirId}/by_chapter/${chapterId}`);
    return data.tafsirs || [];
  } catch (error) {
    throw error;
  }
};

export const searchQuran = async (query: string, page: number = 1): Promise<any> => {
  try {
    const data = await fetchWithFallback<any>(`/search?q=${query}&page=${page}&size=20&language=en`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAudioUrl = (verseKey: string, reciter: string = 'Alafasy_128kbps'): string => {
  const [surah, verse] = verseKey.split(':');
  const padSurah = surah.padStart(3, '0');
  const padVerse = verse.padStart(3, '0');
  return `https://everyayah.com/data/${reciter}/${padSurah}${padVerse}.mp3`;
};