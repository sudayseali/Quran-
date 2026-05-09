import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface ReadingTrackerProps {
  versesReadToday: number;
  dailyGoal: number;
  compact?: boolean;
}

export const ReadingTracker: React.FC<ReadingTrackerProps> = ({ versesReadToday, dailyGoal, compact }) => {
  const progress = Math.min((versesReadToday / dailyGoal) * 100, 100);
  const isCompleted = versesReadToday >= dailyGoal;

  return (
    <div className={compact ? "" : "px-6 mb-6"}>
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden ${compact ? 'shadow-none border-slate-100 dark:border-slate-700/50' : ''}`}>
        {/* Background Pattern */}
        <div className="absolute -right-6 -top-6 text-emerald-50 dark:text-emerald-900/20">
          <Target size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Daily Goal
                {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {versesReadToday} of {dailyGoal} verses read
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {isCompleted && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3">
              Masha'Allah! You've reached your daily goal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
