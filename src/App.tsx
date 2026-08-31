/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ActiveTab,
  DashboardFilterState,
  PropertyTotals,
  LoadedFile,
  PagePerformance,
  QueryPerformance,
  PageQueryPerformance,
  CountryPerformance,
  DevicePerformance,
  SearchAppearancePerformance,
  DatePerformance,
  TblPageItem,
  TblQueryItem,
  GscDailyTimeSeriesPoint,
} from './types';
import {
  TOURS_PAGES,
  TOURS_QUERIES,
  CANNIBALISATION_QUERIES,
  COUNTRY_PERFORMANCE_DATA,
  DEVICE_PERFORMANCE_DATA,
  SEARCH_TYPE_DATA,
  PROPERTY_TOTALS,
  PAGE_GROUP_PERFORMANCE_DATA,
  RECOMMENDED_ACTIONS,
  generateDailyTimeSeries,
} from './toursData';

import { LeftReportSidebar } from './components/LeftReportSidebar';
import { DedicatedReportView } from './components/DedicatedReportViews';
import { CustomInsightsSuite } from './components/CustomInsightsSuite';
import { InsightWrapUpReport } from './components/InsightWrapUpReport';
import { GscCalculatedDimensionsViewer } from './components/GscCalculatedDimensionsViewer';
import { NavigationHeader } from './components/NavigationHeader';
import { ExecutiveSummarySection } from './components/ExecutiveSummarySection';
import { SearchPerformanceSection } from './components/SearchPerformanceSection';
import { PageDirectoryPerformanceSection } from './components/PageDirectoryPerformanceSection';
import { QueryOpportunitiesSection } from './components/QueryOpportunitiesSection';
import { GeographicDeviceSection } from './components/GeographicDeviceSection';
import { PageGroupLevelPerformanceView } from './components/PageGroupLevelPerformanceView';
import { TaxonomyClassificationSection } from './components/TaxonomyClassificationSection';
import { MethodologyDataQualitySection } from './components/MethodologyDataQualitySection';
import UploadCenter from './components/UploadCenter';
import { calculateGscPageGroup, calculateGscPageLevel } from './utils/gscTaxonomyEngine';

function mergePages(rows: PagePerformance[]): TblPageItem[] {
  const grouped = new Map<string, { current?: PagePerformance; previous?: PagePerformance }>();
  rows.forEach((row) => {
    const entry = grouped.get(row.page) || {};
    entry[row.period] = row;
    grouped.set(row.page, entry);
  });
  return Array.from(grouped.entries()).map(([page, periods], index) => {
    const current = periods.current || { page, clicks: 0, impressions: 0, ctr: 0, position: 0, period: 'current' as const };
    const previous = periods.previous || { page, clicks: 0, impressions: 0, ctr: 0, position: 0, period: 'previous' as const };
    return {
      id: `uploaded-page-${index}`,
      page,
      pageGroup: calculateGscPageGroup(page),
      pageLevel: calculateGscPageLevel(page),
      clicks: current.clicks,
      impressions: current.impressions,
      ctr: current.ctr,
      position: current.position,
      prevClicks: previous.clicks,
      prevImpressions: previous.impressions,
      prevCtr: previous.ctr,
      prevPosition: previous.position,
      clickGain: current.clicks - previous.clicks,
    };
  });
}

function mergeQueries(rows: QueryPerformance[]): TblQueryItem[] {
  const grouped = new Map<string, { current?: QueryPerformance; previous?: QueryPerformance }>();
  rows.forEach((row) => {
    const entry = grouped.get(row.query) || {};
    entry[row.period] = row;
    grouped.set(row.query, entry);
  });
  return Array.from(grouped.entries()).map(([query, periods], index) => {
    const current = periods.current || { query, clicks: 0, impressions: 0, ctr: 0, position: 0, period: 'current' as const };
    const previous = periods.previous || { query, clicks: 0, impressions: 0, ctr: 0, position: 0, period: 'previous' as const };
    const branded = /tours\s*by\s*locals|toursbylocals/i.test(query);
    return {
      id: `uploaded-query-${index}`,
      query,
      queryType: branded ? 'Branded' : 'Non-Branded',
      queryTheme: 'Unclassified Query Theme',
      clicks: current.clicks,
      impressions: current.impressions,
      ctr: current.ctr,
      position: current.position,
      prevClicks: previous.clicks,
      prevImpressions: previous.impressions,
      prevCtr: previous.ctr,
      prevPosition: previous.position,
      clickChange: current.clicks - previous.clicks,
      impressionChange: current.impressions - previous.impressions,
      positionChange: previous.position - current.position,
    };
  });
}

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveTab>('perf-page-group-landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([]);
  const [uploadedPages, setUploadedPages] = useState<PagePerformance[]>([]);
  const [uploadedQueries, setUploadedQueries] = useState<QueryPerformance[]>([]);
  const [uploadedCountries, setUploadedCountries] = useState<CountryPerformance[]>([]);
  const [uploadedDevices, setUploadedDevices] = useState<DevicePerformance[]>([]);
  const [uploadedCombined, setUploadedCombined] = useState<PageQueryPerformance[]>([]);
  const [uploadedAppearances, setUploadedAppearances] = useState<SearchAppearancePerformance[]>([]);
  const [uploadedDates, setUploadedDates] = useState<DatePerformance[]>([]);

  const hasUploadedData = loadedFiles.length > 0;
  const activePages = useMemo(() => hasUploadedData && uploadedPages.length ? mergePages(uploadedPages) : TOURS_PAGES, [hasUploadedData, uploadedPages]);
  const activeQueries = useMemo(() => hasUploadedData && uploadedQueries.length ? mergeQueries(uploadedQueries) : TOURS_QUERIES, [hasUploadedData, uploadedQueries]);
  const activeCountries = useMemo(() => {
    if (!hasUploadedData || !uploadedCountries.length) return COUNTRY_PERFORMANCE_DATA;
    const grouped = new Map<string, CountryPerformance>();
    uploadedCountries.forEach((row) => {
      const existing: CountryPerformance = grouped.get(row.country) || { country: row.country, clicks: 0, impressions: 0, ctr: 0, position: 0 };
      if (row.period === 'previous') {
        existing.prevClicks = row.clicks;
        existing.prevImpressions = row.impressions;
        existing.prevCtr = row.ctr;
        existing.prevPosition = row.position;
      } else Object.assign(existing, row);
      grouped.set(row.country, existing);
    });
    return Array.from(grouped.values());
  }, [hasUploadedData, uploadedCountries]);
  const activeDevices = useMemo(() => {
    if (!hasUploadedData || !uploadedDevices.length) return DEVICE_PERFORMANCE_DATA;
    const grouped = new Map<string, DevicePerformance>();
    uploadedDevices.forEach((row) => {
      const existing: DevicePerformance = grouped.get(row.device) || { device: row.device, clicks: 0, impressions: 0, ctr: 0, position: 0 };
      if (row.period === 'previous') {
        existing.prevClicks = row.clicks;
        existing.prevImpressions = row.impressions;
        existing.prevCtr = row.ctr;
        existing.prevPosition = row.position;
      } else Object.assign(existing, row);
      grouped.set(row.device, existing);
    });
    return Array.from(grouped.values());
  }, [hasUploadedData, uploadedDevices]);

  const clearUploadedData = () => {
    setLoadedFiles([]);
    setUploadedPages([]);
    setUploadedQueries([]);
    setUploadedCountries([]);
    setUploadedDevices([]);
    setUploadedCombined([]);
    setUploadedAppearances([]);
    setUploadedDates([]);
  };

  const handleAddData = (
    fileInfo: Omit<LoadedFile, 'id' | 'uploadedAt' | 'rowCount'>,
    pages: PagePerformance[],
    queries: QueryPerformance[],
    combined: PageQueryPerformance[],
    countries: CountryPerformance[] = [],
    devices: DevicePerformance[] = [],
    appearances: SearchAppearancePerformance[] = [],
    dates: DatePerformance[] = []
  ) => {
    const rowCount = pages.length + queries.length + combined.length + countries.length + devices.length + appearances.length + dates.length;
    setLoadedFiles((existing) => [...existing, { ...fileInfo, id: crypto.randomUUID(), uploadedAt: new Date().toISOString(), rowCount }]);
    setUploadedPages((existing) => [...existing, ...pages]);
    setUploadedQueries((existing) => [...existing, ...queries]);
    setUploadedCombined((existing) => [...existing, ...combined]);
    setUploadedCountries((existing) => [...existing, ...countries]);
    setUploadedDevices((existing) => [...existing, ...devices]);
    setUploadedAppearances((existing) => [...existing, ...appearances]);
    setUploadedDates((existing) => [...existing, ...dates]);
  };

  // Global Filter State conforming to Dashboard Filter State specification
  const [filters, setFilters] = useState<DashboardFilterState>({
    datePreset: 'Last 12 complete months',
    comparisonPreset: 'Same period in the previous year',
    searchQueryFilter: '',
    dateRange: 'LAST_12_MONTHS',
    comparisonPeriod: 'PREVIOUS_PERIOD',
    customDateRange: {
      startDate: '2025-08-18',
      endDate: '2026-08-17',
    },
    pageGroup: 'ALL',
    pageLevel: 'ALL',
    queryType: 'ALL',
    queryTheme: 'ALL',
    country: 'ALL',
    device: 'ALL',
    searchType: 'Web',
    minImpressions: 0,
    minClicks: 0,
    positionMin: 1,
    positionMax: 100,
  });

  // Calculate filtered or simulated totals
  const propertyTotals: PropertyTotals = useMemo(() => {
    if (hasUploadedData && activePages.length) {
      const currentClicks = activePages.reduce((sum, page) => sum + page.clicks, 0);
      const currentImpressions = activePages.reduce((sum, page) => sum + page.impressions, 0);
      const previousClicks = activePages.reduce((sum, page) => sum + page.prevClicks, 0);
      const previousImpressions = activePages.reduce((sum, page) => sum + page.prevImpressions, 0);
      const weightedPosition = activePages.reduce((sum, page) => sum + page.position * page.impressions, 0) / Math.max(1, currentImpressions);
      const previousWeightedPosition = activePages.reduce((sum, page) => sum + page.prevPosition * page.prevImpressions, 0) / Math.max(1, previousImpressions);
      return {
        ...PROPERTY_TOTALS,
        propertyName: 'Uploaded GSC export',
        lastRefreshed: new Date().toISOString(),
        currentClicks,
        previousClicks,
        currentImpressions,
        previousImpressions,
        currentCtr: currentClicks / Math.max(1, currentImpressions),
        previousCtr: previousClicks / Math.max(1, previousImpressions),
        currentPosition: weightedPosition,
        previousPosition: previousWeightedPosition,
      };
    }
    // For custom date ranges or device/country adjustments, scale totals proportionally
    let scale = 1.0;
    if (filters.dateRange === 'LAST_28_DAYS' || filters.datePreset === 'Last 28 complete days') scale = 28 / 365;
    else if (filters.dateRange === 'LAST_3_MONTHS' || filters.datePreset === 'Last 3 complete months') scale = 90 / 365;
    else if (filters.dateRange === 'LAST_6_MONTHS') scale = 180 / 365;

    return {
      ...PROPERTY_TOTALS,
      currentClicks: Math.round(PROPERTY_TOTALS.currentClicks * scale),
      previousClicks: Math.round(PROPERTY_TOTALS.previousClicks * scale),
      prevClicks: Math.round(PROPERTY_TOTALS.previousClicks * scale),
      currentImpressions: Math.round(PROPERTY_TOTALS.currentImpressions * scale),
      previousImpressions: Math.round(PROPERTY_TOTALS.previousImpressions * scale),
      prevImpressions: Math.round(PROPERTY_TOTALS.previousImpressions * scale),
    };
  }, [filters.dateRange, filters.datePreset, hasUploadedData, activePages]);

  // Generate continuous time series for the performance charts
  const timeSeries = useMemo(() => {
    if (hasUploadedData && uploadedDates.length) {
      const grouped = new Map<string, GscDailyTimeSeriesPoint>();
      uploadedDates.forEach((row) => {
        const existing: GscDailyTimeSeriesPoint = grouped.get(row.date) || {
          date: row.date,
          formattedDate: row.date,
          prevDate: row.date,
          prevFormattedDate: row.date,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          prevClicks: 0,
          prevImpressions: 0,
          prevCtr: 0,
          prevPosition: 0,
          byPageGroup: {},
          brandedClicks: 0,
          nonBrandedClicks: 0,
          desktopClicks: 0,
          mobileClicks: 0,
          tabletClicks: 0,
        };
        if (row.period === 'previous') {
          existing.prevClicks = row.clicks;
          existing.prevImpressions = row.impressions;
          existing.prevCtr = row.ctr;
          existing.prevPosition = row.position;
        } else {
          existing.clicks = row.clicks;
          existing.impressions = row.impressions;
          existing.ctr = row.ctr;
          existing.position = row.position;
        }
        grouped.set(row.date, existing);
      });
      return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
    }
    return generateDailyTimeSeries();
  }, [hasUploadedData, uploadedDates]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white" id="seo-performance-dashboard">
      {/* Global Navigation and Filter Header */}
      <NavigationHeader
        activeTab={activeSection}
        activeSection={activeSection}
        setActiveTab={setActiveSection}
        onSelectSection={setActiveSection}
        filters={filters}
        setFilters={setFilters}
        onFilterChange={setFilters}
        propertyTotals={propertyTotals}
        hasUploadedData={hasUploadedData}
        loadedFileCount={loadedFiles.length}
      />

      {/* Main Container with Left Reports Sidebar & Active Stage */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side Reports Menu (Matching screenshots) */}
        <LeftReportSidebar
          activeReport={activeSection}
          onSelectReport={(reportId) => setActiveSection(reportId)}
        />

        {/* Main Active Report Content Stage */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Dedicated 19 Report Views + Category Hierarchy Matrix */}
          {(activeSection === 'category-performance-matrix' ||
            activeSection === 'perf-page-group-landing' ||
            activeSection === 'search-query-performance' ||
            activeSection === 'trend-page-group' ||
            activeSection === 'search-demand-query-theme' ||
            activeSection === 'seo-winners-decliners' ||
            activeSection === 'perf-searcher-country' ||
            activeSection === 'top-10-pages-clicks' ||
            activeSection === 'query-page-ranking' ||
            activeSection === 'seo-quick-wins' ||
            activeSection === 'organic-traffic-concentration' ||
            activeSection === 'non-branded-opportunities' ||
            activeSection === 'high-imp-below-p1' ||
            activeSection === 'branded-vs-non-branded' ||
            activeSection === 'high-vis-zero-clicks' ||
            activeSection === 'low-ctr-opportunities' ||
            activeSection === 'keyword-cannibalization' ||
            activeSection === 'top-10-search-visibility' ||
            activeSection === 'unclassified-urls' ||
            activeSection === 'clicks-by-device' ||
            activeSection === 'google-algorithm-updates') && (
            <DedicatedReportView
              reportId={activeSection}
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
              pages={activePages}
              queries={activeQueries}
              countries={activeCountries}
              devices={activeDevices}
            />
          )}

          {activeSection === 'upload-data' && (
            <UploadCenter
              loadedFiles={loadedFiles}
              onAddData={handleAddData}
              onDeleteFile={() => clearUploadedData()}
              onLoadDemoData={clearUploadedData}
              onClearAllData={clearUploadedData}
            />
          )}

          {/* Section 1: Executive Summary */}
          {(activeSection === 'executive' || activeSection === 'executive-summary') && (
            <ExecutiveSummarySection
              propertyTotals={propertyTotals}
              pages={activePages}
              queries={activeQueries}
              actions={RECOMMENDED_ACTIONS}
              filters={filters}
              setActiveTab={setActiveSection}
            />
          )}

          {/* Section 2: Search Performance Overview */}
          {(activeSection === 'performance' || activeSection === 'search-performance') && (
            <SearchPerformanceSection
              propertyTotals={propertyTotals}
              timeSeriesData={timeSeries}
              timeSeries={timeSeries}
              pageGroups={PAGE_GROUP_PERFORMANCE_DATA}
              filters={filters}
            />
          )}

          {/* Section 3: Page and Directory Performance */}
          {(activeSection === 'pages' || activeSection === 'page-directory') && (
            <PageDirectoryPerformanceSection
              pages={activePages}
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 4: Page Group & Level Multi-Select Performance */}
          {activeSection === 'page-group-level' && (
            <PageGroupLevelPerformanceView
              pages={activePages}
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {/* Section 5: Query and Content Opportunities */}
          {(activeSection === 'queries' || activeSection === 'query-opportunities') && (
            <QueryOpportunitiesSection
              queries={activeQueries}
              cannibalisationQueries={CANNIBALISATION_QUERIES}
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 6: Geographic and Device Performance */}
          {(activeSection === 'geo-device' || activeSection === 'geographic-device') && (
            <GeographicDeviceSection
              countries={activeCountries}
              devices={activeDevices}
              searchTypes={SEARCH_TYPE_DATA}
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 7: Taxonomy and Sitemap Classification */}
          {(activeSection === 'taxonomy' || activeSection === 'sitemap-taxonomy') && (
            <TaxonomyClassificationSection
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 8: GSC Calculated Dimensions Viewer */}
          {activeSection === 'gsc-calculated-dimensions' && (
            <div className="space-y-6">
              <GscCalculatedDimensionsViewer />
            </div>
          )}

          {/* Section: Custom GSC Insights & Advanced Intelligence */}
          {activeSection === 'custom-insights' && (
            <CustomInsightsSuite
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
              pages={activePages}
              queries={activeQueries}
            />
          )}

          {/* Section: Insights Wrap-Up, Actions, Opportunities & Wins */}
          {activeSection === 'insight-wrap-up' && (
            <InsightWrapUpReport
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
              pages={activePages}
              queries={activeQueries}
            />
          )}

          {/* Section 9: Methodology and Data Quality */}
          {activeSection === 'methodology' && (
            <MethodologyDataQualitySection
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}
        </main>
      </div>

      {/* Enterprise Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold tracking-tight">SemanticMapper</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-slate-300">
              © 2026 SemanticMapper Inc. Developed by <span className="text-emerald-400 font-semibold">Ami - SEO Girl</span>. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] text-emerald-400">
              <span>sc-domain:tours.com</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Standard 3-Day Lag Verification</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <button
              onClick={() => setActiveSection('methodology')}
              className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer transition-colors"
            >
              Data Audit & Rules
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
