/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  MousePointerClick,
  Eye,
  Percent,
  Compass,
  Calendar,
  Layers,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  GscDailyTimeSeriesPoint,
  PropertyTotals,
  DashboardFilterState,
  TblPageGroup,
} from '../types';
import { SharedScorecardStrip } from './SharedScorecardStrip';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface SearchPerformanceSectionProps {
  propertyTotals: PropertyTotals;
  timeSeriesData?: GscDailyTimeSeriesPoint[];
  timeSeries?: GscDailyTimeSeriesPoint[];
  pageGroups?: any;
  filters?: DashboardFilterState;
}

export const SearchPerformanceSection: React.FC<SearchPerformanceSectionProps> = ({
  propertyTotals,
  timeSeriesData,
  timeSeries,
  filters,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const seriesData = timeSeriesData || timeSeries || [];
  const datePreset = filters?.datePreset || (filters?.dateRange ? String(filters.dateRange) : 'Last 12 complete months');
  const comparisonPreset = filters?.comparisonPreset || (filters?.comparisonPeriod ? String(filters.comparisonPeriod) : 'Same period in the previous year');

  // Filter time series points according to date preset or take last N points
  const points = useMemo(() => {
    let raw = [...seriesData];
    const preset = filters?.datePreset || filters?.dateRange;
    if (preset === 'Last 7 complete days') {
      raw = raw.slice(-7);
    } else if (preset === 'Last 28 complete days' || preset === 'LAST_28_DAYS') {
      raw = raw.slice(-28);
    } else if (preset === 'Last 3 complete months' || preset === 'LAST_3_MONTHS') {
      raw = raw.slice(-90);
    } else {
      raw = raw.slice(-180);
    }

    if (granularity === 'weekly') {
      const weekly: GscDailyTimeSeriesPoint[] = [];
      for (let i = 0; i < raw.length; i += 7) {
        const chunk = raw.slice(i, i + 7);
        if (chunk.length === 0) continue;
        const totalClicks = chunk.reduce((acc, p) => acc + p.clicks, 0);
        const totalImps = chunk.reduce((acc, p) => acc + p.impressions, 0);
        const prevClicks = chunk.reduce((acc, p) => acc + p.prevClicks, 0);
        const prevImps = chunk.reduce((acc, p) => acc + p.prevImpressions, 0);
        const avgPos = chunk.reduce((acc, p) => acc + p.position, 0) / chunk.length;
        const prevPos = chunk.reduce((acc, p) => acc + p.prevPosition, 0) / chunk.length;

        weekly.push({
          date: chunk[0].date,
          formattedDate: `Wk of ${chunk[0].formattedDate}`,
          clicks: totalClicks,
          impressions: totalImps,
          ctr: totalImps > 0 ? Number((totalClicks / totalImps).toFixed(4)) : 0,
          position: Number(avgPos.toFixed(1)),
          prevDate: chunk[0].prevDate,
          prevFormattedDate: `Wk of ${chunk[0].prevFormattedDate}`,
          prevClicks: prevClicks,
          prevImpressions: prevImps,
          prevCtr: prevImps > 0 ? Number((prevClicks / prevImps).toFixed(4)) : 0,
          prevPosition: Number(prevPos.toFixed(1)),
          byPageGroup: chunk[0].byPageGroup,
          brandedClicks: chunk.reduce((acc, p) => acc + p.brandedClicks, 0),
          nonBrandedClicks: chunk.reduce((acc, p) => acc + p.nonBrandedClicks, 0),
          desktopClicks: chunk.reduce((acc, p) => acc + p.desktopClicks, 0),
          mobileClicks: chunk.reduce((acc, p) => acc + p.mobileClicks, 0),
          tabletClicks: chunk.reduce((acc, p) => acc + p.tabletClicks, 0),
        });
      }
      return weekly;
    }

    return raw;
  }, [timeSeriesData, filters.datePreset, granularity]);

  // Dimensions for responsive SVG chart
  const chartHeight = 240;
  const chartWidth = 800;
  const paddingX = 40;
  const paddingY = 25;

  const currentValues = points.map((p) => p[selectedMetric]);
  const previousValues = points.map((p) =>
    selectedMetric === 'clicks'
      ? p.prevClicks
      : selectedMetric === 'impressions'
      ? p.prevImpressions
      : selectedMetric === 'ctr'
      ? p.prevCtr
      : p.prevPosition
  );

  const allVals = [...currentValues, ...previousValues];
  const minVal = selectedMetric === 'position' ? Math.max(1, Math.min(...allVals) - 0.5) : Math.min(...allVals) * 0.9;
  const maxVal = Math.max(...allVals) * 1.1;

  // Coordinate mapper
  const getY = (val: number) => {
    if (maxVal === minVal) return chartHeight / 2;
    if (selectedMetric === 'position') {
      // Lower position is higher on the chart! (1 is top)
      return paddingY + ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    }
    return chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
  };

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingX;
    return paddingX + (idx / (points.length - 1)) * (chartWidth - paddingX * 2);
  };

  // Build SVG paths
  const currentPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p[selectedMetric])}`)
    .join(' ');

  const previousPath = points
    .map((p, i) => {
      const val =
        selectedMetric === 'clicks'
          ? p.prevClicks
          : selectedMetric === 'impressions'
          ? p.prevImpressions
          : selectedMetric === 'ctr'
          ? p.prevCtr
          : p.prevPosition;
      return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`;
    })
    .join(' ');

  const currentArea = `${currentPath} L ${getX(points.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`;

  const hoveredPoint = hoveredPointIndex !== null && points[hoveredPointIndex] ? points[hoveredPointIndex] : null;

  // Page Group aggregation
  const pageGroupTrends = [
    {
      group: 'City or Area Pages' as TblPageGroup,
      clicks: 244300,
      prevClicks: 196800,
      impressions: 15400000,
      prevImpressions: 12600000,
      ctr: 0.0159,
      position: 7.6,
      share: '38.0%',
      growth: '+24.1%',
      color: 'bg-blue-500',
    },
    {
      group: 'Shore Excursions' as TblPageGroup,
      clicks: 141400,
      prevClicks: 100200,
      impressions: 6150000,
      prevImpressions: 4800000,
      ctr: 0.0230,
      position: 3.4,
      share: '22.0%',
      growth: '+41.1%',
      color: 'bg-emerald-500',
    },
    {
      group: 'Tour Guides' as TblPageGroup,
      clicks: 96400,
      prevClicks: 77800,
      impressions: 6000000,
      prevImpressions: 4920000,
      ctr: 0.0161,
      position: 6.8,
      share: '15.0%',
      growth: '+23.9%',
      color: 'bg-indigo-500',
    },
    {
      group: 'Tour Detail Pages' as TblPageGroup,
      clicks: 77100,
      prevClicks: 67400,
      impressions: 5570000,
      prevImpressions: 4910000,
      ctr: 0.0138,
      position: 7.2,
      share: '12.0%',
      growth: '+14.4%',
      color: 'bg-teal-500',
    },
    {
      group: 'Travel Blog' as TblPageGroup,
      clicks: 51400,
      prevClicks: 46600,
      impressions: 5140000,
      prevImpressions: 4560000,
      ctr: 0.0100,
      position: 9.4,
      share: '8.0%',
      growth: '+10.3%',
      color: 'bg-purple-500',
    },
    {
      group: 'Cruise Lines' as TblPageGroup,
      clicks: 19300,
      prevClicks: 15500,
      impressions: 1710000,
      prevImpressions: 1400000,
      ctr: 0.0113,
      position: 8.9,
      share: '3.0%',
      growth: '+24.5%',
      color: 'bg-amber-500',
    },
    {
      group: 'Safaris' as TblPageGroup,
      clicks: 12950,
      prevClicks: 14100,
      impressions: 880000,
      prevImpressions: 930000,
      ctr: 0.0147,
      position: 8.1,
      share: '2.0%',
      growth: '-8.2%',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider">
                Section 2 • Performance Overview
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Property: {propertyTotals.propertyName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Organic Search Performance Overview
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Time-series trajectory with comparison period overlay and multi-dimensional page group trends.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                granularity === 'daily'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                granularity === 'weekly'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Shared KPI Strip */}
      <SharedScorecardStrip propertyTotals={propertyTotals} />

      {/* Report 1: Dual-Curve Interactive Time Series */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>1. Organic Search Performance Over Time</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Solid emerald line: <strong>Current Period ({datePreset})</strong> vs. Dashed slate line: <strong>Previous Period ({comparisonPreset})</strong>
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedMetric('clicks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMetric === 'clicks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>URL Clicks</span>
            </button>
            <button
              onClick={() => setSelectedMetric('impressions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMetric === 'impressions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Impressions</span>
            </button>
            <button
              onClick={() => setSelectedMetric('ctr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMetric === 'ctr'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>CTR</span>
            </button>
            <button
              onClick={() => setSelectedMetric('position')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMetric === 'position'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Avg Position (1 is top)</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart Stage */}
        <div className="mt-6 relative">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-64 sm:h-72 select-none overflow-visible"
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
              const y = paddingY + ratio * (chartHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill for current curve */}
            <path d={currentArea} fill="url(#emeraldGrad)" />

            {/* Previous Period Line (Dashed) */}
            <path
              d={previousPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Current Period Line (Solid) */}
            <path
              d={currentPath}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Invisible hover capture zones */}
            {points.map((p, idx) => {
              const x = getX(idx);
              return (
                <rect
                  key={p.date}
                  x={x - (chartWidth / points.length) / 2}
                  y={0}
                  width={chartWidth / points.length}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                />
              );
            })}

            {/* Hover vertical crosshair & point indicators */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <g>
                <line
                  x1={getX(hoveredPointIndex)}
                  y1={paddingY}
                  x2={getX(hoveredPointIndex)}
                  y2={chartHeight - paddingY}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={getX(hoveredPointIndex)}
                  cy={getY(points[hoveredPointIndex][selectedMetric])}
                  r="5"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(hoveredPointIndex)}
                  cy={getY(
                    selectedMetric === 'clicks'
                      ? points[hoveredPointIndex].prevClicks
                      : selectedMetric === 'impressions'
                      ? points[hoveredPointIndex].prevImpressions
                      : selectedMetric === 'ctr'
                      ? points[hoveredPointIndex].prevCtr
                      : points[hoveredPointIndex].prevPosition
                  )}
                  r="4"
                  fill="#94a3b8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Dynamic Floating Tooltip */}
          {hoveredPoint && hoveredPointIndex !== null && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 text-white rounded-2xl p-4 shadow-xl border border-slate-800 text-xs pointer-events-none z-20 flex items-center gap-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Date Point</span>
                <div className="font-bold text-white text-sm">{hoveredPoint.formattedDate}</div>
                <div className="text-[11px] text-slate-400 font-mono">vs {hoveredPoint.prevFormattedDate}</div>
              </div>

              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Current Value</span>
                <div className="font-black text-white text-base font-mono">
                  {selectedMetric === 'ctr'
                    ? `${(hoveredPoint.ctr * 100).toFixed(2)}%`
                    : selectedMetric === 'position'
                    ? hoveredPoint.position.toFixed(1)
                    : hoveredPoint[selectedMetric].toLocaleString()}
                </div>
              </div>

              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400">Previous Value</span>
                <div className="font-bold text-slate-300 text-sm font-mono">
                  {selectedMetric === 'ctr'
                    ? `${(hoveredPoint.prevCtr * 100).toFixed(2)}%`
                    : selectedMetric === 'position'
                    ? hoveredPoint.prevPosition.toFixed(1)
                    : selectedMetric === 'clicks'
                    ? hoveredPoint.prevClicks.toLocaleString()
                    : hoveredPoint.prevImpressions.toLocaleString()}
                </div>
              </div>

              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] uppercase font-bold text-blue-400">Delta</span>
                <div className="font-bold text-emerald-400 text-sm font-mono">
                  {selectedMetric === 'clicks'
                    ? `${hoveredPoint.clicks - hoveredPoint.prevClicks >= 0 ? '+' : ''}${(hoveredPoint.clicks - hoveredPoint.prevClicks).toLocaleString()}`
                    : selectedMetric === 'impressions'
                    ? `${hoveredPoint.impressions - hoveredPoint.prevImpressions >= 0 ? '+' : ''}${(hoveredPoint.impressions - hoveredPoint.prevImpressions).toLocaleString()}`
                    : selectedMetric === 'ctr'
                    ? `${(hoveredPoint.ctr - hoveredPoint.prevCtr >= 0 ? '+' : '')}${((hoveredPoint.ctr - hoveredPoint.prevCtr) * 100).toFixed(2)}%`
                    : `${(hoveredPoint.position - hoveredPoint.prevPosition).toFixed(1)} pos`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report 2: Clicks & Impressions Trend by Page Group */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="pb-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>2. Clicks and Impressions Trend by Page Group</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual breakdown of growth vs contraction across core directory clusters.
          </p>
        </div>

        {/* Page Group Share Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Page Group Click Distribution (% of Total Property Clicks)</span>
            <span className="text-slate-500 font-mono">Total Clicks: {propertyTotals.currentClicks.toLocaleString()}</span>
          </div>

          <div className="w-full h-7 rounded-xl bg-slate-100 flex overflow-hidden p-1 gap-1">
            {pageGroupTrends.map((pg) => (
              <div
                key={pg.group}
                style={{ width: pg.share }}
                className={`${pg.color} rounded-lg transition-all relative group flex items-center justify-center text-[11px] font-bold text-white shadow-sm`}
                title={`${pg.group}: ${pg.clicks.toLocaleString()} clicks (${pg.share})`}
              >
                <span className="hidden sm:inline truncate px-1">{pg.group}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
            {pageGroupTrends.map((pg) => (
              <div key={pg.group} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${pg.color}`} />
                <span className="text-slate-700 font-medium">{pg.group}</span>
                <span className="text-slate-400 font-mono">({pg.share})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-4">Page Group</th>
                <th className="py-3 px-3 text-right">Current Clicks</th>
                <th className="py-3 px-3 text-right">Previous Clicks</th>
                <th className="py-3 px-3 text-right">Click Velocity</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Avg Position</th>
                <th className="py-3 px-4 text-right">Share of Total Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageGroupTrends.map((pg) => {
                const isGrowing = !pg.growth.startsWith('-');
                return (
                  <tr key={pg.group} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pg.color}`} />
                      <span>{pg.group}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {pg.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {pg.prevClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          isGrowing ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {pg.growth}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {(pg.impressions / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {(pg.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {pg.position.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {pg.share}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways Footer */}
      <KeyTakeawaysFooter
        sectionTitle="Search Performance Overview"
        filters={filters}
        propertyTotals={propertyTotals}
      />
    </div>
  );
};
