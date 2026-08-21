/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Zap,
  Target,
  AlertCircle,
  EyeOff,
  GitMerge,
  Award,
  Layers,
  Sparkles,
  Sliders,
  Filter,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  TblQueryItem,
  CannibalisationQuery,
  PropertyTotals,
  DashboardFilterState,
  QueryTheme,
  QueryType,
} from '../types';
import { SharedScorecardStrip } from './SharedScorecardStrip';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface QueryOpportunitiesSectionProps {
  queries?: TblQueryItem[];
  cannibalisationQueries?: CannibalisationQuery[];
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
}

export const QueryOpportunitiesSection: React.FC<QueryOpportunitiesSectionProps> = ({
  queries = [],
  cannibalisationQueries = [],
  propertyTotals,
  filters,
}) => {
  const [subTab, setSubTab] = useState<
    | 'all-queries'
    | 'themes'
    | 'strike-zone'
    | 'low-ctr'
    | 'below-page-one'
    | 'zero-click'
    | 'branded-split'
    | 'cannibalisation'
    | 'page-one-vis'
  >('all-queries');

  const [querySearch, setQuerySearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Sliders for Low-CTR Opportunities
  const [minImpressionsThreshold, setMinImpressionsThreshold] = useState(250000);
  const [maxCtrThreshold, setMaxCtrThreshold] = useState(1.5); // %

  // Filtered queries
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (typeFilter !== 'ALL' && q.queryType !== typeFilter) return false;
      if (themeFilter !== 'ALL' && q.queryTheme !== themeFilter) return false;
      if (querySearch && !q.query.toLowerCase().includes(querySearch.toLowerCase())) return false;
      return true;
    });
  }, [queries, typeFilter, themeFilter, querySearch]);

  // Positions 4-15 Strike Zone
  const strikeZoneQueries = useMemo(() => {
    return queries.filter((q) => q.position >= 4.0 && q.position <= 15.0);
  }, [queries]);

  // High Impression Low CTR (1-10 pos, high imps, low ctr)
  const lowCtrOpportunities = useMemo(() => {
    return queries.filter(
      (q) =>
        q.impressions >= minImpressionsThreshold &&
        q.ctr * 100 <= maxCtrThreshold &&
        q.position <= 10.0
    );
  }, [queries, minImpressionsThreshold, maxCtrThreshold]);

  // Below Page One (Position > 10)
  const belowPageOneQueries = useMemo(() => {
    return queries.filter((q) => q.position > 10.0 && q.impressions >= 50000);
  }, [queries]);

  // Zero or Very Low Click Queries
  const zeroClickQueries = useMemo(() => {
    return queries.filter((q) => q.clicks < 50 && q.impressions >= 10000);
  }, [queries]);

  // Page 1 Visibility
  const pageOneQueries = useMemo(() => {
    return queries.filter((q) => q.position >= 1.0 && q.position <= 10.0);
  }, [queries]);

  // Branded vs Non-Branded Summary
  const brandedQueries = queries.filter((q) => q.queryType === 'Branded');
  const nonBrandedQueries = queries.filter((q) => q.queryType === 'Non-Branded');

  const brandedClicks = brandedQueries.reduce((a, b) => a + b.clicks, 0);
  const nonBrandedClicks = nonBrandedQueries.reduce((a, b) => a + b.clicks, 0);

  // Themes Summary
  const themeSummary = [
    { theme: 'City Tours & Sightseeing' as QueryTheme, clicks: 198000, impressions: 14200000, ctr: 0.0139, pos: 7.2, share: '30.8%' },
    { theme: 'Private Guide Services' as QueryTheme, clicks: 154000, impressions: 8900000, ctr: 0.0173, pos: 5.4, share: '24.0%' },
    { theme: 'Shore Excursions & Cruise Ports' as QueryTheme, clicks: 142000, impressions: 7800000, ctr: 0.0182, pos: 4.8, share: '22.1%' },
    { theme: 'Walking & Historical Tours' as QueryTheme, clicks: 68000, impressions: 5400000, ctr: 0.0126, pos: 8.1, share: '10.6%' },
    { theme: 'Food & Wine Tastings' as QueryTheme, clicks: 38000, impressions: 2900000, ctr: 0.0131, pos: 7.9, share: '5.9%' },
    { theme: 'Safaris & Nature' as QueryTheme, clicks: 24000, impressions: 1900000, ctr: 0.0126, pos: 8.4, share: '3.7%' },
    { theme: 'Custom & Family Itineraries' as QueryTheme, clicks: 18850, impressions: 1750000, ctr: 0.0108, pos: 9.6, share: '2.9%' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider">
                Section 4 • Search Queries & Opportunities
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {queries.length} Strategic Query Clusters
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Query and Content Opportunities
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Positions 4–15 quick wins, high-impression low-CTR targets, branded split, and keyword cannibalisation review queue.
            </p>
          </div>
        </div>
      </div>

      {/* Shared Scorecards */}
      <SharedScorecardStrip propertyTotals={propertyTotals} />

      {/* SubTab Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setSubTab('all-queries')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'all-queries'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>11. Search Queries</span>
        </button>

        <button
          onClick={() => setSubTab('themes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'themes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>12. Demand by Query Theme</span>
        </button>

        <button
          onClick={() => setSubTab('strike-zone')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'strike-zone'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>16. Positions 4–15 Quick Wins ({strikeZoneQueries.length})</span>
        </button>

        <button
          onClick={() => setSubTab('low-ctr')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'low-ctr'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>15. High Imps, Low CTR ({lowCtrOpportunities.length})</span>
        </button>

        <button
          onClick={() => setSubTab('below-page-one')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'below-page-one'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>17. Below Page One ({belowPageOneQueries.length})</span>
        </button>

        <button
          onClick={() => setSubTab('zero-click')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'zero-click'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>18. Zero / Low Clicks ({zeroClickQueries.length})</span>
        </button>

        <button
          onClick={() => setSubTab('branded-split')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'branded-split'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>19. Branded vs Non-Branded</span>
        </button>

        <button
          onClick={() => setSubTab('cannibalisation')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'cannibalisation'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>21. Cannibalisation Queue ({cannibalisationQueries.length})</span>
        </button>

        <button
          onClick={() => setSubTab('page-one-vis')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
            subTab === 'page-one-vis'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>22. Page 1 Visibility ({pageOneQueries.length})</span>
        </button>
      </div>

      {/* Main SubTab Content Panels */}
      {subTab === 'all-queries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                11. Search Query Performance Report
              </h3>
              <p className="text-xs text-slate-500">
                Comprehensive search query table mapped to verified landing pages and query themes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter queries..."
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Query Types</option>
                <option value="Branded">Branded Only</option>
                <option value="Non-Branded">Non-Branded Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Theme</th>
                  <th className="py-3 px-3">Top Ranking Landing Page</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Click Change</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.map((q) => {
                  const isPos = q.clickChange >= 0;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {q.query}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            q.queryType === 'Branded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {q.queryType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        {q.queryTheme}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs truncate text-[11px] font-mono text-slate-500">
                        {q.landingPage || '/'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {q.clicks.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            isPos ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPos ? '+' : ''}{q.clickChange.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {(q.impressions / 1000).toLocaleString()}K
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {(q.ctr * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {q.position.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 12. Search Demand by Query Theme */}
      {subTab === 'themes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>12. Search Demand by Query Theme</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated intent categories across sightseeing, private guides, shore excursions, and specialty travel.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-indigo-50/50">
                  <th className="py-3 px-4">Query Theme</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">Avg Position</th>
                  <th className="py-3 px-4 text-right">Share of Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {themeSummary.map((t) => (
                  <tr key={t.theme} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {t.theme}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {t.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(t.impressions / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(t.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                      {t.pos.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700">
                      {t.share}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 16. Positions 4-15 Strike Zone */}
      {subTab === 'strike-zone' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>16. Positions 4–15 Quick Wins (The SEO Strike Zone)</span>
            </h3>
            <p className="text-xs text-slate-500">
              High-volume commercial queries ranking within strike distance of top 3 organic placements where title tag and rich snippet optimization deliver outsized ROI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-emerald-50/50">
                  <th className="py-3 px-4">Strike-Zone Query</th>
                  <th className="py-3 px-3">Theme</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">Current Position</th>
                  <th className="py-3 px-3 text-right">Current CTR</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-4">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {strikeZoneQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {q.query}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {q.queryTheme}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {(q.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                      {q.position.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(q.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {q.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      Add FAQ schema markup & optimize meta title for high-CTR intent.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 15. High-Impression, Low-CTR Opportunities */}
      {subTab === 'low-ctr' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span>15. High-Impression, Low-CTR Opportunities</span>
              </h3>
              <p className="text-xs text-slate-500">
                Queries ranking on Page One (Pos 1–10) with substantial search impressions but sub-par click-through rate.
              </p>
            </div>

            {/* Interactive Threshold Controls */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">Min Imps:</span>
                <input
                  type="range"
                  min={100000}
                  max={500000}
                  step={50000}
                  value={minImpressionsThreshold}
                  onChange={(e) => setMinImpressionsThreshold(Number(e.target.value))}
                  className="w-24 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-slate-900 font-bold">{(minImpressionsThreshold / 1000)}K</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Max CTR:</span>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={maxCtrThreshold}
                  onChange={(e) => setMaxCtrThreshold(Number(e.target.value))}
                  className="w-24 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-slate-900 font-bold">{maxCtrThreshold.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-amber-50/50">
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-3">Landing Page</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">Current CTR</th>
                  <th className="py-3 px-3 text-right">Position</th>
                  <th className="py-3 px-3 text-right">Current Clicks</th>
                  <th className="py-3 px-4">Opportunity Thesis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowCtrOpportunities.map((q) => (
                  <tr key={q.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {q.query}
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate text-[11px] font-mono text-slate-500">
                      {q.landingPage}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {(q.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-rose-700 text-sm">
                      {(q.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                      {q.position.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {q.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      Title snippet does not match transactional tour search intent. Test review star badges.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 19. Branded vs Non-Branded */}
      {subTab === 'branded-split' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              <span>19. Branded vs. Non-Branded Search Performance</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates organic demand health and direct brand equity vs. non-branded category acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Branded Search Equity
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 text-[11px] font-bold">
                    High Conversion
                  </span>
                </div>
                <div className="text-3xl font-black text-blue-950 font-mono mt-2">
                  {brandedClicks.toLocaleString()} Clicks
                </div>
                <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                  Average CTR: <strong>14.2%</strong> | Avg Position: <strong>1.2</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/80 text-[11px] text-blue-700">
                Approved Brand Keywords: Verified brand query terms matching configured dictionary.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Non-Branded Discovery Engine
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[11px] font-bold">
                    Growth Engine
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-950 font-mono mt-2">
                  {nonBrandedClicks.toLocaleString()} Clicks
                </div>
                <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                  Average CTR: <strong>3.8%</strong> | Total Impressions: <strong>32.5M</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/80 text-[11px] text-emerald-700">
                Powers 76.2% of all new traveler acquisition into destination directory hubs.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 21. Potential Keyword Cannibalisation */}
      {subTab === 'cannibalisation' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-rose-600" />
              <span>21. Potential Keyword Cannibalisation (Human Review Queue)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Queries where multiple distinct property URLs rank in Google Search, splitting click equity and ranking authority.
            </p>
          </div>

          <div className="space-y-6">
            {cannibalisationQueries.map((can) => (
              <div
                key={can.query}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">
                      {can.distinctRankingUrlCount} Competing URLs
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-mono">
                      Query: "{can.query}"
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                    <span>Total Clicks: <strong>{can.clicks.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Total Imps: <strong>{(can.impressions / 1000).toLocaleString()}K</strong></span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-white">
                        <th className="py-2.5 px-3">Competing Landing Page URL</th>
                        <th className="py-2.5 px-3">Page Group</th>
                        <th className="py-2.5 px-3 text-right">Clicks</th>
                        <th className="py-2.5 px-3 text-right">Impressions</th>
                        <th className="py-2.5 px-3 text-right">CTR</th>
                        <th className="py-2.5 px-3 text-right">Avg Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {can.rankingLandingPages.map((rlp, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 max-w-sm truncate">
                            {rlp.page}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {rlp.pageGroup}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {rlp.clicks.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {(rlp.impressions / 1000).toLocaleString()}K
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                            {(rlp.ctr * 100).toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {rlp.position.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                  <strong>Recommended Resolution:</strong> Consolidate internal anchor text to the primary destination hub URL and ensure self-referential canonical tag is verified.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 22. Page One Visibility */}
      {subTab === 'page-one-vis' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>22. GSC First-Page Search Visibility (Positions 1–10)</span>
            </h3>
            <p className="text-xs text-slate-500">
              High-ranking queries maintaining prime placement on Google Page One.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-emerald-50/50">
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-3 text-right">Avg Position</th>
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-4">Landing Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageOneQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {q.query}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 text-sm">
                      {q.position.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {q.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(q.impressions / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(q.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] font-mono text-slate-500">
                      {q.landingPage}
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
        sectionTitle="Query and Content Opportunities"
        filters={filters}
        propertyTotals={propertyTotals}
      />
    </div>
  );
};
