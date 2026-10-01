import { Business, BusinessStory, BusinessOffer, BusinessRequest, CatalogItem } from '../types';

export const DEFAULT_WEEKLY_HOURS = {
  monday: { open: '09:30', close: '20:30', isClosed: false },
  tuesday: { open: '09:30', close: '20:30', isClosed: false },
  wednesday: { open: '09:30', close: '20:30', isClosed: false },
  thursday: { open: '09:30', close: '20:30', isClosed: false },
  friday: { open: '09:30', close: '20:30', isClosed: false },
  saturday: { open: '09:30', close: '21:00', isClosed: false },
  sunday: { open: '11:00', close: '18:00', isClosed: false },
};

// No fake seeded businesses - clean production start
export const INITIAL_DEMO_BUSINESSES: Business[] = [];
export const DEMO_CATALOG_ITEMS: CatalogItem[] = [];
export const DEMO_STORIES: BusinessStory[] = [];
export const DEMO_OFFERS: BusinessOffer[] = [];
export const DEMO_REQUESTS: BusinessRequest[] = [];
