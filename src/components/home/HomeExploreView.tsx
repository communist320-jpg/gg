import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Radio,
  CheckCircle2,
  Store,
  ChevronRight
} from 'lucide-react';
import { Business, ALL_CATEGORIES, BATHINDA_LOCALITIES, BusinessCategory } from '../../types';
import { BusinessCard } from '../business/BusinessCard';

interface HomeExploreViewProps {
  businesses: Business[];
  onSelectBusiness: (b: Business) => void;
  onOpenQuickConnect: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
  onOpenQr: (b: Business) => void;
  onOpenAi: (b: Business) => void;
  onOpenClaim: () => void;
  onGoToMap: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedLocality: string;
  setSelectedLocality: (loc: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onlyOpenNow: boolean;
  setOnlyOpenNow: (v: boolean) => void;
  onlyVerified: boolean;
  setOnlyVerified: (v: boolean) => void;
}

export const HomeExploreView: React.FC<HomeExploreViewProps> = ({
  businesses,
  onSelectBusiness,
  onOpenQuickConnect,
  onOpenQr,
  onOpenAi,
  onOpenClaim,
  onGoToMap,
  searchQuery,
  setSearchQuery,
  selectedLocality,
  setSelectedLocality,
  selectedCategory,
  setSelectedCategory,
  onlyOpenNow,
  setOnlyOpenNow,
  onlyVerified,
  setOnlyVerified,
}) => {
  const quickSearchTags = [
    'Gym near me',
    'Salon',
    'Tuition',
    'Mobile shop',
    'Clothing',
    'Desi Ghee Sweets',
    'Car Care',
  ];

  const handleTagClick = (tag: string) => {
    if (tag === 'Gym near me') {
      setSelectedCategory('Gyms / Fitness');
      setSearchQuery('');
    } else if (tag === 'Salon') {
      setSelectedCategory('Salons / Beauty');
      setSearchQuery('');
    } else if (tag === 'Tuition') {
      setSelectedCategory('Tuition Centres');
      setSearchQuery('');
    } else if (tag === 'Mobile shop') {
      setSelectedCategory('Mobile Shops');
      setSearchQuery('');
    } else if (tag === 'Clothing') {
      setSelectedCategory('Clothing');
      setSearchQuery('');
    } else {
      setSearchQuery(tag);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Section */}
      <section className="relative bg-[#F5F2EB] border-b-2 border-[#161412] pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#161412] text-[#FAF8F5] text-[11px] font-mono tracking-widest uppercase font-semibold">
            <span>VOL. 1 • LAUNCH CITY: BATHINDA, PUNJAB</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-[#161412] tracking-tight leading-tight">
            ARMY OF COLLECTIVE SHOP FRONT
          </h1>

          <p className="font-serif text-base sm:text-xl italic text-stone-700 max-w-2xl mx-auto">
            “Bathinda’s businesses. Connected. Every Local Business. One Connected Front.”
          </p>

          <p className="text-xs sm:text-sm text-stone-600 font-mono max-w-xl mx-auto">
            Discover Bathinda's shops, gyms, tuition academies, salons, repair specialists & boutiques with verified catalogs, maps, and direct contact.
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('listings-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold tracking-wider rounded-xs shadow-sm transition"
            >
              EXPLORE BATHINDA
            </button>
            <button
              onClick={onOpenClaim}
              className="px-6 py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold tracking-wider rounded-xs shadow-md transition"
            >
              JOIN AOCSF
            </button>
            <button
              onClick={onGoToMap}
              className="px-5 py-2.5 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono uppercase font-bold tracking-wider rounded-xs transition"
            >
              AOCSF MAP
            </button>
          </div>

          {/* Quick Search Tags */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono">
            <span className="text-stone-500">Popular in Bathinda:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 bg-white border border-stone-300 hover:border-black rounded text-stone-700 hover:text-black transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Unique AOCSF Features: Radar & Local Pulse */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 16A: LOCAL BUSINESS RADAR */}
          <div className="bg-[#FFFDF9] border border-[#161412]/20 p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#161412]/15 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#C82A2A] animate-pulse" />
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#161412]">
                  LOCAL BUSINESS RADAR
                </h3>
              </div>
              <span className="text-[10px] font-mono text-stone-500 uppercase">Bathinda Feed</span>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed mb-3">
              Newly registered and recently updated storefronts in Model Town, Civil Lines, and Mall Road.
            </p>
            <div className="space-y-2 text-xs font-mono">
              {businesses.length === 0 ? (
                <div className="p-4 bg-[#FAF8F5] border border-dashed border-stone-300 text-center text-stone-500 text-[11px]">
                  <span>Radar standing by. Real businesses registered in Bathinda will broadcast here.</span>
                  <button
                    onClick={onOpenClaim}
                    className="block mx-auto mt-2 text-[#C82A2A] font-bold underline"
                  >
                    + Register Your Business
                  </button>
                </div>
              ) : (
                businesses.slice(0, 3).map((biz) => (
                  <div
                    key={biz.id}
                    onClick={() => onSelectBusiness(biz)}
                    className="p-2 bg-[#FAF8F5] border border-stone-200 hover:border-black cursor-pointer flex justify-between items-center transition"
                  >
                    <div className="truncate max-w-[200px]">
                      <span className="font-bold text-[#161412]">{biz.name}</span>
                      <span className="text-stone-500 text-[10px] block">📍 {biz.locality}</span>
                    </div>
                    <span className="text-[10px] text-[#C82A2A] font-semibold uppercase">
                      Active • {biz.categories[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feature 16C: LOCAL BUSINESS PULSE */}
          <div className="bg-[#FFFDF9] border border-[#161412]/20 p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#161412]/15 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#161412]">
                  LOCAL BUSINESS PULSE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-stone-500 uppercase">Aggregated Trends</span>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed mb-3">
              Anonymous platform traffic data reflecting shifting commerce patterns across Bathinda:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-[#FAF8F5] border border-stone-200 flex items-center space-x-2">
                <span className="text-emerald-700 font-bold">↑ 48%</span>
                <span className="text-stone-700">Food & Sweets businesses experiencing increased inquiries this festival season.</span>
              </div>
              <div className="p-2 bg-[#FAF8F5] border border-stone-200 flex items-center space-x-2">
                <span className="text-blue-700 font-bold">↑ 32%</span>
                <span className="text-stone-700">IELTS academies on Ajit Road recording highest weekend catalog inspections.</span>
              </div>
              <div className="p-2 bg-[#FAF8F5] border border-stone-200 flex items-center space-x-2">
                <span className="text-amber-700 font-bold">↑ 26%</span>
                <span className="text-stone-700">Model Town gyms and fitness centres leading in QR code storefront passport scans.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Business Discovery Directory */}
      <section id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Newspaper Column Filter Header */}
        <div className="border-y-2 border-[#161412] py-4 bg-[#FAF7F2]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C82A2A] font-bold">
                COMMERCE GAZETTE CLASSIFIEDS
              </div>
              <h2 className="font-serif text-2xl font-black text-[#161412] tracking-tight">
                Discover Bathinda’s Local Business Network
              </h2>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                className={`px-3 py-1.5 border rounded-xs transition ${
                  onlyOpenNow
                    ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                }`}
              >
                ● Open Now
              </button>

              <button
                onClick={() => setOnlyVerified(!onlyVerified)}
                className={`px-3 py-1.5 border rounded-xs transition ${
                  onlyVerified
                    ? 'bg-[#161412] text-white border-black font-bold'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                }`}
              >
                ✓ Verified Only
              </button>

              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="p-1.5 bg-white border border-[#161412]/30 rounded-xs text-xs font-mono"
              >
                <option value="All Localities">All Bathinda Localities</option>
                {BATHINDA_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-1.5 bg-white border border-[#161412]/30 rounded-xs text-xs font-mono"
              >
                <option value="All Categories">All Categories</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Business Grid */}
        {businesses.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#161412]/30 p-12 text-center space-y-3">
            <Store className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#161412]">
              No local businesses match your criteria
            </h3>
            <p className="text-xs text-stone-600 font-mono max-w-sm mx-auto">
              Try adjusting your search keywords, locality, or category filter.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedLocality('All Localities');
                  setOnlyOpenNow(false);
                  setOnlyVerified(false);
                }}
                className="px-4 py-2 bg-[#161412] text-white text-xs font-mono uppercase font-bold rounded"
              >
                Reset Filters
              </button>
              <button
                onClick={onOpenClaim}
                className="px-4 py-2 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold rounded shadow-xs"
              >
                + Register First Business
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                onSelect={onSelectBusiness}
                onOpenQuickConnect={onOpenQuickConnect}
                onOpenQr={onOpenQr}
                onOpenAi={onOpenAi}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Business Claim CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-[#161412] text-[#FAF8F5] p-6 sm:p-8 border-t-4 border-[#C82A2A] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E23E3E] font-bold">
              LOCAL MERCHANT ENROLLMENT
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black">
              Own a local business in Bathinda?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-sans max-w-xl">
              Create your verified AOCSF profile in 2–3 minutes. Publish your digital catalog, accept direct customer inquiries, and connect with other local businesses.
            </p>
          </div>
          <button
            onClick={onOpenClaim}
            className="px-6 py-3 bg-[#C82A2A] hover:bg-[#B02222] text-white text-xs font-mono uppercase tracking-wider font-bold rounded shadow-lg transition shrink-0"
          >
            Claim / Register Business
          </button>
        </div>
      </section>
    </div>
  );
};
