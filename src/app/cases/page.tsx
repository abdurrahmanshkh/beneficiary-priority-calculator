'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Scale,
  Download,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  FileCheck2,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CaseType, PriorityBand, CaseStatus } from '@/types/beneficiary';

export default function CasesPage() {
  const {
    cases,
    searchQuery,
    setSearchQuery,
    filterCaseType,
    filterPriorityBand,
    filterStatus,
    filterEmergencyOnly,
    filterZakatEligibleOnly,
    filterVerificationLevel,
    setFilters,
    sortBy,
    setSortBy,
    selectedCaseIdsForCompare,
    toggleCompareCase,
    clearCompareCases,
    exportBackup,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter Logic
  const filteredCases = cases.filter((c) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchType = c.caseType.toLowerCase().includes(q);
      const matchCity = c.city?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPhone && !matchType && !matchCity) return false;
    }

    // Case Type
    if (filterCaseType !== 'all' && c.caseType !== filterCaseType) return false;

    // Priority Band
    if (filterPriorityBand !== 'all' && c.calculatedScore.priorityBand !== filterPriorityBand) return false;

    // Status
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;

    // Emergency Only
    if (filterEmergencyOnly && !c.calculatedScore.emergencyTriggered && c.status !== 'Emergency Review') return false;

    // Zakat Only
    if (filterZakatEligibleOnly && c.zakat.preliminaryEligibility !== 'Eligible') return false;

    // Verification Level
    if (filterVerificationLevel !== 'all' && c.verification.confidenceLevel !== filterVerificationLevel) return false;

    return true;
  });

  // Sorting Logic
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'priority_desc') return b.calculatedScore.totalScore - a.calculatedScore.totalScore;
    if (sortBy === 'priority_asc') return a.calculatedScore.totalScore - b.calculatedScore.totalScore;
    if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'amount_desc') return b.requestedAmount - a.requestedAmount;
    if (sortBy === 'urgency_desc') return b.calculatedScore.severityScore - a.calculatedScore.severityScore;
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Beneficiary Cases</h1>
          <p className="text-xs text-slate-500">
            {cases.length} local cases registered • Showing {sortedCases.length} filtered
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedCaseIdsForCompare.length > 0 && (
            <div className="flex items-center gap-2 p-1 pl-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium">
              <span>{selectedCaseIdsForCompare.length} selected for comparison</span>
              <Link
                href="/compare"
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Scale className="w-3.5 h-3.5" />
                Compare Now
              </Link>
              <button
                onClick={clearCompareCases}
                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            </div>
          )}

          <Link
            href="/cases/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Search Input & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, Case ID (IAN-...), phone, city, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="priority_desc">Highest Priority (Score Desc)</option>
              <option value="priority_asc">Lowest Priority (Score Asc)</option>
              <option value="urgency_desc">Most Urgent (Severity)</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Requested Amount</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-400'}`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-400'}`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Case Type Filter */}
          <select
            value={filterCaseType}
            onChange={(e) => setFilters({ caseType: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 capitalize focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Domains</option>
            <option value="medical">Medical</option>
            <option value="widow">Widow</option>
            <option value="orphan">Orphan</option>
            <option value="disability">Disability</option>
            <option value="elderly">Elderly</option>
            <option value="food">Food / Ration</option>
            <option value="housing">Housing</option>
            <option value="education">Education</option>
            <option value="livelihood">Livelihood</option>
            <option value="debt">Debt Distress</option>
            <option value="disaster">Disaster</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Band Filter */}
          <select
            value={filterPriorityBand}
            onChange={(e) => setFilters({ priorityBand: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Priority Bands</option>
            <option value="Critical">Critical (85–100)</option>
            <option value="Very High">Very High (70–84)</option>
            <option value="High">High (55–69)</option>
            <option value="Moderate">Moderate (40–54)</option>
            <option value="Lower">Lower (&lt;40)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Ready for Decision">Ready for Decision</option>
            <option value="Emergency Review">Emergency Review</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Approved">Approved</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Submitted">Submitted / In Review</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Toggle Pills */}
          <button
            onClick={() => setFilters({ emergencyOnly: !filterEmergencyOnly })}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              filterEmergencyOnly
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Only</span>
          </button>

          <button
            onClick={() => setFilters({ zakatOnly: !filterZakatEligibleOnly })}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              filterZakatEligibleOnly
                ? 'bg-teal-100 border-teal-300 text-teal-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Zakat Eligible</span>
          </button>

          {(filterCaseType !== 'all' ||
            filterPriorityBand !== 'all' ||
            filterStatus !== 'all' ||
            filterEmergencyOnly ||
            filterZakatEligibleOnly ||
            searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  caseType: 'all',
                  priorityBand: 'all',
                  status: 'all',
                  fund: 'all',
                  emergencyOnly: false,
                  zakatOnly: false,
                  verificationLevel: 'all',
                });
              }}
              className="text-xs text-rose-600 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Case List Display (Table or Cards) */}
      {sortedCases.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No cases match the selected filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing specific filters, or register a new beneficiary case.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th className="px-4 py-3.5">Beneficiary & ID</th>
                  <th className="px-4 py-3.5">Domain</th>
                  <th className="px-4 py-3.5">Priority & Score</th>
                  <th className="px-4 py-3.5">Key Urgency Drivers</th>
                  <th className="px-4 py-3.5">Funding Gap</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedCases.map((c) => {
                  const isSelected = selectedCaseIdsForCompare.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        c.calculatedScore.emergencyTriggered ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleCompareCase(c.id)}
                          className="text-slate-400 hover:text-emerald-700 p-1"
                          title={isSelected ? 'Remove from compare' : 'Select to compare (max 5)'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/cases/${c.id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                          {c.fullName}
                        </Link>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{c.id}</span>
                          <span>•</span>
                          <span>Age {c.calculatedAge}</span>
                          <span>•</span>
                          <span>{c.city}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="capitalize font-medium">{c.caseType}</span>
                        {c.zakat.preliminaryEligibility === 'Eligible' && (
                          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">Zakat Eligible</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <ScoreBadge
                          score={c.calculatedScore.totalScore}
                          priorityBand={c.calculatedScore.priorityBand}
                          isProvisional={c.calculatedScore.isProvisional}
                          showMeter
                        />
                      </td>
                      <td className="px-4 py-4 max-w-xs truncate text-[11px] text-slate-500">
                        {c.calculatedScore.topContributingFactors[0] || c.title}
                      </td>
                      <td className="px-4 py-4 font-mono font-medium">
                        ₹{c.requestedAmount.toLocaleString('en-IN')}
                        <div className="text-[10px] font-sans text-slate-400">
                          Min: ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="px-4 py-4 text-right space-x-1">
                        <Link
                          href={`/cases/${c.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCases.map((c) => {
            const isSelected = selectedCaseIdsForCompare.includes(c.id);
            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  c.calculatedScore.emergencyTriggered ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-400">{c.id}</div>
                      <Link href={`/cases/${c.id}`} className="text-base font-bold text-slate-900 hover:text-emerald-700">
                        {c.fullName}
                      </Link>
                      <div className="text-xs text-slate-500 capitalize">
                        {c.caseType} • Age {c.calculatedAge} • {c.city}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCompareCase(c.id)}
                      className="p-1 text-slate-400 hover:text-emerald-700"
                      title="Select for comparison"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <ScoreBadge
                      score={c.calculatedScore.totalScore}
                      priorityBand={c.calculatedScore.priorityBand}
                      isProvisional={c.calculatedScore.isProvisional}
                    />
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.narrativeDescription}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Requested: </span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{c.requestedAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Min: </span>
                      <span className="font-mono font-medium text-slate-700">
                        ₹{(c.minimumEffectiveAmount || c.requestedAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    {c.zakat.preliminaryEligibility === 'Eligible' && (
                      <span className="text-teal-700 font-semibold">Zakat Eligible</span>
                    )}
                  </div>
                  <Link
                    href={`/cases/${c.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
