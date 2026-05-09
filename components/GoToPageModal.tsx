import React, { useState } from 'react';
import { X, Hash, ChevronRight } from 'lucide-react';

interface GoToPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGo: (page: number) => void;
}

export const GoToPageModal: React.FC<GoToPageModalProps> = ({ isOpen, onClose, onGo }) => {
  const [page, setPage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= 604) {
      onGo(pageNum);
      onClose();
      setPage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl z-10 overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <Hash size={20} className="text-emerald-600" />
            Go to Page
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Enter Page Number (1-604)</label>
            <input 
              type="number"
              min="1"
              max="604"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="e.g. 580"
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-2xl font-bold text-center text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Open Page
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
