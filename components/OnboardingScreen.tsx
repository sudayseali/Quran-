import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { downloadManager } from '../services/downloadManager';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'downloading' | 'completed'>('welcome');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  const startDownload = async () => {
    setStep('downloading');
    setError(null);
    try {
      await downloadManager.downloadQuranText((p, msg) => {
        setProgress(p);
        setStatusMessage(msg);
      });
      setStep('completed');
    } catch (err: any) {
      setError(err.message || 'Download failed. Please check your internet connection and try again.');
      setStep('welcome');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm w-full"
          >
            <div className="flex justify-center mb-10">
              <Logo size={120} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
              Welcome to <span className="text-emerald-600">Al Quran Pro</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Prepare your Quran for a seamless offline experience. We'll download the text so you can read anytime, anywhere.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button 
              onClick={startDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <Download size={20} />
              Download Full Quran
            </button>
            
            <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">
              Approx. 5-10 MB
            </p>
          </motion.div>
        )}

        {step === 'downloading' && (
          <motion.div 
            key="downloading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm w-full"
          >
            <div className="relative w-32 h-32 mx-auto mb-10">
              <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * progress) / 100}
                  className="text-emerald-600 transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {progress}%
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Downloading Quran</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              {statusMessage}
            </p>

            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-widest uppercase">
              <Loader2 className="animate-spin" size={16} />
              Please wait...
            </div>
          </motion.div>
        )}

        {step === 'completed' && (
          <motion.div 
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm w-full"
          >
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={56} />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Finished!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-10">
              The Quran is now stored on your device. You can read it offline anytime.
            </p>

            <button 
              onClick={onComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              Open Quran
              <Sparkles size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
