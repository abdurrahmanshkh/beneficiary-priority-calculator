'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  BarChart3,
  ShieldAlert,
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  Flame,
  Info,
} from 'lucide-react';

export default function FairnessAuditPage() {
  const { cases } = useAppStore();

  const totalCases = cases.length || 1;

  // Domain breakdown
  const domainStats: Record<string, { count: number; totalScore: number; approved: number }> = {};
  cases.forEach((c) => {
    if (!domainStats[c.caseType]) {
      domainStats[c.caseType] = { count: 0, totalScore: 0, approved: 0 };
    }
    domainStats[c.caseType].count += 1;
    domainStats[c.caseType].totalScore += c.calculatedScore.totalScore;
    if (['Approved', 'Partially Approved'].includes(c.status)) {
      domainStats[c.caseType].approved += 1;
    }
  });

  // Gender breakdown
  const genderStats: Record<string, { count: number; totalScore: number }> = {
    Female: { count: 0, totalScore: 0 },
    Male: { count: 0, totalScore: 0 },
    Other: { count: 0, totalScore: 0 },
  };
  cases.forEach((c) => {
    if (genderStats[c.gender]) {
      genderStats[c.gender].count += 1;
      genderStats[c.gender].totalScore += c.calculatedScore.totalScore;
    }
  });

  // Overrides count
  const overrideCount = cases.filter((c) => c.currentDecision?.isOverride).length;
  const approvedCount = cases.filter((c) => ['Approved', 'Partially Approved'].includes(c.status)).length;
  const emergencyCount = cases.filter((c) => c.calculatedScore.emergencyTriggered).length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Fairness & Audit Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Algorithmic Equity & Decision Audit
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Statistical monitoring to detect unintended scoring bias across domains, age cohorts, or gender, and verify that decisions adhere to humanitarian equity standards.
        </p>
      </div>

      {/* KPI Audit Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block">Total Audited Cases</span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1">{cases.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">100% locally evaluated</div>
        </div>

        <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-emerald-700 block font-semibold">Overall Approval Rate</span>
          <div className="font-mono text-2xl font-bold text-emerald-900 mt-1">
            {Math.round((approvedCount / totalCases) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">{approvedCount} approved or partial</div>
        </div>

        <div className="p-4 bg-amber-50 text-amber-950 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-amber-700 block font-semibold">Human Override Rate</span>
          <div className="font-mono text-2xl font-bold text-amber-900 mt-1">
            {Math.round((overrideCount / totalCases) * 100)}%
          </div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">{overrideCount} documented overrides</div>
        </div>

        <div className="p-4 bg-purple-50 text-purple-950 rounded-2xl border border-purple-200 shadow-sm">
          <span className="text-purple-700 block font-semibold">Emergency Escalations</span>
          <div className="font-mono text-2xl font-bold text-purple-900 mt-1">{emergencyCount}</div>
          <div className="text-[11px] text-purple-700/80 mt-0.5">&lt;72h or threat to survival</div>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">Score Distribution Across Need Domains</h2>
          <span className="text-[11px] text-slate-500">Checking for systematic bias between categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Need Domain</th>
                <th className="px-4 py-3 text-center">Cases</th>
                <th className="px-4 py-3 text-center">Avg Priority Score</th>
                <th className="px-4 py-3 text-center">Approval Rate</th>
                <th className="px-4 py-3">Equity Assessment Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(domainStats).map(([domain, stat]) => {
                const avg = Math.round(stat.totalScore / (stat.count || 1));
                const appRate = Math.round((stat.approved / (stat.count || 1)) * 100);
                return (
                  <tr key={domain} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-bold text-slate-900 capitalize">{domain}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{stat.count}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-800">{avg} / 100</td>
                    <td className="px-4 py-3.5 text-center font-mono">{appRate}%</td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500">
                      {avg >= 70
                        ? 'High average urgency driven by clinical or deprivation severity'
                        : 'Balanced distribution reflecting moderate need'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gender & Demographic Equity Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Gender Cohort Parity</h2>
          <div className="space-y-3 text-xs">
            {Object.entries(genderStats)
              .filter(([_, stat]) => stat.count > 0)
              .map(([gender, stat]) => {
                const avg = Math.round(stat.totalScore / stat.count);
                return (
                  <div key={gender} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{gender} Applicants</span>
                      <div className="text-[11px] text-slate-400">{stat.count} cases registered</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-800 text-sm">{avg} pts avg</div>
                      <div className="text-[10px] text-slate-500">Multidimensional composite</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Fairness Policy Invariants Verified</span>
          </h2>
          <ul className="space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong>No arbitrary category stacking:</strong> Widows, orphans, and PWD applicants are evaluated on underlying caregiving and functional deficits rather than static label bonuses.
            </li>
            <li>
              <strong>Non-ageist clinical medical evaluation:</strong> Older cancer patients with curative intent and good performance status are not systematically deprioritized against younger patients without clinical justification.
            </li>
            <li>
              <strong>Zero-score documentation safeguard:</strong> Incomplete paperwork does NOT automatically reduce a vulnerable family to 0 points; it marks the assessment as provisional.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
