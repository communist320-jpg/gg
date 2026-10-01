import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Navigation,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Share2,
  ExternalLink,
  BookOpen,
  Star,
  Users2,
  HelpCircle,
  Building,
  Calendar,
  AlertCircle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Business, CatalogItem, CustomerFeedback, BusinessConnection } from '../../types';
import {
  getCatalogItems,
  getFeedback,
  getConnections,
  incrementMetric,
  isBusinessOpenNow,
  isBusinessFollowed,
  toggleFollowBusiness
} from '../../services/businessService';
import { GoogleMapComponent } from '../common/GoogleMapComponent';
import { QrModal } from '../common/QrModal';
import { QuickConnectModal } from './QuickConnectModal';
import { BusinessCopilotModal } from './BusinessCopilotModal';
import { FeedbackModal } from './FeedbackModal';

interface BusinessProfileViewProps {
  business: Business;
  onBack: () => void;
  onSelectConnectedBusiness?: (bizId: string) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  business,
  onBack,
  onSelectConnectedBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'catalog' | 'feedback' | 'network' | 'faqs'>('about');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [feedbackList, setFeedbackList] = useState<CustomerFeedback[]>([]);
  const [connections, setConnections] = useState<BusinessConnection[]>([]);
  const [isFollowed, setIsFollowed] = useState<boolean>(isBusinessFollowed(business.id));
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectInitialMode, setConnectInitialMode] = useState<'call' | 'email' | 'message' | 'directions'>('message');
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Log profile view metric
    incrementMetric(business.id, 'viewsCount');

    // Load related items
    getCatalogItems(business.id).then(setCatalogItems);
    getFeedback(business.id).then(setFeedbackList);
    getConnections(business.id).then(setConnections);
  }, [business.id]);

  const isOpen = isBusinessOpenNow(business);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${business.name} — AOCSF Bathinda`,
        text: `Discover ${business.name} on the Army of Collective Shop Front (Bathinda, Punjab)`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const filteredCatalog = catalogItems.filter(item =>
    item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      {/* Return to explore bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#161412]/15 mb-4 text-xs font-mono">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-stone-700 hover:text-black font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bathinda Directory</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-stone-400 hidden sm:inline">aocsf.in/business/{business.slug}</span>
          <button
            onClick={() => {
              const updated = toggleFollowBusiness(business.id);
              setIsFollowed(updated);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] transition ${
              isFollowed
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                : 'bg-white border border-[#161412]/30 hover:border-black text-stone-800'
            }`}
          >
            {isFollowed ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isFollowed ? 'Following' : '+ Follow'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-[#161412]/20 hover:border-black rounded text-[11px] transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#161412] text-white rounded text-[11px] hover:bg-[#C82A2A] transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Passport QR</span>
          </button>
        </div>
      </div>

      {/* Main Profile Editorial Masthead Card */}
      <div className="bg-[#FFFDF9] border-2 border-[#161412] shadow-sm mb-6 overflow-hidden">
        {/* Newspaper Issue Line */}
        <div className="bg-[#F0EBE1] border-b border-[#161412]/20 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase text-stone-600">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#C82A2A]">AOCSF LOCAL REGISTRATION</span>
            <span>•</span>
            <span>{business.locality}, BATHINDA</span>
            <span>•</span>
            <span>EST. BATHINDA COMMERCE REGISTER</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">STATUS:</span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded-xs ${
                isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              ● {isOpen ? 'OPEN NOW' : 'CURRENTLY CLOSED'}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-5">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#C82A2A] font-bold">
                  {business.locality}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-mono text-stone-600">
                  {business.categories.join(' • ')}
                </span>
                {business.verifiedLevel === 'aocsf_verified' && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono bg-[#161412] text-white px-2 py-0.5 rounded-xs font-semibold">
                    <ShieldCheck className="w-3 h-3 text-[#E23E3E]" />
                    <span>AOCSF Verified</span>
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-black text-[#161412] tracking-tight leading-tight">
                {business.name}
              </h1>

              {business.tagline && (
                <p className="font-serif italic text-stone-600 text-sm sm:text-base mt-1">
                  “{business.tagline}”
                </p>
              )}

              <p className="text-xs sm:text-sm text-stone-700 font-sans leading-relaxed mt-3 max-w-3xl">
                {business.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-stone-600">
                <div>📍 {business.address}</div>
                <div>📞 {business.phone}</div>
                <div>✉️ {business.email}</div>
                {business.priceRange && <div>💰 {business.priceRange}</div>}
              </div>
            </div>

            {/* Completeness & QR Stamp */}
            <div className="shrink-0 flex md:flex-col items-center gap-3 bg-[#FAF7F2] border border-[#161412]/15 p-3 rounded text-center w-full md:w-44">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                Profile Health
              </div>
              <div className="font-serif text-2xl font-black text-[#161412]">
                {business.completenessScore}%
              </div>
              <div className="text-[10px] font-mono text-stone-500">
                Verified Bathinda Directory Profile
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full py-1.5 bg-white border border-[#161412]/30 text-xs font-mono font-medium hover:bg-stone-50 transition"
              >
                View QR
              </button>
            </div>
          </div>

          {/* Quick Action Command Center */}
          <div className="mt-6 pt-5 border-t border-[#161412]/15 grid grid-cols-2 sm:grid-cols-6 gap-2">
            <button
              onClick={() => {
                setConnectInitialMode('call');
                setShowConnectModal(true);
              }}
              className="py-2.5 px-3 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded-xs transition flex items-center justify-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>

            <button
              onClick={() => {
                setConnectInitialMode('message');
                setShowConnectModal(true);
              }}
              className="py-2.5 px-3 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xs transition flex items-center justify-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => {
                setConnectInitialMode('directions');
                setShowConnectModal(true);
              }}
              className="py-2.5 px-3 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xs transition flex items-center justify-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-[#C82A2A]" />
              <span>Directions</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className="py-2.5 px-3 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xs transition flex items-center justify-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catalog ({catalogItems.length})</span>
            </button>

            <button
              onClick={() => setShowCopilotModal(true)}
              className="py-2.5 px-3 bg-[#FAF3E0] border border-[#E0D5B8] hover:bg-[#C82A2A] hover:text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition flex items-center justify-center space-x-1.5 text-stone-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ask Copilot</span>
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="py-2.5 px-3 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono uppercase tracking-wider font-semibold rounded-xs transition flex items-center justify-center space-x-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Navigation Tabs */}
      <div className="flex border-b-2 border-[#161412] mb-6 overflow-x-auto text-xs font-serif font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('about')}
          className={`py-2 px-4 transition ${
            activeTab === 'about'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Overview & Map
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 px-4 transition ${
            activeTab === 'catalog'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Digital Catalog ({catalogItems.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-2 px-4 transition ${
            activeTab === 'feedback'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Customer Feedback ({feedbackList.length})
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`py-2 px-4 transition ${
            activeTab === 'network'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          B2B Network ({connections.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & MAP */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Real Google Map embed */}
            <div className="bg-white border border-[#161412]/20 p-4">
              <div className="flex items-center justify-between mb-3 text-xs font-mono font-bold uppercase border-b border-stone-200 pb-2">
                <span>Verified Storefront Location</span>
                <span className="text-[#C82A2A]">Bathinda, Punjab</span>
              </div>
              <GoogleMapComponent singleBusiness={business} height="320px" zoom={15} />
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-stone-600">
                <span>📍 {business.address}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${business.address}, ${business.locality}, Bathinda`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C82A2A] font-bold hover:underline inline-flex items-center space-x-1"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Photos Showcase */}
            {business.photos && business.photos.length > 0 && (
              <div className="bg-white border border-[#161412]/20 p-4">
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider mb-3">
                  Storefront & Facilities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {business.photos.map((url, i) => (
                    <div key={i} className="aspect-video bg-stone-100 overflow-hidden border border-stone-300">
                      <img src={url} alt={`${business.name} ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Hours, Social, FAQs */}
          <div className="space-y-6">
            {/* Opening Hours Schedule */}
            <div className="bg-[#FAF7F2] border border-[#161412]/20 p-4">
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#C82A2A]" />
                <span>Operating Timings</span>
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(business.openingHours || {}).map(([day, slot]) => (
                  <div key={day} className="flex justify-between py-1 border-b border-stone-200">
                    <span className="capitalize text-stone-600">{day}</span>
                    <span className="font-bold">
                      {slot.isClosed ? 'Closed' : `${slot.open} – ${slot.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Asked Questions */}
            {business.faqs && business.faqs.length > 0 && (
              <div className="bg-white border border-[#161412]/20 p-4">
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-stone-700" />
                  <span>Frequently Asked Questions</span>
                </h3>
                <div className="space-y-3">
                  {business.faqs.map((faq, i) => (
                    <div key={i} className="text-xs">
                      <div className="font-bold text-[#161412] mb-0.5">Q: {faq.question}</div>
                      <div className="text-stone-600 font-sans leading-relaxed">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DIGITAL CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-[#161412]/20">
            <div className="text-xs font-mono">
              Displaying <strong>{filteredCatalog.length}</strong> items & services available at {business.locality} store.
            </div>
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search catalog items..."
              className="text-xs p-2 bg-[#FAF8F5] border border-stone-300 rounded w-full sm:w-64 font-sans"
            />
          </div>

          {filteredCatalog.length === 0 ? (
            <div className="bg-white border border-[#161412]/20 p-12 text-center text-stone-500 font-mono text-xs">
              No catalog items match your search. Call {business.phone} for custom orders.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#161412]/20 p-4 flex flex-col justify-between hover:border-black transition"
                >
                  {item.photoUrl && (
                    <div className="aspect-video bg-stone-100 mb-3 overflow-hidden border border-stone-200">
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-1.5 py-0.5">
                      {item.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#161412] mt-1.5">
                      {item.name}
                    </h4>
                    <p className="text-xs text-stone-600 font-sans mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-mono text-base font-black text-[#161412]">
                      {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Price on Inquiry'}
                    </span>
                    <button
                      onClick={() => {
                        setConnectInitialMode('message');
                        setShowConnectModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#161412] hover:bg-[#C82A2A] text-white text-[11px] font-mono rounded transition"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CUSTOMER FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#FAF7F2] p-4 border border-[#161412]/20">
            <div>
              <h3 className="font-serif font-bold text-sm">Verified Customer Reviews</h3>
              <p className="text-xs text-stone-600 font-mono">Community feedback from Bathinda residents</p>
            </div>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-4 py-2 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded shadow-xs"
            >
              Give Feedback
            </button>
          </div>

          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="bg-white border border-[#161412]/20 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          fb.rating >= s ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-mono font-bold ml-1.5">{fb.experience}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-sans leading-relaxed mt-1">
                  “{fb.comment}”
                </p>
                <div className="mt-2 text-[10px] font-mono text-stone-500">
                  — {fb.customerName} ({fb.category || 'Customer'})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. B2B NETWORK & SYNERGIES */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-4 border border-[#161412]/20">
            <h3 className="font-serif font-bold text-sm uppercase">AOCSF Business Synergy Graph</h3>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              Businesses in Bathinda connected with {business.name} for mutual cross-promotion and referrals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connections.length === 0 ? (
              <div className="col-span-2 bg-white border border-[#161412]/20 p-8 text-center text-stone-500 font-mono text-xs">
                No public B2B connections established yet. Business owners can propose collaborations in their dashboard.
              </div>
            ) : (
              connections.map((c) => (
                <div key={c.id} className="bg-white border border-[#161412]/20 p-4">
                  <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                    CONNECTED PARTNER
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#161412] mt-1">
                    {c.fromBusinessId === business.id ? c.toBusinessName : c.fromBusinessName}
                  </h4>
                  <p className="text-xs text-stone-600 font-sans mt-1">
                    {c.proposalText || 'Authorized cross-referral and partner network member.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showQrModal && (
        <QrModal business={business} onClose={() => setShowQrModal(false)} />
      )}
      {showConnectModal && (
        <QuickConnectModal
          business={business}
          initialMode={connectInitialMode}
          onClose={() => setShowConnectModal(false)}
        />
      )}
      {showCopilotModal && (
        <BusinessCopilotModal
          business={business}
          initialMode="customer_qa"
          onClose={() => setShowCopilotModal(false)}
        />
      )}
      {showFeedbackModal && (
        <FeedbackModal business={business} onClose={() => setShowFeedbackModal(false)} />
      )}
    </div>
  );
};
