/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PageGroup,
  PageLevel,
  SitemapCategory,
  GeographicLevel,
  UrlClassificationMethod,
  SitemapStatus,
  UrlTaxonomyItem,
  SitemapAuditEntry,
  MultiSitemapUrl,
  UnclassifiedReviewItem,
  NoVisibilitySitemapUrl,
  PillarPageReviewItem,
} from '../types';
import {
  classifyWith23Priorities,
  ClassificationResolutionResult as GscClassificationResolutionResult,
  GSC_PAGE_GROUP_CASE_SQL,
  GSC_PAGE_LEVEL_CASE_SQL,
  calculateGscPageGroup,
  calculateGscPageLevel,
} from './gscTaxonomyEngine';

export {
  GSC_PAGE_GROUP_CASE_SQL,
  GSC_PAGE_LEVEL_CASE_SQL,
  calculateGscPageGroup,
  calculateGscPageLevel,
};
export type { GscClassificationResolutionResult };

// ==========================================
// 1. SITEMAP SOURCES & AUDIT METADATA
// ==========================================

export interface SitemapSourceDefinition {
  id: string;
  url: string;
  category: SitemapCategory;
  defaultPageLevel: PageLevel;
  defaultGeoLevel: GeographicLevel;
  description: string;
}

export const SITEMAP_SOURCES: SitemapSourceDefinition[] = [
  {
    id: 'countries',
    url: '/sitemaps/countries.xml',
    category: 'Countries Sitemap',
    defaultPageLevel: 'Country Page',
    defaultGeoLevel: 'Country',
    description: 'All official country landing pages across tours and tour guides.',
  },
  {
    id: 'regions',
    url: '/sitemaps/regions.xml',
    category: 'Regions Sitemap',
    defaultPageLevel: 'Region Page',
    defaultGeoLevel: 'Region',
    description: 'Multi-city or provincial regional travel destination hubs.',
  },
  {
    id: 'areas',
    url: '/sitemaps/areas.xml',
    category: 'Areas Sitemap',
    defaultPageLevel: 'Area Page',
    defaultGeoLevel: 'Area',
    description: 'Sub-regional and city area destination landing pages.',
  },
  {
    id: 'guides',
    url: '/sitemaps/guides.xml',
    category: 'Guides Sitemap',
    defaultPageLevel: 'Guide Profile Page',
    defaultGeoLevel: 'Not Applicable',
    description: 'Verified local tour guide profile pages with bios and credentials.',
  },
  {
    id: 'attractions',
    url: '/sitemaps/attractions.xml',
    category: 'Attractions Sitemap',
    defaultPageLevel: 'Attraction Page',
    defaultGeoLevel: 'City',
    description: 'Specific monument, museum, and landmark guide and booking hubs.',
  },
  {
    id: 'tours',
    url: '/sitemaps/tours.xml',
    category: 'Tours Sitemap',
    defaultPageLevel: 'Tour Detail Page',
    defaultGeoLevel: 'City',
    description: 'Individual bookable tour experience and itinerary detail pages.',
  },
  {
    id: 'blogs',
    url: '/sitemaps/blogs.xml',
    category: 'Blogs Sitemap',
    defaultPageLevel: 'Blog Post',
    defaultGeoLevel: 'Not Applicable',
    description: 'Editorial travel guides, insider tips, and destination blog posts.',
  },
  {
    id: 'static-pages',
    url: '/sitemaps/static-pages.xml',
    category: 'Static Pages Sitemap',
    defaultPageLevel: 'Static Informational Page',
    defaultGeoLevel: 'Not Applicable',
    description: 'Company info, help center, legal policies, and utility portals (processed once).',
  },
  {
    id: 'cruise-lines',
    url: '/cruise_lines_sitemap.xml',
    category: 'Cruise Lines Sitemap',
    defaultPageLevel: 'Cruise Line Page',
    defaultGeoLevel: 'Global',
    description: 'Cruise line specific excursion hubs (e.g. Royal Caribbean, Viking, Celebrity).',
  },
  {
    id: 'cruise-ships',
    url: '/cruise_ships_sitemap.xml',
    category: 'Cruise Ships Sitemap',
    defaultPageLevel: 'Cruise Ship Page',
    defaultGeoLevel: 'Global',
    description: 'Individual cruise ship itineraries and port excursion match pages.',
  },
  {
    id: 'pillar-pages',
    url: '/sitemaps/pillar-pages.xml',
    category: 'Pillar Pages Sitemap',
    defaultPageLevel: 'Pillar Page',
    defaultGeoLevel: 'Global',
    description: 'High-level topical authority clusters and comprehensive destination guides.',
  },
  {
    id: 'things-to-do-city',
    url: '/sitemaps/things-to-do-city.xml',
    category: 'Things to Do City Sitemap',
    defaultPageLevel: 'City Page',
    defaultGeoLevel: 'City',
    description: 'City-level curated things to do and activities directory.',
  },
  {
    id: 'things-to-do-country',
    url: '/sitemaps/things-to-do-country.xml',
    category: 'Things to Do Country Sitemap',
    defaultPageLevel: 'Country Page',
    defaultGeoLevel: 'Country',
    description: 'Country-level curated things to do and national sightseeing directory.',
  },
];

// Deduplication Audit Data: 13 unique sitemaps (static-pages.xml is listed twice in sitemap index but processed once)
export const SITEMAP_AUDIT_DATA: SitemapAuditEntry[] = [
  {
    sitemapUrl: '/sitemaps/countries.xml',
    category: 'Countries Sitemap',
    urlCount: 194,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-17T18:42:00Z',
    notes: 'Includes all country roots for /tours/, /tour-guides/, /safaris/. Clean XML structure.',
    sampleUrls: [
      '/tours/Italy',
      '/tour-guides/Japan',
      '/safaris/Kenya',
      '/tours/France',
    ],
  },
  {
    sitemapUrl: '/sitemaps/regions.xml',
    category: 'Regions Sitemap',
    urlCount: 412,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-16T12:20:00Z',
    notes: 'Multi-city travel regions (e.g. Tuscany, Amalfi Coast, Provence, Scottish Highlands).',
    sampleUrls: [
      '/tours/Italy/Tuscany',
      '/tours/Italy/Amalfi-Coast',
      '/tours/France/Provence',
      '/tour-guides/Spain/Catalonia',
    ],
  },
  {
    sitemapUrl: '/sitemaps/areas.xml',
    category: 'Areas Sitemap',
    urlCount: 1845,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-17T22:15:00Z',
    notes: 'City and destination area landing pages across 180+ global markets.',
    sampleUrls: [
      '/tours/Italy/Rome',
      '/tours/Japan/Tokyo',
      '/tours/France/Paris',
      '/tour-guides/UK/London',
    ],
  },
  {
    sitemapUrl: '/sitemaps/guides.xml',
    category: 'Guides Sitemap',
    urlCount: 4850,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-18T01:30:00Z',
    notes: 'Individual local guide biographies, reviews, certifications, and languages.',
    sampleUrls: [
      '/guide-profile/29182/marco-rome-guide',
      '/guide-profile/48191/yuki-tokyo-local-expert',
      '/guide-profile/10928/claire-paris-historian',
    ],
  },
  {
    sitemapUrl: '/sitemaps/attractions.xml',
    category: 'Attractions Sitemap',
    urlCount: 1260,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-17T15:00:00Z',
    notes: 'Attraction guide and tour detail pages (e.g. Colosseum, Vatican, Louvre, Fushimi Inari).',
    sampleUrls: [
      '/tours/Italy/Rome/attractions/Colosseum',
      '/tour-guides/France/Paris/attractions/Louvre-Museum',
      '/tours/Japan/Kyoto/attractions/Fushimi-Inari-Shrine',
    ],
  },
  {
    sitemapUrl: '/sitemaps/tours.xml',
    category: 'Tours Sitemap',
    urlCount: 14820,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-18T04:10:00Z',
    notes: 'Single bookable itineraries with custom pricing, durations, and booking engines.',
    sampleUrls: [
      '/tour-details/78912/rome-colosseum-forum-private-vip-tour',
      '/tour-details/49102/tokyo-hidden-gems-street-food-tour',
      '/tour-details/38192/paris-louvre-mona-lisa-masterpieces-tour',
    ],
  },
  {
    sitemapUrl: '/sitemaps/blogs.xml',
    category: 'Blogs Sitemap',
    urlCount: 385,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-15T09:40:00Z',
    notes: 'Editorial destination guides, cultural etiquette, and packing advice articles.',
    sampleUrls: [
      '/travel-blog/how-to-hire-private-tour-guide-in-italy',
      '/travel-blog/best-time-to-visit-kyoto-cherry-blossoms',
      '/travel-blog/sustainable-travel-with-local-guides',
    ],
  },
  {
    sitemapUrl: '/sitemaps/static-pages.xml',
    category: 'Static Pages Sitemap',
    urlCount: 68,
    status: 'Deduplicated',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-10T11:00:00Z',
    notes: 'Sitemap index listed static-pages.xml twice. Deduplicated and processed exactly once.',
    sampleUrls: [
      '/about-us',
      '/how-it-works',
      '/terms-and-conditions',
      '/privacy-policy',
    ],
  },
  {
    sitemapUrl: '/cruise_lines_sitemap.xml',
    category: 'Cruise Lines Sitemap',
    urlCount: 42,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-12T14:30:00Z',
    notes: 'Dedicated shore excursion landing pages for specific major cruise operators.',
    sampleUrls: [
      '/shore-excursions/royal-caribbean',
      '/shore-excursions/viking-ocean-cruises',
      '/shore-excursions/celebrity-cruises',
      '/shore-excursions/norwegian-cruise-line',
    ],
  },
  {
    sitemapUrl: '/cruise_ships_sitemap.xml',
    category: 'Cruise Ships Sitemap',
    urlCount: 310,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-14T08:15:00Z',
    notes: 'Individual vessel excursion schedules and tailored shore day matches.',
    sampleUrls: [
      '/shore-excursions/royal-caribbean/wonder-of-the-seas',
      '/shore-excursions/viking/viking-sky',
      '/shore-excursions/celebrity/celebrity-beyond',
    ],
  },
  {
    sitemapUrl: '/sitemaps/pillar-pages.xml',
    category: 'Pillar Pages Sitemap',
    urlCount: 28,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-16T17:50:00Z',
    notes: 'Comprehensive topical pillar guides with deep thematic content hubs.',
    sampleUrls: [
      '/tours/italy/complete-private-guide',
      '/tours/japan/first-timers-travel-guide',
      '/tours/safaris/ultimate-african-safari-guide',
    ],
  },
  {
    sitemapUrl: '/sitemaps/things-to-do-city.xml',
    category: 'Things to Do City Sitemap',
    urlCount: 1420,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-17T20:30:00Z',
    notes: 'City activity clusters targeting generic top-of-funnel discovery intent.',
    sampleUrls: [
      '/things-to-do/Rome',
      '/things-to-do/Tokyo',
      '/things-to-do/Paris',
      '/things-to-do/London',
    ],
  },
  {
    sitemapUrl: '/sitemaps/things-to-do-country.xml',
    category: 'Things to Do Country Sitemap',
    urlCount: 175,
    status: 'Audited & Verified',
    retrievalDate: '2026-08-18T06:00:00Z',
    latestLastmod: '2026-08-15T19:10:00Z',
    notes: 'National activity aggregators targeting broad country holiday planning.',
    sampleUrls: [
      '/things-to-do/Italy',
      '/things-to-do/Japan',
      '/things-to-do/France',
      '/things-to-do/Spain',
    ],
  },
];

// ==========================================
// 2. KNOWN SITEMAP LOOKUP REPOSITORY
// ==========================================

// Realistic lookup table mapping normalized path -> Sitemap Category & default details
export const SITEMAP_URL_LOOKUP: Record<
  string,
  {
    category: SitemapCategory;
    sitemapUrl: string;
    geoLevel?: GeographicLevel;
    lastmod?: string;
  }
> = {
  // Countries
  '/tours/Italy': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tours/Japan': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tours/France': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tours/Spain': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tours/United-Kingdom': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tours/Greece': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tour-guides/Italy': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tour-guides/Japan': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tour-guides/France': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/tour-guides/Spain': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/safaris/Kenya': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/safaris/Tanzania': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },
  '/safaris/South-Africa': { category: 'Countries Sitemap', sitemapUrl: '/sitemaps/countries.xml', geoLevel: 'Country' },

  // Regions
  '/tours/Italy/Tuscany': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/Italy/Amalfi-Coast': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/Italy/Sicily': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/France/Provence': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/France/French-Riviera': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/Spain/Catalonia': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/Spain/Andalusia': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tours/United-Kingdom/Scottish-Highlands': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tour-guides/Italy/Tuscany': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },
  '/tour-guides/Italy/Amalfi-Coast': { category: 'Regions Sitemap', sitemapUrl: '/sitemaps/regions.xml', geoLevel: 'Region' },

  // Areas / Cities
  '/tours/Italy/Rome': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Italy/Florence': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Italy/Venice': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Italy/Naples': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Japan/Tokyo': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Japan/Kyoto': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Japan/Osaka': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/France/Paris': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/France/Nice': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Spain/Barcelona': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/Spain/Madrid': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/United-Kingdom/London': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tours/United-Kingdom/Edinburgh': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tour-guides/Italy/Rome': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tour-guides/Japan/Tokyo': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tour-guides/France/Paris': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },
  '/tour-guides/Spain/Barcelona': { category: 'Areas Sitemap', sitemapUrl: '/sitemaps/areas.xml', geoLevel: 'City' },

  // Attractions
  '/tours/Italy/Rome/attractions/Colosseum': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tours/Italy/Rome/attractions/Vatican-Museums': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tours/France/Paris/attractions/Louvre-Museum': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tours/France/Paris/attractions/Eiffel-Tower': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tours/Japan/Kyoto/attractions/Fushimi-Inari-Shrine': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tours/Spain/Barcelona/attractions/Sagrada-Familia': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tour-guides/Italy/Rome/attractions/Colosseum': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },
  '/tour-guides/France/Paris/attractions/Louvre-Museum': { category: 'Attractions Sitemap', sitemapUrl: '/sitemaps/attractions.xml', geoLevel: 'City' },

  // Cruise Lines & Ships
  '/shore-excursions/royal-caribbean': { category: 'Cruise Lines Sitemap', sitemapUrl: '/cruise_lines_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/viking-ocean-cruises': { category: 'Cruise Lines Sitemap', sitemapUrl: '/cruise_lines_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/celebrity-cruises': { category: 'Cruise Lines Sitemap', sitemapUrl: '/cruise_lines_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/norwegian-cruise-line': { category: 'Cruise Lines Sitemap', sitemapUrl: '/cruise_lines_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/princess-cruises': { category: 'Cruise Lines Sitemap', sitemapUrl: '/cruise_lines_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/royal-caribbean/wonder-of-the-seas': { category: 'Cruise Ships Sitemap', sitemapUrl: '/cruise_ships_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/viking/viking-sky': { category: 'Cruise Ships Sitemap', sitemapUrl: '/cruise_ships_sitemap.xml', geoLevel: 'Global' },
  '/shore-excursions/celebrity/celebrity-beyond': { category: 'Cruise Ships Sitemap', sitemapUrl: '/cruise_ships_sitemap.xml', geoLevel: 'Global' },

  // Things to Do
  '/things-to-do': { category: 'Not Found in Sitemap', sitemapUrl: 'Directory Root', geoLevel: 'Global' },
  '/things-to-do/Italy': { category: 'Things to Do Country Sitemap', sitemapUrl: '/sitemaps/things-to-do-country.xml', geoLevel: 'Country' },
  '/things-to-do/Japan': { category: 'Things to Do Country Sitemap', sitemapUrl: '/sitemaps/things-to-do-country.xml', geoLevel: 'Country' },
  '/things-to-do/France': { category: 'Things to Do Country Sitemap', sitemapUrl: '/sitemaps/things-to-do-country.xml', geoLevel: 'Country' },
  '/things-to-do/Spain': { category: 'Things to Do Country Sitemap', sitemapUrl: '/sitemaps/things-to-do-country.xml', geoLevel: 'Country' },
  '/things-to-do/Rome': { category: 'Things to Do City Sitemap', sitemapUrl: '/sitemaps/things-to-do-city.xml', geoLevel: 'City' },
  '/things-to-do/Tokyo': { category: 'Things to Do City Sitemap', sitemapUrl: '/sitemaps/things-to-do-city.xml', geoLevel: 'City' },
  '/things-to-do/Paris': { category: 'Things to Do City Sitemap', sitemapUrl: '/sitemaps/things-to-do-city.xml', geoLevel: 'City' },
  '/things-to-do/London': { category: 'Things to Do City Sitemap', sitemapUrl: '/sitemaps/things-to-do-city.xml', geoLevel: 'City' },
  '/things-to-do/Barcelona': { category: 'Things to Do City Sitemap', sitemapUrl: '/sitemaps/things-to-do-city.xml', geoLevel: 'City' },

  // Pillar Pages
  '/tours/italy/complete-private-guide': { category: 'Pillar Pages Sitemap', sitemapUrl: '/sitemaps/pillar-pages.xml', geoLevel: 'Country' },
  '/tours/japan/first-timers-travel-guide': { category: 'Pillar Pages Sitemap', sitemapUrl: '/sitemaps/pillar-pages.xml', geoLevel: 'Country' },
  '/tours/safaris/ultimate-african-safari-guide': { category: 'Pillar Pages Sitemap', sitemapUrl: '/sitemaps/pillar-pages.xml', geoLevel: 'Global' },
  '/tours/cruises/mediterranean-shore-excursion-planning': { category: 'Pillar Pages Sitemap', sitemapUrl: '/sitemaps/pillar-pages.xml', geoLevel: 'Region' },

  // Static Pages
  '/about-us': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/how-it-works': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/terms-and-conditions': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/privacy-policy': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/careers': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/press': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/contact-us': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
  '/help-center': { category: 'Static Pages Sitemap', sitemapUrl: '/sitemaps/static-pages.xml', geoLevel: 'Not Applicable' },
};

// ==========================================
// 3. URL NORMALIZATION ENGINE
// ==========================================

export interface NormalizedUrlResult {
  rawUrl: string;
  normalizedUrl: string;
  normalizedPath: string;
  hostname: string;
  queryParamsRemoved: string[];
  fragmentRemoved: string | null;
  trailingSlashRemoved: boolean;
  isHomepage: boolean;
}

/**
 * Normalizes any raw Property URL according to explicit project rules:
 * - Convert hostname to lowercase
 * - Treat www.domain.com and domain.com consistently
 * - Remove query parameters (e.g. tracking UTMs, cruise selectors, filters)
 * - Remove URL fragments (#...)
 * - Remove trailing slash, except for the homepage ("/")
 * - Preserve meaningful path slug casing unless confirmed case-insensitive
 * - Do not merge two different paths
 */
export function normalizeLandingPage(rawUrl: string): NormalizedUrlResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      rawUrl: '',
      normalizedUrl: '/',
      normalizedPath: '/',
      hostname: 'www.domain.com',
      queryParamsRemoved: [],
      fragmentRemoved: null,
      trailingSlashRemoved: false,
      isHomepage: true,
    };
  }

  let input = rawUrl.trim();
  let fragmentRemoved: string | null = null;
  const queryParamsRemoved: string[] = [];

  // Extract and remove fragment
  const hashIdx = input.indexOf('#');
  if (hashIdx !== -1) {
    fragmentRemoved = input.substring(hashIdx);
    input = input.substring(0, hashIdx);
  }

  // Extract and remove query parameters
  const queryIdx = input.indexOf('?');
  if (queryIdx !== -1) {
    const queryString = input.substring(queryIdx + 1);
    const params = new URLSearchParams(queryString);
    params.forEach((_val, key) => queryParamsRemoved.push(key));
    input = input.substring(0, queryIdx);
  }

  let hostname = 'www.domain.com';
  let path = input;

  // Handle absolute URL or protocol-relative URL
  if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('//')) {
    try {
      // Use standard URL parsing for host/path separation
      const fullUrlObj = new URL(input.startsWith('//') ? `https:${input}` : input);
      hostname = fullUrlObj.hostname.toLowerCase();
      // Normalize domain.com to www.domain.com
      if (hostname === 'domain.com') {
        hostname = 'www.domain.com';
      }
      path = fullUrlObj.pathname;
    } catch {
      // Fallback regex if URL constructor fails
      const match = input.match(/^(?:https?:)?\/\/([^/]+)(\/.*)?$/i);
      if (match) {
        hostname = match[1].toLowerCase();
        if (hostname === 'domain.com') hostname = 'www.domain.com';
        path = match[2] || '/';
      }
    }
  }

  // Ensure leading slash
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Normalize path segments without destroying slug casing
  let trailingSlashRemoved = false;
  const isHomepage = path === '/' || path === '';

  if (!isHomepage && path.endsWith('/')) {
    path = path.slice(0, -1);
    trailingSlashRemoved = true;
  }

  // Ensure path is at least '/'
  if (!path) {
    path = '/';
  }

  const normalizedUrl = `${path === '/' ? '/' : path}`;

  return {
    rawUrl,
    normalizedUrl,
    normalizedPath: path,
    hostname,
    queryParamsRemoved,
    fragmentRemoved,
    trailingSlashRemoved,
    isHomepage: path === '/',
  };
}

// ==========================================
// 4. TAXONOMY CLASSIFIER RESOLUTION ENGINE
// ==========================================

export interface ClassificationResolutionResult {
  landingPage: string;
  normalizedLandingPage: string;
  normalizedPath: string;
  pageGroup: PageGroup;
  pageLevel: PageLevel;
  calculatedGscPageGroup?: PageGroup;
  calculatedGscPageLevel?: PageLevel;
  geographicLevel: GeographicLevel;
  sitemapCategory: SitemapCategory;
  sitemapStatus: SitemapStatus;
  urlClassificationMethod: UrlClassificationMethod;
  sourceSitemap: string;
  classificationReviewRequired: boolean;
  priorityRuleMatched: string;
  priorityNumber?: number;
  reviewReason?: string;
  resolutionTrace: string[];
}

/**
 * Classifies any Property landing page using the strict 18-priority hierarchy:
 * Hierarchy:
 *  1. Exact normalized URL match against the Property sitemaps
 *  2. Specific URL-pattern rules
 *  3. General directory rules
 *  4. Other or Unclassified as the fallback
 */
export function classifyUrlTaxonomy(rawUrl: string): ClassificationResolutionResult {
  return classifyWith23Priorities(rawUrl, SITEMAP_URL_LOOKUP);
}

function _legacyClassifierOld(rawUrl: string): ClassificationResolutionResult {
  const norm = normalizeLandingPage(rawUrl);
  const path = norm.normalizedPath;
  const trace: string[] = [];

  trace.push(`1. Normalized input: "${rawUrl}" -> Path: "${path}"`);

  // Check sitemap lookup table
  const exactSitemapMatch = SITEMAP_URL_LOOKUP[path];
  if (exactSitemapMatch) {
    trace.push(`2. Found exact entry in ${exactSitemapMatch.category} (${exactSitemapMatch.sitemapUrl})`);
  } else {
    trace.push(`2. Exact normalized path not in static mock lookup list; evaluating full 18-priority rule tree.`);
  }

  // =========================================================================
  // PRIORITY 1: Homepage
  // Condition: Normalized path equals '/'
  // =========================================================================
  if (path === '/') {
    trace.push(`Priority 1 MATCH: Normalized path equals '/'`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Homepage',
      pageLevel: 'Site Root',
      geographicLevel: 'Global',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'Site Root Manifest',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 1: Homepage',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 2: Tour detail pages
  // Condition: Present in Tours Sitemap OR contains '/tour-details/'
  // =========================================================================
  if (exactSitemapMatch?.category === 'Tours Sitemap' || path.includes('/tour-details/')) {
    trace.push(`Priority 2 MATCH: Tour detail page identified (${path.includes('/tour-details/') ? 'contains /tour-details/' : 'Tours Sitemap match'})`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Tour Details',
      pageLevel: 'Tour Detail Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: 'Tours Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/tours.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 2: Tour detail pages',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 3: Attraction pages
  // Condition: Present in Attractions Sitemap OR contains '/attractions/'
  // =========================================================================
  if (exactSitemapMatch?.category === 'Attractions Sitemap' || path.includes('/attractions/')) {
    let pageLevel: PageLevel = 'Attraction Page';
    let reviewRequired = false;
    let reviewReason: string | undefined = undefined;

    if (path.startsWith('/tour-guides/')) {
      pageLevel = 'Attraction Guide Page';
      trace.push(`Priority 3 MATCH: Attraction Guide Page (/tour-guides/.../attractions/...)`);
    } else if (path.startsWith('/tours/')) {
      pageLevel = 'Attraction Page';
      trace.push(`Priority 3 MATCH: Attraction Page (/tours/.../attractions/...)`);
    } else {
      pageLevel = 'Attraction Page';
      reviewRequired = true;
      reviewReason = 'Attraction URL does not start with /tours/ or /tour-guides/ standard prefix';
      trace.push(`Priority 3 MATCH: Non-standard Attraction Page -> Requires Review`);
    }

    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Attractions',
      pageLevel,
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: 'Attractions Sitemap',
      sitemapStatus: reviewRequired ? 'Requires Review' : 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/attractions.xml',
      classificationReviewRequired: reviewRequired,
      priorityRuleMatched: 'Priority 3: Attraction pages',
      reviewReason,
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 4: Cruise destination or port pages
  // Condition: URL ends with '/shore-ex-tours'
  // (Evaluate before general Tours and Safaris)
  // =========================================================================
  if (path.endsWith('/shore-ex-tours')) {
    trace.push(`Priority 4 MATCH: Ends with '/shore-ex-tours' (Cruise Destination / Port Page)`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Destination / Port Page',
      geographicLevel: 'City',
      sitemapCategory: 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 4: Cruise destination or port pages',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 5: Essential Tours
  // Global condition: exact normalized path equals '/tours/essentials-tours'
  // Location condition: ends with '/essentials-tours'
  // =========================================================================
  if (path === '/tours/essentials-tours') {
    trace.push(`Priority 5 MATCH: Exact global path '/tours/essentials-tours'`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Essential Tours',
      pageLevel: 'Global Landing Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Pillar Pages Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/pillar-pages.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 5: Essential Tours (Global)',
      resolutionTrace: trace,
    };
  }

  if (path.endsWith('/essentials-tours')) {
    trace.push(`Priority 5 MATCH: Location-specific '/essentials-tours' ending`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Essential Tours',
      pageLevel: 'City / Area Landing Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Unknown',
      sitemapCategory: exactSitemapMatch?.category || 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: exactSitemapMatch?.sitemapUrl || '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 5: Essential Tours (Location)',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 6: Cruise ships
  // Condition: Present in Cruise Ships Sitemap OR verified ship pattern
  // =========================================================================
  if (
    exactSitemapMatch?.category === 'Cruise Ships Sitemap' ||
    (path.startsWith('/shore-excursions/') && path.split('/').filter(Boolean).length === 3)
  ) {
    trace.push(`Priority 6 MATCH: Cruise Ships Sitemap or verified 3-segment ship path`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Ship Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Cruise Ships Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/cruise_ships_sitemap.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 6: Cruise ships',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 7: Cruise lines
  // Condition: Present in Cruise Lines Sitemap OR /shore-excursions/{cruise-line-slug}
  // =========================================================================
  if (
    exactSitemapMatch?.category === 'Cruise Lines Sitemap' ||
    (path.startsWith('/shore-excursions/') && path !== '/shore-excursions' && path.split('/').filter(Boolean).length === 2)
  ) {
    trace.push(`Priority 7 MATCH: Cruise Lines Sitemap or /shore-excursions/{line}`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Line Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Cruise Lines Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/cruise_lines_sitemap.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 7: Cruise lines',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 8: Tour category pages
  // Support: /tours/{country}/{category}-tours or /tours/{country}/{city}/{category}-tours
  // (Excludes /shore-ex-tours and /essentials-tours handled above)
  // =========================================================================
  if (
    path.startsWith('/tours/') &&
    path.endsWith('-tours') &&
    !path.endsWith('/shore-ex-tours') &&
    !path.endsWith('/essentials-tours')
  ) {
    // Check if the last segment is a category (e.g. food-tours, walking-tours, city-highlights-tours)
    const segments = path.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (segments.length >= 3 || (segments.length === 2 && lastSeg.includes('-'))) {
      trace.push(`Priority 8 MATCH: Category tour pattern ending with '${lastSeg}'`);
      return {
        landingPage: rawUrl,
        normalizedLandingPage: norm.normalizedUrl,
        normalizedPath: path,
        pageGroup: 'Tours',
        pageLevel: 'Tour Category Page',
        geographicLevel: segments.length >= 3 ? 'City' : 'Country',
        sitemapCategory: 'Areas Sitemap',
        sitemapStatus: 'Found in Sitemap',
        urlClassificationMethod: 'Verified URL Pattern',
        sourceSitemap: '/sitemaps/areas.xml',
        classificationReviewRequired: false,
        priorityRuleMatched: 'Priority 8: Tour category pages',
        resolutionTrace: trace,
      };
    }
  }

  // =========================================================================
  // PRIORITY 9: Blog pages
  // Directory: exact path '/travel-blog'
  // Article: in Blogs Sitemap OR path starts with '/travel-blog/' with slug
  // =========================================================================
  if (path === '/travel-blog') {
    trace.push(`Priority 9 MATCH: Travel Blog directory root`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Travel Blog',
      pageLevel: 'Directory Root',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Blogs Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/blogs.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 9: Blog directory root',
      resolutionTrace: trace,
    };
  }

  if (exactSitemapMatch?.category === 'Blogs Sitemap' || path.startsWith('/travel-blog/')) {
    trace.push(`Priority 9 MATCH: Blog Post article`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Travel Blog',
      pageLevel: 'Blog Post',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Blogs Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/blogs.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 9: Blog article',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 10: Things to Do pages
  // Directory: '/things-to-do'
  // Country: in Things to Do Country Sitemap
  // City: in Things to Do City Sitemap
  // =========================================================================
  if (path === '/things-to-do') {
    trace.push(`Priority 10 MATCH: Things to Do Directory Root`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: 'Directory Root',
      geographicLevel: 'Global',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'Directory Root Manifest',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 10: Things to Do directory root',
      resolutionTrace: trace,
    };
  }

  if (exactSitemapMatch?.category === 'Things to Do Country Sitemap') {
    trace.push(`Priority 10 MATCH: Things to Do Country Sitemap match`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: 'Country Page',
      geographicLevel: 'Country',
      sitemapCategory: 'Things to Do Country Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Exact Sitemap Match',
      sourceSitemap: '/sitemaps/things-to-do-country.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 10: Things to Do country page',
      resolutionTrace: trace,
    };
  }

  if (exactSitemapMatch?.category === 'Things to Do City Sitemap') {
    trace.push(`Priority 10 MATCH: Things to Do City Sitemap match`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: 'City Page',
      geographicLevel: 'City',
      sitemapCategory: 'Things to Do City Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Exact Sitemap Match',
      sourceSitemap: '/sitemaps/things-to-do-city.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 10: Things to Do city page',
      resolutionTrace: trace,
    };
  }

  if (path.startsWith('/things-to-do/')) {
    const segments = path.split('/').filter(Boolean);
    const isCountryLevel = segments.length === 2 && ['Italy', 'Japan', 'France', 'Spain', 'Germany', 'Greece', 'UK', 'USA'].includes(segments[1]);
    trace.push(`Priority 10 MATCH: /things-to-do pattern (${isCountryLevel ? 'Country' : 'City'})`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: isCountryLevel ? 'Country Page' : 'City Page',
      geographicLevel: isCountryLevel ? 'Country' : 'City',
      sitemapCategory: isCountryLevel ? 'Things to Do Country Sitemap' : 'Things to Do City Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: isCountryLevel
        ? '/sitemaps/things-to-do-country.xml'
        : '/sitemaps/things-to-do-city.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 10: Things to Do page pattern',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 11: Guide profile pages
  // Condition: in Guides Sitemap OR /guide-profile/...
  // =========================================================================
  if (exactSitemapMatch?.category === 'Guides Sitemap' || path.startsWith('/guide-profile/') || path.startsWith('/guides/')) {
    trace.push(`Priority 11 MATCH: Guide Profile Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Guide Profiles',
      pageLevel: 'Guide Profile Page',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Guides Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/guides.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 11: Guide profile pages',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 12: Country, region and area landing pages (Sitemap-driven)
  // Countries Sitemap -> Country Page / Country
  // Regions Sitemap -> Region Page / Region
  // Areas Sitemap -> Area Page / Area
  // Page Group assigned from URL directory prefix:
  //  - /tours/ -> Tours
  //  - /tour-guides/ -> Tour Guides
  //  - /safaris/ -> Safaris
  //  - /things-to-do/ -> Things to Do
  //  - /shore-excursions/ -> Shore Excursions
  //  - Otherwise -> Other & Requires Review
  // =========================================================================
  if (
    exactSitemapMatch?.category === 'Countries Sitemap' ||
    exactSitemapMatch?.category === 'Regions Sitemap' ||
    exactSitemapMatch?.category === 'Areas Sitemap'
  ) {
    let assignedGroup: PageGroup = 'Tours';
    let reviewReq = false;

    if (path.startsWith('/tours/')) assignedGroup = 'Tours';
    else if (path.startsWith('/tour-guides/')) assignedGroup = 'Tour Guides';
    else if (path.startsWith('/safaris/')) assignedGroup = 'Safaris';
    else if (path.startsWith('/things-to-do/')) assignedGroup = 'Things to Do';
    else if (path.startsWith('/shore-excursions/')) assignedGroup = 'Shore Excursions';
    else {
      assignedGroup = 'Other';
      reviewReq = true;
    }

    let assignedLevel: PageLevel = 'Area Page';
    let geoLevel: GeographicLevel = 'Area';

    if (exactSitemapMatch.category === 'Countries Sitemap') {
      assignedLevel = 'Country Page';
      geoLevel = 'Country';
    } else if (exactSitemapMatch.category === 'Regions Sitemap') {
      assignedLevel = 'Region Page';
      geoLevel = 'Region';
    } else {
      assignedLevel = 'Area Page';
      geoLevel = 'Area';
    }

    trace.push(`Priority 12 MATCH: Exact sitemap membership in ${exactSitemapMatch.category} -> ${assignedGroup} / ${assignedLevel} (${geoLevel})`);

    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: assignedGroup,
      pageLevel: assignedLevel,
      geographicLevel: geoLevel,
      sitemapCategory: exactSitemapMatch.category,
      sitemapStatus: reviewReq ? 'Requires Review' : 'Found in Sitemap',
      urlClassificationMethod: 'Exact Sitemap Match',
      sourceSitemap: exactSitemapMatch.sitemapUrl,
      classificationReviewRequired: reviewReq,
      priorityRuleMatched: `Priority 12: ${exactSitemapMatch.category} landing page`,
      reviewReason: reviewReq ? 'Non-standard directory prefix for geographic sitemap URL' : undefined,
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 13: Directory roots
  // Classify exact normalized paths
  // =========================================================================
  const directoryRoots: Record<string, { group: PageGroup; level: PageLevel }> = {
    '/tours': { group: 'Tours', level: 'Directory Root' },
    '/tour-guides': { group: 'Tour Guides', level: 'Directory Root' },
    '/safaris': { group: 'Safaris', level: 'Directory Root' },
    '/shore-excursions': { group: 'Shore Excursions', level: 'Directory Root' },
    '/travel-blog': { group: 'Travel Blog', level: 'Directory Root' },
    '/things-to-do': { group: 'Things to Do', level: 'Directory Root' },
  };

  if (directoryRoots[path]) {
    const rootInfo = directoryRoots[path];
    trace.push(`Priority 13 MATCH: Exact Directory Root '${path}'`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: rootInfo.group,
      pageLevel: rootInfo.level,
      geographicLevel: 'Global',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'Directory Root Manifest',
      classificationReviewRequired: false,
      priorityRuleMatched: `Priority 13: Directory Root (${path})`,
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 14: Safari pages
  // /safaris/{country} -> Country Page
  // /safaris/{country}/{location} -> City, Area or Region
  // =========================================================================
  if (path.startsWith('/safaris/')) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 2) {
      trace.push(`Priority 14 MATCH: Safari Country Page (/safaris/${segments[1]})`);
      return {
        landingPage: rawUrl,
        normalizedLandingPage: norm.normalizedUrl,
        normalizedPath: path,
        pageGroup: 'Safaris',
        pageLevel: 'Country Page',
        geographicLevel: 'Country',
        sitemapCategory: 'Countries Sitemap',
        sitemapStatus: 'Found in Sitemap',
        urlClassificationMethod: 'Verified URL Pattern',
        sourceSitemap: '/sitemaps/countries.xml',
        classificationReviewRequired: false,
        priorityRuleMatched: 'Priority 14: Safari Country Page',
        resolutionTrace: trace,
      };
    } else {
      trace.push(`Priority 14 MATCH: Safari location sub-page (${segments.length} segments) -> Directory Fallback`);
      return {
        landingPage: rawUrl,
        normalizedLandingPage: norm.normalizedUrl,
        normalizedPath: path,
        pageGroup: 'Safaris',
        pageLevel: 'City / Area / Region Page',
        geographicLevel: 'Unknown',
        sitemapCategory: 'Areas Sitemap',
        sitemapStatus: 'Found in Sitemap',
        urlClassificationMethod: 'Directory Fallback',
        sourceSitemap: '/sitemaps/areas.xml',
        classificationReviewRequired: false,
        priorityRuleMatched: 'Priority 14: Safari location fallback',
        resolutionTrace: trace,
      };
    }
  }

  // =========================================================================
  // PRIORITY 15: Tours and Tour Guides fallback
  // /tours/{country} -> Country Page
  // /tours/{country}/{location} -> City / Area / Region Page (Unknown geo)
  // /tour-guides/{country} -> Country Page
  // /tour-guides/{country}/{location} -> City / Area / Region Page (Unknown geo)
  // =========================================================================
  if (path.startsWith('/tours/') || path.startsWith('/tour-guides/')) {
    const isGuides = path.startsWith('/tour-guides/');
    const segments = path.split('/').filter(Boolean);
    const assignedGroup: PageGroup = isGuides ? 'Tour Guides' : 'Tours';

    if (segments.length === 2) {
      trace.push(`Priority 15 MATCH: ${assignedGroup} Country Page (/.../${segments[1]})`);
      return {
        landingPage: rawUrl,
        normalizedLandingPage: norm.normalizedUrl,
        normalizedPath: path,
        pageGroup: assignedGroup,
        pageLevel: 'Country Page',
        geographicLevel: 'Country',
        sitemapCategory: 'Countries Sitemap',
        sitemapStatus: 'Found in Sitemap',
        urlClassificationMethod: 'Verified URL Pattern',
        sourceSitemap: '/sitemaps/countries.xml',
        classificationReviewRequired: false,
        priorityRuleMatched: `Priority 15: ${assignedGroup} Country Page`,
        resolutionTrace: trace,
      };
    } else {
      trace.push(`Priority 15 MATCH: Multi-segment ${assignedGroup} location URL (${segments.length} segments) -> City / Area / Region Page (Unknown Geo)`);
      return {
        landingPage: rawUrl,
        normalizedLandingPage: norm.normalizedUrl,
        normalizedPath: path,
        pageGroup: assignedGroup,
        pageLevel: 'City / Area / Region Page',
        geographicLevel: 'Unknown',
        sitemapCategory: 'Areas Sitemap',
        sitemapStatus: 'Found in Sitemap',
        urlClassificationMethod: 'Directory Fallback',
        sourceSitemap: '/sitemaps/areas.xml',
        classificationReviewRequired: false,
        priorityRuleMatched: `Priority 15: ${assignedGroup} Directory Fallback`,
        resolutionTrace: trace,
      };
    }
  }

  // =========================================================================
  // PRIORITY 16: Pillar pages
  // Condition: in Pillar Pages Sitemap
  // =========================================================================
  if (exactSitemapMatch?.category === 'Pillar Pages Sitemap' || path.includes('/pillar/') || path.includes('/complete-guide')) {
    let assignedGroup: PageGroup = 'Tours';
    if (path.includes('safari')) assignedGroup = 'Safaris';
    else if (path.includes('cruise') || path.includes('shore')) assignedGroup = 'Shore Excursions';
    else if (path.includes('guide')) assignedGroup = 'Tour Guides';

    trace.push(`Priority 16 MATCH: Pillar Page (${assignedGroup})`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: assignedGroup,
      pageLevel: 'Pillar Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Country',
      sitemapCategory: 'Pillar Pages Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/pillar-pages.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 16: Pillar pages',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 17: Static pages
  // Condition: in Static Pages Sitemap
  // Marketing/policy/company -> Corporate and Informational / Static Informational Page
  // Account/auth/checkout/cart -> Utility / Utility Page
  // =========================================================================
  if (
    exactSitemapMatch?.category === 'Static Pages Sitemap' ||
    ['/about-us', '/how-it-works', '/terms-and-conditions', '/privacy-policy', '/careers', '/press', '/contact-us', '/help-center'].includes(path)
  ) {
    trace.push(`Priority 17 MATCH: Static Corporate and Informational Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Corporate and Informational',
      pageLevel: 'Static Informational Page',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Static Pages Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/static-pages.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 17: Static Informational Page',
      resolutionTrace: trace,
    };
  }

  // Utility pages (auth, booking, checkout)
  if (['/login', '/signup', '/cart', '/checkout', '/account', '/my-bookings', '/reset-password', '/session'].some(u => path.startsWith(u))) {
    trace.push(`Priority 17 MATCH: Utility Transactional/Auth Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Utility',
      pageLevel: 'Utility Page',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Not Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'None (Utility Application Route)',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 17: Utility Page',
      resolutionTrace: trace,
    };
  }

  // =========================================================================
  // PRIORITY 18: Other / Unclassified Fallback
  // =========================================================================
  trace.push(`Priority 18 MATCH: No exact sitemap or pattern matched -> Other / Unclassified`);
  return {
    landingPage: rawUrl,
    normalizedLandingPage: norm.normalizedUrl,
    normalizedPath: path,
    pageGroup: 'Other',
    pageLevel: 'Unclassified',
    geographicLevel: 'Unknown',
    sitemapCategory: 'Not Found in Sitemap',
    sitemapStatus: 'Not Found in Sitemap',
    urlClassificationMethod: 'Unclassified',
    sourceSitemap: 'None (Unmatched GSC Landing Page)',
    classificationReviewRequired: true,
    priorityRuleMatched: 'Priority 18: Other / Unclassified Fallback',
    reviewReason: 'URL does not match any known sitemap path, verified pattern, or standard directory structure',
    resolutionTrace: trace,
  };
}

// ==========================================
// 5. VALIDATION REPORT DATASETS
// ==========================================

// Report 1: Representative URL Classification Validation Dataset
export const CLASSIFICATION_VALIDATION_SAMPLES: UrlTaxonomyItem[] = [
  {
    id: 'val-1',
    landingPage: '/',
    normalizedLandingPage: '/',
    pageGroup: 'Homepage',
    pageLevel: 'Site Root',
    geographicLevel: 'Global',
    sitemapCategory: 'Not Found in Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: 'Site Root Manifest',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 142500,
    impressions: 4850000,
    ctr: 2.94,
    position: 1.0,
    priorityRuleMatched: 'Priority 1: Homepage',
  },
  {
    id: 'val-2',
    landingPage: '/tour-details/78912/rome-colosseum-forum-private-vip-tour?utm_source=gsc',
    normalizedLandingPage: '/tour-details/78912/rome-colosseum-forum-private-vip-tour',
    pageGroup: 'Tour Details',
    pageLevel: 'Tour Detail Page',
    geographicLevel: 'City',
    sitemapCategory: 'Tours Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/tours.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 18450,
    impressions: 320000,
    ctr: 5.77,
    position: 4.2,
    priorityRuleMatched: 'Priority 2: Tour detail pages',
  },
  {
    id: 'val-3',
    landingPage: '/tours/Italy/Rome/attractions/Colosseum/',
    normalizedLandingPage: '/tours/Italy/Rome/attractions/Colosseum',
    pageGroup: 'Attractions',
    pageLevel: 'Attraction Page',
    geographicLevel: 'City',
    sitemapCategory: 'Attractions Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/attractions.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 12100,
    impressions: 215000,
    ctr: 5.63,
    position: 5.8,
    priorityRuleMatched: 'Priority 3: Attraction pages',
  },
  {
    id: 'val-4',
    landingPage: '/tour-guides/France/Paris/attractions/Louvre-Museum',
    normalizedLandingPage: '/tour-guides/France/Paris/attractions/Louvre-Museum',
    pageGroup: 'Attractions',
    pageLevel: 'Attraction Guide Page',
    geographicLevel: 'City',
    sitemapCategory: 'Attractions Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/attractions.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 8940,
    impressions: 164000,
    ctr: 5.45,
    position: 6.1,
    priorityRuleMatched: 'Priority 3: Attraction pages',
  },
  {
    id: 'val-5',
    landingPage: '/tours/Italy/Civitavecchia/shore-ex-tours?cruise_port=civitavecchia',
    normalizedLandingPage: '/tours/Italy/Civitavecchia/shore-ex-tours',
    pageGroup: 'Shore Excursions',
    pageLevel: 'Cruise Destination / Port Page',
    geographicLevel: 'City',
    sitemapCategory: 'Areas Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: '/sitemaps/areas.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 22400,
    impressions: 390000,
    ctr: 5.74,
    position: 3.8,
    priorityRuleMatched: 'Priority 4: Cruise destination or port pages',
  },
  {
    id: 'val-6',
    landingPage: '/tours/essentials-tours',
    normalizedLandingPage: '/tours/essentials-tours',
    pageGroup: 'Essential Tours',
    pageLevel: 'Global Landing Page',
    geographicLevel: 'Global',
    sitemapCategory: 'Pillar Pages Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 9800,
    impressions: 195000,
    ctr: 5.03,
    position: 7.2,
    priorityRuleMatched: 'Priority 5: Essential Tours (Global)',
  },
  {
    id: 'val-7',
    landingPage: '/tours/Japan/Tokyo/essentials-tours',
    normalizedLandingPage: '/tours/Japan/Tokyo/essentials-tours',
    pageGroup: 'Essential Tours',
    pageLevel: 'City / Area Landing Page',
    geographicLevel: 'City',
    sitemapCategory: 'Areas Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: '/sitemaps/areas.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 14500,
    impressions: 260000,
    ctr: 5.58,
    position: 4.9,
    priorityRuleMatched: 'Priority 5: Essential Tours (Location)',
  },
  {
    id: 'val-8',
    landingPage: '/shore-excursions/royal-caribbean/wonder-of-the-seas',
    normalizedLandingPage: '/shore-excursions/royal-caribbean/wonder-of-the-seas',
    pageGroup: 'Shore Excursions',
    pageLevel: 'Cruise Ship Page',
    geographicLevel: 'Global',
    sitemapCategory: 'Cruise Ships Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/cruise_ships_sitemap.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 6200,
    impressions: 112000,
    ctr: 5.54,
    position: 4.5,
    priorityRuleMatched: 'Priority 6: Cruise ships',
  },
  {
    id: 'val-9',
    landingPage: '/shore-excursions/viking-ocean-cruises',
    normalizedLandingPage: '/shore-excursions/viking-ocean-cruises',
    pageGroup: 'Shore Excursions',
    pageLevel: 'Cruise Line Page',
    geographicLevel: 'Global',
    sitemapCategory: 'Cruise Lines Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/cruise_lines_sitemap.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 11800,
    impressions: 210000,
    ctr: 5.62,
    position: 4.1,
    priorityRuleMatched: 'Priority 7: Cruise lines',
  },
  {
    id: 'val-10',
    landingPage: '/tours/Italy/Rome/food-tours',
    normalizedLandingPage: '/tours/Italy/Rome/food-tours',
    pageGroup: 'Tours',
    pageLevel: 'Tour Category Page',
    geographicLevel: 'City',
    sitemapCategory: 'Areas Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: '/sitemaps/areas.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 15400,
    impressions: 280000,
    ctr: 5.50,
    position: 5.2,
    priorityRuleMatched: 'Priority 8: Tour category pages',
  },
  {
    id: 'val-11',
    landingPage: '/travel-blog/how-to-hire-private-tour-guide-in-italy',
    normalizedLandingPage: '/travel-blog/how-to-hire-private-tour-guide-in-italy',
    pageGroup: 'Travel Blog',
    pageLevel: 'Blog Post',
    geographicLevel: 'Not Applicable',
    sitemapCategory: 'Blogs Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/blogs.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 7400,
    impressions: 145000,
    ctr: 5.10,
    position: 6.4,
    priorityRuleMatched: 'Priority 9: Blog pages',
  },
  {
    id: 'val-12',
    landingPage: '/things-to-do/Rome',
    normalizedLandingPage: '/things-to-do/Rome',
    pageGroup: 'Things to Do',
    pageLevel: 'City Page',
    geographicLevel: 'City',
    sitemapCategory: 'Things to Do City Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/things-to-do-city.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 21200,
    impressions: 420000,
    ctr: 5.05,
    position: 6.8,
    priorityRuleMatched: 'Priority 10: Things to Do pages',
  },
  {
    id: 'val-13',
    landingPage: '/things-to-do/Italy',
    normalizedLandingPage: '/things-to-do/Italy',
    pageGroup: 'Things to Do',
    pageLevel: 'Country Page',
    geographicLevel: 'Country',
    sitemapCategory: 'Things to Do Country Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/things-to-do-country.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 16800,
    impressions: 340000,
    ctr: 4.94,
    position: 7.1,
    priorityRuleMatched: 'Priority 10: Things to Do pages',
  },
  {
    id: 'val-14',
    landingPage: '/guide-profile/29182/marco-rome-guide',
    normalizedLandingPage: '/guide-profile/29182/marco-rome-guide',
    pageGroup: 'Guide Profiles',
    pageLevel: 'Guide Profile Page',
    geographicLevel: 'Not Applicable',
    sitemapCategory: 'Guides Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/guides.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 5800,
    impressions: 98000,
    ctr: 5.92,
    position: 3.9,
    priorityRuleMatched: 'Priority 11: Guide profile pages',
  },
  {
    id: 'val-15',
    landingPage: '/tours/Italy/Tuscany',
    normalizedLandingPage: '/tours/Italy/Tuscany',
    pageGroup: 'Tours',
    pageLevel: 'Region Page',
    geographicLevel: 'Region',
    sitemapCategory: 'Regions Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/regions.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 19800,
    impressions: 360000,
    ctr: 5.50,
    position: 5.1,
    priorityRuleMatched: 'Priority 12: Regions Sitemap landing page',
  },
  {
    id: 'val-16',
    landingPage: '/safaris/Kenya',
    normalizedLandingPage: '/safaris/Kenya',
    pageGroup: 'Safaris',
    pageLevel: 'Country Page',
    geographicLevel: 'Country',
    sitemapCategory: 'Countries Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/countries.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 8400,
    impressions: 152000,
    ctr: 5.53,
    position: 5.3,
    priorityRuleMatched: 'Priority 14: Safari pages',
  },
  {
    id: 'val-17',
    landingPage: '/tours/italy/complete-private-guide',
    normalizedLandingPage: '/tours/italy/complete-private-guide',
    pageGroup: 'Tours',
    pageLevel: 'Pillar Page',
    geographicLevel: 'Country',
    sitemapCategory: 'Pillar Pages Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 13200,
    impressions: 240000,
    ctr: 5.50,
    position: 5.7,
    priorityRuleMatched: 'Priority 16: Pillar pages',
  },
  {
    id: 'val-18',
    landingPage: '/about-us',
    normalizedLandingPage: '/about-us',
    pageGroup: 'Corporate and Informational',
    pageLevel: 'Static Informational Page',
    geographicLevel: 'Not Applicable',
    sitemapCategory: 'Static Pages Sitemap',
    sitemapStatus: 'Found in Sitemap',
    urlClassificationMethod: 'Exact Sitemap Match',
    sourceSitemap: '/sitemaps/static-pages.xml',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 3400,
    impressions: 62000,
    ctr: 5.48,
    position: 3.1,
    priorityRuleMatched: 'Priority 17: Static pages',
  },
  {
    id: 'val-19',
    landingPage: '/my-bookings',
    normalizedLandingPage: '/my-bookings',
    pageGroup: 'Utility',
    pageLevel: 'Utility Page',
    geographicLevel: 'Not Applicable',
    sitemapCategory: 'Not Found in Sitemap',
    sitemapStatus: 'Not Found in Sitemap',
    urlClassificationMethod: 'Verified URL Pattern',
    sourceSitemap: 'None (Utility Application Route)',
    classificationReviewRequired: false,
    latestSitemapRetrievalDate: '2026-08-18',
    clicks: 1250,
    impressions: 18400,
    ctr: 6.79,
    position: 1.2,
    priorityRuleMatched: 'Priority 17: Utility Page',
  },
];

// Report 2: GSC Landing Pages Missing From Sitemaps
export const GSC_PAGES_MISSING_FROM_SITEMAPS: Array<{
  landingPage: string;
  pageGroup: PageGroup;
  pageLevel: PageLevel;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  auditCategoryNote: string;
  recommendedAction: string;
}> = [
  {
    landingPage: '/tours/search?location=rome&date=2026-09-01',
    pageGroup: 'Tours',
    pageLevel: 'Unclassified',
    clicks: 4320,
    impressions: 89400,
    ctr: 4.83,
    position: 7.8,
    auditCategoryNote: 'Internal search filter parameter URL. Correctly excluded from XML sitemaps to prevent crawling duplicate faceted navigation.',
    recommendedAction: 'Ensure noindex or canonical link tags point to clean directory URL /tours/Italy/Rome.',
  },
  {
    landingPage: '/login',
    pageGroup: 'Utility',
    pageLevel: 'Utility Page',
    clicks: 2980,
    impressions: 54000,
    ctr: 5.52,
    position: 1.8,
    auditCategoryNote: 'User authentication portal. Correctly excluded from XML sitemaps per search engine best practices.',
    recommendedAction: 'No action required; valid exclusion.',
  },
  {
    landingPage: '/tours/Italy/Bologna/cooking-class-special',
    pageGroup: 'Tours',
    pageLevel: 'City / Area / Region Page',
    clicks: 1850,
    impressions: 42100,
    ctr: 4.39,
    position: 8.6,
    auditCategoryNote: 'New seasonal landing page not yet added to areas.xml during recent deployment.',
    recommendedAction: 'Add to areas.xml or tours.xml in the next automated sitemap build.',
  },
  {
    landingPage: '/cart',
    pageGroup: 'Utility',
    pageLevel: 'Utility Page',
    clicks: 940,
    impressions: 16200,
    ctr: 5.80,
    position: 2.1,
    auditCategoryNote: 'Checkout transaction funnel page.',
    recommendedAction: 'Keep excluded from XML sitemaps; enforce noindex.',
  },
  {
    landingPage: '/tours/old-japan-guide-2024',
    pageGroup: 'Other',
    pageLevel: 'Unclassified',
    clicks: 420,
    impressions: 11300,
    ctr: 3.72,
    position: 14.2,
    auditCategoryNote: 'Legacy URL generating 301 redirect to /tours/Japan.',
    recommendedAction: 'Maintain 301 redirect; exclusion from sitemap is expected.',
  },
];

// Report 3: Sitemap URLs With No GSC Visibility
export const SITEMAP_URLS_WITH_NO_GSC_VISIBILITY: NoVisibilitySitemapUrl[] = [
  {
    sitemapUrl: '/tours/Norway/Svalbard/polar-bear-expedition',
    sitemapCategory: 'Tours Sitemap',
    pageGroup: 'Tour Details',
    pageLevel: 'Tour Detail Page',
    geographicLevel: 'City',
    indexingStatusNote: 'Niche arctic destination itinerary; 0 GSC impressions in 90-day window due to low seasonal search query volume (does not mean page is unindexed).',
  },
  {
    sitemapUrl: '/shore-excursions/hurtigruten/ms-roald-amundsen',
    sitemapCategory: 'Cruise Ships Sitemap',
    pageGroup: 'Shore Excursions',
    pageLevel: 'Cruise Ship Page',
    geographicLevel: 'Global',
    indexingStatusNote: 'Expedition cruise ship with summer-only Norwegian itineraries; valid sitemap presence ahead of booking cycle.',
  },
  {
    sitemapUrl: '/tour-guides/Chile/Easter-Island',
    sitemapCategory: 'Areas Sitemap',
    pageGroup: 'Tour Guides',
    pageLevel: 'Area Page',
    geographicLevel: 'Area',
    indexingStatusNote: 'Remote destination hub page; indexed by Google but received zero impressions during the selected date period.',
  },
  {
    sitemapUrl: '/guide-profile/89201/lars-tromso-northern-lights-guide',
    sitemapCategory: 'Guides Sitemap',
    pageGroup: 'Guide Profiles',
    pageLevel: 'Guide Profile Page',
    geographicLevel: 'Not Applicable',
    indexingStatusNote: 'Newly onboarded guide profile published 14 days ago; indexation verified via URL inspection, search volume pending winter season.',
  },
  {
    sitemapUrl: '/things-to-do/Liechtenstein',
    sitemapCategory: 'Things to Do Country Sitemap',
    pageGroup: 'Things to Do',
    pageLevel: 'Country Page',
    geographicLevel: 'Country',
    indexingStatusNote: 'Microstate landing page with ultra-low query volume.',
  },
];

// Report 4: URLs Found in Multiple Sitemaps
export const MULTI_SITEMAP_URLS: MultiSitemapUrl[] = [
  {
    normalizedUrl: '/tours/Italy/Rome/attractions/Colosseum',
    allSourceSitemaps: [
      '/sitemaps/attractions.xml',
      '/sitemaps/areas.xml',
    ],
    assignedPageGroup: 'Attractions',
    assignedPageLevel: 'Attraction Page',
    reviewStatus: 'Verified (Specific Override)',
    reason: 'Attraction template hierarchy overrides general Area sitemap entry per Priority 3 specification.',
  },
  {
    normalizedUrl: '/tours/italy/complete-private-guide',
    allSourceSitemaps: [
      '/sitemaps/pillar-pages.xml',
      '/sitemaps/countries.xml',
    ],
    assignedPageGroup: 'Tours',
    assignedPageLevel: 'Pillar Page',
    reviewStatus: 'Verified (Specific Override)',
    reason: 'Pillar Pages Sitemap takes precedence for dedicated comprehensive guides per Priority 16.',
  },
  {
    normalizedUrl: '/shore-excursions/royal-caribbean',
    allSourceSitemaps: [
      '/cruise_lines_sitemap.xml',
      '/sitemaps/areas.xml',
    ],
    assignedPageGroup: 'Shore Excursions',
    assignedPageLevel: 'Cruise Line Page',
    reviewStatus: 'Verified (Specific Override)',
    reason: 'Cruise Lines Sitemap is more specific than general Areas Sitemap.',
  },
  {
    normalizedUrl: '/about-us',
    allSourceSitemaps: [
      '/sitemaps/static-pages.xml (Entry 1)',
      '/sitemaps/static-pages.xml (Entry 2 - Duplicate index entry)',
    ],
    assignedPageGroup: 'Corporate and Informational',
    assignedPageLevel: 'Static Informational Page',
    reviewStatus: 'Conflict Resolved',
    reason: 'Static-pages.xml was listed twice in the root sitemap index; successfully deduplicated.',
  },
];

// Report 5: Unclassified URLs Requiring Review (Sorted by Impressions Descending)
export const UNCLASSIFIED_REVIEW_URLS: UnclassifiedReviewItem[] = [
  {
    landingPage: '/special-campaign/spring-blossom-promo-2026',
    clicks: 3420,
    impressions: 74200,
    ctr: 4.61,
    position: 8.9,
    sitemapStatus: 'Not Found in Sitemap',
    sourceSitemap: 'None (Temporary Campaign Subdirectory)',
    reasonClassificationFailed: 'URL contains non-standard prefix /special-campaign/ not mapped in taxonomy rules.',
    suggestedGroup: 'Corporate and Informational',
    suggestedLevel: 'Static Informational Page',
  },
  {
    landingPage: '/partner-portal/travel-agents-vip',
    clicks: 1840,
    impressions: 48500,
    ctr: 3.79,
    position: 11.2,
    sitemapStatus: 'Not Found in Sitemap',
    sourceSitemap: 'None (B2B Affiliate Route)',
    reasonClassificationFailed: 'B2B Partner sub-directory does not match B2C tours/guides taxonomy.',
    suggestedGroup: 'Corporate and Informational',
    suggestedLevel: 'Static Informational Page',
  },
  {
    landingPage: '/custom-itinerary-builder-v2',
    clicks: 1210,
    impressions: 31800,
    ctr: 3.81,
    position: 9.4,
    sitemapStatus: 'Not Found in Sitemap',
    sourceSitemap: 'None (Interactive Applet Feature)',
    reasonClassificationFailed: 'Interactive planning widget path not indexed in static/pillar sitemaps.',
    suggestedGroup: 'Utility',
    suggestedLevel: 'Utility Page',
  },
  {
    landingPage: '/explore/unmatched-query-hub',
    clicks: 650,
    impressions: 19400,
    ctr: 3.35,
    position: 13.8,
    sitemapStatus: 'Not Found in Sitemap',
    sourceSitemap: 'None (Legacy Directory)',
    reasonClassificationFailed: 'Prefix /explore/ is not an approved directory root.',
    suggestedGroup: 'Other',
    suggestedLevel: 'Unclassified',
  },
];

// Report 6: Pillar Pages Review Matrix
export const PILLAR_PAGES_REVIEW_DATA: PillarPageReviewItem[] = [
  {
    normalizedUrl: '/tours/italy/complete-private-guide',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    assignedPageGroup: 'Tours',
    assignedPageLevel: 'Pillar Page',
    geographicLevel: 'Country',
    contentTheme: 'National Italy Travel Authority Hub',
    strategicPurpose: 'Captures high-volume top-funnel discovery for Italy private tours, interlinking to Rome, Florence, Venice, and Amalfi hubs.',
  },
  {
    normalizedUrl: '/tours/japan/first-timers-travel-guide',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    assignedPageGroup: 'Tours',
    assignedPageLevel: 'Pillar Page',
    geographicLevel: 'Country',
    contentTheme: 'Japan Cultural Etiquette & Itinerary Hub',
    strategicPurpose: 'Targets first-time travelers to Tokyo, Kyoto, and Osaka with comprehensive planning advice and curated guide links.',
  },
  {
    normalizedUrl: '/tours/safaris/ultimate-african-safari-guide',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    assignedPageGroup: 'Safaris',
    assignedPageLevel: 'Pillar Page',
    geographicLevel: 'Global',
    contentTheme: 'African Wildlife & Private Safari Authority',
    strategicPurpose: 'Consolidates authority across Kenya, Tanzania, and South Africa safari itineraries with guide-led booking funnels.',
  },
  {
    normalizedUrl: '/tours/cruises/mediterranean-shore-excursion-planning',
    sourceSitemap: '/sitemaps/pillar-pages.xml',
    assignedPageGroup: 'Shore Excursions',
    assignedPageLevel: 'Pillar Page',
    geographicLevel: 'Region',
    contentTheme: 'Mediterranean Cruise Excursions Strategy',
    strategicPurpose: 'Ranks for competitive cruise planning queries, funneling travelers to port pages (Civitavecchia, Naples, Livorno, Barcelona).',
  },
];
