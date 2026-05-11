import { openDB, IDBPDatabase } from 'idb';
import { Verse, Chapter, TranslationResource, TafsirInfo } from '../types';

const DB_NAME = 'QuranOfflineDB';
const DB_VERSION = 1;

export interface DownloadMetadata {
  id: string;
  type: 'quran' | 'tafsir' | 'audio';
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  totalChunks?: number;
  completedChunks?: number;
  error?: string;
  updatedAt: number;
}

export class DBService {
  private static instance: DBService;
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private constructor() {}

  static getInstance() {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  private getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Quran Text
          if (!db.objectStoreNames.contains('verses')) {
            const verseStore = db.createObjectStore('verses', { keyPath: 'id' });
            verseStore.createIndex('chapter_id', 'chapter_id');
            verseStore.createIndex('juz_number', 'juz_number');
            verseStore.createIndex('hizb_number', 'hizb_number');
            verseStore.createIndex('page_number', 'page_number');
            verseStore.createIndex('verse_key', 'verse_key');
          }

          if (!db.objectStoreNames.contains('chapters')) {
            db.createObjectStore('chapters', { keyPath: 'id' });
          }

          // Tafsirs
          if (!db.objectStoreNames.contains('tafsir_content')) {
            const tafsirStore = db.createObjectStore('tafsir_content', { keyPath: 'id' });
            tafsirStore.createIndex('tafsir_id', 'tafsir_id');
            tafsirStore.createIndex('verse_key', 'verse_key');
            tafsirStore.createIndex('tafsir_verse', ['tafsir_id', 'verse_key']);
          }

          // Metadata & Downloads
          if (!db.objectStoreNames.contains('downloads')) {
            db.createObjectStore('downloads', { keyPath: 'id' });
          }

          // Translations (text translations for verses)
          if (!db.objectStoreNames.contains('translations')) {
            const transStore = db.createObjectStore('translations', { keyPath: 'id' });
            transStore.createIndex('verse_id', 'verse_id');
            transStore.createIndex('resource_id', 'resource_id');
            transStore.createIndex('verse_resource', ['verse_id', 'resource_id']);
          }
        },
      });
    }
    return this.dbPromise;
  }

  // Chapter operations
  async saveChapters(chapters: Chapter[]) {
    const db = await this.getDB();
    const tx = db.transaction('chapters', 'readwrite');
    for (const chapter of chapters) {
      await tx.store.put(chapter);
    }
    await tx.done;
  }

  async getChapters(): Promise<Chapter[]> {
    const db = await this.getDB();
    return db.getAll('chapters');
  }

  // Verse operations
  async saveVerses(verses: any[]) {
    const db = await this.getDB();
    const tx = db.transaction('verses', 'readwrite');
    for (const verse of verses) {
      await tx.store.put(verse);
    }
    await tx.done;
  }

  async getVersesByChapter(chapterId: number): Promise<Verse[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('verses', 'chapter_id', chapterId);
  }

  async getVersesByJuz(juzId: number): Promise<Verse[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('verses', 'juz_number', juzId);
  }

  async getVersesByHizb(hizbId: number): Promise<Verse[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('verses', 'hizb_number', hizbId);
  }

  async getVersesByPage(pageId: number): Promise<Verse[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('verses', 'page_number', pageId);
  }

  async getAllVersesCount(): Promise<number> {
    const db = await this.getDB();
    return db.count('verses');
  }

  async getActiveVersesKeys(): Promise<string[]> {
    const db = await this.getDB();
    const result = await db.getAllKeys('verses');
    return result.map(String);
  }

  // Tafsir operations
  async saveTafsirContent(tafsirId: number, verseKey: string, content: any) {
    const db = await this.getDB();
    await db.put('tafsir_content', {
      id: `${tafsirId}_${verseKey}`,
      tafsir_id: tafsirId,
      verse_key: verseKey,
      content,
      updatedAt: Date.now()
    });
  }

  async getTafsirContent(tafsirId: number, verseKey: string) {
    const db = await this.getDB();
    const result = await db.get('tafsir_content', `${tafsirId}_${verseKey}`);
    return result?.content;
  }

  // Download tracking
  async saveDownloadMetadata(metadata: DownloadMetadata) {
    const db = await this.getDB();
    await db.put('downloads', { ...metadata, updatedAt: Date.now() });
  }

  async getDownloadMetadata(id: string): Promise<DownloadMetadata | undefined> {
    const db = await this.getDB();
    return db.get('downloads', id);
  }

  async getAllDownloads(): Promise<DownloadMetadata[]> {
    const db = await this.getDB();
    return db.getAll('downloads');
  }

  async deleteDownload(id: string) {
    const db = await this.getDB();
    await db.delete('downloads', id);
  }
}

export const dbService = DBService.getInstance();
