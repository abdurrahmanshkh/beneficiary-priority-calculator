'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INBPI_POLICY_V01, PolicyDimension } from '@/lib/policy/scoringPolicy';
import { DEFAULT_ZAKAT_POLICY } from '@/lib/policy/zakatPolicy';
import {
  BookOpen,
  Shield,
  HelpCircle,
  Coins,
  Activity,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
} from 'lucide-react';

export default function CriteriaPage() {
  const [activeDimension, setActiveDimension] = useState<string>('financial');
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Public Transparency Charter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Evaluation Criteria & Scoring Methodology
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Published assessment policy for the Il An Noor Beneficiary Priority Index ({INBPI_POLICY_V01.version}). Published so applicants, donors, and committee members understand exactly how allocation decisions are made.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Methodology</span>
          </button>
        </div>

        {/* 100-Point Dimensions Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-slate-100 text-xs">
          {INBPI_POLICY_V01.dimensions.map((dim) => (
            <button
              key={dim.id}
              onClick={() => setActiveDimension(dim.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeDimension === dim.id
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-600 text-emerald-950 font-bold'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{dim.name}</div>
              <div className="font-mono text-base font-bold text-emerald-800 mt-1">{dim.maxPoints} pts</div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5">{dim.criteria.length} criteria</div>
            </button>
          ))}
        </div>
      </div>

      {/* Philosophy & Purpose Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-emerald-950">
          <h2 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-700" />
            Decision-Support, Not Autonomous Replacement
          </h2>
          <p className="leading-relaxed">
            The Priority Index is a decision-support system designed to assist human trustees, social workers, and doctors. It does NOT make autonomous decisions. The score represents relative urgency, deprivation, and funding gap—never an absolute measurement of a human being&apos;s worth, dignity, or deservingness.
          </p>
        </div>

        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
          <h2 className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            No Arbitrary Category Stacking
          </h2>
          <p className="leading-relaxed">
            The system avoids crude point stacking (e.g. Widow = +10, PWD = +10, Orphan = +10). Instead, it measures the underlying vulnerabilities: functional limitations, caregiver dependency, lack of support, and income deficit. This prevents distorted scores and ensures equitable assessment.
          </p>
        </div>
      </div>

      {/* Active Dimension Criteria Inspection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {INBPI_POLICY_V01.dimensions
          .filter((d) => d.id === activeDimension)
          .map((dim) => (
            <div key={dim.id} className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif font-bold text-slate-900">{dim.name}</h2>
                  <span className="font-mono font-bold text-base bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Max: {dim.maxPoints} Points
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{dim.description}</p>
              </div>

              {/* Criteria List */}
              <div className="space-y-4">
                {dim.criteria.map((crit) => {
                  const isExpanded = expandedCriterion === crit.id;
                  return (
                    <div
                      key={crit.id}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedCriterion(isExpanded ? null : crit.id)}
                        className="w-full p-4 bg-slate-50/60 hover:bg-slate-50 text-left flex items-start justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">
                              {crit.id}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">{crit.name}</h3>
                          </div>
                          <p className="text-xs text-slate-600">{crit.question}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Max {crit.maxPoints} pts
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-slate-100 space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                              <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                                Why are we asking this?
                              </span>
                              <p className="text-slate-600 leading-relaxed">{crit.whyItMatters}</p>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                              <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider">
                                Required Verification
                              </span>
                              <p className="text-slate-600 leading-relaxed">{crit.verificationRequirement}</p>
                            </div>
                          </div>

                          {/* Options point table */}
                          {crit.options && crit.options.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="font-semibold text-slate-800 block text-[11px]">Configured Point Bands:</span>
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 font-semibold border-b">
                                    <tr>
                                      <th className="p-2">Condition / Band</th>
                                      <th className="p-2 text-right">Points</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {crit.options.map((opt, i) => (
                                      <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-2">{opt.label}</td>
                                        <td className="p-2 text-right font-mono font-bold text-emerald-800">
                                          +{opt.points}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Explicit "What is NOT Considered" Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-slate-900">What is Explicitly NOT Scored or Considered</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          To protect fairness, eliminate bias, and uphold humanitarian dignity, the Foundation strictly prohibits factoring the following attributes into general priority scoring:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {INBPI_POLICY_V01.nonScoredFactors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-rose-50/40 border border-rose-100 rounded-xl text-xs text-rose-950">
              <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                ✕
              </span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
