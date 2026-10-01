import React from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Navigation,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  BookOpen,
  Share2
} from 'lucide-react';
import { Business } from '../../types';
import { isBusinessOpenNow, incrementMetric } from '../../services/businessService';

interface BusinessCardProps {
  business: Business;
  onSelect: (b: Business) => void;
  onOpenQuickConnect: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
  onOpenQr: (b: Business) => void;
  onOpenAi: (b: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onOpenQuickConnect,
  onOpenQr,
  onOpenAi,
}) => {
  const isOpen = isBusinessOpenNow(business);

  const getVerificationBadge = () => {
    switch (business.verifiedLevel) {
      case 'aocsf_verified':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase bg-[#161412] text-[#FAF8F5] px-1.5 py-0.5 border border-[#161412]">
            <ShieldCheck className="w-3 h-3 text-[#E23E3E]" />
            <span>AOCSF Verified</span>
          </span>
        );
      case 'profile_complete':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-800 px-1.5 py-0.5 border border-stone-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Profile 100%</span>
          </span>
        );
      case 'phone_verified':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 border border-stone-300">
            <span>Phone Verified</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-stone-500 bg-stone-50 px-1.5 py-0.5 border border-stone-200">
            <span>Email Verified</span>
          </span>
        );
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementMetric(business.id, 'phoneClicksCount');
    onOpenQuickConnect(business, 'call');
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementMetric(business.id, 'directionClicksCount');
    onOpenQuickConnect(business, 'directions');
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenQuickConnect(business, 'message');
  };

  return (
    <article
      onClick={() => onSelect(business)}
      className="group relative bg-[#FFFDF9] border border-[#161412]/20 hover:border-[#161412] transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer overflow-hidden"
    >
      {/* Newspaper Cut Line at Top */}
      <div className="h-1 bg-gradient-to-r from-[#161412] via-[#C82A2A] to-[#161412]"></div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Editorial Sub-header: Locality & Category */}
        <div className="flex items-center justify-between gap-2 mb-2 text-[11px] font-mono text-stone-600 border-b border-[#161412]/10 pb-1.5">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <span className="font-bold uppercase tracking-wider text-[#C82A2A]">
              {business.locality}
            </span>
            <span>•</span>
            <span className="truncate">{business.categories[0]}</span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {business.isDemo && (
              <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2">
                Sample
              </span>
            )}
            <span
              className={`inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-xs ${
                isOpen ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-600' : 'bg-stone-400'}`}></span>
              <span>{isOpen ? 'Open Now' : 'Closed'}</span>
            </span>
          </div>
        </div>

        {/* Business Title & Tagline */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-black text-[#161412] leading-tight group-hover:text-[#C82A2A] transition">
              {business.name}
            </h3>
            {business.priceRange && (
              <span className="text-xs font-mono font-bold text-stone-500 shrink-0">
                {business.priceRange}
              </span>
            )}
          </div>
          {business.tagline && (
            <p className="text-xs font-serif italic text-stone-600 mt-0.5 line-clamp-1">
              “{business.tagline}”
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-stone-700 font-sans leading-relaxed line-clamp-2 mb-3">
          {business.description}
        </p>

        {/* Address preview */}
        <div className="text-[11px] font-mono text-stone-500 mb-3 flex items-center space-x-1">
          <span>📍</span>
          <span className="truncate">{business.address}</span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 mb-4 mt-auto">
          {business.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-mono bg-[#F2EDE4] text-stone-800 px-2 py-0.5 border border-[#161412]/10"
            >
              {cat}
            </span>
          ))}
          {business.categories.length > 3 && (
            <span className="text-[10px] font-mono text-stone-500 px-1 py-0.5">
              +{business.categories.length - 3}
            </span>
          )}
        </div>

        {/* Badges Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#161412]/10">
          <div>{getVerificationBadge()}</div>
          <div className="text-[11px] font-mono text-stone-400">
            {business.completenessScore}% profile
          </div>
        </div>
      </div>

      {/* Action Footer: Call, Message, Directions, Catalog, Copilot */}
      <div className="bg-[#FAF7F2] border-t border-[#161412]/15 p-2.5 grid grid-cols-5 gap-1 text-center font-mono text-[11px]">
        {/* Call button */}
        <button
          onClick={handlePhoneClick}
          className="flex flex-col items-center justify-center p-1.5 hover:bg-[#161412] hover:text-white rounded-xs transition text-stone-800"
          title="Call Business"
        >
          <Phone className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px]">Call</span>
        </button>

        {/* Message button */}
        <button
          onClick={handleMessageClick}
          className="flex flex-col items-center justify-center p-1.5 hover:bg-[#161412] hover:text-white rounded-xs transition text-stone-800"
          title="Direct Message"
        >
          <MessageSquare className="w-3.5 h-3.5 mb-0.5 text-blue-600 group-hover:text-white" />
          <span className="text-[10px]">Chat</span>
        </button>

        {/* Directions button */}
        <button
          onClick={handleDirectionsClick}
          className="flex flex-col items-center justify-center p-1.5 hover:bg-[#161412] hover:text-white rounded-xs transition text-stone-800"
          title="Google Maps Navigation"
        >
          <Navigation className="w-3.5 h-3.5 mb-0.5 text-[#C82A2A]" />
          <span className="text-[10px]">Map</span>
        </button>

        {/* Catalog button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(business);
          }}
          className="flex flex-col items-center justify-center p-1.5 hover:bg-[#161412] hover:text-white rounded-xs transition text-stone-800"
          title="View Catalog"
        >
          <BookOpen className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px]">Catalog</span>
        </button>

        {/* AI Copilot button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAi(business);
          }}
          className="flex flex-col items-center justify-center p-1.5 bg-[#FAF3E0] hover:bg-[#C82A2A] hover:text-white border border-[#E0D5B8] rounded-xs transition text-stone-900"
          title="Ask AOCSF Business Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
          <span className="text-[10px] font-bold">Ask AI</span>
        </button>
      </div>
    </article>
  );
};
