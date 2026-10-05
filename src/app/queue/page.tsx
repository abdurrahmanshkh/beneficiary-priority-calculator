'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ListOrdered,
  Flame,
  AlertTriangle,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Clock,
  User,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { compareTwoCasesForTie } from '@/lib/scoring/scoringEngine';

export default function PriorityQueuePage() {
  const { cases } = useAppStore();
  const [prioritizationThreshold, setPrioritizationThreshold] = useState<number>(70);
  const [filterFund, setFilterFund] = useState<string>('all');

  // Filter and sort by priority score descending
  const queueCases = cases
    .filter((c) => {
      if (filterFund === 'all') return true;
      if (filterFund === 'Zakat') return c.zakat.preliminaryEligibility === 'Eligible';
      return c.fundEligibility.includes(filterFund as any);
    })
    .sort((a, b) => {
      // Emergency review first
      if (a.calculatedScore.emergencyTriggered !== b.calculatedScore.emergencyTriggered) {
        return a.calculatedScore.emergencyTriggered ? -1 : 1;
      }
      return b.calculatedScore.totalScore - a.calculatedScore.totalScore;
    });

  const prioritizedCases = queueCases.filter((c) => c.calculatedScore.totalScore >= prioritizationThreshold);
  const belowThresholdCases = queueCases.filter((c) => c.calculatedScore.totalScore < prioritizationThreshold);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Allocation Priority Queue</h1>
          <p className="text-xs text-slate-500">
            Rank-ordered cases according to INBPI multidimensional score and emergency criteria.
          </p>
        </div>

        {/* Fund Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs font-medium">
          {['all', 'Zakat', 'Medical', 'Education', 'General Welfare'].map((fund) => (
            <button
              key={fund}
              onClick={() => setFilterFund(fund)}
              className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                filterFund === fund ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {fund === 'all' ? 'All Funds' : fund}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Threshold Controller Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-900">
              Interactive Prioritization Cutoff Threshold:
            </span>
            <span className="font-mono font-bold text-emerald-800 text-sm">{prioritizationThreshold} pts</span>
          </div>

          <div className="text-xs text-slate-500">
            <strong className="text-emerald-800 font-mono">{prioritizedCases.length}</strong> cases prioritized •{' '}
            <span className="text-slate-400 font-mono">{belowThresholdCases.length}</span> meeting general eligibility
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="40"
            max="85"
            step="1"
            value={prioritizationThreshold}
            onChange={(e) => setPrioritizationThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Targeting Threshold (40 pts)</span>
          <span>Standard Prioritization (70 pts)</span>
          <span>Emergency / Critical (85 pts)</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">Rank</th>
                <th className="px-4 py-3.5">Beneficiary Case</th>
                <th className="px-4 py-3.5">Score</th>
                <th className="px-4 py-3.5">Key Priority Drivers</th>
                <th className="px-4 py-3.5">Requested Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {queueCases.map((c, index) => {
                const isPrioritized = c.calculatedScore.totalScore >= prioritizationThreshold;
                const nextCase = queueCases[index + 1];
                const tie = nextCase ? compareTwoCasesForTie(c, nextCase) : null;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      c.calculatedScore.emergencyTriggered
                        ? 'bg-rose-50/30'
                        : isPrioritized
                        ? 'bg-emerald-50/15'
                        : 'opacity-75'
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono font-bold text-slate-400 text-sm">
                        #{index + 1}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/cases/${c.id}`} className="font-bold text-slate-900 hover:text-emerald-700 text-sm">
                          {c.fullName}
                        </Link>
                        {c.calculatedScore.emergencyTriggered && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
                            Emergency
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.id} • {c.caseType} • {c.city}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <ScoreBadge
                        score={c.calculatedScore.totalScore}
                        priorityBand={c.calculatedScore.priorityBand}
                        isProvisional={c.calculatedScore.isProvisional}
                        showMeter
                      />
                    </td>

                    <td className="px-4 py-4 max-w-sm">
                      <div className="text-[11px] text-slate-700 font-medium">
                        {c.calculatedScore.topContributingFactors[0] || c.title}
                      </div>
                      {tie && tie.isSubstantivelyTied && (
                        <div className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          <span>Within ±2.0 pts of #{index + 2}: {tie.tieBreakReason}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono">
                      <strong className="text-slate-900">₹{c.requestedAmount.toLocaleString('en-IN')}</strong>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Min: ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={c.status} size="sm" />
                      {!isPrioritized && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Below cutoff</div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/cases/${c.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
