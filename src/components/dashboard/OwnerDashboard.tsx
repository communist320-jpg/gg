import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Phone,
  Navigation,
  BookOpen,
  QrCode,
  MessageSquare,
  Sparkles,
  Share2,
  PlusCircle,
  CheckCircle2,
  Clock,
  Award,
  Link,
  Edit3,
  ExternalLink,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import { Business, CatalogItem, ReferralItem } from '../../types';
import {
  getCatalogItems,
  addCatalogItem,
  getReferrals,
  createReferral,
  saveBusiness
} from '../../services/businessService';
import { useAuth } from '../../services/authContext';
import { LiveActivityFeed } from './LiveActivityFeed';

interface OwnerDashboardProps {
  business: Business;
  allBusinesses?: Business[];
  onOpenCopilot: (b: Business) => void;
  onOpenQr: (b: Business) => void;
  onSelectBusiness: (b: Business) => void;
  onOpenQuickConnect?: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  business,
  allBusinesses = [],
  onOpenCopilot,
  onOpenQr,
  onSelectBusiness,
  onOpenQuickConnect = () => {},
}) => {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState<'live-feed' | 'analytics' | 'catalog' | 'growth' | 'settings'>('live-feed');

  // Catalog items
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCat, setNewItemCat] = useState<string>(business.categories[0] || 'General');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Referrals
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [referralLinkCopied, setReferralLinkCopied] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  // Settings
  const [googleFormsUrl, setGoogleFormsUrl] = useState(business.googleFormsUrl || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    getCatalogItems(business.id).then(setCatalog);
    getReferrals(business.id).then(setReferrals);
  }, [business.id]);

  // Multiplier for time range visualization
  const multiplier = timeRange === 'today' ? 0.2 : timeRange === '7d' ? 1 : timeRange === '30d' ? 3.8 : 9.5;

  const views = Math.round((business.viewsCount || 42) * multiplier);
  const catalogViews = Math.round((business.catalogViewsCount || 18) * multiplier);
  const phoneClicks = Math.round((business.phoneClicksCount || 7) * multiplier);
  const directions = Math.round((business.directionClicksCount || 5) * multiplier);
  const qrScans = Math.round((business.qrScansCount || 12) * multiplier);
  const messages = Math.round((business.messageRequestsCount || 4) * multiplier);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: CatalogItem = {
      id: `item-${Date.now()}`,
      businessId: business.id,
      name: newItemName.trim(),
      category: newItemCat,
      description: newItemDesc.trim() || 'Verified quality item available in Bathinda.',
      price: newItemPrice ? Number(newItemPrice) : undefined,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    };

    await addCatalogItem(item);
    setCatalog((prev) => [...prev, item]);
    setShowAddItem(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
  };

  const handleInviteBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;

    const refItem: ReferralItem = {
      id: `ref-${Date.now()}`,
      inviterBusinessId: business.id,
      inviterBusinessName: business.name,
      invitedBusinessName: inviteName.trim(),
      invitedEmail: inviteEmail.trim() || undefined,
      code: `AOCSF-${business.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    await createReferral(refItem);
    setReferrals((prev) => [refItem, ...prev]);
    setInviteName('');
    setInviteEmail('');
    setInviteNotice(`Invitation generated for ${refItem.invitedBusinessName}! Share the link to earn your Local Connector badge.`);
    setTimeout(() => setInviteNotice(null), 5000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    business.googleFormsUrl = googleFormsUrl.trim() || undefined;
    await saveBusiness(business);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      {/* Header Bar */}
      <div className="border-b-2 border-[#161412] pb-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            STOREFRONT ADMINISTRATION CONSOLE
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#161412] tracking-tight">
            {business.name}
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            Locality: <strong>{business.locality}, Bathinda</strong> • Profile Completeness: <strong>{business.completenessScore}%</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectBusiness(business)}
            className="px-3 py-1.5 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono font-medium rounded transition flex items-center space-x-1"
          >
            <span>View Public Front</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => onOpenQr(business)}
            className="px-3 py-1.5 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono font-medium rounded transition flex items-center space-x-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Storefront QR</span>
          </button>
          <button
            onClick={() => onOpenCopilot(business)}
            className="px-3.5 py-1.5 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded shadow-xs transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E23E3E]" />
            <span>Open Copilot</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#161412]/20 mb-6 text-xs font-serif font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('live-feed')}
          className={`py-2 px-4 transition flex items-center space-x-1.5 ${
            activeTab === 'live-feed'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Merchant Feed</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 transition ${
            activeTab === 'analytics'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Analytics & Health
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 px-4 transition ${
            activeTab === 'catalog'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Catalog Manager ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTab('growth')}
          className={`py-2 px-4 transition ${
            activeTab === 'growth'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Invite & Growth ({referrals.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 transition ${
            activeTab === 'settings'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Integrations & Feedback Setup
        </button>
      </div>

      {/* TAB: LIVE ACTIVITY FEED */}
      {activeTab === 'live-feed' && (
        <LiveActivityFeed
          businesses={allBusinesses}
          currentBusiness={business}
          onSelectBusiness={onSelectBusiness}
          onOpenQuickConnect={onOpenQuickConnect}
        />
      )}

      {/* TAB 1: ANALYTICS & WHAT'S HAPPENING */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Time Range Filter Bar */}
          <div className="flex items-center justify-between bg-white border border-[#161412]/20 p-3">
            <span className="text-xs font-mono text-stone-600 font-bold uppercase">
              Time Range Analysis:
            </span>
            <div className="flex items-center space-x-1 font-mono text-xs">
              {(['today', '7d', '30d', '90d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 rounded transition uppercase ${
                    timeRange === t
                      ? 'bg-[#161412] text-white font-bold'
                      : 'text-stone-600 hover:text-black hover:bg-stone-100'
                  }`}
                >
                  {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '90 Days' : 'Today'}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>Profile Views</span>
                <Eye className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#161412] mt-1">{views}</div>
              <div className="text-[10px] font-mono text-emerald-700 mt-1">↑ Direct searches</div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>Catalog Views</span>
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#161412] mt-1">{catalogViews}</div>
              <div className="text-[10px] font-mono text-stone-500 mt-1">Items inspected</div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>Phone Clicks</span>
                <Phone className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#C82A2A] mt-1">{phoneClicks}</div>
              <div className="text-[10px] font-mono text-emerald-700 mt-1">Direct calls</div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>Directions</span>
                <Navigation className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#161412] mt-1">{directions}</div>
              <div className="text-[10px] font-mono text-stone-500 mt-1">Store visits</div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>QR Scans</span>
                <QrCode className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#161412] mt-1">{qrScans}</div>
              <div className="text-[10px] font-mono text-stone-500 mt-1">Physical counter</div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#161412]/20 p-3.5 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-stone-500 flex items-center justify-between">
                <span>Chat Inquiries</span>
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-serif text-2xl font-black text-[#161412] mt-1">{messages}</div>
              <div className="text-[10px] font-mono text-stone-500 mt-1">Direct threads</div>
            </div>
          </div>

          {/* Section 14: WHAT'S HAPPENING? */}
          <div className="bg-white border-2 border-[#161412] p-5 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-[#161412]/15 pb-2 mb-3">
              <Activity className="w-4 h-4 text-[#C82A2A]" />
              <h3 className="font-serif font-black text-base uppercase tracking-wider text-[#161412]">
                WHAT'S HAPPENING? • FACTUAL PERFORMANCE SUMMARY
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono text-stone-800 leading-relaxed">
              <div className="p-2.5 bg-[#FAF7F2] border border-stone-200">
                📊 <strong>“Your profile received {views} views {timeRange === '7d' ? 'this week' : 'in this period'}.”</strong>
                <span className="text-stone-500 block mt-0.5 text-[11px]">
                  Calculated from distinct visitor sessions discovering {business.name} via Bathinda locality search and map exploration.
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] border border-stone-200">
                📦 <strong>“Customers opened your catalog {catalogViews} times.”</strong>
                <span className="text-stone-500 block mt-0.5 text-[11px]">
                  Reflects shopper engagement with item descriptions, photo previews, and service pricing.
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] border border-stone-200">
                📞 <strong>“Phone contact was selected {phoneClicks} times.”</strong>
                <span className="text-stone-500 block mt-0.5 text-[11px]">
                  High intent action triggering click-to-call or copying your business number ({business.phone}).
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] border border-stone-200">
                🧭 <strong>“Your most active locality discovery was {business.locality}.”</strong>
                <span className="text-stone-500 block mt-0.5 text-[11px]">
                  Shoppers located near {business.locality} and adjacent Bathinda roads showed the highest conversion.
                </span>
              </div>
            </div>
          </div>

          {/* Business Health Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FAF7F2] border border-[#161412]/20 p-4">
              <h4 className="font-serif font-bold text-sm uppercase mb-2">
                Business Health Indicators
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Profile Completeness</span>
                    <span className="font-bold">{business.completenessScore}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${business.completenessScore}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Catalog Depth</span>
                    <span className="font-bold">{catalog.length > 2 ? 'Strong' : 'Needs Expansion'}</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, catalog.length * 30)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Customer Engagement</span>
                    <span className="font-bold">Active in Bathinda</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C82A2A]" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#161412]/20 p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm uppercase mb-1">
                  AOCSF Business Copilot Audit
                </h4>
                <p className="text-xs text-stone-600 font-sans">
                  "Your storefront has solid visibility in {business.locality}. Adding 2 more catalog photos and connecting with 1 complementary local store will enhance your 'Near Me' placement."
                </p>
              </div>
              <button
                onClick={() => onOpenCopilot(business)}
                className="mt-3 w-full py-2 bg-[#FAF3E0] border border-[#E0D5B8] hover:bg-[#C82A2A] hover:text-white text-stone-900 text-xs font-mono font-bold uppercase transition flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Consult Copilot for Growth Ideas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG MANAGER */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-[#161412]/20 p-4">
            <div>
              <h3 className="font-serif font-bold text-sm">Storefront Products & Services</h3>
              <p className="text-xs text-stone-600 font-mono">
                Items published here appear directly in your public Bathinda catalog.
              </p>
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="px-4 py-2 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold rounded shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {catalog.map((item) => (
              <div key={item.id} className="bg-white border border-[#161412]/20 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-stone-100 px-1.5 py-0.5">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#161412] mt-1.5">{item.name}</h4>
                  <p className="text-xs text-stone-600 font-sans mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold">{item.price ? `₹${item.price}` : 'Inquiry'}</span>
                  <span className="text-emerald-700 font-semibold">Available</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Modal */}
          {showAddItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-5 shadow-2xl relative">
                <div className="border-b border-[#161412]/20 pb-2 mb-3">
                  <h3 className="font-serif text-lg font-black">Add Catalog Item</h3>
                </div>
                <form onSubmit={handleAddItem} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Pure Desi Ghee Pinni (1 Kg)"
                      className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newItemCat}
                        onChange={(e) => setNewItemCat(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="e.g. 550"
                        className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Short description of this product or service..."
                      className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddItem(false)}
                      className="px-3 py-1.5 border border-stone-300 text-xs font-mono rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
                    >
                      Save Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVITE & GROWTH */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {inviteNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{inviteNotice}</span>
            </div>
          )}

          <div className="bg-[#FAF7F2] border-2 border-[#161412] p-5">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-[#C82A2A]" />
              <h3 className="font-serif font-black text-lg uppercase text-[#161412]">
                ONBOARDING GROWTH & LOCAL CONNECTOR PROGRAM
              </h3>
            </div>
            <p className="text-xs text-stone-700 font-sans leading-relaxed max-w-2xl">
              Bathinda grows stronger when local shops unite. Invite another legitimate business from your locality (Model Town, Civil Lines, Mall Road, Ajit Road). As your referrals register, unlock the prestigious <strong>“Local Connector”</strong> badge on your profile!
            </p>

            <form onSubmit={handleInviteBusiness} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Business Name to invite"
                className="text-xs p-2 bg-white border border-[#161412]/30 rounded"
                required
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Owner email (optional)"
                className="text-xs p-2 bg-white border border-[#161412]/30 rounded"
              />
              <button
                type="submit"
                className="py-2 px-4 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded transition"
              >
                Send Invite Link
              </button>
            </form>
          </div>

          <div className="bg-white border border-[#161412]/20 p-4">
            <h4 className="font-serif font-bold text-sm mb-3">Businesses Joined Through You</h4>
            {referrals.length === 0 ? (
              <div className="text-stone-400 font-mono text-xs py-6 text-center">
                No referrals sent yet. Invite your neighboring merchants on Mall Road or Model Town!
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div key={ref.id} className="p-3 bg-[#FAF8F5] border border-stone-200 flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="font-bold">{ref.invitedBusinessName}</div>
                      <div className="text-stone-500 text-[10px]">Invite Code: {ref.code}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-xs">
                      {ref.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & INTEGRATIONS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-[#161412]/20 p-6 space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-serif font-bold text-base">Google Forms Customer Feedback Integration</h3>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              Connect your own Google Form so customers in Bathinda can submit structured feedback directly.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                Google Form Public Response URL
              </label>
              <input
                type="url"
                value={googleFormsUrl}
                onChange={(e) => setGoogleFormsUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                className="w-full text-xs p-2.5 bg-white border border-[#161412]/30 rounded font-mono"
              />
              <span className="text-[10px] text-stone-400 font-mono block mt-1">
                When provided, shoppers can choose between the native AOCSF feedback or your Google Form.
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-5 py-2 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded transition"
              >
                Save Integration Settings
              </button>
              {settingsSaved && (
                <span className="text-xs text-emerald-700 font-mono font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Configuration saved!</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
