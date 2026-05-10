import { useState, useEffect } from 'react';

export interface AppSettings {
  arabicMode: boolean;
  surahTranslatedName: boolean;
  nightMode: boolean;
  ayahTextSize: number;
  translationTextSize: number;
  ayahBeforeTranslation: boolean;
  selectedReciter: string;
  recitationApiId: number;
}

const defaultSettings: AppSettings = {
  arabicMode: false,
  surahTranslatedName: true,
  nightMode: false,
  ayahTextSize: 24,
  translationTextSize: 16,
  ayahBeforeTranslation: true,
  selectedReciter: 'mishari_al-afasy',
  recitationApiId: 7
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Apply night mode directly to HTML doc
    if (settings.nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch global event so other components can sync
    window.dispatchEvent(new Event('settings_updated'));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, setSettings };
};
