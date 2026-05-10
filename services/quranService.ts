import { ApiChapterResponse, ApiVerseResponse, ApiTafsirListResponse, TafsirContent, ApiTranslationResourceResponse } from '../types';
import { openDB, IDBPDatabase } from 'idb';
import DOMPurify from 'dompurify';

const BASE_URL = 'https://api.quran.com/api/v4';
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

export const checkIsDownloaded = async (key: string): Promise<boolean> => {
  try {
    const db = await getDB();
    const status = await db.get('downloads', key);
    return status === 'completed';
  } catch (e) {
    return false;
  }
};

export const setDownloadStatus = async (key: string, status: 'pending' | 'downloading' | 'completed') => {
  try {
    const db = await getDB();
    await db.put('downloads', status, key);
  } catch (e) {
    console.error('Error setting download status:', e);
  }
};

export const downloadFullQuranText = async (onProgress: (progress: number) => void) => {
  try {
    await setDownloadStatus('quran_text', 'downloading');
    
    // 1. Fetch Chapters List
    const chaptersData = await fetchChapters();
    const chapters = chaptersData.chapters;
    
    // 2. Download all verses for each chapter
    // We do it in chunks to avoid overwhelming the API and the device
    const totalChapters = chapters.length;
    let completedChapters = 0;

    for (const chapter of chapters) {
      // Small delay to prevent API rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Fetch all pages for this chapter
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const versesData = await fetchVerses(chapter.id, currentPage);
        if (!versesData.pagination || currentPage >= versesData.pagination.total_pages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }
      
      completedChapters++;
      onProgress(Math.floor((completedChapters / totalChapters) * 100));
    }

    await setDownloadStatus('quran_text', 'completed');
    localStorage.setItem('isQuranDownloaded', 'true');
  } catch (error) {
    await setDownloadStatus('quran_text', 'pending');
    throw error;
  }
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

export const fetchRecitations = async (): Promise<any> => {
  const cacheKey = 'recitations_list';
  const cachedData = await getFromCache<any>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(`${BASE_URL}/resources/recitations?language=en`);
    if (!response.ok) throw new Error('Failed to fetch recitations');
    const data = await response.json();
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
    const response = await fetch(`${BASE_URL}/chapter_recitations/${recitationId}/${chapterId}`);
    if (!response.ok) throw new Error('Failed to fetch chapter audio');
    const data = await response.json();
    const audioUrl = data?.audio_file?.audio_url;
    if (audioUrl) {
      await saveToCache(cacheKey, audioUrl);
    }
    return audioUrl;
  } catch (error) {
    throw error;
  }
};

export const fetchChapters = async (): Promise<ApiChapterResponse> => {
  const cacheKey = 'chapters_list';
  const cachedData = await getFromCache<ApiChapterResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(`${BASE_URL}/chapters?language=en`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    const data = await response.json();
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchVerses = async (chapterId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  const perPage = 50; 
  const cacheKey = `verses_chapter_${chapterId}_page_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses');
    const data = await response.json();
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
    const response = await fetch(
      `${BASE_URL}/verses/by_hizb/${hizbId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses by hizb');
    const data = await response.json();
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
    const response = await fetch(
      `${BASE_URL}/verses/by_juz/${juzId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses by juz');
    const data = await response.json();
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchVersesByPage = async (pageId: number, page: number = 1, translationId: number = 131): Promise<ApiVerseResponse> => {
  // Quran pages are typically small enough to fetch in one go, but we support pagination just in case
  const perPage = 50; 
  const cacheKey = `verses_page_${pageId}_p_${page}_tr_${translationId}_tajweed`;
  const cachedData = await getFromCache<ApiVerseResponse>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${BASE_URL}/verses/by_page/${pageId}?language=en&words=false&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses by page');
    const data = await response.json();
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
    const response = await fetch(`${BASE_URL}/resources/translations?language=en`);
    if (!response.ok) throw new Error('Failed to fetch translations list');
    const data = await response.json();
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
    const response = await fetch(`${BASE_URL}/resources/tafsirs`);
    if (!response.ok) throw new Error('Failed to fetch tafsirs');
    const data = await response.json();
    await saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchTafsirContent = async (tafsirId: number, verseKey: string): Promise<TafsirContent> => {
  const cacheKey = `tafsir_${tafsirId}_${verseKey}`;
  const cachedData = await getFromCache<TafsirContent>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!response.ok) throw new Error('Failed to fetch tafsir content');
    const data = await response.json();
    
    // API returns { tafsir: { ... } }
    const result = data.tafsir;
    await saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    throw error;
  }
};

export const searchQuran = async (query: string, page: number = 1): Promise<any> => {
  const response = await fetch(`${BASE_URL}/search?q=${query}&page=${page}&size=20&language=en`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
};

export const getAudioUrl = (verseKey: string, reciter: string = 'Alafasy_128kbps'): string => {
  const [surah, verse] = verseKey.split(':');
  const padSurah = surah.padStart(3, '0');
  const padVerse = verse.padStart(3, '0');
  return `https://everyayah.com/data/${reciter}/${padSurah}${padVerse}.mp3`;
};