import { BeneficiaryCase } from '@/types/beneficiary';
import { ScoringPolicy, INBPI_POLICY_V01 } from '../policy/scoringPolicy';
import { ZakatPolicyConfig, DEFAULT_ZAKAT_POLICY } from '../policy/zakatPolicy';
import { decryptData, encryptData } from '../security/vault';

export const STORAGE_KEYS = {
  CASES: 'ilannoor_cases_v1',
  SETTINGS: 'ilannoor_settings_v1',
  POLICY: 'ilannoor_policy_v1',
  ZAKAT_POLICY: 'ilannoor_zakat_policy_v1',
  VAULT: 'ilannoor_vault_v1',
  METADATA: 'ilannoor_metadata_v1',
};

export interface AppSettings {
  foundationName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  targetingThreshold: number;
  prioritizationThreshold: number;
  isDemoMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  foundationName: 'Il An Noor Foundation',
  contactEmail: 'contact@ilannoor.org',
  contactPhone: '+91 98450 12345',
  address: 'Commercial Street, Tasker Town, Bangalore, Karnataka 560051',
  currency: 'INR',
  currencySymbol: '₹',
  targetingThreshold: 40,
  prioritizationThreshold: 70,
  isDemoMode: false,
};

export interface VaultConfig {
  isVaultEnabled: boolean;
  passcodeHash?: string;
  lockTimeoutMinutes: number;
  isLocked: boolean;
  lastActiveTimestamp: number;
}

export const DEFAULT_VAULT_CONFIG: VaultConfig = {
  isVaultEnabled: false,
  lockTimeoutMinutes: 15,
  isLocked: false,
  lastActiveTimestamp: Date.now(),
};

export interface StorageRepository {
  createCase(caseData: BeneficiaryCase): Promise<BeneficiaryCase>;
  updateCase(caseData: BeneficiaryCase): Promise<BeneficiaryCase>;
  getCase(id: string): Promise<BeneficiaryCase | null>;
  getAllCases(): Promise<BeneficiaryCase[]>;
  deleteCase(id: string): Promise<boolean>;
  duplicateCase(id: string): Promise<BeneficiaryCase | null>;
  exportData(): Promise<string>;
  importData(
    jsonData: string,
    mode: 'merge' | 'replace'
  ): Promise<{ importedCount: number; errors: string[] }>;
  clearAllData(): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getPolicy(): Promise<ScoringPolicy>;
  savePolicy(policy: ScoringPolicy): Promise<void>;
  getZakatPolicy(): Promise<ZakatPolicyConfig>;
  saveZakatPolicy(policy: ZakatPolicyConfig): Promise<void>;
  getVaultConfig(): VaultConfig;
  saveVaultConfig(config: VaultConfig): void;
  getLastBackupDate(): string | null;
  setLastBackupDate(date: string): void;
}

export class LocalStorageRepository implements StorageRepository {
  private activePasscode: string | null = null;

  public setActivePasscode(passcode: string | null) {
    this.activePasscode = passcode;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private async readEncryptedOrPlain(key: string): Promise<string | null> {
    if (!this.isBrowser()) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const vault = this.getVaultConfig();
    if (vault.isVaultEnabled && this.activePasscode) {
      try {
        return await decryptData(raw, this.activePasscode);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  private async writeEncryptedOrPlain(key: string, data: string): Promise<void> {
    if (!this.isBrowser()) return;
    const vault = this.getVaultConfig();
    if (vault.isVaultEnabled && this.activePasscode) {
      const encrypted = await encryptData(data, this.activePasscode);
      window.localStorage.setItem(key, encrypted);
    } else {
      window.localStorage.setItem(key, data);
    }
  }

  async getAllCases(): Promise<BeneficiaryCase[]> {
    try {
      const data = await this.readEncryptedOrPlain(STORAGE_KEYS.CASES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse stored cases', e);
      return [];
    }
  }

  async getCase(id: string): Promise<BeneficiaryCase | null> {
    const cases = await this.getAllCases();
    return cases.find((c) => c.id === id) || null;
  }

  async createCase(caseData: BeneficiaryCase): Promise<BeneficiaryCase> {
    const cases = await this.getAllCases();
    const existingIndex = cases.findIndex((c) => c.id === caseData.id);
    if (existingIndex >= 0) {
      cases[existingIndex] = { ...caseData, updatedAt: new Date().toISOString() };
    } else {
      cases.unshift(caseData);
    }
    await this.writeEncryptedOrPlain(STORAGE_KEYS.CASES, JSON.stringify(cases));
    return caseData;
  }

  async updateCase(caseData: BeneficiaryCase): Promise<BeneficiaryCase> {
    const cases = await this.getAllCases();
    const index = cases.findIndex((c) => c.id === caseData.id);
    const updated = { ...caseData, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      cases[index] = updated;
    } else {
      cases.unshift(updated);
    }
    await this.writeEncryptedOrPlain(STORAGE_KEYS.CASES, JSON.stringify(cases));
    return updated;
  }

  async deleteCase(id: string): Promise<boolean> {
    const cases = await this.getAllCases();
    const filtered = cases.filter((c) => c.id !== id);
    await this.writeEncryptedOrPlain(STORAGE_KEYS.CASES, JSON.stringify(filtered));
    return true;
  }

  async duplicateCase(id: string): Promise<BeneficiaryCase | null> {
    const existing = await this.getCase(id);
    if (!existing) return null;

    const newId = `IAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicated: BeneficiaryCase = {
      ...existing,
      id: newId,
      beneficiaryCode: `BEN-${newId.split('-')[2]}`,
      title: `${existing.title} (Copy)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decisionHistory: [],
      currentDecision: undefined,
    };

    await this.createCase(duplicated);
    return duplicated;
  }

  async exportData(): Promise<string> {
    const cases = await this.getAllCases();
    const settings = await this.getSettings();
    const policy = await this.getPolicy();
    const zakatPolicy = await this.getZakatPolicy();

    const payload = {
      version: 1,
      appName: 'Il An Noor Beneficiary Priority Calculator',
      exportedAt: new Date().toISOString(),
      cases,
      settings,
      policy,
      zakatPolicy,
    };

    this.setLastBackupDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    return JSON.stringify(payload, null, 2);
  }

  async importData(
    jsonData: string,
    mode: 'merge' | 'replace'
  ): Promise<{ importedCount: number; errors: string[] }> {
    const errors: string[] = [];
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || !Array.isArray(parsed.cases)) {
        throw new Error('Invalid backup file schema: missing "cases" array.');
      }

      const incomingCases: BeneficiaryCase[] = parsed.cases;
      let targetCases: BeneficiaryCase[] = [];

      if (mode === 'replace') {
        targetCases = incomingCases;
      } else {
        const existing = await this.getAllCases();
        const map = new Map<string, BeneficiaryCase>();
        existing.forEach((c) => map.set(c.id, c));
        incomingCases.forEach((c) => map.set(c.id, c)); // merge / update
        targetCases = Array.from(map.values());
      }

      await this.writeEncryptedOrPlain(STORAGE_KEYS.CASES, JSON.stringify(targetCases));

      if (parsed.settings) {
        await this.saveSettings(parsed.settings);
      }

      return { importedCount: incomingCases.length, errors };
    } catch (e: any) {
      errors.push(e?.message || 'Failed to import JSON data');
      return { importedCount: 0, errors };
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEYS.CASES);
    window.localStorage.removeItem(STORAGE_KEYS.METADATA);
  }

  async getSettings(): Promise<AppSettings> {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  async getPolicy(): Promise<ScoringPolicy> {
    if (!this.isBrowser()) return INBPI_POLICY_V01;
    const raw = window.localStorage.getItem(STORAGE_KEYS.POLICY);
    if (!raw) return INBPI_POLICY_V01;
    try {
      return { ...INBPI_POLICY_V01, ...JSON.parse(raw) };
    } catch {
      return INBPI_POLICY_V01;
    }
  }

  async savePolicy(policy: ScoringPolicy): Promise<void> {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.POLICY, JSON.stringify(policy));
  }

  async getZakatPolicy(): Promise<ZakatPolicyConfig> {
    if (!this.isBrowser()) return DEFAULT_ZAKAT_POLICY;
    const raw = window.localStorage.getItem(STORAGE_KEYS.ZAKAT_POLICY);
    if (!raw) return DEFAULT_ZAKAT_POLICY;
    try {
      return { ...DEFAULT_ZAKAT_POLICY, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_ZAKAT_POLICY;
    }
  }

  async saveZakatPolicy(policy: ZakatPolicyConfig): Promise<void> {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.ZAKAT_POLICY, JSON.stringify(policy));
  }

  getVaultConfig(): VaultConfig {
    if (!this.isBrowser()) return DEFAULT_VAULT_CONFIG;
    const raw = window.localStorage.getItem(STORAGE_KEYS.VAULT);
    if (!raw) return DEFAULT_VAULT_CONFIG;
    try {
      return { ...DEFAULT_VAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_VAULT_CONFIG;
    }
  }

  saveVaultConfig(config: VaultConfig): void {
    if (!this.isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(config));
  }

  getLastBackupDate(): string | null {
    if (!this.isBrowser()) return null;
    const raw = window.localStorage.getItem(STORAGE_KEYS.METADATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw).lastBackupDate || null;
    } catch {
      return null;
    }
  }

  setLastBackupDate(date: string): void {
    if (!this.isBrowser()) return;
    const current = this.getLastBackupDate();
    window.localStorage.setItem(
      STORAGE_KEYS.METADATA,
      JSON.stringify({ lastBackupDate: date, version: 1 })
    );
  }
}

export const storageRepo = new LocalStorageRepository();
