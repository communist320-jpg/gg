import React, { useState } from 'react';
import {
  Users2,
  Handshake,
  MessageSquare,
  PlusCircle,
  Share2,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Send,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Business, BusinessRequest, BusinessOffer, BusinessConnection } from '../../types';
import { createConnection, createBusinessRequest } from '../../services/businessService';
import { useAuth } from '../../services/authContext';

interface BusinessNetworkViewProps {
  businesses: Business[];
  requests: BusinessRequest[];
  offers: BusinessOffer[];
  onSelectBusiness: (b: Business) => void;
  onOpenQuickConnect: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
}

export const BusinessNetworkView: React.FC<BusinessNetworkViewProps> = ({
  businesses,
  requests,
  offers,
  onSelectBusiness,
  onOpenQuickConnect,
}) => {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'deals' | 'synergies'>('discover');

  // Request proposal modal
  const [selectedPartner, setSelectedPartner] = useState<Business | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [proposalSent, setProposalSent] = useState(false);

  // Post B2B Request form modal
  const [showPostRequest, setShowPostRequest] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqCategory, setNewReqCategory] = useState('Packaging / Supply');
  const [newReqDetails, setNewReqDetails] = useState('');
  const [newReqUrgency, setNewReqUrgency] = useState<'normal' | 'urgent'>('normal');
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !proposalText.trim()) return;

    const myBusiness = businesses[0]; // Active or first business
    const newConn: BusinessConnection = {
      id: `conn-${Date.now()}`,
      fromBusinessId: myBusiness?.id || 'my-shop',
      fromBusinessName: myBusiness?.name || 'My Bathinda Enterprise',
      toBusinessId: selectedPartner.id,
      toBusinessName: selectedPartner.name,
      status: 'pending',
      proposalText: proposalText.trim(),
      createdAt: new Date().toISOString(),
    };

    await createConnection(newConn);
    setProposalSent(true);
    setTimeout(() => {
      setProposalSent(false);
      setSelectedPartner(null);
      setProposalText('');
    }, 2000);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !newReqDetails.trim()) return;

    const myBusiness = businesses[0];
    const newReq: BusinessRequest = {
      id: `req-${Date.now()}`,
      businessId: myBusiness?.id || 'biz-user',
      businessName: myBusiness?.name || 'Bathinda Enterprise',
      locality: myBusiness?.locality || 'Model Town',
      title: newReqTitle.trim(),
      details: newReqDetails.trim(),
      category: newReqCategory,
      urgency: newReqUrgency,
      contactEmail: myBusiness?.email || currentUser?.email || 'contact@aocsf.demo',
      createdAt: new Date().toISOString(),
    };

    await createBusinessRequest(newReq);
    setShowPostRequest(false);
    setNewReqTitle('');
    setNewReqDetails('');
    setRequestNotice('B2B Request posted successfully to the Bathinda Network!');
    setTimeout(() => setRequestNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      {/* Newspaper Section Title */}
      <div className="border-b-2 border-[#161412] pb-3 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            B2B SYNDICATE & COMMERCE ALLIANCES
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#161412] tracking-tight">
            AOCSF Business Network
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            Interconnected trade ecosystem for local shop owners, salons, suppliers & academies in Bathinda.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPostRequest(true)}
            className="px-3.5 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-semibold rounded shadow-xs transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post B2B Request</span>
          </button>
        </div>
      </div>

      {requestNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{requestNotice}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#161412]/20 mb-6 text-xs font-serif font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('discover')}
          className={`py-2 px-4 transition ${
            activeTab === 'discover'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Partner Discovery ({businesses.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 transition ${
            activeTab === 'requests'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Business Request Board ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`py-2 px-4 transition ${
            activeTab === 'deals'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          AOCSF Deal Board ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('synergies')}
          className={`py-2 px-4 transition ${
            activeTab === 'synergies'
              ? 'bg-[#161412] text-white'
              : 'text-stone-700 hover:bg-stone-200'
          }`}
        >
          Synergy Graph & Matrix
        </button>
      </div>

      {/* TAB 1: PARTNER DISCOVERY */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-[#FFFDF9] border border-[#161412]/20 p-5 flex flex-col justify-between hover:border-black transition shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-500 mb-1.5">
                  <span className="font-bold text-[#C82A2A]">{biz.locality}</span>
                  <span>{biz.categories[0]}</span>
                </div>
                <h3 className="font-serif text-lg font-black text-[#161412]">
                  {biz.name}
                </h3>
                <p className="text-xs text-stone-600 font-sans mt-1 line-clamp-2">
                  {biz.description}
                </p>
                <div className="mt-3 text-[11px] font-mono text-stone-500">
                  📍 {biz.address}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPartner(biz)}
                  className="flex-1 py-1.5 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase font-semibold rounded-xs transition flex items-center justify-center space-x-1"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Propose Synergy</span>
                </button>
                <button
                  onClick={() => onSelectBusiness(biz)}
                  className="px-3 py-1.5 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono rounded-xs transition"
                >
                  Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BUSINESS REQUEST BOARD */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#FAF3E0] border border-[#E0D5B8] flex items-center justify-between text-xs font-mono text-stone-800">
            <span>
              📢 Have a business procurement, printing, packaging, or marketing requirement in Bathinda? Post it to local peers!
            </span>
            <button
              onClick={() => setShowPostRequest(true)}
              className="px-3 py-1 bg-[#161412] text-white rounded text-[11px] font-mono shrink-0 ml-2"
            >
              + Post Request
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border-2 border-[#161412]/20 p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-2">
                    <span className="bg-stone-100 text-stone-800 px-1.5 py-0.5 font-bold">
                      {req.category}
                    </span>
                    {req.urgency === 'urgent' && (
                      <span className="bg-red-100 text-red-800 px-1.5 py-0.5 font-bold">
                        ⚠️ High Urgency
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-black text-[#161412]">
                    {req.title}
                  </h3>
                  <p className="text-xs text-stone-700 font-sans mt-2 leading-relaxed">
                    {req.details}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                  <div className="text-stone-500">
                    Posted by <strong>{req.businessName}</strong> ({req.locality})
                  </div>
                  <a
                    href={`mailto:${req.contactEmail}?subject=${encodeURIComponent(
                      `Response to AOCSF Request: ${req.title}`
                    )}`}
                    className="px-3 py-1.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white rounded font-bold text-[11px] transition"
                  >
                    Respond
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AOCSF DEAL BOARD */}
      {activeTab === 'deals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((off) => (
            <div
              key={off.id}
              className="bg-[#FFFDF9] border-2 border-dashed border-[#C82A2A] p-5 flex flex-col justify-between relative"
            >
              <div className="absolute top-2 right-2 bg-[#C82A2A] text-white text-[10px] font-mono px-2 py-0.5 uppercase font-bold">
                LIMITED OFFER
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500 mb-1">
                  {off.businessName} • {off.locality}
                </div>
                <h3 className="font-serif text-xl font-black text-[#161412]">
                  {off.discount}
                </h3>
                <h4 className="font-mono text-sm font-bold text-stone-800 mt-1">
                  {off.title}
                </h4>
                {off.terms && (
                  <p className="text-xs text-stone-600 font-sans mt-2">
                    {off.terms}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono">
                {off.code && (
                  <div className="px-2 py-1 bg-stone-100 border border-stone-300 font-bold tracking-wider">
                    CODE: {off.code}
                  </div>
                )}
                <div className="text-stone-500 text-[11px]">
                  Valid until {off.validUntil}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SYNERGY GRAPH & MATRIX */}
      {activeTab === 'synergies' && (
        <div className="bg-white border border-[#161412]/20 p-6 space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-serif text-lg font-black text-[#161412]">
              Bathinda Cross-Industry Referral Matrices
            </h3>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              How businesses in Bathinda can form high-yield referral loops through AOCSF:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#FAF7F2] p-4 border border-[#161412]/15 rounded">
              <div className="font-bold text-[#C82A2A] uppercase mb-1">
                💍 Wedding & Lifestyle Synergy Loop
              </div>
              <p className="text-stone-700 font-sans leading-relaxed">
                Bridal Boutiques in Civil Lines ➔ Salons on Mall Road ➔ Photographers ➔ Desi Ghee Sweet makers. Each client booking one service receives an AOCSF Partner voucher for the others!
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 border border-[#161412]/15 rounded">
              <div className="font-bold text-[#C82A2A] uppercase mb-1">
                📚 Education & Tech Hub Loop
              </div>
              <p className="text-stone-700 font-sans leading-relaxed">
                IELTS & Coaching Centres on Ajit Road ➔ Stationery & Printing shops on GT Road ➔ Cafés & Laptop repair centres. Shared student perks and printed study material deals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROPOSE SYNERGY */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-5 shadow-2xl relative">
            <div className="border-b border-[#161412]/20 pb-2 mb-3">
              <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                B2B COLLABORATION INITIATIVE
              </div>
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Propose Partnership with {selectedPartner.name}
              </h3>
            </div>

            {proposalSent ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-base">Synergy Proposal Dispatched!</h4>
                <p className="text-xs text-stone-600 font-mono">
                  The owner will receive your proposal in their AOCSF dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                    Collaboration Proposal
                  </label>
                  <textarea
                    rows={4}
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    placeholder="e.g. We would like to display your salon brochures at our boutique counter on Mall Road in exchange for a 10% cross-referral discount..."
                    className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans focus:outline-none focus:border-[#C82A2A]"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPartner(null)}
                    className="px-3 py-1.5 border border-stone-300 text-xs font-mono rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
                  >
                    Dispatch Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST B2B REQUEST */}
      {showPostRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-5 shadow-2xl relative">
            <div className="border-b border-[#161412]/20 pb-2 mb-3">
              <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
                B2B PROCUREMENT & SERVICES
              </div>
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Post a Business Request
              </h3>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Request Headline
                </label>
                <input
                  type="text"
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  placeholder="e.g. Looking for Bulk Offset Printer in Bathinda"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newReqCategory}
                    onChange={(e) => setNewReqCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  >
                    <option value="Packaging / Supply">Packaging / Supply</option>
                    <option value="Printing / Stationery">Printing / Stationery</option>
                    <option value="Creative / Media">Creative / Media</option>
                    <option value="IT / Hardware Care">IT / Hardware Care</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Logistics / Courier">Logistics / Courier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={newReqUrgency}
                    onChange={(e) => setNewReqUrgency(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  >
                    <option value="normal">Normal (Within 2 weeks)</option>
                    <option value="urgent">Urgent (Immediate 48 hrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Specific Requirements & Volume
                </label>
                <textarea
                  rows={3}
                  value={newReqDetails}
                  onChange={(e) => setNewReqDetails(e.target.value)}
                  placeholder="Describe your requirement, quantity, budget, or timeline..."
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostRequest(false)}
                  className="px-3 py-1.5 border border-stone-300 text-xs font-mono rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
                >
                  Publish Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
