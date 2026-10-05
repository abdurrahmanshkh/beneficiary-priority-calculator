import { describe, it, expect } from 'vitest';
import {
  calculateCoverageScore,
  calculateReservesScore,
  calculateDebtScore,
  calculateFinancialScore,
  calculateVulnerabilityScore,
  calculateDeprivationScore,
  calculateSeverityScore,
  calculateSupportGapScore,
  calculateTotalScore,
  calculateZakatEligibility,
  compareTwoCasesForTie,
  determinePriorityBand,
} from './scoringEngine';
import { INBPI_POLICY_V01 } from '../policy/scoringPolicy';
import { DEFAULT_ZAKAT_POLICY, calculateSilverNisabINR } from '../policy/zakatPolicy';
import { SAMPLE_CASES } from '../demo/sampleCases';
import { FinancialProfile, VulnerabilityProfile, DeprivationProfile, SeverityUrgencyProfile, SupportGapProfile, ZakatAssessment } from '@/types/beneficiary';

describe('INBPI Scoring Engine - Pure Unit Tests', () => {
  describe('Financial Need Dimension (Max 30 pts)', () => {
    it('calculates essential needs coverage bands correctly', () => {
      // >=150% -> 0 pts
      expect(calculateCoverageScore(15000, 10000).points).toBe(0);
      // 125-149% -> 2 pts
      expect(calculateCoverageScore(13000, 10000).points).toBe(2);
      // 100-124% -> 4 pts
      expect(calculateCoverageScore(11000, 10000).points).toBe(4);
      // 80-99% -> 7 pts
      expect(calculateCoverageScore(8500, 10000).points).toBe(7);
      // 60-79% -> 10 pts
      expect(calculateCoverageScore(7000, 10000).points).toBe(10);
      // 40-59% -> 13 pts
      expect(calculateCoverageScore(5000, 10000).points).toBe(13);
      // <40% -> 15 pts
      expect(calculateCoverageScore(2000, 10000).points).toBe(15);
      // Zero income -> 15 pts
      expect(calculateCoverageScore(0, 10000).points).toBe(15);
    });

    it('handles zero essential expenses gracefully without NaN', () => {
      const res = calculateCoverageScore(5000, 0);
      expect(res.points).toBe(0);
      expect(Number.isFinite(res.coveragePercent)).toBe(true);
    });

    it('calculates liquid accessible reserves bands correctly', () => {
      const monthly = 10000;
      // >6 months -> 0 pts
      expect(calculateReservesScore(70000, monthly).points).toBe(0);
      // 3-6 months -> 1 pt
      expect(calculateReservesScore(40000, monthly).points).toBe(1);
      // 1-3 months -> 3 pts
      expect(calculateReservesScore(20000, monthly).points).toBe(3);
      // 0.5-1 month -> 5 pts
      expect(calculateReservesScore(7000, monthly).points).toBe(5);
      // <0.5 month -> 7 pts
      expect(calculateReservesScore(2000, monthly).points).toBe(7);
      // Zero cash -> 7 pts
      expect(calculateReservesScore(0, monthly).points).toBe(7);
    });

    it('enforces financial score maximum clamp at 30 points', () => {
      const extremePoverty: FinancialProfile = {
        dependableMonthlyIncome: 0,
        irregularMonthlyIncome: 0,
        totalHouseholdIncome: 0,
        perCapitaIncome: 0,
        incomeStability: 'no_reliable_income', // +4
        incomeSources: [],
        essentialMonthlyExpenses: {
          food: 5000,
          rent: 3000,
          utilities: 500,
          essentialMedicines: 500,
          essentialTransport: 0,
          education: 0,
          caregiving: 0,
          otherEssential: 0,
          total: 9000,
        },
        liquidAssets: { cash: 0, bankBalance: 0, savings: 0, goldSilverValue: 0, investments: 0, totalLiquid: 0 }, // +7
        physicalAssets: { primaryHomeOwned: false, landValue: 0, vehiclesValue: 0, livestockValue: 0, businessAssets: 0, totalPhysical: 0 },
        debtObligations: {
          totalOutstanding: 50000,
          monthlyDebtPayment: 1000,
          debtType: 'Urgent',
          rentArrears: 5000,
          medicalDebt: 20000,
          utilityArrears: 0,
          foodDebt: 0,
          essentialEducationDebt: 0,
          consequenceOfNonPayment: 'Eviction',
        }, // +4 (arrears)
        coverageRatio: 0, // +15
        reserveMonths: 0,
        debtBurdenRatio: 1.0,
      };

      const result = calculateFinancialScore(extremePoverty, INBPI_POLICY_V01);
      expect(result.score).toBe(30); // 15 + 7 + 4 + 4 = 30
      expect(result.score).toBeLessThanOrEqual(30);
      expect(result.trace).toHaveLength(4);
    });
  });

  describe('Vulnerability & Dependency Dimension (Max 20 pts)', () => {
    it('awards disability points based on functional impact not label', () => {
      const vulnBase: VulnerabilityProfile = {
        functionalDisability: {
          hasDisability: true,
          functionalImpact: 'severe',
          requiresCaregiver: true,
          additionalDisabilityExpenses: 2000,
        },
        dependencyBurden: {
          totalMembers: 3,
          totalEarners: 1,
          totalDependents: 2,
          childrenCount: 1,
          elderlyCount: 0,
          disabledDependentsCount: 1,
          dependencyRatio: 2,
        },
        familyStructure: {
          circumstance: 'stable',
          category: 'intact_family',
        },
        ageVulnerability: {
          primaryBeneficiaryAge: 35,
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
      };

      const res = calculateVulnerabilityScore(vulnBase, 3, 1, INBPI_POLICY_V01);
      const disTrace = res.trace.find((t) => t.criterionId === 'vuln_disability');
      expect(disTrace?.points).toBe(5); // severe impact
    });

    it('enforces age non-discrimination: capable adults receive 0 age points', () => {
      const vulnAdult: VulnerabilityProfile = {
        functionalDisability: { hasDisability: false, functionalImpact: 'none', requiresCaregiver: false, additionalDisabilityExpenses: 0 },
        dependencyBurden: { totalMembers: 2, totalEarners: 1, totalDependents: 1, childrenCount: 0, elderlyCount: 0, disabledDependentsCount: 0, dependencyRatio: 1 },
        familyStructure: { circumstance: 'stable', category: 'intact_family' },
        ageVulnerability: { primaryBeneficiaryAge: 32, lifeStage: 'adult', createsVulnerability: false },
        chronicCareSafeguarding: { hasChronicIllness: false, recurringMedicationNeeds: false, monthlyMedicationCost: 0, safeguardingRisk: 'none', abuseNeglectRisk: false, unsafeLivingEnvironment: false },
      };

      const res = calculateVulnerabilityScore(vulnAdult, 2, 1, INBPI_POLICY_V01);
      const ageTrace = res.trace.find((t) => t.criterionId === 'vuln_age');
      expect(ageTrace?.points).toBe(0);
    });
  });

  describe('Severity & Urgency Dimension (Max 25 pts)', () => {
    it('triggers emergency review flag for acute <72h threat', () => {
      const sev: SeverityUrgencyProfile = {
        timeUrgency: { timeUntilHarm: 'less_than_72h', points: 8 },
        consequenceOfNoAssistance: { consequence: 'threat_to_life_or_shelter', points: 7 },
        essentialityOfIntervention: { level: 'critical', points: 4 },
        expectedBenefit: { level: 'restores_functioning_or_life_saving', points: 6 },
        emergencyTrigger: true,
      };

      const res = calculateSeverityScore(sev, INBPI_POLICY_V01);
      expect(res.score).toBe(25);
      expect(res.emergencyTrigger).toBe(true);
    });
  });

  describe('Support & Funding Gap Dimension (Max 10 pts)', () => {
    it('scores unserved cases with zero government schemes higher', () => {
      const gap: SupportGapProfile = {
        familyCommunitySupport: { level: 'no_support', points: 3 },
        governmentOtherSchemes: { level: 'none_available_or_rejected', points: 3, schemesChecked: [] },
        remainingFundingGap: {
          verifiedTotalNeed: 50000,
          existingAvailableFunds: 0,
          otherCommittedFunds: 0,
          requestedFromIlAnNoor: 50000,
          minimumEffectiveAmount: 30000,
          gapRatio: 1.0,
          points: 4,
        },
      };

      const res = calculateSupportGapScore(gap, INBPI_POLICY_V01);
      expect(res.score).toBe(10); // 3 + 3 + 4 = 10 max
    });
  });

  describe('Zakat Assessment & Nisab Calculation', () => {
    it('computes Silver Nisab based on 612.36 grams at current configured silver rate', () => {
      const silverNisab = calculateSilverNisabINR(DEFAULT_ZAKAT_POLICY);
      expect(silverNisab).toBe(Math.round(612.36 * 95));
      expect(silverNisab).toBeGreaterThan(50000);
    });

    it('classifies applicant with zero assets and medical debt as Eligible', () => {
      const zakatInput: ZakatAssessment = {
        assessableCashSavings: 500,
        assessableGoldSilverValue: 0,
        assessableInvestmentsTradeGoods: 0,
        deductibleImmediateLiabilities: 30000,
        deductibleBasicMonthlyLivingExpenses: 8000,
        netAssessableWealth: 0,
        nisabThresholdSilverINR: 58174,
        isBelowNisab: true,
        recipientCategory: 'faqir',
        preliminaryEligibility: 'Eligible',
      };

      const res = calculateZakatEligibility(zakatInput, DEFAULT_ZAKAT_POLICY);
      expect(res.isBelowNisab).toBe(true);
      expect(res.preliminaryEligibility).toBe('Eligible');
    });

    it('classifies applicant whose liquid assets exceed Nisab as Ineligible', () => {
      const wealthyApplicant: ZakatAssessment = {
        assessableCashSavings: 150000,
        assessableGoldSilverValue: 200000,
        assessableInvestmentsTradeGoods: 0,
        deductibleImmediateLiabilities: 10000,
        deductibleBasicMonthlyLivingExpenses: 25000,
        netAssessableWealth: 315000,
        nisabThresholdSilverINR: 58174,
        isBelowNisab: false,
        recipientCategory: 'none',
        preliminaryEligibility: 'Ineligible',
      };

      const res = calculateZakatEligibility(wealthyApplicant, DEFAULT_ZAKAT_POLICY);
      expect(res.isBelowNisab).toBe(false);
      expect(res.preliminaryEligibility).toBe('Ineligible');
    });
  });

  describe('Priority Bands and Tie-Breaker Sequence', () => {
    it('assigns correct priority bands for boundary scores', () => {
      expect(determinePriorityBand(90)).toBe('Critical');
      expect(determinePriorityBand(85)).toBe('Critical');
      expect(determinePriorityBand(75)).toBe('Very High');
      expect(determinePriorityBand(70)).toBe('Very High');
      expect(determinePriorityBand(60)).toBe('High');
      expect(determinePriorityBand(55)).toBe('High');
      expect(determinePriorityBand(45)).toBe('Moderate');
      expect(determinePriorityBand(40)).toBe('Moderate');
      expect(determinePriorityBand(35)).toBe('Lower');
    });

    it('resolves ties within 2 points in favor of Emergency status', () => {
      const caseA = { ...SAMPLE_CASES[0] };
      const caseB = { ...SAMPLE_CASES[1] };
      // Force scores to be within 1.0 point
      caseA.calculatedScore = { ...caseA.calculatedScore, totalScore: 78, emergencyTriggered: false };
      caseB.calculatedScore = { ...caseB.calculatedScore, totalScore: 77.5, emergencyTriggered: true };

      const tie = compareTwoCasesForTie(caseA, caseB, 2.0);
      expect(tie.isSubstantivelyTied).toBe(true);
      expect(tie.favoredCaseId).toBe(caseB.id);
      expect(tie.tieBreakReason).toContain('Emergency Review trigger');
    });
  });

  describe('Fairness Invariants on Sample Cases', () => {
    it('demonstrates that disability increases score over identical income without disability', () => {
      const caseWidow = SAMPLE_CASES[0]; // Fatima Bi
      const caseDisability = SAMPLE_CASES[1]; // Irfan
      // Irfan has profound locomotor disability
      expect(caseDisability.calculatedScore.vulnerabilityScore).toBeGreaterThan(
        caseWidow.calculatedScore.vulnerabilityScore
      );
    });

    it('demonstrates that applicant with substantial wealth (Bilal Qureshi) receives low score and lower priority', () => {
      const caseWealthy = SAMPLE_CASES.find((c) => c.id === 'IAN-2026-1007')!;
      expect(caseWealthy.calculatedScore.financialScore).toBeLessThan(10);
      expect(caseWealthy.calculatedScore.priorityBand).toBe('Lower');
      expect(caseWealthy.zakat.preliminaryEligibility).toBe('Ineligible');
    });
  });
});
