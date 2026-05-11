import React, { useRef, useState } from 'react';
import { X, Download, Share2, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface AyahImageShareProps {
  verse: any;
  translation: string;
  contextName: string;
  onClose: () => void;
}

const THEMES = [
  { id: 'emerald', name: 'Emerald', gradient: 'from-emerald-800 to-emerald-950', accent: 'text-emerald-300' },
  { id: 'gold', name: 'Gold', gradient: 'from-amber-700 to-amber-950', accent: 'text-amber-300' },
  { id: 'navy', name: 'Navy', gradient: 'from-slate-800 to-slate-950', accent: 'text-slate-300' },
  { id: 'minimal', name: 'Minimal', gradient: 'from-white to-slate-50', accent: 'text-slate-500', isLight: true }
];

export const AyahImageShare: React.FC<AyahImageShareProps> = ({ verse, translation, contextName, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    try {
      setIsGenerating(true);
      setError(null);
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.error('Error generating image', err);
      setError('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `Ayah-${verse.verse_key}.jpg`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleWhatsAppShare = async () => {
    const text = `"${verse.text_uthmani}"\n\n"${translation}"\n\n— ${contextName} (${verse.verse_key})\n\nRead more on Al Quran Pro`;
    // We can't share images via WhatsApp web intent reliably, so we share text. 
    // Or we rely on the user downloading and sharing.
    // If Web Share API is available, we try sharing the image file.

    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `ayah-${verse.verse_key}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
           title: 'Ayah from Al Quran',
           text: text,
           files: [file]
        });
      } else {
        // Fallback: copy text and open whatsapp
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        window.open(`https://wa.me/?text=${encodeURIComponent('I just downloaded an Ayah image. ' + text)}`, '_blank');
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">Share Ayah</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-800">
           {THEMES.map(theme => (
             <button
                key={theme.id}
                onClick={() => setActiveTheme(theme)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeTheme.id === theme.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
             >
               {theme.name}
             </button>
           ))}
        </div>

        {/* Preview Area */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-[50vh] flex justify-center items-center">
            
            {/* The actual card that gets converted to image */}
            <div 
              ref={cardRef}
              className={`bg-gradient-to-br ${activeTheme.gradient} p-8 rounded-2xl ${activeTheme.isLight ? 'text-slate-800 border p-7 border-slate-200' : 'text-white'} shadow-xl relative w-[340px] aspect-[4/5] flex flex-col justify-center overflow-hidden`}
            >
              {/* Decorative Background Pattern */}
              <div className={`absolute inset-0 ${activeTheme.isLight ? 'opacity-[0.03]' : 'opacity-10'} pointer-events-none`}
                   style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                 <div className="text-center mb-6">
                    <span className={`text-xs font-bold uppercase tracking-widest ${activeTheme.accent}`}>Al Quran Pro</span>
                 </div>

                 <p className={`font-arabic text-3xl leading-[2.2] text-center mb-6 ${activeTheme.isLight ? '' : 'drop-shadow-sm'}`} dir="rtl">
                   {verse.text_uthmani}
                 </p>

                 <p className={`text-sm leading-relaxed text-center mb-6 font-medium ${activeTheme.isLight ? 'text-slate-600' : 'text-white/90'} line-clamp-4`}>
                   "{translation}"
                 </p>

                 <div className={`mt-auto flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider ${activeTheme.accent} border-t ${activeTheme.isLight ? 'border-slate-200' : 'border-white/20'} pt-4 px-4 w-full`}>
                   <span>{contextName}</span>
                   <span className={`w-1 h-1 rounded-full ${activeTheme.isLight ? 'bg-slate-300' : 'bg-white/50'}`}></span>
                   <span>Ayah {verse.verse_key.split(':')[1]}</span>
                 </div>
              </div>
            </div>

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 flex justify-center items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Save Image
          </button>
          
          <button 
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? 'Copied Text!' : 'Share'}
          </button>
        </div>
        
        {error && <p className="text-xs text-red-500 text-center pb-2">{error}</p>}
      </div>
    </div>
  );
};
