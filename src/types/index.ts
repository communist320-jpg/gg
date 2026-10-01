export type UserRole = 'customer' | 'business_owner' | 'admin';

export type BusinessCategory =
  | 'Retail Shops'
  | 'Grocery'
  | 'Clothing'
  | 'Electronics'
  | 'Mobile Shops'
  | 'Restaurants / Cafés'
  | 'Gyms / Fitness'
  | 'Salons / Beauty'
  | 'Tuition Centres'
  | 'Coaching Institutes'
  | 'Repair Services'
  | 'Auto Services'
  | 'Healthcare'
  | 'Professional Services'
  | 'Home Services'
  | 'Other Local Businesses';

export const ALL_CATEGORIES: BusinessCategory[] = [
  'Retail Shops',
  'Grocery',
  'Clothing',
  'Electronics',
  'Mobile Shops',
  'Restaurants / Cafés',
  'Gyms / Fitness',
  'Salons / Beauty',
  'Tuition Centres',
  'Coaching Institutes',
  'Repair Services',
  'Auto Services',
  'Healthcare',
  'Professional Services',
  'Home Services',
  'Other Local Businesses',
];

export const BATHINDA_LOCALITIES = [
  'Model Town',
  'Civil Lines',
  'Mall Road',
  'GT Road',
  'Ajit Road',
  'Power House Road',
  'Bibiwala Road',
  'Goniana Road',
  'Amrik Singh Road',
  'Kamla Nehru Colony',
  'Grain Market',
  'Teacher Colony',
  'Rampura Phul (Greater Bathinda)',
] as const;

export type BathindaLocality = typeof BATHINDA_LOCALITIES[number] | string;

export type BusinessStatus = 'open' | 'closed' | 'busy' | 'temporarily_closed';

export type VerificationLevel =
  | 'email_verified'
  | 'phone_verified'
  | 'profile_complete'
  | 'aocsf_verified';

export interface OpeningHourSlot {
  open: string;
  close: string;
  isClosed?: boolean;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeeklyHours = Record<WeekDay, OpeningHourSlot>;

export interface CatalogItem {
  id: string;
  businessId: string;
  name: string;
  category: string;
  description: string;
  price?: number;
  photoUrl?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  slug: string;
  tagline?: string;
  categories: BusinessCategory[];
  description: string;
  address: string;
  locality: BathindaLocality;
  city: string;
  state: string;
  pincode?: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googlePlaceId?: string;
  openingHours: WeeklyHours;
  holidayHoursNotice?: string;
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  photos: string[];
  logoUrl?: string;
  status: BusinessStatus;
  statusCustomNote?: string;
  verifiedLevel: VerificationLevel;
  completenessScore: number; // 0 - 100
  isFeatured?: boolean;
  isDemo?: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  googleFormsUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
  catalog?: CatalogItem[];
  // Analytics aggregate counters
  viewsCount: number;
  catalogViewsCount: number;
  phoneClicksCount: number;
  directionClicksCount: number;
  messageRequestsCount: number;
  qrScansCount: number;
  websiteClicksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessStory {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  locality: string;
  title: string;
  content: string;
  type: 'new_arrival' | 'new_service' | 'holiday_notice' | 'announcement' | 'special_event';
  imageUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface BusinessOffer {
  id: string;
  businessId: string;
  businessName: string;
  locality: string;
  title: string;
  discount: string;
  validUntil: string;
  code?: string;
  terms?: string;
  createdAt: string;
}

export interface BusinessRequest {
  id: string;
  businessId: string;
  businessName: string;
  locality: string;
  title: string;
  details: string;
  category: string;
  urgency: 'normal' | 'urgent';
  contactEmail?: string;
  contactPhone?: string;
  responsesCount?: number;
  createdAt: string;
}

export interface BusinessConnection {
  id: string;
  fromBusinessId: string;
  toBusinessId: string;
  fromBusinessName: string;
  toBusinessName: string;
  fromLocality?: string;
  toLocality?: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposalText?: string;
  synergyType?: string;
  createdAt: string;
}

export interface CustomerFeedback {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail?: string;
  experience: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  rating: number; // 1 - 5
  category?: string;
  comment: string;
  isPublished: boolean;
  ownerReply?: string;
  source: 'aocsf_native' | 'google_forms';
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  businessId: string;
  businessName?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  businessId?: string;
  isEmailVerified: boolean;
  followedBusinessIds?: string[];
  createdAt: string;
}

export interface ReferralItem {
  id: string;
  inviterBusinessId: string;
  inviterBusinessName: string;
  invitedBusinessName: string;
  invitedEmail?: string;
  invitedPhone?: string;
  code: string;
  status: 'sent' | 'joined';
  createdAt: string;
}

export interface ActivityUpdate {
  id: string;
  businessId: string;
  businessName: string;
  businessLocality: string;
  businessLogo?: string;
  type: 'product_arrival' | 'hours_change' | 'status_change' | 'deal_published' | 'story_posted';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    price?: number;
    oldHours?: string;
    newHours?: string;
    imageUrl?: string;
    code?: string;
    itemId?: string;
    statusBadge?: string;
  };
}

