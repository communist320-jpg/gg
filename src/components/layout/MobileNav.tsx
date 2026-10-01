import React from 'react';
import {
  Compass,
  MapPin,
  MessageSquare,
  User,
  Store,
  BookOpen,
  TrendingUp,
  Newspaper
} from 'lucide-react';
import { useAuth } from '../../services/authContext';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenClaimModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
  onOpenClaimModal,
}) => {
  const { currentUser, role } = useAuth();

  const isOwner = role === 'business_owner';

  const customerTabs = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'stories', label: 'Deals', icon: Newspaper },
    { id: 'network', label: 'B2B', icon: Store },
    { id: 'dashboard', label: isOwner ? 'Owner' : 'Account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/98 backdrop-blur border-t-2 border-[#161412] px-2 py-1.5 flex items-center justify-around text-[#161412]">
      {customerTabs.map((t) => {
        const Icon = t.icon;
        const isActive = currentTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'dashboard' && !currentUser && !isOwner) {
                onOpenAuthModal();
              } else {
                setCurrentTab(t.id);
              }
            }}
            className={`flex flex-col items-center justify-center p-1 font-mono transition ${
              isActive ? 'text-[#C82A2A] font-bold' : 'text-stone-600 hover:text-black'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
