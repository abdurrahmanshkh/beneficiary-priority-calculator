'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const FAQS = [
  {
    q: 'Why does Il An Noor Foundation use a score rather than simple first-come-first-served?',
    a: 'When charitable funds are limited, first-come-first-served favors individuals with smartphones, transport, and connections over the most isolated, bedridden, or digitally illiterate. A multidimensional score evaluates genuine vulnerability, urgency, and lack of support to ensure equitable allocation without bias.',
  },
  {
    q: 'Does a higher score guarantee that an applicant will receive money?',
    a: 'No. The score is a recommendation tool for the Foundation’s human review committee. A high score flags that a case is of urgent priority, but final approval depends on document verification, fund eligibility rules, and budget availability.',
  },
  {
    q: 'Can two people with the exact same income have completely different scores?',
    a: 'Yes. Income alone is only one part of financial need. One family may have accessible savings, health insurance, and two capable adult earners, while another family has severe spinal paraplegia, 4 young children, accumulated rent arrears, and zero buffer. The second case will score substantially higher because their underlying vulnerability and danger of catastrophe is far greater.',
  },
  {
    q: 'Why do you ask about household assets and gold?',
    a: 'We ask about household assets to understand whether the family has accessible liquid reserves that can reasonably meet the current crisis. Essential survival assets (such as a primary home or work auto-rickshaw) are treated differently from realizable idle wealth.',
  },
  {
    q: 'Does being a widow or orphan automatically give maximum priority points?',
    a: 'No. We do not use crude category stacking (Widow = +10, Orphan = +10). A widow with stable independent income and strong extended family support is evaluated differently from a widow with three minor children and zero income. We measure the resulting support gap and caregiving burden.',
  },
  {
    q: 'Does disability certificate percentage determine priority?',
    a: 'No. Disability percentage is recorded for administrative reference, but the score measures functional impact on activities of daily living (ADLs), work capacity, and caregiver burden. A person with 60% limitation who is unable to work and requires 24/7 care receives higher priority points than someone with mild limitation.',
  },
  {
    q: 'Why is beneficiary age collected if younger is not automatically prioritized?',
    a: 'Age informs life-stage vulnerability (e.g. an infant requiring adult protection, or a frail senior living alone). In medical cases, age may inform clinical resilience and therapeutic benefit, but age alone does not award or deduct points.',
  },
  {
    q: 'Does being Zakat-eligible guarantee receiving Zakat funds?',
    a: 'No. Zakat eligibility assesses whether the applicant’s net wealth is below the silver Nisab threshold. Whether they receive Zakat depends on whether the Foundation has available Zakat funds and whether their specific request qualifies under Shariah guidelines.',
  },
  {
    q: 'What happens if a beneficiary or family disagrees with their assessment?',
    a: 'Every beneficiary has the right to a transparent explanation of their score (via the Beneficiary Transparency Report) and the right to request a formal reassessment if circumstances change or if information was recorded incorrectly.',
  },
];

export default function HelpPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge & Guidance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions & Ethical Intake Charter
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Guidance for Foundation volunteers, case workers, applicants, and donors explaining the ethical principles behind the Il An Noor assessment system.
        </p>
      </div>

      {/* Core Limitations Statement */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Statement of System Limitations</span>
        </div>
        <h2 className="text-lg font-serif font-bold">The Priority Index is a decision-support tool, not a moral judge.</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          The score does not determine a person&apos;s dignity, moral value, or general entitlement to charity. It uses verified data to recommend consistent priorities when resources are constrained. Paperwork absence must never be used to punish destitute applicants, and automated recommendations must never replace compassionate human oversight.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b pb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 bg-slate-50/60 hover:bg-slate-50 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ethical Intake Charter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">Volunteer & Case Worker Code of Conduct</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
            <span className="font-bold text-slate-900 block">1. Preserve Dignity</span>
            <p className="text-slate-600 leading-relaxed">
              Never speak to applicants in demeaning terms. Treat every individual with courtesy and respect regardless of score or eligibility outcome.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
            <span className="font-bold text-slate-900 block">2. Objective Data Intake</span>
            <p className="text-slate-600 leading-relaxed">
              Record verified facts accurately. Do not artificially exaggerate facts to manipulate scores, and do not suppress genuine emergency indicators.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
            <span className="font-bold text-slate-900 block">3. Absolute Privacy</span>
            <p className="text-slate-600 leading-relaxed">
              Beneficiary medical notes, debts, and personal disclosures are strictly confidential. Do not share case files outside authorized committee channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
