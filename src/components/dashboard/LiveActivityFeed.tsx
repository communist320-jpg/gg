import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  Package,
  Calendar,
  Tag,
  Store,
  Phone,
  MessageSquare,
  Navigation,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Users,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Bookmark
} from 'lucide-react';
import { Business, ActivityUpdate } from '../../types';
import {
  getLiveActivities,
  getFollowedBusinessIds,
  toggleFollowBusiness,
  publishLiveActivity
} from '../../services/businessService';

interface LiveActivityFeedProps {
  businesses: Business[];
  currentBusiness?: Business;
  onSelectBusiness: (b: Business) => void;
  onOpenQuickConnect: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  businesses,
  currentBusiness,
  onSelectBusiness,
  onOpenQuickConnect,
}) => {
  const [activities, setActivities] = useState<ActivityUpdate[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [followedOnly, setFollowedOnly] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Broadcast Modal State (for owner to post updates)
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastType, setBroadcastType] = useState<ActivityUpdate['type']>('product_arrival');
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastDescription, setBroadcastDescription] = useState<string>('');
  const [broadcastPrice, setBroadcastPrice] = useState<string>('');
  const [broadcastNewHours, setBroadcastNewHours] = useState<string>('09:30 AM – 09:30 PM (Festive)');
  const [broadcastOldHours, setBroadcastOldHours] = useState<string>('09:30 AM – 08:30 PM');

  const loadData = () => {
    const fIds = getFollowedBusinessIds();
    setFollowedIds(fIds);
    const acts = getLiveActivities({
      followedOnly,
      typeFilter: typeFilter === 'all' ? undefined : typeFilter,
    });
    setActivities(acts);
  };

  useEffect(() => {
    loadData();
  }, [followedOnly, typeFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
    }, 400);
  };

  const handleToggleFollow = (bizId: string) => {
    toggleFollowBusiness(bizId);
    const updated = getFollowedBusinessIds();
    setFollowedIds(updated);
    // Reload activities with new follow state
    const acts = getLiveActivities({
      followedOnly,
      typeFilter: typeFilter === 'all' ? undefined : typeFilter,
    });
    setActivities(acts);
  };

  const handlePostBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastDescription.trim()) return;

    const targetBiz = currentBusiness || businesses[0];
    const newActivity: ActivityUpdate = {
      id: `act-${Date.now()}`,
      businessId: targetBiz.id,
      businessName: targetBiz.name,
      businessLocality: targetBiz.locality,
      type: broadcastType,
      title: broadcastTitle.trim(),
      description: broadcastDescription.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        price: broadcastPrice ? Number(broadcastPrice) : undefined,
        newHours: broadcastType === 'hours_change' ? broadcastNewHours : undefined,
        oldHours: broadcastType === 'hours_change' ? broadcastOldHours : undefined,
        imageUrl: broadcastType === 'product_arrival' ? (targetBiz.photos?.[0] || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80') : undefined,
        statusBadge: broadcastType === 'hours_change' ? 'Hours Adjusted' : undefined,
      },
    };

    publishLiveActivity(newActivity);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastDescription('');
    setBroadcastPrice('');
    loadData();
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 text-[#161412]">
      {/* Live Wire Banner */}
      <div className="bg-[#FAF7F2] border-2 border-[#161412] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#161412]/15 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#C82A2A] font-bold uppercase">
                THE BATHINDA LIVE WIRE • REAL-TIME DISPATCHES
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-[#161412] tracking-tight">
                Live Activity Stream from Followed Merchants
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-white border border-[#161412]/20 hover:border-black text-xs font-mono font-medium rounded transition flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C82A2A]' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold tracking-wider rounded shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Broadcast Update</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Follow Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Dispatches' },
              { id: 'product_arrival', label: '📦 Product Arrivals' },
              { id: 'hours_change', label: '⏰ Hours & Schedules' },
              { id: 'deal_published', label: '🏷️ Flash Deals' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded-xs transition ${
                  typeFilter === f.id
                    ? 'bg-[#161412] text-white font-bold'
                    : 'bg-white border border-stone-300 text-stone-700 hover:border-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={followedOnly}
                onChange={(e) => setFollowedOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#C82A2A] rounded"
              />
              <span className="font-semibold text-stone-800">
                Followed Merchants Only ({followedIds.length})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#161412]/30 p-12 text-center space-y-3">
            <Radio className="w-10 h-10 text-stone-400 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#161412]">
              No updates from followed businesses yet
            </h4>
            <p className="text-xs text-stone-600 font-mono max-w-sm mx-auto">
              Follow more local Bathinda businesses or toggle to view all platform broadcasts.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setFollowedOnly(false)}
                className="px-4 py-2 bg-[#161412] text-white text-xs font-mono uppercase font-bold rounded"
              >
                Show All Bathinda Businesses
              </button>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-4 py-2 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold rounded"
              >
                + Broadcast First Update
              </button>
            </div>
          </div>
        ) : (
          activities.map((act) => {
            const biz = businesses.find((b) => b.id === act.businessId);
            const isFollowed = followedIds.includes(act.businessId);

            return (
              <article
                key={act.id}
                className="bg-[#FFFDF9] border border-[#161412]/20 hover:border-[#161412] transition-all p-4 sm:p-5 shadow-xs relative overflow-hidden"
              >
                {/* Accent top border by category */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    act.type === 'product_arrival'
                      ? 'bg-blue-600'
                      : act.type === 'hours_change'
                      ? 'bg-[#C82A2A]'
                      : 'bg-emerald-600'
                  }`}
                ></div>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left Column: Business Info & Title */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {/* Type Badge */}
                      {act.type === 'product_arrival' && (
                        <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 font-bold uppercase text-[10px]">
                          <Package className="w-3 h-3" />
                          <span>New Product Arrival</span>
                        </span>
                      )}
                      {act.type === 'hours_change' && (
                        <span className="inline-flex items-center space-x-1 bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 font-bold uppercase text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Store Hours Changed</span>
                        </span>
                      )}
                      {act.type === 'deal_published' && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 font-bold uppercase text-[10px]">
                          <Tag className="w-3 h-3" />
                          <span>Flash Deal Broadcast</span>
                        </span>
                      )}

                      <span className="text-stone-300">•</span>
                      <span className="font-bold text-[#C82A2A] uppercase">
                        {act.businessLocality}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 font-semibold">
                        {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-lg sm:text-xl font-black text-[#161412] leading-tight">
                        {act.title}
                      </h4>
                    </div>

                    <div className="text-xs font-mono font-bold text-stone-600">
                      Merchant:{' '}
                      <button
                        onClick={() => biz && onSelectBusiness(biz)}
                        className="text-[#161412] hover:text-[#C82A2A] underline transition"
                      >
                        {act.businessName}
                      </button>
                    </div>

                    <p className="text-xs text-stone-700 font-sans leading-relaxed">
                      {act.description}
                    </p>

                    {/* Hours Change Callout Box */}
                    {act.type === 'hours_change' && act.metadata?.newHours && (
                      <div className="p-3 bg-[#FAF7F2] border border-[#161412]/15 rounded-xs text-xs font-mono grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {act.metadata.oldHours && (
                          <div className="text-stone-500 line-through">
                            Previous Timings: {act.metadata.oldHours}
                          </div>
                        )}
                        <div className="font-bold text-emerald-800">
                          ✓ New Operational Hours: {act.metadata.newHours}
                        </div>
                      </div>
                    )}

                    {/* Product Price & Photo preview */}
                    {act.metadata?.price && (
                      <div className="inline-flex items-center space-x-2 font-mono text-xs mt-1">
                        <span className="text-stone-500">Retail / Counter Price:</span>
                        <span className="font-black text-sm text-[#161412]">
                          ₹{act.metadata.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Thumbnail & Actions */}
                  <div className="shrink-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                    {act.metadata?.imageUrl && (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-stone-100 border border-stone-300 overflow-hidden rounded-xs shrink-0 mb-1">
                        <img
                          src={act.metadata.imageUrl}
                          alt={act.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap sm:flex-col items-center gap-1.5 w-full font-mono text-xs">
                      {/* Follow/Unfollow Button */}
                      <button
                        onClick={() => handleToggleFollow(act.businessId)}
                        className={`w-full py-1 px-2 border rounded-xs transition flex items-center justify-center space-x-1 ${
                          isFollowed
                            ? 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-red-50 hover:text-red-700'
                            : 'bg-[#161412] text-white border-black font-semibold'
                        }`}
                      >
                        {isFollowed ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>+ Follow Shop</span>
                          </>
                        )}
                      </button>

                      {/* Quick Contact & View Storefront */}
                      {biz && (
                        <div className="flex gap-1 w-full">
                          <button
                            onClick={() => onOpenQuickConnect(biz, 'call')}
                            className="flex-1 py-1 px-2 bg-white border border-[#161412]/30 hover:border-black text-[11px] rounded-xs flex items-center justify-center space-x-1"
                            title="Call Storefront"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => onOpenQuickConnect(biz, 'message')}
                            className="flex-1 py-1 px-2 bg-white border border-[#161412]/30 hover:border-black text-[11px] rounded-xs flex items-center justify-center space-x-1"
                            title="Message Storefront"
                          >
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span>Chat</span>
                          </button>
                          <button
                            onClick={() => onSelectBusiness(biz)}
                            className="py-1 px-2 bg-[#161412] hover:bg-[#C82A2A] text-white text-[11px] rounded-xs flex items-center justify-center"
                            title="View Business Profile"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* MODAL: BROADCAST STORE UPDATE */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-lg w-full p-5 shadow-2xl relative text-[#161412]">
            <div className="border-b border-[#161412]/20 pb-2 mb-4">
              <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                MERCHANT DISPATCH NETWORK
              </div>
              <h3 className="font-serif text-xl font-black">
                Broadcast Live Update to Followers
              </h3>
              <p className="text-xs text-stone-600 font-mono mt-0.5">
                Posting as <strong>{currentBusiness?.name || businesses[0]?.name}</strong> ({currentBusiness?.locality || 'Bathinda'})
              </p>
            </div>

            <form onSubmit={handlePostBroadcast} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block uppercase font-bold text-stone-700 mb-1">
                  Update Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastType('product_arrival')}
                    className={`py-2 px-1 border text-center transition rounded-xs ${
                      broadcastType === 'product_arrival'
                        ? 'bg-[#161412] text-white border-black font-bold'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    📦 Product Arrival
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastType('hours_change')}
                    className={`py-2 px-1 border text-center transition rounded-xs ${
                      broadcastType === 'hours_change'
                        ? 'bg-[#161412] text-white border-black font-bold'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    ⏰ Hours Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastType('deal_published')}
                    className={`py-2 px-1 border text-center transition rounded-xs ${
                      broadcastType === 'deal_published'
                        ? 'bg-[#161412] text-white border-black font-bold'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    🏷️ Flash Offer
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-stone-700 mb-1">
                  Dispatch Headline *
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder={
                    broadcastType === 'hours_change'
                      ? 'e.g. Extended Festival Timings for Diwali Week'
                      : 'e.g. Fresh Pure Desi Ghee Dhodha 1Kg Gift Boxes Now in Stock'
                  }
                  className="w-full p-2 bg-white border border-[#161412]/30 rounded text-xs font-sans"
                  required
                />
              </div>

              {broadcastType === 'hours_change' && (
                <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-2.5 border border-[#161412]/15">
                  <div>
                    <label className="block text-[10px] text-stone-500 uppercase mb-0.5">
                      Previous Hours
                    </label>
                    <input
                      type="text"
                      value={broadcastOldHours}
                      onChange={(e) => setBroadcastOldHours(e.target.value)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-emerald-800 font-bold uppercase mb-0.5">
                      New Operational Hours
                    </label>
                    <input
                      type="text"
                      value={broadcastNewHours}
                      onChange={(e) => setBroadcastNewHours(e.target.value)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              {broadcastType === 'product_arrival' && (
                <div>
                  <label className="block uppercase font-bold text-stone-700 mb-1">
                    Price in INR (Optional)
                  </label>
                  <input
                    type="number"
                    value={broadcastPrice}
                    onChange={(e) => setBroadcastPrice(e.target.value)}
                    placeholder="e.g. 580"
                    className="w-full p-2 bg-white border border-[#161412]/30 rounded text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block uppercase font-bold text-stone-700 mb-1">
                  Full Dispatch Details *
                </label>
                <textarea
                  rows={3}
                  value={broadcastDescription}
                  onChange={(e) => setBroadcastDescription(e.target.value)}
                  placeholder="Provide details about availability, delivery options, or holiday schedule..."
                  className="w-full p-2 bg-white border border-[#161412]/30 rounded text-xs font-sans"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[#161412]/15">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-1.5 border border-stone-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white uppercase font-bold rounded shadow-xs"
                >
                  Publish to Live Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
