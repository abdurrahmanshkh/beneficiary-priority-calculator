import {
  BeneficiaryCase,
  CalculatedScore,
  DeprivationProfile,
  FinancialProfile,
  PriorityBand,
  ScoreTraceItem,
  SeverityUrgencyProfile,
  SupportGapProfile,
  VulnerabilityProfile,
  ZakatAssessment,
} from '@/types/beneficiary';
import { INBPI_POLICY_V01, ScoringPolicy } from '../policy/scoringPolicy';
import { DEFAULT_ZAKAT_POLICY, getActiveNisabINR, ZakatPolicyConfig } from '../policy/zakatPolicy';

export interface ScoreCalculationResult {
  calculatedScore: CalculatedScore;
}

export function calculateCoverageScore(
  dependableIncome: number,
  essentialExpenses: number
): { points: number; coveragePercent: number; explanation: string } {
  const safeExpenses = Math.max(1, essentialExpenses);
  const ratio = dependableIncome / safeExpenses;
  const percent = Math.round(ratio * 100);

  if (ratio >= 1.5) {
    return { points: 0, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (comfortable surplus: +0 pts)` };
  }
  if (ratio >= 1.25) {
    return { points: 2, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (modest cushion: +2 pts)` };
  }
  if (ratio >= 1.0) {
    return { points: 4, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (breakeven: +4 pts)` };
  }
  if (ratio >= 0.8) {
    return { points: 7, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (slight monthly deficit: +7 pts)` };
  }
  if (ratio >= 0.6) {
    return { points: 10, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (moderate chronic deficit: +10 pts)` };
  }
  if (ratio >= 0.4) {
    return { points: 13, coveragePercent: percent, explanation: `Income covers ${percent}% of essential needs (severe deficit, skipping essentials: +13 pts)` };
  }
  return { points: 15, coveragePercent: percent, explanation: `Income covers only ${percent}% of essential needs (acute income collapse: +15 pts)` };
}

export function calculateReservesScore(
  liquidAssets: number,
  essentialExpenses: number
): { points: number; reserveMonths: number; explanation: string } {
  const safeExpenses = Math.max(1, essentialExpenses);
  const months = parseFloat((liquidAssets / safeExpenses).toFixed(1));

  if (months > 6.0) {
    return { points: 0, reserveMonths: months, explanation: `Accessible reserves cover >6 months (${months} mo: +0 pts)` };
  }
  if (months >= 3.0) {
    return { points: 1, reserveMonths: months, explanation: `Accessible reserves cover 3–6 months (${months} mo: +1 pt)` };
  }
  if (months >= 1.0) {
    return { points: 3, reserveMonths: months, explanation: `Accessible reserves cover 1–3 months (${months} mo: +3 pts)` };
  }
  if (months >= 0.5) {
    return { points: 5, reserveMonths: months, explanation: `Accessible reserves cover 2–4 weeks (${months} mo: +5 pts)` };
  }
  return { points: 7, reserveMonths: months, explanation: `Accessible reserves cover <2 weeks or zero buffer (${months} mo: +7 pts)` };
}

export function calculateDebtScore(
  debtBurdenRatio: number,
  hasSevereArrears: boolean
): { points: number; explanation: string } {
  if (hasSevereArrears || debtBurdenRatio > 0.3) {
    return { points: 4, explanation: `High debt burden (>30% of income or critical arrears threatening eviction/medicines: +4 pts)` };
  }
  if (debtBurdenRatio >= 0.15) {
    return { points: 3, explanation: `Substantial debt payments (15–30% of income: +3 pts)` };
  }
  if (debtBurdenRatio >= 0.05) {
    return { points: 2, explanation: `Moderate debt burden (5–15% of income: +2 pts)` };
  }
  if (debtBurdenRatio > 0.0) {
    return { points: 1, explanation: `Low debt burden (<5% of income: +1 pt)` };
  }
  return { points: 0, explanation: `No significant debt burden (+0 pts)` };
}

export function calculateFinancialScore(
  financial: FinancialProfile,
  policy: ScoringPolicy = INBPI_POLICY_V01
): { score: number; trace: ScoreTraceItem[] } {
  const trace: ScoreTraceItem[] = [];

  // 1. Coverage
  const totalExpenses = financial.essentialMonthlyExpenses?.total || 0;
  const coverage = calculateCoverageScore(financial.dependableMonthlyIncome, totalExpenses);
  trace.push({
    criterionId: 'fin_coverage',
    dimension: 'Financial Need',
    criterionName: 'Monthly Essential Needs Coverage',
    answer: `${coverage.coveragePercent}% coverage`,
    points: coverage.points,
    maxPoints: 15,
    explanation: coverage.explanation,
    policyReference: `${policy.version} §8.1`,
  });

  // 2. Reserves
  const liquidTotal = financial.liquidAssets?.totalLiquid || 0;
  const reserves = calculateReservesScore(liquidTotal, totalExpenses);
  trace.push({
    criterionId: 'fin_reserves',
    dimension: 'Financial Need',
    criterionName: 'Accessible Liquid Reserves',
    answer: `${reserves.reserveMonths} months`,
    points: reserves.points,
    maxPoints: 7,
    explanation: reserves.explanation,
    policyReference: `${policy.version} §9`,
  });

  // 3. Debt
  const debt = financial.debtObligations;
  const monthlyDebt = debt?.monthlyDebtPayment || 0;
  const safeIncome = Math.max(1, financial.dependableMonthlyIncome);
  const debtRatio = monthlyDebt / safeIncome;
  const hasArrears = (debt?.rentArrears || 0) > 0 || (debt?.medicalDebt || 0) > 0;
  const debtScore = calculateDebtScore(debtRatio, hasArrears);
  trace.push({
    criterionId: 'fin_debt',
    dimension: 'Financial Need',
    criterionName: 'Essential Debt Burden & Arrears',
    answer: `${Math.round(debtRatio * 100)}% of income (Arrears: ₹${(debt?.rentArrears || 0) + (debt?.medicalDebt || 0)})`,
    points: debtScore.points,
    maxPoints: 4,
    explanation: debtScore.explanation,
    policyReference: `${policy.version} §10`,
  });

  // 4. Income Stability
  let stabPoints = 0;
  let stabLabel = 'Highly Stable';
  switch (financial.incomeStability) {
    case 'no_reliable_income':
      stabPoints = 4;
      stabLabel = 'No Reliable Income';
      break;
    case 'highly_unstable':
      stabPoints = 3;
      stabLabel = 'Highly Unstable Daily Wage';
      break;
    case 'variable':
      stabPoints = 2;
      stabLabel = 'Variable Seasonal Income';
      break;
    case 'mostly_stable':
      stabPoints = 1;
      stabLabel = 'Mostly Stable Informal Contract';
      break;
    case 'highly_stable':
    default:
      stabPoints = 0;
      stabLabel = 'Highly Stable Salaried / Pension';
      break;
  }
  trace.push({
    criterionId: 'fin_stability',
    dimension: 'Financial Need',
    criterionName: 'Household Income Stability',
    answer: stabLabel,
    points: stabPoints,
    maxPoints: 4,
    explanation: `Income source is categorized as ${stabLabel} (+${stabPoints} pts)`,
    policyReference: `${policy.version} §11`,
  });

  const total = Math.min(30, Math.max(0, coverage.points + reserves.points + debtScore.points + stabPoints));
  return { score: total, trace };
}

export function calculateVulnerabilityScore(
  vulnerability: VulnerabilityProfile,
  householdCount: number,
  earnerCount: number,
  policy: ScoringPolicy = INBPI_POLICY_V01
): { score: number; trace: ScoreTraceItem[] } {
  const trace: ScoreTraceItem[] = [];

  // 1. Functional Disability
  const dis = vulnerability.functionalDisability;
  let disPoints = 0;
  let disLabel = 'None';
  switch (dis.functionalImpact) {
    case 'profound':
      disPoints = 6;
      disLabel = 'Profound Total Dependence';
      break;
    case 'severe':
      disPoints = 5;
      disLabel = 'Severe Functional Limitation';
      break;
    case 'moderate':
      disPoints = 3;
      disLabel = 'Moderate Functional Limitation';
      break;
    case 'mild':
      disPoints = 1;
      disLabel = 'Mild Functional Limitation';
      break;
    case 'none':
    default:
      disPoints = 0;
      disLabel = 'No Meaningful Limitation';
      break;
  }
  trace.push({
    criterionId: 'vuln_disability',
    dimension: 'Vulnerability & Dependency',
    criterionName: 'Functional Disability & Impairment',
    answer: disLabel,
    points: disPoints,
    maxPoints: 6,
    explanation: `Assessed functional impact on activities of daily living: ${disLabel} (+${disPoints} pts)`,
    policyReference: `${policy.version} §12.1`,
  });

  // 2. Dependency Burden
  const safeEarners = Math.max(0, earnerCount);
  const totalPeople = Math.max(1, householdCount);
  const dependents = Math.max(0, totalPeople - safeEarners);
  let depPoints = 0;
  let depLabel = 'Balanced';

  if (safeEarners === 0 || dependents >= 5) {
    depPoints = 5;
    depLabel = 'Severe / Sole Earner with 5+ Dependents';
  } else {
    const ratio = dependents / Math.max(1, safeEarners);
    if (ratio >= 3) {
      depPoints = 4;
      depLabel = 'High Dependency Burden (3–4 dependents per earner)';
    } else if (ratio >= 2) {
      depPoints = 2;
      depLabel = 'Moderate Dependency Burden (2 dependents per earner)';
    } else {
      depPoints = 0;
      depLabel = 'Balanced Dependency Ratio';
    }
  }

  trace.push({
    criterionId: 'vuln_dependency',
    dimension: 'Vulnerability & Dependency',
    criterionName: 'Household Dependency & Care Burden',
    answer: `${dependents} dependents / ${safeEarners} earners`,
    points: depPoints,
    maxPoints: 5,
    explanation: `${depLabel} (+${depPoints} pts)`,
    policyReference: `${policy.version} §13`,
  });

  // 3. Age & Life-Stage Vulnerability
  const ageObj = vulnerability.ageVulnerability;
  let agePoints = 0;
  let ageLabel = 'Capable Adult (0 pts)';
  if (ageObj.createsVulnerability) {
    switch (ageObj.lifeStage) {
      case 'infant':
        agePoints = 3;
        ageLabel = 'Infant / Toddler requiring full adult protection';
        break;
      case 'older_adult':
        agePoints = ageObj.primaryBeneficiaryAge >= 75 ? 3 : 2;
        ageLabel = `Elderly individual (Age ${ageObj.primaryBeneficiaryAge}) with objective physical decline`;
        break;
      case 'child':
        agePoints = 2;
        ageLabel = 'Minor child under dependent care';
        break;
      case 'adolescent':
        agePoints = 1;
        ageLabel = 'Adolescent facing school-to-work barrier';
        break;
      default:
        agePoints = 0;
        ageLabel = 'Capable adult without age-induced vulnerability';
        break;
    }
  }
  trace.push({
    criterionId: 'vuln_age',
    dimension: 'Vulnerability & Dependency',
    criterionName: 'Age and Life-Stage Vulnerability',
    answer: `Age ${ageObj.primaryBeneficiaryAge} (${ageObj.lifeStage})`,
    points: agePoints,
    maxPoints: 3,
    explanation: `${ageLabel} (+${agePoints} pts)`,
    policyReference: `${policy.version} §14`,
  });

  // 4. Family Structure (Widow, Orphan, Single Parent)
  const fam = vulnerability.familyStructure;
  let famPoints = 0;
  let famLabel = 'Stable Family';
  switch (fam.circumstance) {
    case 'no_reliable_guardian':
      famPoints = 4;
      famLabel = 'No Reliable Parent or Guardian (Complete Orphan / Abandoned)';
      break;
    case 'single_caregiver':
      famPoints = 3;
      famLabel = 'Solo Caregiver / Widow with dependent children';
      break;
    case 'significant_gap':
      famPoints = 2;
      famLabel = 'Significant Support Gap (Separated / Widow with limited kin)';
      break;
    case 'some_limitation':
      famPoints = 1;
      famLabel = 'Some Support Limitation';
      break;
    case 'stable':
    default:
      famPoints = 0;
      famLabel = 'Stable Two-Parent / Extended Family Support';
      break;
  }
  trace.push({
    criterionId: 'vuln_family_structure',
    dimension: 'Vulnerability & Dependency',
    criterionName: 'Family Support Structure (Orphan, Widow, Single Parent)',
    answer: `${fam.category}: ${famLabel}`,
    points: famPoints,
    maxPoints: 4,
    explanation: `Social structure vulnerability without category stacking: ${famLabel} (+${famPoints} pts)`,
    policyReference: `${policy.version} §15`,
  });

  // 5. Chronic Care & Safeguarding
  const chr = vulnerability.chronicCareSafeguarding;
  let chrPoints = 0;
  if (chr.safeguardingRisk === 'high' || (chr.hasChronicIllness && chr.monthlyMedicationCost > 3000)) {
    chrPoints = 2;
  } else if (chr.hasChronicIllness || chr.safeguardingRisk === 'moderate' || chr.recurringMedicationNeeds) {
    chrPoints = 1;
  }
  trace.push({
    criterionId: 'vuln_chronic_care',
    dimension: 'Vulnerability & Dependency',
    criterionName: 'Chronic Care & Safeguarding Needs',
    answer: chr.hasChronicIllness ? `Chronic condition (Med cost: ₹${chr.monthlyMedicationCost}/mo)` : 'None',
    points: chrPoints,
    maxPoints: 2,
    explanation: `Safeguarding / chronic care load assessed at +${chrPoints} pts`,
    policyReference: `${policy.version} §16`,
  });

  const total = Math.min(20, Math.max(0, disPoints + depPoints + agePoints + famPoints + chrPoints));
  return { score: total, trace };
}

export function calculateDeprivationScore(
  deprivation: DeprivationProfile,
  policy: ScoringPolicy = INBPI_POLICY_V01
): { score: number; trace: ScoreTraceItem[] } {
  const trace: ScoreTraceItem[] = [];

  // 1. Food Security (0-4)
  const foodPts = Math.min(4, Math.max(0, deprivation.foodSecurity.score));
  trace.push({
    criterionId: 'dep_food',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Food Security & Nutrition',
    answer: `${foodPts}/4 severity (${deprivation.foodSecurity.mealsPerDay} meals/day)`,
    points: foodPts,
    maxPoints: 4,
    explanation: `Food deprivation level rated at +${foodPts} pts based on meal frequency and available stock`,
    policyReference: `${policy.version} §17.1`,
  });

  // 2. Housing (0-3)
  const housePts = Math.min(3, Math.max(0, deprivation.housingCondition.score));
  trace.push({
    criterionId: 'dep_housing',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Housing & Shelter Stability',
    answer: `${deprivation.housingCondition.type}`,
    points: housePts,
    maxPoints: 3,
    explanation: `Shelter precariousness rated at +${housePts} pts (${deprivation.housingCondition.type})`,
    policyReference: `${policy.version} §17.2`,
  });

  // 3. Utilities (0-2)
  const utilPts = Math.min(2, Math.max(0, deprivation.utilitiesAccess.score));
  trace.push({
    criterionId: 'dep_utilities',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Essential Utilities Access',
    answer: `${utilPts}/2 deprivation`,
    points: utilPts,
    maxPoints: 2,
    explanation: `Access to clean water, power, sanitation rated at +${utilPts} pts`,
    policyReference: `${policy.version} §17.3`,
  });

  // 4. Healthcare Access (0-2)
  const healthPts = Math.min(2, Math.max(0, deprivation.healthAccess.score));
  trace.push({
    criterionId: 'dep_health',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Essential Healthcare & Medication Access',
    answer: `${healthPts}/2 barrier`,
    points: healthPts,
    maxPoints: 2,
    explanation: `Inability to afford essential medicines or care rated at +${healthPts} pts`,
    policyReference: `${policy.version} §17.4`,
  });

  // 5. Education Deprivation (0-2)
  const eduPts = Math.min(2, Math.max(0, deprivation.educationDeprivation.score));
  trace.push({
    criterionId: 'dep_education',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Education Continuity & School Deprivation',
    answer: `${eduPts}/2 barrier`,
    points: eduPts,
    maxPoints: 2,
    explanation: `Children at risk of dropout or out of school rated at +${eduPts} pts`,
    policyReference: `${policy.version} §17.5`,
  });

  // 6. Other basic needs (0-2)
  const otherPts = Math.min(2, Math.max(0, deprivation.otherBasicNeeds.score));
  trace.push({
    criterionId: 'dep_other',
    dimension: 'Basic-Necessity Deprivation',
    criterionName: 'Other Basic Necessities',
    answer: `${otherPts}/2 deprivation`,
    points: otherPts,
    maxPoints: 2,
    explanation: `Sanitation, clothing, and mobility deficits rated at +${otherPts} pts`,
    policyReference: `${policy.version} §17.6`,
  });

  const total = Math.min(15, Math.max(0, foodPts + housePts + utilPts + healthPts + eduPts + otherPts));
  return { score: total, trace };
}

export function calculateSeverityScore(
  severity: SeverityUrgencyProfile,
  policy: ScoringPolicy = INBPI_POLICY_V01
): { score: number; trace: ScoreTraceItem[]; emergencyTrigger: boolean } {
  const trace: ScoreTraceItem[] = [];

  // 1. Time Urgency (0-8)
  let timePts = 0;
  let timeLabel = '> 3 months';
  switch (severity.timeUrgency.timeUntilHarm) {
    case 'less_than_72h':
      timePts = 8;
      timeLabel = '< 72 hours (Acute life/shelter emergency)';
      break;
    case '1_to_2_weeks':
      timePts = 6;
      timeLabel = '1–2 weeks (Imminent crisis)';
      break;
    case '2_to_4_weeks':
      timePts = 4;
      timeLabel = '2–4 weeks (Clear upcoming deadline)';
      break;
    case '1_to_3_months':
      timePts = 2;
      timeLabel = '1–3 months (Medium-term approaching)';
      break;
    case 'more_than_3_months':
    default:
      timePts = 0;
      timeLabel = '> 3 months (Elective or non-urgent)';
      break;
  }
  trace.push({
    criterionId: 'sev_time_urgency',
    dimension: 'Severity & Urgency',
    criterionName: 'Time Urgency (Time Until Serious Harm)',
    answer: timeLabel,
    points: timePts,
    maxPoints: 8,
    explanation: `Harm anticipated within: ${timeLabel} (+${timePts} pts)`,
    policyReference: `${policy.version} §18.1`,
  });

  // 2. Consequence of No Assistance (1-7)
  let conPts = 1;
  let conLabel = 'Limited Hardship';
  switch (severity.consequenceOfNoAssistance.consequence) {
    case 'threat_to_life_or_shelter':
      conPts = 7;
      conLabel = 'Immediate Threat to Life, Shelter or Physical Safety';
      break;
    case 'severe_irreversible_harm':
      conPts = 6;
      conLabel = 'Severe / Irreversible Harm (Permanent Disability, Organ Loss)';
      break;
    case 'serious_hardship':
      conPts = 4;
      conLabel = 'Serious Hardship (School Dropout, Asset Loss, Severe Pain)';
      break;
    case 'moderate_deterioration':
      conPts = 3;
      conLabel = 'Moderate Deterioration (Worsening Debt, Mild Health Decline)';
      break;
    case 'limited_hardship':
    default:
      conPts = 1;
      conLabel = 'Limited Hardship (Manageable Postponement)';
      break;
  }
  trace.push({
    criterionId: 'sev_consequence',
    dimension: 'Severity & Urgency',
    criterionName: 'Consequence of No Assistance',
    answer: conLabel,
    points: conPts,
    maxPoints: 7,
    explanation: `Projected consequence if assistance is delayed: ${conLabel} (+${conPts} pts)`,
    policyReference: `${policy.version} §18.2`,
  });

  // 3. Essentiality of Requested Intervention (0-4)
  let essPts = 0;
  let essLabel = 'Optional';
  switch (severity.essentialityOfIntervention.level) {
    case 'critical':
      essPts = 4;
      essLabel = 'Critical (No substitute exists; vital to crisis resolution)';
      break;
    case 'essential':
      essPts = 3;
      essLabel = 'Essential (Core component required)';
      break;
    case 'important':
      essPts = 2;
      essLabel = 'Important (Significantly eases major burden)';
      break;
    case 'helpful_non_essential':
      essPts = 1;
      essLabel = 'Helpful but non-essential';
      break;
    case 'optional':
    default:
      essPts = 0;
      essLabel = 'Optional convenience';
      break;
  }
  trace.push({
    criterionId: 'sev_essentiality',
    dimension: 'Severity & Urgency',
    criterionName: 'Essentiality of Requested Intervention',
    answer: essLabel,
    points: essPts,
    maxPoints: 4,
    explanation: `Essentiality rated at: ${essLabel} (+${essPts} pts)`,
    policyReference: `${policy.version} §18.3`,
  });

  // 4. Expected Meaningful Benefit (0-6)
  let benPts = 1;
  let benLabel = 'Unclear benefit';
  switch (severity.expectedBenefit.level) {
    case 'restores_functioning_or_life_saving':
      benPts = 6;
      benLabel = 'Curative / Life-Saving / Fully restores independent functional capacity';
      break;
    case 'major_stabilization':
      benPts = 5;
      benLabel = 'Major stabilization / Secures graduation or livelihood restoration';
      break;
    case 'meaningful_relief':
      benPts = 4;
      benLabel = 'Meaningful relief / Substantial suffering reduction';
      break;
    case 'limited_temporary_relief':
      benPts = 3;
      benLabel = 'Limited temporary relief';
      break;
    case 'unclear_benefit':
    default:
      benPts = 1;
      benLabel = 'Unclear or speculative therapeutic benefit';
      break;
  }
  trace.push({
    criterionId: 'sev_benefit',
    dimension: 'Severity & Urgency',
    criterionName: 'Expected Meaningful Benefit from Assistance',
    answer: benLabel,
    points: benPts,
    maxPoints: 6,
    explanation: `Anticipated efficacy: ${benLabel} (+${benPts} pts)`,
    policyReference: `${policy.version} §18.4`,
  });

  const emergencyTrigger =
    severity.emergencyTrigger ||
    severity.timeUrgency.timeUntilHarm === 'less_than_72h' ||
    severity.consequenceOfNoAssistance.consequence === 'threat_to_life_or_shelter';

  const total = Math.min(25, Math.max(0, timePts + conPts + essPts + benPts));
  return { score: total, trace, emergencyTrigger };
}

export function calculateSupportGapScore(
  supportGap: SupportGapProfile,
  policy: ScoringPolicy = INBPI_POLICY_V01
): { score: number; trace: ScoreTraceItem[] } {
  const trace: ScoreTraceItem[] = [];

  // 1. Family & Community Support (0-3)
  let famPts = 0;
  let famLabel = 'Strong';
  switch (supportGap.familyCommunitySupport.level) {
    case 'no_support':
      famPts = 3;
      famLabel = 'No support available (isolated or kin destitute)';
      break;
    case 'minimal_sympathetic':
      famPts = 2;
      famLabel = 'Minimal sympathetic support only';
      break;
    case 'moderate_occasional':
      famPts = 1;
      famLabel = 'Moderate occasional help';
      break;
    case 'strong_dependable':
    default:
      famPts = 0;
      famLabel = 'Strong dependable kin support';
      break;
  }
  trace.push({
    criterionId: 'gap_family_community',
    dimension: 'Support & Funding Gap',
    criterionName: 'Family and Community Support',
    answer: famLabel,
    points: famPts,
    maxPoints: 3,
    explanation: `Available kin network capacity: ${famLabel} (+${famPts} pts)`,
    policyReference: `${policy.version} §19.1`,
  });

  // 2. Government & Institutional Schemes (0-3)
  let govPts = 0;
  let govLabel = 'Substantial';
  switch (supportGap.governmentOtherSchemes.level) {
    case 'none_available_or_rejected':
      govPts = 3;
      govLabel = 'No government scheme applicable / rejected / exhausted';
      break;
    case 'applied_pending':
      govPts = 2;
      govLabel = 'Applied & pending review, but critical gap remains';
      break;
    case 'partial_scheme_accessible':
      govPts = 1;
      govLabel = 'Partial scheme accessible (covers minor fraction)';
      break;
    case 'substantial_scheme_covering_majority':
    default:
      govPts = 0;
      govLabel = 'Substantial scheme coverage available';
      break;
  }
  trace.push({
    criterionId: 'gap_government_schemes',
    dimension: 'Support & Funding Gap',
    criterionName: 'Government & Institutional Scheme Availability',
    answer: govLabel,
    points: govPts,
    maxPoints: 3,
    explanation: `Public welfare coverage status: ${govLabel} (+${govPts} pts)`,
    policyReference: `${policy.version} §19.2`,
  });

  // 3. Remaining Uncovered Funding Gap (1-4)
  const rem = supportGap.remainingFundingGap;
  const verifiedNeed = Math.max(1, rem.verifiedTotalNeed || rem.requestedFromIlAnNoor || 1);
  const otherFunds = (rem.existingAvailableFunds || 0) + (rem.otherCommittedFunds || 0);
  const remainingGap = Math.max(0, verifiedNeed - otherFunds);
  const gapRatio = remainingGap / verifiedNeed;

  let gapPts = 1;
  let gapLabel = '< 25%';
  if (gapRatio > 0.75) {
    gapPts = 4;
    gapLabel = '> 75% uncovered (Il An Noor is primary/sole funder)';
  } else if (gapRatio > 0.5) {
    gapPts = 3;
    gapLabel = '51%–75% uncovered';
  } else if (gapRatio >= 0.25) {
    gapPts = 2;
    gapLabel = '25%–50% uncovered';
  } else {
    gapPts = 1;
    gapLabel = '< 25% uncovered (top-up required)';
  }

  trace.push({
    criterionId: 'gap_remaining_ratio',
    dimension: 'Support & Funding Gap',
    criterionName: 'Remaining Uncovered Funding Gap',
    answer: `${Math.round(gapRatio * 100)}% gap (₹${remainingGap.toLocaleString('en-IN')})`,
    points: gapPts,
    maxPoints: 4,
    explanation: `Uncovered funding deficit: ${gapLabel} (+${gapPts} pts)`,
    policyReference: `${policy.version} §19.3`,
  });

  const total = Math.min(10, Math.max(0, famPts + govPts + gapPts));
  return { score: total, trace };
}

export function determinePriorityBand(
  totalScore: number,
  policy: ScoringPolicy = INBPI_POLICY_V01
): PriorityBand {
  for (const band of policy.priorityBands) {
    if (totalScore >= band.minScore && totalScore <= band.maxScore) {
      return band.name;
    }
  }
  return totalScore >= 70 ? 'Very High' : 'Moderate';
}

export function calculateZakatEligibility(
  zakat: ZakatAssessment,
  zakatPolicy: ZakatPolicyConfig = DEFAULT_ZAKAT_POLICY
): ZakatAssessment {
  const totalAssessable =
    (zakat.assessableCashSavings || 0) +
    (zakat.assessableGoldSilverValue || 0) +
    (zakat.assessableInvestmentsTradeGoods || 0);

  const totalDeductions =
    (zakat.deductibleImmediateLiabilities || 0) +
    (zakat.deductibleBasicMonthlyLivingExpenses || 0);

  const netAssessableWealth = Math.max(0, totalAssessable - totalDeductions);
  const nisabINR = getActiveNisabINR(zakatPolicy);
  const isBelowNisab = netAssessableWealth < nisabINR;

  let preliminaryEligibility: 'Eligible' | 'Ineligible' | 'Requires Scholarly Review' = 'Ineligible';

  if (isBelowNisab) {
    preliminaryEligibility = 'Eligible';
  } else if (zakat.recipientCategory === 'gharimin') {
    // A debtor with massive debt may be eligible under Gharimin category even if they possess assets,
    // if their debts exceed their realizable assets.
    preliminaryEligibility =
      (zakat.deductibleImmediateLiabilities || 0) > totalAssessable
        ? 'Eligible'
        : 'Requires Scholarly Review';
  } else {
    preliminaryEligibility = 'Ineligible';
  }

  return {
    ...zakat,
    netAssessableWealth,
    nisabThresholdSilverINR: nisabINR,
    isBelowNisab,
    preliminaryEligibility,
  };
}

export function calculateTotalScore(
  caseData: Partial<BeneficiaryCase>,
  policy: ScoringPolicy = INBPI_POLICY_V01
): CalculatedScore {
  const financialResult = calculateFinancialScore(
    caseData.financial || ({} as FinancialProfile),
    policy
  );

  const householdMembers = caseData.household || [];
  const earnerCount = householdMembers.filter(
    (m) => (m.monthlyIncome || 0) > 0 && m.employmentStatus !== 'Unemployed'
  ).length;

  const vulnerabilityResult = calculateVulnerabilityScore(
    caseData.vulnerability || ({} as VulnerabilityProfile),
    Math.max(1, householdMembers.length),
    earnerCount,
    policy
  );

  const deprivationResult = calculateDeprivationScore(
    caseData.deprivation || ({} as DeprivationProfile),
    policy
  );

  const severityResult = calculateSeverityScore(
    caseData.severity || ({} as SeverityUrgencyProfile),
    policy
  );

  const supportGapResult = calculateSupportGapScore(
    caseData.supportGap || ({} as SupportGapProfile),
    policy
  );

  // Exact Sum
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      financialResult.score +
        vulnerabilityResult.score +
        deprivationResult.score +
        severityResult.score +
        supportGapResult.score
    )
  );

  const priorityBand = determinePriorityBand(totalScore, policy);
  const allTraces = [
    ...financialResult.trace,
    ...vulnerabilityResult.trace,
    ...deprivationResult.trace,
    ...severityResult.trace,
    ...supportGapResult.trace,
  ];

  // Identify top contributing factors (criteria with highest proportion of their max points)
  const sortedFactors = [...allTraces]
    .sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints)
    .filter((f) => f.points > 0)
    .slice(0, 4)
    .map((f) => `${f.criterionName}: ${f.answer} (+${f.points} pts)`);

  // Assess data completeness
  const missingFields: string[] = [];
  if (!caseData.fullName) missingFields.push('Beneficiary Full Name');
  if (!caseData.phone) missingFields.push('Contact Phone');
  if (!caseData.requestedAmount) missingFields.push('Requested Amount');
  if (!caseData.caseType) missingFields.push('Case Category');
  if (householdMembers.length === 0) missingFields.push('Household Members Roster');
  if (!caseData.narrativeDescription) missingFields.push('Case Narrative Description');

  const totalExpectedFields = 15;
  const completedFields = totalExpectedFields - missingFields.length;
  const dataCompletenessPercent = Math.round((completedFields / totalExpectedFields) * 100);
  const isProvisional = dataCompletenessPercent < 80 || (caseData.verification?.confidenceLevel === 'Low');

  const targetingEligible = totalScore >= policy.targetingThreshold;
  const prioritized = totalScore >= policy.prioritizationThreshold;
  const isNearThreshold = Math.abs(totalScore - policy.prioritizationThreshold) <= policy.nearThresholdRange;

  return {
    totalScore,
    financialScore: financialResult.score,
    vulnerabilityScore: vulnerabilityResult.score,
    deprivationScore: deprivationResult.score,
    severityScore: severityResult.score,
    supportGapScore: supportGapResult.score,
    priorityBand,
    isProvisional,
    dataCompletenessPercent,
    missingKeyFields: missingFields,
    emergencyTriggered: severityResult.emergencyTrigger,
    emergencyReason: severityResult.emergencyTrigger
      ? 'Acute crisis: time urgency <72 hours, severe food deprivation, or life-threatening emergency.'
      : undefined,
    targetingEligible,
    prioritized,
    isNearThreshold,
    scoreTrace: allTraces,
    topContributingFactors: sortedFactors,
    calculatedAt: new Date().toISOString(),
    policyVersion: policy.version,
  };
}

export function compareTwoCasesForTie(
  caseA: BeneficiaryCase,
  caseB: BeneficiaryCase,
  tieThreshold: number = 2.0
): {
  isSubstantivelyTied: boolean;
  scoreDifference: number;
  favoredCaseId?: string;
  tieBreakReason?: string;
} {
  const scoreA = caseA.calculatedScore.totalScore;
  const scoreB = caseB.calculatedScore.totalScore;
  const diff = Math.abs(scoreA - scoreB);

  if (diff > tieThreshold) {
    return {
      isSubstantivelyTied: false,
      scoreDifference: diff,
      favoredCaseId: scoreA > scoreB ? caseA.id : caseB.id,
      tieBreakReason: `Case ${scoreA > scoreB ? caseA.id : caseB.id} scores higher by ${diff.toFixed(1)} points exceeding the ±${tieThreshold} tie band.`,
    };
  }

  // Substantively tied sequence:
  // 1. Emergency status
  if (caseA.calculatedScore.emergencyTriggered !== caseB.calculatedScore.emergencyTriggered) {
    const winner = caseA.calculatedScore.emergencyTriggered ? caseA : caseB;
    return {
      isSubstantivelyTied: true,
      scoreDifference: diff,
      favoredCaseId: winner.id,
      tieBreakReason: `Substantively tied scores (${scoreA} vs ${scoreB}). Resolved in favor of Case ${winner.id} due to verified Emergency Review trigger.`,
    };
  }

  // 2. Severity & Urgency dimension
  const sevA = caseA.calculatedScore.severityScore;
  const sevB = caseB.calculatedScore.severityScore;
  if (sevA !== sevB) {
    const winner = sevA > sevB ? caseA : caseB;
    return {
      isSubstantivelyTied: true,
      scoreDifference: diff,
      favoredCaseId: winner.id,
      tieBreakReason: `Substantively tied scores. Resolved in favor of Case ${winner.id} due to higher Severity & Urgency score (${sevA} vs ${sevB}).`,
    };
  }

  // 3. Vulnerability dimension
  const vulnA = caseA.calculatedScore.vulnerabilityScore;
  const vulnB = caseB.calculatedScore.vulnerabilityScore;
  if (vulnA !== vulnB) {
    const winner = vulnA > vulnB ? caseA : caseB;
    return {
      isSubstantivelyTied: true,
      scoreDifference: diff,
      favoredCaseId: winner.id,
      tieBreakReason: `Substantively tied scores. Resolved in favor of Case ${winner.id} due to higher Vulnerability & Dependency score (${vulnA} vs ${vulnB}).`,
    };
  }

  // 4. Financial need dimension
  const finA = caseA.calculatedScore.financialScore;
  const finB = caseB.calculatedScore.financialScore;
  if (finA !== finB) {
    const winner = finA > finB ? caseA : caseB;
    return {
      isSubstantivelyTied: true,
      scoreDifference: diff,
      favoredCaseId: winner.id,
      tieBreakReason: `Substantively tied scores. Resolved in favor of Case ${winner.id} due to higher Financial Need score (${finA} vs ${finB}).`,
    };
  }

  // 5. Older creation date (first waiting)
  const dateA = new Date(caseA.createdAt).getTime();
  const dateB = new Date(caseB.createdAt).getTime();
  if (dateA !== dateB) {
    const winner = dateA < dateB ? caseA : caseB;
    return {
      isSubstantivelyTied: true,
      scoreDifference: diff,
      favoredCaseId: winner.id,
      tieBreakReason: `Substantively tied in all dimensional scores. Resolved in favor of Case ${winner.id} based on earlier application registration date.`,
    };
  }

  return {
    isSubstantivelyTied: true,
    scoreDifference: diff,
    tieBreakReason: `Identical priority profiles. Recommended for discretionary human committee allocation review.`,
  };
}
