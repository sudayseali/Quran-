import React from 'react';
import { X, Type, Globe, Check, LayoutList, BookOpen, Headphones, BrainCircuit } from 'lucide-react';

interface QuickToolsProps {
  isOpen: boolean;
  onClose: () => void;
  showTranslation: boolean;
  toggleTranslation: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  viewMode: 'list' | 'book';
  setViewMode: (mode: 'list' | 'book') => void;
  selectedReciter: string;
  setSelectedReciter: (r: string) => void;
  isHifdhMode?: boolean;
  setIsHifdhMode?: (mode: boolean) => void;
}

export const QuickTools: React.FC<QuickToolsProps> = ({ 
  isOpen, 
  onClose,
  showTranslation,
  toggleTranslation,
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  selectedReciter,
  setSelectedReciter,
  isHifdhMode,
  setIsHifdhMode
}) => {
  if (!isOpen) return null;

  const RECITERS = [
    { id: 'Alafasy_128kbps', name: 'Mishary Alafasy' },
    { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'Abdul Basit' },
    { id: 'Husary_128kbps', name: 'Mahmoud Al-Husary' },
    { id: 'Minshawy_Mujawwad_192kbps', name: 'Al-Minshawi' },
    { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'Abu Bakr Al-Shatri' }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 z-50 shadow-2xl animate-slide-up pb-safe ring-1 ring-slate-900/5 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 pt-2 pb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Display & Audio</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Audio Reciter Options */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
             <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Headphones size={18} className="text-emerald-600 dark:text-emerald-500" />
                <span>Audio Reciter</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RECITERS.map(reciter => (
                  <button
                    key={reciter.id}
                    onClick={() => setSelectedReciter(reciter.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-colors ${selectedReciter === reciter.id ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                  >
                     <span>{reciter.name}</span>
                     {selectedReciter === reciter.id && <Check size={16} />}
                  </button>
                ))}
             </div>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <LayoutList size={18} />
              <span>List View</span>
            </button>
            <button 
              onClick={() => setViewMode('book')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'book' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <BookOpen size={18} />
              <span>Book View</span>
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
               <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                 <Globe size={20} className="text-emerald-600 dark:text-emerald-500" />
                 <span className="font-medium">Show Translation</span>
               </div>
               <button 
                 onClick={toggleTranslation}
                 className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${showTranslation ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
             </div>

             {setIsHifdhMode && (
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                 <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                   <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-lg">
                     <BrainCircuit size={18} className="text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <div>
                     <span className="font-medium block leading-tight">Hifdh Mode</span>
                     <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Hide text to memorize</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setIsHifdhMode(!isHifdhMode)}
                   className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isHifdhMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                 >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isHifdhMode ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
             )}
          </div>

          {/* Font Size */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/50">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                   <Type size={16} /> Arabic Font Size
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">{fontSize}px</span>
             </div>
             <input 
                type="range" 
                min="24" 
                max="60" 
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>Small</span>
                <span>Extra Large</span>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};