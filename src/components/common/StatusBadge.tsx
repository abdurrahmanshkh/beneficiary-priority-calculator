import React from 'react';
import { CaseStatus } from '@/types/beneficiary';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (status) {
    case 'Draft':
      style = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'Submitted':
    case 'Under Review':
      style = 'bg-sky-50 text-sky-700 border-sky-300';
      break;
    case 'Needs Verification':
      style = 'bg-orange-50 text-orange-800 border-orange-300';
      break;
    case 'Verified':
      style = 'bg-teal-50 text-teal-800 border-teal-300';
      break;
    case 'Assessment Complete':
    case 'Ready for Decision':
      style = 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium';
      break;
    case 'Emergency Review':
      style = 'bg-rose-100 text-rose-800 border-rose-400 font-semibold animate-pulse';
      break;
    case 'Approved':
      style = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-semibold';
      break;
    case 'Partially Approved':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'Waitlisted':
      style = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'Rejected':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Assistance Disbursed':
      style = 'bg-purple-50 text-purple-700 border-purple-300';
      break;
    case 'Closed':
      style = 'bg-slate-200 text-slate-600 border-slate-400';
      break;
    case 'Reassessment Due':
      style = 'bg-yellow-50 text-yellow-800 border-yellow-300';
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${style}`}>
      {status}
    </span>
  );
};
