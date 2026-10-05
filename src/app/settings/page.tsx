'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  Lock,
  Unlock,
  Coins,
  ShieldAlert,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { DEFAULT_ZAKAT_POLICY } from '@/lib/policy/zakatPolicy';
import { INBPI_POLICY_V01 } from '@/lib/policy/scoringPolicy';

export default function SettingsPage() {
  const {
    cases,
    isVaultEnabled,
    isVaultLocked,
    lastBackupDate,
    exportBackup,
    importBackup,
    resetToDemoCases,
    clearAllData,
    lockVault,
    setupVaultPasscode,
    disableVault,
    showToast,
  } = useAppStore();

  const [silverPrice, setSilverPrice] = useState<number>(DEFAULT_ZAKAT_POLICY.silverPricePerGram);
  const [goldPrice, setGoldPrice] = useState<number>(DEFAULT_ZAKAT_POLICY.goldPricePerGram);

  // Vault passcode state
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Import file handler
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        await importBackup(text, mode);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const handlePasscodeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    if (passcode.length < 4) {
      setPasscodeError('Passcode must be at least 4 characters.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setPasscodeError('Passcodes do not match.');
      return;
    }
    await setupVaultPasscode(passcode);
    setPasscode('');
    setConfirmPasscode('');
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          <Settings className="w-3.5 h-3.5" />
          <span>System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Foundation Settings & Local Vault
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Manage local storage encryption, backup exports, Zakat bullion rates, and synthetic demonstration datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BACKUP & RESTORE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Encrypted Backup & Recovery</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All records exist locally on this device. Generate an encrypted JSON archive to safely transfer or preserve data.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Last Local Backup:</span>
              <strong className="text-slate-900">{lastBackupDate || 'Never exported'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Cases Stored:</span>
              <strong className="font-mono text-emerald-800">{cases.length} records</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={async () => {
                const json = await exportBackup();
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ilannoor_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON Backup
            </button>

            <label className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import Backup (Merge)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => handleFileImport(e, 'merge')}
              />
            </label>
          </div>
        </div>

        {/* LOCAL VAULT & PASSCODE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Local Vault Privacy (Web Crypto)</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Encrypts the local case database at rest using browser AES-256 GCM.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">
                Vault Status: {isVaultEnabled ? 'Active & Encrypted' : 'Disabled (Plain Local Storage)'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isVaultEnabled ? 'Passcode required after 15 mins inactivity' : 'Enable to encrypt on this device'}
              </span>
            </div>
            {isVaultEnabled && (
              <button
                onClick={lockVault}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                Lock Now
              </button>
            )}
          </div>

          {!isVaultEnabled ? (
            <form onSubmit={handlePasscodeSetup} className="space-y-3 pt-2 text-xs">
              <span className="font-bold text-slate-800 block">Set Local Device Passcode</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Create passcode..."
                  className="px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
                <input
                  type="password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Confirm passcode..."
                  className="px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
              </div>
              {passcodeError && <p className="text-xs text-rose-600 font-medium">{passcodeError}</p>}
              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors"
              >
                Enable Local Vault Encryption
              </button>
            </form>
          ) : (
            <div className="pt-2">
              <button
                onClick={async () => {
                  if (confirm('Disable encryption? Records will be stored in standard browser storage.')) {
                    await disableVault();
                  }
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Disable Vault Protection
              </button>
            </div>
          )}
        </div>

        {/* ZAKAT BENCHMARK CONFIGURATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">Zakat Nisab Bullion Benchmarks</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure bullion rates manually. Silver Nisab is calculated as 612.36g × silver rate.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Silver Price per Gram (₹)</label>
              <input
                type="number"
                min="10"
                value={silverPrice}
                onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Calculated Nisab: <strong>₹{Math.round(DEFAULT_ZAKAT_POLICY.silverNisabGrams * silverPrice).toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Gold Price per Gram (₹)</label>
              <input
                type="number"
                min="1000"
                value={goldPrice}
                onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Calculated Nisab: <strong>₹{Math.round(DEFAULT_ZAKAT_POLICY.goldNisabGrams * goldPrice).toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-normal">
            <strong>Shariah Policy Note:</strong> Silver basis is the Foundation&apos;s approved default standard to maximize eligibility and relief for the needy (Ahwaz li al-Fuqara).
          </div>
        </div>

        {/* DEMO DATA & DANGER ZONE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Synthetic Data & Danger Zone</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Reload the 7 rich synthetic demonstration cases or erase local storage before handing over the device.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={async () => {
                if (confirm('Load synthetic demo cases? This will replace your current local case database with 7 sample cases.')) {
                  await resetToDemoCases();
                }
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload 7 Synthetic Demo Cases
            </button>

            <button
              onClick={async () => {
                if (confirm('WARNING: Are you sure you want to delete all local case records? This cannot be undone.')) {
                  await clearAllData();
                }
              }}
              className="w-full py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Wipe All Local Cases & Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
