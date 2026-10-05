'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  LayoutDashboard,
  FolderOpen,
  ListOrdered,
  Scale,
  Sliders,
  BookOpen,
  Settings,
  HelpCircle,
  Plus,
  Search,
  Lock,
  Unlock,
  Menu,
  X,
  ShieldCheck,
  BarChart3,
  HeartHandshake,
} from 'lucide-react';
import { VaultModal } from '../common/VaultModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isVaultEnabled, isVaultLocked, setCommandPaletteOpen, selectedCaseIdsForCompare } = useAppStore();
  const [isVaultModalOpen, setVaultModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Cases', href: '/cases', icon: FolderOpen },
    { label: 'Queue', href: '/queue', icon: ListOrdered },
    {
      label: 'Compare',
      href: '/compare',
      icon: Scale,
      badge: selectedCaseIdsForCompare.length > 0 ? selectedCaseIdsForCompare.length : undefined,
    },
    { label: 'Funds', href: '/funds', icon: Sliders },
    { label: 'Criteria', href: '/criteria', icon: BookOpen },
    { label: 'Policy', href: '/policy', icon: ShieldCheck },
    { label: 'Audit', href: '/audit', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <NextLink href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
                  <HeartHandshake className="w-6 h-6 text-emerald-100" />
                </div>
                <div>
                  <div className="font-serif tracking-wide text-slate-900 font-bold text-base leading-tight">
                    IL AN NOOR
                  </div>
                  <div className="text-[10px] tracking-widest text-emerald-700 font-semibold uppercase">
                    Foundation
                  </div>
                </div>
              </NextLink>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <NextLink
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {link.badge}
                        </span>
                      )}
                    </NextLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Shortcut */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors"
                title="Search cases or jump to pages (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search...</span>
                <kbd className="bg-white border border-slate-300 text-[10px] font-mono px-1 rounded text-slate-400">
                  Ctrl K
                </kbd>
              </button>

              {/* Vault Security Status Button */}
              <button
                onClick={() => setVaultModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isVaultLocked
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : isVaultEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Local Vault Encryption Status"
              >
                {isVaultLocked ? (
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                ) : isVaultEnabled ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden md:inline">
                  {isVaultLocked ? 'Vault Locked' : isVaultEnabled ? 'Vault Active' : 'Vault'}
                </span>
              </button>

              {/* Settings Link */}
              <NextLink
                href="/settings"
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                  pathname === '/settings' ? 'bg-slate-100 text-slate-900' : ''
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </NextLink>

              {/* Help Link */}
              <NextLink
                href="/help"
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                  pathname === '/help' ? 'bg-slate-100 text-slate-900' : ''
                }`}
                title="Help & FAQ"
              >
                <HelpCircle className="w-4 h-4" />
              </NextLink>

              {/* Primary New Case Button */}
              <NextLink
                href="/cases/new"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Case</span>
              </NextLink>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 mb-2"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search all records...</span>
              </div>
              <kbd className="bg-white border text-[10px] px-1 rounded">Ctrl+K</kbd>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </NextLink>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <NextLink
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-medium text-slate-700"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </NextLink>
              <NextLink
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-medium text-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Help & FAQ
              </NextLink>
            </div>
          </div>
        )}
      </header>

      {/* Local Vault Security Modal */}
      <VaultModal isOpen={isVaultModalOpen} onClose={() => setVaultModalOpen(false)} />
    </>
  );
};
