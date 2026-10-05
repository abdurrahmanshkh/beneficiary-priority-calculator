'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ArrowLeft,
  User,
  Users,
  Coins,
  Shield,
  Activity,
  AlertTriangle,
  Stethoscope,
  GraduationCap,
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  RotateCcw,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Scale,
  Sparkles,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { HumanDecision } from '@/types/beneficiary';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { cases, recordDecision, duplicateCase, deleteCase, reassessCase, showToast } = useAppStore();

  const caseData = cases.find((c) => c.id === resolvedParams.id);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'household'
    | 'financial'
    | 'vulnerability'
    | 'case_specific'
    | 'zakat'
    | 'verification'
    | 'score_trace'
    | 'decisions'
    | 'reassessments'
  >('overview');

  // Decision Modal State
  const [isDecisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<HumanDecision['decision']>('Approve full');
  const [approvedAmount, setApprovedAmount] = useState<number>(caseData?.minimumEffectiveAmount || 0);
  const [fundAllocated, setFundAllocated] = useState<HumanDecision['fundAllocated']>('General Welfare');
  const [decisionReason, setDecisionReason] = useState('');
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [decidedBy, setDecidedBy] = useState('Committee Chair');

  // Reassessment Modal State
  const [isReassessmentModalOpen, setReassessmentModalOpen] = useState(false);
  const [reassessmentReason, setReassessmentReason] = useState('');

  if (!caseData) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-4 my-12">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Case Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested case ID ({resolvedParams.id}) does not exist in local storage.
        </p>
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>
      </div>
    );
  }

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverride && !overrideReason.trim()) {
      showToast('A documented written reason is mandatory for all committee overrides.', 'error');
      return;
    }
    await recordDecision(caseData.id, {
      decision: decisionType,
      approvedAmount,
      fundAllocated,
      decisionReason,
      isOverride,
      overrideReason: isOverride ? overrideReason : undefined,
      decidedBy,
    });
    setDecisionModalOpen(false);
  };

  const handleReassessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassessmentReason.trim()) {
      showToast('Please state the reason for reassessment (e.g. income reduced, health worsened).', 'error');
      return;
    }
    await reassessCase(caseData.id, reassessmentReason, caseData, decidedBy);
    setReassessmentModalOpen(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete case ${caseData.id}? This action is irreversible.`)) {
      await deleteCase(caseData.id);
      router.push('/cases');
    }
  };

  const handleDuplicate = async () => {
    const dup = await duplicateCase(caseData.id);
    if (dup) router.push(`/cases/${dup.id}`);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back and Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cases</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDecisionModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Decision</span>
          </button>

          <button
            onClick={() => setReassessmentModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reassess</span>
          </button>

          <Link
            href={`/cases/${caseData.id}/report`}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF Reports</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5"
            title="Print Case Assessment"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
            title="Duplicate Case"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition-colors"
            title="Delete Case"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {caseData.id}
              </span>
              <StatusBadge status={caseData.status} />
              {caseData.calculatedScore.emergencyTriggered && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  Emergency Triggered
                </span>
              )}
              {caseData.zakat.preliminaryEligibility === 'Eligible' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                  Zakat Eligible
                </span>
              )}
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              {caseData.fullName}
            </h1>
            <p className="text-xs text-slate-500">
              Age {caseData.calculatedAge} • {caseData.gender} • {caseData.city}, {caseData.state} • Phone: {caseData.phone}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Priority Score</div>
              <div className="font-mono text-2xl font-bold text-slate-900">
                {caseData.calculatedScore.totalScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
            <ScoreBadge
              score={caseData.calculatedScore.totalScore}
              priorityBand={caseData.calculatedScore.priorityBand}
              size="lg"
              isProvisional={caseData.calculatedScore.isProvisional}
            />
          </div>
        </div>

        {/* Financial Requirement Strip */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Requested:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ₹{caseData.requestedAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Minimum Effective Grant:</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              ₹{(caseData.minimumEffectiveAmount || caseData.requestedAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Verified Total Need:</span>
            <span className="font-mono font-medium text-slate-700 text-sm">
              ₹{(caseData.verifiedRequirement || caseData.requestedAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Assessment Policy:</span>
            <span className="font-medium text-slate-700 text-sm">
              {caseData.calculatedScore.policyVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max text-xs font-medium text-slate-500">
          {[
            { id: 'overview', label: 'Case Overview', icon: User },
            { id: 'household', label: `Household (${caseData.household.length})`, icon: Users },
            { id: 'financial', label: 'Financial & Assets', icon: Coins },
            { id: 'vulnerability', label: 'Vulnerability & Needs', icon: Shield },
            { id: 'case_specific', label: 'Domain Details', icon: Activity },
            { id: 'zakat', label: 'Zakat Status', icon: Shield },
            { id: 'verification', label: 'Verification', icon: FileCheck2 },
            { id: 'score_trace', label: 'Score Trace (100 pts)', icon: Scale },
            { id: 'decisions', label: `Decisions (${caseData.decisionHistory?.length || 0})`, icon: CheckCircle2 },
            { id: 'reassessments', label: `History (${caseData.reassessmentHistory?.length || 0})`, icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 font-medium transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 font-semibold'
                    : 'border-transparent hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Case Background & Narrative</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {caseData.narrativeDescription || 'No narrative description entered.'}
                </p>
              </div>

              {/* Top Priority Factors */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Why this case received this score</h3>
                <div className="space-y-2">
                  {caseData.calculatedScore.topContributingFactors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Dimensional Scores Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Dimensional Score Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Financial Need:</span>
                  <span className="font-mono font-bold text-slate-900">{caseData.calculatedScore.financialScore} / 30</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Vulnerability & Dependency:</span>
                  <span className="font-mono font-bold text-slate-900">{caseData.calculatedScore.vulnerabilityScore} / 20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Basic Deprivation:</span>
                  <span className="font-mono font-bold text-slate-900">{caseData.calculatedScore.deprivationScore} / 15</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Severity & Urgency:</span>
                  <span className="font-mono font-bold text-slate-900">{caseData.calculatedScore.severityScore} / 25</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Support & Funding Gap:</span>
                  <span className="font-mono font-bold text-slate-900">{caseData.calculatedScore.supportGapScore} / 10</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('score_trace')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium text-center transition-colors block"
                >
                  View Full 100-Point Audit Trace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCORE TRACE TAB (Full 100-point transparent calculation trace) */}
        {activeTab === 'score_trace' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Machine-Readable Calculation Trace</h3>
              <p className="text-xs text-slate-500">
                Every point awarded is auditable against the published {caseData.calculatedScore.policyVersion} policy. Zero hidden bonuses or undocumented modifiers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Dimension</th>
                    <th className="px-4 py-3">Criterion</th>
                    <th className="px-4 py-3">Declared / Assessed Value</th>
                    <th className="px-4 py-3 text-center">Points</th>
                    <th className="px-4 py-3">Policy Rationale & Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {caseData.calculatedScore.scoreTrace.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-900">{t.dimension}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{t.criterionName}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{t.answer}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          +{t.points} / {t.maxPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        {t.explanation}
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">[{t.policyReference}]</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HOUSEHOLD TAB */}
        {activeTab === 'household' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Household Composition Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Relationship</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Employment</th>
                    <th className="px-4 py-3">Monthly Income</th>
                    <th className="px-4 py-3">Dependency Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseData.household.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{m.name}</td>
                      <td className="px-4 py-3 text-slate-600">{m.relationship}</td>
                      <td className="px-4 py-3">{m.age} yrs</td>
                      <td className="px-4 py-3">{m.employmentStatus}</td>
                      <td className="px-4 py-3 font-mono">₹{m.monthlyIncome.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        {m.isDependent ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium">
                            Dependent
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">
                            Earner
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Monthly Income & Expenses</h3>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span>Dependable Monthly Income:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.dependableMonthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Essential Expenses:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.essentialMonthlyExpenses.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold text-emerald-800">
                  <span>Coverage Ratio:</span>
                  <span>{Math.round(caseData.financial.coverageRatio * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Accessible Reserves & Debt</h3>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span>Liquid Cash & Bank Reserves:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.liquidAssets.totalLiquid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserve Months:</span>
                  <span className="font-mono font-bold">{caseData.financial.reserveMonths} months</span>
                </div>
                <div className="flex justify-between border-t pt-1 text-rose-700 font-semibold">
                  <span>Total Debt Obligations:</span>
                  <span className="font-mono font-bold">₹{caseData.financial.debtObligations.totalOutstanding.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZAKAT TAB */}
        {activeTab === 'zakat' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Preliminary Zakat Eligibility Assessment</h3>
                <p className="text-xs text-slate-500">
                  Evaluated strictly against Silver Nisab (612.36g @ ₹95/g = ₹58,174). Requires approved Foundation policy / scholarly review.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  caseData.zakat.preliminaryEligibility === 'Eligible'
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {caseData.zakat.preliminaryEligibility}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Assessable Wealth:</span>
                <span className="font-mono font-bold text-sm">
                  ₹{(caseData.zakat.assessableCashSavings + caseData.zakat.assessableGoldSilverValue).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Deductible Liabilities:</span>
                <span className="font-mono font-bold text-sm">
                  ₹{caseData.zakat.deductibleImmediateLiabilities.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Silver Nisab Threshold:</span>
                <span className="font-mono font-bold text-sm">
                  ₹{caseData.zakat.nisabThresholdSilverINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {caseData.zakat.scholarlyNotes && (
              <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl text-xs text-teal-900">
                <strong>Scholarly Note: </strong>
                {caseData.zakat.scholarlyNotes}
              </div>
            )}
          </div>
        )}

        {/* DECISION HISTORY TAB */}
        {activeTab === 'decisions' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Human Committee Decisions</h3>
                <p className="text-xs text-slate-500">Every decision requires a written reason. Overrides are auditable.</p>
              </div>
              <button
                onClick={() => setDecisionModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Record New Decision
              </button>
            </div>

            {caseData.decisionHistory && caseData.decisionHistory.length > 0 ? (
              <div className="space-y-3">
                {caseData.decisionHistory.map((d) => (
                  <div key={d.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-emerald-800 text-sm">{d.decision}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(d.decidedAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-slate-700">
                      Approved: <strong>₹{d.approvedAmount.toLocaleString('en-IN')}</strong> from <strong>{d.fundAllocated}</strong>
                    </div>
                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                      &ldquo;{d.decisionReason}&rdquo;
                    </p>
                    {d.isOverride && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                        <strong>Override Rationale: </strong> {d.overrideReason}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">Decided by: {d.decidedBy}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No formal committee decision has been logged yet.</p>
            )}
          </div>
        )}

        {/* REASSESSMENT HISTORY TAB */}
        {activeTab === 'reassessments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reassessment Audit Trail</h3>
            {caseData.reassessmentHistory && caseData.reassessmentHistory.length > 0 ? (
              <div className="space-y-3">
                {caseData.reassessmentHistory.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Score Delta: {r.previousScore} → {r.newScore} ({r.scoreDelta > 0 ? `+${r.scoreDelta}` : r.scoreDelta})
                      </span>
                      <span className="text-slate-400 text-[11px]">{new Date(r.reassessmentDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-slate-700">Reason: {r.reasonForReassessment}</p>
                    <div className="text-[10px] text-slate-400">Reviewer: {r.reviewedBy}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">This case has not undergone reassessment.</p>
            )}
          </div>
        )}
      </div>

      {/* DECISION MODAL */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5">
              <h2 className="text-base font-bold">Record Human Committee Decision</h2>
              <p className="text-xs text-slate-300">Case ID: {caseData.id} • {caseData.fullName}</p>
            </div>

            <form onSubmit={handleDecisionSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision Outcome</label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                >
                  <option value="Approve full">Approve Full Funding</option>
                  <option value="Approve partial">Approve Partial Funding (Minimum Effective Grant)</option>
                  <option value="Waitlist">Waitlist for Future Fund Replenishment</option>
                  <option value="Decline">Decline Application</option>
                  <option value="Request more information">Request More Verification / Information</option>
                  <option value="Emergency escalation">Emergency Escalation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approved Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Fund</label>
                  <select
                    value={fundAllocated}
                    onChange={(e) => setFundAllocated(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="Zakat">Zakat Fund</option>
                    <option value="General Welfare">General Welfare / Sadaqah</option>
                    <option value="Medical">Medical Fund</option>
                    <option value="Education">Education Fund</option>
                    <option value="Emergency">Emergency Relief</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision Rationale & Committee Notes</label>
                <textarea
                  required
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Document why this grant amount was approved..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border">
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isOverride}
                    onChange={(e) => setIsOverride(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>This decision overrides the calculated priority recommendation</span>
                </label>
                {isOverride && (
                  <textarea
                    required
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="State explicit reason for overriding calculated score..."
                    className="w-full px-3 py-1.5 bg-white border rounded-lg"
                  />
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSESSMENT MODAL */}
      {isReassessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5">
              <h2 className="text-base font-bold">Reassess Case</h2>
              <p className="text-xs text-slate-300">Creates a new version with previous score tracking</p>
            </div>
            <form onSubmit={handleReassessSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Reassessment</label>
                <textarea
                  required
                  rows={3}
                  value={reassessmentReason}
                  onChange={(e) => setReassessmentReason(e.target.value)}
                  placeholder="e.g. Applicant health deteriorated requiring hospital admission..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReassessmentModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Confirm Reassessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
