export type CaseType =
  | 'medical'
  | 'education'
  | 'food'
  | 'housing'
  | 'disability'
  | 'elderly'
  | 'orphan'
  | 'widow'
  | 'livelihood'
  | 'debt'
  | 'disaster'
  | 'other';

export type CaseStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Needs Verification'
  | 'Verified'
  | 'Assessment Complete'
  | 'Emergency Review'
  | 'Ready for Decision'
  | 'Approved'
  | 'Partially Approved'
  | 'Waitlisted'
  | 'Rejected'
  | 'Deferred'
  | 'Assistance Disbursed'
  | 'Closed'
  | 'Reassessment Due';

export type PriorityBand = 'Critical' | 'Very High' | 'High' | 'Moderate' | 'Lower';

export type VerificationStatus =
  | 'Unverified'
  | 'Self-reported'
  | 'Pending verification'
  | 'Document verified'
  | 'Field verified'
  | 'Third-party verified';

export interface HouseholdMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  employmentStatus: 'Employed' | 'Daily Wage' | 'Unemployed' | 'Unable to Work' | 'Student' | 'Retired' | 'Child';
  monthlyIncome: number;
  hasDisability: boolean;
  disabilityDetails?: string;
  isDependent: boolean;
  educationStatus?: string;
  chronicCareNeeds?: boolean;
}

export interface FinancialProfile {
  dependableMonthlyIncome: number;
  irregularMonthlyIncome: number;
  totalHouseholdIncome: number;
  perCapitaIncome: number;
  incomeStability: 'highly_stable' | 'mostly_stable' | 'variable' | 'highly_unstable' | 'no_reliable_income';
  incomeSources: Array<{
    id: string;
    source: string;
    amount: number;
    earnerName: string;
    isRegular: boolean;
  }>;
  essentialMonthlyExpenses: {
    food: number;
    rent: number;
    utilities: number;
    essentialMedicines: number;
    essentialTransport: number;
    education: number;
    caregiving: number;
    otherEssential: number;
    total: number;
  };
  liquidAssets: {
    cash: number;
    bankBalance: number;
    savings: number;
    goldSilverValue: number;
    investments: number;
    totalLiquid: number;
  };
  physicalAssets: {
    primaryHomeOwned: boolean;
    landValue: number;
    vehiclesValue: number;
    livestockValue: number;
    businessAssets: number;
    totalPhysical: number;
  };
  debtObligations: {
    totalOutstanding: number;
    monthlyDebtPayment: number;
    debtType: string;
    rentArrears: number;
    medicalDebt: number;
    utilityArrears: number;
    foodDebt: number;
    essentialEducationDebt: number;
    consequenceOfNonPayment: string;
  };
  coverageRatio: number; // dependableMonthlyIncome / totalEssentialMonthlyExpenses
  reserveMonths: number; // totalLiquid / totalEssentialMonthlyExpenses
  debtBurdenRatio: number; // monthlyDebtPayment / (dependableMonthlyIncome || 1)
}

export interface VulnerabilityProfile {
  functionalDisability: {
    hasDisability: boolean;
    disabilityType?: string;
    percentage?: number;
    udidNumber?: string;
    functionalImpact: 'none' | 'mild' | 'moderate' | 'severe' | 'profound';
    requiresCaregiver: boolean;
    caregiverImpact?: string;
    additionalDisabilityExpenses: number;
  };
  dependencyBurden: {
    totalMembers: number;
    totalEarners: number;
    totalDependents: number;
    childrenCount: number;
    elderlyCount: number;
    disabledDependentsCount: number;
    dependencyRatio: number;
  };
  familyStructure: {
    circumstance: 'stable' | 'some_limitation' | 'significant_gap' | 'single_caregiver' | 'no_reliable_guardian';
    category: 'widow' | 'orphan' | 'single_parent' | 'elderly_alone' | 'abandoned' | 'intact_family' | 'other';
    orphanDetails?: {
      parentsAlive: 'both' | 'one' | 'none';
      guardianAvailable: boolean;
      guardianRelationship?: string;
      guardianCapacity: 'capable' | 'limited' | 'severely_deprived';
    };
    widowDetails?: {
      yearsSinceSpousePassing?: number;
      familySupportAvailable: boolean;
      childrenUnderCare: number;
    };
    elderlyDetails?: {
      livesAlone: boolean;
      hasCaregiver: boolean;
      functionalIndependence: 'full' | 'partial' | 'dependent';
    };
  };
  ageVulnerability: {
    primaryBeneficiaryAge: number;
    lifeStage: 'infant' | 'child' | 'adolescent' | 'young_adult' | 'adult' | 'older_adult';
    createsVulnerability: boolean;
    ageVulnerabilityNote?: string;
  };
  chronicCareSafeguarding: {
    hasChronicIllness: boolean;
    chronicIllnessDetails?: string;
    recurringMedicationNeeds: boolean;
    monthlyMedicationCost: number;
    safeguardingRisk: 'none' | 'low' | 'moderate' | 'high';
    abuseNeglectRisk: boolean;
    unsafeLivingEnvironment: boolean;
    notes?: string;
  };
}

export interface DeprivationProfile {
  foodSecurity: {
    score: number; // 0-4
    mealsPerDay: number;
    skippedMeals: boolean;
    daysFoodRemaining: number;
    childrenAffected: boolean;
    nutritionalConcerns?: string;
  };
  housingCondition: {
    score: number; // 0-3
    type: 'homeless' | 'temporary_shelter' | 'unsafe_structure' | 'rented_arrears_eviction' | 'rented_stable' | 'owned_basic' | 'adequate';
    rentArrearsMonths: number;
    evictionNoticeReceived: boolean;
    overcrowded: boolean;
    weatherExposure: boolean;
  };
  utilitiesAccess: {
    score: number; // 0-2
    electricityAvailable: boolean;
    cleanWaterAvailable: boolean;
    cleanCookingFuelAvailable: boolean;
    adequateSanitationAvailable: boolean;
  };
  healthAccess: {
    score: number; // 0-2
    medicationUnavailable: boolean;
    treatmentInterruptedDueToCost: boolean;
    inabilityToAffordEssentialCare: boolean;
  };
  educationDeprivation: {
    score: number; // 0-2
    childrenOutOfSchool: boolean;
    dropoutRiskDueToFees: boolean;
    feeArrearsPresent: boolean;
    examAdmissionBarrier: boolean;
  };
  otherBasicNeeds: {
    score: number; // 0-2
    inadequateClothing: boolean;
    inadequateHygieneSanitaryAccess: boolean;
    lackEssentialTransport: boolean;
    lackCommunicationDevice: boolean;
  };
}

export interface SeverityUrgencyProfile {
  timeUrgency: {
    timeUntilHarm: 'less_than_72h' | '1_to_2_weeks' | '2_to_4_weeks' | '1_to_3_months' | 'more_than_3_months';
    points: number; // 0-8
  };
  consequenceOfNoAssistance: {
    consequence: 'threat_to_life_or_shelter' | 'severe_irreversible_harm' | 'serious_hardship' | 'moderate_deterioration' | 'limited_hardship';
    points: number; // 1-7
  };
  essentialityOfIntervention: {
    level: 'critical' | 'essential' | 'important' | 'helpful_non_essential' | 'optional';
    points: number; // 0-4
  };
  expectedBenefit: {
    level: 'restores_functioning_or_life_saving' | 'major_stabilization' | 'meaningful_relief' | 'limited_temporary_relief' | 'unclear_benefit';
    points: number; // 0-6
    clinicianInformedNote?: string;
  };
  emergencyTrigger: boolean;
  emergencyReason?: string;
}

export interface SupportGapProfile {
  familyCommunitySupport: {
    level: 'no_support' | 'minimal_sympathetic' | 'moderate_occasional' | 'strong_dependable';
    points: number; // 0-3
    notes?: string;
  };
  governmentOtherSchemes: {
    level: 'none_available_or_rejected' | 'applied_pending' | 'partial_scheme_accessible' | 'substantial_scheme_covering_majority';
    schemesChecked: string[]; // e.g. Ayushman Bharat, PM-JAY, Disability Pension, Widow Pension, Minority Scholarship
    points: number; // 0-3
    notes?: string;
  };
  remainingFundingGap: {
    verifiedTotalNeed: number;
    existingAvailableFunds: number;
    otherCommittedFunds: number;
    requestedFromIlAnNoor: number;
    minimumEffectiveAmount: number;
    gapRatio: number; // remainingUncovered / verifiedTotalNeed
    points: number; // 0-4
  };
}

export interface ZakatAssessment {
  assessableCashSavings: number;
  assessableGoldSilverValue: number;
  assessableInvestmentsTradeGoods: number;
  deductibleImmediateLiabilities: number;
  deductibleBasicMonthlyLivingExpenses: number;
  netAssessableWealth: number;
  nisabThresholdSilverINR: number;
  isBelowNisab: boolean;
  recipientCategory: 'faqir' | 'miskeen' | 'gharimin' | 'ibn_sabil' | 'fi_sabilillah' | 'none';
  preliminaryEligibility: 'Eligible' | 'Ineligible' | 'Requires Scholarly Review';
  scholarlyNotes?: string;
  reviewedByScholar?: string;
  reviewDate?: string;
}

export interface ScoreTraceItem {
  criterionId: string;
  dimension: string;
  criterionName: string;
  answer: string | number;
  points: number;
  maxPoints: number;
  explanation: string;
  policyReference: string;
}

export interface CalculatedScore {
  totalScore: number; // 0-100
  financialScore: number; // 0-30
  vulnerabilityScore: number; // 0-20
  deprivationScore: number; // 0-15
  severityScore: number; // 0-25
  supportGapScore: number; // 0-10
  priorityBand: PriorityBand;
  isProvisional: boolean;
  dataCompletenessPercent: number;
  missingKeyFields: string[];
  emergencyTriggered: boolean;
  emergencyReason?: string;
  targetingEligible: boolean; // score >= 40
  prioritized: boolean; // score >= 70
  isNearThreshold: boolean; // within 3 points of cutoff
  scoreTrace: ScoreTraceItem[];
  topContributingFactors: string[];
  calculatedAt: string;
  policyVersion: string;
}

export interface VerificationChecklist {
  incomeVerified: boolean;
  assetsVerified: boolean;
  householdMembersVerified: boolean;
  medicalDiagnosisVerified: boolean;
  costEstimateVerified: boolean;
  doctorHospitalVerified: boolean;
  idProofVerified: boolean;
  addressVerified: boolean;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  verificationNotes?: string;
  inconsistencyFlags: string[];
}

export interface HumanDecision {
  id: string;
  decision: 'Approve full' | 'Approve partial' | 'Waitlist' | 'Decline' | 'Request more information' | 'Emergency escalation';
  approvedAmount: number;
  fundAllocated: 'Zakat' | 'General Welfare' | 'Medical' | 'Education' | 'Emergency' | 'Other';
  decisionReason: string;
  isOverride: boolean;
  overrideReason?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface ReassessmentEntry {
  id: string;
  reassessmentDate: string;
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  reasonForReassessment: string;
  keyChangesIdentified: string[];
  reviewedBy: string;
}

export interface BeneficiaryCase {
  id: string; // e.g. "IAN-2026-0042"
  beneficiaryCode: string;
  fullName: string;
  dateOfBirth: string;
  calculatedAge: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  caseType: CaseType;
  title: string;
  narrativeDescription: string;
  requestedAmount: number;
  minimumEffectiveAmount: number;
  verifiedRequirement: number;
  fundEligibility: Array<'Zakat' | 'General Welfare' | 'Medical' | 'Education' | 'Emergency' | 'Other'>;
  status: CaseStatus;
  household: HouseholdMember[];
  financial: FinancialProfile;
  vulnerability: VulnerabilityProfile;
  deprivation: DeprivationProfile;
  severity: SeverityUrgencyProfile;
  supportGap: SupportGapProfile;
  caseSpecificData: Record<string, any>;
  zakat: ZakatAssessment;
  verification: VerificationChecklist;
  calculatedScore: CalculatedScore;
  decisionHistory: HumanDecision[];
  reassessmentHistory: ReassessmentEntry[];
  currentDecision?: HumanDecision;
  isDemoCase?: boolean;
  createdAt: string;
  updatedAt: string;
}
