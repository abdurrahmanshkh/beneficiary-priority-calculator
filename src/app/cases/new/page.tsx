'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  BeneficiaryCase,
  CaseType,
  HouseholdMember,
  FinancialProfile,
  VulnerabilityProfile,
  DeprivationProfile,
  SeverityUrgencyProfile,
  SupportGapProfile,
  ZakatAssessment,
  VerificationChecklist,
} from '@/types/beneficiary';
import { calculateTotalScore, calculateZakatEligibility } from '@/lib/scoring/scoringEngine';
import { INBPI_POLICY_V01 } from '@/lib/policy/scoringPolicy';
import { DEFAULT_ZAKAT_POLICY } from '@/lib/policy/zakatPolicy';
import { ScoreBadge } from '@/components/common/ScoreBadge';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Coins,
  Shield,
  Activity,
  AlertTriangle,
  Stethoscope,
  GraduationCap,
  Home,
  Briefcase,
  HelpCircle,
  Save,
  Check,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const WIZARD_STEPS = [
  { id: 'profile', title: '1. Registration', icon: User },
  { id: 'household', title: '2. Household', icon: Users },
  { id: 'financial', title: '3. Financial Need', icon: Coins },
  { id: 'assets_debt', title: '4. Assets & Debt', icon: Coins },
  { id: 'vulnerability', title: '5. Vulnerability', icon: Shield },
  { id: 'deprivation', title: '6. Deprivation', icon: Activity },
  { id: 'module', title: '7. Case Details', icon: Stethoscope },
  { id: 'urgency_gap', title: '8. Urgency & Gap', icon: AlertTriangle },
  { id: 'zakat', title: '9. Zakat Check', icon: Shield },
  { id: 'review', title: '10. Review & Save', icon: CheckCircle2 },
];

export default function NewCasePage() {
  const router = useRouter();
  const { saveCase, showToast } = useAppStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved just now');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Form State initialized with realistic defaults
  const [formData, setFormData] = useState<Partial<BeneficiaryCase>>({
    id: `IAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    beneficiaryCode: `BEN-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    dateOfBirth: '1990-01-01',
    calculatedAge: 36,
    gender: 'Male',
    phone: '',
    alternatePhone: '',
    address: '',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560001',
    caseType: 'medical',
    title: '',
    narrativeDescription: '',
    requestedAmount: 30000,
    minimumEffectiveAmount: 20000,
    verifiedRequirement: 30000,
    fundEligibility: ['General Welfare'],
    status: 'Ready for Decision',
    household: [
      {
        id: 'hh-1',
        name: 'Applicant',
        relationship: 'Self',
        age: 36,
        gender: 'Male',
        employmentStatus: 'Daily Wage',
        monthlyIncome: 6000,
        hasDisability: false,
        isDependent: false,
      },
    ],
    financial: {
      dependableMonthlyIncome: 6000,
      irregularMonthlyIncome: 1000,
      totalHouseholdIncome: 7000,
      perCapitaIncome: 7000,
      incomeStability: 'variable',
      incomeSources: [{ id: 'inc-1', source: 'Daily Wage Work', amount: 6000, earnerName: 'Applicant', isRegular: false }],
      essentialMonthlyExpenses: {
        food: 4000,
        rent: 3000,
        utilities: 600,
        essentialMedicines: 500,
        essentialTransport: 400,
        education: 0,
        caregiving: 0,
        otherEssential: 300,
        total: 8800,
      },
      liquidAssets: { cash: 500, bankBalance: 800, savings: 0, goldSilverValue: 0, investments: 0, totalLiquid: 1300 },
      physicalAssets: { primaryHomeOwned: false, landValue: 0, vehiclesValue: 0, livestockValue: 0, businessAssets: 0, totalPhysical: 0 },
      debtObligations: {
        totalOutstanding: 15000,
        monthlyDebtPayment: 1000,
        debtType: 'Emergency living debt',
        rentArrears: 3000,
        medicalDebt: 5000,
        utilityArrears: 0,
        foodDebt: 2000,
        essentialEducationDebt: 0,
        consequenceOfNonPayment: 'Notice from landlord',
      },
      coverageRatio: 0.68,
      reserveMonths: 0.14,
      debtBurdenRatio: 0.16,
    },
    vulnerability: {
      functionalDisability: {
        hasDisability: false,
        functionalImpact: 'none',
        requiresCaregiver: false,
        additionalDisabilityExpenses: 0,
      },
      dependencyBurden: {
        totalMembers: 1,
        totalEarners: 1,
        totalDependents: 0,
        childrenCount: 0,
        elderlyCount: 0,
        disabledDependentsCount: 0,
        dependencyRatio: 0,
      },
      familyStructure: {
        circumstance: 'stable',
        category: 'intact_family',
      },
      ageVulnerability: {
        primaryBeneficiaryAge: 36,
        lifeStage: 'adult',
        createsVulnerability: false,
      },
      chronicCareSafeguarding: {
        hasChronicIllness: false,
        recurringMedicationNeeds: false,
        monthlyMedicationCost: 0,
        safeguardingRisk: 'none',
        abuseNeglectRisk: false,
        unsafeLivingEnvironment: false,
      },
    },
    deprivation: {
      foodSecurity: { score: 1, mealsPerDay: 2, skippedMeals: false, daysFoodRemaining: 5, childrenAffected: false },
      housingCondition: { score: 1, type: 'rented_stable', rentArrearsMonths: 1, evictionNoticeReceived: false, overcrowded: false, weatherExposure: false },
      utilitiesAccess: { score: 0, electricityAvailable: true, cleanWaterAvailable: true, cleanCookingFuelAvailable: true, adequateSanitationAvailable: true },
      healthAccess: { score: 1, medicationUnavailable: false, treatmentInterruptedDueToCost: false, inabilityToAffordEssentialCare: true },
      educationDeprivation: { score: 0, childrenOutOfSchool: false, dropoutRiskDueToFees: false, feeArrearsPresent: false, examAdmissionBarrier: false },
      otherBasicNeeds: { score: 0, inadequateClothing: false, inadequateHygieneSanitaryAccess: false, lackEssentialTransport: false, lackCommunicationDevice: false },
    },
    severity: {
      timeUrgency: { timeUntilHarm: '1_to_2_weeks', points: 6 },
      consequenceOfNoAssistance: { consequence: 'serious_hardship', points: 4 },
      essentialityOfIntervention: { level: 'essential', points: 3 },
      expectedBenefit: { level: 'meaningful_relief', points: 4 },
      emergencyTrigger: false,
    },
    supportGap: {
      familyCommunitySupport: { level: 'minimal_sympathetic', points: 2 },
      governmentOtherSchemes: { level: 'applied_pending', points: 2, schemesChecked: [] },
      remainingFundingGap: {
        verifiedTotalNeed: 30000,
        existingAvailableFunds: 0,
        otherCommittedFunds: 0,
        requestedFromIlAnNoor: 30000,
        minimumEffectiveAmount: 20000,
        gapRatio: 1.0,
        points: 4,
      },
    },
    caseSpecificData: {},
    zakat: {
      assessableCashSavings: 1300,
      assessableGoldSilverValue: 0,
      assessableInvestmentsTradeGoods: 0,
      deductibleImmediateLiabilities: 15000,
      deductibleBasicMonthlyLivingExpenses: 8800,
      netAssessableWealth: 0,
      nisabThresholdSilverINR: 58174,
      isBelowNisab: true,
      recipientCategory: 'miskeen',
      preliminaryEligibility: 'Eligible',
    },
    verification: {
      incomeVerified: false,
      assetsVerified: false,
      householdMembersVerified: false,
      medicalDiagnosisVerified: false,
      costEstimateVerified: false,
      doctorHospitalVerified: false,
      idProofVerified: false,
      addressVerified: false,
      confidenceLevel: 'Medium',
      inconsistencyFlags: [],
    },
    decisionHistory: [],
    reassessmentHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Calculate Age from Date of Birth
  const handleDobChange = (dob: string) => {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - birthYear);
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dob,
      calculatedAge: age,
      vulnerability: {
        ...prev.vulnerability!,
        ageVulnerability: {
          ...prev.vulnerability!.ageVulnerability,
          primaryBeneficiaryAge: age,
          lifeStage: age < 3 ? 'infant' : age < 13 ? 'child' : age < 18 ? 'adolescent' : age >= 65 ? 'older_adult' : 'adult',
        },
      },
    }));
  };

  // Recalculate Live Provisional Score on every change
  const liveScore = useMemo(() => {
    const zakatAssessed = calculateZakatEligibility(formData.zakat || ({} as ZakatAssessment), DEFAULT_ZAKAT_POLICY);
    return calculateTotalScore(
      {
        ...formData,
        zakat: zakatAssessed,
      },
      INBPI_POLICY_V01
    );
  }, [formData]);

  // Autosave simulated effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastSavedTime('Saved just now');
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) {
      showToast('Please provide the beneficiary full name in Step 1.', 'error');
      setCurrentStepIndex(0);
      return;
    }

    try {
      const saved = await saveCase(formData as BeneficiaryCase);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push(`/cases/${saved.id}`);
    } catch {
      showToast('Error saving case record.', 'error');
    }
  };

  // Household Member Add/Remove
  const addHouseholdMember = () => {
    const newMember: HouseholdMember = {
      id: `hh-${Date.now()}`,
      name: '',
      relationship: 'Dependent',
      age: 18,
      gender: 'Female',
      employmentStatus: 'Unemployed',
      monthlyIncome: 0,
      hasDisability: false,
      isDependent: true,
    };
    const updated = [...(formData.household || []), newMember];
    setFormData((prev) => ({ ...prev, household: updated }));
  };

  const removeHouseholdMember = (id: string) => {
    const updated = (formData.household || []).filter((m) => m.id !== id);
    setFormData((prev) => ({ ...prev, household: updated }));
  };

  const updateHouseholdMember = (id: string, fields: Partial<HouseholdMember>) => {
    const updated = (formData.household || []).map((m) => (m.id === id ? { ...m, ...fields } : m));
    setFormData((prev) => ({ ...prev, household: updated }));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Wizard Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {formData.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">New Assessment Wizard</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-slate-900 mt-1">
            {formData.fullName || 'Untitled Beneficiary Case'}
          </h1>
        </div>

        {/* Live Score Preview Header Chip */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-medium">Provisional Score</div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800">
              <span>{liveScore.totalScore}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
          <ScoreBadge score={liveScore.totalScore} priorityBand={liveScore.priorityBand} isProvisional={liveScore.isProvisional} />
          <div className="text-[11px] text-slate-400 hidden md:block border-l pl-3">
            {lastSavedTime}
          </div>
        </div>
      </div>

      {/* Step Navigation Tabs Bar */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1 min-w-max p-1 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs">
          {WIZARD_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : isCompleted
                    ? 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 font-medium'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Icon className="w-3.5 h-3.5" />}
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Content with Sticky Score Preview Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Step Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {/* STEP 1: Registration Profile */}
            {currentStepIndex === 0 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 1: Registration & Beneficiary Profile</h2>
                  <p className="text-xs text-slate-500">Enter demographic details and core case categorization.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Beneficiary Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Fatima Bi, Mohammed Irfan"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Case Category Domain</label>
                    <select
                      value={formData.caseType}
                      onChange={(e) => setFormData({ ...formData, caseType: e.target.value as CaseType })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="medical">Medical (Illness / Surgery / Cancer)</option>
                      <option value="widow">Widow Support</option>
                      <option value="orphan">Orphan / Child Protection</option>
                      <option value="disability">Disability / Assistive Device</option>
                      <option value="elderly">Elderly Destitution</option>
                      <option value="food">Food Security / Ration</option>
                      <option value="housing">Housing Crisis / Eviction</option>
                      <option value="education">Education Fees</option>
                      <option value="livelihood">Livelihood Recovery</option>
                      <option value="debt">Debt Distress</option>
                      <option value="disaster">Emergency / Disaster</option>
                      <option value="other">Other Humanitarian Need</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Calculated Age: <strong>{formData.calculatedAge} years</strong> ({formData.vulnerability?.ageVulnerability.lifeStage})
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98450 12345"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru, Ramanagara, Hoskote"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Street Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House No, Cross, Locality, Landmark"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Case Title Summary</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief 1-sentence headline describing the immediate crisis..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Case Narrative Description</label>
                  <textarea
                    rows={4}
                    value={formData.narrativeDescription || ''}
                    onChange={(e) => setFormData({ ...formData, narrativeDescription: e.target.value })}
                    placeholder="Provide full narrative background: family background, cause of distress, urgent deadlines, and previous assistance..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Household Composition */}
            {currentStepIndex === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Step 2: Household Members Roster</h2>
                    <p className="text-xs text-slate-500">Record all individuals living under the same roof and sharing expenses.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addHouseholdMember}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.household || []).map((m, idx) => (
                    <div key={m.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Member #{idx + 1}</span>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeHouseholdMember(m.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Name</label>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => updateHouseholdMember(m.id, { name: e.target.value })}
                            placeholder="Full Name"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Relationship</label>
                          <input
                            type="text"
                            value={m.relationship}
                            onChange={(e) => updateHouseholdMember(m.id, { relationship: e.target.value })}
                            placeholder="e.g. Self, Spouse, Child"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Age</label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={m.age}
                            onChange={(e) => updateHouseholdMember(m.id, { age: parseInt(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Monthly Income (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={m.monthlyIncome}
                            onChange={(e) => updateHouseholdMember(m.id, { monthlyIncome: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        <label className="flex items-center gap-1.5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={m.isDependent}
                            onChange={(e) => updateHouseholdMember(m.id, { isDependent: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Non-earning Dependent</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={m.hasDisability}
                            onChange={(e) => updateHouseholdMember(m.id, { hasDisability: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Has Disability / Chronic Illness</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Financial Need */}
            {currentStepIndex === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 3: Household Monthly Income & Essential Expenses</h2>
                  <p className="text-xs text-slate-500">Calculates coverage of essential monthly survival needs (food, rent, medicine, utilities).</p>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-emerald-950">Income-to-Needs Coverage: </span>
                    <span className="font-mono font-bold text-emerald-800">
                      {Math.round(
                        ((formData.financial?.dependableMonthlyIncome || 0) /
                          Math.max(1, formData.financial?.essentialMonthlyExpenses.total || 1)) *
                          100
                      )}%
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    {formData.financial?.dependableMonthlyIncome! < (formData.financial?.essentialMonthlyExpenses.total || 0)
                      ? 'Chronic Monthly Deficit'
                      : 'Covering Base Needs'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dependable Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.financial?.dependableMonthlyIncome || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          financial: {
                            ...prev.financial!,
                            dependableMonthlyIncome: val,
                            totalHouseholdIncome: val + (prev.financial?.irregularMonthlyIncome || 0),
                          },
                        }));
                      }}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Income Stability</label>
                    <select
                      value={formData.financial?.incomeStability}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          financial: { ...prev.financial!, incomeStability: e.target.value as any },
                        }))
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="highly_stable">Highly Stable (Permanent Salary / Pension)</option>
                      <option value="mostly_stable">Mostly Stable (Regular informal contract)</option>
                      <option value="variable">Variable (Seasonal agricultural / casual work)</option>
                      <option value="highly_unstable">Highly Unstable (Intermittent daily wage)</option>
                      <option value="no_reliable_income">No Reliable Income (Unemployed sole earner)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-800 mb-2">Essential Monthly Expenses Breakdown (₹)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Food / Groceries</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.financial?.essentialMonthlyExpenses.food || 0}
                        onChange={(e) => {
                          const f = parseFloat(e.target.value) || 0;
                          const exp = formData.financial!.essentialMonthlyExpenses;
                          const total = f + exp.rent + exp.utilities + exp.essentialMedicines + exp.essentialTransport + exp.education + exp.otherEssential;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              essentialMonthlyExpenses: { ...exp, food: f, total },
                            },
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Rent</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.financial?.essentialMonthlyExpenses.rent || 0}
                        onChange={(e) => {
                          const r = parseFloat(e.target.value) || 0;
                          const exp = formData.financial!.essentialMonthlyExpenses;
                          const total = exp.food + r + exp.utilities + exp.essentialMedicines + exp.essentialTransport + exp.education + exp.otherEssential;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              essentialMonthlyExpenses: { ...exp, rent: r, total },
                            },
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Utilities (Power/Gas)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.financial?.essentialMonthlyExpenses.utilities || 0}
                        onChange={(e) => {
                          const u = parseFloat(e.target.value) || 0;
                          const exp = formData.financial!.essentialMonthlyExpenses;
                          const total = exp.food + exp.rent + u + exp.essentialMedicines + exp.essentialTransport + exp.education + exp.otherEssential;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              essentialMonthlyExpenses: { ...exp, utilities: u, total },
                            },
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Essential Medicines</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.financial?.essentialMonthlyExpenses.essentialMedicines || 0}
                        onChange={(e) => {
                          const m = parseFloat(e.target.value) || 0;
                          const exp = formData.financial!.essentialMonthlyExpenses;
                          const total = exp.food + exp.rent + exp.utilities + m + exp.essentialTransport + exp.education + exp.otherEssential;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              essentialMonthlyExpenses: { ...exp, essentialMedicines: m, total },
                            },
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Assets & Debt */}
            {currentStepIndex === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 4: Assets, Reserves & Debt Obligations</h2>
                  <p className="text-xs text-slate-500">Accessible liquid reserves compared against essential monthly survival needs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800">Liquid / Realizable Reserves</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Cash in hand & Bank Savings (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.financial?.liquidAssets.totalLiquid || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              liquidAssets: { ...prev.financial!.liquidAssets, totalLiquid: val, cash: val },
                            },
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800">Debt & Immediate Arrears</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Rent / Medical Arrears Due Now (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={(formData.financial?.debtObligations.rentArrears || 0) + (formData.financial?.debtObligations.medicalDebt || 0)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData((prev) => ({
                            ...prev,
                            financial: {
                              ...prev.financial!,
                              debtObligations: {
                                ...prev.financial!.debtObligations,
                                rentArrears: val,
                                totalOutstanding: val,
                              },
                            },
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Vulnerability */}
            {currentStepIndex === 4 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 5: Structural Vulnerability & Care Dependency</h2>
                  <p className="text-xs text-slate-500">Evaluates functional disability impact, family structure, and caregiving burden.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Functional Disability Impact on Daily Living
                    </label>
                    <select
                      value={formData.vulnerability?.functionalDisability.functionalImpact}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vulnerability: {
                            ...prev.vulnerability!,
                            functionalDisability: {
                              ...prev.vulnerability!.functionalDisability,
                              functionalImpact: e.target.value as any,
                              hasDisability: e.target.value !== 'none',
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="none">No meaningful functional limitation (0 pts)</option>
                      <option value="mild">Mild (independent in self-care, light work possible: +1 pt)</option>
                      <option value="moderate">Moderate (needs help with some tasks, cannot do physical work: +3 pts)</option>
                      <option value="severe">Severe (cannot perform ADLs without continuous assistance: +5 pts)</option>
                      <option value="profound">Profound (bedridden / total 24/7 care dependency: +6 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Family Support Structure
                    </label>
                    <select
                      value={formData.vulnerability?.familyStructure.circumstance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vulnerability: {
                            ...prev.vulnerability!,
                            familyStructure: {
                              ...prev.vulnerability!.familyStructure,
                              circumstance: e.target.value as any,
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="stable">Stable two-parent / intact family support (0 pts)</option>
                      <option value="some_limitation">Some limitation (extended family partially involved: +1 pt)</option>
                      <option value="significant_gap">Significant support gap (widow/widower with few kin: +2 pts)</option>
                      <option value="single_caregiver">Solo caregiver / widow with multiple dependent young children (+3 pts)</option>
                      <option value="no_reliable_guardian">No reliable parent or guardian (complete orphan / abandoned: +4 pts)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Deprivation */}
            {currentStepIndex === 5 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 6: Basic-Necessity Deprivation</h2>
                  <p className="text-xs text-slate-500">Multidimensional poverty assessment (food, shelter, healthcare, schooling).</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Food Security Status</label>
                    <select
                      value={formData.deprivation?.foodSecurity.score}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deprivation: {
                            ...prev.deprivation!,
                            foodSecurity: { ...prev.deprivation!.foodSecurity, score: parseInt(e.target.value) },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value={0}>0 - Adequate food (3 meals daily)</option>
                      <option value={1}>1 - Occasional meal reduction</option>
                      <option value={2}>2 - Regular meal reduction (adults skipping)</option>
                      <option value={3}>3 - Frequent skipped meals (children also affected)</option>
                      <option value={4}>4 - Acute food insecurity (&lt;2 days food)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Housing & Shelter Condition</label>
                    <select
                      value={formData.deprivation?.housingCondition.score}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deprivation: {
                            ...prev.deprivation!,
                            housingCondition: { ...prev.deprivation!.housingCondition, score: parseInt(e.target.value) },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value={0}>0 - Adequate secure housing</option>
                      <option value={1}>1 - Rented with minor arrears / overcrowding</option>
                      <option value={2}>2 - Unsafe structure (leaking roof / hazardous)</option>
                      <option value={3}>3 - Homeless / written eviction notice in 14 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Case Details (Conditionally Tailored) */}
            {currentStepIndex === 6 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900 capitalize">
                    Step 7: {formData.caseType} Detailed Case Information
                  </h2>
                  <p className="text-xs text-slate-500">Domain-specific verification and clinical/educational facts.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Verified Requirement (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.requestedAmount || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, requestedAmount: val, verifiedRequirement: val });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Effective Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumEffectiveAmount || 0}
                      onChange={(e) => setFormData({ ...formData, minimumEffectiveAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Smallest contribution that produces meaningful benefit
                    </span>
                  </div>
                </div>

                {formData.caseType === 'medical' && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                      Clinician-Assessed Medical Treatment Profile
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Medical Diagnosis / Staging</label>
                        <input
                          type="text"
                          placeholder="e.g. Stage II Breast Cancer, T12 Fracture"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Treating Hospital / Institution</label>
                        <input
                          type="text"
                          placeholder="e.g. Victoria Hospital, Kidwai Oncology"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: Urgency & Support Gap */}
            {currentStepIndex === 7 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 8: Severity, Urgency & Funding Deficit</h2>
                  <p className="text-xs text-slate-500">Time until serious harm, consequence of delay, and public schemes checked.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Urgency</label>
                    <select
                      value={formData.severity?.timeUrgency.timeUntilHarm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          severity: {
                            ...prev.severity!,
                            timeUrgency: {
                              ...prev.severity!.timeUrgency,
                              timeUntilHarm: e.target.value as any,
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="more_than_3_months">&gt; 3 months (Elective / non-urgent: +0 pts)</option>
                      <option value="1_to_3_months">1–3 months (Medium term: +2 pts)</option>
                      <option value="2_to_4_weeks">2–4 weeks (Clear upcoming deadline: +4 pts)</option>
                      <option value="1_to_2_weeks">1–2 weeks (Imminent crisis: +6 pts)</option>
                      <option value="less_than_72h">&lt; 72 hours (Acute life/shelter emergency: +8 pts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Consequence of No Assistance</label>
                    <select
                      value={formData.severity?.consequenceOfNoAssistance.consequence}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          severity: {
                            ...prev.severity!,
                            consequenceOfNoAssistance: {
                              ...prev.severity!.consequenceOfNoAssistance,
                              consequence: e.target.value as any,
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="limited_hardship">Limited hardship (+1 pt)</option>
                      <option value="moderate_deterioration">Moderate deterioration (+3 pts)</option>
                      <option value="serious_hardship">Serious hardship (+4 pts)</option>
                      <option value="severe_irreversible_harm">Severe / irreversible harm (+6 pts)</option>
                      <option value="threat_to_life_or_shelter">Immediate threat to life or shelter (+7 pts)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: Zakat Assessment */}
            {currentStepIndex === 8 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 9: Dedicated Zakat Eligibility Assessment</h2>
                  <p className="text-xs text-slate-500">
                    Completely independent of the generic priority score. Assessed against Silver Nisab (₹{DEFAULT_ZAKAT_POLICY.silverNisabGrams * DEFAULT_ZAKAT_POLICY.silverPricePerGram}).
                  </p>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
                  <div>
                    <span className="font-semibold">Silver Nisab Benchmark: </span>
                    <span className="font-mono">₹58,174</span> (612.36g @ ₹95/g)
                  </div>
                  <div className="font-bold">
                    Eligibility: {formData.zakat?.preliminaryEligibility}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zakat Recipient Category</label>
                  <select
                    value={formData.zakat?.recipientCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zakat: { ...prev.zakat!, recipientCategory: e.target.value as any },
                      }))
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="faqir">Al-Fuqara (The Destitute - Below Nisab)</option>
                    <option value="miskeen">Al-Masakin (The Needy - Income insufficient for subsistence)</option>
                    <option value="gharimin">Al-Gharimin (The Debt-Ridden for Permissible Necessities)</option>
                    <option value="ibn_sabil">Ibn As-Sabil (The Stranded / Displaced)</option>
                    <option value="none">Not Eligible for Zakat</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 10: Review & Confirmation */}
            {currentStepIndex === 9 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 10: Review Assessment & Confirmation</h2>
                  <p className="text-xs text-slate-500">Review all scored components and verify data completeness before final saving.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Final Calculated Priority</span>
                    <ScoreBadge score={liveScore.totalScore} priorityBand={liveScore.priorityBand} isProvisional={liveScore.isProvisional} />
                  </div>
                  <div className="text-xs text-slate-600">
                    Financial Need: <strong>{liveScore.financialScore}/30</strong> • Vulnerability: <strong>{liveScore.vulnerabilityScore}/20</strong> • Deprivation: <strong>{liveScore.deprivationScore}/15</strong> • Urgency: <strong>{liveScore.severityScore}/25</strong> • Support Gap: <strong>{liveScore.supportGapScore}/10</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Ready to save. Once submitted, this case enters the active priority queue for committee allocation.</span>
                </div>
              </div>
            )}

            {/* Bottom Form Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrev}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex < WIZARD_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit & Finalize Case
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Live Score Preview Docked Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Score Breakdown</h3>
              <p className="text-[11px] text-slate-400">Provisional INBPI calculation</p>
            </div>
            <ScoreBadge score={liveScore.totalScore} priorityBand={liveScore.priorityBand} size="sm" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Financial Need</span>
                <span className="font-mono font-bold text-slate-900">{liveScore.financialScore}/30</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(liveScore.financialScore / 30) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Vulnerability & Dependency</span>
                <span className="font-mono font-bold text-slate-900">{liveScore.vulnerabilityScore}/20</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(liveScore.vulnerabilityScore / 20) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Basic Deprivation</span>
                <span className="font-mono font-bold text-slate-900">{liveScore.deprivationScore}/15</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(liveScore.deprivationScore / 15) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Severity & Urgency</span>
                <span className="font-mono font-bold text-slate-900">{liveScore.severityScore}/25</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(liveScore.severityScore / 25) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Support & Funding Gap</span>
                <span className="font-mono font-bold text-slate-900">{liveScore.supportGapScore}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(liveScore.supportGapScore / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Data Completeness: {liveScore.dataCompletenessPercent}%
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${liveScore.dataCompletenessPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
