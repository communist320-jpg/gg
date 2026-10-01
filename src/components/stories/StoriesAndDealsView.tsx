import React, { useState } from 'react';
import {
  Newspaper,
  Tag,
  Clock,
  PlusCircle,
  Sparkles,
  Calendar,
  Share2,
  ChevronRight,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { BusinessStory, BusinessOffer, Business } from '../../types';
import { createStory, createOffer } from '../../services/businessService';

interface StoriesAndDealsViewProps {
  stories: BusinessStory[];
  offers: BusinessOffer[];
  businesses: Business[];
  onSelectBusiness: (b: Business) => void;
  onRefresh: () => void;
}

export const StoriesAndDealsView: React.FC<StoriesAndDealsViewProps> = ({
  stories,
  offers,
  businesses,
  onSelectBusiness,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'stories' | 'deals'>('stories');
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Story Form
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyType, setStoryType] = useState<BusinessStory['type']>('new_arrival');

  // Offer Form
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerValidUntil, setOfferValidUntil] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerTerms, setOfferTerms] = useState('');

  const myBusiness = businesses[0];

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyContent.trim()) return;

    const newStory: BusinessStory = {
      id: `story-${Date.now()}`,
      businessId: myBusiness?.id || 'demo-story',
      businessName: myBusiness?.name || 'Local Business',
      locality: myBusiness?.locality || 'Mall Road',
      title: storyTitle.trim(),
      content: storyContent.trim(),
      type: storyType,
      createdAt: new Date().toISOString(),
    };

    await createStory(newStory);
    setShowStoryModal(false);
    setStoryTitle('');
    setStoryContent('');
    onRefresh();
  };

  const handlePublishOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerDiscount.trim()) return;

    const newOffer: BusinessOffer = {
      id: `offer-${Date.now()}`,
      businessId: myBusiness?.id || 'demo-offer',
      businessName: myBusiness?.name || 'Local Business',
      locality: myBusiness?.locality || 'Model Town',
      title: offerTitle.trim(),
      discount: offerDiscount.trim(),
      validUntil: offerValidUntil || 'October 31, 2026',
      code: offerCode.trim() || undefined,
      terms: offerTerms.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await createOffer(newOffer);
    setShowOfferModal(false);
    setOfferTitle('');
    setOfferDiscount('');
    onRefresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      {/* Title Header */}
      <div className="border-b-2 border-[#161412] pb-3 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            BATHINDA DISPATCH & BULLETIN
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#161412] tracking-tight">
            Local Stories & Deal Board
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            Real-time shop announcements, festival notices, and verified promotional offers across Bathinda.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'stories' ? (
            <button
              onClick={() => setShowStoryModal(true)}
              className="px-3.5 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-semibold rounded shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Shop Story</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOfferModal(true)}
              className="px-3.5 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-semibold rounded shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publish Limited Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#161412]/20 mb-6 text-xs font-serif font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('stories')}
          className={`py-2 px-5 transition ${
            activeTab === 'stories'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Local Business Stories ({stories.length})
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`py-2 px-5 transition ${
            activeTab === 'deals'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Exclusive Deal Board ({offers.length})
        </button>
      </div>

      {/* TAB 1: STORIES */}
      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story) => (
            <article
              key={story.id}
              className="bg-[#FFFDF9] border border-[#161412]/20 p-5 flex flex-col justify-between shadow-xs hover:border-black transition"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-2">
                  <span className="font-bold text-[#C82A2A]">{story.locality}</span>
                  <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-xs">
                    {story.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-black text-[#161412] leading-snug">
                  {story.title}
                </h3>
                <p className="text-xs text-stone-700 font-sans mt-2 leading-relaxed">
                  {story.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono">
                <span className="text-stone-500 font-bold truncate max-w-[150px]">
                  {story.businessName}
                </span>
                <span className="text-stone-400 text-[10px]">
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* TAB 2: DEALS */}
      {activeTab === 'deals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((off) => (
            <div
              key={off.id}
              className="bg-white border-2 border-[#161412] p-5 flex flex-col justify-between relative shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                    {off.locality} • BATHINDA
                  </div>
                  <h4 className="font-mono text-xs font-bold text-stone-600 mt-0.5">
                    {off.businessName}
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase bg-[#161412] text-white px-2 py-0.5 font-bold">
                  OFFER
                </span>
              </div>

              <div className="my-2">
                <div className="font-serif text-2xl font-black text-[#C82A2A]">
                  {off.discount}
                </div>
                <div className="font-serif font-bold text-base text-[#161412] mt-0.5">
                  {off.title}
                </div>
                {off.terms && (
                  <p className="text-xs text-stone-600 font-sans mt-2 leading-relaxed">
                    {off.terms}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono">
                {off.code ? (
                  <span className="bg-[#FAF3E0] border border-[#E0D5B8] px-2 py-1 font-bold text-stone-800">
                    CODE: {off.code}
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">Walk-in voucher</span>
                )}
                <span className="text-stone-500 text-[11px]">
                  Expires: {off.validUntil}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: POST STORY */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-5 shadow-2xl relative">
            <div className="border-b border-[#161412]/20 pb-2 mb-3">
              <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                COMMUNITY BULLETIN
              </div>
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Post a Shop Story or Notice
              </h3>
            </div>

            <form onSubmit={handlePublishStory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Story Type
                </label>
                <select
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value as any)}
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                >
                  <option value="new_arrival">New Arrival / Fresh Stock</option>
                  <option value="new_service">New Service Available</option>
                  <option value="special_event">Special Event / Trunk Show</option>
                  <option value="holiday_notice">Holiday or Festival Notice</option>
                  <option value="announcement">General Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g. Fresh Batch of Desi Ghee Dhodha Ready Today!"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Story Details
                </label>
                <textarea
                  rows={3}
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="Describe the update for shoppers in Bathinda..."
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-3 py-1.5 border border-stone-300 text-xs font-mono rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST OFFER */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-5 shadow-2xl relative">
            <div className="border-b border-[#161412]/20 pb-2 mb-3">
              <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                COMMERCE PROMOTION
              </div>
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Publish a Limited-Time Deal
              </h3>
            </div>

            <form onSubmit={handlePublishOffer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Discount Highlight
                </label>
                <input
                  type="text"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  placeholder="e.g. 25% OFF or Buy 1 Get 1 Free"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Offer Title / Package
                </label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Diwali Sweets Gift Hampers or Annual Gym Membership"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value)}
                    placeholder="e.g. DIWALI-BTI"
                    className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="text"
                    value={offerValidUntil}
                    onChange={(e) => setOfferValidUntil(e.target.value)}
                    placeholder="e.g. Nov 15, 2026"
                    className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Terms & Conditions
                </label>
                <input
                  type="text"
                  value={offerTerms}
                  onChange={(e) => setOfferTerms(e.target.value)}
                  placeholder="e.g. Valid on dine-in orders only. Cannot be clubbed with other offers."
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-3 py-1.5 border border-stone-300 text-xs font-mono rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
                >
                  Publish Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
