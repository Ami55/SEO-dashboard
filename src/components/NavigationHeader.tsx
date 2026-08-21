/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Layers,
  Globe,
  Smartphone,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Filter,
  BarChart3,
  FileText,
  HelpCircle,
  TrendingUp,
  MapPin,
  ChevronDown,
  X,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ActiveTab, DashboardFilterState, PropertyTotals } from '../types';
import { FilterDropdownPanel } from './FilterDropdownPanel';
import {
  PAGE_GROUP_ITEMS,
  PAGE_LEVEL_ITEMS,
} from './PageGroupLevelPerformanceView';

interface NavigationHeaderProps {
  activeTab?: ActiveTab;
  activeSection?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onSelectSection?: (tab: ActiveTab) => void;
  filters?: DashboardFilterState;
  setFilters?: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
  propertyTotals: PropertyTotals;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  activeSection,
  setActiveTab,
  onSelectSection,
  filters,
  setFilters,
  onFilterChange,
  propertyTotals,
}) => {
  const currentTab = activeTab || activeSection || 'executive-summary';
  const handleSelectTab = (tab: ActiveTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectSection) onSelectSection(tab);
  };
  const updateFilters = setFilters || onFilterChange || (() => {});

  // Safe fallback filter state
  const safeFilters: DashboardFilterState = filters || {
    datePreset: 'Last 12 complete months',
    comparisonPreset: 'Same period in the previous year',
    searchQueryFilter: '',
    dateRange: 'LAST_12_MONTHS',
    comparisonPeriod: 'PREVIOUS_PERIOD',
    customDateRange: { startDate: '2025-08-18', endDate: '2026-08-17' },
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
    selectedPageGroups: [],
    selectedPageLevels: [],
  };

  // Popover state for Page Group & Page Level multi-select dropdowns
  const [openDropdown, setOpenDropdown] = useState<'page-group' | 'page-level' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'executive-summary', label: '1. Executive Summary', icon: ShieldCheck },
    { id: 'search-performance', label: '2. Search Performance', icon: TrendingUp },
    { id: 'page-directory', label: '3. Pages & Directories', icon: FileText },
    { id: 'page-group-level', label: '4. Page Group & Level', icon: Layers },
    { id: 'query-opportunities', label: '5. Queries & Opportunities', icon: Search },
    { id: 'geographic-device', label: '6. Geo & Devices', icon: Globe },
    { id: 'sitemap-taxonomy', label: '7. Taxonomy & Sitemaps', icon: Layers },
    { id: 'methodology', label: '8. Methodology & Audit', icon: HelpCircle },
    { id: 'custom-insights', label: '9. Custom GSC Insights', icon: Sparkles },
    { id: 'insight-wrap-up', label: '10. Wrap-Up & Action Plan', icon: Trophy },
  ];

  const handleResetFilters = () => {
    updateFilters((prev) => ({
      ...prev,
      datePreset: 'Last 3 complete months',
      comparisonPreset: 'Previous equivalent period',
      pageGroup: 'ALL',
      pageLevel: 'ALL',
      selectedPageGroups: [],
      selectedPageLevels: [],
      queryType: 'ALL',
      queryTheme: 'ALL',
      country: 'ALL',
      device: 'ALL',
      searchType: 'ALL',
      searchQueryFilter: '',
    }));
  };

  const selectedGroups = safeFilters.selectedPageGroups || [];
  const selectedLevels = safeFilters.selectedPageLevels || [];

  const hasActiveFilters =
    safeFilters.pageGroup !== 'ALL' ||
    safeFilters.pageLevel !== 'ALL' ||
    selectedGroups.length > 0 ||
    selectedLevels.length > 0 ||
    safeFilters.queryType !== 'ALL' ||
    safeFilters.queryTheme !== 'ALL' ||
    safeFilters.country !== 'ALL' ||
    safeFilters.device !== 'ALL' ||
    safeFilters.searchType !== 'ALL' ||
    safeFilters.searchQueryFilter !== '';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Brand & Metadata Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Compass className="w-6 h-6 animate-spin-slow text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SemanticMapper
                <span className="text-emerald-400 font-medium text-sm">SEO Platform</span>
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                {propertyTotals.propertyName}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enterprise Google Search Console Organic Performance & Growth Engine
            </p>
          </div>
        </div>

        {/* Audit & Freshness Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleSelectTab('google-algorithm-updates')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
              currentTab === 'google-algorithm-updates'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900 hover:border-emerald-500'
            }`}
            title="Analyze Google Core & Spam Algorithm Updates Impact"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Algorithm Updates</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-400/20 text-emerald-300 font-bold">
              Impact
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latest Complete: <strong className="text-white font-mono">{propertyTotals.latestCompleteDate}</strong></span>
            <span className="text-[10px] text-slate-400 font-normal">({propertyTotals.reportingLagDays}d lag)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refreshed: <span className="text-slate-200 font-mono">{propertyTotals.lastRefreshed}</span></span>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 py-2" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Selectors & Multi-Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 mr-1">Date:</span>
              <select
                value={safeFilters.datePreset}
                onChange={(e) => updateFilters((prev) => ({ ...prev, datePreset: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="Last 7 complete days" className="bg-slate-900 text-white">Last 7 complete days</option>
                <option value="Last 28 complete days" className="bg-slate-900 text-white">Last 28 complete days</option>
                <option value="Last 3 complete months" className="bg-slate-900 text-white">Last 3 complete months</option>
                <option value="This month to latest complete date" className="bg-slate-900 text-white">This month to latest complete</option>
                <option value="Last complete month" className="bg-slate-900 text-white">Last complete month</option>
                <option value="This quarter to latest complete date" className="bg-slate-900 text-white">This quarter to latest complete</option>
                <option value="Last complete quarter" className="bg-slate-900 text-white">Last complete quarter</option>
                <option value="Custom dates" className="bg-slate-900 text-white">Custom dates (12 Months)</option>
              </select>
            </div>

            {/* Compare */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 mr-1">Compare:</span>
              <select
                value={safeFilters.comparisonPreset}
                onChange={(e) => updateFilters((prev) => ({ ...prev, comparisonPreset: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="Previous equivalent period" className="bg-slate-900 text-white">Previous equivalent period</option>
                <option value="Previous month" className="bg-slate-900 text-white">Previous month</option>
                <option value="Previous quarter" className="bg-slate-900 text-white">Previous quarter</option>
                <option value="Same period in the previous year" className="bg-slate-900 text-white">Same period previous year (YoY)</option>
              </select>
            </div>

            {/* Multi-Select Dropdown 1: Page Group */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'page-group' ? null : 'page-group')}
                className={`flex items-center gap-1.5 bg-slate-900 border rounded-lg px-3 py-1.5 transition-all text-xs font-medium cursor-pointer ${
                  openDropdown === 'page-group'
                    ? 'border-blue-500 text-blue-400 ring-2 ring-blue-500/20'
                    : selectedGroups.length > 0
                    ? 'border-blue-500 text-blue-300'
                    : 'border-slate-700 text-slate-200 hover:border-slate-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Page Group:</span>
                <span className="font-bold text-white">
                  {selectedGroups.length === 0
                    ? 'All (8)'
                    : selectedGroups.length === 1
                    ? selectedGroups[0]
                    : `${selectedGroups.length} selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              </button>

              {openDropdown === 'page-group' && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <FilterDropdownPanel
                    title="Page Group"
                    metricHeader="Url Clicks"
                    items={PAGE_GROUP_ITEMS}
                    selectedIds={selectedGroups}
                    onChange={(newIds) => {
                      updateFilters((prev) => ({
                        ...prev,
                        selectedPageGroups: newIds,
                        pageGroup: newIds.length === 1 ? newIds[0] : 'ALL',
                      }));
                    }}
                    searchBadge="Page Group"
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              )}
            </div>

            {/* Multi-Select Dropdown 2: Page Level */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'page-level' ? null : 'page-level')}
                className={`flex items-center gap-1.5 bg-slate-900 border rounded-lg px-3 py-1.5 transition-all text-xs font-medium cursor-pointer ${
                  openDropdown === 'page-level'
                    ? 'border-blue-500 text-blue-400 ring-2 ring-blue-500/20'
                    : selectedLevels.length > 0
                    ? 'border-blue-500 text-blue-300'
                    : 'border-slate-700 text-slate-200 hover:border-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Page Level:</span>
                <span className="font-bold text-white">
                  {selectedLevels.length === 0
                    ? 'All (12)'
                    : selectedLevels.length === 1
                    ? selectedLevels[0]
                    : `${selectedLevels.length} selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              </button>

              {openDropdown === 'page-level' && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <FilterDropdownPanel
                    title="Page Level"
                    metricHeader="Impressions"
                    items={PAGE_LEVEL_ITEMS}
                    selectedIds={selectedLevels}
                    onChange={(newIds) => {
                      updateFilters((prev) => ({
                        ...prev,
                        selectedPageLevels: newIds,
                        pageLevel: newIds.length === 1 ? newIds[0] : 'ALL',
                      }));
                    }}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              )}
            </div>

            {/* Query Type Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200">
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={safeFilters.queryType}
                onChange={(e) => updateFilters((prev) => ({ ...prev, queryType: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Queries</option>
                <option value="Branded" className="bg-slate-900 text-white">Branded Only</option>
                <option value="Non-Branded" className="bg-slate-900 text-white">Non-Branded Only</option>
              </select>
            </div>

            {/* Device Filter */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={safeFilters.device}
                onChange={(e) => updateFilters((prev) => ({ ...prev, device: e.target.value }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Devices</option>
                <option value="DESKTOP" className="bg-slate-900 text-white">Desktop</option>
                <option value="MOBILE" className="bg-slate-900 text-white">Mobile</option>
                <option value="TABLET" className="bg-slate-900 text-white">Tablet</option>
              </select>
            </div>
          </div>

          {/* Reset Filters / Filter Status */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs transition-colors border border-emerald-500/30"
            >
              <Filter className="w-3 h-3" />
              <span>Clear Custom Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'executive-summary' && currentTab === 'executive') ||
            (tab.id === 'search-performance' && currentTab === 'performance') ||
            (tab.id === 'page-directory' && currentTab === 'pages') ||
            (tab.id === 'page-group-level' && (currentTab === 'page-group-level' || currentTab === 'pages')) ||
            (tab.id === 'query-opportunities' && currentTab === 'queries') ||
            (tab.id === 'geographic-device' && currentTab === 'geo-device') ||
            (tab.id === 'sitemap-taxonomy' && currentTab === 'taxonomy');
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
