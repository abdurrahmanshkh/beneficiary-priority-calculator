import React from 'react';
import { PriorityBand } from '@/types/beneficiary';

interface ScoreBadgeProps {
  score: number;
  priorityBand?: PriorityBand;
  showMeter?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isProvisional?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  priorityBand,
  showMeter = false,
  size = 'md',
  isProvisional = false,
}) => {
  let band = priorityBand;
  if (!band) {
    if (score >= 85) band = 'Critical';
    else if (score >= 70) band = 'Very High';
    else if (score >= 55) band = 'High';
    else if (score >= 40) band = 'Moderate';
    else band = 'Lower';
  }

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  let dotColor = 'bg-slate-500';

  switch (band) {
    case 'Critical':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800';
      dotColor = 'bg-rose-600 animate-pulse';
      break;
    case 'Very High':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800';
      dotColor = 'bg-amber-600';
      break;
    case 'High':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800';
      dotColor = 'bg-emerald-600';
      break;
    case 'Moderate':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800';
      dotColor = 'bg-blue-600';
      break;
    case 'Lower':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
      dotColor = 'bg-slate-500';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2 font-medium',
    lg: 'text-base px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center border rounded-full font-mono ${colorClasses} ${sizeClasses}`}
        title={`Score: ${score}/100 (${band} Priority)${isProvisional ? ' - Provisional Assessment' : ''}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span>{score}</span>
        <span className="opacity-70 text-[0.85em]">/100</span>
        <span className="font-sans font-normal border-l border-current/20 pl-1.5 text-[0.9em]">
          {band}
        </span>
        {isProvisional && (
          <span className="bg-amber-200 text-amber-900 text-[10px] px-1 py-0.2 rounded font-sans uppercase tracking-wider">
            Prov
          </span>
        )}
      </span>

      {showMeter && (
        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 85
                ? 'bg-rose-500'
                : score >= 70
                ? 'bg-amber-500'
                : score >= 55
                ? 'bg-emerald-500'
                : score >= 40
                ? 'bg-blue-500'
                : 'bg-slate-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
