import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Phone,
  MessageSquare,
  Navigation,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Business, ALL_CATEGORIES, BATHINDA_LOCALITIES, BusinessCategory } from '../../types';
import { GoogleMapComponent } from '../common/GoogleMapComponent';
import { isBusinessOpenNow } from '../../services/businessService';

interface DiscoveryMapProps {
  businesses: Business[];
  onSelectBusiness: (b: Business) => void;
  onOpenQuickConnect: (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => void;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  businesses,
  onSelectBusiness,
  onOpenQuickConnect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLocality, setSelectedLocality] = useState<string>('All Localities');
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(businesses[0] || null);

  const filteredBusinesses = businesses.filter((b) => {
    const matchCat =
      selectedCategory === 'All Categories' ||
      b.categories.includes(selectedCategory as BusinessCategory);
    const matchLoc =
      selectedLocality === 'All Localities' || b.locality === selectedLocality;
    return matchCat && matchLoc;
  });

  const isOpen = activeBusiness ? isBusinessOpenNow(activeBusiness) : false;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 text-[#161412]">
      {/* Newspaper Section Title */}
      <div className="border-b-2 border-[#161412] pb-3 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            GEOGRAPHIC INTELLIGENCE DIVISION
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#161412] tracking-tight">
            AOCSF Bathinda Commerce Map
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            Real-time geospatial discovery of verified storefronts, gyms, academies & salons across Punjab.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="p-2 bg-white border border-[#161412]/30 rounded text-xs"
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
            className="p-2 bg-white border border-[#161412]/30 rounded text-xs"
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

      {/* Map + Compact Business Card Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#FFFDF9] border border-[#161412]/20 p-2 sm:p-3 shadow-xs">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <GoogleMapComponent
            businesses={filteredBusinesses}
            selectedBusiness={activeBusiness}
            onSelectBusiness={(b) => setActiveBusiness(b)}
            height="520px"
          />
        </div>

        {/* Selected Marker Detail Card */}
        <div className="flex flex-col justify-between bg-[#FAF8F5] border border-[#161412]/20 p-4">
          {activeBusiness ? (
            <div className="space-y-4">
              <div className="border-b border-[#161412]/15 pb-3">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold text-[#C82A2A] uppercase">
                    {activeBusiness.locality}
                  </span>
                  <span
                    className={`font-semibold px-1.5 py-0.2 rounded-xs ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    ● {isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-black text-[#161412]">
                  {activeBusiness.name}
                </h3>
                {activeBusiness.tagline && (
                  <p className="font-serif italic text-xs text-stone-600 mt-0.5">
                    “{activeBusiness.tagline}”
                  </p>
                )}
              </div>

              <div className="text-xs text-stone-700 font-sans leading-relaxed line-clamp-3">
                {activeBusiness.description}
              </div>

              <div className="bg-white border border-[#161412]/15 p-3 space-y-1.5 text-xs font-mono">
                <div>📍 <strong>Address:</strong> {activeBusiness.address}</div>
                <div>🏷️ <strong>Category:</strong> {activeBusiness.categories.join(', ')}</div>
                <div>📞 <strong>Phone:</strong> {activeBusiness.phone}</div>
                <div>⭐ <strong>Health:</strong> {activeBusiness.completenessScore}% profile</div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                <button
                  onClick={() => onOpenQuickConnect(activeBusiness, 'call')}
                  className="py-2 bg-[#161412] hover:bg-[#C82A2A] text-white rounded-xs transition flex items-center justify-center space-x-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => onOpenQuickConnect(activeBusiness, 'message')}
                  className="py-2 bg-white border border-[#161412]/30 hover:border-black rounded-xs transition flex items-center justify-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => onOpenQuickConnect(activeBusiness, 'directions')}
                  className="py-2 bg-white border border-[#161412]/30 hover:border-black rounded-xs transition flex items-center justify-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C82A2A]" />
                  <span>Maps</span>
                </button>
              </div>

              <button
                onClick={() => onSelectBusiness(activeBusiness)}
                className="w-full py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase tracking-wider font-bold rounded shadow-xs transition flex items-center justify-center space-x-1"
              >
                <span>View Full Catalog & Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 font-mono text-xs">
              Select any marker on the map to inspect storefront details.
            </div>
          )}

          <div className="pt-3 border-t border-[#161412]/15 text-[10px] font-mono text-stone-500 flex justify-between items-center">
            <span>Showing {filteredBusinesses.length} storefronts</span>
            <span>Bathinda, PB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
