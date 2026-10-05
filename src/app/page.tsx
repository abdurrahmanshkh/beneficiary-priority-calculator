'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Users,
  AlertOctagon,
  Flame,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  PlusCircle,
  ListOrdered,
  Sliders,
  Scale,
  BookOpen,
  Download,
  AlertTriangle,
  HardDrive,
  HeartHandshake,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function DashboardPage() {
  const { cases, isLoading, isVaultLocked, lastBackupDate, exportBackup } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isVaultLocked) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Local Vault is Locked</h2>
        <p className="text-sm text-slate-600">
          Beneficiary records are encrypted on this device. Click &ldquo;Vault Locked&rdquo; in the top navigation bar to enter your passcode and access case information.
        </p>
      </div>
    );
  }

  // Analytics Computations
  const totalCases = cases.length;
  const criticalCases = cases.filter((c) => c.calculatedScore.priorityBand === 'Critical');
  const veryHighCases = cases.filter((c) => c.calculatedScore.priorityBand === 'Very High');
  const highCases = cases.filter((c) => c.calculatedScore.priorityBand === 'High');
  const moderateCases = cases.filter((c) => c.calculatedScore.priorityBand === 'Moderate');
  const lowerCases = cases.filter((c) => c.calculatedScore.priorityBand === 'Lower');

  const needsVerificationCases = cases.filter(
    (c) => c.status === 'Needs Verification' || c.verification.confidenceLevel === 'Low'
  );
  const emergencyCases = cases.filter((c) => c.calculatedScore.emergencyTriggered || c.status === 'Emergency Review');
  const zakatEligibleCases = cases.filter((c) => c.zakat.preliminaryEligibility === 'Eligible');
  const awaitingDecisionCases = cases.filter((c) =>
    ['Submitted', 'Under Review', 'Ready for Decision', 'Emergency Review'].includes(c.status)
  );

  const totalRequested = cases.reduce((acc, c) => acc + (c.requestedAmount || 0), 0);
  const totalMinEffective = cases.reduce((acc, c) => acc + (c.minimumEffectiveAmount || c.requestedAmount || 0), 0);

  // Group by Case Type
  const categoryCounts: Record<string, number> = {};
  cases.forEach((c) => {
    categoryCounts[c.caseType] = (categoryCounts[c.caseType] || 0) + 1;
  });

  const recentCases = [...cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Decision-Support System (INBPI v0.1)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Beneficiary Priority & Allocation Engine
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Consistently evaluating household vulnerability, urgency, and financial need. Prioritizing scarce charitable capital transparently with complete mathematical explainability and zero arbitrary category stacking.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs shadow-md transition-transform hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Case</span>
            </Link>
            <Link
              href="/queue"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium backdrop-blur transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
              <span>View Priority Queue</span>
            </Link>
            <Link
              href="/funds"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium backdrop-blur transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Allocation Planner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Backup Alert if never backed up */}
      {!lastBackupDate && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Backup Recommended:</strong> Beneficiary records exist only in this browser&apos;s local storage. Download an encrypted JSON backup file regularly to prevent data loss.
            </span>
          </div>
          <button
            onClick={() => exportBackup()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup Now
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {/* Total Cases */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Total Cases</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalCases}</div>
          <div className="text-[11px] text-slate-400 mt-1">Local records</div>
        </div>

        {/* Critical */}
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <div className="text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>Critical</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 mt-2">{criticalCases.length}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">Score ≥ 85 pts</div>
        </div>

        {/* Very High */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="text-amber-800 text-xs font-semibold flex items-center justify-between">
            <span>Very High</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-2">{veryHighCases.length}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">Score 70–84 pts</div>
        </div>

        {/* Emergency Triggers */}
        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 shadow-sm flex flex-col justify-between">
          <div className="text-purple-800 text-xs font-semibold flex items-center justify-between">
            <span>Emergency</span>
            <AlertTriangle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-900 mt-2">{emergencyCases.length}</div>
          <div className="text-[11px] text-purple-700/80 mt-1">&lt;72h / life threat</div>
        </div>

        {/* Awaiting Decision */}
        <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-200 shadow-sm flex flex-col justify-between">
          <div className="text-sky-800 text-xs font-semibold flex items-center justify-between">
            <span>In Review</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-900 mt-2">{awaitingDecisionCases.length}</div>
          <div className="text-[11px] text-sky-700/80 mt-1">Committee review</div>
        </div>

        {/* Needs Verification */}
        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 shadow-sm flex flex-col justify-between">
          <div className="text-orange-800 text-xs font-semibold flex items-center justify-between">
            <span>Verification</span>
            <FileCheck2 className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-900 mt-2">{needsVerificationCases.length}</div>
          <div className="text-[11px] text-orange-700/80 mt-1">Pending checks</div>
        </div>

        {/* Zakat Eligible */}
        <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 shadow-sm flex flex-col justify-between">
          <div className="text-teal-800 text-xs font-semibold flex items-center justify-between">
            <span>Zakat Eligible</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-900 mt-2">{zakatEligibleCases.length}</div>
          <div className="text-[11px] text-teal-700/80 mt-1">Below Nisab</div>
        </div>

        {/* Total Funds Requested */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm text-white flex flex-col justify-between">
          <div className="text-emerald-400 text-xs font-semibold flex items-center justify-between">
            <span>Requested</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-2 truncate">
            ₹{(totalRequested / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Min: ₹{(totalMinEffective / 1000).toFixed(0)}k</div>
        </div>
      </div>

      {/* Main Grid: Priority Distribution & Case Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Bands Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Priority Score Distribution</h2>
            <Link href="/criteria" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
              Methodology <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {/* Critical */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Critical Priority (85–100)
                </span>
                <span className="font-mono font-medium text-slate-700">
                  {criticalCases.length} ({totalCases ? Math.round((criticalCases.length / totalCases) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCases ? (criticalCases.length / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Very High */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Very High Priority (70–84)
                </span>
                <span className="font-mono font-medium text-slate-700">
                  {veryHighCases.length} ({totalCases ? Math.round((veryHighCases.length / totalCases) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCases ? (veryHighCases.length / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* High */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  High Priority (55–69)
                </span>
                <span className="font-mono font-medium text-slate-700">
                  {highCases.length} ({totalCases ? Math.round((highCases.length / totalCases) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCases ? (highCases.length / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Moderate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Moderate Priority (40–54)
                </span>
                <span className="font-mono font-medium text-slate-700">
                  {moderateCases.length} ({totalCases ? Math.round((moderateCases.length / totalCases) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCases ? (moderateCases.length / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lower */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Lower Priority (&lt;40)
                </span>
                <span className="font-mono font-medium text-slate-700">
                  {lowerCases.length} ({totalCases ? Math.round((lowerCases.length / totalCases) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCases ? (lowerCases.length / totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 leading-normal">
            Prioritization cutoff is currently set at <strong>70 pts</strong>. Cases scoring 40–69 meet general eligibility and can be funded as additional budget becomes available.
          </div>
        </div>

        {/* Case Categories Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Cases by Need Domain</h2>
            <span className="text-xs text-slate-400">{Object.keys(categoryCounts).length} active domains</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 capitalize">{cat}</span>
                <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                  {count}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 leading-normal">
            <strong>Sub-module assessment active:</strong> Clinical data recorded for medical cases; child protection assessments recorded for orphan cases; functional impact recorded for disability cases.
          </div>
        </div>

        {/* Allocation Quick Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Fund Allocation Readiness</h2>
              <Link href="/funds" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
                Open Planner <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-600">Total Requested:</span>
                <span className="font-mono font-bold text-slate-900">₹{totalRequested.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs">
                <span>Minimum Effective Requirement:</span>
                <span className="font-mono font-bold">₹{totalMinEffective.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-teal-50 text-teal-900 rounded-xl text-xs">
                <span>Zakat-Eligible Requirement:</span>
                <span className="font-mono font-bold">
                  ₹{cases
                    .filter((c) => c.zakat.preliminaryEligibility === 'Eligible')
                    .reduce((acc, c) => acc + c.requestedAmount, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/funds"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Simulate Fund Allocations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Assessed Cases</h2>
            <p className="text-xs text-slate-500">Live priority score and status breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/cases"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All ({cases.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Beneficiary</th>
                <th className="px-6 py-3">Domain</th>
                <th className="px-6 py-3">Score & Priority</th>
                <th className="px-6 py-3">Requested</th>
                <th className="px-6 py-3">Zakat</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/cases/${c.id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                      {c.fullName}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-mono">{c.id}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{c.caseType}</td>
                  <td className="px-6 py-4">
                    <ScoreBadge
                      score={c.calculatedScore.totalScore}
                      priorityBand={c.calculatedScore.priorityBand}
                      isProvisional={c.calculatedScore.isProvisional}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">
                    ₹{c.requestedAmount.toLocaleString('en-IN')}
                    <div className="text-[10px] text-slate-400 font-sans">
                      Min: ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.zakat.preliminaryEligibility === 'Eligible' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800">
                        Eligible
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Inspect
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
