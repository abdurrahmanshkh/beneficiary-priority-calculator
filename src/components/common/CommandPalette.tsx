'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { Search, PlusCircle, ListOrdered, Scale, Sliders, Shield, BookOpen, Download, User, ArrowRight, X } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, cases, exportBackup } = useAppStore();
  const [query, setQuery] = useState('');

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredCases = query.trim()
    ? cases.filter((c) =>
        c.fullName.toLowerCase().includes(query.toLowerCase()) ||
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.caseType.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const actions = [
    { label: 'Register New Beneficiary Case', icon: PlusCircle, path: '/cases/new' },
    { label: 'Open Priority Queue', icon: ListOrdered, path: '/queue' },
    { label: 'Side-by-Side Case Comparison', icon: Scale, path: '/compare' },
    { label: 'Fund Allocation Planner', icon: Sliders, path: '/funds' },
    { label: 'Evaluation Criteria (Public Methodology)', icon: BookOpen, path: '/criteria' },
    { label: 'Policy & Simulation Configuration', icon: Shield, path: '/policy' },
    { label: 'Download Encrypted Backup (JSON)', icon: Download, action: async () => { await exportBackup(); setCommandPaletteOpen(false); } },
  ];

  const handleNavigate = (path: string) => {
    setCommandPaletteOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a case ID, beneficiary name, phone, or command..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 text-slate-900"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Matched Cases */}
          {filteredCases.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                Matched Cases ({filteredCases.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleNavigate(`/cases/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <span>{c.fullName}</span>
                          <span className="text-xs font-mono font-normal text-slate-400">{c.id}</span>
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {c.caseType} • ₹{c.requestedAmount.toLocaleString('en-IN')} requested
                        </div>
                      </div>
                    </div>
                    <ScoreBadge score={c.calculatedScore.totalScore} priorityBand={c.calculatedScore.priorityBand} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
              Quick Actions & Navigation
            </div>
            <div className="space-y-1 mt-1">
              {actions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (act.action) act.action();
                      else if (act.path) handleNavigate(act.path);
                    }}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-left transition-colors text-slate-700 hover:text-slate-900 text-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <span>{act.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
