/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// URL TAXONOMY SPECIFICATION TYPES
// ==========================================

export type PageGroup =
  | 'Homepage'
  | 'Tours'
  | 'Tour Guides'
  | 'Guide Profiles'
  | 'Tour Details'
  | 'Attractions'
  | 'Shore Excursions'
  | 'Safaris'
  | 'Travel Blog'
  | 'Things to Do'
  | 'Essential Tours'
  | 'Corporate and Informational'
  | 'Utility'
  | 'Other';

export type PageLevel =
  | 'Site Root'
  | 'Directory Root'
  | 'Country Page'
  | 'Region Page'
  | 'Area Page'
  | 'City Page'
  | 'City or Area Page'
  | 'City / Area / Region Page'
  | 'Guide Profile Page'
  | 'Tour Detail Page'
  | 'Attraction Page'
  | 'Attraction Guide Page'
  | 'Cruise Line Page'
  | 'Cruise Ship Page'
  | 'Cruise Ship / Sailing Page'
  | 'Cruise Destination Page'
  | 'Cruise Destination / Port Page'
  | 'Special Landing Page'
  | 'Global Landing Page'
  | 'City / Area Landing Page'
  | 'City Landing Page'
  | 'Tour Category Page'
  | 'Blog Post'
  | 'Pillar Page'
  | 'Informational Page'
  | 'Static Informational Page'
  | 'Utility Page'
  | 'Unclassified'
  | 'Other';

export type SitemapCategory =
  | 'Countries Sitemap'
  | 'Regions Sitemap'
  | 'Areas Sitemap'
  | 'Guides Sitemap'
  | 'Attractions Sitemap'
  | 'Tours Sitemap'
  | 'Blogs Sitemap'
  | 'Static Pages Sitemap'
  | 'Cruise Lines Sitemap'
  | 'Cruise Ships Sitemap'
  | 'Pillar Pages Sitemap'
  | 'Things to Do City Sitemap'
  | 'Things to Do Country Sitemap'
  | 'Not Found in Sitemap';

export type GeographicLevel =
  | 'Global'
  | 'Country'
  | 'Region'
  | 'Area'
  | 'City'
  | 'Not Applicable'
  | 'Unknown';

export type UrlClassificationMethod =
  | 'Exact Sitemap Match'
  | 'Verified URL Pattern'
  | 'Directory Fallback'
  | 'Unclassified';

export type SitemapStatus =
  | 'Found in Sitemap'
  | 'Not Found in Sitemap'
  | 'Found in Multiple Sitemaps'
  | 'Sitemap Unavailable'
  | 'Requires Review';

// Backward compatibility aliases
export type TblPageGroup = PageGroup | string;
export type TblPageLevel = PageLevel | string;

export type QueryType = 'Branded' | 'Non-Branded';

export type QueryTheme =
  | 'City Tours & Sightseeing'
  | 'Private Guide Services'
  | 'Shore Excursions & Cruise Ports'
  | 'Food & Wine Tastings'
  | 'Day Trips & Excursions'
  | 'Walking & Historical Tours'
  | 'Custom & Family Itineraries'
  | 'Safaris & Nature'
  | 'Unclassified Query Theme';

export interface GscMetricScorecard {
  label: string;
  currentValue: string | number;
  previousValue: string | number;
  changeValue: string | number;
  percentageChange: number;
  isPositive: boolean;
  tooltipText?: string;
  isPositionMetric?: boolean;
}

export type DashboardSectionId =
  | 'executive'
  | 'performance'
  | 'pages'
  | 'queries'
  | 'geo-device'
  | 'page-group-level'
  | 'category-performance-matrix'
  | 'taxonomy'
  | 'methodology';

export type ActiveTab =
  | 'executive'
  | 'performance'
  | 'pages'
  | 'queries'
  | 'geo-device'
  | 'page-group-level'
  | 'category-performance-matrix'
  | 'taxonomy'
  | 'methodology'
  | 'executive-summary'
  | 'search-performance'
  | 'page-directory'
  | 'query-opportunities'
  | 'geographic-device'
  | 'sitemap-taxonomy'
  // Dedicated 19 Report Menu IDs (from screenshots):
  | 'perf-page-group-landing'
  | 'search-query-performance'
  | 'trend-page-group'
  | 'search-demand-query-theme'
  | 'seo-winners-decliners'
  | 'perf-searcher-country'
  | 'top-10-pages-clicks'
  | 'query-page-ranking'
  | 'seo-quick-wins'
  | 'organic-traffic-concentration'
  | 'non-branded-opportunities'
  | 'high-imp-below-p1'
  | 'branded-vs-non-branded'
  | 'high-vis-zero-clicks'
  | 'low-ctr-opportunities'
  | 'keyword-cannibalization'
  | 'top-10-search-visibility'
  | 'unclassified-urls'
  | 'clicks-by-device'
  | 'google-algorithm-updates'
  | 'custom-insights'
  | 'insight-wrap-up'
  | 'gsc-calculated-dimensions'
  | 'upload-data'
  | 'bulk-seo-opportunities';

export interface GoogleAlgorithmUpdateEvent {
  id: string;
  name: string;
  updateType: 'Core Update' | 'Helpful Content Update' | 'Spam Update' | 'Reviews Update' | 'AI Overviews Update' | 'Unconfirmed Volatility' | 'Custom Update';
  startDate: string;
  endDate: string;
  startTime?: string; // e.g. "14:00 UTC"
  endTime?: string;   // e.g. "18:30 UTC"
  status?: 'Completed' | 'In Progress' | 'Scheduled' | 'Announced';
  rolloutDurationDays?: number;
  isCustom?: boolean;
  prePeriodLabel: string;
  postPeriodLabel: string;
  description: string;
  primaryFocus: string;
  impactVerdict: 'Positive Gain' | 'Moderate Gain' | 'Neutral / Stable' | 'Moderate Decline' | 'Severe Impact';
  overallScore: number; // e.g. +14.2%
  preClicks: number;
  postClicks: number;
  preImpressions: number;
  postImpressions: number;
  preCtr: number;
  postCtr: number;
  prePosition: number;
  postPosition: number;
  pageGroupImpacts: {
    group: string;
    preClicks: number;
    postClicks: number;
    pctChange: number;
    prePosition: number;
    postPosition: number;
    status: 'Gained' | 'Lost' | 'Stable';
  }[];
  topUrlShifts: {
    page: string;
    group: string;
    preClicks: number;
    postClicks: number;
    clickDelta: number;
    pctDelta: number;
    prePosition: number;
    postPosition: number;
    diagnosis: string;
  }[];
  serpQueryShifts: {
    query: string;
    prePosition: number;
    postPosition: number;
    positionDelta: number;
    preClicks: number;
    postClicks: number;
    landingPage: string;
    impact: 'Jumped to Top 3' | 'Entered Page 1' | 'Fell to Page 2' | 'Position Preserved';
  }[];
  actionPlan: string[];
  timelinePoints: {
    date: string;
    clicks: number;
    position: number;
    isRollout: boolean;
    isStartRelease?: boolean;
    isEndRelease?: boolean;
    annotation?: string;
  }[];
}

export interface DashboardFilterState {
  datePreset?: string;
  comparisonPreset?: string;
  searchQueryFilter?: string;
  dateRange: 'LAST_28_DAYS' | 'LAST_3_MONTHS' | 'LAST_6_MONTHS' | 'LAST_12_MONTHS' | 'LAST_16_MONTHS' | 'CUSTOM';
  comparisonPeriod: 'PREVIOUS_PERIOD' | 'PREVIOUS_YEAR' | 'NONE';
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
  pageGroup: string;
  pageLevel: string;
  selectedPageGroups?: string[];
  selectedPageLevels?: string[];
  queryType: string;
  queryTheme: string;
  country: string;
  device: string;
  searchType: string;
  sitemapCategory?: string;
  sitemapStatus?: string;
  classificationMethod?: string;
  minImpressions: number;
  minClicks: number;
  positionMin: number;
  positionMax: number;
}

// Full Taxonomy Classified URL Interface
export interface UrlTaxonomyItem {
  id: string;
  landingPage: string;
  normalizedLandingPage: string;
  pageGroup: PageGroup;
  pageLevel: PageLevel;
  geographicLevel: GeographicLevel;
  sitemapCategory: SitemapCategory;
  sitemapStatus: SitemapStatus;
  urlClassificationMethod: UrlClassificationMethod;
  sourceSitemap: string;
  classificationReviewRequired: boolean;
  latestSitemapRetrievalDate: string;
  lastmodDate?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks?: number;
  prevImpressions?: number;
  prevCtr?: number;
  prevPosition?: number;
  priorityRuleMatched?: string;
  reviewReason?: string;
}

// Sitemap Audit Interface
export interface SitemapAuditEntry {
  sitemapUrl: string;
  category: SitemapCategory;
  urlCount: number;
  status: 'Audited & Verified' | 'Deduplicated' | 'Warning' | 'Error';
  retrievalDate: string;
  latestLastmod: string;
  notes: string;
  sampleUrls: string[];
}

export interface MultiSitemapUrl {
  normalizedUrl: string;
  allSourceSitemaps: string[];
  assignedPageGroup: PageGroup;
  assignedPageLevel: PageLevel;
  reviewStatus: 'Verified (Specific Override)' | 'Requires Review' | 'Conflict Resolved';
  reason: string;
}

export interface UnclassifiedReviewItem {
  landingPage: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  sitemapStatus: SitemapStatus;
  sourceSitemap: string;
  reasonClassificationFailed: string;
  suggestedGroup?: PageGroup;
  suggestedLevel?: PageLevel;
}

export interface NoVisibilitySitemapUrl {
  sitemapUrl: string;
  sitemapCategory: SitemapCategory;
  pageGroup: PageGroup;
  pageLevel: PageLevel;
  geographicLevel: GeographicLevel;
  indexingStatusNote: string;
}

export interface PillarPageReviewItem {
  normalizedUrl: string;
  sourceSitemap: string;
  assignedPageGroup: PageGroup;
  assignedPageLevel: PageLevel;
  geographicLevel: GeographicLevel;
  contentTheme: string;
  strategicPurpose: string;
}

export interface TblPageItem {
  id: string;
  page: string;
  pageGroup: TblPageGroup;
  pageLevel: TblPageLevel;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
  prevImpressions: number;
  prevCtr: number;
  prevPosition: number;
  clickGain?: number;
  clickLoss?: number;
  shareOfPropertyClicks?: number;
  decayPattern?:
    | 'Clicks and impressions both declined'
    | 'Impressions remained stable but CTR declined'
    | 'Impressions remained stable but Average Position worsened'
    | 'Impressions increased but clicks did not'
    | 'Clicks declined while Average Position remained stable';
  isEmerging?: boolean;
  isNew?: boolean;
  destinationCity?: string;
  destinationCountry?: string;
}

export interface TblQueryItem {
  id: string;
  query: string;
  queryType: QueryType;
  queryTheme: QueryTheme;
  landingPage?: string;
  pageGroup?: TblPageGroup;
  pageLevel?: TblPageLevel;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
  prevImpressions: number;
  prevCtr: number;
  prevPosition: number;
  clickChange: number;
  impressionChange: number;
  positionChange: number;
  isEmerging?: boolean;
  isNew?: boolean;
}

export interface CannibalisationQuery {
  query: string;
  distinctRankingUrlCount: number;
  rankingLandingPages: Array<{
    page: string;
    pageGroup: TblPageGroup;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
}

export interface CountryPerformance {
  country: string;
  countryCode?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks?: number;
  prevImpressions?: number;
  prevCtr?: number;
  prevPosition?: number;
  shareOfClicks?: number;
  clickChange?: number;
  period?: 'current' | 'previous';
}

export interface DevicePerformance {
  device: 'DESKTOP' | 'MOBILE' | 'TABLET' | string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks?: number;
  prevImpressions?: number;
  prevCtr?: number;
  prevPosition?: number;
  clickShare?: number;
  clickChange?: number;
  period?: 'current' | 'previous';
}

export interface SearchTypePerformance {
  searchType: 'Web' | 'Image' | 'Video' | 'News';
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
  prevImpressions: number;
  prevCtr: number;
  prevPosition: number;
  clickChange: number;
}

export interface GscDailyTimeSeriesPoint {
  date: string;
  formattedDate: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevDate: string;
  prevFormattedDate: string;
  prevClicks: number;
  prevImpressions: number;
  prevCtr: number;
  prevPosition: number;
  byPageGroup: Partial<Record<TblPageGroup, { clicks: number; impressions: number }>>;
  brandedClicks: number;
  nonBrandedClicks: number;
  desktopClicks: number;
  mobileClicks: number;
  tabletClicks: number;
}

export interface PropertyTotals {
  currentClicks: number;
  previousClicks: number;
  prevClicks?: number;
  currentImpressions: number;
  previousImpressions: number;
  prevImpressions?: number;
  currentCtr: number;
  previousCtr: number;
  prevCtr?: number;
  currentPosition: number;
  previousPosition: number;
  prevPosition?: number;
  earliestDate: string;
  latestCompleteDate: string;
  reportingLagDays: number;
  propertyName: string;
  lastRefreshed: string;
}

export interface RecommendedActionItem {
  id: string;
  title: string;
  description: string;
  expectedImpact: 'High' | 'Medium' | 'Low';
  supportingEvidence: string;
  effort: 'Low' | 'Medium' | 'High';
  responsibleArea: 'SEO' | 'Content' | 'Analytics' | 'Product' | 'Engineering';
  recommendedTimeframe: string;
  measurementMethod: string;
  isHypothesis?: boolean;
}

// Compatibility types for CSV console / utils
export interface PagePerformance {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period: 'current' | 'previous';
}

export interface QueryPerformance {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period: 'current' | 'previous';
}

export interface PageQueryPerformance {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period: 'current' | 'previous';
}

export interface SearchAppearancePerformance {
  appearance: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period: 'current' | 'previous';
}

export interface DatePerformance {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksCompare?: number;
  impressionsCompare?: number;
  ctrCompare?: number;
  positionCompare?: number;
  period?: 'current' | 'previous';
}

export interface ClassificationRule {
  id: string;
  field: 'page' | 'query' | string;
  matchType: 'contains' | 'regex' | 'exact' | 'startsWith' | 'starts_with' | 'ends_with' | string;
  pattern: string;
  targetDimension?: 'city' | 'category' | 'pageType' | 'intent' | string;
  targetValue: string;
}

export interface ClassifiedPagePerformance extends PagePerformance {
  city?: string;
  category?: string;
  pageType?: string;
  hub?: string;
  isClassified?: boolean;
}

export interface ClassifiedQueryPerformance extends QueryPerformance {
  city?: string;
  category?: string;
  intent?: string;
  hub?: string;
  queryType?: 'Branded' | 'Non-Branded';
  isClassified?: boolean;
}

export interface LoadedFile {
  id: string;
  fileName: string;
  type: 'pages' | 'queries' | 'combined' | 'countries' | 'devices' | 'appearances' | 'dates' | 'appearance';
  period: 'current' | 'previous';
  rowCount: number;
  uploadedAt: string;
}

export interface GscAnnotation {
  id?: string;
  date: string;
  title: string;
  description: string;
  type: 'algorithm_update' | 'site_migration' | 'content_launch' | 'technical_fix' | 'outage' | 'google_update' | 'site_change' | string;
}

export interface GscDailyPerformance {
  date: string;
  formattedDate?: string;
  prevDate?: string;
  prevFormattedDate?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks?: number;
  prevImpressions?: number;
  prevCtr?: number;
  prevPosition?: number;
  annotations?: any[];
  clicksCompare?: number;
  impressionsCompare?: number;
  ctrCompare?: number;
  positionCompare?: number;
}

export interface AIInsightsResponse {
  executiveSummary: string;
  biggestOpportunity: string;
  biggestRisk: string;
  recommendedActions: RecommendedActionItem[];
  summary?: string;
  opportunityQueryAnalysis?: string;
  actions?: any[];
}
