'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useAppStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-emerald-950',
    error: 'border-rose-200 bg-white text-rose-950',
    info: 'border-sky-200 bg-white text-sky-950',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl ${borders[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
