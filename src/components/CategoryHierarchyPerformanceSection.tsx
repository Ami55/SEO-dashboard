/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Globe,
  Users,
  Anchor,
  Landmark,
  Utensils,
  Trees,
  FileText,
  Layers,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  MousePointer,
  Percent,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PropertyTotals,
  DashboardFilterState,
  TblPageItem,
} from '../types';
import {
  CATEGORY_PERFORMANCE_DATA,
  DETAILED_CATEGORY_URLS,
  CategoryPerformanceRecord,
  PageLevelMetricDetail,
  DetailedCategoryUrlItem,
} from '../data/categoryPerformanceData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CategoryHierarchyPerformanceSectionProps {
  propertyTotals?: PropertyTotals;
  filters?: DashboardFilterState;
  pages?: TblPageItem[];
}

type PageLevelFilterKey =
  | 'ALL'
  | 'city-level'
  | 'country-level'
  | 'tour-detail-city'
  | 'tour-detail-country'
  | 'attraction-page'
  | 'guide-page';

type ViewMode = 'cards' | 'matrix' | 'charts' | 'urls';

const LEVEL_COLORS: Record<string, string> = {
  'city-level': '#3b82f6', // blue
  'country-level': '#8b5cf6', // purple
  'tour-detail-city': '#10b981', // emerald
  'tour-detail-country': '#f59e0b', // amber
  'attraction-page': '#ec4899', // pink
  'guide-page': '#06b6d4', // cyan
};

const CATEGORY_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#4f46e5',
];

export const CategoryHierarchyPerformanceSection: React.FC<CategoryHierarchyPerformanceSectionProps> = ({
  propertyTotals,
  filters,
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<PageLevelFilterKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-city-tours': true,
    'cat-private-guides': true,
    'cat-shore-excursions': true,
  });
  const [selectedDrilldownCategory, setSelectedDrilldownCategory] = useState<string | null>(null);
  const [selectedDrilldownLevel, setSelectedDrilldownLevel] = useState<string | null>(null);
  const [metricSortField, setMetricSortField] = useState<'clicks' | 'impressions' | 'ctr' | 'position' | 'yoy'>('clicks');
  const [sortAsc, setSortAsc] = useState(false);

  // Total macro property clicks reference
  const totalClicksRef = propertyTotals?.currentClicks || 642850;
  const totalImpsRef = propertyTotals?.currentImpressions || 42850000;

  // Toggle category expansion
  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return CATEGORY_PERFORMANCE_DATA.filter((cat) => {
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchName = cat.categoryName.toLowerCase().includes(queryLower);
        const matchDesc = cat.description.toLowerCase().includes(queryLower);
        const matchTopUrl =
          cat.cityLevel.topUrl.toLowerCase().includes(queryLower) ||
          cat.tourDetailCity.topUrl.toLowerCase().includes(queryLower) ||
          cat.countryLevel.topUrl.toLowerCase().includes(queryLower) ||
          cat.attractionPages.topUrl.toLowerCase().includes(queryLower) ||
          cat.guidePages.topUrl.toLowerCase().includes(queryLower);
        if (!matchName && !matchDesc && !matchTopUrl) return false;
      }
      return true;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (selectedLevelFilter === 'ALL') {
        if (metricSortField === 'clicks') {
          valA = a.totalClicks;
          valB = b.totalClicks;
        } else if (metricSortField === 'impressions') {
          valA = a.totalImpressions;
          valB = b.totalImpressions;
        } else if (metricSortField === 'ctr') {
          valA = a.averageCtr;
          valB = b.averageCtr;
        } else if (metricSortField === 'position') {
          valA = a.averagePosition;
          valB = b.averagePosition;
        } else if (metricSortField === 'yoy') {
          valA = a.yoyGrowthPct;
          valB = b.yoyGrowthPct;
        }
      } else {
        const getLevelData = (cat: CategoryPerformanceRecord) => {
          if (selectedLevelFilter === 'city-level') return cat.cityLevel;
          if (selectedLevelFilter === 'country-level') return cat.countryLevel;
          if (selectedLevelFilter === 'tour-detail-city') return cat.tourDetailCity;
          if (selectedLevelFilter === 'tour-detail-country') return cat.tourDetailCountry;
          if (selectedLevelFilter === 'attraction-page') return cat.attractionPages;
          if (selectedLevelFilter === 'guide-page') return cat.guidePages;
          return cat.cityLevel;
        };
        const levelA = getLevelData(a);
        const levelB = getLevelData(b);

        if (metricSortField === 'clicks') {
          valA = levelA.clicks;
          valB = levelB.clicks;
        } else if (metricSortField === 'impressions') {
          valA = levelA.impressions;
          valB = levelB.impressions;
        } else if (metricSortField === 'ctr') {
          valA = levelA.ctr;
          valB = levelB.ctr;
        } else if (metricSortField === 'position') {
          valA = levelA.position;
          valB = levelB.position;
        } else if (metricSortField === 'yoy') {
          valA = ((levelA.clicks - levelA.prevClicks) / (levelA.prevClicks || 1)) * 100;
          valB = ((levelB.clicks - levelB.prevClicks) / (levelB.prevClicks || 1)) * 100;
        }
      }

      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [searchQuery, selectedLevelFilter, metricSortField, sortAsc]);

  // Aggregated totals across filtered categories
  const aggregatedTotals = useMemo(() => {
    let clicks = 0;
    let prevClicks = 0;
    let impressions = 0;
    let prevImpressions = 0;
    let totalWeightedPos = 0;

    filteredCategories.forEach((cat) => {
      if (selectedLevelFilter === 'ALL') {
        clicks += cat.totalClicks;
        prevClicks += cat.totalPrevClicks;
        impressions += cat.totalImpressions;
        prevImpressions += cat.totalPrevImpressions;
        totalWeightedPos += cat.averagePosition * cat.totalImpressions;
      } else {
        const getL = (c: CategoryPerformanceRecord) => {
          if (selectedLevelFilter === 'city-level') return c.cityLevel;
          if (selectedLevelFilter === 'country-level') return c.countryLevel;
          if (selectedLevelFilter === 'tour-detail-city') return c.tourDetailCity;
          if (selectedLevelFilter === 'tour-detail-country') return c.tourDetailCountry;
          if (selectedLevelFilter === 'attraction-page') return c.attractionPages;
          if (selectedLevelFilter === 'guide-page') return c.guidePages;
          return c.cityLevel;
        };
        const l = getL(cat);
        clicks += l.clicks;
        prevClicks += l.prevClicks;
        impressions += l.impressions;
        prevImpressions += l.prevImpressions;
        totalWeightedPos += l.position * l.impressions;
      }
    });

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;
    const avgPosition = impressions > 0 ? totalWeightedPos / impressions : 0;
    const yoyClicks = prevClicks > 0 ? ((clicks - prevClicks) / prevClicks) * 100 : 0;
    const clickGain = clicks - prevClicks;

    return {
      clicks,
      prevClicks,
      impressions,
      prevImpressions,
      ctr,
      prevCtr,
      avgPosition,
      yoyClicks,
      clickGain,
      categoryCount: filteredCategories.length,
    };
  }, [filteredCategories, selectedLevelFilter]);

  // Chart Data for Stacked Page-Level Breakdown per Category
  const chartStackedData = useMemo(() => {
    return filteredCategories.map((c) => ({
      name: c.categoryName.replace(' & Sightseeing', '').replace(' & Cruise Ports', '').replace(' & Wildlife Expeditions', ''),
      fullName: c.categoryName,
      'City Level': c.cityLevel.clicks,
      'Country Level': c.countryLevel.clicks,
      'Tour Detail (City)': c.tourDetailCity.clicks,
      'Tour Detail (Country)': c.tourDetailCountry.clicks,
      'Attraction Pages': c.attractionPages.clicks,
      'Guide Pages': c.guidePages.clicks,
      total: c.totalClicks,
    }));
  }, [filteredCategories]);

  // Drilldown URLs
  const drilldownUrls = useMemo(() => {
    return DETAILED_CATEGORY_URLS.filter((u) => {
      if (selectedDrilldownCategory && u.category !== selectedDrilldownCategory) return false;
      if (selectedDrilldownLevel && selectedDrilldownLevel !== 'ALL') {
        if (selectedDrilldownLevel === 'city-level' && !u.pageLevel.includes('City')) return false;
        if (selectedDrilldownLevel === 'country-level' && !u.pageLevel.includes('Country')) return false;
        if (selectedDrilldownLevel === 'tour-detail-city' && !u.pageLevel.includes('Tour Detail Page (City)')) return false;
        if (selectedDrilldownLevel === 'tour-detail-country' && !u.pageLevel.includes('Tour Detail Page (Country)')) return false;
        if (selectedDrilldownLevel === 'attraction-page' && !u.pageLevel.includes('Attraction')) return false;
        if (selectedDrilldownLevel === 'guide-page' && !u.pageLevel.includes('Guide')) return false;
      }
      return true;
    });
  }, [selectedDrilldownCategory, selectedDrilldownLevel]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Category Name',
      'Page Level',
      'Organic Clicks',
      'Previous Clicks',
      'YoY Click Gain',
      'Organic Impressions',
      'CTR %',
      'Average Position',
      'Page Count',
      'Share of Category Clicks %',
      'Top Performing URL',
      'Top GSC Query',
    ];

    const rows: string[][] = [];

    CATEGORY_PERFORMANCE_DATA.forEach((cat) => {
      const levels: PageLevelMetricDetail[] = [
        cat.cityLevel,
        cat.countryLevel,
        cat.tourDetailCity,
        cat.tourDetailCountry,
        cat.attractionPages,
        cat.guidePages,
      ];

      levels.forEach((lvl) => {
        rows.push([
          `"${cat.categoryName}"`,
          `"${lvl.pageLevelLabel}"`,
          lvl.clicks.toString(),
          lvl.prevClicks.toString(),
          (lvl.clicks - lvl.prevClicks).toString(),
          lvl.impressions.toString(),
          lvl.ctr.toFixed(2),
          lvl.position.toFixed(1),
          lvl.urlCount.toString(),
          lvl.shareOfCategoryClicks.toFixed(1),
          `"${lvl.topUrl}"`,
          `"${lvl.topQuery}"`,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSC_Category_Page_Level_Performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="category-hierarchy-performance-section">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Category & Template Hierarchy Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Multi-Level Separation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Performance by Category & Page Level
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              Separate and benchmark organic performance for every category across specific template hierarchies:
              <strong> City Level</strong>, <strong>Country Level</strong>, <strong>Tour Detail Pages (City vs. Country)</strong>, <strong>Attraction Pages</strong>, and <strong>Guide Pages</strong>.
            </p>
          </div>

          {/* Quick Actions & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Level Separation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filter & Separate by Template Hierarchy:</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Click any level below to isolate and rank category performance strictly for that page level
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, city, top URL..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Level Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedLevelFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Template Levels</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-white/20 rounded-md">All 6</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('city-level')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'city-level'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>1. City Level Hubs</span>
            <span className="text-[10px] opacity-75 font-mono">(/Rome-Tours)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('country-level')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'country-level'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-500" />
            <span>2. Country Level Hubs</span>
            <span className="text-[10px] opacity-75 font-mono">(/Italy-Tours)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('tour-detail-city')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'tour-detail-city'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Tour Detail (City Level)</span>
            <span className="text-[10px] opacity-75 font-mono">(/Vatican-Tour)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('tour-detail-country')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'tour-detail-country'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Tour Detail (Country/Regional)</span>
            <span className="text-[10px] opacity-75 font-mono">(/Serengeti-Safari)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('attraction-page')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'attraction-page'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-pink-50 text-pink-800 border border-pink-200 hover:bg-pink-100'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-pink-600" />
            <span>5. Attraction Pages</span>
            <span className="text-[10px] opacity-75 font-mono">(/attractions/...)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLevelFilter('guide-page')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLevelFilter === 'guide-page'
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-500/20'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-600" />
            <span>6. Guide Pages</span>
            <span className="text-[10px] opacity-75 font-mono">(/Rome-Tour-Guides)</span>
          </button>
        </div>
      </div>

      {/* Macro Scorecard Summary for Selected Scope */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filtered Scope Clicks</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {aggregatedTotals.clicks.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{aggregatedTotals.clickGain.toLocaleString()} (+{aggregatedTotals.yoyClicks.toFixed(1)}% YoY)
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {((aggregatedTotals.clicks / totalClicksRef) * 100).toFixed(1)}% of all site clicks
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search Impressions</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {(aggregatedTotals.impressions / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Prev: {(aggregatedTotals.prevImpressions / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {((aggregatedTotals.impressions / totalImpsRef) * 100).toFixed(1)}% search share
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average CTR</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 font-mono">
            {aggregatedTotals.ctr.toFixed(2)}%
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Prev: {aggregatedTotals.prevCtr.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {(aggregatedTotals.ctr - aggregatedTotals.prevCtr >= 0 ? '+' : '')}
            {(aggregatedTotals.ctr - aggregatedTotals.prevCtr).toFixed(2)}% delta
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Position</div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1 font-mono">
            {aggregatedTotals.avgPosition.toFixed(1)}
          </div>
          <div className="text-xs font-medium text-emerald-600 mt-1">
            Top 5 Google ranking
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            High SERP visibility
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Categories</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {aggregatedTotals.categoryCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Scope: {selectedLevelFilter === 'ALL' ? 'All 6 Levels' : selectedLevelFilter}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">
            Fully indexed & classified
          </div>
        </div>
      </div>

      {/* View Mode Switcher & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Category x Level Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Category Breakdown Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('charts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'charts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Visual Chart Comparison</span>
          </button>
        </div>

        {/* Sort Field Options */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort Categories By:</span>
          <select
            value={metricSortField}
            onChange={(e) => setMetricSortField(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="clicks">Organic Clicks (High to Low)</option>
            <option value="impressions">Search Impressions</option>
            <option value="ctr">Click-Through Rate (CTR)</option>
            <option value="position">SERP Average Position</option>
            <option value="yoy">YoY Growth %</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
            title={sortAsc ? 'Ascending' : 'Descending'}
          >
            {sortAsc ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* VIEW 1: MATRIX & SEPARATION TABLE (Default & Most Comprehensive) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Category Performance Segmented by Template Level</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row to expand/collapse its 6 underlying page levels (City, Country, Tour Detail, Attractions, Guides) or click URL to inspect queries.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing <strong>{filteredCategories.length}</strong> categories
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-72">Category / Page Level Hierarchy</th>
                  <th className="py-3 px-3 text-right">Organic Clicks</th>
                  <th className="py-3 px-3 text-right">YoY Click Delta</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR (%)</th>
                  <th className="py-3 px-3 text-right">Avg Position</th>
                  <th className="py-3 px-3 text-right">URLs</th>
                  <th className="py-3 px-3 text-right">Level Share</th>
                  <th className="py-3 px-4">Top Performing Landing Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat, idx) => {
                  const isExpanded = expandedCategories[cat.id] ?? false;
                  const levels: PageLevelMetricDetail[] = [
                    cat.cityLevel,
                    cat.countryLevel,
                    cat.tourDetailCity,
                    cat.tourDetailCountry,
                    cat.attractionPages,
                    cat.guidePages,
                  ];

                  const displayedLevels =
                    selectedLevelFilter === 'ALL'
                      ? levels
                      : levels.filter((l) => l.pageLevelKey === selectedLevelFilter);

                  return (
                    <React.Fragment key={cat.id}>
                      {/* Parent Category Row */}
                      <tr className="bg-slate-50/70 hover:bg-slate-100/80 font-bold border-t border-slate-200 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(cat.id)}
                            className="flex items-center gap-2 text-slate-900 hover:text-emerald-700 font-black text-left cursor-pointer group"
                          >
                            <span className="p-1 rounded bg-white border border-slate-200 shadow-2xs group-hover:border-emerald-400">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                              )}
                            </span>
                            <span className="text-sm font-black">{cat.categoryName}</span>
                          </button>
                          <div className="text-[11px] font-normal text-slate-500 ml-7 mt-0.5">
                            {cat.description}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                          {cat.totalClicks.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-semibold inline-flex items-center gap-0.5 text-xs ${
                              cat.yoyGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {cat.yoyGrowthPct >= 0 ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {cat.yoyGrowthPct >= 0 ? '+' : ''}
                            {cat.yoyGrowthPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {(cat.totalImpressions / 1000).toLocaleString()}K
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {cat.averageCtr.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700">
                          {cat.averagePosition.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600 font-semibold">
                          {cat.pageCount}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 bg-slate-200/80 rounded-md font-mono text-[11px] font-bold text-slate-800">
                            {cat.shareOfTotalClicks.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] text-slate-600 truncate max-w-xs">
                              {cat.cityLevel.topUrl}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedDrilldownCategory(cat.categoryName);
                                setSelectedDrilldownLevel('ALL');
                                setViewMode('urls');
                              }}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-0.5 whitespace-nowrap cursor-pointer"
                            >
                              <span>Inspect URLs</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Page Level Sub-Rows */}
                      {(isExpanded || selectedLevelFilter !== 'ALL') &&
                        displayedLevels.map((lvl) => {
                          const clickDelta = lvl.clicks - lvl.prevClicks;
                          const growth = lvl.prevClicks > 0 ? (clickDelta / lvl.prevClicks) * 100 : 0;
                          const levelColor = LEVEL_COLORS[lvl.pageLevelKey] || '#64748b';

                          return (
                            <tr
                              key={`${cat.id}-${lvl.pageLevelKey}`}
                              className="hover:bg-emerald-50/40 transition-colors bg-white group"
                            >
                              <td className="py-2.5 px-4 pl-10">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: levelColor }}
                                  />
                                  <span className="font-bold text-slate-800">{lvl.pageLevelLabel}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                                {lvl.clicks.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                <span
                                  className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                                    clickDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {clickDelta >= 0 ? '+' : ''}
                                  {clickDelta.toLocaleString()} ({growth >= 0 ? '+' : ''}
                                  {growth.toFixed(0)}%)
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                                {lvl.impressions.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                                {lvl.ctr.toFixed(2)}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                                {lvl.position.toFixed(1)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                                {lvl.urlCount}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${Math.min(100, lvl.shareOfCategoryClicks)}%`,
                                        backgroundColor: levelColor,
                                      }}
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-600 font-semibold w-8 text-right">
                                    {lvl.shareOfCategoryClicks.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="truncate max-w-xs">
                                    <span className="font-mono text-[11px] text-slate-700 font-medium">
                                      {lvl.topUrl}
                                    </span>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      Query: <em>{lvl.topQuery}</em>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedDrilldownCategory(cat.categoryName);
                                      setSelectedDrilldownLevel(lvl.pageLevelKey);
                                      setViewMode('urls');
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    View URLs
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CATEGORY BREAKDOWN CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCategories.map((cat) => {
            const levels = [
              cat.cityLevel,
              cat.countryLevel,
              cat.tourDetailCity,
              cat.tourDetailCountry,
              cat.attractionPages,
              cat.guidePages,
            ];

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{cat.categoryName}</h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                        {cat.shareOfTotalClicks.toFixed(1)}% Clicks Share
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-900">
                      {cat.totalClicks.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +{cat.yoyGrowthPct.toFixed(1)}% YoY
                    </div>
                  </div>
                </div>

                {/* Macro Summary Stats */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Impressions</div>
                    <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                      {(cat.totalImpressions / 1000).toLocaleString()}K
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Average CTR</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 mt-0.5">
                      {cat.averageCtr.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Position</div>
                    <div className="text-xs font-bold font-mono text-blue-600 mt-0.5">
                      {cat.averagePosition.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Page Level Stack Breakdown */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Performance by Template Level</span>
                    <span>Clicks & Share</span>
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100">
                    {levels.map((lvl) => {
                      const levelColor = LEVEL_COLORS[lvl.pageLevelKey] || '#64748b';
                      return (
                        <div
                          key={lvl.pageLevelKey}
                          className="pt-1.5 first:pt-0 flex items-center justify-between text-xs hover:bg-slate-50/80 p-1 rounded transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: levelColor }}
                            />
                            <div className="truncate">
                              <span className="font-semibold text-slate-800">{lvl.pageLevelLabel}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                ({lvl.urlCount} pages)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900">
                                {lvl.clicks.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                (CTR: {lvl.ctr.toFixed(1)}% | Pos: {lvl.position.toFixed(1)})
                              </span>
                            </div>
                            <span className="w-10 text-right font-mono font-bold text-emerald-700 text-[11px]">
                              {lvl.shareOfCategoryClicks.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer Top URL */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Top URL:</span>
                  <span className="font-mono text-slate-700 font-medium truncate max-w-xs">
                    {cat.cityLevel.topUrl}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: VISUAL COMPARATIVE CHARTS */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Category Organic Clicks by Page Level Hierarchy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stacked visualization of how clicks are distributed across City, Country, Tour Details, Attractions, and Guides.
                </p>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartStackedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [`${Number(value).toLocaleString()} clicks`, name]}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="City Level" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Country Level" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Tour Detail (City)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Tour Detail (Country)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Attraction Pages" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Guide Pages" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average CTR by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Average CTR (%) by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCategories}
                    layout="vertical"
                    margin={{ left: 80, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 2.5]} unit="%" />
                    <YAxis dataKey="categoryName" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Average CTR']} />
                    <Bar dataKey="averageCtr" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Position by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Average Google Rank Position (Lower is Better)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCategories}
                    layout="vertical"
                    margin={{ left: 80, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 10]} />
                    <YAxis dataKey="categoryName" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(val: any) => [`Pos ${Number(val).toFixed(1)}`, 'Avg SERP Position']} />
                    <Bar dataKey="averagePosition" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: URL DRILLDOWN EXPLORER */}
      {viewMode === 'urls' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Granular URL Inspector
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {selectedDrilldownCategory ? selectedDrilldownCategory : 'All Categories'} -{' '}
                {selectedDrilldownLevel ? selectedDrilldownLevel : 'All Levels'} URLs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact landing pages, search queries, CTR, ranking position, and click deltas.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedDrilldownCategory(null);
                setSelectedDrilldownLevel(null);
                setViewMode('matrix');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start"
            >
              Back to Matrix
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Landing Page URL</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Page Level</th>
                  <th className="py-2.5 px-3">Geo Scope</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">YoY Delta</th>
                  <th className="py-2.5 px-3 text-right">Impressions</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Rank</th>
                  <th className="py-2.5 px-3">Primary Query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drilldownUrls.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 max-w-xs truncate">
                      {u.url}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{u.category}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                        {u.pageLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {u.destinationCity || u.destinationCountry || u.geographicLevel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                      {u.clicks.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          u.clickGain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {u.clickGain >= 0 ? `+${u.clickGain.toLocaleString()}` : u.clickGain.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {u.impressions.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                      {(u.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {u.position.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">
                      {u.primaryQuery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategic Takeaway Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white border border-slate-700 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">
              Key Insights & Structural Findings Across Categories & Page Levels
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1 pt-1">
              <p>
                • <strong>City Level Dominance in Sightseeing:</strong> <em>City Tours & Sightseeing</em> generates <strong>57%</strong> of its organic clicks from top-level City Hub pages (e.g. <code>/Rome-Tours</code>, <code>/Tokyo-Tours</code>), indicating strong macro city search volume.
              </p>
              <p>
                • <strong>Product-Level Intent in Shore Excursions:</strong> Conversely, <em>Shore Excursions & Cruise Ports</em> captures <strong>49.4%</strong> of its volume from specific Tour Detail Pages (e.g. <code>/shore-excursions/Civitavecchia-Port</code>) with higher intent and conversion CTRs averaging <strong>1.78%</strong>.
              </p>
              <p>
                • <strong>High-Converting Guide Pages:</strong> <em>Private Tour Guides</em> drives <strong>35.6K clicks</strong> from Guide Profile & Directory pages with top SERP positions (average <strong>2.4</strong>), representing the highest organic click-through rate across all taxonomy levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
