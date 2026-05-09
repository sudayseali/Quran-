import React from 'react';

export const Loading = () => (
  <div className="flex flex-col justify-center items-center py-24 gap-4 animate-fade-in">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-xl"></div>
      <div className="absolute inset-0 border-4 border-emerald-500 rounded-xl border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm tracking-widest uppercase animate-pulse">Loading</p>
  </div>
);