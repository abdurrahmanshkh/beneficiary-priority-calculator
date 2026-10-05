'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { INBPI_POLICY_V01 } from '@/lib/policy/scoringPolicy';
import {
  Shield,
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';

export default function PolicyManagementPage() {
  const { cases } = useAppStore();

  // Simulation Weights State
  const [weights, setWeights] = useState({
    financial: 30,
    vulnerability: 20,
    deprivation: 15,
    severity: 25,
    supportGap: 10,
  });

  const totalSimWeight =
    weights.financial + weights.vulnerability + weights.deprivation + weights.severity + weights.supportGap;

  // Simulate scores with new weights
  const simulatedResults = cases.map((c) => {
    const rawFinRatio = c.calculatedScore.financialScore / 30;
    const rawVulnRatio = c.calculatedScore.vulnerabilityScore / 20;
    const rawDepRatio = c.calculatedScore.deprivationScore / 15;
    const rawSevRatio = c.calculatedScore.severityScore / 25;
    const rawGapRatio = c.calculatedScore.supportGapScore / 10;

    const simulatedTotal = Math.round(
      rawFinRatio * weights.financial +
        rawVulnRatio * weights.vulnerability +
        rawDepRatio * weights.deprivation +
        rawSevRatio * weights.severity +
        rawGapRatio * weights.supportGap
    );

    const delta = simulatedTotal - c.calculatedScore.totalScore;

    return {
      ...c,
      simulatedTotal,
      delta,
    };
  });

  const sortedOriginal = [...cases].sort((a, b) => b.calculatedScore.totalScore - a.calculatedScore.totalScore);
  const sortedSimulated = [...simulatedResults].sort((a, b) => b.simulatedTotal - a.simulatedTotal);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <Shield className="w-3.5 h-3.5" />
          <span>Policy Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Scoring Policy Configuration & Sensitivity Simulator
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Active Policy: <strong>{INBPI_POLICY_V01.title} ({INBPI_POLICY_V01.version})</strong> • Effective: {INBPI_POLICY_V01.effectiveDate}.
          Test how potential adjustments to dimensional weights affect beneficiary priority rankings before board approval.
        </p>
      </div>

      {/* Simulator Controller Box */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Sensitivity Analysis Simulator</span>
            </h2>
            <p className="text-xs text-slate-500">
              Hypothetical testing only. Official policy weights remain locked until formally versioned.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-xs px-2.5 py-1 rounded-full font-bold ${
                totalSimWeight === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800 animate-pulse'
              }`}
            >
              Sum: {totalSimWeight} / 100 pts
            </span>

            <button
              onClick={() =>
                setWeights({
                  financial: 30,
                  vulnerability: 20,
                  deprivation: 15,
                  severity: 25,
                  supportGap: 10,
                })
              }
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Financial Need</span>
              <span className="font-mono text-emerald-800">{weights.financial} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={weights.financial}
              onChange={(e) => setWeights({ ...weights, financial: parseInt(e.target.value) })}
              className="w-full accent-emerald-700"
            />
            <span className="text-[10px] text-slate-400">Baseline: 30 pts</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Vulnerability</span>
              <span className="font-mono text-emerald-800">{weights.vulnerability} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={weights.vulnerability}
              onChange={(e) => setWeights({ ...weights, vulnerability: parseInt(e.target.value) })}
              className="w-full accent-emerald-700"
            />
            <span className="text-[10px] text-slate-400">Baseline: 20 pts</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Deprivation</span>
              <span className="font-mono text-emerald-800">{weights.deprivation} pts</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.deprivation}
              onChange={(e) => setWeights({ ...weights, deprivation: parseInt(e.target.value) })}
              className="w-full accent-emerald-700"
            />
            <span className="text-[10px] text-slate-400">Baseline: 15 pts</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Severity & Urgency</span>
              <span className="font-mono text-emerald-800">{weights.severity} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={weights.severity}
              onChange={(e) => setWeights({ ...weights, severity: parseInt(e.target.value) })}
              className="w-full accent-emerald-700"
            />
            <span className="text-[10px] text-slate-400">Baseline: 25 pts</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Support Gap</span>
              <span className="font-mono text-emerald-800">{weights.supportGap} pts</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={weights.supportGap}
              onChange={(e) => setWeights({ ...weights, supportGap: parseInt(e.target.value) })}
              className="w-full accent-emerald-700"
            />
            <span className="text-[10px] text-slate-400">Baseline: 10 pts</span>
          </div>
        </div>
      </div>

      {/* Simulated Ranking Impact Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Queue Re-Ranking Impact Simulation</h3>
          <span className="text-[11px] text-slate-500">Live impact across {cases.length} registered cases</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3 text-center">Official Score</th>
                <th className="px-4 py-3 text-center">Simulated Score</th>
                <th className="px-4 py-3 text-center">Delta Impact</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3 text-right">Original Rank</th>
                <th className="px-4 py-3 text-right">Simulated Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedSimulated.map((c, simRank) => {
                const origRank = sortedOriginal.findIndex((o) => o.id === c.id) + 1;
                const rankDelta = origRank - (simRank + 1);

                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold">{c.calculatedScore.totalScore}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-800">{c.simulatedTotal}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">
                      {c.delta > 0 ? (
                        <span className="text-emerald-700">+{c.delta}</span>
                      ) : c.delta < 0 ? (
                        <span className="text-rose-700">{c.delta}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{c.caseType}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">#{origRank}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      #{simRank + 1}
                      {rankDelta > 0 && <span className="text-emerald-600 text-[10px] ml-1">▲{rankDelta}</span>}
                      {rankDelta < 0 && <span className="text-rose-600 text-[10px] ml-1">▼{Math.abs(rankDelta)}</span>}
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
