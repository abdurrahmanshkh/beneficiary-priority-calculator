import { create } from 'zustand';
import { BeneficiaryCase, CaseStatus, HumanDecision, PriorityBand, ReassessmentEntry } from '@/types/beneficiary';
import { LocalStorageRepository, storageRepo } from '../storage/storageRepository';
import { SAMPLE_CASES } from '../demo/sampleCases';
import { calculateTotalScore, calculateZakatEligibility } from '../scoring/scoringEngine';
import { INBPI_POLICY_V01 } from '../policy/scoringPolicy';
import { DEFAULT_ZAKAT_POLICY } from '../policy/zakatPolicy';
import { hashPasscode } from '../security/vault';

export interface AppState {
  cases: BeneficiaryCase[];
  isLoading: boolean;
  activeCase: BeneficiaryCase | null;
  selectedCaseIdsForCompare: string[];
  searchQuery: string;
  filterCaseType: string;
  filterPriorityBand: string;
  filterStatus: string;
  filterFund: string;
  filterEmergencyOnly: boolean;
  filterZakatEligibleOnly: boolean;
  filterVerificationLevel: string;
  sortBy: 'priority_desc' | 'priority_asc' | 'date_desc' | 'date_asc' | 'amount_desc' | 'urgency_desc';
  isCommandPaletteOpen: boolean;
  isVaultLocked: boolean;
  isVaultEnabled: boolean;
  activePasscode: string | null;
  lastBackupDate: string | null;
  fundBudgets: {
    Zakat: number;
    'General Welfare': number;
    Medical: number;
    Education: number;
    Emergency: number;
  };
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  initializeStore: () => Promise<void>;
  saveCase: (caseData: BeneficiaryCase) => Promise<BeneficiaryCase>;
  deleteCase: (id: string) => Promise<void>;
  duplicateCase: (id: string) => Promise<BeneficiaryCase | null>;
  recordDecision: (caseId: string, decision: Omit<HumanDecision, 'id' | 'decidedAt'>) => Promise<void>;
  reassessCase: (
    caseId: string,
    reason: string,
    updatedCase: BeneficiaryCase,
    reviewer: string
  ) => Promise<BeneficiaryCase>;
  toggleCompareCase: (id: string) => void;
  clearCompareCases: () => void;
  setSearchQuery: (q: string) => void;
  setFilters: (filters: Partial<{
    caseType: string;
    priorityBand: string;
    status: string;
    fund: string;
    emergencyOnly: boolean;
    zakatOnly: boolean;
    verificationLevel: string;
  }>) => void;
  setSortBy: (sort: AppState['sortBy']) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  unlockVault: (passcode: string) => Promise<boolean>;
  lockVault: () => void;
  setupVaultPasscode: (passcode: string) => Promise<void>;
  disableVault: () => void;
  updateFundBudget: (fund: keyof AppState['fundBudgets'], amount: number) => void;
  exportBackup: () => Promise<string>;
  importBackup: (json: string, mode: 'merge' | 'replace') => Promise<{ count: number; error?: string }>;
  resetToDemoCases: () => Promise<void>;
  clearAllData: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cases: [],
  isLoading: true,
  activeCase: null,
  selectedCaseIdsForCompare: [],
  searchQuery: '',
  filterCaseType: 'all',
  filterPriorityBand: 'all',
  filterStatus: 'all',
  filterFund: 'all',
  filterEmergencyOnly: false,
  filterZakatEligibleOnly: false,
  filterVerificationLevel: 'all',
  sortBy: 'priority_desc',
  isCommandPaletteOpen: false,
  isVaultLocked: false,
  isVaultEnabled: false,
  activePasscode: null,
  lastBackupDate: null,
  fundBudgets: {
    Zakat: 350000,
    'General Welfare': 200000,
    Medical: 400000,
    Education: 150000,
    Emergency: 100000,
  },
  toast: null,

  initializeStore: async () => {
    set({ isLoading: true });
    try {
      const vaultConfig = storageRepo.getVaultConfig();
      const lastBackup = storageRepo.getLastBackupDate();

      if (vaultConfig.isVaultEnabled && vaultConfig.isLocked) {
        set({
          isVaultEnabled: true,
          isVaultLocked: true,
          isLoading: false,
          lastBackupDate: lastBackup,
        });
        return;
      }

      let storedCases = await storageRepo.getAllCases();
      if (!storedCases || storedCases.length === 0) {
        // Pre-populate with our synthetic test cases on first run
        for (const sample of SAMPLE_CASES) {
          await storageRepo.createCase(sample);
        }
        storedCases = await storageRepo.getAllCases();
      }

      set({
        cases: storedCases,
        isVaultEnabled: vaultConfig.isVaultEnabled,
        isVaultLocked: false,
        lastBackupDate: lastBackup,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to initialize app store:', e);
      set({ cases: SAMPLE_CASES, isLoading: false });
    }
  },

  saveCase: async (caseData: BeneficiaryCase) => {
    // Pure invariant recalculation
    const calculatedZakat = calculateZakatEligibility(caseData.zakat, DEFAULT_ZAKAT_POLICY);
    const calculatedScore = calculateTotalScore(
      {
        ...caseData,
        zakat: calculatedZakat,
      },
      INBPI_POLICY_V01
    );

    const fullCase: BeneficiaryCase = {
      ...caseData,
      zakat: calculatedZakat,
      calculatedScore,
      updatedAt: new Date().toISOString(),
    };

    await storageRepo.updateCase(fullCase);
    const updatedCases = await storageRepo.getAllCases();
    set({ cases: updatedCases, activeCase: fullCase });
    get().showToast(`Case ${fullCase.id} saved successfully.`, 'success');
    return fullCase;
  },

  deleteCase: async (id: string) => {
    await storageRepo.deleteCase(id);
    const updatedCases = await storageRepo.getAllCases();
    set({
      cases: updatedCases,
      selectedCaseIdsForCompare: get().selectedCaseIdsForCompare.filter((cId) => cId !== id),
      activeCase: get().activeCase?.id === id ? null : get().activeCase,
    });
    get().showToast('Case deleted.', 'info');
  },

  duplicateCase: async (id: string) => {
    const duplicated = await storageRepo.duplicateCase(id);
    if (duplicated) {
      const updatedCases = await storageRepo.getAllCases();
      set({ cases: updatedCases });
      get().showToast(`Case duplicated as ${duplicated.id}`, 'success');
      return duplicated;
    }
    return null;
  },

  recordDecision: async (caseId: string, decisionInput) => {
    const currentCase = await storageRepo.getCase(caseId);
    if (!currentCase) return;

    const newDecision: HumanDecision = {
      id: `DEC-${Date.now()}`,
      decision: decisionInput.decision,
      approvedAmount: decisionInput.approvedAmount,
      fundAllocated: decisionInput.fundAllocated,
      decisionReason: decisionInput.decisionReason,
      isOverride: decisionInput.isOverride,
      overrideReason: decisionInput.overrideReason,
      decidedBy: decisionInput.decidedBy || 'Committee Reviewer',
      decidedAt: new Date().toISOString(),
    };

    let newStatus: CaseStatus = currentCase.status;
    if (decisionInput.decision === 'Approve full') newStatus = 'Approved';
    else if (decisionInput.decision === 'Approve partial') newStatus = 'Partially Approved';
    else if (decisionInput.decision === 'Waitlist') newStatus = 'Waitlisted';
    else if (decisionInput.decision === 'Decline') newStatus = 'Rejected';
    else if (decisionInput.decision === 'Request more information') newStatus = 'Needs Verification';
    else if (decisionInput.decision === 'Emergency escalation') newStatus = 'Emergency Review';

    const updatedCase: BeneficiaryCase = {
      ...currentCase,
      status: newStatus,
      currentDecision: newDecision,
      decisionHistory: [newDecision, ...(currentCase.decisionHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    await storageRepo.updateCase(updatedCase);
    const updatedList = await storageRepo.getAllCases();
    set({ cases: updatedList, activeCase: updatedCase });
    get().showToast(`Decision recorded: ${newDecision.decision}`, 'success');
  },

  reassessCase: async (caseId, reason, updatedData, reviewer) => {
    const existing = await storageRepo.getCase(caseId);
    if (!existing) throw new Error('Case not found');

    const previousScore = existing.calculatedScore.totalScore;
    const reCalculatedZakat = calculateZakatEligibility(updatedData.zakat, DEFAULT_ZAKAT_POLICY);
    const reCalculatedScore = calculateTotalScore(
      {
        ...updatedData,
        zakat: reCalculatedZakat,
      },
      INBPI_POLICY_V01
    );

    const scoreDelta = reCalculatedScore.totalScore - previousScore;
    const keyChanges: string[] = [];
    if (scoreDelta > 0) keyChanges.push(`Priority increased by +${scoreDelta} points`);
    else if (scoreDelta < 0) keyChanges.push(`Priority adjusted by ${scoreDelta} points`);
    else keyChanges.push('Score remained identical following reassessment');

    const reassessmentEntry: ReassessmentEntry = {
      id: `REASS-${Date.now()}`,
      reassessmentDate: new Date().toISOString(),
      previousScore,
      newScore: reCalculatedScore.totalScore,
      scoreDelta,
      reasonForReassessment: reason,
      keyChangesIdentified: keyChanges,
      reviewedBy: reviewer,
    };

    const finalCase: BeneficiaryCase = {
      ...updatedData,
      status: 'Assessment Complete',
      zakat: reCalculatedZakat,
      calculatedScore: reCalculatedScore,
      reassessmentHistory: [reassessmentEntry, ...(existing.reassessmentHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    await storageRepo.updateCase(finalCase);
    const updatedList = await storageRepo.getAllCases();
    set({ cases: updatedList, activeCase: finalCase });
    get().showToast(`Case reassessed (Score: ${previousScore} → ${reCalculatedScore.totalScore})`, 'success');
    return finalCase;
  },

  toggleCompareCase: (id: string) => {
    const current = get().selectedCaseIdsForCompare;
    if (current.includes(id)) {
      set({ selectedCaseIdsForCompare: current.filter((cId) => cId !== id) });
    } else {
      if (current.length >= 5) {
        get().showToast('Comparison limit is 5 cases at a time.', 'info');
        return;
      }
      set({ selectedCaseIdsForCompare: [...current, id] });
    }
  },

  clearCompareCases: () => set({ selectedCaseIdsForCompare: [] }),

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  setFilters: (filters) =>
    set((state) => ({
      filterCaseType: filters.caseType !== undefined ? filters.caseType : state.filterCaseType,
      filterPriorityBand: filters.priorityBand !== undefined ? filters.priorityBand : state.filterPriorityBand,
      filterStatus: filters.status !== undefined ? filters.status : state.filterStatus,
      filterFund: filters.fund !== undefined ? filters.fund : state.filterFund,
      filterEmergencyOnly: filters.emergencyOnly !== undefined ? filters.emergencyOnly : state.filterEmergencyOnly,
      filterZakatEligibleOnly: filters.zakatOnly !== undefined ? filters.zakatOnly : state.filterZakatEligibleOnly,
      filterVerificationLevel: filters.verificationLevel !== undefined ? filters.verificationLevel : state.filterVerificationLevel,
    })),

  setSortBy: (sort) => set({ sortBy: sort }),

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  unlockVault: async (passcode: string) => {
    const config = storageRepo.getVaultConfig();
    if (!config.isVaultEnabled) return true;

    const hash = await hashPasscode(passcode);
    if (hash === config.passcodeHash) {
      (storageRepo as LocalStorageRepository).setActivePasscode(passcode);
      storageRepo.saveVaultConfig({ ...config, isLocked: false, lastActiveTimestamp: Date.now() });
      const storedCases = await storageRepo.getAllCases();
      set({ isVaultLocked: false, activePasscode: passcode, cases: storedCases });
      get().showToast('Local Vault unlocked.', 'success');
      return true;
    }
    get().showToast('Incorrect passcode.', 'error');
    return false;
  },

  lockVault: () => {
    const config = storageRepo.getVaultConfig();
    (storageRepo as LocalStorageRepository).setActivePasscode(null);
    storageRepo.saveVaultConfig({ ...config, isLocked: true });
    set({ isVaultLocked: true, activePasscode: null, cases: [] });
    get().showToast('Vault locked. Passcode required to view beneficiary data.', 'info');
  },

  setupVaultPasscode: async (passcode: string) => {
    const hash = await hashPasscode(passcode);
    (storageRepo as LocalStorageRepository).setActivePasscode(passcode);
    storageRepo.saveVaultConfig({
      isVaultEnabled: true,
      passcodeHash: hash,
      lockTimeoutMinutes: 15,
      isLocked: false,
      lastActiveTimestamp: Date.now(),
    });
    // Re-save existing cases with encryption
    const currentCases = get().cases;
    await storageRepo.importData(JSON.stringify({ cases: currentCases }), 'replace');
    set({ isVaultEnabled: true, isVaultLocked: false, activePasscode: passcode });
    get().showToast('Local Vault security enabled with device encryption.', 'success');
  },

  disableVault: async () => {
    const currentCases = get().cases;
    (storageRepo as LocalStorageRepository).setActivePasscode(null);
    storageRepo.saveVaultConfig({
      isVaultEnabled: false,
      passcodeHash: undefined,
      lockTimeoutMinutes: 15,
      isLocked: false,
      lastActiveTimestamp: Date.now(),
    });
    // Write in plaintext
    await storageRepo.importData(JSON.stringify({ cases: currentCases }), 'replace');
    set({ isVaultEnabled: false, isVaultLocked: false, activePasscode: null });
    get().showToast('Vault protection disabled.', 'info');
  },

  updateFundBudget: (fund, amount) => {
    set((state) => ({
      fundBudgets: { ...state.fundBudgets, [fund]: amount },
    }));
    get().showToast(`Budget updated for ${fund}: ₹${amount.toLocaleString('en-IN')}`, 'info');
  },

  exportBackup: async () => {
    const json = await storageRepo.exportData();
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    set({ lastBackupDate: today });
    get().showToast('Encrypted backup generated.', 'success');
    return json;
  },

  importBackup: async (json, mode) => {
    const res = await storageRepo.importData(json, mode);
    if (res.errors.length > 0) {
      get().showToast(res.errors[0], 'error');
      return { count: 0, error: res.errors[0] };
    }
    const freshCases = await storageRepo.getAllCases();
    set({ cases: freshCases });
    get().showToast(`Successfully imported ${res.importedCount} cases.`, 'success');
    return { count: res.importedCount };
  },

  resetToDemoCases: async () => {
    await storageRepo.clearAllData();
    for (const sample of SAMPLE_CASES) {
      await storageRepo.createCase(sample);
    }
    const freshCases = await storageRepo.getAllCases();
    set({ cases: freshCases });
    get().showToast('Loaded 7 representative synthetic demo cases.', 'success');
  },

  clearAllData: async () => {
    await storageRepo.clearAllData();
    set({ cases: [], activeCase: null, selectedCaseIdsForCompare: [] });
    get().showToast('All local cases and assessment data cleared.', 'info');
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 4000);
  },

  hideToast: () => set({ toast: null }),
}));
