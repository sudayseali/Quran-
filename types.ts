export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  text_indopak?: string;
  text_imlaei?: string;
  translations?: Translation[];
  audio?: {
    url: string;
  };
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface TranslationResource {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface TafsirInfo {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface TafsirContent {
  resource_id: number;
  text: string;
}

export interface ApiChapterResponse {
  chapters: Chapter[];
}

export interface ApiVerseResponse {
  verses: Verse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export interface ApiTafsirListResponse {
  tafsirs: TafsirInfo[];
}

export interface ApiTranslationResourceResponse {
  translations: TranslationResource[];
}

// Navigation context to handle Surah, Hizb, Juz, Page, and Calendar views
export type NavigationContext = 
  | { type: 'surah'; data?: Chapter; id?: number }
  | { type: 'hizb'; id: number }
  | { type: 'juz'; id: number }
  | { type: 'page'; id: number }
  | { type: 'settings' }
  | { type: 'home' }
  | { type: 'tasbih' }
  | { type: 'prayertimes' };