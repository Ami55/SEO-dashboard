/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  PieChart,
  HelpCircle,
  ExternalLink,
  Filter,
  Search,
  CheckCircle,
} from 'lucide-react';
import {
  TblPageItem,
  PropertyTotals,
  DashboardFilterState,
  TblPageGroup,
  TblPageLevel,
} from '../types';
import { SharedScorecardStrip } from './SharedScorecardStrip';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface PageDirectoryPerformanceSectionProps {
  pages?: TblPageItem[];
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
}

export const PageDirectoryPerformanceSection: React.FC<PageDirectoryPerformanceSectionProps> = ({
  pages = [],
  propertyTotals,
  filters,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'top10' | 'winners' | 'decliners' | 'decay' | 'emerging' | 'concentration' | 'unclassified'
  >('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      if (selectedGroupFilter !== 'ALL' && p.pageGroup !== selectedGroupFilter) return false;
      if (searchFilter && !p.page.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      return true;
    });
  }, [pages, selectedGroupFilter, searchFilter]);

  // Top 10 Pages by Clicks
  const top10Pages = useMemo(() => {
    return [...pages]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        shareOfProperty: (p.clicks / propertyTotals.currentClicks) * 100,
      }));
  }, [pages, propertyTotals.currentClicks]);

  // Organic Click Winners
  const winners = useMemo(() => {
    return pages
      .filter((p) => (p.clicks - p.prevClicks) > 0)
      .map((p) => ({
        ...p,
        gain: p.clicks - p.prevClicks,
      }))
      .sort((a, b) => b.gain - a.gain);
  }, [pages]);

  // Organic Click Decliners
  const decliners = useMemo(() => {
    return pages
      .filter((p) => (p.prevClicks - p.clicks) > 0)
      .map((p) => ({
        ...p,
        loss: p.prevClicks - p.clicks,
      }))
      .sort((a, b) => b.loss - a.loss);
  }, [pages]);

  // Content Decay Pages
  const decayPages = useMemo(() => {
    return pages.filter((p) => p.decayPattern);
  }, [pages]);

  // Emerging Pages
  const emergingPages = useMemo(() => {
    return pages.filter((p) => p.isEmerging || p.isNew);
  }, [pages]);

  // Concentration calculations
  const top5Clicks = top10Pages.slice(0, 5).reduce((acc, p) => acc + p.clicks, 0);
  const top10Clicks = top10Pages.reduce((acc, p) => acc + p.clicks, 0);
  const top5Share = (top5Clicks / propertyTotals.currentClicks) * 100;
  const top10Share = (top10Clicks / propertyTotals.currentClicks) * 100;

  // Unclassified URLs
  const unclassifiedPages = useMemo(() => {
    return pages.filter((p) => p.pageGroup === 'Other or Unclassified');
  }, [pages]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider">
                Section 3 • Page & Directory Performance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {pages.length} Tracked URLs
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Page and Directory Performance
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Deep directory decomposition, click winners & decliners, content decay patterns, and traffic concentration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
              Property Total Denominator: <strong>{propertyTotals.currentClicks.toLocaleString()} Clicks</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Shared KPI Strip */}
      <SharedScorecardStrip propertyTotals={propertyTotals} />

      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. All Pages & Groups</span>
        </button>

        <button
          onClick={() => setActiveSubTab('top10')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'top10'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>4. Top 10 Pages ({top10Share.toFixed(1)}% Share)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('winners')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'winners'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>5. Click Winners (+{winners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('decliners')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'decliners'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>6. Click Decliners ({decliners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('decay')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'decay'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>7. Content Decay ({decayPages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emerging')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'emerging'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>8. Emerging Pages ({emergingPages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('concentration')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'concentration'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>9. Traffic Concentration</span>
        </button>

        <button
          onClick={() => setActiveSubTab('unclassified')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'unclassified'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>10. Unclassified URLs ({unclassifiedPages.length})</span>
        </button>
      </div>

      {/* Main Content Area Based on Active SubTab */}
      {activeSubTab === 'all' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                3. Performance by Landing Page & Directory
              </h3>
              <p className="text-xs text-slate-500">
                Full directory breakdown with verified GSC metrics and period-over-period comparisons.
              </p>
            </div>

            {/* Filter Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter URLs..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Groups</option>
                <option value="City or Area Pages">City or Area Pages</option>
                <option value="Shore Excursions">Shore Excursions</option>
                <option value="Tour Guides">Tour Guides</option>
                <option value="Tour Detail Pages">Tour Detail Pages</option>
                <option value="Travel Blog">Travel Blog</option>
                <option value="Cruise Lines">Cruise Lines</option>
                <option value="Attractions">Attractions</option>
                <option value="Safaris">Safaris</option>
                <option value="Country Pages">Country Pages</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-3 px-4">Landing Page URL</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3">Page Level</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Prev Clicks</th>
                  <th className="py-3 px-3 text-right">Click Change</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPages.map((p) => {
                  const clickDiff = p.clicks - p.prevClicks;
                  const isPositive = clickDiff >= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 font-mono truncate" title={p.page}>
                          {p.page}
                        </div>
                        </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {p.pageGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {p.pageLevel}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {p.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {p.prevClicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? '+' : ''}{clickDiff.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {(p.impressions / 1000).toLocaleString()}K
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                        {(p.ctr * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {p.position.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Top 10 Pages by Organic Clicks */}
      {activeSubTab === 'top10' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>4. Top 10 Pages by Organic Clicks</span>
              </h3>
              <p className="text-xs text-slate-500">
                Share of Property Clicks is strictly calculated using Complete Property Total ({propertyTotals.currentClicks.toLocaleString()} Clicks).
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
              Top 10 Aggregate Share: {top10Share.toFixed(1)}% of all Property Clicks
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3 text-right">Organic Clicks</th>
                  <th className="py-3 px-3 text-right">Share of Property Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10Pages.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold font-mono text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 font-mono truncate" title={p.page}>
                        {p.page}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {p.pageGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 text-sm">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600">
                      {p.shareOfProperty.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(p.impressions / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(p.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {p.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Organic Click Winners */}
      {activeSubTab === 'winners' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>5. Organic Click Winners</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pages sorted by largest positive absolute click gain (Current Clicks - Previous Clicks &gt; 0).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-emerald-50/50">
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3 text-right">Click Gain</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Previous Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {winners.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 font-mono truncate">
                        {p.page}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {p.pageGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                      +{p.gain.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                      {p.prevClicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(p.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(p.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {p.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Organic Click Decliners */}
      {activeSubTab === 'decliners' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>6. Organic Click Decliners</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pages sorted by largest click loss (Previous Clicks - Current Clicks &gt; 0, displayed as positive loss number).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-rose-50/50">
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3 text-right">Click Loss</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Previous Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decliners.map((p) => (
                  <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 font-mono truncate">
                        {p.page}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {p.pageGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-rose-700 text-sm">
                      -{p.loss.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                      {p.prevClicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(p.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(p.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {p.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Content Decay Report */}
      {activeSubTab === 'decay' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>7. Content Decay Report</span>
            </h3>
            <p className="text-xs text-slate-500">
              Classified by algorithmic decay pattern to isolate CTR degradation, SERP position loss, and cannibalisation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-amber-50/50">
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-3">Decay Pattern Classification</th>
                  <th className="py-3 px-3 text-right">Click Loss</th>
                  <th className="py-3 px-3 text-right">Current Imps</th>
                  <th className="py-3 px-3 text-right">Prev Imps</th>
                  <th className="py-3 px-3 text-right">Current CTR</th>
                  <th className="py-3 px-3 text-right">Prev CTR</th>
                  <th className="py-3 px-4 text-right">Position Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decayPages.map((p) => {
                  const loss = p.prevClicks - p.clicks;
                  const posDelta = p.position - p.prevPosition;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 font-mono truncate">
                          {p.page}
                        </div>
                        <div className="text-[11px] text-slate-500">{p.pageGroup}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {p.decayPattern}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-700">
                        {loss > 0 ? `-${loss.toLocaleString()}` : 'Stable'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {(p.impressions / 1000).toLocaleString()}K
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                        {(p.prevImpressions / 1000).toLocaleString()}K
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {(p.ctr * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                        {(p.prevCtr * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {p.position.toFixed(1)} ({posDelta >= 0 ? `+${posDelta.toFixed(1)}` : posDelta.toFixed(1)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Emerging Pages Report */}
      {activeSubTab === 'emerging' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>8. Emerging Pages Report</span>
            </h3>
            <p className="text-xs text-slate-500">
              Identifies newly published and rapidly ascending URLs gaining early organic search traction.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-purple-50/50">
                  <th className="py-3 px-4">Emerging Landing Page</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emergingPages.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 font-mono truncate">
                        {p.page}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.isNew
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.isNew ? 'Newly Indexed URL' : 'Fast Rising URL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {p.pageGroup}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-700 text-sm">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(p.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(p.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {p.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Organic Traffic Concentration */}
      {activeSubTab === 'concentration' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>9. Organic Traffic Concentration Analysis</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates portfolio risk and dependency on top-ranking head terms and URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Top 5 URLs Traffic Share
              </span>
              <div className="text-3xl font-black text-indigo-950 font-mono mt-1">
                {top5Share.toFixed(1)}%
              </div>
              <p className="text-xs text-indigo-800 mt-2">
                Top 5 pages generate {top5Clicks.toLocaleString()} out of {propertyTotals.currentClicks.toLocaleString()} total property clicks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top 10 URLs Traffic Share
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                {top10Share.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Top 10 pages generate {top10Clicks.toLocaleString()} out of {propertyTotals.currentClicks.toLocaleString()} total property clicks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 10. Unclassified URLs */}
      {activeSubTab === 'unclassified' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>10. Unclassified URLs Requiring Review</span>
            </h3>
            <p className="text-xs text-slate-500">
              URLs classified as "Other or Unclassified" requiring classification rule governance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-3 px-4">Unclassified URL</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unclassifiedPages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.page}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(p.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(p.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {p.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Takeaways Footer */}
      <KeyTakeawaysFooter
        sectionTitle="Page and Directory Performance"
        filters={filters}
        propertyTotals={propertyTotals}
      />
    </div>
  );
};
