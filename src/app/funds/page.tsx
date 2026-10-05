'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Sliders,
  Coins,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';

export default function FundPlannerPage() {
  const { cases, fundBudgets, updateFundBudget } = useAppStore();

  const [selectedFund, setSelectedFund] = useState<keyof typeof fundBudgets>('Zakat');
  const [allocationMode, setAllocationMode] = useState<'minimum_effective' | 'full_requested'>('minimum_effective');

  // Filter cases eligible for selected fund
  const eligibleCases = cases
    .filter((c) => {
      if (selectedFund === 'Zakat') return c.zakat.preliminaryEligibility === 'Eligible';
      return c.fundEligibility.includes(selectedFund as any);
    })
    .sort((a, b) => {
      if (a.calculatedScore.emergencyTriggered !== b.calculatedScore.emergencyTriggered) {
        return a.calculatedScore.emergencyTriggered ? -1 : 1;
      }
      return b.calculatedScore.totalScore - a.calculatedScore.totalScore;
    });

  const availableBudget = fundBudgets[selectedFund] || 0;

  // Simulate Allocation Run
  let remainingBudget = availableBudget;
  const simulatedCases = eligibleCases.map((c) => {
    const cost =
      allocationMode === 'minimum_effective'
        ? c.minimumEffectiveAmount || c.requestedAmount
        : c.requestedAmount;

    if (remainingBudget >= cost) {
      remainingBudget -= cost;
      return {
        ...c,
        allocationStatus: 'Funded' as const,
        allocatedAmount: cost,
      };
    } else if (remainingBudget > 0 && allocationMode === 'minimum_effective') {
      const partial = remainingBudget;
      remainingBudget = 0;
      return {
        ...c,
        allocationStatus: 'Partial Funding' as const,
        allocatedAmount: partial,
      };
    } else {
      return {
        ...c,
        allocationStatus: 'Waitlisted (Budget Constrained)' as const,
        allocatedAmount: 0,
      };
    }
  });

  const fundedCount = simulatedCases.filter((c) => c.allocationStatus === 'Funded').length;
  const partialCount = simulatedCases.filter((c) => c.allocationStatus === 'Partial Funding').length;
  const waitlistCount = simulatedCases.filter((c) => c.allocationStatus === 'Waitlisted (Budget Constrained)').length;

  const totalRequestedForFund = eligibleCases.reduce((acc, c) => acc + c.requestedAmount, 0);
  const totalMinEffectiveForFund = eligibleCases.reduce((acc, c) => acc + (c.minimumEffectiveAmount || c.requestedAmount), 0);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Charitable Fund Allocation Planner</h1>
          <p className="text-xs text-slate-500">
            Simulate grant disbursements across restricted charitable accounts using minimum effective grants.
          </p>
        </div>

        {/* Allocation Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl text-xs font-medium">
          <button
            onClick={() => setAllocationMode('minimum_effective')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              allocationMode === 'minimum_effective'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Minimum Effective Grant (Recommended)
          </button>
          <button
            onClick={() => setAllocationMode('full_requested')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              allocationMode === 'full_requested'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Full Requested Amount
          </button>
        </div>
      </div>

      {/* Fund Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['Zakat', 'General Welfare', 'Medical', 'Education', 'Emergency'] as const).map((fund) => {
          const isSelected = selectedFund === fund;
          const budget = fundBudgets[fund];
          return (
            <button
              key={fund}
              onClick={() => setSelectedFund(fund)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
              }`}
            >
              <div className={`text-xs font-semibold ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                {fund} Fund
              </div>
              <div className="font-mono font-bold text-lg mt-1">₹{budget.toLocaleString('en-IN')}</div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-emerald-200/80' : 'text-slate-400'}`}>
                Click to plan
              </div>
            </button>
          );
        })}
      </div>

      {/* Budget Adjustment Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Configured Available Budget for {selectedFund}</span>
            </h2>
            <p className="text-xs text-slate-500">Update available pool to re-simulate allocation queue in real time.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Available Pool: ₹</span>
            <input
              type="number"
              min="0"
              step="10000"
              value={availableBudget}
              onChange={(e) => updateFundBudget(selectedFund, parseFloat(e.target.value) || 0)}
              className="w-40 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Allocation Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Eligible Cases:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{eligibleCases.length}</span>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl">
            <span className="text-emerald-700 block text-[10px] font-semibold">Simulated Funded:</span>
            <span className="font-mono font-bold text-sm">
              {fundedCount} {partialCount > 0 ? `+ ${partialCount} partial` : ''}
            </span>
          </div>

          <div className="p-3 bg-amber-50 text-amber-950 rounded-xl">
            <span className="text-amber-700 block text-[10px] font-semibold">Waitlisted (Need Funding):</span>
            <span className="font-mono font-bold text-sm">{waitlistCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Remaining Balance:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">₹{remainingBudget.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Simulated Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Simulated Allocation Sequence for {selectedFund} Fund
          </div>
          <span className="text-[11px] text-slate-500">Sorted strictly by priority score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Priority Score</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Min Effective</th>
                <th className="px-4 py-3">Simulated Award</th>
                <th className="px-4 py-3">Outcome Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {simulatedCases.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50 ${
                    c.allocationStatus === 'Funded'
                      ? 'bg-emerald-50/20'
                      : c.allocationStatus === 'Partial Funding'
                      ? 'bg-amber-50/20'
                      : 'opacity-70'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <Link href={`/cases/${c.id}`} className="font-bold text-slate-900 hover:text-emerald-700">
                      {c.fullName}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-mono">{c.id}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <ScoreBadge score={c.calculatedScore.totalScore} priorityBand={c.calculatedScore.priorityBand} size="sm" />
                  </td>

                  <td className="px-4 py-3.5 font-mono">₹{c.requestedAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-800">
                    ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                    ₹{c.allocatedAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-3.5">
                    {c.allocationStatus === 'Funded' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Funded
                      </span>
                    ) : c.allocationStatus === 'Partial Funding' ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                        Partial Award
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Eligible, Waitlisted for Budget</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
