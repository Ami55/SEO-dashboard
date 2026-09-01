/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActiveTab,
} from '../types';
import {
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  TrendingUp,
  FileText,
  Compass,
  BarChart3,
  Globe,
  Smartphone,
  AlertTriangle,
  Flame,
  PieChart,
  Target,
  ArrowUpRight,
  SlidersHorizontal,
  FolderTree,
  Database,
  Code2,
  Trophy,
  ShieldAlert,
  Calendar,
  Clock,
} from 'lucide-react';

export interface ReportItem {
  id: ActiveTab;
  title: string;
  category: 'core' | 'pages' | 'queries' | 'opportunities' | 'geo-device' | 'technical';
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const REPORT_MENU_ITEMS: ReportItem[] = [
  {
    id: 'upload-data',
    title: 'Upload GSC Data',
    category: 'core',
    badge: 'Data',
    icon: Database,
  },
  {
    id: 'bulk-seo-opportunities',
    title: 'Bulk SEO Opportunities & Actions',
    category: 'opportunities',
    badge: 'Bulk',
    icon: Target,
  },
  // Category & Template Performance
  {
    id: 'category-performance-matrix',
    title: 'Performance by Category & Page Level',
    category: 'pages',
    badge: 'Category',
    icon: Compass,
  },
  // 1 to 6 (Screenshot 1)
  {
    id: 'perf-page-group-landing',
    title: 'Performance by Page Group & Landing Page',
    category: 'pages',
    badge: 'Core',
    icon: Layers,
  },
  {
    id: 'search-query-performance',
    title: 'Search Query Performance',
    category: 'queries',
    badge: 'Core',
    icon: Search,
  },
  {
    id: 'trend-page-group',
    title: 'Clicks & Impressions Trend Page Group',
    category: 'pages',
    badge: 'Trends',
    icon: TrendingUp,
  },
  {
    id: 'search-demand-query-theme',
    title: 'Search Demand by Query Theme',
    category: 'queries',
    badge: 'Demand',
    icon: Compass,
  },
  {
    id: 'seo-winners-decliners',
    title: 'SEO Winners and Decliners',
    category: 'opportunities',
    badge: 'Movers',
    icon: Flame,
  },
  {
    id: 'perf-searcher-country',
    title: 'Performance by Searcher Country',
    category: 'geo-device',
    badge: 'Geo',
    icon: Globe,
  },

  // 7 to 15 (Screenshot 2)
  {
    id: 'top-10-pages-clicks',
    title: 'Top 10 Pages by Organic Clicks',
    category: 'pages',
    badge: 'Top 10',
    icon: FileText,
  },
  {
    id: 'query-page-ranking',
    title: 'Query and Page Ranking Performance',
    category: 'queries',
    badge: 'Rankings',
    icon: BarChart3,
  },
  {
    id: 'seo-quick-wins',
    title: 'SEO Quick Wins: High-Visibility Queries Near the Top',
    category: 'opportunities',
    badge: 'Quick Win',
    icon: Sparkles,
  },
  {
    id: 'organic-traffic-concentration',
    title: 'Organic Traffic Concentration',
    category: 'pages',
    badge: 'Pareto',
    icon: PieChart,
  },
  {
    id: 'non-branded-opportunities',
    title: 'Non-Branded SEO Opportunities',
    category: 'opportunities',
    badge: 'Non-Brand',
    icon: Target,
  },
  {
    id: 'high-imp-below-p1',
    title: 'High-Impression Queries Below Page One',
    category: 'opportunities',
    badge: 'Page 2-3',
    icon: ArrowUpRight,
  },
  {
    id: 'branded-vs-non-branded',
    title: 'Branded vs Non-Branded Search Performance',
    category: 'queries',
    badge: 'Brand Split',
    icon: SlidersHorizontal,
  },
  {
    id: 'high-vis-zero-clicks',
    title: 'High-Visibility Queries With Zero Clicks',
    category: 'opportunities',
    badge: 'Zero Click',
    icon: AlertTriangle,
  },
  {
    id: 'low-ctr-opportunities',
    title: 'Low-CTR Opportunities',
    category: 'opportunities',
    badge: 'CTR Gap',
    icon: TrendingUp,
  },

  // 16 to 19 (Screenshot 3)
  {
    id: 'keyword-cannibalization',
    title: 'Potential Keyword Cannibalization',
    category: 'opportunities',
    badge: 'Audit',
    icon: AlertTriangle,
  },
  {
    id: 'top-10-search-visibility',
    title: 'Top 10 Search Visibility',
    category: 'queries',
    badge: 'Visibility',
    icon: BarChart3,
  },
  {
    id: 'unclassified-urls',
    title: 'Unclassified URLs',
    category: 'technical',
    badge: 'Taxonomy',
    icon: FolderTree,
  },
  {
    id: 'clicks-by-device',
    title: 'Clicks by Device',
    category: 'geo-device',
    badge: 'Devices',
    icon: Smartphone,
  },

  // Additional Technical & Executive Reports
  {
    id: 'insight-wrap-up',
    title: 'Insights Wrap-Up: Actions, Opportunities & Wins',
    category: 'core',
    badge: 'Executive',
    icon: Trophy,
  },
  {
    id: 'custom-insights',
    title: 'Custom GSC Insights & Advanced Intelligence',
    category: 'opportunities',
    badge: 'AI & ROI',
    icon: Sparkles,
  },
  {
    id: 'gsc-calculated-dimensions',
    title: 'GSC Calculated Dimensions & SQL CASE',
    category: 'technical',
    badge: 'SQL CASE',
    icon: Code2,
  },
  {
    id: 'executive-summary',
    title: 'Executive Summary Scorecards',
    category: 'core',
    badge: 'Summary',
    icon: BarChart3,
  },
];

interface LeftReportSidebarProps {
  activeReport: ActiveTab;
  onSelectReport: (reportId: ActiveTab) => void;
  className?: string;
}

export const LeftReportSidebar: React.FC<LeftReportSidebarProps> = ({
  activeReport,
  onSelectReport,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isAlgoActive = activeReport === 'google-algorithm-updates';

  const filteredReports = REPORT_MENU_ITEMS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <aside
      className={`w-full lg:w-72 xl:w-80 shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 sm:p-4 gap-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-100px)] ${className}`}
      id="left-report-navigation-menu"
      aria-label="Reports Navigation Menu"
    >
      {/* SEPARATE DEDICATED ALGORITHM UPDATE IMPACT MODULE (Distinct from sidebar options) */}
      <div className="pb-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1.5 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          Specialized Engine
        </div>

        <button
          onClick={() => onSelectReport('google-algorithm-updates')}
          id="btn-dedicated-algo-update"
          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
            isAlgoActive
              ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-emerald-500'
              : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white border-emerald-800/80 hover:border-emerald-500 shadow-xs hover:shadow-md'
          }`}
        >
          {/* Subtle Glow Accent */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/30 transition-all" />

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Google Algorithm Updates
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Impact Hub
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Analyze confirmed Aug 2026 Core, June 2026 Spam, and historical rollouts with timeline release & finish annotations.
          </p>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <Clock className="w-3 h-3" />
              Track & Annotate Future Updates
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Divider Separating Algorithm Engine from standard reports */}
      <div className="border-t border-slate-200/80 -mx-1" />

      {/* Menu Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            SEO Reports Navigation
          </div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Reports Directory
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full ml-1">
              {REPORT_MENU_ITEMS.length} Reports
            </span>
          </h2>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Filter ${REPORT_MENU_ITEMS.length} reports...`}
          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            ×
          </button>
        )}
      </div>

      {/* Reports List - High-contrast, Unclipped, Emerald Accent Bar */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-290px)] pr-1 custom-scrollbar">
        {filteredReports.map((report) => {
          const isActive = activeReport === report.id;

          return (
            <button
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              id={`report-btn-${report.id}`}
              className={`group relative w-full text-left transition-all duration-150 rounded-lg overflow-hidden border shrink-0 min-h-[46px] flex items-center ${
                isActive
                  ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 font-medium hover:border-emerald-300 shadow-xs'
              }`}
            >
              {/* Left Emerald Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all ${
                  isActive
                    ? 'bg-emerald-500 w-2'
                    : 'bg-emerald-500/80 w-1.5 group-hover:bg-emerald-600 group-hover:w-2'
                }`}
              />

              {/* Button Content */}
              <div className="pl-4 pr-3 py-2.5 w-full flex items-center justify-between gap-2">
                <span className={`text-[13px] leading-snug flex-1 ${isActive ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                  {report.title}
                </span>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive
                      ? 'text-emerald-600 translate-x-0.5'
                      : 'text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            No reports matching "{searchTerm}"
          </div>
        )}
      </nav>

      {/* Quick Category Filters Footer */}
      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'pages', label: 'Pages' },
          { id: 'queries', label: 'Queries' },
          { id: 'opportunities', label: 'Opportunities' },
          { id: 'technical', label: 'Tech & Geo' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-emerald-700 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
