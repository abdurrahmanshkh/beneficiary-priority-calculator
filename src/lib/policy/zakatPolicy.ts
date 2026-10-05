export interface ZakatPolicyConfig {
  version: string;
  title: string;
  silverNisabGrams: number;
  goldNisabGrams: number;
  silverPricePerGram: number; // e.g. 95 INR
  goldPricePerGram: number; // e.g. 7800 INR
  currency: string;
  selectedNisabBasis: 'silver' | 'gold';
  effectiveDate: string;
  sourceNote: string;
  approvedByScholar: string;
  disclaimerText: string;
  eligibleCategories: Array<{
    code: string;
    arabicName: string;
    englishName: string;
    description: string;
    fiqhRule: string;
  }>;
  assessableAssetTypes: Array<{
    id: string;
    name: string;
    description: string;
    isSubjectToZakat: boolean;
  }>;
  deductibleLiabilityTypes: Array<{
    id: string;
    name: string;
    description: string;
    isDeductible: boolean;
  }>;
}

export const DEFAULT_ZAKAT_POLICY: ZakatPolicyConfig = {
  version: 'ZAKAT-POL-v0.1',
  title: 'Il An Noor Foundation Zakat Eligibility & Allocation Policy',
  silverNisabGrams: 612.36,
  goldNisabGrams: 87.48,
  silverPricePerGram: 95.0, // Current benchmark in India
  goldPricePerGram: 7850.0,
  currency: 'INR',
  selectedNisabBasis: 'silver',
  effectiveDate: '2026-10-01',
  sourceNote: 'Benchmark silver price calibrated with Indian bullion market standard (612.36g Silver).',
  approvedByScholar: 'Il An Noor Shariah Advisory Board (Mufti Panel)',
  disclaimerText:
    'Preliminary Zakat Assessment – This tool provides an indicative calculation based on configured Nisab thresholds and declared wealth. Final Zakat eligibility and disbursement require verification and approval under the Foundation’s approved scholarly policy.',
  eligibleCategories: [
    {
      code: 'faqir',
      arabicName: 'Al-Fuqara (الفقراء)',
      englishName: 'The Destitute',
      description: 'Individuals who possess virtually nothing or whose net assessable wealth is well below the silver Nisab threshold.',
      fiqhRule: 'Eligible for essential living, food, medical, and shelter support.',
    },
    {
      code: 'miskeen',
      arabicName: 'Al-Masakin (المساكين)',
      englishName: 'The Needy',
      description: 'Individuals with some income or basic belongings, but whose total resources cannot meet basic daily necessities and who remain below Nisab.',
      fiqhRule: 'Eligible for assistance up to the fulfillment of essential household needs.',
    },
    {
      code: 'gharimin',
      arabicName: 'Al-Gharimin (الغارمين)',
      englishName: 'The Debt-Ridden',
      description: 'Individuals burdened with unmanageable debt contracted for permissible necessities (medical treatment, basic rent, essential education) with no means to settle.',
      fiqhRule: 'Eligible for direct settlement of genuine creditor obligations.',
    },
    {
      code: 'ibn_sabil',
      arabicName: 'Ibn As-Sabil (ابن السبيل)',
      englishName: 'The Stranded / Displaced',
      description: 'Individuals displaced due to disaster, eviction, or journey without accessible funds to return or re-establish shelter.',
      fiqhRule: 'Eligible for transit, emergency relief, and relocation assistance.',
    },
    {
      code: 'fi_sabilillah',
      arabicName: 'Fi Sabilillah (في سبيل الله)',
      englishName: 'In the Path of Allah (Approved Causes)',
      description: 'Needy students pursuing beneficial Islamic or vital community-serving education unable to afford educational fees.',
      fiqhRule: 'Permissible under recognized contemporary scholarship when applied to underprivileged students.',
    },
  ],
  assessableAssetTypes: [
    { id: 'cash', name: 'Cash and Bank Balances', description: 'Liquid cash, savings accounts, fixed deposits', isSubjectToZakat: true },
    { id: 'gold_silver', name: 'Gold and Silver Holdings', description: 'Jewelry (as per prevailing policy), bullion, coins', isSubjectToZakat: true },
    { id: 'investments', name: 'Trade Inventory and Shares', description: 'Business inventory intended for sale, marketable securities', isSubjectToZakat: true },
    { id: 'receivables', name: 'Strong Debt Receivables', description: 'Debts owed to the beneficiary that are realistically expected to be recovered', isSubjectToZakat: true },
    { id: 'primary_home', name: 'Primary Residence & Basic Household Furniture', description: 'Exempt from assessable wealth', isSubjectToZakat: false },
    { id: 'work_tools', name: 'Essential Work Equipment & Vehicle', description: 'Auto-rickshaw, sewing machine, tools of trade (Exempt)', isSubjectToZakat: false },
  ],
  deductibleLiabilityTypes: [
    { id: 'immediate_debt', name: 'Overdue / Immediate Debt Due', description: 'Creditor debts due now or overdue (deducted from assessable wealth)', isDeductible: true },
    { id: 'arrears', name: 'Rent and Utility Arrears', description: 'Accumulated essential arrears payable immediately', isDeductible: true },
    { id: 'current_month_expenses', name: 'Basic Monthly Survival Needs', description: 'Food, rent, and life-saving medicines required for the current month', isDeductible: true },
    { id: 'long_term_future_debt', name: 'Long-term Deferred Installments', description: 'Future years mortgages or non-urgent loans (not immediately deductible)', isDeductible: false },
  ],
};

export function calculateSilverNisabINR(policy: ZakatPolicyConfig): number {
  return Math.round(policy.silverNisabGrams * policy.silverPricePerGram);
}

export function calculateGoldNisabINR(policy: ZakatPolicyConfig): number {
  return Math.round(policy.goldNisabGrams * policy.goldPricePerGram);
}

export function getActiveNisabINR(policy: ZakatPolicyConfig): number {
  return policy.selectedNisabBasis === 'silver' ? calculateSilverNisabINR(policy) : calculateGoldNisabINR(policy);
}
