'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Lock, Unlock, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { isVaultEnabled, isVaultLocked, unlockVault, lockVault, setupVaultPasscode, disableVault } =
    useAppStore();

  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'unlock' | 'setup' | 'settings'>('unlock');

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await unlockVault(passcode);
    if (success) {
      setPasscode('');
      onClose();
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (passcode.length < 4) {
      setError('Passcode must be at least 4 characters.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match.');
      return;
    }
    await setupVaultPasscode(passcode);
    setPasscode('');
    setConfirmPasscode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              {isVaultLocked ? <Lock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">Local Vault Privacy & Encryption</h2>
              <p className="text-xs text-slate-300">Zero-knowledge AES-256 client encryption</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Device-Local Storage Notice:</strong> Beneficiary records remain strictly on this device. Do not use this application on shared or public computers.
            </div>
          </div>

          {isVaultLocked ? (
            /* Unlock Form */
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Vault Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter device passcode..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white pl-10"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Vault
                </button>
              </div>
            </form>
          ) : !isVaultEnabled ? (
            /* Setup Form */
            <form onSubmit={handleSetup} className="space-y-4">
              <p className="text-sm text-slate-600">
                Protect beneficiary data by creating a local passcode. All sensitive records will be encrypted with Web Crypto AES-GCM before storage.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Set Local Passcode
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Create passcode..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Passcode
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Re-enter passcode..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Enable Vault Encryption
                </button>
              </div>
            </form>
          ) : (
            /* Already enabled & unlocked */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>Vault is currently unlocked. Data is safely encrypted at rest.</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    lockVault();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Lock Vault Now
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Are you sure you want to disable encryption? Records will be stored in standard local storage.')) {
                      await disableVault();
                      onClose();
                    }
                  }}
                  className="w-full py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium"
                >
                  Disable Vault Protection
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
