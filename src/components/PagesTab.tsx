/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ExternalLink,
  Tag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { ClassifiedPagePerformance, ClassificationRule } from '../types';

interface PagesTabProps {
  classifiedPages: ClassifiedPagePerformance[];
  rules: ClassificationRule[];
  onOpenCategoryWizard: () => void;
  onQuickAddRule: (field: 'category' | 'city' | 'page_type' | 'hub', pattern: string, targetValue: string) => void;
}

type SortField =
  | 'page'
  | 'category'
  | 'city'
  | 'pageType'
  | 'currentClicks'
  | 'previousClicks'
  | 'clicksDiff'
  | 'clicksDiffPct'
  | 'currentImpressions'
  | 'previousImpressions'
  | 'impressionsDiff'
  | 'currentCtr'
  | 'previousCtr'
  | 'ctrDiff'
  | 'currentPosition'
  | 'previousPosition'
  | 'positionDiff';

type SortDirection = 'asc' | 'desc';

export default function PagesTab({
  classifiedPages,
  rules,
  onOpenCategoryWizard,
  onQuickAddRule,
}: PagesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPageType, setSelectedPageType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('currentClicks');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Group pages by URL to pair Current and Previous metrics together in one table row
  const pairedPages = useMemo(() => {
    const map: Record<
      string,
      {
        current?: ClassifiedPagePerformance;
        previous?: ClassifiedPagePerformance;
      }
    > = {};

    classifiedPages.forEach((p) => {
      if (!map[p.page]) {
        map[p.page] = {};
      }
      if (p.period === 'current') {
        map[p.page].current = p;
      } else {
        map[p.page].previous = p;
      }
    });

    return Object.entries(map).map(([url, data]) => {
      const cur = data.current;
      const prev = data.previous;

      const currentClicks = cur ? cur.clicks : 0;
      const previousClicks = prev ? prev.clicks : 0;
      const clicksDiff = currentClicks - previousClicks;
      const clicksDiffPct = previousClicks > 0 ? ((currentClicks - previousClicks) / previousClicks) * 100 : 0;

      const currentImpressions = cur ? cur.impressions : 0;
      const previousImpressions = prev ? prev.impressions : 0;
      const impressionsDiff = currentImpressions - previousImpressions;
      const impressionsDiffPct =
        previousImpressions > 0 ? ((currentImpressions - previousImpressions) / previousImpressions) * 100 : 0;

      const currentCtr = cur ? cur.ctr : currentImpressions > 0 ? currentClicks / currentImpressions : 0;
      const previousCtr = prev ? prev.ctr : previousImpressions > 0 ? previousClicks / previousImpressions : 0;
      const ctrDiff = (currentCtr - previousCtr) * 100;

      const currentPosition = cur ? cur.position : 0;
      const previousPosition = prev ? prev.position : 0;
      // rank difference: positive means worse rank, negative means improved rank
      const positionDiff = currentPosition && previousPosition ? currentPosition - previousPosition : 0;

      const category = cur?.category || prev?.category || 'Uncategorized';
      const city = cur?.city || prev?.city || 'Unclassified';
      const pageType = cur?.pageType || prev?.pageType || 'General Page';
      const hub = cur?.hub || prev?.hub || 'General';

      return {
        url,
        category,
        city,
        pageType,
        hub,
        currentClicks,
        previousClicks,
        clicksDiff,
        clicksDiffPct,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        impressionsDiffPct,
        currentCtr,
        previousCtr,
        ctrDiff,
        currentPosition,
        previousPosition,
        positionDiff,
      };
    });
  }, [classifiedPages]);

  // Unique categories, cities, and pageTypes for dropdown filters
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    pairedPages.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [pairedPages]);

  const citiesList = useMemo(() => {
    const set = new Set<string>();
    pairedPages.forEach((p) => {
      if (p.city && p.city !== 'Unclassified') set.add(p.city);
    });
    return Array.from(set).sort();
  }, [pairedPages]);

  const pageTypesList = useMemo(() => {
    const set = new Set<string>();
    pairedPages.forEach((p) => {
      if (p.pageType) set.add(p.pageType);
    });
    return Array.from(set).sort();
  }, [pairedPages]);

  // Filtered & Sorted Pages
  const filteredPages = useMemo(() => {
    return pairedPages.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchCity = selectedCity === 'all' || item.city === selectedCity;
      const matchPageType = selectedPageType === 'all' || item.pageType === selectedPageType;

      return matchSearch && matchCategory && matchCity && matchPageType;
    });
  }, [pairedPages, searchTerm, selectedCategory, selectedCity, selectedPageType]);

  const sortedPages = useMemo(() => {
    return [...filteredPages].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      const diff = (aVal as number) - (bVal as number);
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [filteredPages, sortField, sortDirection]);

  // Pagination calculations
  const totalRows = sortedPages.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const currentPageSafe = Math.min(Math.max(1, pageNumber), totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const pagedRows = sortedPages.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Page URL',
      'Category',
      'City',
      'Page Type',
      'Hub',
      'Current Clicks',
      'Previous Clicks',
      'Clicks Diff',
      'Clicks Diff %',
      'Current Impressions',
      'Previous Impressions',
      'Impressions Diff',
      'Impressions Diff %',
      'Current CTR %',
      'Previous CTR %',
      'CTR Diff %',
      'Current Position',
      'Previous Position',
      'Position Diff',
    ];

    const rows = sortedPages.map((p) => [
      `"${p.url.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.city}"`,
      `"${p.pageType}"`,
      `"${p.hub}"`,
      p.currentClicks,
      p.previousClicks,
      p.clicksDiff,
      `${p.clicksDiffPct.toFixed(1)}%`,
      p.currentImpressions,
      p.previousImpressions,
      p.impressionsDiff,
      `${p.impressionsDiffPct.toFixed(1)}%`,
      `${(p.currentCtr * 100).toFixed(2)}%`,
      `${(p.previousCtr * 100).toFixed(2)}%`,
      `${p.ctrDiff.toFixed(2)}%`,
      p.currentPosition.toFixed(1),
      p.previousPosition.toFixed(1),
      p.positionDiff.toFixed(1),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gsc_pages_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="pages-tab-view">
      {/* Header & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              All Pages Explorer
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {totalRows.toLocaleString()} pages
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete performance matrix across all GSC dimensions, comparison deltas, and URL categorizations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCategoryWizard}
              className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              id="btn-open-category-wizard"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Categorize Pages / Add Rules
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              id="btn-export-pages-csv"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV ({sortedPages.length})
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              placeholder="Search by URL, category or city..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            >
              <option value="all">📁 All Categories ({categoriesList.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            >
              <option value="all">📍 All Cities ({citiesList.length})</option>
              {citiesList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Page Type Filter */}
          <div>
            <select
              value={selectedPageType}
              onChange={(e) => {
                setSelectedPageType(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            >
              <option value="all">📄 All Page Types ({pageTypesList.length})</option>
              {pageTypesList.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Full-Column Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center text-slate-400">#</th>
                <th
                  onClick={() => handleSort('page')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[240px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Page URL</span>
                    {sortField === 'page' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                {/* Categorization Columns */}
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    {sortField === 'category' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('city')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[90px]"
                >
                  <span>City</span>
                </th>
                <th
                  onClick={() => handleSort('pageType')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[110px]"
                >
                  <span>Page Type</span>
                </th>

                {/* Clicks Metrics */}
                <th
                  onClick={() => handleSort('currentClicks')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[85px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Clicks (Cur)</span>
                    {sortField === 'currentClicks' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('previousClicks')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 text-slate-400 min-w-[85px]"
                >
                  <span>Clicks (Prev)</span>
                </th>
                <th
                  onClick={() => handleSort('clicksDiff')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[100px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Clicks Diff (%)</span>
                    {sortField === 'clicksDiff' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>

                {/* Impressions Metrics */}
                <th
                  onClick={() => handleSort('currentImpressions')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[95px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Impr (Cur)</span>
                    {sortField === 'currentImpressions' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('previousImpressions')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 text-slate-400 min-w-[95px]"
                >
                  <span>Impr (Prev)</span>
                </th>
                <th
                  onClick={() => handleSort('impressionsDiff')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[95px]"
                >
                  <span>Impr Diff</span>
                </th>

                {/* CTR Metrics */}
                <th
                  onClick={() => handleSort('currentCtr')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[80px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CTR (Cur)</span>
                    {sortField === 'currentCtr' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('previousCtr')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 text-slate-400 min-w-[80px]"
                >
                  <span>CTR (Prev)</span>
                </th>

                {/* Position / Rank Metrics */}
                <th
                  onClick={() => handleSort('currentPosition')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[85px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Pos (Cur)</span>
                    {sortField === 'currentPosition' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('previousPosition')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 text-slate-400 min-w-[85px]"
                >
                  <span>Pos (Prev)</span>
                </th>
                <th
                  onClick={() => handleSort('positionDiff')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[85px]"
                >
                  <span>Pos Diff</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400 text-xs">
                    No pages matched your search or filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((item, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const isClicksPositive = item.clicksDiff > 0;
                  const isClicksNegative = item.clicksDiff < 0;

                  // For position: negative diff means improved rank (e.g. from 5 to 2 = -3), which is POSITIVE for SEO!
                  const isRankImproved = item.positionDiff < -0.1;
                  const isRankSlipped = item.positionDiff > 0.1;

                  return (
                    <tr key={item.url} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px] font-mono">
                        {globalIdx}
                      </td>

                      {/* Page URL with clean display */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-start gap-1.5 max-w-[320px] group">
                          <span
                            className="font-medium text-slate-800 break-all line-clamp-2 hover:text-indigo-600 cursor-pointer"
                            title={item.url}
                          >
                            {item.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                          </span>
                          <a
                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 shrink-0"
                            title="Open URL in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Category Badge with Quick Category Assign */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.category === 'Uncategorized'
                              ? 'bg-slate-100 text-slate-500 border border-slate-200/60'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5 opacity-60" />
                          {item.category}
                        </span>
                      </td>

                      {/* City */}
                      <td className="py-2.5 px-3">
                        {item.city !== 'Unclassified' ? (
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[10px] font-bold uppercase">
                            {item.city}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Page Type */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-600 text-[11px] font-medium truncate block max-w-[110px]">
                          {item.pageType}
                        </span>
                      </td>

                      {/* Clicks (Current) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {item.currentClicks.toLocaleString()}
                      </td>

                      {/* Clicks (Previous) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {item.previousClicks.toLocaleString()}
                      </td>

                      {/* Clicks Diff */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isClicksPositive
                              ? 'text-emerald-700 bg-emerald-50'
                              : isClicksNegative
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-slate-500 bg-slate-50'
                          }`}
                        >
                          {isClicksPositive ? `+${item.clicksDiff}` : item.clicksDiff}
                          {item.previousClicks > 0 && ` (${isClicksPositive ? '+' : ''}${item.clicksDiffPct.toFixed(0)}%)`}
                        </span>
                      </td>

                      {/* Impressions (Current) */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                        {item.currentImpressions.toLocaleString()}
                      </td>

                      {/* Impressions (Previous) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {item.previousImpressions.toLocaleString()}
                      </td>

                      {/* Impressions Diff */}
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        <span
                          className={
                            item.impressionsDiff > 0
                              ? 'text-emerald-600 font-semibold'
                              : item.impressionsDiff < 0
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {item.impressionsDiff > 0 ? `+${item.impressionsDiff.toLocaleString()}` : item.impressionsDiff.toLocaleString()}
                        </span>
                      </td>

                      {/* CTR (Current) */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                        {(item.currentCtr * 100).toFixed(2)}%
                      </td>

                      {/* CTR (Previous) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                        {(item.previousCtr * 100).toFixed(2)}%
                      </td>

                      {/* Pos (Current) */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                        {item.currentPosition ? item.currentPosition.toFixed(1) : '—'}
                      </td>

                      {/* Pos (Previous) */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                        {item.previousPosition ? item.previousPosition.toFixed(1) : '—'}
                      </td>

                      {/* Pos Diff */}
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        {item.currentPosition && item.previousPosition ? (
                          <span
                            className={`font-semibold ${
                              isRankImproved
                                ? 'text-emerald-600'
                                : isRankSlipped
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {/* Negative diff means numerical rank went down e.g. 5.0 -> 2.0 = -3.0 which is improved rank */}
                            {item.positionDiff < 0 ? `▲ ${Math.abs(item.positionDiff).toFixed(1)}` : item.positionDiff > 0 ? `▼ ${item.positionDiff.toFixed(1)}` : '0.0'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPageNumber(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
            <span>
              of <strong className="text-slate-800">{totalRows.toLocaleString()}</strong> pages
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Page <strong>{currentPageSafe}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={currentPageSafe <= 1}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageSafe >= totalPages}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
