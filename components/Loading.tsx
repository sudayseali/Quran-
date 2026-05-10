import React from 'react';
import { motion } from 'motion/react';

export const Loading = () => (
  <div className="flex flex-col justify-center items-center py-24 gap-4 animate-fade-in" id="loading-container">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 border-4 border-emerald-500/20 rounded-xl"
        id="loading-spinner-bg"
      ></motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 0.8, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-8 h-8 bg-emerald-600 rounded-lg shadow-lg flex items-center justify-center"
        id="loading-logo"
      >
        <div className="w-4 h-4 border-2 border-white/50 rounded-sm"></div>
      </motion.div>
    </div>
    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-widest uppercase animate-pulse">Loading</p>
  </div>
);