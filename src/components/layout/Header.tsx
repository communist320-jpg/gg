import React, { useState } from 'react';
import {
  Store,
  Compass,
  MapPin,
  Users2,
  Sparkles,
  ShieldCheck,
  Search,
  LogIn,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Building,
  Newspaper,
  Layers,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenClaimModal: () => void;
  onOpenAuthModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenClaimModal,
  onOpenAuthModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, userProfile, role, signOut, setTestRole, sendVerificationEmail, reloadUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);

  const currentDateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const navLinks = [
    { id: 'explore', label: 'Explore Bathinda', icon: Compass },
    { id: 'map', label: 'AOCSF Map', icon: MapPin },
    { id: 'network', label: 'B2B Network', icon: Users2 },
    { id: 'stories', label: 'Stories & Deals', icon: Newspaper },
    { id: 'dashboard', label: 'Owner Dashboard', icon: Store },
  ];

  if (role === 'admin' || userProfile?.email === 'communist320@gmail.com') {
    navLinks.push({ id: 'admin', label: 'Admin Console', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#1E1B18]/15 text-[#1E1B18]">
      {/* Top Newspaper Micro-Bar */}
      <div className="border-b border-[#1E1B18]/10 bg-[#F3EFE6] text-[11px] font-mono tracking-wider px-4 py-1 flex items-center justify-between text-[#4A4540]">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-[#C82A2A] tracking-widest uppercase">THE BATHINDA REGISTER</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">PUNJAB COMMERCE EDITION</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{currentDateStr}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden lg:inline text-xs">Bathinda, PB (151001)</span>
          {/* Quick Role Tester Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-1 text-[11px] bg-white/80 border border-[#1E1B18]/20 px-2 py-0.5 rounded hover:bg-white transition"
              title="Switch user perspective for testing"
            >
              <span>Role: <strong className="uppercase text-[#C82A2A]">{role.replace('_', ' ')}</strong></span>
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#1E1B18]/20 shadow-lg rounded p-1 z-50">
                <div className="text-[10px] text-gray-500 font-sans px-2 py-1 uppercase font-semibold">Switch Persona</div>
                {(['customer', 'business_owner', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTestRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-xs rounded capitalize transition ${
                      role === r ? 'bg-[#1E1B18] text-white font-semibold' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Newspaper Brand Logo & Seal */}
        <div
          onClick={() => setCurrentTab('explore')}
          className="cursor-pointer flex items-center space-x-3 select-none"
        >
          {/* Modern Newspaper Network Emblem */}
          <div className="w-11 h-11 rounded-none border-2 border-[#1E1B18] bg-[#1E1B18] text-[#FAF8F5] flex flex-col items-center justify-center relative shadow-sm">
            <span className="font-serif font-black tracking-tighter text-sm leading-none">AOC</span>
            <span className="font-mono text-[9px] tracking-widest text-[#E23E3E] font-bold">SF</span>
            {/* Corner print registration marks */}
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-[#C82A2A]"></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-[#C82A2A]"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-[#161412]">
                AOCSF
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#E23E3E]/10 text-[#C82A2A] border border-[#E23E3E]/30 font-semibold tracking-wider">
                BATHINDA
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-tight text-[#5F5953] hidden sm:block">
              ARMY OF COLLECTIVE SHOP FRONT • “Every Local Business. One Connected Front.”
            </p>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="w-full md:max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops, gym, salon, tuition in Bathinda..."
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-[#1E1B18]/25 rounded text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#C82A2A] focus:ring-1 focus:ring-[#C82A2A] shadow-inner font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions & Account */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={onOpenClaimModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#C82A2A] hover:bg-[#B02222] text-white text-xs font-semibold rounded shadow-sm transition tracking-wide uppercase font-mono"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Claim / Add Business</span>
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-[#1E1B18]/15 pl-3">
              <div className="text-right">
                <div className="text-xs font-semibold leading-tight text-[#161412] max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-[#706A62] font-mono uppercase">
                  {role.replace('_', ' ')}
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-stone-500 hover:text-[#C82A2A] hover:bg-stone-100 rounded transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-[#1E1B18]/25 hover:border-[#1E1B18] text-xs font-medium rounded transition"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-600" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={onOpenClaimModal}
            className="px-2.5 py-1 bg-[#C82A2A] text-white text-xs font-medium rounded uppercase font-mono"
          >
            + Add
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:bg-stone-200 rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Editorial Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-[#1E1B18]/15 hidden md:block">
        <ul className="flex items-center space-x-1 sm:space-x-4 text-xs font-serif font-bold tracking-wide uppercase py-1 overflow-x-auto">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition ${
                    isActive
                      ? 'bg-[#1E1B18] text-[#FAF8F5]'
                      : 'text-[#4A4540] hover:text-[#161412] hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E23E3E]' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Email Verification Alert Banner */}
      {currentUser && !currentUser.emailVerified && (
        <div className="bg-amber-50 border-t border-b border-amber-300 px-4 py-2 text-xs font-mono text-amber-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Please verify your email:</strong> A confirmation link was dispatched to{' '}
              <span className="underline font-bold">{currentUser.email}</span>.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {verifyNotice ? (
              <span className="text-emerald-700 font-bold">{verifyNotice}</span>
            ) : (
              <>
                <button
                  onClick={async () => {
                    try {
                      await sendVerificationEmail();
                      setVerifyNotice('Verification link resent!');
                      setTimeout(() => setVerifyNotice(null), 4000);
                    } catch (e) {
                      setVerifyNotice('Error resending email.');
                      setTimeout(() => setVerifyNotice(null), 4000);
                    }
                  }}
                  className="px-2.5 py-1 bg-white border border-amber-400 hover:border-black rounded text-[11px] font-bold text-amber-950 transition"
                >
                  Resend Link
                </button>
                <button
                  onClick={async () => {
                    setIsCheckingVerify(true);
                    const isVerified = await reloadUser();
                    setIsCheckingVerify(false);
                    if (isVerified) {
                      setVerifyNotice('✓ Email successfully verified!');
                      setTimeout(() => setVerifyNotice(null), 3000);
                    } else {
                      setVerifyNotice('Not yet verified. Please click the link in your email first.');
                      setTimeout(() => setVerifyNotice(null), 4000);
                    }
                  }}
                  disabled={isCheckingVerify}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isCheckingVerify ? 'Checking...' : "I've Verified"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E1B18]/15 bg-[#FAF8F5] px-4 py-3 space-y-2">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-sm rounded font-serif uppercase ${
                  isActive ? 'bg-[#1E1B18] text-[#FAF8F5]' : 'text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1E1B18]/10 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono text-stone-600">{currentUser.email}</span>
                <button
                  onClick={signOut}
                  className="text-xs text-[#C82A2A] font-semibold flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-white border border-[#1E1B18]/30 text-xs font-medium rounded text-center"
              >
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
