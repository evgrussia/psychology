import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showText = true,
}) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>Прогресс</span>
          <span>{current} из {total}</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
