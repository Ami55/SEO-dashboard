/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  FileText,
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  MousePointer,
  Percent,
  Compass,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Filter,
  Check,
} from 'lucide-react';
import {
  TblPageItem,
  PropertyTotals,
  DashboardFilterState,
  PageGroup,
  PageLevel,
} from '../types';
import { FilterDropdownPanel, FilterOptionItem, formatCompactNumber } from './FilterDropdownPanel';
import { SharedScorecardStrip } from './SharedScorecardStrip';
import { CategoryHierarchyPerformanceSection } from './CategoryHierarchyPerformanceSection';

interface PageGroupLevelPerformanceViewProps {
  pages: TblPageItem[];
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
  initialDimensionTab?: 'page-group' | 'page-level' | 'by-category';
}

// Standard Page Group Items with baseline fallback data matching user screenshot
export const PAGE_GROUP_ITEMS: FilterOptionItem[] = [
  { id: 'Tours', label: 'Tours', metricValue: 76000, metricFormatted: '76K', subLabel: 'Destination & category tour experiences' },
  { id: 'Other', label: 'Other', metricValue: 42900, metricFormatted: '42.9K', subLabel: 'Unclassified, utility or uncategorized' },
  { id: 'Tour Guides', label: 'Tour Guides', metricValue: 35600, metricFormatted: '35.6K', subLabel: 'Local guide directory listings' },
  { id: 'Travel Blog', label: 'Travel Blog', metricValue: 3300, metricFormatted: '3.3K', subLabel: 'Editorial travel guides & articles' },
  { id: 'Shore Excursions', label: 'Shore Excursions', metricValue: 1300, metricFormatted: '1.3K', subLabel: 'Cruise port & ship excursions' },
  { id: 'Things to Do', label: 'Things to Do', metricValue: 824, metricFormatted: '824', subLabel: 'City & country discovery hubs' },
  { id: 'Safaris', label: 'Safaris', metricValue: 70, metricFormatted: '70', subLabel: 'Wildlife & national park expeditions' },
  { id: 'Essential Tours', label: 'Essential Tours', metricValue: 3, metricFormatted: '3', subLabel: 'Core highlights & essential packages' },
];

// Standard Page Level Items with baseline fallback data matching user screenshot
export const PAGE_LEVEL_ITEMS: FilterOptionItem[] = [
  { id: 'City/Area Page', label: 'City/Area Page', metricValue: 2450000, metricFormatted: '2.5M', subLabel: 'City, area and regional directories' },
  { id: 'Tour Detail Page', label: 'Tour Detail Page', metricValue: 2000000, metricFormatted: '2M', subLabel: 'Individual product & booking pages' },
  { id: 'Other', label: 'Other', metricValue: 1500000, metricFormatted: '1.5M', subLabel: 'Generic & unclassified template levels' },
  { id: 'Country Page', label: 'Country Page', metricValue: 742300, metricFormatted: '742.3K', subLabel: 'National destination directories' },
  { id: 'Blog Post', label: 'Blog Post', metricValue: 492600, metricFormatted: '492.6K', subLabel: 'Single editorial blog posts' },
  { id: 'Directory Root', label: 'Directory Root', metricValue: 351500, metricFormatted: '351.5K', subLabel: 'Top-level root index paths' },
  { id: 'Attraction Page', label: 'Attraction Page', metricValue: 264100, metricFormatted: '264.1K', subLabel: 'Attraction landing & detail pages' },
  { id: 'Tour Category Page', label: 'Tour Category Page', metricValue: 208100, metricFormatted: '208.1K', subLabel: 'Thematic tour category lists' },
  { id: 'Cruise Line Page', label: 'Cruise Line Page', metricValue: 97900, metricFormatted: '97.9K', subLabel: 'Cruise line brand directories' },
  { id: 'Cruise Ship Page', label: 'Cruise Ship Page', metricValue: 8300, metricFormatted: '8.3K', subLabel: 'Individual ship itinerary pages' },
  { id: 'Cruise Destination Page', label: 'Cruise Destination Page', metricValue: 3100, metricFormatted: '3.1K', subLabel: 'Port-specific shore ex pages' },
  { id: 'Special Landing Page', label: 'Special Landing Page', metricValue: 20, metricFormatted: '20', subLabel: 'Campaigns & bespoke landing pages' },
];

export const PageGroupLevelPerformanceView: React.FC<PageGroupLevelPerformanceViewProps> = ({
  pages,
  propertyTotals,
  filters,
  onFilterChange,
  initialDimensionTab = 'page-group',
}) => {
  // Tab selection: 'page-group' vs 'page-level' vs 'by-category'
  const [selectedDimensionTab, setSelectedDimensionTab] = useState<'page-group' | 'page-level' | 'by-category'>(
    initialDimensionTab
  );
  const [drilldownId, setDrilldownId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<'clicks' | 'impressions' | 'ctr' | 'position' | 'gain'>('clicks');
  const [sortAsc, setSortAsc] = useState(false);

  // Selected filters from global state
  const selectedGroups = filters.selectedPageGroups || [];
  const selectedLevels = filters.selectedPageLevels || [];

  // Handlers for updating selected arrays
  const handlePageGroupChange = (newSelectedGroups: string[]) => {
    onFilterChange((prev) => ({
      ...prev,
      selectedPageGroups: newSelectedGroups,
      pageGroup: newSelectedGroups.length === 1 ? newSelectedGroups[0] : 'ALL',
    }));
  };

  const handlePageLevelChange = (newSelectedLevels: string[]) => {
    onFilterChange((prev) => ({
      ...prev,
      selectedPageLevels: newSelectedLevels,
      pageLevel: newSelectedLevels.length === 1 ? newSelectedLevels[0] : 'ALL',
    }));
  };

  // Compute live aggregates per Page Group
  const computedPageGroupStats = useMemo(() => {
    const groupMap: Record<string, { clicks: number; prevClicks: number; impressions: number; prevImpressions: number; weightedPosition: number; count: number }> = {};

    // Initialize with standard groups
    PAGE_GROUP_ITEMS.forEach((item) => {
      groupMap[item.label] = {
        clicks: item.metricValue,
        prevClicks: Math.round(item.metricValue * 0.82),
        impressions: Math.round(item.metricValue * 62),
        prevImpressions: Math.round(item.metricValue * 52),
        weightedPosition: 7.8,
        count: Math.max(1, Math.round(item.metricValue / 1200)),
      };
    });

    // Merge actual tracked pages
    pages.forEach((p) => {
      const g = p.pageGroup || 'Other';
      if (!groupMap[g]) {
        groupMap[g] = { clicks: 0, prevClicks: 0, impressions: 0, prevImpressions: 0, weightedPosition: 0, count: 0 };
      }
      groupMap[g].clicks += p.clicks;
      groupMap[g].prevClicks += p.prevClicks || 0;
      groupMap[g].impressions += p.impressions;
      groupMap[g].prevImpressions += p.prevImpressions || 0;
      groupMap[g].weightedPosition += p.position * p.impressions;
      groupMap[g].count += 1;
    });

    return Object.entries(groupMap).map(([name, data]) => {
      const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      const prevCtr = data.prevImpressions > 0 ? (data.prevClicks / data.prevImpressions) * 100 : 0;
      const avgPos = data.impressions > 0 ? data.weightedPosition / data.impressions : 8.5;
      const clickGain = data.clicks - data.prevClicks;
      const shareOfClicks = (data.clicks / propertyTotals.currentClicks) * 100;

      return {
        id: name,
        name,
        clicks: data.clicks,
        prevClicks: data.prevClicks,
        impressions: data.impressions,
        prevImpressions: data.prevImpressions,
        ctr,
        prevCtr,
        position: avgPos,
        clickGain,
        shareOfClicks,
        count: data.count,
      };
    });
  }, [pages, propertyTotals.currentClicks]);

  // Compute live aggregates per Page Level
  const computedPageLevelStats = useMemo(() => {
    const levelMap: Record<string, { clicks: number; prevClicks: number; impressions: number; prevImpressions: number; weightedPosition: number; count: number }> = {};

    // Initialize with standard levels
    PAGE_LEVEL_ITEMS.forEach((item) => {
      levelMap[item.label] = {
        clicks: Math.round(item.metricValue * 0.022),
        prevClicks: Math.round(item.metricValue * 0.018),
        impressions: item.metricValue,
        prevImpressions: Math.round(item.metricValue * 0.85),
        weightedPosition: 8.2,
        count: Math.max(1, Math.round(item.metricValue / 25000)),
      };
    });

    // Merge actual tracked pages
    pages.forEach((p) => {
      const l = p.pageLevel || 'Other';
      if (!levelMap[l]) {
        levelMap[l] = { clicks: 0, prevClicks: 0, impressions: 0, prevImpressions: 0, weightedPosition: 0, count: 0 };
      }
      levelMap[l].clicks += p.clicks;
      levelMap[l].prevClicks += p.prevClicks || 0;
      levelMap[l].impressions += p.impressions;
      levelMap[l].prevImpressions += p.prevImpressions || 0;
      levelMap[l].weightedPosition += p.position * p.impressions;
      levelMap[l].count += 1;
    });

    return Object.entries(levelMap).map(([name, data]) => {
      const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      const prevCtr = data.prevImpressions > 0 ? (data.prevClicks / data.prevImpressions) * 100 : 0;
      const avgPos = data.impressions > 0 ? data.weightedPosition / data.impressions : 8.5;
      const clickGain = data.clicks - data.prevClicks;
      const shareOfImpressions = (data.impressions / propertyTotals.currentImpressions) * 100;

      return {
        id: name,
        name,
        clicks: data.clicks,
        prevClicks: data.prevClicks,
        impressions: data.impressions,
        prevImpressions: data.prevImpressions,
        ctr,
        prevCtr,
        position: avgPos,
        clickGain,
        shareOfImpressions,
        count: data.count,
      };
    });
  }, [pages, propertyTotals.currentImpressions]);

  // Active dataset based on current tab
  const activeDataset = selectedDimensionTab === 'page-group' ? computedPageGroupStats : computedPageLevelStats;

  // Filtered and sorted dataset
  const displayRows = useMemo(() => {
    return activeDataset
      .filter((row) => {
        if (selectedDimensionTab === 'page-group') {
          if (selectedGroups.length > 0 && !selectedGroups.includes(row.name)) return false;
        } else {
          if (selectedLevels.length > 0 && !selectedLevels.includes(row.name)) return false;
        }
        if (tableSearch && !row.name.toLowerCase().includes(tableSearch.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] || 0;
        let valB = b[sortField] || 0;
        return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [activeDataset, selectedDimensionTab, selectedGroups, selectedLevels, tableSearch, sortField, sortAsc]);

  // Drilldown pages for selected entity
  const drilldownPages = useMemo(() => {
    if (!drilldownId) return [];
    return pages.filter((p) => {
      if (selectedDimensionTab === 'page-group') {
        return p.pageGroup === drilldownId || p.pageGroup?.toLowerCase().includes(drilldownId.toLowerCase());
      } else {
        return p.pageLevel === drilldownId || p.pageLevel?.toLowerCase().includes(drilldownId.toLowerCase());
      }
    });
  }, [pages, drilldownId, selectedDimensionTab]);

  // Total summary of selected rows
  const selectedSummary = useMemo(() => {
    const totalClicks = displayRows.reduce((sum, r) => sum + r.clicks, 0);
    const totalPrevClicks = displayRows.reduce((sum, r) => sum + r.prevClicks, 0);
    const totalImpressions = displayRows.reduce((sum, r) => sum + r.impressions, 0);
    const totalPrevImpressions = displayRows.reduce((sum, r) => sum + r.prevImpressions, 0);
    const avgPosition = displayRows.length > 0
      ? displayRows.reduce((sum, r) => sum + r.position * r.impressions, 0) / (totalImpressions || 1)
      : 0;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const clickGain = totalClicks - totalPrevClicks;
    const clickGrowth = totalPrevClicks > 0 ? ((totalClicks - totalPrevClicks) / totalPrevClicks) * 100 : 0;

    return {
      totalClicks,
      totalPrevClicks,
      totalImpressions,
      totalPrevImpressions,
      avgPosition,
      avgCtr,
      clickGain,
      clickGrowth,
      itemCount: displayRows.length,
    };
  }, [displayRows]);

  return (
    <div className="space-y-8 animate-fadeIn" id="page-group-level-performance-section">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 uppercase tracking-wider">
                Dimension Performance Analysis
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Multi-Select Taxonomy Breakdowns
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Page Group & Page Level Performance
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Select and analyze performance separately by high-level business sections (Page Group) or specific template hierarchies (Page Level).
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2.5 text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Selection Clicks</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {selectedSummary.totalClicks.toLocaleString()}
                <span className="text-xs text-emerald-300 font-normal ml-1">
                  ({((selectedSummary.totalClicks / propertyTotals.currentClicks) * 100).toFixed(1)}% share)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared KPI Summary */}
      <SharedScorecardStrip propertyTotals={propertyTotals} />

      {/* Dimension Selection Tabs */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Page Group */}
          <button
            type="button"
            onClick={() => {
              setSelectedDimensionTab('page-group');
              setDrilldownId(null);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              selectedDimensionTab === 'page-group'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Page Group Performance</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                selectedDimensionTab === 'page-group'
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {selectedGroups.length === 0 ? 'All 8' : `${selectedGroups.length}/8`}
            </span>
          </button>

          {/* Tab 2: Page Level */}
          <button
            type="button"
            onClick={() => {
              setSelectedDimensionTab('page-level');
              setDrilldownId(null);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              selectedDimensionTab === 'page-level'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Page Level Performance</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                selectedDimensionTab === 'page-level'
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {selectedLevels.length === 0 ? 'All 12' : `${selectedLevels.length}/12`}
            </span>
          </button>

          {/* Tab 3: Category Performance Matrix & Separation */}
          <button
            type="button"
            onClick={() => {
              setSelectedDimensionTab('by-category');
              setDrilldownId(null);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              selectedDimensionTab === 'by-category'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>3. Category Performance by Template Level</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                selectedDimensionTab === 'by-category'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              City, Country, Detail, Guides
            </span>
          </button>
        </div>

        {/* Quick Filter Reset */}
        <div className="flex items-center gap-2 text-xs">
          {(selectedGroups.length > 0 || selectedLevels.length > 0) && selectedDimensionTab !== 'by-category' && (
            <button
              onClick={() => {
                handlePageGroupChange([]);
                handlePageLevelChange([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Reset Multi-Selection
            </button>
          )}
        </div>
      </div>

      {/* Render Category Matrix directly if Tab 3 is active */}
      {selectedDimensionTab === 'by-category' ? (
        <CategoryHierarchyPerformanceSection
          propertyTotals={propertyTotals}
          filters={filters}
          pages={pages}
        />
      ) : (
        /* Main Analysis Grid: Filter Panel on Left, Detailed Performance Table & Charts on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Filter Panel (matching screenshot) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 space-y-4">
            {selectedDimensionTab === 'page-group' ? (
              <FilterDropdownPanel
                title="Page Group"
                metricHeader="Url Clicks"
                items={PAGE_GROUP_ITEMS}
                selectedIds={selectedGroups}
                onChange={handlePageGroupChange}
                searchBadge="Page Group"
                className="w-full shadow-lg border-slate-300"
              />
            ) : (
              <FilterDropdownPanel
                title="Page Level"
                metricHeader="Impressions"
                items={PAGE_LEVEL_ITEMS}
                selectedIds={selectedLevels}
                onChange={handlePageLevelChange}
                className="w-full shadow-lg border-slate-300"
              />
            )}

            {/* Quick Context Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Multi-Select Interaction Tip</span>
              </div>
              <p>
                Hover any item to click the <strong className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">ONLY</strong> button to isolate that single dimension, or use checkboxes to toggle multiple dimensions simultaneously.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Breakdown Table & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dimension KPI Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDimensionTab === 'page-group' ? 'Page Group Performance Summary' : 'Page Level Performance Summary'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated organic visibility across {displayRows.length} active {selectedDimensionTab === 'page-group' ? 'content groups' : 'page templates'}.
                </p>
              </div>

              {/* Table Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter table rows..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Scorecard Mini-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Total Clicks</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {selectedSummary.totalClicks.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{selectedSummary.clickGain.toLocaleString()} (+{selectedSummary.clickGrowth.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Total Impressions</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {selectedSummary.totalImpressions.toLocaleString()}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
                  {formatCompactNumber(selectedSummary.totalImpressions)} SERP views
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Average CTR</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {selectedSummary.avgCtr.toFixed(2)}%
                </div>
                <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                  Organic click-through
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Average Position</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {selectedSummary.avgPosition.toFixed(1)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Weighted SERP rank
                </div>
              </div>
            </div>
          </div>

          {/* Performance Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                    <th className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSortField('clicks');
                          setSortAsc(!sortAsc);
                        }}
                        className="flex items-center gap-1 hover:text-blue-300"
                      >
                        <span>{selectedDimensionTab === 'page-group' ? 'Page Group' : 'Page Level'}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSortField('clicks');
                          setSortAsc(sortField === 'clicks' ? !sortAsc : false);
                        }}
                        className="flex items-center gap-1 justify-end hover:text-blue-300 ml-auto"
                      >
                        <span>Clicks</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSortField('impressions');
                          setSortAsc(sortField === 'impressions' ? !sortAsc : false);
                        }}
                        className="flex items-center gap-1 justify-end hover:text-blue-300 ml-auto"
                      >
                        <span>Impressions</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSortField('ctr');
                          setSortAsc(sortField === 'ctr' ? !sortAsc : false);
                        }}
                        className="flex items-center gap-1 justify-end hover:text-blue-300 ml-auto"
                      >
                        <span>CTR</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSortField('position');
                          setSortAsc(sortField === 'position' ? !sortAsc : false);
                        }}
                        className="flex items-center gap-1 justify-end hover:text-blue-300 ml-auto"
                      >
                        <span>Avg Pos</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">Share of Total</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No rows match your current filter selection.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => {
                      const share = (row.clicks / (propertyTotals.currentClicks || 1)) * 100;
                      const isDrilldown = drilldownId === row.name;

                      return (
                        <React.Fragment key={row.name}>
                          <tr
                            className={`hover:bg-slate-50 transition-colors ${
                              isDrilldown ? 'bg-blue-50/70 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>{row.name}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {row.clicks.toLocaleString()}
                              <span className="block text-[10px] text-emerald-600 font-normal">
                                +{(row.clicks - row.prevClicks).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-700">
                              {row.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-700">
                              {row.ctr.toFixed(2)}%
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                              {row.position.toFixed(1)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-mono text-slate-600">{share.toFixed(1)}%</span>
                                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${Math.min(100, share * 1.5)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => setDrilldownId(isDrilldown ? null : row.name)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  isDrilldown
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isDrilldown ? 'Close' : 'Drilldown'}
                              </button>
                            </td>
                          </tr>

                          {/* Drilldown Row */}
                          {isDrilldown && (
                            <tr className="bg-slate-50/90 border-b border-blue-100">
                              <td colSpan={7} className="p-4">
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Top Landing Pages in "{row.name}"</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      {drilldownPages.length} tracked URLs
                                    </span>
                                  </div>

                                  {drilldownPages.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-slate-400">
                                      Representative landing pages aggregated under {row.name}.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                          <tr className="border-b border-slate-200 text-slate-500 font-medium">
                                            <th className="py-1.5 px-2">Landing Page Slug</th>
                                            <th className="py-1.5 px-2 text-right">Clicks</th>
                                            <th className="py-1.5 px-2 text-right">Impressions</th>
                                            <th className="py-1.5 px-2 text-right">CTR</th>
                                            <th className="py-1.5 px-2 text-right">Avg Pos</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {drilldownPages.slice(0, 8).map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                              <td className="py-1.5 px-2 font-mono text-blue-600 truncate max-w-xs">
                                                {p.page}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono font-semibold">
                                                {p.clicks.toLocaleString()}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                                                {p.impressions.toLocaleString()}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                                                {(p.ctr * 100).toFixed(2)}%
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800">
                                                {p.position.toFixed(1)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
