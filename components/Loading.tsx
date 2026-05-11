import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const Loading = () => (
  <div className="flex flex-col justify-center items-center py-24 gap-4 animate-fade-in" id="loading-container">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"
        id="loading-spinner-bg"
      ></motion.div>
      <Logo size={48} className="z-10" />
    </div>
    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-widest uppercase animate-pulse">Loading</p>
  </div>
);
