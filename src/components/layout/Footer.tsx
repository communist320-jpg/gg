import React from 'react';
import { BATHINDA_LOCALITIES, ALL_CATEGORIES } from '../../types';

interface FooterProps {
  onSelectLocality: (loc: string) => void;
  onSelectCategory: (cat: string) => void;
  onOpenClaim: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectLocality,
  onSelectCategory,
  onOpenClaim,
}) => {
  return (
    <footer className="bg-[#161412] text-[#E2DFD7] border-t-4 border-[#C82A2A] mt-16 pt-12 pb-24 md:pb-12 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newspaper Columnar Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-[#FAF8F5]/15 pb-10">
          {/* Col 1: Identity & Mission */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-black text-white tracking-wider">AOCSF</span>
              <span className="text-[10px] text-[#E23E3E] font-bold border border-[#E23E3E] px-1 py-0.2">
                PUNJAB
              </span>
            </div>
            <p className="font-serif text-sm italic text-stone-300">
              “Every Local Business. One Connected Front.”
            </p>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Bathinda's independent business syndicate combining real-time local discovery, verified digital catalogs, AI copilot insights, and inter-store B2B alliances.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenClaim}
                className="px-3 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-[11px] font-bold uppercase tracking-wider rounded transition"
              >
                + Register Your Shop
              </button>
            </div>
          </div>

          {/* Col 2: Bathinda Localities */}
          <div>
            <h4 className="font-serif font-black text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              Bathinda Sectors & Roads
            </h4>
            <ul className="space-y-1 text-stone-400 text-[11px]">
              {BATHINDA_LOCALITIES.slice(0, 7).map((loc) => (
                <li key={loc}>
                  <button
                    onClick={() => onSelectLocality(loc)}
                    className="hover:text-white transition hover:underline"
                  >
                    • {loc}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories Index */}
          <div>
            <h4 className="font-serif font-black text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              Directory Classification
            </h4>
            <ul className="space-y-1 text-stone-400 text-[11px]">
              {ALL_CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white transition hover:underline"
                  >
                    • {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform Standards */}
          <div>
            <h4 className="font-serif font-black text-sm text-white uppercase tracking-wider mb-3 pb-1 border-b border-stone-800">
              Platform Governance
            </h4>
            <p className="text-stone-400 text-[11px] leading-relaxed mb-3">
              Zero-spam policy. Verified phone and location safeguards. Built to empower neighborhood commerce across Punjab and greater India.
            </p>
            <div className="text-[10px] text-stone-500 font-mono space-y-1">
              <div>Launch City: Bathinda (151001), PB</div>
              <div>Security: Firebase Cloud Vault</div>
              <div>AI Engine: AOCSF Business Copilot</div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <div>
            © 2026 AOCSF (Army of Collective Shop Front). All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Model: Bathinda First</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
