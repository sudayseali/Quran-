import React from 'react';
import { ArrowLeft, Moon, Sun, Type, Layout, Globe, BookOpen } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pb-10 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-30 border-b border-emerald-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center px-4 py-4">
          <button onClick={onBack} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-3">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-emerald-50">Settings</h2>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Appearance Settings */}
        <SettingsCard icon={Moon} title="Appearance">
          <ToggleItem 
            title="Night Mode" 
            subtitle="Faa'iidada: Waxay yareyneysaa iftiinka shaashadda si aadan indhaha ugu daalin xilliyada habeenkii ama meelaha mugdiga ah." 
            checked={settings.nightMode}
            onChange={(checked) => updateSetting('nightMode', checked)}
            icon={settings.nightMode ? Moon : Sun}
          />
        </SettingsCard>

        {/* Display Settings */}
        <SettingsCard icon={Layout} title="Display & Interface">
          <ToggleItem 
            title="Arabic Interface (الوضع العربي)" 
            subtitle="Faa'iidada: Waxaad ku dhex-dheelaneysaa app-ka iyadoo wajigiisa hore uu Af-Carabi yahay, taasoo ku fiican dadka fahmaya luuqada." 
            checked={settings.arabicMode}
            onChange={(checked) => updateSetting('arabicMode', checked)}
            icon={Globe}
          />
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
          <ToggleItem 
            title="Show Surah Translation" 
            subtitle="Faa'iidada: Waxay ku baraysaa macnaha magaca Suurad kasta (tusaale: Al-Baqarah -> The Cow) si aad sifiican ugu fahamto." 
            checked={settings.surahTranslatedName}
            onChange={(checked) => updateSetting('surahTranslatedName', checked)}
          />
        </SettingsCard>

        {/* Reading Preferences */}
        <SettingsCard icon={BookOpen} title="Reading Preferences">
          <ToggleItem 
            title="Ayah Before Translation" 
            subtitle="Faa'iidada: Quraanka Carabi ahaan ayaa lagu tusinayaa ugu horeyn qaybta sare si aad indhaha ugu hormariso dhigitaanka dhabta ah ka hor tarjumada." 
            checked={settings.ayahBeforeTranslation}
            onChange={(checked) => updateSetting('ayahBeforeTranslation', checked)}
          />
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
          
          <SliderItem 
            title="Arabic Font Size"
            subtitle="Faa'iidada: Wejiga xuruufta Quraanka weynee si aad sifiican ugu akhrisato haddii aadan si fiican wax u arkin."
            value={settings.ayahTextSize}
            min={18}
            max={50}
            onChange={(val) => updateSetting('ayahTextSize', val)}
            icon={Type}
            previewText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            fontClass="font-arabic"
          />
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

          <SliderItem 
            title="Translation Text Size" 
            subtitle="Faa'iidada: Wuxuu weyneyneyaa xarfaha tarjumada luuqadaha si ay kuugu sahlanaato fahamka iyo akhrisku."
            value={settings.translationTextSize}
            min={12}
            max={30}
            onChange={(val) => updateSetting('translationTextSize', val)}
            icon={Type}
            previewText="In the name of Allah, the Entirely Merciful, the Especially Merciful."
            fontClass="font-sans"
          />
        </SettingsCard>

      </div>
    </div>
  );
};

// Reusable Components

const SettingsCard: React.FC<{ icon: any; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
    <div className="p-2 sm:p-4">
      {children}
    </div>
  </div>
);

const ToggleItem: React.FC<{ title: string; subtitle: string; checked: boolean; onChange: (val: boolean) => void; icon?: any }> = ({ title, subtitle, checked, onChange, icon: Icon }) => (
  <label className="flex items-center justify-between p-3 sm:px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors select-none">
    <div className="flex items-center gap-4 flex-1 pr-4">
      {Icon && (
        <div className="text-slate-400 dark:text-slate-500">
          <Icon size={20} />
        </div>
      )}
      <div>
        <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{title}</h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug">{subtitle}</p>
      </div>
    </div>
    <div className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-slate-200 dark:border-slate-600 peer-checked:border-emerald-500"></div>
    </div>
  </label>
);

const SliderItem: React.FC<{ 
  title: string; 
  value: number; 
  min: number; 
  max: number; 
  onChange: (val: number) => void;
  icon: any;
  previewText?: string;
  fontClass?: string;
}> = ({ title, value, min, max, onChange, icon: Icon, previewText, fontClass }) => (
  <div className="p-3 sm:px-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-slate-400 dark:text-slate-500">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      </div>
    </div>
    
    <div className="flex items-center gap-4 py-2 px-2">
      <span className="text-xs font-medium text-slate-400">A</span>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      <span className="text-lg font-medium text-slate-600 dark:text-slate-300">A</span>
      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 w-8 text-right">{value}px</span>
    </div>

    {previewText && (
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center overflow-auto">
        <p 
          className={`text-slate-800 dark:text-slate-200 transition-all ${fontClass}`} 
          style={{ fontSize: `${value}px`, lineHeight: 1.6 }}
          dir={fontClass?.includes('arabic') ? 'rtl' : 'ltr'}
        >
          {previewText}
        </p>
      </div>
    )}
  </div>
);
