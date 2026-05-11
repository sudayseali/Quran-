import React from 'react';
import { ArrowLeft, Moon, Sun, Type, Layout, Globe, BookOpen, Mic } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface SettingsViewProps {
  onBack: () => void;
  onOpenLanguage?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onOpenLanguage }) => {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pb-10 animate-fade-in">
      {/* Header */}
      <div 
        className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-30 border-b border-emerald-100 dark:border-slate-800 shadow-sm transition-colors"
        style={{ paddingTop: 'calc(env(safe-area-inset-top))' }}
      >
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
          {onOpenLanguage && (
            <>
              <div className="p-3 sm:px-4 flex flex-col gap-2">
                <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">Current Translation</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-1">Set your preferred translation / Select Language to download.</p>
                <button 
                  onClick={onOpenLanguage}
                  className="w-full flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="truncate pr-4">{settings.translationName || 'Select Translation'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold whitespace-nowrap">Change</span>
                </button>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
            </>
          )}

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

          <div className="p-3 sm:px-4 flex flex-col gap-2 mb-2">
            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">Arabic Font Style</h4>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug mb-2">Dooro nooca farta Quraanka (Uthmani ama Indo-Pak)</p>
            <select 
              className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              value={settings.arabicFont}
              onChange={(e) => updateSetting('arabicFont', e.target.value as any)}
            >
              <option value="uthmani">Uthmani (Madinah - Standard)</option>
              <option value="indopak">Indo-Pak (Aasiya - Majeedi)</option>
            </select>
          </div>
          
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

        {/* Audio Settings */}
        <SettingsCard icon={Mic} title="Audio Settings">
          <div className="p-3 sm:px-4 flex flex-col gap-2">
            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">Qaari (Reciter)</h4>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug mb-2">Fadlan dooro Qaari leh cod macaan (Viral Voices available!)</p>
            <select 
              className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              value={settings.recitationApiId}
              onChange={(e) => {
                const apiId = parseInt(e.target.value, 10);
                // Simple map to offline slug
                let slug = 'mishari_al-afasy';
                switch(apiId) {
                  case 7: slug = 'mishari_al-afasy'; break;
                  case 2: slug = 'abdulbasit_abdulsamad_murattal'; break;
                  case 4: slug = 'mahmoud_khalil_al_husary'; break;
                  case 11: slug = 'yasser_ad-dussary'; break;
                  case 3: slug = 'abdur-rahman_as-sudais'; break;
                  case 5: slug = 'abu_bakr_shatri'; break;
                  case 12: slug = 'maher_almuaiqly'; break;
                  case 9: slug = 'muhammad_siddiq_al-minshawi'; break;
                  case 54: slug = 'wadee_hammadi_al-yamani'; break;
                  case 51: slug = 'muhammad_ayyub'; break;
                }
                updateSetting('recitationApiId', apiId);
                updateSetting('selectedReciter', slug);
              }}
            >
              <option value={7}>Mishary Rashid Alafasy</option>
              <option value={2}>AbdulBaset AbdulSamad</option>
              <option value={11}>Yasser Al-Dosari (Viral & Emotional)</option>
              <option value={12}>Maher Al Muaiqly</option>
              <option value={54}>Wadih Al-Yamani (Macaan)</option>
              <option value={3}>Abdur-Rahman as-Sudais</option>
              <option value={5}>Abu Bakr Al Shatri</option>
              <option value={9}>Minshawi (Murattal)</option>
              <option value={4}>Mahmoud Khalil Al-Husary</option>
            </select>
          </div>
        </SettingsCard>

        {/* Support & Contact */}
        <SettingsCard icon={BookOpen} title="Support & Contact">
          <div className="p-3 sm:px-4 flex flex-col gap-2">
             <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">Caawin (Support)</h4>
             <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-2">
               Haddii aad qabto su'aal, cillad, ama talo, fadlan nagala soo xiriir WhatsApp. <br/>
               <span className="font-bold text-red-400">Hubi: Text kaliya soo dir, fadlan ha soo wicin (No Voice/Video Calls)</span>
             </p>
             <a 
               href="https://wa.me/252657864155?text=Asc%20walal%20waxaan%20rabaa%20caawin%20ku%20saabsan%20Al%20Quran%20Pro%20app..." 
               target="_blank" 
               rel="noopener noreferrer"
               className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
             >
                <Globe size={18} />
                Nagala Soo Xiriir WhatsApp
             </a>
          </div>
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
  subtitle?: string;
  value: number; 
  min: number; 
  max: number; 
  onChange: (val: number) => void;
  icon: any;
  previewText?: string;
  fontClass?: string;
}> = ({ title, subtitle, value, min, max, onChange, icon: Icon, previewText, fontClass }) => (
  <div className="p-3 sm:px-4">
    <div className="flex items-center gap-3 mb-1">
      <div className="text-slate-400 dark:text-slate-500">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      </div>
    </div>
    
    {subtitle && (
      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug mb-4 ml-10">{subtitle}</p>
    )}
    
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
