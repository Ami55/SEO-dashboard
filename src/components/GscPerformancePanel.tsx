/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  HelpCircle,
  CheckSquare,
  Square,
  ChevronDown,
  Info,
  ChevronRight,
  Sparkles,
  Plus,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  Check,
  Download,
  SlidersHorizontal,
  RefreshCw,
  Search,
} from 'lucide-react';
import { GscDailyPerformance, GscAnnotation } from '../types';
import { DEMO_GSC_DAILY_SERIES, DEMO_GSC_ANNOTATIONS } from '../demoData';

interface GscPerformancePanelProps {
  dailyData?: GscDailyPerformance[];
  annotations?: GscAnnotation[];
  onOpenAiReport?: () => void;
}

type ComparisonPreset =
  | '12_months_prev'
  | '3_months_prev'
  | '28_days_prev'
  | 'year_over_year'
  | 'custom';

export default function GscPerformancePanel({
  dailyData = DEMO_GSC_DAILY_SERIES,
  annotations = DEMO_GSC_ANNOTATIONS,
  onOpenAiReport,
}: GscPerformancePanelProps) {
  // Metric toggle states (Total clicks and Total impressions active by default like in screenshot)
  const [showClicks, setShowClicks] = useState<boolean>(true);
  const [showImpressions, setShowImpressions] = useState<boolean>(true);
  const [showCtr, setShowCtr] = useState<boolean>(false);
  const [showPosition, setShowPosition] = useState<boolean>(false);

  // Comparison toggle & preset mode
  const [isCompareEnabled, setIsCompareEnabled] = useState<boolean>(true);
  const [comparisonPreset, setComparisonPreset] = useState<ComparisonPreset>('12_months_prev');
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'web' | 'image' | 'video' | 'news'>('web');
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState<boolean>(false);

  // Granularity selector (Daily / Weekly / Monthly)
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState<boolean>(false);

  // Filter query in GSC
  const [activeFilterPills, setActiveFilterPills] = useState<Array<{ id: string; type: string; value: string }>>([]);
  const [isNewFilterOpen, setIsNewFilterOpen] = useState<boolean>(false);
  const [newFilterType, setNewFilterType] = useState<'query' | 'page' | 'country' | 'device'>('query');
  const [newFilterVal, setNewFilterVal] = useState('');

  // Hover tracker state
  const [hoverIndex, setHoverIndex] = useState<number | null>(47); // default near Oct 5 to showcase tooltip
  const [isHovering, setIsHovering] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Selected annotation modal / popover state
  const [selectedAnnotation, setSelectedAnnotation] = useState<GscAnnotation | null>(null);
  const [allAnnotations, setAllAnnotations] = useState<GscAnnotation[]>(annotations);

  // Generative AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Bottom breakdown table active tab
  const [tableTab, setTableTab] = useState<'queries' | 'pages' | 'countries' | 'devices'>('queries');

  // Filter daily data based on comparison preset duration
  const filteredDailyData = useMemo(() => {
    if (comparisonPreset === '28_days_prev') {
      return dailyData.slice(-28);
    }
    if (comparisonPreset === '3_months_prev') {
      return dailyData.slice(-90);
    }
    return dailyData;
  }, [dailyData, comparisonPreset]);

  // Aggregate daily data by granularity if weekly or monthly is selected
  const aggregatedData = useMemo(() => {
    if (granularity === 'daily') return filteredDailyData;

    if (granularity === 'weekly') {
      const weeks: GscDailyPerformance[] = [];
      for (let i = 0; i < filteredDailyData.length; i += 7) {
        const chunk = filteredDailyData.slice(i, i + 7);
        const totalClicks = chunk.reduce((acc, d) => acc + d.clicks, 0);
        const totalImps = chunk.reduce((acc, d) => acc + d.impressions, 0);
        const avgCtr = totalImps > 0 ? totalClicks / totalImps : 0;
        const avgPos = chunk.reduce((acc, d) => acc + d.position, 0) / chunk.length;

        const prevClicks = chunk.reduce((acc, d) => acc + (d.prevClicks || 0), 0);
        const prevImps = chunk.reduce((acc, d) => acc + (d.prevImpressions || 0), 0);
        const prevCtr = prevImps > 0 ? prevClicks / prevImps : 0;
        const prevPos = chunk.reduce((acc, d) => acc + (d.prevPosition || d.position + 1.6), 0) / chunk.length;

        const annList = chunk.flatMap((c) => c.annotations || []);
        const firstDay = chunk[0];

        weeks.push({
          date: firstDay.date,
          formattedDate: `Week of ${firstDay.formattedDate}`,
          clicks: totalClicks,
          impressions: totalImps,
          ctr: avgCtr,
          position: Number(avgPos.toFixed(1)),
          prevDate: firstDay.prevDate,
          prevFormattedDate: firstDay.prevFormattedDate ? `Week of ${firstDay.prevFormattedDate}` : undefined,
          prevClicks,
          prevImpressions: prevImps,
          prevCtr,
          prevPosition: Number(prevPos.toFixed(1)),
          annotations: annList.length > 0 ? annList : undefined,
        });
      }
      return weeks;
    }

    // Monthly
    const monthMap = new Map<string, GscDailyPerformance[]>();
    filteredDailyData.forEach((d) => {
      const monthKey = d.date.substring(0, 7); // '2025-08'
      const list = monthMap.get(monthKey) || [];
      list.push(d);
      monthMap.set(monthKey, list);
    });

    const months: GscDailyPerformance[] = [];
    monthMap.forEach((chunk, key) => {
      const totalClicks = chunk.reduce((acc, d) => acc + d.clicks, 0);
      const totalImps = chunk.reduce((acc, d) => acc + d.impressions, 0);
      const avgCtr = totalImps > 0 ? totalClicks / totalImps : 0;
      const avgPos = chunk.reduce((acc, d) => acc + d.position, 0) / chunk.length;

      const prevClicks = chunk.reduce((acc, d) => acc + (d.prevClicks || 0), 0);
      const prevImps = chunk.reduce((acc, d) => acc + (d.prevImpressions || 0), 0);
      const prevCtr = prevImps > 0 ? prevClicks / prevImps : 0;
      const prevPos = chunk.reduce((acc, d) => acc + (d.prevPosition || d.position + 1.6), 0) / chunk.length;

      const annList = chunk.flatMap((c) => c.annotations || []);
      const dateObj = new Date(key + '-01');
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      months.push({
        date: key + '-01',
        formattedDate,
        clicks: totalClicks,
        impressions: totalImps,
        ctr: avgCtr,
        position: Number(avgPos.toFixed(1)),
        prevDate: `${parseInt(key.substring(0, 4)) - 1}${key.substring(4)}-01`,
        prevFormattedDate: `Previous ${formattedDate}`,
        prevClicks,
        prevImpressions: prevImps,
        prevCtr,
        prevPosition: Number(prevPos.toFixed(1)),
        annotations: annList.length > 0 ? annList : undefined,
      });
    });

    return months;
  }, [filteredDailyData, granularity]);

  // Overall metric totals for Current Period
  const totalClicksVal = useMemo(
    () => filteredDailyData.reduce((acc, d) => acc + d.clicks, 0),
    [filteredDailyData]
  );
  const totalImpressionsVal = useMemo(
    () => filteredDailyData.reduce((acc, d) => acc + d.impressions, 0),
    [filteredDailyData]
  );
  const avgCtrVal =
    totalImpressionsVal > 0 ? (totalClicksVal / totalImpressionsVal) * 100 : 1.5;
  const avgPositionVal =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((acc, d) => acc + d.position * d.impressions, 0) /
        (totalImpressionsVal || 1)
      : 19.2;

  // Overall metric totals for Previous Period
  const prevTotalClicksVal = useMemo(
    () => filteredDailyData.reduce((acc, d) => acc + (d.prevClicks || Math.round(d.clicks * 0.8)), 0),
    [filteredDailyData]
  );
  const prevTotalImpressionsVal = useMemo(
    () => filteredDailyData.reduce((acc, d) => acc + (d.prevImpressions || Math.round(d.impressions * 0.8)), 0),
    [filteredDailyData]
  );
  const prevAvgCtrVal =
    prevTotalImpressionsVal > 0 ? (prevTotalClicksVal / prevTotalImpressionsVal) * 100 : 1.5;
  const prevAvgPositionVal =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce(
          (acc, d) => acc + (d.prevPosition || d.position + 1.6) * (d.prevImpressions || d.impressions * 0.8),
          0
        ) / (prevTotalImpressionsVal || 1)
      : 20.8;

  // Percentage & Absolute diffs
  const clicksDiff = totalClicksVal - prevTotalClicksVal;
  const clicksPctChange = prevTotalClicksVal > 0 ? (clicksDiff / prevTotalClicksVal) * 100 : 0;

  const impsDiff = totalImpressionsVal - prevTotalImpressionsVal;
  const impsPctChange = prevTotalImpressionsVal > 0 ? (impsDiff / prevTotalImpressionsVal) * 100 : 0;

  const ctrDiff = avgCtrVal - prevAvgCtrVal;

  const posDiff = avgPositionVal - prevAvgPositionVal; // Negative is improvement in rank

  // Format large numbers (e.g. 598K, 39.8M)
  const formatCardNumber = (num: number, type: 'clicks' | 'impressions') => {
    if (type === 'impressions') {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      return (num / 1000).toFixed(0) + 'K';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return Math.round(num / 1000) + 'K';
    }
    return num.toLocaleString();
  };

  // SVG dimensions
  const svgWidth = 1000;
  const svgHeight = 310;
  const paddingLeft = 40;
  const paddingRight = 45;
  const paddingTop = 20;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Metric maximums for scales (accounting for both current and previous series)
  const maxClicks = Math.max(
    ...aggregatedData.map((d) => Math.max(d.clicks, d.prevClicks || 0)),
    2400
  );
  const maxImps = Math.max(
    ...aggregatedData.map((d) => Math.max(d.impressions, d.prevImpressions || 0)),
    225000
  );
  const maxCtr = Math.max(
    ...aggregatedData.map((d) => Math.max(d.ctr, d.prevCtr || 0)),
    0.05
  );

  // Position runs from 1 (top) to 30 (bottom) - inverted scale
  const minPos = 1;
  const maxPos = 30;

  // Coordinate mappers
  const getX = (index: number) => {
    if (aggregatedData.length <= 1) return paddingLeft;
    return paddingLeft + (index / (aggregatedData.length - 1)) * chartWidth;
  };

  const getClicksY = (val: number) => {
    return paddingTop + chartHeight - (val / maxClicks) * chartHeight;
  };

  const getImpsY = (val: number) => {
    return paddingTop + chartHeight - (val / maxImps) * chartHeight;
  };

  const getCtrY = (val: number) => {
    return paddingTop + chartHeight - (val / maxCtr) * chartHeight;
  };

  const getPosY = (val: number) => {
    const norm = (val - minPos) / (maxPos - minPos);
    return paddingTop + norm * chartHeight;
  };

  // Generate SVG path definitions
  const generatePath = (getYFunc: (d: GscDailyPerformance) => number) => {
    if (aggregatedData.length === 0) return '';
    return aggregatedData.reduce((acc, d, i) => {
      const x = getX(i);
      const y = getYFunc(d);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }, '');
  };

  // Current Period Paths (Solid lines)
  const clicksPath = useMemo(() => generatePath((d) => getClicksY(d.clicks)), [aggregatedData, maxClicks]);
  const impsPath = useMemo(() => generatePath((d) => getImpsY(d.impressions)), [aggregatedData, maxImps]);
  const ctrPath = useMemo(() => generatePath((d) => getCtrY(d.ctr)), [aggregatedData, maxCtr]);
  const posPath = useMemo(() => generatePath((d) => getPosY(d.position)), [aggregatedData]);

  // Previous Period Paths (Dashed / Lighter lines)
  const prevClicksPath = useMemo(
    () => generatePath((d) => getClicksY(d.prevClicks || Math.round(d.clicks * 0.8))),
    [aggregatedData, maxClicks]
  );
  const prevImpsPath = useMemo(
    () => generatePath((d) => getImpsY(d.prevImpressions || Math.round(d.impressions * 0.8))),
    [aggregatedData, maxImps]
  );
  const prevCtrPath = useMemo(
    () => generatePath((d) => getCtrY(d.prevCtr || d.ctr)),
    [aggregatedData, maxCtr]
  );
  const prevPosPath = useMemo(
    () => generatePath((d) => getPosY(d.prevPosition || d.position + 1.6)),
    [aggregatedData]
  );

  // X-Axis date tick markers
  const dateTicks = useMemo(() => {
    const total = aggregatedData.length;
    if (total === 0) return [];
    const count = Math.min(16, total);
    const ticks: Array<{ index: number; label: string; x: number }> = [];
    const step = (total - 1) / Math.max(1, count - 1);

    for (let i = 0; i < count; i++) {
      const idx = Math.min(Math.round(i * step), total - 1);
      const item = aggregatedData[idx];
      if (!item) continue;
      const d = new Date(item.date);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const yr = d.getFullYear().toString().slice(-2);
      ticks.push({
        index: idx,
        label: `${m}/${day}/${yr}`,
        x: getX(idx),
      });
    }
    return ticks;
  }, [aggregatedData]);

  // Handle SVG Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || aggregatedData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normX = (clientX / rect.width) * svgWidth;
    const boundedX = Math.max(paddingLeft, Math.min(normX, svgWidth - paddingRight));
    const relX = boundedX - paddingLeft;
    const idx = Math.round((relX / chartWidth) * (aggregatedData.length - 1));
    const validIdx = Math.max(0, Math.min(idx, aggregatedData.length - 1));
    setHoverIndex(validIdx);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    // Retain focus or stay visible
  };

  // Add custom filter
  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterVal.trim()) return;
    setActiveFilterPills((prev) => [
      ...prev,
      { id: `fil-${Date.now()}`, type: newFilterType, value: newFilterVal.trim() },
    ]);
    setNewFilterVal('');
    setIsNewFilterOpen(false);
  };

  const removeFilter = (id: string) => {
    setActiveFilterPills((prev) => prev.filter((p) => p.id !== id));
  };

  // Currently hovered item
  const currentHoveredItem =
    hoverIndex !== null && aggregatedData[hoverIndex]
      ? aggregatedData[hoverIndex]
      : aggregatedData[0] || dailyData[0];
  const currentHoverX = hoverIndex !== null ? getX(hoverIndex) : paddingLeft;

  // Tooltip position calculation
  const isRightSide = currentHoverX > svgWidth * 0.62;
  const tooltipX = isRightSide ? currentHoverX - 255 : currentHoverX + 15;

  // Hovered item calculated diffs
  const hoverClicks = currentHoveredItem.clicks;
  const hoverPrevClicks = currentHoveredItem.prevClicks || Math.round(hoverClicks * 0.8);
  const hoverClicksDelta = hoverClicks - hoverPrevClicks;
  const hoverClicksPct = hoverPrevClicks > 0 ? (hoverClicksDelta / hoverPrevClicks) * 100 : 0;

  const hoverImps = currentHoveredItem.impressions;
  const hoverPrevImps = currentHoveredItem.prevImpressions || Math.round(hoverImps * 0.8);
  const hoverImpsDelta = hoverImps - hoverPrevImps;
  const hoverImpsPct = hoverPrevImps > 0 ? (hoverImpsDelta / hoverPrevImps) * 100 : 0;

  const hoverCtr = currentHoveredItem.ctr * 100;
  const hoverPrevCtr = (currentHoveredItem.prevCtr || currentHoveredItem.ctr) * 100;
  const hoverCtrDelta = hoverCtr - hoverPrevCtr;

  const hoverPos = currentHoveredItem.position;
  const hoverPrevPos = currentHoveredItem.prevPosition || hoverPos + 1.6;
  const hoverPosDelta = hoverPrevPos - hoverPos; // Positive means current is better rank

  // Comparison preset title
  const presetLabels: Record<ComparisonPreset, string> = {
    '12_months_prev': 'Compare: Last 12 months vs previous period',
    '3_months_prev': 'Compare: Last 3 months vs previous period',
    '28_days_prev': 'Compare: Last 28 days vs previous period',
    'year_over_year': 'Compare: Last 12 months (YoY)',
    'custom': 'Compare: Custom date range',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="gsc-performance-panel">
      {/* 1. Standard Google Search Console Top Filter Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50/75 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left Filters (Search Type + Date Comparison Filter + Added Chips + New Button) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Type Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              id="gsc-filter-search-type"
            >
              <span className="text-slate-400 font-normal">Search type:</span>
              <span className="capitalize font-bold text-slate-800">{searchType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isSearchTypeOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 text-xs">
                {(['web', 'image', 'video', 'news'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSearchType(type);
                      setIsSearchTypeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 capitalize font-medium flex items-center justify-between cursor-pointer ${
                      searchType === type ? 'text-indigo-600 bg-indigo-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{type}</span>
                    {searchType === type && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range & Comparison Selector Pill */}
          <button
            onClick={() => setIsDateFilterModalOpen(true)}
            className={`px-3 py-1.5 border rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all ${
              isCompareEnabled
                ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100/70'
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
            id="gsc-filter-date-compare"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {isCompareEnabled ? presetLabels[comparisonPreset] : 'Date: Last 12 months'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {/* Active Filter Chips */}
          {activeFilterPills.map((pill) => (
            <div
              key={pill.id}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs"
            >
              <span className="capitalize text-slate-400 font-normal">{pill.type}:</span>
              <span className="font-semibold">{pill.value}</span>
              <button
                onClick={() => removeFilter(pill.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* + New Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsNewFilterOpen(!isNewFilterOpen)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
              id="gsc-add-filter-btn"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>New</span>
            </button>

            {isNewFilterOpen && (
              <form
                onSubmit={handleAddFilter}
                className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-40 text-xs space-y-2.5"
              >
                <div className="font-bold text-slate-800">Add filter</div>
                <div className="flex gap-1.5">
                  {(['query', 'page', 'country', 'device'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewFilterType(t)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold capitalize cursor-pointer ${
                        newFilterType === t
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={`Filter by ${newFilterType}...`}
                  value={newFilterVal}
                  onChange={(e) => setNewFilterVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNewFilterOpen(false)}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Controls: Comparison Toggle Switch & Legend */}
        <div className="flex items-center gap-3">
          {/* Quick Toggle Comparison to Previous Period */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 border border-slate-200 rounded-full shadow-2xs hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={isCompareEnabled}
              onChange={(e) => setIsCompareEnabled(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded-xs focus:ring-blue-500 accent-[#1a73e8]"
            />
            <span className="text-xs font-semibold text-slate-700">Compare to previous period</span>
          </label>

          {/* Granularity selector (Daily / Weekly / Monthly) */}
          <div className="relative">
            <button
              onClick={() => setIsGranularityMenuOpen(!isGranularityMenuOpen)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              id="gsc-granularity-dropdown"
            >
              <span className="capitalize">{granularity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isGranularityMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-40 text-xs text-slate-700">
                {(['daily', 'weekly', 'monthly'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGranularity(g);
                      setIsGranularityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 capitalize font-medium flex items-center justify-between cursor-pointer ${
                      granularity === g ? 'text-indigo-600 bg-indigo-50/50 font-bold' : ''
                    }`}
                  >
                    <span>{g}</span>
                    {granularity === g && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (Comparison Mode Enabled) */}
      <div className="p-4 sm:p-6 pb-2 border-b border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Clicks */}
          <div
            onClick={() => setShowClicks(!showClicks)}
            className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between select-none relative group ${
              showClicks
                ? 'bg-[#1a73e8] text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            id="gsc-card-clicks"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showClicks ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-[#1a73e8]" />
                )}
                <span className={`text-xs font-semibold ${showClicks ? 'text-white' : 'text-slate-700'}`}>
                  Total clicks
                </span>
              </div>
              {/* Legend swatch in card */}
              {isCompareEnabled && showClicks && (
                <div className="flex items-center gap-1 text-[10px] opacity-90 font-mono">
                  <span className="w-3 h-0.5 bg-white inline-block"></span>
                  <span className="w-3 h-0.5 border-b border-dashed border-white inline-block"></span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-sans tracking-tight">
                  {formatCardNumber(totalClicksVal, 'clicks')}
                </span>
                <div className="relative group/tip">
                  <HelpCircle className={`w-3.5 h-3.5 ${showClicks ? 'text-blue-100 opacity-70' : 'text-slate-400'}`} />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-30 leading-tight">
                    Total organic clicks received in the current vs previous period.
                  </div>
                </div>
              </div>

              {/* Period Comparison Delta Subtext */}
              {isCompareEnabled && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span className={showClicks ? 'text-blue-100' : 'text-slate-500'}>
                    vs {formatCardNumber(prevTotalClicksVal, 'clicks')}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      clicksDiff >= 0
                        ? showClicks
                          ? 'text-emerald-300'
                          : 'text-emerald-600'
                        : showClicks
                        ? 'text-rose-200'
                        : 'text-rose-600'
                    }`}
                  >
                    {clicksDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {clicksDiff >= 0 ? '+' : ''}
                    {clicksPctChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Total Impressions */}
          <div
            onClick={() => setShowImpressions(!showImpressions)}
            className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between select-none relative group ${
              showImpressions
                ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            id="gsc-card-impressions"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showImpressions ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-[#7c3aed]" />
                )}
                <span className={`text-xs font-semibold ${showImpressions ? 'text-white' : 'text-slate-700'}`}>
                  Total impressions
                </span>
              </div>
              {isCompareEnabled && showImpressions && (
                <div className="flex items-center gap-1 text-[10px] opacity-90 font-mono">
                  <span className="w-3 h-0.5 bg-white inline-block"></span>
                  <span className="w-3 h-0.5 border-b border-dashed border-white inline-block"></span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-sans tracking-tight">
                  {formatCardNumber(totalImpressionsVal, 'impressions')}
                </span>
                <div className="relative group/tip">
                  <HelpCircle className={`w-3.5 h-3.5 ${showImpressions ? 'text-purple-100 opacity-70' : 'text-slate-400'}`} />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-30 leading-tight">
                    Total organic impressions seen in current vs previous period.
                  </div>
                </div>
              </div>

              {/* Period Comparison Delta Subtext */}
              {isCompareEnabled && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span className={showImpressions ? 'text-purple-100' : 'text-slate-500'}>
                    vs {formatCardNumber(prevTotalImpressionsVal, 'impressions')}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      impsDiff >= 0
                        ? showImpressions
                          ? 'text-emerald-300'
                          : 'text-emerald-600'
                        : showImpressions
                        ? 'text-rose-200'
                        : 'text-rose-600'
                    }`}
                  >
                    {impsDiff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {impsDiff >= 0 ? '+' : ''}
                    {impsPctChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Average CTR */}
          <div
            onClick={() => setShowCtr(!showCtr)}
            className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between select-none relative group ${
              showCtr
                ? 'bg-[#00897b] text-white shadow-md shadow-teal-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            id="gsc-card-ctr"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showCtr ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-[#00897b]" />
                )}
                <span className={`text-xs font-semibold ${showCtr ? 'text-white' : 'text-slate-700'}`}>
                  Average CTR
                </span>
              </div>
              {isCompareEnabled && showCtr && (
                <div className="flex items-center gap-1 text-[10px] opacity-90 font-mono">
                  <span className="w-3 h-0.5 bg-white inline-block"></span>
                  <span className="w-3 h-0.5 border-b border-dashed border-white inline-block"></span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-sans tracking-tight">
                  {avgCtrVal.toFixed(1)}%
                </span>
                <div className="relative group/tip">
                  <HelpCircle className={`w-3.5 h-3.5 ${showCtr ? 'text-teal-100 opacity-70' : 'text-slate-400'}`} />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-30 leading-tight">
                    Average Click-Through Rate comparison.
                  </div>
                </div>
              </div>

              {/* Period Comparison Delta Subtext */}
              {isCompareEnabled && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span className={showCtr ? 'text-teal-100' : 'text-slate-500'}>
                    vs {prevAvgCtrVal.toFixed(1)}%
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      ctrDiff >= 0
                        ? showCtr
                          ? 'text-emerald-300'
                          : 'text-emerald-600'
                        : showCtr
                        ? 'text-rose-200'
                        : 'text-rose-600'
                    }`}
                  >
                    {ctrDiff >= 0 ? '+' : ''}
                    {ctrDiff.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Average Position */}
          <div
            onClick={() => setShowPosition(!showPosition)}
            className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between select-none relative group ${
              showPosition
                ? 'bg-[#e65100] text-white shadow-md shadow-orange-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            id="gsc-card-position"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showPosition ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-[#e65100]" />
                )}
                <span className={`text-xs font-semibold ${showPosition ? 'text-white' : 'text-slate-700'}`}>
                  Average position
                </span>
              </div>
              {isCompareEnabled && showPosition && (
                <div className="flex items-center gap-1 text-[10px] opacity-90 font-mono">
                  <span className="w-3 h-0.5 bg-white inline-block"></span>
                  <span className="w-3 h-0.5 border-b border-dashed border-white inline-block"></span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-sans tracking-tight">
                  {avgPositionVal.toFixed(1)}
                </span>
                <div className="relative group/tip">
                  <HelpCircle className={`w-3.5 h-3.5 ${showPosition ? 'text-orange-100 opacity-70' : 'text-slate-400'}`} />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-30 leading-tight">
                    Average ranking position comparison (lower is better rank).
                  </div>
                </div>
              </div>

              {/* Period Comparison Delta Subtext */}
              {isCompareEnabled && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span className={showPosition ? 'text-orange-100' : 'text-slate-500'}>
                    vs {prevAvgPositionVal.toFixed(1)}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      posDiff <= 0
                        ? showPosition
                          ? 'text-emerald-300'
                          : 'text-emerald-600'
                        : showPosition
                        ? 'text-rose-200'
                        : 'text-rose-600'
                    }`}
                  >
                    {posDiff <= 0 ? '+' : ''}
                    {Math.abs(posDiff).toFixed(1)} {posDiff <= 0 ? 'better' : 'drop'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Legend Bar */}
        {isCompareEnabled && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-4 h-0.75 bg-slate-700 rounded-full inline-block"></span>
                <span>Current period</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-500">
                <span className="w-4 h-0.75 border-b-2 border-dashed border-slate-400 inline-block"></span>
                <span>Previous period</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Showing side-by-side curves across selected search parameters
            </div>
          </div>
        )}
      </div>

      {/* 3. Main SVG Time-Series Chart */}
      <div className="p-4 sm:p-6 relative select-none">
        {/* Y Axis Labels (Left: Clicks / Right: Impressions) */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1 px-2">
          <div>
            {showClicks && <span className="text-[#1a73e8] font-bold">Clicks</span>}
            {showCtr && !showClicks && <span className="text-[#00897b] font-bold">CTR %</span>}
          </div>
          <div>
            {showImpressions && <span className="text-[#7c3aed] font-bold">Impressions</span>}
            {showPosition && !showImpressions && <span className="text-[#e65100] font-bold">Avg Position</span>}
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full h-[310px]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full cursor-crosshair overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * chartHeight;
              const clickVal = Math.round(maxClicks * (1 - ratio));
              const impVal = Math.round(maxImps * (1 - ratio));

              return (
                <g key={idx}>
                  {/* Grid line */}
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth={idx === 4 ? '1.5' : '1'}
                    strokeDasharray={idx === 4 ? 'none' : '2 2'}
                  />

                  {/* Left Y Axis Label */}
                  {showClicks && (
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fill="#718096"
                    >
                      {clickVal >= 1000 ? `${(clickVal / 1000).toFixed(clickVal % 1000 === 0 ? 0 : 1)}K` : clickVal}
                    </text>
                  )}

                  {/* Right Y Axis Label */}
                  {showImpressions && (
                    <text
                      x={svgWidth - paddingRight + 8}
                      y={y + 3}
                      textAnchor="start"
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fill="#718096"
                    >
                      {impVal >= 1000 ? `${Math.round(impVal / 1000)}K` : impVal}
                    </text>
                  )}
                </g>
              );
            })}

            {/* PREVIOUS PERIOD SERIES LINES (Rendered below current series with dashed stroke) */}
            {isCompareEnabled && (
              <g id="gsc-previous-period-lines">
                {/* Previous Impressions Line (Dashed Lavender) */}
                {showImpressions && (
                  <path
                    d={prevImpsPath}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Previous Clicks Line (Dashed Light Blue) */}
                {showClicks && (
                  <path
                    d={prevClicksPath}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Previous CTR Line (Dashed Mint) */}
                {showCtr && (
                  <path
                    d={prevCtrPath}
                    fill="none"
                    stroke="#4db6ac"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Previous Position Line (Dashed Amber) */}
                {showPosition && (
                  <path
                    d={prevPosPath}
                    fill="none"
                    stroke="#ffb74d"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            )}

            {/* CURRENT PERIOD PERFORMANCE SERIES LINES (Solid stroke) */}
            {/* Impressions Line (Purple) */}
            {showImpressions && (
              <path
                d={impsPath}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Clicks Line (Blue) */}
            {showClicks && (
              <path
                d={clicksPath}
                fill="none"
                stroke="#1a73e8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* CTR Line (Teal) */}
            {showCtr && (
              <path
                d={ctrPath}
                fill="none"
                stroke="#00897b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Position Line (Orange) */}
            {showPosition && (
              <path
                d={posPath}
                fill="none"
                stroke="#e65100"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair Vertical Line and Dual Series Points */}
            {isHovering && currentHoveredItem && (
              <g>
                <line
                  x1={currentHoverX}
                  y1={paddingTop}
                  x2={currentHoverX}
                  y2={paddingTop + chartHeight}
                  stroke="#5f6368"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Previous Period Points (Outlined Circles) */}
                {isCompareEnabled && (
                  <>
                    {showClicks && (
                      <circle
                        cx={currentHoverX}
                        cy={getClicksY(hoverPrevClicks)}
                        r="4"
                        fill="#ffffff"
                        stroke="#93c5fd"
                        strokeWidth="2"
                      />
                    )}
                    {showImpressions && (
                      <circle
                        cx={currentHoverX}
                        cy={getImpsY(hoverPrevImps)}
                        r="4"
                        fill="#ffffff"
                        stroke="#c084fc"
                        strokeWidth="2"
                      />
                    )}
                    {showCtr && (
                      <circle
                        cx={currentHoverX}
                        cy={getCtrY(hoverPrevCtr / 100)}
                        r="4"
                        fill="#ffffff"
                        stroke="#4db6ac"
                        strokeWidth="2"
                      />
                    )}
                    {showPosition && (
                      <circle
                        cx={currentHoverX}
                        cy={getPosY(hoverPrevPos)}
                        r="4"
                        fill="#ffffff"
                        stroke="#ffb74d"
                        strokeWidth="2"
                      />
                    )}
                  </>
                )}

                {/* Current Period Points (Filled Circles) */}
                {showClicks && (
                  <circle
                    cx={currentHoverX}
                    cy={getClicksY(currentHoveredItem.clicks)}
                    r="4.5"
                    fill="#1a73e8"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {showImpressions && (
                  <circle
                    cx={currentHoverX}
                    cy={getImpsY(currentHoveredItem.impressions)}
                    r="4.5"
                    fill="#7c3aed"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {showCtr && (
                  <circle
                    cx={currentHoverX}
                    cy={getCtrY(currentHoveredItem.ctr)}
                    r="4.5"
                    fill="#00897b"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {showPosition && (
                  <circle
                    cx={currentHoverX}
                    cy={getPosY(currentHoveredItem.position)}
                    r="4.5"
                    fill="#e65100"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}
              </g>
            )}

            {/* Timeline Annotation Markers on Bottom Axis */}
            {aggregatedData.map((d, idx) => {
              if (!d.annotations || d.annotations.length === 0) return null;
              const x = getX(idx);
              const y = paddingTop + chartHeight + 14;

              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onClick={() => setSelectedAnnotation(d.annotations![0])}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="7.5"
                    fill="#80868b"
                    className="hover:fill-indigo-600 transition-colors"
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {d.annotations.length}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Date Ticks */}
            {dateTicks.map((tick, idx) => (
              <g key={idx}>
                <text
                  x={tick.x}
                  y={paddingTop + chartHeight + 34}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fill="#70757a"
                >
                  {tick.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Floating Tooltip Card (GSC Comparison Format) */}
          {isHovering && currentHoveredItem && (
            <div
              className="absolute top-4 pointer-events-none z-30 transition-all duration-75 bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-[240px]"
              style={{
                left: `${(tooltipX / svgWidth) * 100}%`,
              }}
            >
              {/* Header Dates (Current vs Previous) */}
              <div className="border-b border-slate-100 pb-2 mb-2">
                <div className="font-bold text-xs text-slate-800">
                  {currentHoveredItem.formattedDate}
                </div>
                {isCompareEnabled && currentHoveredItem.prevFormattedDate && (
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    vs {currentHoveredItem.prevFormattedDate}
                  </div>
                )}
              </div>

              {/* Comparison Matrix Table in Tooltip */}
              <div className="space-y-2 text-xs">
                {showClicks && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#1a73e8] rounded-xs"></span>
                        <span>Clicks</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">
                        {hoverClicks.toLocaleString()}
                      </span>
                    </div>
                    {isCompareEnabled && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-4">
                        <span>Previous: {hoverPrevClicks.toLocaleString()}</span>
                        <span
                          className={`font-semibold ${
                            hoverClicksDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {hoverClicksDelta >= 0 ? '+' : ''}
                          {hoverClicksDelta.toLocaleString()} ({hoverClicksPct.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {showImpressions && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#7c3aed] rounded-xs"></span>
                        <span>Impressions</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">
                        {hoverImps.toLocaleString()}
                      </span>
                    </div>
                    {isCompareEnabled && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-4">
                        <span>Previous: {hoverPrevImps.toLocaleString()}</span>
                        <span
                          className={`font-semibold ${
                            hoverImpsDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {hoverImpsDelta >= 0 ? '+' : ''}
                          {hoverImpsDelta.toLocaleString()} ({hoverImpsPct.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {showCtr && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#00897b] rounded-xs"></span>
                        <span>CTR</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">
                        {hoverCtr.toFixed(2)}%
                      </span>
                    </div>
                    {isCompareEnabled && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-4">
                        <span>Previous: {hoverPrevCtr.toFixed(2)}%</span>
                        <span
                          className={`font-semibold ${
                            hoverCtrDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {hoverCtrDelta >= 0 ? '+' : ''}
                          {hoverCtrDelta.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {showPosition && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#e65100] rounded-xs"></span>
                        <span>Position</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">
                        {hoverPos.toFixed(1)}
                      </span>
                    </div>
                    {isCompareEnabled && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-4">
                        <span>Previous: {hoverPrevPos.toFixed(1)}</span>
                        <span
                          className={`font-semibold ${
                            hoverPosDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {hoverPosDelta >= 0 ? '+' : '-'}
                          {Math.abs(hoverPosDelta).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subtitle Annotation Note */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[9px] text-slate-400 leading-tight">
                Right-click or use ⌘ + Enter to add an annotation
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Generative AI Search Performance Banner */}
      <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3.5 sm:p-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            Get more details on your site’s performance in generative AI features on Google Search
          </span>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="text-xs sm:text-sm font-semibold text-[#1a73e8] hover:text-blue-700 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          id="btn-open-generative-ai-report"
        >
          <span>Open report</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal 1: Date & Comparison Range Configuration */}
      {isDateFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Date Range & Comparison</h3>
              </div>
              <button
                onClick={() => setIsDateFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Switch */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">Compare to previous period</span>
                <span className="text-[11px] text-blue-700">Overlay historical metrics directly on the timeline</span>
              </div>
              <input
                type="checkbox"
                checked={isCompareEnabled}
                onChange={(e) => setIsCompareEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-xs focus:ring-blue-500 accent-[#1a73e8] cursor-pointer"
              />
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Preset Comparison Windows
              </span>
              <div className="space-y-1.5">
                {(
                  [
                    { id: '12_months_prev' as const, title: 'Last 12 months vs Previous period', desc: 'Full annual cycle compared to preceding 12-month period' },
                    { id: '3_months_prev' as const, title: 'Last 3 months vs Previous period', desc: 'Recent 90-day performance trend vs preceding 90 days' },
                    { id: '28_days_prev' as const, title: 'Last 28 days vs Previous period', desc: 'Short-term tactical changes and seasonal fluctuations' },
                    { id: 'year_over_year' as const, title: 'Last 12 months (Year over Year)', desc: 'Exact same dates from 1 year prior' },
                  ]
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setComparisonPreset(preset.id);
                      setIsCompareEnabled(true);
                      setIsDateFilterModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      comparisonPreset === preset.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{preset.title}</div>
                      <div className="text-[11px] text-slate-500">{preset.desc}</div>
                    </div>
                    {comparisonPreset === preset.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDateFilterModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Generative AI Search Performance Report */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Search Generative AI Insights</h3>
                  <p className="text-xs text-slate-500">AI Overviews & Gemini Search query presence report</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* Key AI Overviews Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">AI Overviews Clicks</span>
                  <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">68,400</div>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% this period
                  </span>
                </div>
                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">AI Snippet Citations</span>
                  <div className="text-2xl font-bold text-purple-900 mt-1 font-mono">2,140</div>
                  <span className="text-[10px] text-purple-600 font-semibold mt-1 block">Top cited domain in Food & Wine</span>
                </div>
                <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">AI Overviews CTR</span>
                  <div className="text-2xl font-bold text-teal-900 mt-1 font-mono">3.4%</div>
                  <span className="text-[10px] text-teal-600 font-semibold mt-1 block">2.2x higher than standard SERPs</span>
                </div>
              </div>

              {/* Generative AI Opportunities */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Top Citations in Google AI Overviews
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Query</th>
                        <th className="p-3">AI Citation Type</th>
                        <th className="p-3 text-right">Clicks</th>
                        <th className="p-3 text-right">Avg Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-medium text-slate-900">best croissants in paris secret bakery</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[10px]">Direct Carousel Source</span></td>
                        <td className="p-3 text-right font-mono font-bold">1,420</td>
                        <td className="p-3 text-right font-mono">1.1</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900">authentic carbonara restaurant trastevere rome</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold text-[10px]">Knowledge Card Mention</span></td>
                        <td className="p-3 text-right font-mono font-bold">1,180</td>
                        <td className="p-3 text-right font-mono">1.3</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900">tokyo fish market sushi crawl guide</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded font-semibold text-[10px]">Top Bullet Recommendation</span></td>
                        <td className="p-3 text-right font-mono font-bold">960</td>
                        <td className="p-3 text-right font-mono">1.2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actionable recommendations */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                <span className="font-bold text-indigo-900 block text-xs">AI Overviews Optimization Suggestions</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Add schema-tagged FAQ summaries to city hub pages to trigger rich answer cards in AI Overviews.</li>
                  <li>Include distinct author bylines and verified tasting timestamps to maintain high citation weight.</li>
                  <li>Target conversational long-tail query clusters for high-intent culinary tours.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: View Selected Annotation */}
      {selectedAnnotation && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedAnnotation.type.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedAnnotation.title}</h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {selectedAnnotation.date}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mt-2">{selectedAnnotation.description}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
