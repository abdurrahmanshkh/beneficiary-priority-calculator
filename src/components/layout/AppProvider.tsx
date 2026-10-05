'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toast } from '../common/Toast';
import { CommandPalette } from '../common/CommandPalette';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeStore, isVaultLocked } = useAppStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
      <Toast />
      <CommandPalette />
    </div>
  );
};
