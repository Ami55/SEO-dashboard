/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ActiveTab,
  DashboardFilterState,
  PropertyTotals,
  TblPageItem,
  TblQueryItem,
  CannibalisationQuery,
} from '../types';
import {
  TOURS_PAGES,
  TOURS_QUERIES,
  CANNIBALISATION_QUERIES,
  COUNTRY_PERFORMANCE_DATA,
  DEVICE_PERFORMANCE_DATA,
  PAGE_GROUP_PERFORMANCE_DATA,
} from '../toursData';
import { GoogleAlgorithmUpdatesReport } from './GoogleAlgorithmUpdatesReport';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Globe,
  Smartphone,
  CheckCircle2,
  PieChart as PieIcon,
  Flame,
  Target,
  FileText,
  BarChart3,
  HelpCircle,
  Clock,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { classifyUrlTaxonomy } from '../utils/sitemapClassifier';
import { CategoryHierarchyPerformanceSection } from './CategoryHierarchyPerformanceSection';

interface DedicatedReportViewProps {
  reportId: ActiveTab;
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
  onFilterChange?: (filters: DashboardFilterState) => void;
}

// Color palette with emerald green as primary
const COLORS = ['#10b981', '#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export const DedicatedReportView: React.FC<DedicatedReportViewProps> = ({
  reportId,
  propertyTotals,
  filters,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');
  const [sortAsc, setSortAsc] = useState(false);

  // Common export CSV handler
  const exportCsv = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 0. Performance by Category & Page Level (City, Country, Detail, Attraction, Guide)
  // =========================================================================
  if (reportId === 'category-performance-matrix') {
    return (
      <CategoryHierarchyPerformanceSection
        propertyTotals={propertyTotals}
        filters={filters}
        pages={TOURS_PAGES}
      />
    );
  }

  // =========================================================================
  // 1. Performance by Page Group & Landing Page
  // =========================================================================
  if (reportId === 'perf-page-group-landing') {
    const filteredPages = TOURS_PAGES.filter((p) => {
      const matchesSearch = p.page.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroupFilter === 'ALL' || p.pageGroup === selectedGroupFilter;
      return matchesSearch && matchesGroup;
    }).sort((a, b) => {
      const factor = sortAsc ? 1 : -1;
      return (a[sortField] - b[sortField]) * factor;
    });

    return (
      <div className="space-y-6" id="report-perf-page-group-landing">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 1</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">Performance by Page Group & Landing Page</h1>
              <p className="text-xs text-slate-500 mt-1">
                Deconstruct organic search traffic across 14 Page Groups and hierarchical landing page templates.
              </p>
            </div>
            <button
              onClick={() => exportCsv(filteredPages, 'Performance_By_Page_Group_Landing_Page')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold self-start"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          {/* Scorecards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-700 font-semibold">Total Filtered Clicks</div>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {filteredPages.reduce((acc, p) => acc + p.clicks, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">{filteredPages.length} Landing Pages</div>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold">Total Impressions</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {filteredPages.reduce((acc, p) => acc + p.impressions, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Organic Search Visibility</div>
            </div>
            <div className="bg-indigo-50/60 p-3.5 rounded-lg border border-indigo-100">
              <div className="text-xs text-indigo-700 font-semibold">Weighted CTR</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">
                {(
                  (filteredPages.reduce((acc, p) => acc + p.clicks, 0) /
                    Math.max(1, filteredPages.reduce((acc, p) => acc + p.impressions, 0))) *
                  100
                ).toFixed(2)}
                %
              </div>
              <div className="text-[11px] text-indigo-600 mt-0.5">Calculated CTR</div>
            </div>
            <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-100">
              <div className="text-xs text-amber-700 font-semibold">Avg Position</div>
              <div className="text-2xl font-black text-amber-900 mt-1">
                {(filteredPages.reduce((acc, p) => acc + p.position, 0) / Math.max(1, filteredPages.length)).toFixed(1)}
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">Top-of-Page Placement</div>
            </div>
          </div>
        </div>

        {/* Page Group Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Traffic Share by Page Group</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PAGE_GROUP_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="pageGroup" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#2563eb" name="Organic Clicks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prevClicks" fill="#94a3b8" name="Previous Period Clicks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Data Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search landing page URL..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 w-full sm:w-auto"
            >
              <option value="ALL">All Page Groups</option>
              {PAGE_GROUP_PERFORMANCE_DATA.map((pg) => (
                <option key={pg.pageGroup} value={pg.pageGroup}>
                  {pg.pageGroup}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Landing Page</th>
                  <th className="py-2.5 px-3">Page Group</th>
                  <th className="py-2.5 px-3">Page Level</th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => { setSortField('clicks'); setSortAsc(!sortAsc); }}>
                    Clicks {sortField === 'clicks' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => { setSortField('impressions'); setSortAsc(!sortAsc); }}>
                    Impressions {sortField === 'impressions' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => { setSortField('ctr'); setSortAsc(!sortAsc); }}>
                    CTR {sortField === 'ctr' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => { setSortField('position'); setSortAsc(!sortAsc); }}>
                    Position {sortField === 'position' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th className="py-2.5 px-3">Gain (YoY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPages.slice(0, 25).map((page) => (
                  <tr key={page.id} className="hover:bg-blue-50/40">
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-600 max-w-xs truncate">
                      {page.page}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        {page.pageGroup}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{page.pageLevel}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{page.clicks.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-600">{page.impressions.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">{(page.ctr * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{page.position.toFixed(1)}</td>
                    <td className="py-2.5 px-3">
                      {(page.clickGain ?? 0) >= 0 ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> +{(page.clickGain ?? 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                          <ArrowDownRight className="w-3 h-3" /> {(page.clickGain ?? 0).toLocaleString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Search Query Performance
  // =========================================================================
  if (reportId === 'search-query-performance') {
    const filteredQueries = TOURS_QUERIES.filter((q) =>
      q.query.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6" id="report-search-query-performance">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 2</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">Search Query Performance</h1>
              <p className="text-xs text-slate-500 mt-1">
                Detailed analysis of organic search queries, rankings, click-through rates, and query themes.
              </p>
            </div>
            <button
              onClick={() => exportCsv(filteredQueries, 'Search_Query_Performance')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold self-start"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter search queries..."
              className="w-full sm:w-80 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3">Brand Type</th>
                  <th className="py-2.5 px-3">Theme</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Top Landing Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.slice(0, 30).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{q.query}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.queryType === 'Branded'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.queryType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{q.queryTheme}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{q.clicks.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-600">{q.impressions.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-medium">{(q.ctr * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{q.position.toFixed(1)}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">{q.landingPage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Clicks & Impressions Trend Page Group
  // =========================================================================
  if (reportId === 'trend-page-group') {
    return (
      <div className="space-y-6" id="report-trend-page-group">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 3</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Clicks & Impressions Trend Page Group</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical growth and volume trends segmented across Page Groups over the past 12 months.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Page Group Performance Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PAGE_GROUP_PERFORMANCE_DATA} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="pageGroup" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#2563eb" name="Current Clicks" radius={[0, 4, 4, 0]} />
                <Bar dataKey="prevClicks" fill="#93c5fd" name="Previous Clicks" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Search Demand by Query Theme
  // =========================================================================
  if (reportId === 'search-demand-query-theme') {
    const themeData = [
      { theme: 'City Tours & Sightseeing', impressions: 16800000, clicks: 278000, ctr: 1.65 },
      { theme: 'Private Guide Services', impressions: 9400000, clicks: 164000, ctr: 1.74 },
      { theme: 'Shore Excursions & Cruise Ports', impressions: 6800000, clicks: 98000, ctr: 1.44 },
      { theme: 'Food & Wine Tastings', impressions: 4200000, clicks: 54000, ctr: 1.28 },
      { theme: 'Day Trips & Excursions', impressions: 3100000, clicks: 31000, ctr: 1.00 },
      { theme: 'Walking & Historical Tours', impressions: 1800000, clicks: 14000, ctr: 0.77 },
      { theme: 'Safaris & Nature', impressions: 750000, clicks: 3850, ctr: 0.51 },
    ];

    return (
      <div className="space-y-6" id="report-search-demand-query-theme">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 4</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Search Demand by Query Theme</h1>
          <p className="text-xs text-slate-500 mt-1">
            Macro search demand (impressions) versus captured intent (organic clicks) categorized by travel intent themes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Demand Distribution (Impressions)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={themeData} dataKey="impressions" nameKey="theme" cx="50%" cy="50%" outerRadius={80} label>
                    {themeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Captured Clicks by Theme</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={themeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="theme" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Query Theme</th>
                <th className="py-2.5 px-3">Total Demand (Impressions)</th>
                <th className="py-2.5 px-3">Captured Clicks</th>
                <th className="py-2.5 px-3">Demand Capture CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {themeData.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{t.theme}</td>
                  <td className="py-2.5 px-3 text-slate-600">{t.impressions.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{t.clicks.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-medium text-emerald-600">{t.ctr.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // =========================================================================
  // 5. SEO Winners and Decliners (Content Decay Analysis)
  // =========================================================================
  if (reportId === 'seo-winners-decliners') {
    const getPageGain = (p: TblPageItem) => {
      if (p.clickGain !== undefined) return p.clickGain;
      if (p.clickLoss !== undefined) return -p.clickLoss;
      return (p.clicks ?? 0) - (p.prevClicks ?? p.clicks ?? 0);
    };

    const winners = TOURS_PAGES.filter((p) => getPageGain(p) > 0).sort((a, b) => getPageGain(b) - getPageGain(a));
    const decliners = TOURS_PAGES.filter((p) => getPageGain(p) < 0).sort((a, b) => getPageGain(a) - getPageGain(b));

    const totalWonClicks = winners.reduce((acc, w) => acc + getPageGain(w), 0);
    const totalLostClicks = decliners.reduce((acc, d) => acc + Math.abs(getPageGain(d)), 0);

    return (
      <div className="space-y-6" id="report-seo-winners-decliners">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 5</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">SEO Winners and Decliners</h1>
              <p className="text-xs text-slate-500 mt-1">
                Identify momentum leaders driving organic growth and audit URLs experiencing content decay (-Clicks).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  exportCsv(
                    decliners.map((d) => ({
                      page: d.page,
                      pageGroup: d.pageGroup,
                      pageLevel: d.pageLevel,
                      currentClicks: d.clicks,
                      prevClicks: d.prevClicks,
                      clickLoss: Math.abs(getPageGain(d)),
                      currentImpressions: d.impressions,
                      prevImpressions: d.prevImpressions,
                      ctr: `${(d.ctr * 100).toFixed(2)}%`,
                      prevCtr: `${(d.prevCtr * 100).toFixed(2)}%`,
                      position: d.position.toFixed(1),
                      prevPosition: d.prevPosition?.toFixed(1) ?? 'N/A',
                      decayDiagnosis: d.decayPattern || 'Clicks declined YoY',
                    })),
                    'Content_Decay_Decliners_Audit'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Decliners (CSV)
              </button>
            </div>
          </div>

          {/* Aggregate Momentum Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Growing URLs (Winners)</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{winners.length} URLs</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">+{totalWonClicks.toLocaleString()} total click gain</div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Decaying URLs (Decliners)</div>
              <div className="text-xl font-black text-rose-700 mt-0.5">{decliners.length} URLs</div>
              <div className="text-[11px] text-rose-600 font-medium mt-0.5">-{totalLostClicks.toLocaleString()} total click loss</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Top Winning Group</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">City or Area Pages</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Rome, Tokyo, Kyoto, Paris</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Top Decay Category</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">Attractions & Blogs</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Requires SERP snippet & schema refresh</div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Winner / Decliner Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Winners */}
          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-emerald-950">Top Organic Winners (+Clicks)</h2>
                  <p className="text-[11px] text-emerald-700">Highest positive absolute click delta YoY</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {winners.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {winners.slice(0, 6).map((w) => {
                const gain = getPageGain(w);
                const posDelta = (w.prevPosition ?? w.position) - w.position;
                return (
                  <div
                    key={w.id}
                    className="p-3.5 bg-emerald-50/40 hover:bg-emerald-50/80 transition-colors rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-bold text-slate-900 truncate">{w.page}</div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">{w.pageGroup}</span>
                        <span>•</span>
                        <span>Pos: <strong className="text-slate-800">{w.position.toFixed(1)}</strong></span>
                        {posDelta > 0 && (
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            ↑ +{posDelta.toFixed(1)} pos
                          </span>
                        )}
                        <span>•</span>
                        <span>CTR: {(w.ctr * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="text-right sm:text-right shrink-0">
                      <div className="text-xs font-black text-emerald-600 font-mono">+{gain.toLocaleString()} clicks</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {w.prevClicks.toLocaleString()} → {w.clicks.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Decliners / Content Decay */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-rose-950">Content Decay / Decliners (-Clicks)</h2>
                  <p className="text-[11px] text-rose-700">URLs with significant click erosion needing optimization</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                {decliners.length} Identified
              </span>
            </div>

            <div className="space-y-3">
              {decliners.slice(0, 6).map((d) => {
                const loss = Math.abs(getPageGain(d));
                const posWorsened = d.position - (d.prevPosition ?? d.position);
                return (
                  <div
                    key={d.id}
                    className="p-3.5 bg-rose-50/40 hover:bg-rose-50/80 transition-colors rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-bold text-slate-900 truncate">{d.page}</div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">{d.pageGroup}</span>
                        <span>•</span>
                        <span>Pos: <strong className="text-slate-800">{d.position.toFixed(1)}</strong></span>
                        {posWorsened > 0 ? (
                          <span className="text-rose-700 font-bold text-[10px] bg-rose-100/80 px-1.5 py-0.2 rounded">
                            ↓ {d.prevPosition?.toFixed(1)} → {d.position.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Rank stable</span>
                        )}
                        <span>•</span>
                        <span>CTR: {(d.ctr * 100).toFixed(2)}%</span>
                      </div>
                      {d.decayPattern && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{d.decayPattern}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right sm:text-right shrink-0">
                      <div className="text-xs font-black text-rose-600 font-mono">-{loss.toLocaleString()} clicks</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {d.prevClicks.toLocaleString()} → {d.clicks.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Decay Audit & Diagnostics Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Content Decay Diagnostic & Remediation Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Root-cause analysis comparing impressions, CTR, and ranking drop for every declining URL.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Declining Landing Page</th>
                  <th className="py-2.5 px-3">Page Group</th>
                  <th className="py-2.5 px-3">Current Clicks</th>
                  <th className="py-2.5 px-3">Prev Clicks</th>
                  <th className="py-2.5 px-3">Click Loss</th>
                  <th className="py-2.5 px-3">CTR Shift</th>
                  <th className="py-2.5 px-3">Position Shift</th>
                  <th className="py-2.5 px-3">Decay Diagnosis</th>
                  <th className="py-2.5 px-3">Recommended SEO Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {decliners.map((d) => {
                  const loss = Math.abs(getPageGain(d));
                  const ctrShift = (d.ctr - d.prevCtr) * 100;
                  const posShift = d.position - (d.prevPosition ?? d.position);

                  let action = 'Refresh content, update dates, and enhance internal links.';
                  if (d.decayPattern?.includes('CTR declined')) {
                    action = 'Rewrite title tag & meta description to match changing search intent and boost SERP CTR.';
                  } else if (d.decayPattern?.includes('Position worsened')) {
                    action = 'Expand semantic depth, audit competitor backlinks, and update FAQ structured data.';
                  } else if (d.decayPattern?.includes('both declined')) {
                    action = 'Full content overhaul, prune obsolete sections, and add high-intent user FAQs.';
                  } else if (d.decayPattern?.includes('Impressions increased')) {
                    action = 'Target search intent disconnect: optimize above-the-fold content and CTA readability.';
                  }

                  return (
                    <tr key={d.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900 truncate max-w-xs">{d.page}</div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">{d.pageLevel}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{d.pageGroup}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">{d.clicks.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{d.prevClicks.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">-{loss.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className={ctrShift < 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {(d.ctr * 100).toFixed(2)}% ({ctrShift > 0 ? '+' : ''}
                          {ctrShift.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={posShift > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>
                          {d.prevPosition?.toFixed(1) ?? '-'} → {d.position.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          {d.decayPattern || 'YoY Click Erosion'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs">{action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. Performance by Searcher Country
  // =========================================================================
  if (reportId === 'perf-searcher-country') {
    return (
      <div className="space-y-6" id="report-perf-searcher-country">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 6</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Performance by Searcher Country</h1>
          <p className="text-xs text-slate-500 mt-1">
            Geographic distribution of Google Search Console impressions, clicks, and ranking performance.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COUNTRY_PERFORMANCE_DATA.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#2563eb" name="Organic Clicks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Searcher Country</th>
                <th className="py-2.5 px-3">Clicks</th>
                <th className="py-2.5 px-3">Impressions</th>
                <th className="py-2.5 px-3">CTR</th>
                <th className="py-2.5 px-3">Avg Position</th>
                <th className="py-2.5 px-3">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COUNTRY_PERFORMANCE_DATA.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{c.country}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{c.clicks.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-600">{c.impressions.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-medium">{(c.ctr * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-slate-700">{c.position.toFixed(1)}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {((c.clicks / propertyTotals.currentClicks) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. Top 10 Pages by Organic Clicks
  // =========================================================================
  if (reportId === 'top-10-pages-clicks') {
    const top10 = [...TOURS_PAGES].sort((a, b) => b.clicks - a.clicks).slice(0, 10);

    return (
      <div className="space-y-6" id="report-top-10-pages-clicks">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 7</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Top 10 Pages by Organic Clicks</h1>
          <p className="text-xs text-slate-500 mt-1">
            The power-law organic landing pages generating the core share of site organic traffic.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 10 }} width={160} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top10.map((page, idx) => (
            <div key={page.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                #{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900 truncate">{page.page}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{page.pageGroup} • {page.pageLevel}</div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="font-bold text-blue-600">{page.clicks.toLocaleString()} clicks</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">{page.impressions.toLocaleString()} imp</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-emerald-600 font-semibold">{(page.ctr * 100).toFixed(2)}% CTR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. Query and Page Ranking Performance
  // =========================================================================
  if (reportId === 'query-page-ranking') {
    const buckets = [
      { bucket: 'Pos 1 - 3 (Top SERP)', range: '1.0 - 3.9', count: 48, clicks: 382000, impressions: 2100000, avgCtr: 0.1819, share: '59.4%', color: '#10b981', action: 'Defend rank & claim SERP Rich Snippets' },
      { bucket: 'Pos 4 - 10 (Page 1)', range: '4.0 - 10.0', count: 92, clicks: 184000, impressions: 5410000, avgCtr: 0.0340, share: '28.6%', color: '#3b82f6', action: 'Striking distance: title tags & internal links' },
      { bucket: 'Pos 11 - 20 (Page 2)', range: '11.0 - 20.0', count: 140, clicks: 54000, impressions: 6000000, avgCtr: 0.0090, share: '8.4%', color: '#f59e0b', action: 'Expand content depth & add FAQ schema' },
      { bucket: 'Pos 21 - 50 (Page 3-5)', range: '21.0 - 50.0', count: 210, clicks: 18000, impressions: 6420000, avgCtr: 0.0028, share: '2.8%', color: '#8b5cf6', action: 'Consolidate thin pages / thematic hubs' },
      { bucket: 'Pos 51+ (Deep)', range: '51.0+', count: 320, clicks: 4850, impressions: 6020000, avgCtr: 0.0008, share: '0.8%', color: '#64748b', action: 'Prune / redirect low value query targets' },
    ];

    const ctrCurveData = [
      { pos: 'Rank 1', ctr: 28.5, benchmark: 27.6 },
      { pos: 'Rank 2', ctr: 15.2, benchmark: 15.8 },
      { pos: 'Rank 3', ctr: 10.8, benchmark: 11.0 },
      { pos: 'Rank 4', ctr: 6.4, benchmark: 6.8 },
      { pos: 'Rank 5', ctr: 4.8, benchmark: 5.1 },
      { pos: 'Rank 6-10', ctr: 2.3, benchmark: 2.5 },
      { pos: 'Rank 11-20', ctr: 0.9, benchmark: 1.0 },
      { pos: 'Rank 21+', ctr: 0.2, benchmark: 0.2 },
    ];

    return (
      <div className="space-y-6" id="report-query-page-ranking">
        {/* Header Strip */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 8</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">Query and Page Ranking Performance</h1>
              <p className="text-xs text-slate-500 mt-1">
                Ranking position tier distribution and SERP visibility across 810 active search queries and mapped URLs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  exportCsv(
                    TOURS_QUERIES.map((q) => ({
                      query: q.query,
                      landingPage: q.landingPage,
                      position: q.position.toFixed(1),
                      tier: q.position <= 3.9 ? 'Pos 1-3 (Top SERP)' : q.position <= 10.0 ? 'Pos 4-10 (Page 1)' : q.position <= 20.0 ? 'Pos 11-20 (Page 2)' : 'Pos 21+',
                      clicks: q.clicks,
                      impressions: q.impressions,
                      ctr: `${(q.ctr * 100).toFixed(2)}%`,
                    })),
                    'Query_Ranking_Tier_Performance'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export All Tiers (CSV)
              </button>
            </div>
          </div>

          {/* Aggregate Math Confirmation */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Total Clicks Across Tiers: <strong className="text-slate-900 font-mono">642,850</strong> (100% of GSC Property Total)</span>
            </div>
            <div className="text-slate-400">
              Top 3 Ranks Drive <strong className="text-emerald-700">59.4%</strong> of Total Organic Traffic
            </div>
          </div>
        </div>

        {/* 5 Position Tier Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {buckets.map((b, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">{b.bucket}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600">{b.range}</span>
              </div>
              <div className="text-xl font-black text-slate-900 mt-2 font-mono">{b.clicks.toLocaleString()}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{b.count} Queries</span>
                <span className="font-bold text-emerald-600">{b.share}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Avg CTR: <strong className="text-slate-700 font-mono">{(b.avgCtr * 100).toFixed(1)}%</strong></span>
                <span>{(b.impressions / 1000000).toFixed(1)}M imp</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Charts: Clicks by Tier & SERP CTR Curve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Traffic by Position Tier */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Organic Clicks & Impressions by Position Tier
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">Comparison of volume capture across SERP ranking brackets.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" name="Organic Clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: CTR Decay Curve vs Industry Benchmark */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Google SERP Organic CTR Curve
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">Actual GSC Click-Through Rate vs. Travel Industry Benchmarks.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ctrCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="pos" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="ctr" name="Site CTR (%)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="benchmark" name="Travel Benchmark (%)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Tier Breakdown & Strategic Guidance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3">SERP Tier Breakdown & Action Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-emerald-950">Tier 1: Top 3 Positions (59.4%)</span>
              </div>
              <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generates <strong className="text-emerald-800">382,000 clicks</strong> at an average 18.2% CTR. Focus strategy: Defend positions with freshness updates, add Product & FAQ schema for SERP real estate.
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-blue-950">Tier 2: Positions 4-10 (28.6%)</span>
              </div>
              <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generates <strong className="text-blue-800">184,000 clicks</strong> across 5.41M impressions. Highest ROI opportunity: Moving these 92 queries into Top 3 will yield +95,000 additional monthly clicks.
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold text-amber-950">Tier 3: Page 2 & Beyond (12.0%)</span>
              </div>
              <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                Generates <strong className="text-amber-800">76,850 clicks</strong> across 18.4M impressions. Requires content consolidation, contextual internal linking from City Hubs, and keyword cannibalization audits.
              </div>
            </div>
          </div>
        </div>

        {/* Representative Queries Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Sample Queries Across SERP Tiers</h2>
              <p className="text-xs text-slate-500">Representative high-volume queries mapped to ranking positions.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3">Mapped Landing Page</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {TOURS_QUERIES.slice(0, 10).map((q) => {
                  const isTop3 = q.position <= 3.9;
                  const isP1 = q.position <= 10.0;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{q.query}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">{q.landingPage}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{q.position.toFixed(1)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isTop3
                              ? 'bg-emerald-100 text-emerald-800'
                              : isP1
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isTop3 ? 'Pos 1-3' : isP1 ? 'Pos 4-10' : 'Page 2+'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{q.clicks.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{q.impressions.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-medium">{(q.ctr * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9. SEO Quick Wins: High-Visibility Queries Near the Top
  // =========================================================================
  if (reportId === 'seo-quick-wins') {
    const quickWins = TOURS_QUERIES.filter((q) => q.position >= 4 && q.position <= 12 && q.impressions > 50000).sort(
      (a, b) => b.impressions - a.impressions
    );

    return (
      <div className="space-y-6" id="report-seo-quick-wins">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 9</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">SEO Quick Wins: High-Visibility Queries Near the Top</h1>
              <p className="text-xs text-slate-500 mt-1">
                Queries ranking in positions 4.0 to 12.0 with high impression volume that can unlock substantial clicks with modest on-page optimization.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  exportCsv(
                    quickWins.map((q) => ({
                      query: q.query,
                      landingPage: q.landingPage,
                      currentPosition: q.position.toFixed(1),
                      impressions: q.impressions,
                      currentClicks: q.clicks,
                      estimatedClickGain: Math.round(q.impressions * 0.08),
                    })),
                    'SEO_Quick_Wins_Opportunity'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Quick Wins (CSV)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-3">
            {quickWins.map((q) => (
              <div key={q.id} className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{q.query}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{q.landingPage}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                      Current Position: #{q.position.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-500">Impressions: {q.impressions.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700">Estimated +{Math.round(q.impressions * 0.08).toLocaleString()} Clicks</div>
                  <div className="text-[10px] text-slate-400">If moved to Position #1-3</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 10. Organic Traffic Concentration (Pareto Curve & Portfolio Risk)
  // =========================================================================
  if (reportId === 'organic-traffic-concentration') {
    const sortedPages = [...TOURS_PAGES].sort((a, b) => b.clicks - a.clicks);
    const totalSiteClicks = propertyTotals.currentClicks;

    // Build Pareto Lorenz curve data
    let accumulatedClicks = 0;
    const paretoCurve = sortedPages.slice(0, 15).map((page, index) => {
      accumulatedClicks += page.clicks;
      const pctOfUrls = Math.round(((index + 1) / sortedPages.length) * 100);
      const cumPctClicks = Math.round((accumulatedClicks / totalSiteClicks) * 1000) / 10;
      return {
        urlRank: `Top ${index + 1} URLs`,
        urlName: page.page,
        clicks: page.clicks,
        cumPctClicks,
        pctOfUrls,
        equalLine: pctOfUrls,
      };
    });

    return (
      <div className="space-y-6" id="report-organic-traffic-concentration">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 10</div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">Organic Traffic Concentration</h1>
              <p className="text-xs text-slate-500 mt-1">
                Pareto distribution curve and portfolio risk analysis measuring organic dependency on top landing pages.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  exportCsv(
                    sortedPages.map((p, idx) => ({
                      rank: idx + 1,
                      landingPage: p.page,
                      pageGroup: p.pageGroup,
                      pageLevel: p.pageLevel,
                      clicks: p.clicks,
                      impressions: p.impressions,
                      shareOfSiteClicks: `${((p.clicks / totalSiteClicks) * 100).toFixed(2)}%`,
                    })),
                    'Organic_Traffic_Concentration_Audit'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Concentration Matrix (CSV)
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pareto Tier Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs">
            <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Top 1% of Pages</div>
            <div className="text-3xl font-black text-blue-600 mt-1 font-mono">42.8%</div>
            <div className="text-xs text-slate-500 mt-1">275,000 clicks generated by top 4 URLs</div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-blue-700 font-medium">
              High Traffic Concentration
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Top 5% of Pages</div>
            <div className="text-3xl font-black text-emerald-600 mt-1 font-mono">68.4%</div>
            <div className="text-xs text-slate-500 mt-1">439,700 clicks across 15 core hubs</div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-medium">
              Core Revenue Drivers
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-xs">
            <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Top 20% of Pages</div>
            <div className="text-3xl font-black text-indigo-600 mt-1 font-mono">89.1%</div>
            <div className="text-xs text-slate-500 mt-1">572,800 clicks (Classic Pareto 80/20)</div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-indigo-700 font-medium">
              Established Authority Set
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Remaining 80% (Long Tail)</div>
            <div className="text-3xl font-black text-slate-700 mt-1 font-mono">10.9%</div>
            <div className="text-xs text-slate-500 mt-1">70,050 clicks across hundreds of URLs</div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-600 font-medium">
              Growth Expansion Runway
            </div>
          </div>
        </div>

        {/* Visual Pareto / Lorenz Curve Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Cumulative Traffic Concentration Curve (Lorenz Model)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The green curve demonstrates steep power-law concentration where the top 5 URLs produce over 40% of total site clicks.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paretoCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="paretoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="urlRank" tick={{ fontSize: 10 }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="cumPctClicks" name="Cumulative % of Organic Clicks" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#paretoGrad)" />
                <Line type="monotone" dataKey="equalLine" name="Equal Distribution Line" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Concentrated Landing Pages Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Concentrated Organic Landing Pages</h2>
              <p className="text-xs text-slate-500">Ranked contribution to total GSC domain traffic.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Landing Page</th>
                  <th className="py-2.5 px-3">Page Group</th>
                  <th className="py-2.5 px-3">Page Level</th>
                  <th className="py-2.5 px-3">Organic Clicks</th>
                  <th className="py-2.5 px-3">Share of Site</th>
                  <th className="py-2.5 px-3">Cumulative Share</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {sortedPages.slice(0, 10).map((page, idx) => {
                  const sharePct = (page.clicks / totalSiteClicks) * 100;
                  const isTop5 = idx < 5;
                  return (
                    <tr key={page.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-700">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 max-w-xs truncate">{page.page}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{page.pageGroup}</td>
                      <td className="py-2.5 px-3 text-slate-500">{page.pageLevel}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{page.clicks.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{sharePct.toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                        {(sortedPages.slice(0, idx + 1).reduce((acc, p) => acc + p.clicks, 0) / totalSiteClicks * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isTop5
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isTop5 ? 'High Concentration Risk' : 'Diversified Asset'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 11. Non-Branded SEO Opportunities
  // =========================================================================
  if (reportId === 'non-branded-opportunities') {
    const nonBranded = TOURS_QUERIES.filter((q) => q.queryType === 'Non-Branded').sort((a, b) => b.clicks - a.clicks);

    return (
      <div className="space-y-6" id="report-non-branded-opportunities">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 11</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Non-Branded SEO Opportunities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generic search volume capturing unbranded discovery queries for private tours, attractions, and activities.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Non-Branded Query</th>
                  <th className="py-2.5 px-3">Theme</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                  <th className="py-2.5 px-3">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nonBranded.slice(0, 20).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{q.query}</td>
                    <td className="py-2.5 px-3 text-slate-600">{q.queryTheme}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{q.clicks.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-600">{q.impressions.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-medium">{(q.ctr * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 12. High-Impression Queries Below Page One
  // =========================================================================
  if (reportId === 'high-imp-below-p1') {
    const belowP1 = TOURS_QUERIES.filter((q) => q.position > 10).sort((a, b) => b.impressions - a.impressions);

    return (
      <div className="space-y-6" id="report-high-imp-below-p1">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 12</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">High-Impression Queries Below Page One</h1>
          <p className="text-xs text-slate-500 mt-1">
            High-search-volume keywords languishing on Page 2 and Page 3 (Position 11.0+) ready for content expansion.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-3">
            {belowP1.slice(0, 10).map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{q.query}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{q.landingPage}</div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Position:</span> <span className="font-bold text-rose-600">#{q.position.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Impressions:</span> <span className="font-bold text-slate-900">{q.impressions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 13. Branded vs Non-Branded Search Performance
  // =========================================================================
  if (reportId === 'branded-vs-non-branded') {
    const brandedClicks = TOURS_QUERIES.filter((q) => q.queryType === 'Branded').reduce((acc, q) => acc + q.clicks, 0);
    const nonBrandedClicks = TOURS_QUERIES.filter((q) => q.queryType === 'Non-Branded').reduce((acc, q) => acc + q.clicks, 0);

    return (
      <div className="space-y-6" id="report-branded-vs-non-branded">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 13</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Branded vs Non-Branded Search Performance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative split analysis separating brand equity from generic unbranded organic discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-xs">
            <div className="text-xs font-bold text-purple-700 uppercase">Branded Search</div>
            <div className="text-3xl font-black text-purple-900 mt-1">{brandedClicks.toLocaleString()} clicks</div>
            <div className="text-xs text-purple-600 mt-1">Average CTR: 28.4% • Avg Position: 1.2</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
            <div className="text-xs font-bold text-emerald-700 uppercase">Non-Branded Search</div>
            <div className="text-3xl font-black text-emerald-900 mt-1">{nonBrandedClicks.toLocaleString()} clicks</div>
            <div className="text-xs text-emerald-600 mt-1">Average CTR: 1.45% • Avg Position: 7.8</div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 14. High-Visibility Queries With Zero Clicks
  // =========================================================================
  if (reportId === 'high-vis-zero-clicks') {
    const zeroClickQueries = [
      { query: 'colosseum tickets official site', impressions: 142000, position: 8.4, reason: 'Displaced by Google Ads & Maps Pack' },
      { query: 'paris louvre opening hours today', impressions: 98000, position: 9.1, reason: 'Answered directly by Knowledge Graph' },
      { query: 'civitavecchia port to rome train schedule', impressions: 64000, position: 11.2, reason: 'Page 2 position' },
      { query: 'best time of day to visit vatican museum', impressions: 48000, position: 7.8, reason: 'AI Overview summary takes click' },
    ];

    return (
      <div className="space-y-6" id="report-high-vis-zero-clicks">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 14</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">High-Visibility Queries With Zero Clicks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Queries generating substantial impressions but 0 clicks (0.00% CTR) due to SERP features or low rank.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-3">
            {zeroClickQueries.map((item, i) => (
              <div key={i} className="p-3.5 bg-rose-50/40 rounded-lg border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.query}</div>
                  <div className="text-xs text-rose-700 font-medium mt-0.5">Cause: {item.reason}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">{item.impressions.toLocaleString()} impressions</div>
                  <div className="text-slate-500">Position #{item.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 15. Low-CTR Opportunities
  // =========================================================================
  if (reportId === 'low-ctr-opportunities') {
    const lowCtr = TOURS_QUERIES.filter((q) => q.position <= 5 && q.ctr < 0.02).sort((a, b) => b.impressions - a.impressions);

    return (
      <div className="space-y-6" id="report-low-ctr-opportunities">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 15</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Low-CTR Opportunities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Top-ranking queries (Positions 1 to 5) performing below expected CTR benchmarks requiring meta snippet rewrites.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Query</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Current CTR</th>
                <th className="py-2.5 px-3">Expected Benchmark</th>
                <th className="py-2.5 px-3">Impressions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowCtr.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{q.query}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">#{q.position.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">{(q.ctr * 100).toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-slate-500">{(q.position <= 2 ? 14.5 : 6.2).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-slate-700">{q.impressions.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 16. Potential Keyword Cannibalization
  // =========================================================================
  if (reportId === 'keyword-cannibalization') {
    return (
      <div className="space-y-6" id="report-keyword-cannibalization">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 16</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Potential Keyword Cannibalization</h1>
          <p className="text-xs text-slate-500 mt-1">
            Detect instances where 2 or more internal landing pages split organic search impressions and cannibalize rankings.
          </p>
        </div>

        <div className="space-y-4">
          {CANNIBALISATION_QUERIES.map((c, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Query: <span className="text-blue-600">"{c.query}"</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {c.distinctRankingUrlCount} Competing URLs
                </span>
              </div>
              <div className="space-y-2">
                {c.rankingLandingPages.map((lp, pIdx) => (
                  <div key={pIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-mono text-slate-800 font-bold truncate max-w-lg">{lp.page}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lp.pageGroup}</div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="font-bold text-blue-600">{lp.clicks.toLocaleString()} clicks</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">{lp.impressions.toLocaleString()} imp</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-amber-600 font-semibold">Pos #{lp.position.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Recommended Action:</span> Designate canonical landing page, consolidate duplicate topic coverage, or differentiate query intent.
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 17. Top 10 Search Visibility
  // =========================================================================
  if (reportId === 'top-10-search-visibility') {
    return (
      <div className="space-y-6" id="report-top-10-search-visibility">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 17</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Top 10 Search Visibility</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weighted search visibility index scoring CTR curves and search volume share.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-sm font-bold text-slate-900 mb-3">Overall Visibility Score: 84.2 / 100</div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '84.2%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 18. Unclassified URLs
  // =========================================================================
  if (reportId === 'unclassified-urls') {
    const unclassifiedSample = [
      { url: '/special-campaign/spring-blossom-promo-2026', reason: 'Non-standard promotion path' },
      { url: '/internal-partner-portal/auth-token', reason: 'Unclassified utility URL' },
      { url: '/temp-landing-2025/test-offer', reason: 'Orphan staging landing page' },
    ];

    return (
      <div className="space-y-6" id="report-unclassified-urls">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 18</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Unclassified URLs Requiring Review</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active landing pages receiving GSC impressions that do not match the standard 23-priority taxonomy regex rules.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-3">
            {unclassifiedSample.map((u, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900">{u.url}</div>
                  <div className="text-[11px] text-rose-600 font-medium">{u.reason}</div>
                </div>
                <button
                  onClick={() => {
                    const result = classifyUrlTaxonomy(u.url);
                    alert(`Classified as: ${result.pageGroup} / ${result.pageLevel}`);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                >
                  Test 23-Priority Rules
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 19. Clicks by Device
  // =========================================================================
  if (reportId === 'clicks-by-device') {
    return (
      <div className="space-y-6" id="report-clicks-by-device">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Report 19</div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Clicks by Device</h1>
          <p className="text-xs text-slate-500 mt-1">
            Device split metrics comparing Desktop vs Mobile vs Tablet search behaviour and mobile UX index.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEVICE_PERFORMANCE_DATA.map((d, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">{d.device}</span>
                {d.device === 'Mobile' ? <Smartphone className="w-4 h-4 text-blue-600" /> : <Globe className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{d.clicks.toLocaleString()} clicks</div>
              <div className="text-xs text-slate-500 mt-1">{d.impressions.toLocaleString()} imp • {(d.ctr * 100).toFixed(2)}% CTR</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 20. Google Algorithm Updates Impact Report (Before & After)
  // =========================================================================
  if (reportId === 'google-algorithm-updates') {
    return <GoogleAlgorithmUpdatesReport onExportCsv={exportCsv} propertyTotals={propertyTotals} />;
  }

  return null;
};
