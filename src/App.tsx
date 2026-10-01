/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { HomeExploreView } from './components/home/HomeExploreView';
import { BusinessProfileView } from './components/business/BusinessProfileView';
import { DiscoveryMap } from './components/map/DiscoveryMap';
import { BusinessNetworkView } from './components/network/BusinessNetworkView';
import { StoriesAndDealsView } from './components/stories/StoriesAndDealsView';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClaimBusinessWizard } from './components/onboarding/ClaimBusinessWizard';
import { AuthModal } from './components/auth/AuthModal';
import { QuickConnectModal } from './components/business/QuickConnectModal';
import { BusinessCopilotModal } from './components/business/BusinessCopilotModal';
import { QrModal } from './components/common/QrModal';
import { FeedbackModal } from './components/business/FeedbackModal';
import { Business, BusinessStory, BusinessOffer, BusinessRequest } from './types';
import {
  getBusinesses,
  getBusinessById,
  getStories,
  getOffers,
  getBusinessRequests
} from './services/businessService';

function MainApp() {
  const { currentUser, role } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Directory Data
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stories, setStories] = useState<BusinessStory[]>([]);
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<string>('All Localities');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Modals
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [quickConnectBiz, setQuickConnectBiz] = useState<Business | null>(null);
  const [quickConnectMode, setQuickConnectMode] = useState<'call' | 'email' | 'message' | 'directions'>('message');
  const [copilotBiz, setCopilotBiz] = useState<Business | null>(null);
  const [qrBiz, setQrBiz] = useState<Business | null>(null);
  const [feedbackBiz, setFeedbackBiz] = useState<Business | null>(null);

  const refreshData = async () => {
    try {
      const bizList = await getBusinesses({
        locality: selectedLocality,
        category: selectedCategory,
        search: searchQuery,
        openNow: onlyOpenNow,
        verifiedOnly: onlyVerified,
      });
      setBusinesses(bizList);

      const stList = await getStories();
      setStories(stList);

      const offList = await getOffers();
      setOffers(offList);

      const reqList = await getBusinessRequests();
      setRequests(reqList);
    } catch (err) {
      console.warn('Data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedLocality, selectedCategory, searchQuery, onlyOpenNow, onlyVerified]);

  // Handle URL deep linking (e.g. ?business=slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bizSlug = params.get('business');
    if (bizSlug) {
      getBusinessById(bizSlug).then((b) => {
        if (b) {
          setSelectedBusiness(b);
          setCurrentTab('business-view');
        }
      });
    }
  }, []);

  const handleSelectBusiness = (b: Business) => {
    setSelectedBusiness(b);
    setCurrentTab('business-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickConnect = (b: Business, mode: 'call' | 'email' | 'message' | 'directions') => {
    setQuickConnectBiz(b);
    setQuickConnectMode(mode);
  };

  const handleOnboardingSuccess = (newBiz: Business) => {
    setShowClaimModal(false);
    refreshData();
    setSelectedBusiness(newBiz);
    setCurrentTab('dashboard');
  };

  // Active business for owner dashboard (either user's or first available)
  const activeOwnerBusiness = businesses.find(b => b.ownerId === currentUser?.uid) || businesses[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1B18] font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedBusiness(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenClaimModal={() => setShowClaimModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'explore' && (
          <HomeExploreView
            businesses={businesses}
            onSelectBusiness={handleSelectBusiness}
            onOpenQuickConnect={handleOpenQuickConnect}
            onOpenQr={(b) => setQrBiz(b)}
            onOpenAi={(b) => setCopilotBiz(b)}
            onOpenClaim={() => setShowClaimModal(true)}
            onGoToMap={() => setCurrentTab('map')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLocality={selectedLocality}
            setSelectedLocality={setSelectedLocality}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onlyOpenNow={onlyOpenNow}
            setOnlyOpenNow={setOnlyOpenNow}
            onlyVerified={onlyVerified}
            setOnlyVerified={setOnlyVerified}
          />
        )}

        {currentTab === 'business-view' && selectedBusiness && (
          <BusinessProfileView
            business={selectedBusiness}
            onBack={() => {
              setSelectedBusiness(null);
              setCurrentTab('explore');
            }}
            onSelectConnectedBusiness={(bizId) => {
              const b = businesses.find(item => item.id === bizId);
              if (b) setSelectedBusiness(b);
            }}
          />
        )}

        {currentTab === 'map' && (
          <DiscoveryMap
            businesses={businesses}
            onSelectBusiness={handleSelectBusiness}
            onOpenQuickConnect={handleOpenQuickConnect}
          />
        )}

        {currentTab === 'network' && (
          <BusinessNetworkView
            businesses={businesses}
            requests={requests}
            offers={offers}
            onSelectBusiness={handleSelectBusiness}
            onOpenQuickConnect={handleOpenQuickConnect}
          />
        )}

        {currentTab === 'stories' && (
          <StoriesAndDealsView
            stories={stories}
            offers={offers}
            businesses={businesses}
            onSelectBusiness={handleSelectBusiness}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'dashboard' && (
          activeOwnerBusiness ? (
            <OwnerDashboard
              business={activeOwnerBusiness}
              allBusinesses={businesses}
              onOpenCopilot={(b) => setCopilotBiz(b)}
              onOpenQr={(b) => setQrBiz(b)}
              onSelectBusiness={handleSelectBusiness}
              onOpenQuickConnect={handleOpenQuickConnect}
            />
          ) : (
            <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
              <h2 className="font-serif text-2xl font-black">No Business Profile Registered Yet</h2>
              <p className="text-xs text-stone-600 font-mono">
                Claim or create your Bathinda shopfront profile to access the analytics and management console.
              </p>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-2.5 bg-[#C82A2A] text-white text-xs font-mono uppercase font-bold rounded"
              >
                + Register Your Business Now
              </button>
            </div>
          )
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            businesses={businesses}
            onSelectBusiness={handleSelectBusiness}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectLocality={(loc) => {
          setSelectedLocality(loc);
          setCurrentTab('explore');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentTab('explore');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenClaim={() => setShowClaimModal(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedBusiness(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenClaimModal={() => setShowClaimModal(true)}
      />

      {/* Global Modals */}
      {showClaimModal && (
        <ClaimBusinessWizard
          onClose={() => setShowClaimModal(false)}
          onSuccess={handleOnboardingSuccess}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {quickConnectBiz && (
        <QuickConnectModal
          business={quickConnectBiz}
          initialMode={quickConnectMode}
          onClose={() => setQuickConnectBiz(null)}
        />
      )}

      {copilotBiz && (
        <BusinessCopilotModal
          business={copilotBiz}
          initialMode="customer_qa"
          onClose={() => setCopilotBiz(null)}
        />
      )}

      {qrBiz && (
        <QrModal
          business={qrBiz}
          onClose={() => setQrBiz(null)}
        />
      )}

      {feedbackBiz && (
        <FeedbackModal
          business={feedbackBiz}
          onClose={() => setFeedbackBiz(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
