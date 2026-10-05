'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { ArrowLeft, Printer, Shield, HeartHandshake, CheckCircle2, FileText } from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';

export default function CaseReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { cases } = useAppStore();
  const caseData = cases.find((c) => c.id === resolvedParams.id);
  const [reportType, setReportType] = useState<'internal' | 'transparency'>('internal');

  if (!caseData) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Case not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header / Switcher Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href={`/cases/${caseData.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Detail</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReportType('internal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'internal' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Internal Assessment Report
            </button>
            <button
              onClick={() => setReportType('transparency')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'transparency' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Beneficiary Transparency Report
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-lg text-slate-900 print-page space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-800 text-white rounded-md flex items-center justify-center font-bold">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg tracking-wide text-slate-900">
                IL AN NOOR FOUNDATION
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Commercial Street, Tasker Town, Bangalore 560051 • contact@ilannoor.org
            </div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider pt-1">
              {reportType === 'internal'
                ? 'CONFIDENTIAL BENEFICIARY EVALUATION & ALLOCATION REPORT'
                : 'BENEFICIARY TRANSPARENCY & METHODOLOGY REPORT'}
            </div>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div>
              <span className="text-slate-400">Case ID: </span>
              <strong>{caseData.id}</strong>
            </div>
            <div>
              <span className="text-slate-400">Date: </span>
              <span>{new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-slate-400">Policy: </span>
              <span>{caseData.calculatedScore.policyVersion}</span>
            </div>
          </div>
        </div>

        {/* Beneficiary Header Strip */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Beneficiary Name</span>
            <strong className="text-sm text-slate-900">{caseData.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Age / Gender</span>
            <span>{caseData.calculatedAge} Years • {caseData.gender}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Domain / Category</span>
            <span className="capitalize">{caseData.caseType}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Overall Priority Score</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {caseData.calculatedScore.totalScore} / 100 ({caseData.calculatedScore.priorityBand})
            </span>
          </div>
        </div>

        {/* REPORT CONTENT: INTERNAL REPORT */}
        {reportType === 'internal' ? (
          <div className="space-y-6 text-xs">
            {/* 1. Need & Financial Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 border-b pb-1 text-sm uppercase tracking-wide">
                1. Case Summary & Financial Assessment
              </h3>
              <p className="text-slate-700 leading-relaxed">{caseData.narrativeDescription}</p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Monthly Dependable Income:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.dependableMonthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Monthly Survival Expenses:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.essentialMonthlyExpenses.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Coverage Ratio:</span>
                  <span className="font-mono font-bold">{Math.round(caseData.financial.coverageRatio * 100)}%</span>
                </div>
              </div>
            </div>

            {/* 2. Dimensional Score Breakdown */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 border-b pb-1 text-sm uppercase tracking-wide">
                2. Multidimensional INBPI Score Breakdown
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Evaluation Dimension</th>
                    <th className="p-2.5 text-center">Score Awarded</th>
                    <th className="p-2.5 text-center">Max Points</th>
                    <th className="p-2.5">Primary Assessment Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Financial Need</td>
                    <td className="p-2.5 text-center font-mono font-bold">{caseData.calculatedScore.financialScore}</td>
                    <td className="p-2.5 text-center text-slate-400">30</td>
                    <td className="p-2.5 text-slate-600">Essential needs coverage ratio and reserve depletion</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Vulnerability & Dependency</td>
                    <td className="p-2.5 text-center font-mono font-bold">{caseData.calculatedScore.vulnerabilityScore}</td>
                    <td className="p-2.5 text-center text-slate-400">20</td>
                    <td className="p-2.5 text-slate-600">Disability functional impact and dependent care load</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Basic-Necessity Deprivation</td>
                    <td className="p-2.5 text-center font-mono font-bold">{caseData.calculatedScore.deprivationScore}</td>
                    <td className="p-2.5 text-center text-slate-400">15</td>
                    <td className="p-2.5 text-slate-600">Food security, shelter stability, health access</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Severity & Urgency</td>
                    <td className="p-2.5 text-center font-mono font-bold">{caseData.calculatedScore.severityScore}</td>
                    <td className="p-2.5 text-center text-slate-400">25</td>
                    <td className="p-2.5 text-slate-600">Time urgency and consequence of delay</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Support & Funding Gap</td>
                    <td className="p-2.5 text-center font-mono font-bold">{caseData.calculatedScore.supportGapScore}</td>
                    <td className="p-2.5 text-center text-slate-400">10</td>
                    <td className="p-2.5 text-slate-600">Uncovered funding deficit and state scheme access</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2.5">TOTAL PRIORITY SCORE</td>
                    <td className="p-2.5 text-center font-mono text-emerald-800 text-sm">
                      {caseData.calculatedScore.totalScore}
                    </td>
                    <td className="p-2.5 text-center">100</td>
                    <td className="p-2.5 text-emerald-900">{caseData.calculatedScore.priorityBand} Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Decision Box & Signatures */}
            <div className="p-5 border-2 border-slate-900 rounded-xl space-y-3 mt-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Committee Allocation Decision & Audit Sign-Off
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[11px]">Recommended Action:</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.currentDecision?.decision || 'Under Committee Review'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Approved Grant Amount:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{(caseData.currentDecision?.approvedAmount || caseData.minimumEffectiveAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {caseData.currentDecision?.decisionReason && (
                <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded border">
                  <strong>Documented Rationale: </strong> {caseData.currentDecision.decisionReason}
                </div>
              )}

              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200 text-[10px] text-slate-400">
                <div>
                  <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">Assessing Staff</div>
                  <span>Il An Noor Field Officer</span>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">Verification Officer</div>
                  <span>Document Authentication</span>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">Committee Trustee</div>
                  <span>Final Authorization</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REPORT CONTENT: BENEFICIARY TRANSPARENCY REPORT */
          <div className="space-y-6 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
              <h3 className="font-bold text-sm">How your application was assessed</h3>
              <p className="text-xs">
                Il An Noor Foundation evaluates all requests using a transparent 100-point priority system to ensure decisions are fair, consistent, and compassionate. Your case received a priority score of <strong>{caseData.calculatedScore.totalScore}/100</strong> ({caseData.calculatedScore.priorityBand} Priority).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b pb-1 text-sm uppercase tracking-wide">
                Key Factors in Your Priority Score
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <div className="font-bold text-slate-900">Financial Hardship ({caseData.calculatedScore.financialScore}/30 pts)</div>
                  <p className="text-slate-600">
                    Calculated by assessing dependable household income against essential expenses (food, rent, vital medications) and available liquid savings.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <div className="font-bold text-slate-900">Vulnerability & Caregiving ({caseData.calculatedScore.vulnerabilityScore}/20 pts)</div>
                  <p className="text-slate-600">
                    Accounts for functional limitations, the number of young children or elderly dependents, and single caregiver responsibilities.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border space-y-1">
                  <div className="font-bold text-slate-900">Basic Needs & Urgency ({caseData.calculatedScore.severityScore + caseData.calculatedScore.deprivationScore}/40 pts)</div>
                  <p className="text-slate-600">
                    Reflects immediate risks such as food shortage, eviction notices, and clinical necessity of treatment without delay.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Your Right to Reassessment & Appeal</h4>
              <p className="text-slate-600 text-xs">
                If your household circumstances change (for example, income changes, health worsens, or a new expense occurs) or if you believe information was entered incorrectly, you have the right to request a formal reassessment. Please contact the Foundation office with supporting documents.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Il An Noor Foundation • Generated via INBPI System</span>
          <span>Confidential Humanitarian Document</span>
        </div>
      </div>
    </div>
  );
}
