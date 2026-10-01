import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Business,
  CatalogItem,
  BusinessStory,
  BusinessOffer,
  BusinessRequest,
  BusinessConnection,
  CustomerFeedback,
  DirectMessage,
  ReferralItem,
  BusinessCategory,
  BathindaLocality,
  ActivityUpdate
} from '../types';
import {
  INITIAL_DEMO_BUSINESSES,
  DEMO_CATALOG_ITEMS,
  DEMO_STORIES,
  DEMO_OFFERS,
  DEMO_REQUESTS
} from '../data/bathindaDemoData';

const LOCAL_STORAGE_KEY = 'aocsf_businesses_v1';
const LOCAL_STORAGE_ITEMS_KEY = 'aocsf_catalog_items_v1';
const LOCAL_STORAGE_FEEDBACK_KEY = 'aocsf_feedback_v1';
const LOCAL_STORAGE_MESSAGES_KEY = 'aocsf_messages_v1';
const LOCAL_STORAGE_STORIES_KEY = 'aocsf_stories_v1';
const LOCAL_STORAGE_OFFERS_KEY = 'aocsf_offers_v1';
const LOCAL_STORAGE_REQUESTS_KEY = 'aocsf_requests_v1';
const LOCAL_STORAGE_CONNECTIONS_KEY = 'aocsf_connections_v1';
const LOCAL_STORAGE_REFERRALS_KEY = 'aocsf_referrals_v1';
const LOCAL_STORAGE_FOLLOWS_KEY = 'aocsf_followed_businesses_v1';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'aocsf_live_activities_v1';

// Clean storage initialization without fake seeds
function initializeStorage() {
  // Purge any legacy demo items from localStorage
  const keysToClean = [
    LOCAL_STORAGE_KEY,
    LOCAL_STORAGE_ITEMS_KEY,
    LOCAL_STORAGE_STORIES_KEY,
    LOCAL_STORAGE_OFFERS_KEY,
    LOCAL_STORAGE_REQUESTS_KEY,
    LOCAL_STORAGE_ACTIVITIES_KEY,
    LOCAL_STORAGE_FOLLOWS_KEY
  ];

  keysToClean.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: any) => {
            if (typeof item === 'string') return !item.startsWith('demo-');
            return !item.isDemo && !item.id?.startsWith('demo-') && !item.businessId?.startsWith('demo-');
          });
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {
        localStorage.removeItem(key);
      }
    } else {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
}

initializeStorage();

// Calculate completeness score (0-100)
export function calculateCompleteness(b: Partial<Business>): number {
  let score = 0;
  if (b.name) score += 10;
  if (b.categories && b.categories.length > 0) score += 10;
  if (b.description && b.description.length > 30) score += 15;
  if (b.phone) score += 10;
  if (b.email) score += 5;
  if (b.address && b.locality) score += 10;
  if (b.coordinates && b.coordinates.lat !== 0) score += 10;
  if (b.openingHours) score += 10;
  if (b.photos && b.photos.length > 0) score += 10;
  if (b.logoUrl) score += 5;
  if (b.socialLinks?.whatsapp || b.socialLinks?.instagram) score += 5;
  return Math.min(100, score);
}

// Check if a business is open right now
export function isBusinessOpenNow(business: Business): boolean {
  if (business.status === 'temporarily_closed') return false;
  if (business.status === 'closed') return false;
  if (business.status === 'busy') return true;

  try {
    const days: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];
    const now = new Date();
    const currentDay = days[now.getDay()];
    const slot = business.openingHours?.[currentDay];
    if (!slot || slot.isClosed) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = slot.open.split(':').map(Number);
    const [closeH, closeM] = slot.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } catch {
    return true;
  }
}

// Fetch all businesses with optional filters
export async function getBusinesses(filters?: {
  locality?: string;
  category?: string;
  search?: string;
  openNow?: boolean;
  verifiedOnly?: boolean;
}): Promise<Business[]> {
  let list: Business[] = [];

  // Try Firestore first
  try {
    const snap = await getDocs(collection(db, 'businesses'));
    if (!snap.empty) {
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Business);
      });
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to local store:', err);
  }

  // Merge with local storage
  const localList: Business[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  for (const item of localList) {
    if (!list.find(b => b.id === item.id)) {
      list.push(item);
    }
  }

  // Ensure no fake seeded or demo businesses are displayed
  list = list.filter(b => !b.isDemo && !b.id.startsWith('demo-'));

  // Apply filters
  if (filters?.locality && filters.locality !== 'All Localities') {
    list = list.filter(b => b.locality === filters.locality);
  }
  if (filters?.category && filters.category !== 'All Categories') {
    list = list.filter(b => b.categories.includes(filters.category as BusinessCategory));
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.locality.toLowerCase().includes(q) ||
      b.categories.some(c => c.toLowerCase().includes(q))
    );
  }
  if (filters?.openNow) {
    list = list.filter(isBusinessOpenNow);
  }
  if (filters?.verifiedOnly) {
    list = list.filter(b => b.verifiedLevel === 'aocsf_verified' || b.verifiedLevel === 'profile_complete');
  }

  return list;
}

export async function getBusinessById(idOrSlug: string): Promise<Business | null> {
  // Check Firestore
  try {
    const snap = await getDoc(doc(db, 'businesses', idOrSlug));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Business;
    }
  } catch (e) {
    console.warn('Doc fetch fallback:', e);
  }

  // Check local storage
  const list: Business[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const found = list.find(b => b.id === idOrSlug || b.slug === idOrSlug);
  return found || null;
}

export async function saveBusiness(business: Business): Promise<void> {
  business.completenessScore = calculateCompleteness(business);
  business.updatedAt = new Date().toISOString();

  // Try Firestore
  try {
    await setDoc(doc(db, 'businesses', business.id), business);
  } catch (err) {
    console.warn('Firestore setDoc failed, saving locally:', err);
  }

  // Local storage backup
  const list: Business[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  const index = list.findIndex(b => b.id === business.id);
  if (index >= 0) {
    list[index] = business;
  } else {
    list.unshift(business);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export async function incrementMetric(businessId: string, metric: 'viewsCount' | 'catalogViewsCount' | 'phoneClicksCount' | 'directionClicksCount' | 'qrScansCount') {
  try {
    await updateDoc(doc(db, 'businesses', businessId), {
      [metric]: increment(1)
    });
  } catch {
    // update locally
    const list: Business[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const b = list.find(item => item.id === businessId);
    if (b) {
      b[metric] = (b[metric] || 0) + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    }
  }
}

// Catalog Items
export async function getCatalogItems(businessId: string): Promise<CatalogItem[]> {
  try {
    const q = query(collection(db, 'catalogItems'), where('businessId', '==', businessId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: CatalogItem[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as CatalogItem));
      return items;
    }
  } catch (e) {
    console.warn('Catalog Firestore fallback:', e);
  }

  const all: CatalogItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY) || '[]');
  return all.filter(item => item.businessId === businessId);
}

export async function addCatalogItem(item: CatalogItem): Promise<void> {
  try {
    await setDoc(doc(db, 'catalogItems', item.id), item);
  } catch (e) {
    console.warn('Catalog add error:', e);
  }

  const all: CatalogItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY) || '[]');
  all.push(item);
  localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(all));
}

// Stories
export async function getStories(): Promise<BusinessStory[]> {
  try {
    const snap = await getDocs(collection(db, 'stories'));
    if (!snap.empty) {
      const items: BusinessStory[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as BusinessStory));
      return items;
    }
  } catch (e) {
    console.warn('Stories fallback:', e);
  }
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_STORIES_KEY) || '[]');
}

export async function createStory(story: BusinessStory): Promise<void> {
  try {
    await setDoc(doc(db, 'stories', story.id), story);
  } catch (e) {
    console.warn('Story save local:', e);
  }
  const all: BusinessStory[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STORIES_KEY) || '[]');
  all.unshift(story);
  localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(all));
}

// Offers
export async function getOffers(): Promise<BusinessOffer[]> {
  try {
    const snap = await getDocs(collection(db, 'offers'));
    if (!snap.empty) {
      const items: BusinessOffer[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as BusinessOffer));
      return items;
    }
  } catch (e) {
    console.warn('Offers fallback:', e);
  }
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_OFFERS_KEY) || '[]');
}

export async function createOffer(offer: BusinessOffer): Promise<void> {
  try {
    await setDoc(doc(db, 'offers', offer.id), offer);
  } catch (e) {
    console.warn('Offer save local:', e);
  }
  const all: BusinessOffer[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_OFFERS_KEY) || '[]');
  all.unshift(offer);
  localStorage.setItem(LOCAL_STORAGE_OFFERS_KEY, JSON.stringify(all));
}

// Business Requests (B2B Request Board)
export async function getBusinessRequests(): Promise<BusinessRequest[]> {
  try {
    const snap = await getDocs(collection(db, 'businessRequests'));
    if (!snap.empty) {
      const items: BusinessRequest[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as BusinessRequest));
      return items;
    }
  } catch (e) {
    console.warn('Requests fallback:', e);
  }
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY) || '[]');
}

export async function createBusinessRequest(req: BusinessRequest): Promise<void> {
  try {
    await setDoc(doc(db, 'businessRequests', req.id), req);
  } catch (e) {
    console.warn('Req save local:', e);
  }
  const all: BusinessRequest[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY) || '[]');
  all.unshift(req);
  localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(all));
}

// B2B Connections
export async function getConnections(businessId: string): Promise<BusinessConnection[]> {
  const all: BusinessConnection[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONNECTIONS_KEY) || '[]');
  return all.filter(c => c.fromBusinessId === businessId || c.toBusinessId === businessId);
}

export async function createConnection(conn: BusinessConnection): Promise<void> {
  try {
    await setDoc(doc(db, 'connections', conn.id), conn);
  } catch (e) {
    console.warn('Connection save local:', e);
  }
  const all: BusinessConnection[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONNECTIONS_KEY) || '[]');
  all.push(conn);
  localStorage.setItem(LOCAL_STORAGE_CONNECTIONS_KEY, JSON.stringify(all));
}

// Feedback
export async function getFeedback(businessId: string): Promise<CustomerFeedback[]> {
  const all: CustomerFeedback[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY) || '[]');
  return all.filter(f => f.businessId === businessId);
}

export async function submitFeedback(f: CustomerFeedback): Promise<void> {
  try {
    await setDoc(doc(db, 'feedback', f.id), f);
  } catch (e) {
    console.warn('Feedback save local:', e);
  }
  const all: CustomerFeedback[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY) || '[]');
  all.unshift(f);
  localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(all));
}

// Native Messages
export async function getMessages(businessId: string): Promise<DirectMessage[]> {
  const all: DirectMessage[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY) || '[]');
  return all.filter(m => m.businessId === businessId);
}

export async function sendDirectMessage(msg: DirectMessage): Promise<void> {
  try {
    await setDoc(doc(db, 'messages', msg.id), msg);
  } catch (e) {
    console.warn('Message save local:', e);
  }
  const all: DirectMessage[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY) || '[]');
  all.push(msg);
  localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(all));
}

// Referrals
export async function getReferrals(businessId: string): Promise<ReferralItem[]> {
  const all: ReferralItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REFERRALS_KEY) || '[]');
  return all.filter(r => r.inviterBusinessId === businessId);
}

export async function createReferral(ref: ReferralItem): Promise<void> {
  try {
    await setDoc(doc(db, 'referrals', ref.id), ref);
  } catch (e) {
    console.warn('Referral save local:', e);
  }
  const all: ReferralItem[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REFERRALS_KEY) || '[]');
  all.unshift(ref);
  localStorage.setItem(LOCAL_STORAGE_REFERRALS_KEY, JSON.stringify(all));
}

// Live Activities & Follows
export const INITIAL_LIVE_ACTIVITIES: ActivityUpdate[] = [];

export function getFollowedBusinessIds(): string[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_FOLLOWS_KEY);
  if (!saved) {
    return [];
  }
  try {
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list.filter((id: string) => !id.startsWith('demo-')) : [];
  } catch {
    return [];
  }
}

export function toggleFollowBusiness(businessId: string): boolean {
  const current = getFollowedBusinessIds();
  let updated: string[];
  let isNowFollowed = false;

  if (current.includes(businessId)) {
    updated = current.filter(id => id !== businessId);
    isNowFollowed = false;
  } else {
    updated = [...current, businessId];
    isNowFollowed = true;
  }

  localStorage.setItem(LOCAL_STORAGE_FOLLOWS_KEY, JSON.stringify(updated));
  return isNowFollowed;
}

export function isBusinessFollowed(businessId: string): boolean {
  return getFollowedBusinessIds().includes(businessId);
}

export function getLiveActivities(options?: { followedOnly?: boolean; typeFilter?: string }): ActivityUpdate[] {
  let list: ActivityUpdate[] = [];
  const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch {
      list = INITIAL_LIVE_ACTIVITIES;
    }
  } else {
    list = INITIAL_LIVE_ACTIVITIES;
    localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(INITIAL_LIVE_ACTIVITIES));
  }

  if (options?.followedOnly) {
    const followedIds = getFollowedBusinessIds();
    list = list.filter(act => followedIds.includes(act.businessId));
  }

  if (options?.typeFilter && options.typeFilter !== 'all') {
    list = list.filter(act => act.type === options.typeFilter);
  }

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function publishLiveActivity(activity: ActivityUpdate): void {
  const current = getLiveActivities();
  const updated = [activity, ...current];
  localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(updated));
}

