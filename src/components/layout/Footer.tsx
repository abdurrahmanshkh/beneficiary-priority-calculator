import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HardDrive, Info, HeartHandshake } from 'lucide-react';
import { INBPI_POLICY_V01 } from '@/lib/policy/scoringPolicy';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Foundation summary */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                <HeartHandshake className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif font-bold text-slate-800 tracking-wide text-sm">
                IL AN NOOR FOUNDATION
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                {INBPI_POLICY_V01.version}
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs max-w-lg">
              Structured decision-support system designed to evaluate beneficiary vulnerability, urgency, and financial need transparently and objectively. Priority scores represent relative need according to published policy and never measure personal worth or dignity.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Transparency & Policy
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/criteria" className="hover:text-emerald-700 transition-colors">
                  Evaluation Criteria & Methodology
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-emerald-700 transition-colors">
                  Scoring Policy & Calibration
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-emerald-700 transition-colors">
                  Fairness & Equity Audit
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-emerald-700 transition-colors">
                  Methodology FAQ & Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Device Security & Local Vault */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Local-First Architecture</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Beneficiary information remains exclusively on this device. Encrypted at rest via Web Crypto AES-GCM when vault is enabled. Export regular backups in Settings.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No Cloud Tracking • Zero-Knowledge Local</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Il An Noor Foundation. Confidential Humanitarian Assessment System.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/criteria" className="hover:underline">
              Methodology
            </Link>
            <Link href="/settings" className="hover:underline">
              Backup / Restore
            </Link>
            <Link href="/help" className="hover:underline">
              Ethical Intake Charter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
