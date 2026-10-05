'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { Scale, ArrowLeft, X, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function CompareCasesPage() {
  const { cases, selectedCaseIdsForCompare, toggleCompareCase, clearCompareCases } = useAppStore();

  const selectedCases = cases.filter((c) => selectedCaseIdsForCompare.includes(c.id));

  // If fewer than 2 cases are selected, pick the top 2 cases as a default demonstration
  const displayCases = selectedCases.length >= 2 ? selectedCases : cases.slice(0, 3);

  // Generate dignified neutral comparative explanation
  const generateNeutralExplanation = () => {
    if (displayCases.length < 2) return '';
    const sorted = [...displayCases].sort(
      (a, b) => b.calculatedScore.totalScore - a.calculatedScore.totalScore
    );
    const top = sorted[0];
    const second = sorted[1];
    const diff = top.calculatedScore.totalScore - second.calculatedScore.totalScore;

    if (diff === 0) {
      return `Both cases have identical overall priority scores (${top.calculatedScore.totalScore}/100), reflecting comparable objective urgency and financial deprivation.`;
    }

    const reasons: string[] = [];
    if (top.calculatedScore.financialScore > second.calculatedScore.financialScore) {
      reasons.push('greater household income deficit');
    }
    if (top.calculatedScore.severityScore > second.calculatedScore.severityScore) {
      reasons.push('higher immediate time urgency');
    }
    if (top.calculatedScore.vulnerabilityScore > second.calculatedScore.vulnerabilityScore) {
      reasons.push('greater functional limitation and caregiver dependency');
    }
    if (top.calculatedScore.deprivationScore > second.calculatedScore.deprivationScore) {
      reasons.push('higher acute deprivation (food or housing precariousness)');
    }
    if (top.calculatedScore.supportGapScore > second.calculatedScore.supportGapScore) {
      reasons.push('lack of alternative government or family schemes');
    }

    const reasonText = reasons.length > 0 ? reasons.slice(0, 3).join(', ') : 'composite multidimensional criteria';
    return `Case ${top.id} (${top.fullName}) scores ${diff.toFixed(0)} points higher primarily due to ${reasonText}. The system does not measure moral worth, but relative urgency under limited resources.`;
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Side-by-Side Case Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Compare objective vulnerability dimensions and financial needs across {displayCases.length} cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCaseIdsForCompare.length > 0 && (
            <button
              onClick={clearCompareCases}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
            >
              Clear Selection
            </button>
          )}
          <Link
            href="/cases"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Select from Cases List
          </Link>
        </div>
      </div>

      {/* Neutral Differential Explanation Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
          <Scale className="w-4 h-4 text-emerald-700" />
          <span>Objective Comparative Analysis</span>
        </div>
        <p className="leading-relaxed text-emerald-900/90">{generateNeutralExplanation()}</p>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[700px]">
          {displayCases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{c.fullName}</h3>
                    <div className="text-xs text-slate-500 capitalize">{c.caseType} • Age {c.calculatedAge}</div>
                  </div>
                  {selectedCaseIdsForCompare.includes(c.id) && (
                    <button
                      onClick={() => toggleCompareCase(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <ScoreBadge score={c.calculatedScore.totalScore} priorityBand={c.calculatedScore.priorityBand} />
                  <StatusBadge status={c.status} size="sm" />
                </div>

                {/* Dimensional Scores */}
                <div className="space-y-2 pt-2 border-t text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Financial Need:</span>
                    <strong className="font-mono">{c.calculatedScore.financialScore} / 30</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Vulnerability:</span>
                    <strong className="font-mono">{c.calculatedScore.vulnerabilityScore} / 20</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Basic Deprivation:</span>
                    <strong className="font-mono">{c.calculatedScore.deprivationScore} / 15</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Severity & Urgency:</span>
                    <strong className="font-mono">{c.calculatedScore.severityScore} / 25</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Support Gap:</span>
                    <strong className="font-mono">{c.calculatedScore.supportGapScore} / 10</strong>
                  </div>
                </div>

                {/* Financial figures */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested:</span>
                    <strong className="font-mono">₹{c.requestedAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Minimum Effective:</span>
                    <strong className="font-mono text-emerald-800">
                      ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zakat Status:</span>
                    <strong className="text-teal-800">{c.zakat.preliminaryEligibility}</strong>
                  </div>
                </div>

                {/* Top Factor */}
                <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <strong className="block text-slate-800 text-[10px] uppercase font-semibold mb-0.5">
                    Primary Priority Driver
                  </strong>
                  {c.calculatedScore.topContributingFactors[0]}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/cases/${c.id}`}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold text-center block transition-colors"
                >
                  View Case Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
