import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Eye,
  Trash2,
  Lock,
  Layers
} from 'lucide-react';
import { Business, VerificationLevel } from '../../types';
import { saveBusiness } from '../../services/businessService';

interface AdminDashboardProps {
  businesses: Business[];
  onSelectBusiness: (b: Business) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  businesses,
  onSelectBusiness,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.locality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateVerification = async (biz: Business, level: VerificationLevel) => {
    biz.verifiedLevel = level;
    await saveBusiness(biz);
    setActionNotice(`Updated ${biz.name} to ${level.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => setActionNotice(null), 3000);
    onRefresh();
  };

  const handleToggleFeatured = async (biz: Business) => {
    biz.isFeatured = !biz.isFeatured;
    await saveBusiness(biz);
    setActionNotice(`${biz.name} featured state toggled`);
    setTimeout(() => setActionNotice(null), 3000);
    onRefresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      <div className="border-b-2 border-[#161412] pb-3 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            SUPREME MODERATION & GOVERNANCE
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#161412] tracking-tight">
            AOCSF Admin Console
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            Audit Bathinda business verifications, moderate reports, and maintain directory integrity.
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter listings by name or locality..."
          className="text-xs p-2 bg-white border border-[#161412]/30 rounded w-full md:w-64 font-sans"
        />
      </div>

      {actionNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Directory Management Table */}
      <div className="bg-white border-2 border-[#161412] overflow-hidden shadow-xs">
        <div className="bg-[#FAF7F2] border-b border-[#161412]/20 px-4 py-2 flex items-center justify-between text-xs font-mono font-bold uppercase">
          <span>Registered Bathinda Listings ({filtered.length})</span>
          <span>Role: AOCSF Administrator</span>
        </div>

        <div className="divide-y divide-stone-200">
          {filtered.map((biz) => (
            <div key={biz.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-serif font-bold text-base text-[#161412]">{biz.name}</h4>
                  {biz.isDemo && (
                    <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-900 border border-amber-300 px-1">
                      Sample Data
                    </span>
                  )}
                  {biz.isFeatured && (
                    <span className="text-[9px] font-mono uppercase bg-purple-100 text-purple-900 border border-purple-300 px-1">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-stone-600 mt-1">
                  📍 {biz.locality}, Bathinda • 📞 {biz.phone} • {biz.categories[0]}
                </div>
                <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                  Completeness: {biz.completenessScore}% • Current Status: {biz.verifiedLevel}
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => handleUpdateVerification(biz, 'aocsf_verified')}
                  className={`px-2 py-1 rounded transition ${
                    biz.verifiedLevel === 'aocsf_verified'
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-stone-100 hover:bg-emerald-100 text-stone-800'
                  }`}
                  title="Approve AOCSF Verified status"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleToggleFeatured(biz)}
                  className={`px-2 py-1 rounded transition ${
                    biz.isFeatured
                      ? 'bg-purple-700 text-white font-bold'
                      : 'bg-stone-100 hover:bg-purple-100 text-stone-800'
                  }`}
                >
                  {biz.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => onSelectBusiness(biz)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
