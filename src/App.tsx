/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ActiveTab,
  DashboardFilterState,
  PropertyTotals,
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

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveTab>('perf-page-group-landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  }, [filters.dateRange, filters.datePreset]);

  // Generate continuous time series for the performance charts
  const timeSeries = useMemo(() => {
    return generateDailyTimeSeries();
  }, []);

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
            />
          )}

          {/* Section 1: Executive Summary */}
          {(activeSection === 'executive' || activeSection === 'executive-summary') && (
            <ExecutiveSummarySection
              propertyTotals={propertyTotals}
              pages={TOURS_PAGES}
              queries={TOURS_QUERIES}
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
              pages={TOURS_PAGES}
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 4: Page Group & Level Multi-Select Performance */}
          {activeSection === 'page-group-level' && (
            <PageGroupLevelPerformanceView
              pages={TOURS_PAGES}
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {/* Section 5: Query and Content Opportunities */}
          {(activeSection === 'queries' || activeSection === 'query-opportunities') && (
            <QueryOpportunitiesSection
              queries={TOURS_QUERIES}
              cannibalisationQueries={CANNIBALISATION_QUERIES}
              propertyTotals={propertyTotals}
              filters={filters}
            />
          )}

          {/* Section 6: Geographic and Device Performance */}
          {(activeSection === 'geo-device' || activeSection === 'geographic-device') && (
            <GeographicDeviceSection
              countries={COUNTRY_PERFORMANCE_DATA}
              devices={DEVICE_PERFORMANCE_DATA}
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
            />
          )}

          {/* Section: Insights Wrap-Up, Actions, Opportunities & Wins */}
          {activeSection === 'insight-wrap-up' && (
            <InsightWrapUpReport
              propertyTotals={propertyTotals}
              filters={filters}
              onFilterChange={setFilters}
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
