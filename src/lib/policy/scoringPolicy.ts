export interface PolicyDimension {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
  criteria: PolicyCriterion[];
}

export interface PolicyCriterion {
  id: string;
  dimensionId: string;
  name: string;
  maxPoints: number;
  question: string;
  description: string;
  whyItMatters: string;
  verificationRequirement: string;
  options?: Array<{
    label: string;
    value: string | number;
    points: number;
    description?: string;
  }>;
}

export interface ScoringPolicy {
  version: string;
  title: string;
  shortName: string;
  status: 'Draft' | 'Active' | 'Archived';
  effectiveDate: string;
  lastUpdated: string;
  currency: string;
  currencySymbol: string;
  totalMaxPoints: number;
  targetingThreshold: number; // e.g. 40 - general assistance eligibility
  prioritizationThreshold: number; // e.g. 70 - highest priority allocation
  tieThreshold: number; // e.g. 2.0 points
  nearThresholdRange: number; // e.g. 3.0 points
  clinicalAgePolicy: 'contextualOnly' | 'clinicianInformedModifier' | 'boardApprovedAgeModifier';
  dimensions: PolicyDimension[];
  priorityBands: Array<{
    name: 'Critical' | 'Very High' | 'High' | 'Moderate' | 'Lower';
    minScore: number;
    maxScore: number;
    color: string;
    badgeStyle: string;
    description: string;
  }>;
  nonScoredFactors: string[];
}

export const INBPI_POLICY_V01: ScoringPolicy = {
  version: 'INBPI v0.1',
  title: 'Il An Noor Beneficiary Priority Index',
  shortName: 'INBPI',
  status: 'Draft',
  effectiveDate: '2026-10-01',
  lastUpdated: '2026-10-05',
  currency: 'INR',
  currencySymbol: '₹',
  totalMaxPoints: 100,
  targetingThreshold: 40,
  prioritizationThreshold: 70,
  tieThreshold: 2.0,
  nearThresholdRange: 3.0,
  clinicalAgePolicy: 'contextualOnly',
  priorityBands: [
    {
      name: 'Critical',
      minScore: 85,
      maxScore: 100,
      color: 'rose',
      badgeStyle: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
      description: 'Acute emergency, severe destitution or imminent threat to life/shelter. Immediate allocation recommended.',
    },
    {
      name: 'Very High',
      minScore: 70,
      maxScore: 84,
      color: 'amber',
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
      description: 'High multidimensional deprivation, urgent medical/livelihood gap, and high caregiver or dependency burden.',
    },
    {
      name: 'High',
      minScore: 55,
      maxScore: 69,
      color: 'emerald',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
      description: 'Substantial verified need, significant support deficit, prioritized as funds become available.',
    },
    {
      name: 'Moderate',
      minScore: 40,
      maxScore: 54,
      color: 'blue',
      badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
      description: 'Meets general targeting threshold; assistance recommended when higher-priority cases have been served.',
    },
    {
      name: 'Lower',
      minScore: 0,
      maxScore: 39,
      color: 'slate',
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700',
      description: 'Below current prioritization cutoff; family has reserves, alternative support, or low urgency.',
    },
  ],
  nonScoredFactors: [
    'Religious belief or sectarian identity (for all general welfare funds)',
    'Caste, clan, tribe or ethnic origin',
    'Personal friendship, acquaintance or referral by Foundation trustees/staff',
    'Political connections or community prominence',
    'Social media presence, public appeals or viral campaigns',
    'Fluency in English or formal communication style',
    'Academic prestige or marks alone (need is the primary evaluation principle)',
    'Arbitrary age preference (younger is not inherently prioritized over older without clinical justification)',
  ],
  dimensions: [
    {
      id: 'financial',
      name: 'Financial Need',
      maxPoints: 30,
      description: 'Measures income adequacy against essential household survival needs, accessible reserves, and debt pressure.',
      criteria: [
        {
          id: 'fin_coverage',
          dimensionId: 'financial',
          name: 'Monthly Essential Needs Coverage',
          maxPoints: 15,
          question: 'What percentage of essential monthly household survival expenses does dependable income cover?',
          description: 'Ratio of predictable household monthly income to baseline essential costs (food, rent, utilities, medicines, schooling).',
          whyItMatters: 'A family whose reliable income cannot cover basic subsistence faces immediate compounding distress.',
          verificationRequirement: 'Salary slips, passbook entries, employer statements, or field verification of informal wages.',
          options: [
            { label: '≥ 150% (Comfortable surplus)', value: 'gte_150', points: 0 },
            { label: '125% – 149% (Modest cushion)', value: '125_149', points: 2 },
            { label: '100% – 124% (Breakeven)', value: '100_124', points: 4 },
            { label: '80% – 99% (Slight monthly shortfall)', value: '80_99', points: 7 },
            { label: '60% – 79% (Moderate chronic deficit)', value: '60_79', points: 10 },
            { label: '40% – 59% (Severe deficit, skipping bills)', value: '40_59', points: 13 },
            { label: '< 40% (Acute income collapse / near zero)', value: 'lt_40', points: 15 },
          ],
        },
        {
          id: 'fin_reserves',
          dimensionId: 'financial',
          name: 'Accessible Liquid Reserves',
          maxPoints: 7,
          question: 'How many months of essential household needs could accessible cash, savings or liquid assets cover?',
          description: 'Measures immediately realizable buffers without counting essential primary shelter or work tools.',
          whyItMatters: 'Liquid reserves protect against shocks; families with zero buffer risk destitution upon the slightest disruption.',
          verificationRequirement: 'Bank passbook, gold disclosures, post office savings certificates.',
          options: [
            { label: '> 6 months of essential needs', value: 'gt_6m', points: 0 },
            { label: '3 – 6 months', value: '3_6m', points: 1 },
            { label: '1 – 3 months', value: '1_3m', points: 3 },
            { label: '0.5 – 1 month (approx. 2 weeks)', value: 'half_1m', points: 5 },
            { label: '< 0.5 month (less than 2 weeks or zero buffer)', value: 'lt_half_m', points: 7 },
          ],
        },
        {
          id: 'fin_debt',
          dimensionId: 'financial',
          name: 'Essential Debt Burden & Arrears',
          maxPoints: 4,
          question: 'What is the household’s debt service burden and arrears on essential commitments?',
          description: 'Focuses on medical debt, rent arrears threatening eviction, moneylender threats, and utility arrears.',
          whyItMatters: 'Heavy debt to predatory lenders or accumulating rent arrears leads to immediate homelessness or harassment.',
          verificationRequirement: 'Lender receipts, landlord notices, hospital bill outstanding balances.',
          options: [
            { label: 'None or minimal (<5% of income, no arrears)', value: 'none', points: 0 },
            { label: '5% – 15% of dependable income', value: 'low', points: 1 },
            { label: '15% – 30% of dependable income', value: 'moderate', points: 2 },
            { label: '> 30% of income or accumulated essential arrears (rent/medicines)', value: 'severe', points: 4 },
          ],
        },
        {
          id: 'fin_stability',
          dimensionId: 'financial',
          name: 'Household Income Stability',
          maxPoints: 4,
          question: 'How predictable and dependable is the primary household income source?',
          description: 'Differentiates salaried/pension stability from precarious daily-wage or seasonal dependency.',
          whyItMatters: 'Daily wagers subject to weather, illness or lack of construction work face high volatility and sudden crises.',
          verificationRequirement: 'Nature of livelihood, ration card BPL status, field investigator note.',
          options: [
            { label: 'Highly stable (permanent job, verified pension)', value: 'highly_stable', points: 0 },
            { label: 'Mostly stable (regular contract, steady micro-enterprise)', value: 'mostly_stable', points: 1 },
            { label: 'Variable (casual labor, seasonal agricultural work)', value: 'variable', points: 2 },
            { label: 'Highly unstable (intermittent daily wage, frequent zero-income weeks)', value: 'highly_unstable', points: 3 },
            { label: 'No reliable income (unemployed, disabled sole earner, total dependency)', value: 'no_income', points: 4 },
          ],
        },
      ],
    },
    {
      id: 'vulnerability',
      name: 'Vulnerability & Dependency',
      maxPoints: 20,
      description: 'Underlying structural vulnerabilities including functional disability, care dependency, and family support gaps.',
      criteria: [
        {
          id: 'vuln_disability',
          dimensionId: 'vulnerability',
          name: 'Functional Disability & Impairment',
          maxPoints: 6,
          question: 'What is the functional limitation and caregiver dependency resulting from physical/mental disability?',
          description: 'Measures activities of daily living (ADL), work capacity, and caregiver requirements, not certificate percentage alone.',
          whyItMatters: 'Severe functional disability increases care costs and reduces earning ability, compounding poverty.',
          verificationRequirement: 'UDID card, government disability certificate, medical specialist assessment.',
          options: [
            { label: 'No meaningful functional limitation', value: 'none', points: 0 },
            { label: 'Mild limitation (independent in daily living, light work possible)', value: 'mild', points: 1 },
            { label: 'Moderate limitation (requires assistance for some tasks, unable to do heavy work)', value: 'moderate', points: 3 },
            { label: 'Severe limitation (cannot perform ADLs without continuous assistance, unable to work)', value: 'severe', points: 5 },
            { label: 'Profound total dependence (bedridden, requires 24/7 caregiving)', value: 'profound', points: 6 },
          ],
        },
        {
          id: 'vuln_dependency',
          dimensionId: 'vulnerability',
          name: 'Household Dependency & Care Burden',
          maxPoints: 5,
          question: 'What is the ratio of non-earning dependents (young children, frail elderly, sick) to capable earning adults?',
          description: 'High dependency strains every earned rupee; full-time caregiving often prevents another adult from working.',
          whyItMatters: 'A single earner supporting 5+ non-earning dependents has far less resilience than a multi-earner family.',
          verificationRequirement: 'Household composition roster, ration card member list, birth dates.',
          options: [
            { label: 'Balanced dependency (≤ 1 dependent per earner)', value: 'balanced', points: 0 },
            { label: 'Moderate dependency (2 dependents per earner)', value: 'moderate', points: 2 },
            { label: 'High dependency (3–4 dependents per earner or multiple young children)', value: 'high', points: 4 },
            { label: 'Severe / Sole earner (5+ dependents, or solo caregiver unable to work)', value: 'severe', points: 5 },
          ],
        },
        {
          id: 'vuln_age',
          dimensionId: 'vulnerability',
          name: 'Age and Life-Stage Vulnerability',
          maxPoints: 3,
          question: 'Does the beneficiary’s age or life-stage create specific objective vulnerability?',
          description: 'Assesses whether life-stage creates dependency (infant, minor orphan, frail elderly without support).',
          whyItMatters: 'Children and frail elderly cannot independently navigate the labor market to protect themselves.',
          verificationRequirement: 'Aadhaar, birth certificate, school record.',
          options: [
            { label: 'Adult capable of self-care and work (Age alone contributes 0 pts)', value: 'adult_independent', points: 0 },
            { label: 'Adolescent or aging adult with emerging health/work limitations', value: 'moderate_lifestage', points: 1 },
            { label: 'Young child requiring adult guardianship or elderly individual with reduced stamina', value: 'vulnerable_age', points: 2 },
            { label: 'Infant/toddler or very frail senior (>75) without independent means', value: 'acute_lifestage', points: 3 },
          ],
        },
        {
          id: 'vuln_family_structure',
          dimensionId: 'vulnerability',
          name: 'Family Support Structure (Orphan, Widow, Single Parent)',
          maxPoints: 4,
          question: 'What is the strength and reliability of the family support system?',
          description: 'Measures absence of reliable parents/guardians or widow/single-parent status without stacking redundant labels.',
          whyItMatters: 'Loss of a spouse or parents strips both financial security and social protection, leaving beneficiaries isolated.',
          verificationRequirement: 'Death certificate, divorce/separation record, community verifier confirmation.',
          options: [
            { label: 'Stable two-parent/intact family support structure', value: 'stable', points: 0 },
            { label: 'Some support limitation (extended family partially involved)', value: 'some_limitation', points: 1 },
            { label: 'Significant support gap (widow/widower with some kin, or separated)', value: 'significant_gap', points: 2 },
            { label: 'Single caregiver / widow with multiple dependent young children', value: 'single_caregiver', points: 3 },
            { label: 'No reliable parent, guardian or adult protector (complete orphan, abandoned elder)', value: 'no_guardian', points: 4 },
          ],
        },
        {
          id: 'vuln_chronic_care',
          dimensionId: 'vulnerability',
          name: 'Chronic Care & Safeguarding Needs',
          maxPoints: 2,
          question: 'Are there ongoing chronic medical conditions or acute safeguarding risks?',
          description: 'Accounts for recurring monthly medication dependency or safeguarding risks (abuse, severe neglect).',
          whyItMatters: 'Chronic dialysis, insulin, or oncology treatments deplete families long-term; safeguarding risks demand protection.',
          verificationRequirement: 'Prescription history, hospital card, field observation report.',
          options: [
            { label: 'None', value: 'none', points: 0 },
            { label: 'Mild chronic condition with modest manageable expenses', value: 'mild', points: 1 },
            { label: 'Severe chronic care dependency or documented safeguarding risk', value: 'severe', points: 2 },
          ],
        },
      ],
    },
    {
      id: 'deprivation',
      name: 'Basic-Necessity Deprivation',
      maxPoints: 15,
      description: 'Multidimensional poverty dimensions: food security, housing, utilities, healthcare, and education access.',
      criteria: [
        {
          id: 'dep_food',
          dimensionId: 'deprivation',
          name: 'Food Security & Nutrition',
          maxPoints: 4,
          question: 'What is the household’s current food security and meal frequency status?',
          description: 'Measures meal skipping, portion reduction, and available grain/rations.',
          whyItMatters: 'Malnutrition impairs children’s development and adult health; no family should go hungry.',
          verificationRequirement: 'Home visit inspection of grain storage, ration card category.',
          options: [
            { label: 'Adequate food access (3 regular meals daily, sufficient grain)', value: 'adequate', points: 0 },
            { label: 'Occasional reduction in portions or quality', value: 'occasional_reduction', points: 1 },
            { label: 'Regular meal reduction (adults skipping meals, 1–2 modest meals)', value: 'regular_reduction', points: 2 },
            { label: 'Frequent skipped meals (children also affected, food borrowing)', value: 'frequent_skipping', points: 3 },
            { label: 'Acute food insecurity (<2 days food stock, going entire days without food)', value: 'acute_insecurity', points: 4 },
          ],
        },
        {
          id: 'dep_housing',
          dimensionId: 'deprivation',
          name: 'Housing & Shelter Stability',
          maxPoints: 3,
          question: 'What is the physical condition and legal stability of the household’s shelter?',
          description: 'Captures homelessness, imminent eviction, hazardous thatched/tin roofs, and severe overcrowding.',
          whyItMatters: 'Loss of shelter precipitates complete social collapse and exposes women and children to acute hazards.',
          verificationRequirement: 'Rental agreement, eviction notice, photographs of living quarters.',
          options: [
            { label: 'Adequate secure housing (owned or stable paid rent)', value: 'adequate', points: 0 },
            { label: 'Rented with minor arrears or moderate overcrowding', value: 'modest_strain', points: 1 },
            { label: 'Unsafe structure (weather exposure, leaking roof, hazardous walls)', value: 'unsafe_structure', points: 2 },
            { label: 'Homeless, informal makeshift tent, or written eviction notice within 14 days', value: 'acute_eviction_homeless', points: 3 },
          ],
        },
        {
          id: 'dep_utilities',
          dimensionId: 'deprivation',
          name: 'Essential Utilities Access',
          maxPoints: 2,
          question: 'Does the household have access to electricity, clean water, clean fuel, and sanitation?',
          description: 'Basic public health infrastructure necessary for human dignity.',
          whyItMatters: 'Lack of clean water and private sanitation leads to recurring infections and safety risks.',
          verificationRequirement: 'Utility bills, field observation of water collection and toilet access.',
          options: [
            { label: 'Full access to power, piped/treated water, and private toilet', value: 'full_access', points: 0 },
            { label: 'Partial deprivation (shared community tap/toilet, frequent power disconnections)', value: 'partial_deprivation', points: 1 },
            { label: 'Severe deprivation (no electricity, open defecation, contaminated water source)', value: 'severe_deprivation', points: 2 },
          ],
        },
        {
          id: 'dep_health',
          dimensionId: 'deprivation',
          name: 'Essential Healthcare & Medication Access',
          maxPoints: 2,
          question: 'Has treatment or essential medication been interrupted due to inability to pay?',
          description: 'Focuses on inability to afford lifesaving prescription drugs or hospital clinic follow-ups.',
          whyItMatters: 'Stopping insulin, cardiac medication, or anti-epileptics causes preventable acute health emergencies.',
          verificationRequirement: 'Hospital discharge slip, pharmacy bills, doctor notes.',
          options: [
            { label: 'Healthcare accessible through public dispensary or affordable self-pay', value: 'accessible', points: 0 },
            { label: 'Intermittent delays in purchasing prescribed medicines', value: 'intermittent_delay', points: 1 },
            { label: 'Critical medications stopped or vital treatment refused due to non-payment', value: 'stopped_treatment', points: 2 },
          ],
        },
        {
          id: 'dep_education',
          dimensionId: 'deprivation',
          name: 'Education Continuity & School Deprivation',
          maxPoints: 2,
          question: 'Are children in the household out of school or facing expulsion due to fee arrears?',
          description: 'Focuses on primary/secondary educational retention rather than elite college coaching.',
          whyItMatters: 'School dropout permanently traps the next generation in intergenerational poverty.',
          verificationRequirement: 'School fee notice, report card, principal reminder letter.',
          options: [
            { label: 'All children enrolled and attending school with fees up to date', value: 'enrolled_stable', points: 0 },
            { label: 'Fee arrears present, warning received or exam hall ticket withheld', value: 'fee_arrears', points: 1 },
            { label: 'Child currently dropped out of school or formal expulsion notice served', value: 'dropped_out', points: 2 },
          ],
        },
        {
          id: 'dep_other',
          dimensionId: 'deprivation',
          name: 'Other Basic Necessities (Hygiene, Transport, Clothing)',
          maxPoints: 2,
          question: 'Is the household deprived of basic clothing, menstrual hygiene, or work transportation?',
          description: 'Dignity goods required for schooling, job hunting, and bodily safety.',
          whyItMatters: 'Lack of decent clothing and transport isolates individuals from work opportunities.',
          verificationRequirement: 'Field verification assessment.',
          options: [
            { label: 'Adequate access to clothing, sanitation, and mobility', value: 'adequate', points: 0 },
            { label: 'Notable deficiency in clothing, sanitary supplies, or local travel means', value: 'deprived', points: 1 },
            { label: 'Acute deprivation affecting daily dignity and mobility', value: 'acute', points: 2 },
          ],
        },
      ],
    },
    {
      id: 'severity',
      name: 'Severity & Urgency',
      maxPoints: 25,
      description: 'Crucial dimension reflecting what happens if assistance is delayed and the expected efficacy of intervention.',
      criteria: [
        {
          id: 'sev_time_urgency',
          dimensionId: 'severity',
          name: 'Time Urgency (Time Until Serious Harm)',
          maxPoints: 8,
          question: 'How quickly will irreversible harm or acute crisis occur if assistance is not provided?',
          description: 'Time window before hospital discharge, surgical cutoff, eviction deadline, or exam date.',
          whyItMatters: 'Timely intervention prevents catastrophic outcomes; money delivered late cannot reverse death or eviction.',
          verificationRequirement: 'Medical admission card, surgical scheduling slip, legal eviction notice, exam date sheet.',
          options: [
            { label: '> 3 months (Elective or medium-term planning)', value: 'gt_3m', points: 0 },
            { label: '1 – 3 months (Approaching deadline)', value: '1_3m', points: 2 },
            { label: '2 – 4 weeks (Clear upcoming deadline)', value: '2_4w', points: 4 },
            { label: '1 – 2 weeks (Imminent crisis)', value: '1_2w', points: 6 },
            { label: '< 72 hours (Acute life/shelter emergency)', value: 'lt_72h', points: 8 },
          ],
        },
        {
          id: 'sev_consequence',
          dimensionId: 'severity',
          name: 'Consequence of No Assistance',
          maxPoints: 7,
          question: 'What is the projected outcome if Il An Noor is unable to provide assistance?',
          description: 'Objectively assesses clinical deterioration, homelessness, arrest, or hunger.',
          whyItMatters: 'Prioritization must direct scarce charitable capital where harm prevention is highest.',
          verificationRequirement: 'Physician prognosis letter, legal notice, social worker inspection.',
          options: [
            { label: 'Limited hardship (minor discomfort, manageable postponement)', value: 'limited', points: 1 },
            { label: 'Moderate deterioration (worsening debt, mild health decline)', value: 'moderate', points: 3 },
            { label: 'Serious hardship (school dropout, loss of productive asset, severe pain)', value: 'serious', points: 4 },
            { label: 'Severe / irreversible harm (permanent disability, organ damage, loss of home)', value: 'severe_harm', points: 6 },
            { label: 'Immediate threat to life, survival, or physical safety', value: 'threat_to_life', points: 7 },
          ],
        },
        {
          id: 'sev_essentiality',
          dimensionId: 'severity',
          name: 'Essentiality of Requested Intervention',
          maxPoints: 4,
          question: 'Is the requested good or service essential to resolving the stated problem?',
          description: 'Distinguishes necessary surgery/tuition/rations from elective enhancements or non-essential items.',
          whyItMatters: 'Funds must be conserved for essential life needs rather than optional comfort items.',
          verificationRequirement: 'Doctor prescription, institutional fee structure, detailed quote.',
          options: [
            { label: 'Optional / non-vital convenience', value: 'optional', points: 0 },
            { label: 'Helpful but non-essential upgrade', value: 'helpful', points: 1 },
            { label: 'Important (significantly eases substantial burden)', value: 'important', points: 2 },
            { label: 'Essential (core component required to address the crisis)', value: 'essential', points: 3 },
            { label: 'Critical (no substitute exists; without it the intervention fails)', value: 'critical', points: 4 },
          ],
        },
        {
          id: 'sev_benefit',
          dimensionId: 'severity',
          name: 'Expected Meaningful Benefit from Assistance',
          maxPoints: 6,
          question: 'Can the requested assistance reasonably resolve a meaningful part of the core problem?',
          description: 'Evaluates therapeutic efficacy (clinical benefit), educational completion, or livelihood restoration.',
          whyItMatters: 'Ensures charitable grants effect genuine change rather than futile or misdirected expenditure.',
          verificationRequirement: 'Clinician medical opinion, vocational feasibility review, school verification.',
          options: [
            { label: 'Unclear or speculative benefit / very poor prognosis without clinical justification', value: 'unclear', points: 1 },
            { label: 'Limited temporary relief without solving root constraint', value: 'temporary_relief', points: 3 },
            { label: 'Meaningful stabilization / substantial relief of suffering', value: 'meaningful_relief', points: 4 },
            { label: 'Major stabilization / secures school graduation or stable livelihood restoration', value: 'major_stabilization', points: 5 },
            { label: 'Curative / life-saving / fully restores independent functional capacity', value: 'curative_life_saving', points: 6 },
          ],
        },
      ],
    },
    {
      id: 'support_gap',
      name: 'Support & Funding Gap',
      maxPoints: 10,
      description: 'Determines whether other realistic sources (kin, government schemes, insurance) exist or if Il An Noor is the sole lifeline.',
      criteria: [
        {
          id: 'gap_family_community',
          dimensionId: 'support_gap',
          name: 'Family and Community Support',
          maxPoints: 3,
          question: 'Can relatives, friends or local community realistically contribute to meet this need?',
          description: 'Does not assume support merely because relatives exist; examines their actual economic capacity.',
          whyItMatters: 'Community mutual aid should be mobilized where able, preserving foundation funds for isolated cases.',
          verificationRequirement: 'Inquiry into kin financial standing and community contribution receipts.',
          options: [
            { label: 'Strong dependable support (relatives able and actively helping)', value: 'strong', points: 0 },
            { label: 'Moderate support (relatives contribute occasionally or cover small share)', value: 'moderate', points: 1 },
            { label: 'Minimal sympathetic support (relatives in deep poverty themselves)', value: 'minimal', points: 2 },
            { label: 'No support available (isolated, estranged, or all kin destitute)', value: 'none', points: 3 },
          ],
        },
        {
          id: 'gap_government_schemes',
          dimensionId: 'support_gap',
          name: 'Government & Institutional Scheme Availability',
          maxPoints: 3,
          question: 'Are government welfare schemes (Ayushman Bharat, pensions, scholarships) accessible for this case?',
          description: 'Ascertains whether public entitlements cover the need or if the applicant was rejected/uncovered.',
          whyItMatters: 'Staff must help beneficiaries claim state rights; foundation funds fill the uncovered gap.',
          verificationRequirement: 'PM-JAY card check, portal rejection slip, hospital scheme office confirmation.',
          options: [
            { label: 'Substantial scheme coverage available (covers majority of expense)', value: 'substantial', points: 0 },
            { label: 'Partial scheme accessible (covers minor share; balance needed)', value: 'partial', points: 1 },
            { label: 'Applied and pending review, but urgent gap remains', value: 'pending', points: 2 },
            { label: 'No government scheme applicable, applicant ineligible, or scheme exhausted', value: 'none_available', points: 3 },
          ],
        },
        {
          id: 'gap_remaining_ratio',
          dimensionId: 'support_gap',
          name: 'Remaining Uncovered Funding Gap',
          maxPoints: 4,
          question: 'What percentage of the verified requirement remains completely uncovered?',
          description: 'Proportion of the verified bill remaining after accounting for existing savings and other NGO commitments.',
          whyItMatters: 'A case with a 90% deficit is stalled and cannot proceed without substantial foundation backing.',
          verificationRequirement: 'Itemized budget, invoices, proof of other donor commitments.',
          options: [
            { label: '< 25% gap remaining (small top-up needed)', value: 'lt_25', points: 1 },
            { label: '25% – 50% gap remaining', value: '25_50', points: 2 },
            { label: '51% – 75% gap remaining', value: '51_75', points: 3 },
            { label: '> 75% gap remaining (foundation is primary/sole funder)', value: 'gt_75', points: 4 },
          ],
        },
      ],
    },
  ],
};
