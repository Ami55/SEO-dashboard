/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PageGroup,
  PageLevel,
  GeographicLevel,
  SitemapCategory,
  SitemapStatus,
  UrlClassificationMethod,
} from '../types';

// =========================================================================
// 1. GSC DATA-SOURCE LEVEL CALCULATED DIMENSION FORMULAS (CASE REGEX)
// =========================================================================

export const GSC_PAGE_GROUP_CASE_SQL = `CASE
  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tours/essentials-tours/?($|\\\\?)"
  )
    THEN "Essential Tours"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tour-guides/?($|/|\\\\?)"
  )
    THEN "Tour Guides"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/shore-excursions/?($|/|\\\\?)"
  )
    THEN "Shore Excursions"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/safaris/?($|/|\\\\?)"
  )
    THEN "Safaris"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/travel-blog/?($|/|\\\\?)"
  )
    THEN "Travel Blog"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/things-to-do/?($|/|\\\\?)"
  )
    THEN "Things to Do"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tours/?($|/|\\\\?)"
  )
    THEN "Tours"

  ELSE "Other"
END`;

export const GSC_PAGE_LEVEL_CASE_SQL = `CASE
  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tours/essentials-tours/?($|\\\\?)"
  )
    THEN "Special Landing Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tours/[^/?]+/[^/?]+/tour-details/[^/?]+/?($|\\\\?)"
  )
    THEN "Tour Detail Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/(tours|tour-guides)/[^/?]+/[^/?]+/attractions/[^/?]+/?($|\\\\?)"
  )
    THEN "Attraction Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/tours/[^/?]+/[^/?]+/shore-ex-tours/?($|\\\\?)"
  )
    THEN "Cruise Destination Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/shore-excursions/[^/?]+/[^/?]+/?($|\\\\?)"
  )
    THEN "Cruise Ship Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/shore-excursions/[^/?]+/?($|\\\\?)"
  )
    THEN "Cruise Line Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/(tours|tour-guides)/[^/?]+/[^/?]+/[^/?]+-tours/?($|\\\\?)"
  )
    THEN "Tour Category Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/(tours|tour-guides)/?($|\\\\?)"
  )
    THEN "Directory Root"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/(tours|tour-guides)/[^/?]+/?($|\\\\?)"
  )
    THEN "Country Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/(tours|tour-guides)/[^/?]+/[^/?]+/?($|\\\\?)"
  )
    THEN "City or Area Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/things-to-do/?($|\\\\?)"
  )
    THEN "Directory Root"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/things-to-do/[^/?]+/?($|\\\\?)"
  )
    THEN "Country Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/things-to-do/[^/?]+/[^/?]+/?($|\\\\?)"
  )
    THEN "City or Area Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/travel-blog/?($|\\\\?)"
  )
    THEN "Directory Root"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/travel-blog/[^/?]+/?($|\\\\?)"
  )
    THEN "Blog Post"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/shore-excursions/?($|\\\\?)"
  )
    THEN "Directory Root"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/safaris/?($|\\\\?)"
  )
    THEN "Directory Root"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/safaris/[^/?]+/?($|\\\\?)"
  )
    THEN "Country Page"

  WHEN REGEXP_CONTAINS(
    Landing Page,
    "^https?://(www\\\\.)?toursbylocals\\\\.com/safaris/[^/?]+/[^/?]+/?($|\\\\?)"
  )
    THEN "City or Area Page"

  ELSE "Other"
END`;

/**
 * Executes the exact Looker Studio / BigQuery GSC Data-Source Level Calculated Field regex formula for Page Group.
 */
export function calculateGscPageGroup(landingPage: string): PageGroup {
  return classifyToursByLocalsUrl(landingPage).pageGroup;
}

/**
 * Executes the exact Looker Studio / BigQuery GSC Data-Source Level Calculated Field regex formula for Page Level.
 */
export function calculateGscPageLevel(landingPage: string): PageLevel {
  return classifyToursByLocalsUrl(landingPage).pageLevel;
}

/** Canonical ToursByLocals directory classifier. Specific templates are
 * evaluated before their parent directories to prevent detail, attraction,
 * and guide-profile URLs from being rolled into generic Tours/Tour Guides. */
export function classifyToursByLocalsUrl(landingPage: string): { pageGroup: PageGroup; pageLevel: PageLevel } {
  const url = landingPage.trim();
  const fullUrl = url.startsWith('http')
    ? url
    : `https://www.toursbylocals.com${url.startsWith('/') ? '' : '/'}${url}`;
  let segments: string[] = [];
  try {
    segments = new URL(fullUrl).pathname.split('/').filter(Boolean);
  } catch {
    return { pageGroup: 'Other', pageLevel: 'Other' };
  }

  if (segments.length === 0) return { pageGroup: 'Homepage', pageLevel: 'Site Root' };
  const [root] = segments;

  // Specific templates always win over their parent directory.
  if (segments.includes('tour-details')) {
    return { pageGroup: 'Tour Details', pageLevel: 'Tour Detail Page' };
  }
  if (segments.includes('attractions')) {
    return {
      pageGroup: 'Attractions',
      pageLevel: root === 'tour-guides' ? 'Attraction Guide Page' : 'Attraction Page',
    };
  }
  if (segments[segments.length - 1] === 'shore-ex-tours') {
    return { pageGroup: 'Shore Excursions', pageLevel: 'Cruise Destination / Port Page' };
  }
  if (segments[segments.length - 1] === 'essentials-tours') {
    return {
      pageGroup: 'Essential Tours',
      pageLevel: segments.length === 2 ? 'Global Landing Page' : 'City Landing Page',
    };
  }

  if (root === 'tours') {
    if (segments.length === 1) return { pageGroup: 'Tours', pageLevel: 'Directory Root' };
    if (segments.length === 2) return { pageGroup: 'Tours', pageLevel: 'Country Page' };
    if (segments.length === 3) return { pageGroup: 'Tours', pageLevel: 'City Page' };
    if (segments.length >= 4) return { pageGroup: 'Tours', pageLevel: 'Tour Category Page' };
  }

  if (root === 'tour-guides') {
    if (segments[3] === 'guide-profile' && segments[4]) return { pageGroup: 'Guide Profiles', pageLevel: 'Guide Profile Page' };
    if (segments.length === 1) return { pageGroup: 'Tour Guides', pageLevel: 'Directory Root' };
    if (segments.length === 2) return { pageGroup: 'Tour Guides', pageLevel: 'Country Page' };
    if (segments.length === 3) return { pageGroup: 'Tour Guides', pageLevel: 'City Page' };
    if (segments.length >= 4) return { pageGroup: 'Tour Guides', pageLevel: 'Tour Category Page' };
  }

  if (root === 'shore-excursions') {
    if (segments.length === 1) return { pageGroup: 'Shore Excursions', pageLevel: 'Directory Root' };
    if (segments[1] === 'cruise-lines') return { pageGroup: 'Shore Excursions', pageLevel: 'Cruise Line Page' };
    if (segments[1] === 'cruise-ships') return { pageGroup: 'Shore Excursions', pageLevel: 'Cruise Ship Page' };
    if (segments.length === 2) return { pageGroup: 'Shore Excursions', pageLevel: 'Cruise Line Page' };
    return { pageGroup: 'Shore Excursions', pageLevel: 'Cruise Destination / Port Page' };
  }

  if (root === 'safaris') {
    if (segments.length === 1) return { pageGroup: 'Safaris', pageLevel: 'Directory Root' };
    if (segments.length === 2) return { pageGroup: 'Safaris', pageLevel: 'Country Page' };
    return { pageGroup: 'Safaris', pageLevel: 'City Page' };
  }

  if (root === 'things-to-do') {
    if (segments.length === 1) return { pageGroup: 'Things to Do', pageLevel: 'Directory Root' };
    if (segments.length === 2) return { pageGroup: 'Things to Do', pageLevel: 'Country Page' };
    return { pageGroup: 'Things to Do', pageLevel: 'City Page' };
  }

  if (root === 'travel-blog') {
    return { pageGroup: 'Travel Blog', pageLevel: segments.length === 1 ? 'Directory Root' : 'Blog Post' };
  }

  if (['login', 'signup', 'help'].includes(root)) {
    return { pageGroup: 'Utility', pageLevel: 'Utility Page' };
  }

  if (['policy', 'become-a-guide', 'become-a-travel-agency', 'golden-guide-awards-2025'].includes(root)) {
    return { pageGroup: 'Corporate and Informational', pageLevel: 'Informational Page' };
  }

  return { pageGroup: 'Other', pageLevel: 'Other' };
  /* Legacy regex reference retained below for SQL parity documentation. */
  /*

  if (/^https?:\/\/(www\.)?toursbylocals\.com\/tours\/essentials-tours\/?($|\?)/i.test(fullUrl)) {
    return 'Special Landing Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/tours\/[^/?]+\/[^/?]+\/tour-details\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Tour Detail Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/(tours|tour-guides)\/[^/?]+\/[^/?]+\/attractions\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Attraction Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/tours\/[^/?]+\/[^/?]+\/shore-ex-tours\/?($|\?)/i.test(fullUrl)) {
    return 'Cruise Destination Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/shore-excursions\/[^/?]+\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Cruise Ship Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/shore-excursions\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Cruise Line Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/(tours|tour-guides)\/[^/?]+\/[^/?]+\/[^/?]+-tours\/?($|\?)/i.test(fullUrl)) {
    return 'Tour Category Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/(tours|tour-guides)\/?($|\?)/i.test(fullUrl)) {
    return 'Directory Root';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/(tours|tour-guides)\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Country Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/(tours|tour-guides)\/[^/?]+\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'City or Area Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/things-to-do\/?($|\?)/i.test(fullUrl)) {
    return 'Directory Root';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/things-to-do\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Country Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/things-to-do\/[^/?]+\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'City or Area Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/travel-blog\/?($|\?)/i.test(fullUrl)) {
    return 'Directory Root';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/travel-blog\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Blog Post';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/shore-excursions\/?($|\?)/i.test(fullUrl)) {
    return 'Directory Root';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/safaris\/?($|\?)/i.test(fullUrl)) {
    return 'Directory Root';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/safaris\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'Country Page';
  }
  if (/^https?:\/\/(www\.)?toursbylocals\.com\/safaris\/[^/?]+\/[^/?]+\/?($|\?)/i.test(fullUrl)) {
    return 'City or Area Page';
  }
  return 'Other'; */
}

// =========================================================================
// 2. CANONICAL URL NORMALIZATION
// =========================================================================

export interface NormalizedUrlResult {
  rawUrl: string;
  normalizedUrl: string;
  normalizedPath: string;
  hostname: string;
  queryParamsRemoved: string[];
  fragmentRemoved?: string;
  trailingSlashRemoved: boolean;
  isHomepage: boolean;
}

export function normalizeLandingPage(rawUrl: string): NormalizedUrlResult {
  if (!rawUrl) {
    return {
      rawUrl: '',
      normalizedUrl: '/',
      normalizedPath: '/',
      hostname: 'www.toursbylocals.com',
      queryParamsRemoved: [],
      trailingSlashRemoved: false,
      isHomepage: true,
    };
  }

  let working = rawUrl.trim();
  let hostname = 'www.toursbylocals.com';
  let queryParamsRemoved: string[] = [];
  let fragmentRemoved: string | undefined = undefined;

  // Extract and strip fragment (#)
  const hashIdx = working.indexOf('#');
  if (hashIdx !== -1) {
    fragmentRemoved = working.slice(hashIdx + 1);
    working = working.slice(0, hashIdx);
  }

  // Extract and strip query params (?)
  const queryIdx = working.indexOf('?');
  if (queryIdx !== -1) {
    const qStr = working.slice(queryIdx + 1);
    queryParamsRemoved = qStr
      .split('&')
      .map((pair) => pair.split('=')[0])
      .filter(Boolean);
    working = working.slice(0, queryIdx);
  }

  // Extract path from full URL or relative path
  let path = working;
  if (working.startsWith('http://') || working.startsWith('https://')) {
    try {
      const parsed = new URL(working);
      hostname = parsed.hostname.toLowerCase();
      path = parsed.pathname;
    } catch {
      const match = working.match(/^https?:\/\/([^/]+)(.*)$/i);
      if (match) {
        hostname = match[1].toLowerCase();
        path = match[2] || '/';
      }
    }
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  let trailingSlashRemoved = false;
  const isHomepage = path === '/' || path === '';

  if (!isHomepage && path.endsWith('/')) {
    path = path.slice(0, -1);
    trailingSlashRemoved = true;
  }

  if (!path) {
    path = '/';
  }

  return {
    rawUrl,
    normalizedUrl: path,
    normalizedPath: path,
    hostname,
    queryParamsRemoved,
    fragmentRemoved,
    trailingSlashRemoved,
    isHomepage: path === '/',
  };
}

// =========================================================================
// 3. 23-PRIORITY REVISED TAXONOMY RESOLUTION ENGINE
// =========================================================================

export interface ClassificationResolutionResult {
  landingPage: string;
  normalizedLandingPage: string;
  normalizedPath: string;
  pageGroup: PageGroup;
  pageLevel: PageLevel;
  calculatedGscPageGroup: PageGroup;
  calculatedGscPageLevel: PageLevel;
  geographicLevel: GeographicLevel;
  sitemapCategory: SitemapCategory;
  sitemapStatus: SitemapStatus;
  urlClassificationMethod: UrlClassificationMethod;
  sourceSitemap: string;
  classificationReviewRequired: boolean;
  priorityRuleMatched: string;
  priorityNumber: number;
  reviewReason?: string;
  resolutionTrace: string[];
}

export function classifyWith23Priorities(
  rawUrl: string,
  sitemapLookup: Record<string, { category: SitemapCategory; sitemapUrl: string; geoLevel?: GeographicLevel; defaultPageLevel?: PageLevel }> = {}
): ClassificationResolutionResult {
  const norm = normalizeLandingPage(rawUrl);
  const path = norm.normalizedPath;
  const trace: string[] = [];

  const calcGroup = calculateGscPageGroup(rawUrl);
  const calcLevel = calculateGscPageLevel(rawUrl);

  trace.push(`1. Normalized URL: "${rawUrl}" -> Path: "${path}"`);
  trace.push(`2. Evaluated GSC Calculated Dimension: Page Group="${calcGroup}", Page Level="${calcLevel}"`);

  const exactSitemapMatch = sitemapLookup[path];
  if (exactSitemapMatch) {
    trace.push(`3. Sitemap Lookup Match: ${exactSitemapMatch.category} (${exactSitemapMatch.sitemapUrl})`);
  }

  // Priority 1: Path equals /
  if (path === '/') {
    trace.push(`Priority 1 MATCH: Path equals '/' -> Homepage / Site Root`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Homepage',
      pageLevel: 'Site Root',
      calculatedGscPageGroup: calcGroup,
      calculatedGscPageLevel: calcLevel,
      geographicLevel: 'Global',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'Site Root Manifest',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 1: Homepage (Path equals /)',
      priorityNumber: 1,
      resolutionTrace: trace,
    };
  }

  // Priority 2: Contains /tour-details/
  if (path.includes('/tour-details/')) {
    trace.push(`Priority 2 MATCH: Contains /tour-details/ -> Tour Details / Tour Detail Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Tour Details',
      pageLevel: 'Tour Detail Page',
      calculatedGscPageGroup: calcGroup === 'Other' ? 'Tours' : calcGroup,
      calculatedGscPageLevel: calcLevel,
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: 'Tours Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/tours.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 2: Contains /tour-details/ (Tour Details / Tour Detail Page)',
      priorityNumber: 2,
      resolutionTrace: trace,
    };
  }

  // Priority 3: Contains /attractions/ under /tour-guides/
  if (path.startsWith('/tour-guides/') && path.includes('/attractions/')) {
    trace.push(`Priority 3 MATCH: Contains /attractions/ under /tour-guides/ -> Attractions / Attraction Guide Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Attractions',
      pageLevel: 'Attraction Guide Page',
      calculatedGscPageGroup: calcGroup,
      calculatedGscPageLevel: calcLevel,
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: 'Attractions Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/attractions.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 3: Contains /attractions/ under /tour-guides/ (Attraction Guide Page)',
      priorityNumber: 3,
      resolutionTrace: trace,
    };
  }

  // Priority 4: Contains /attractions/ under /tours/
  if (path.startsWith('/tours/') && path.includes('/attractions/')) {
    trace.push(`Priority 4 MATCH: Contains /attractions/ under /tours/ -> Attractions / Attraction Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Attractions',
      pageLevel: 'Attraction Page',
      calculatedGscPageGroup: calcGroup,
      calculatedGscPageLevel: calcLevel,
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: 'Attractions Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/attractions.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 4: Contains /attractions/ under /tours/ (Attraction Page)',
      priorityNumber: 4,
      resolutionTrace: trace,
    };
  }

  // Priority 5: Ends with /shore-ex-tours
  if (path.endsWith('/shore-ex-tours')) {
    trace.push(`Priority 5 MATCH: Ends with /shore-ex-tours -> Shore Excursions / Cruise Destination / Port Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Destination / Port Page',
      calculatedGscPageGroup: calcGroup === 'Other' ? 'Shore Excursions' : calcGroup,
      calculatedGscPageLevel: 'Cruise Destination Page',
      geographicLevel: 'City',
      sitemapCategory: 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 5: Ends with /shore-ex-tours (Cruise Destination / Port Page)',
      priorityNumber: 5,
      resolutionTrace: trace,
    };
  }

  // Priority 6: Exact /tours/essentials-tours
  if (path === '/tours/essentials-tours') {
    trace.push(`Priority 6 MATCH: Exact /tours/essentials-tours -> Essential Tours / Global Landing Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Essential Tours',
      pageLevel: 'Global Landing Page',
      calculatedGscPageGroup: 'Essential Tours',
      calculatedGscPageLevel: 'Special Landing Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Pillar Pages Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/pillar-pages.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 6: Exact /tours/essentials-tours (Global Landing Page)',
      priorityNumber: 6,
      resolutionTrace: trace,
    };
  }

  // Priority 7: Geographic path ending /essentials-tours
  if (path.endsWith('/essentials-tours')) {
    trace.push(`Priority 7 MATCH: Geographic path ending /essentials-tours -> Essential Tours / City / Area Landing Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Essential Tours',
      pageLevel: 'City / Area Landing Page',
      calculatedGscPageGroup: 'Essential Tours',
      calculatedGscPageLevel: 'City or Area Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'City',
      sitemapCategory: exactSitemapMatch?.category || 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: exactSitemapMatch?.sitemapUrl || '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 7: Geographic path ending /essentials-tours (City / Area Landing Page)',
      priorityNumber: 7,
      resolutionTrace: trace,
    };
  }

  // Priority 8: /shore-excursions/cruise-line/{slug}
  if (path.startsWith('/shore-excursions/cruise-line/')) {
    trace.push(`Priority 8 MATCH: /shore-excursions/cruise-line/{slug} -> Shore Excursions / Cruise Ship / Sailing Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Ship / Sailing Page',
      calculatedGscPageGroup: 'Shore Excursions',
      calculatedGscPageLevel: 'Cruise Ship Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Cruise Ships Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/cruise_ships_sitemap.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 8: /shore-excursions/cruise-line/{slug} (Cruise Ship / Sailing Page)',
      priorityNumber: 8,
      resolutionTrace: trace,
    };
  }

  // Priority 9: /shore-excursions/{line}/{ship}
  if (path.startsWith('/shore-excursions/') && path.split('/').filter(Boolean).length === 3) {
    trace.push(`Priority 9 MATCH: /shore-excursions/{line}/{ship} -> Shore Excursions / Cruise Ship / Sailing Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Ship / Sailing Page',
      calculatedGscPageGroup: 'Shore Excursions',
      calculatedGscPageLevel: 'Cruise Ship Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Cruise Ships Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/cruise_ships_sitemap.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 9: /shore-excursions/{line}/{ship} (Cruise Ship / Sailing Page)',
      priorityNumber: 9,
      resolutionTrace: trace,
    };
  }

  // Priority 10: /shore-excursions/{line}
  if (path.startsWith('/shore-excursions/') && path !== '/shore-excursions' && path.split('/').filter(Boolean).length === 2) {
    trace.push(`Priority 10 MATCH: /shore-excursions/{line} -> Shore Excursions / Cruise Line Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Shore Excursions',
      pageLevel: 'Cruise Line Page',
      calculatedGscPageGroup: 'Shore Excursions',
      calculatedGscPageLevel: 'Cruise Line Page',
      geographicLevel: 'Global',
      sitemapCategory: 'Cruise Lines Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/cruise_lines_sitemap.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 10: /shore-excursions/{line} (Cruise Line Page)',
      priorityNumber: 10,
      resolutionTrace: trace,
    };
  }

  // Priority 11: Tour path ending -tours
  if (
    (path.startsWith('/tours/') || path.startsWith('/tour-guides/')) &&
    path.endsWith('-tours') &&
    !path.endsWith('/shore-ex-tours') &&
    !path.endsWith('/essentials-tours')
  ) {
    const isGuides = path.startsWith('/tour-guides/');
    trace.push(`Priority 11 MATCH: Tour path ending -tours -> Tour Category Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: isGuides ? 'Tour Guides' : 'Tours',
      pageLevel: 'Tour Category Page',
      calculatedGscPageGroup: isGuides ? 'Tour Guides' : 'Tours',
      calculatedGscPageLevel: 'Tour Category Page',
      geographicLevel: path.split('/').filter(Boolean).length >= 3 ? 'City' : 'Country',
      sitemapCategory: 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 11: Tour path ending -tours (Tour Category Page)',
      priorityNumber: 11,
      resolutionTrace: trace,
    };
  }

  // Priority 12: /travel-blog/{slug}
  if (path.startsWith('/travel-blog/') && path !== '/travel-blog') {
    trace.push(`Priority 12 MATCH: /travel-blog/{slug} -> Travel Blog / Blog Post`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Travel Blog',
      pageLevel: 'Blog Post',
      calculatedGscPageGroup: 'Travel Blog',
      calculatedGscPageLevel: 'Blog Post',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Blogs Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/blogs.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 12: /travel-blog/{slug} (Blog Post)',
      priorityNumber: 12,
      resolutionTrace: trace,
    };
  }

  // Priority 13: /things-to-do/{country}/{location}
  if (path.startsWith('/things-to-do/') && path.split('/').filter(Boolean).length >= 3) {
    trace.push(`Priority 13 MATCH: /things-to-do/{country}/{location} -> Things to Do / City / Area / Region Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: 'City / Area / Region Page',
      calculatedGscPageGroup: 'Things to Do',
      calculatedGscPageLevel: 'City or Area Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Unknown',
      sitemapCategory: 'Things to Do City Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/things-to-do-city.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 13: /things-to-do/{country}/{location} (City / Area / Region Page)',
      priorityNumber: 13,
      resolutionTrace: trace,
    };
  }

  // Priority 14: /things-to-do/{country}
  if (path.startsWith('/things-to-do/') && path.split('/').filter(Boolean).length === 2) {
    trace.push(`Priority 14 MATCH: /things-to-do/{country} -> Things to Do / Country Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Things to Do',
      pageLevel: 'Country Page',
      calculatedGscPageGroup: 'Things to Do',
      calculatedGscPageLevel: 'Country Page',
      geographicLevel: 'Country',
      sitemapCategory: 'Things to Do Country Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/things-to-do-country.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 14: /things-to-do/{country} (Country Page)',
      priorityNumber: 14,
      resolutionTrace: trace,
    };
  }

  // Priority 15: /safaris/{country}/{location}
  if (path.startsWith('/safaris/') && path.split('/').filter(Boolean).length >= 3) {
    trace.push(`Priority 15 MATCH: /safaris/{country}/{location} -> Safaris / City / Area / Region Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Safaris',
      pageLevel: 'City / Area / Region Page',
      calculatedGscPageGroup: 'Safaris',
      calculatedGscPageLevel: 'City or Area Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Unknown',
      sitemapCategory: 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Directory Fallback',
      sourceSitemap: '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 15: /safaris/{country}/{location} (City / Area / Region Page)',
      priorityNumber: 15,
      resolutionTrace: trace,
    };
  }

  // Priority 16: /safaris/{country}
  if (path.startsWith('/safaris/') && path.split('/').filter(Boolean).length === 2) {
    trace.push(`Priority 16 MATCH: /safaris/{country} -> Safaris / Country Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Safaris',
      pageLevel: 'Country Page',
      calculatedGscPageGroup: 'Safaris',
      calculatedGscPageLevel: 'Country Page',
      geographicLevel: 'Country',
      sitemapCategory: 'Countries Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/countries.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 16: /safaris/{country} (Country Page)',
      priorityNumber: 16,
      resolutionTrace: trace,
    };
  }

  // Priority 17: /tours/{country}/{location}
  if (path.startsWith('/tours/') && path.split('/').filter(Boolean).length >= 3) {
    trace.push(`Priority 17 MATCH: /tours/{country}/{location} -> Tours / City / Area / Region Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Tours',
      pageLevel: 'City / Area / Region Page',
      calculatedGscPageGroup: 'Tours',
      calculatedGscPageLevel: 'City or Area Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Unknown',
      sitemapCategory: exactSitemapMatch?.category || 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Directory Fallback',
      sourceSitemap: exactSitemapMatch?.sitemapUrl || '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 17: /tours/{country}/{location} (City / Area / Region Page)',
      priorityNumber: 17,
      resolutionTrace: trace,
    };
  }

  // Priority 18: /tour-guides/{country}/{location}
  if (path.startsWith('/tour-guides/') && path.split('/').filter(Boolean).length >= 3) {
    trace.push(`Priority 18 MATCH: /tour-guides/{country}/{location} -> Tour Guides / City / Area / Region Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Tour Guides',
      pageLevel: 'City / Area / Region Page',
      calculatedGscPageGroup: 'Tour Guides',
      calculatedGscPageLevel: 'City or Area Page',
      geographicLevel: exactSitemapMatch?.geoLevel || 'Unknown',
      sitemapCategory: exactSitemapMatch?.category || 'Areas Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Directory Fallback',
      sourceSitemap: exactSitemapMatch?.sitemapUrl || '/sitemaps/areas.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 18: /tour-guides/{country}/{location} (City / Area / Region Page)',
      priorityNumber: 18,
      resolutionTrace: trace,
    };
  }

  // Priority 19: Directory plus country
  if (
    (path.startsWith('/tours/') || path.startsWith('/tour-guides/')) &&
    path.split('/').filter(Boolean).length === 2
  ) {
    const isGuides = path.startsWith('/tour-guides/');
    const group: PageGroup = isGuides ? 'Tour Guides' : 'Tours';
    trace.push(`Priority 19 MATCH: Directory plus country -> ${group} / Country Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: group,
      pageLevel: 'Country Page',
      calculatedGscPageGroup: group,
      calculatedGscPageLevel: 'Country Page',
      geographicLevel: 'Country',
      sitemapCategory: 'Countries Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/countries.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: `Priority 19: Directory plus country (${group} Country Page)`,
      priorityNumber: 19,
      resolutionTrace: trace,
    };
  }

  // Priority 20: Exact directory root
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
    trace.push(`Priority 20 MATCH: Exact directory root '${path}' -> ${rootInfo.group} / Directory Root`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: rootInfo.group,
      pageLevel: rootInfo.level,
      calculatedGscPageGroup: rootInfo.group,
      calculatedGscPageLevel: 'Directory Root',
      geographicLevel: 'Global',
      sitemapCategory: 'Not Found in Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: 'Verified URL Pattern',
      sourceSitemap: 'Directory Root Manifest',
      classificationReviewRequired: false,
      priorityRuleMatched: `Priority 20: Exact directory root (${path})`,
      priorityNumber: 20,
      resolutionTrace: trace,
    };
  }

  // Priority 21: Confirmed guide-profile pattern
  if (exactSitemapMatch?.category === 'Guides Sitemap' || path.startsWith('/guide-profile/') || path.startsWith('/guides/')) {
    trace.push(`Priority 21 MATCH: Confirmed guide-profile pattern -> Guide Profiles / Guide Profile Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Guide Profiles',
      pageLevel: 'Guide Profile Page',
      calculatedGscPageGroup: calcGroup,
      calculatedGscPageLevel: calcLevel,
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Guides Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/guides.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 21: Confirmed guide-profile pattern (Guide Profile Page)',
      priorityNumber: 21,
      resolutionTrace: trace,
    };
  }

  // Priority 22: Other indexable informational paths
  if (
    exactSitemapMatch?.category === 'Static Pages Sitemap' ||
    [
      '/why-choose-tours-by-locals',
      '/become-a-guide',
      '/become-a-travel-agency',
      '/about-us',
      '/how-it-works',
      '/terms-and-conditions',
      '/privacy-policy',
      '/careers',
      '/press',
      '/contact-us',
      '/help-center',
    ].some((p) => path === p || path.startsWith(p + '/'))
  ) {
    trace.push(`Priority 22 MATCH: Other indexable informational path -> Corporate and Informational / Informational Page`);
    return {
      landingPage: rawUrl,
      normalizedLandingPage: norm.normalizedUrl,
      normalizedPath: path,
      pageGroup: 'Corporate and Informational',
      pageLevel: 'Informational Page',
      calculatedGscPageGroup: 'Other',
      calculatedGscPageLevel: 'Other',
      geographicLevel: 'Not Applicable',
      sitemapCategory: 'Static Pages Sitemap',
      sitemapStatus: 'Found in Sitemap',
      urlClassificationMethod: exactSitemapMatch ? 'Exact Sitemap Match' : 'Verified URL Pattern',
      sourceSitemap: '/sitemaps/static-pages.xml',
      classificationReviewRequired: false,
      priorityRuleMatched: 'Priority 22: Other indexable informational paths (Informational Page)',
      priorityNumber: 22,
      resolutionTrace: trace,
    };
  }

  // Priority 23: Anything unmatched
  trace.push(`Priority 23 MATCH: Anything unmatched -> Other / Unclassified`);
  return {
    landingPage: rawUrl,
    normalizedLandingPage: norm.normalizedUrl,
    normalizedPath: path,
    pageGroup: 'Other',
    pageLevel: 'Unclassified',
    calculatedGscPageGroup: calcGroup,
    calculatedGscPageLevel: calcLevel,
    geographicLevel: 'Unknown',
    sitemapCategory: 'Not Found in Sitemap',
    sitemapStatus: 'Not Found in Sitemap',
    urlClassificationMethod: 'Unclassified',
    sourceSitemap: 'None (Unmatched GSC Landing Page)',
    classificationReviewRequired: true,
    priorityRuleMatched: 'Priority 23: Anything unmatched (Other / Unclassified)',
    priorityNumber: 23,
    reviewReason: 'URL does not match any known sitemap path, verified pattern, or standard directory structure',
    resolutionTrace: trace,
  };
}
