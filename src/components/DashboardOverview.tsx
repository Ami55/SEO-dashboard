/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { PagePerformance, QueryPerformance, AIInsightsResponse } from '../types';
import { AggregatedGroup } from '../utils/classifier';

interface DashboardOverviewProps {
  pages: PagePerformance[];
  queries: QueryPerformance[];
  cities: AggregatedGroup[];
  categories: AggregatedGroup[];
  aiInsights: AIInsightsResponse | null;
  aiLoading: boolean;
  aiError: string | null;
  onGenerateAiInsights: () => void;
}

export default function DashboardOverview({
  pages,
  queries,
  cities,
  categories,
  aiInsights,
  aiLoading,
  aiError,
  onGenerateAiInsights,
}: DashboardOverviewProps) {
  const [metricTab, setMetricTab] = useState<'clicks' | 'impressions'>('clicks');
  const [dimensionTab, setDimensionTab] = useState<'cities' | 'categories'>('cities');
  const [displayCount, setDisplayCount] = useState<number | 'all'>('all');

  // Calculate global summary values
  const currentPages = pages.filter((p) => p.period === 'current');
  const previousPages = pages.filter((p) => p.period === 'previous');

  const curClicks = currentPages.reduce((acc, p) => acc + p.clicks, 0);
  const prevClicks = previousPages.reduce((acc, p) => acc + p.clicks, 0);
  const clicksDiff = curClicks - prevClicks;
  const clicksPct = prevClicks > 0 ? (clicksDiff / prevClicks) * 100 : 0;

  const curImps = currentPages.reduce((acc, p) => acc + p.impressions, 0);
  const prevImps = previousPages.reduce((acc, p) => acc + p.impressions, 0);
  const impsDiff = curImps - prevImps;
  const impsPct = prevImps > 0 ? (impsDiff / prevImps) * 100 : 0;

  const curCtr = curImps > 0 ? (curClicks / curImps) * 100 : 0;
  const prevCtr = prevImps > 0 ? (prevClicks / prevImps) * 100 : 0;
  const ctrDiff = curCtr - prevCtr;

  // Impressions weighted position average (Enterprise SEO formula!)
  const curWeightPos = currentPages.reduce((acc, p) => acc + p.position * p.impressions, 0);
  const curAvgPos = curImps > 0 ? curWeightPos / curImps : 0;

  const prevWeightPos = previousPages.reduce((acc, p) => acc + p.position * p.impressions, 0);
  const prevAvgPos = prevImps > 0 ? prevWeightPos / prevImps : 0;

  const posDiff = curAvgPos - prevAvgPos; // lower rank number is positive growth

  // Prepare chart data directly from aggregated groups (sorted by current metric)
  const chartSource = dimensionTab === 'cities' ? cities : categories;
  const sortedSource = [...chartSource].sort((a, b) => {
    if (metricTab === 'clicks') {
      return b.currentClicks - a.currentClicks;
    }
    return b.currentImpressions - a.currentImpressions;
  });

  const slicedSource = displayCount === 'all' ? sortedSource : sortedSource.slice(0, displayCount);

  const activeChartData = slicedSource.map((g) => ({
    name: g.name,
    current: metricTab === 'clicks' ? g.currentClicks : g.currentImpressions,
    previous: metricTab === 'clicks' ? g.previousClicks : g.previousImpressions,
  }));

  // Calculate Y axis scales
  const maxVal = Math.max(...activeChartData.map((d) => Math.max(d.current, d.previous)), 100);

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-widget-row">
        {/* Card 1: Clicks */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organic Clicks</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                clicksDiff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {clicksDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {clicksDiff >= 0 ? '+' : ''}
              {clicksPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-850 font-mono">{curClicks.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>Previous: {prevClicks.toLocaleString()}</span>
              <span className={`font-medium ${clicksDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {clicksDiff >= 0 ? '+' : ''}
                {clicksDiff.toLocaleString()} diff
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Impressions */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Impressions</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                impsDiff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {impsDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {impsDiff >= 0 ? '+' : ''}
              {impsPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-850 font-mono">{curImps.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>Previous: {prevImps.toLocaleString()}</span>
              <span className={`font-medium ${impsDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {impsDiff >= 0 ? '+' : ''}
                {impsDiff.toLocaleString()} diff
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: CTR */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average CTR</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                ctrDiff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {ctrDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {ctrDiff >= 0 ? '+' : ''}
              {ctrDiff.toFixed(2)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-850 font-mono">{curCtr.toFixed(2)}%</h3>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>Previous: {prevCtr.toFixed(2)}%</span>
              <span className={`font-medium ${ctrDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {ctrDiff >= 0 ? 'Improvement' : 'Decline'}
              </span>
            </p>
          </div>
        </div>

        {/* Card 4: Impressions Weighted Avg Position */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Weighted Rank</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                posDiff <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
              title="A lower ranking number is a better Google placement!"
            >
              {posDiff <= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {posDiff <= 0 ? 'Better' : 'Slipped'} by {Math.abs(posDiff).toFixed(2)}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-850 font-mono">{curAvgPos.toFixed(2)}</h3>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>Previous: {prevAvgPos.toFixed(2)}</span>
              <span className={`font-medium ${posDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {posDiff <= 0 ? 'Upwards gain' : 'Downwards drop'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Segment Comparison Charts */}
      {activeChartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Comparative Dimension Chart ({chartSource.length} Total {dimensionTab === 'cities' ? 'Cities' : 'Categories'})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Period-over-period comparison across all active {dimensionTab === 'cities' ? 'cities' : 'categories'}.
              </p>
            </div>

            {/* Chart controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0 select-none">
                <button
                  onClick={() => setDimensionTab('cities')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    dimensionTab === 'cities' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Cities ({cities.length})
                </button>
                <button
                  onClick={() => setDimensionTab('categories')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    dimensionTab === 'categories' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Categories ({categories.length})
                </button>
              </div>

              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0 select-none">
                <button
                  onClick={() => setMetricTab('clicks')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    metricTab === 'clicks' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setMetricTab('impressions')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    metricTab === 'impressions' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Impressions
                </button>
              </div>

              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0 select-none">
                <button
                  onClick={() => setDisplayCount(8)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    displayCount === 8 ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Top 8
                </button>
                <button
                  onClick={() => setDisplayCount('all')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    displayCount === 'all' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  All ({chartSource.length})
                </button>
              </div>
            </div>
          </div>

          {/* SVG Comparative Chart with Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div
              className="min-w-[600px] h-64 flex items-end justify-between gap-3 font-mono text-[10px] text-slate-400 pt-6 px-2"
              style={{ minWidth: activeChartData.length > 8 ? `${activeChartData.length * 68}px` : '100%' }}
            >
              {activeChartData.map((d, index) => {
                const curPct = maxVal > 0 ? (d.current / maxVal) * 85 : 0;
                const prevPct = maxVal > 0 ? (d.previous / maxVal) * 85 : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group min-w-[50px]">
                    <div className="w-full flex justify-center items-end gap-1.5 h-full relative">
                      {/* Metric value tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] p-2 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 space-y-1">
                        <span className="font-sans block text-white font-bold border-b border-slate-700 pb-0.5">
                          {d.name}
                        </span>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-indigo-300">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            Current:
                          </span>
                          <span className="font-bold">{d.current.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-slate-300">
                            <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                            Previous:
                          </span>
                          <span className="font-bold">{d.previous.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Bar 1: Previous Period */}
                      <div
                        style={{ height: `${prevPct}%` }}
                        className="w-1/2 max-w-[20px] bg-slate-200 hover:bg-slate-300 transition-all rounded-t-sm"
                      ></div>
                      {/* Bar 2: Current Period */}
                      <div
                        style={{ height: `${curPct}%` }}
                        className="w-1/2 max-w-[20px] bg-indigo-500 hover:bg-indigo-600 transition-all rounded-t-sm"
                      ></div>
                    </div>

                    {/* Labels */}
                    <div
                      className="text-center font-sans font-semibold text-slate-700 mt-3 max-w-full truncate text-[11px]"
                      title={d.name}
                    >
                      {d.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 items-center justify-center mt-4 text-xs border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <span className="w-3 h-3 bg-indigo-500 rounded"></span>
              <span>Current GSC Period</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-500">
              <span className="w-3 h-3 bg-slate-200 rounded border border-slate-300"></span>
              <span>Previous GSC Period</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Executive Insights Panel */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-md p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/15 rounded-lg border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-md font-bold flex items-center gap-1.5">
                AI Executive Insights Report
                <span className="px-1.5 py-0.5 bg-indigo-500 text-[9px] font-bold rounded-full uppercase tracking-wider">
                  Gemini 3.7 Flash
                </span>
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Instant comparative summary of site segments, trend declarations, and priority action lists.
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateAiInsights}
            disabled={aiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-400 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors cursor-pointer border border-indigo-500 shadow-sm shadow-indigo-900/40"
            id="btn-generate-ai"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiInsights ? 'Re-Evaluate SEO Metrics' : 'Generate AI Executive Summary'}
          </button>
        </div>

        {/* State rendering */}
        {aiLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
              <Sparkles className="w-5 h-5 text-indigo-400 absolute top-3.5 left-3.5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-indigo-100 animate-pulse">
                Engaging Gemini Core Analytics Model...
              </p>
              <p className="text-[10px] text-indigo-300 max-w-xs mx-auto italic leading-tight">
                Evaluating traffic shifts across {cities.length} cities & {categories.length} categories...
              </p>
            </div>
          </div>
        ) : aiError ? (
          <div className="py-6 mt-4 p-4 bg-slate-800/40 border border-rose-500/20 rounded-lg flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5">
              <span className="font-bold text-rose-300 block">AI Evaluation Paused</span>
              <p className="text-slate-300 leading-relaxed">{aiError}</p>
              <p className="text-[10px] text-slate-400">
                Tip: You can use your application immediately without AI summaries! Simply explore the interactive data tables, filters, and charts configured below.
              </p>
            </div>
          </div>
        ) : aiInsights ? (
          <div className="mt-5 space-y-6 text-xs text-indigo-100 leading-relaxed">
            {/* Summary */}
            <div className="bg-slate-800/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Comparative Trend Assessment
              </h3>
              <p className="text-slate-300">{aiInsights.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Opportunity keyword analysis */}
              <div className="bg-slate-800/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  Opportunity Keyword Strategy (Search Snippet optimization)
                </h3>
                <p className="text-slate-300">{aiInsights.opportunityQueryAnalysis}</p>
              </div>

              {/* Action items */}
              <div className="bg-slate-800/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                  Prescribed Priority Action items
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {aiInsights.actions?.map((act, index) => (
                    <li key={index} className="flex gap-2 items-start">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 font-bold font-mono text-[9px] flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 p-4 border border-indigo-500/10 bg-indigo-950/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto opacity-60 mb-2" />
            <p className="text-xs font-medium text-indigo-200">Executive AI Analysis ready to formulate.</p>
            <p className="text-[10px] text-indigo-400 mt-1 max-w-sm mx-auto">
              Click the button above to securely connect to Gemini AI and write the executive report highlighting your top opportunities across {cities.length} cities and {categories.length} categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
