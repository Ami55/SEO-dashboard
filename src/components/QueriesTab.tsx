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
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Compass,
} from 'lucide-react';
import { ClassifiedQueryPerformance } from '../types';

interface QueriesTabProps {
  classifiedQueries: ClassifiedQueryPerformance[];
}

type SortField =
  | 'query'
  | 'category'
  | 'hub'
  | 'currentClicks'
  | 'previousClicks'
  | 'clicksDiff'
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

export default function QueriesTab({ classifiedQueries }: QueriesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [opportunityFilter, setOpportunityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('currentClicks');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Group queries to pair current & previous metrics
  const pairedQueries = useMemo(() => {
    const map: Record<
      string,
      {
        current?: ClassifiedQueryPerformance;
        previous?: ClassifiedQueryPerformance;
      }
    > = {};

    classifiedQueries.forEach((q) => {
      if (!map[q.query]) {
        map[q.query] = {};
      }
      if (q.period === 'current') {
        map[q.query].current = q;
      } else {
        map[q.query].previous = q;
      }
    });

    return Object.entries(map).map(([query, data]) => {
      const cur = data.current;
      const prev = data.previous;

      const currentClicks = cur ? cur.clicks : 0;
      const previousClicks = prev ? prev.clicks : 0;
      const clicksDiff = currentClicks - previousClicks;
      const clicksDiffPct = previousClicks > 0 ? ((currentClicks - previousClicks) / previousClicks) * 100 : 0;

      const currentImpressions = cur ? cur.impressions : 0;
      const previousImpressions = prev ? prev.impressions : 0;
      const impressionsDiff = currentImpressions - previousImpressions;

      const currentCtr = cur ? cur.ctr : currentImpressions > 0 ? currentClicks / currentImpressions : 0;
      const previousCtr = prev ? prev.ctr : previousImpressions > 0 ? previousClicks / previousImpressions : 0;
      const ctrDiff = (currentCtr - previousCtr) * 100;

      const currentPosition = cur ? cur.position : 0;
      const previousPosition = prev ? prev.position : 0;
      const positionDiff = currentPosition && previousPosition ? currentPosition - previousPosition : 0;

      const category = cur?.category || prev?.category || 'General';
      const hub = cur?.hub || prev?.hub || 'General';

      // Opportunity Detection
      let opportunityType: 'striking' | 'top3' | 'gainer' | 'slipping' | 'standard' = 'standard';
      if (currentPosition >= 4.0 && currentPosition <= 15.0 && currentImpressions >= 2000) {
        opportunityType = 'striking';
      } else if (currentPosition > 0 && currentPosition <= 3.0) {
        opportunityType = 'top3';
      } else if (clicksDiff > 50) {
        opportunityType = 'gainer';
      } else if (positionDiff > 0.5) {
        opportunityType = 'slipping';
      }

      return {
        query,
        category,
        hub,
        currentClicks,
        previousClicks,
        clicksDiff,
        clicksDiffPct,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        currentCtr,
        previousCtr,
        ctrDiff,
        currentPosition,
        previousPosition,
        positionDiff,
        opportunityType,
      };
    });
  }, [classifiedQueries]);

  const hubsList = useMemo(() => {
    const set = new Set<string>();
    pairedQueries.forEach((q) => {
      if (q.hub && q.hub !== 'General') set.add(q.hub);
    });
    return Array.from(set).sort();
  }, [pairedQueries]);

  // Filtered and Sorted Queries
  const filteredQueries = useMemo(() => {
    return pairedQueries.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchHub = selectedHub === 'all' || item.hub === selectedHub;

      let matchOpp = true;
      if (opportunityFilter === 'striking') {
        matchOpp = item.opportunityType === 'striking';
      } else if (opportunityFilter === 'top3') {
        matchOpp = item.opportunityType === 'top3';
      } else if (opportunityFilter === 'gainer') {
        matchOpp = item.clicksDiff > 0;
      } else if (opportunityFilter === 'slipping') {
        matchOpp = item.positionDiff > 0.1;
      }

      return matchSearch && matchHub && matchOpp;
    });
  }, [pairedQueries, searchTerm, selectedHub, opportunityFilter]);

  const sortedQueries = useMemo(() => {
    return [...filteredQueries].sort((a, b) => {
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
  }, [filteredQueries, sortField, sortDirection]);

  // Pagination
  const totalRows = sortedQueries.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const currentPageSafe = Math.min(Math.max(1, pageNumber), totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const pagedRows = sortedQueries.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Search Query',
      'Opportunity Type',
      'Hub',
      'Category',
      'Current Clicks',
      'Previous Clicks',
      'Clicks Diff',
      'Clicks Diff %',
      'Current Impressions',
      'Previous Impressions',
      'Impressions Diff',
      'Current CTR %',
      'Previous CTR %',
      'CTR Diff %',
      'Current Position',
      'Previous Position',
      'Position Diff',
    ];

    const rows = sortedQueries.map((q) => [
      `"${q.query.replace(/"/g, '""')}"`,
      `"${q.opportunityType}"`,
      `"${q.hub}"`,
      `"${q.category}"`,
      q.currentClicks,
      q.previousClicks,
      q.clicksDiff,
      `${q.clicksDiffPct.toFixed(1)}%`,
      q.currentImpressions,
      q.previousImpressions,
      q.impressionsDiff,
      `${(q.currentCtr * 100).toFixed(2)}%`,
      `${(q.previousCtr * 100).toFixed(2)}%`,
      `${q.ctrDiff.toFixed(2)}%`,
      q.currentPosition.toFixed(1),
      q.previousPosition.toFixed(1),
      q.positionDiff.toFixed(1),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gsc_queries_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="queries-tab-view">
      {/* Header & Filter Row */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              All Search Queries Explorer
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {totalRows.toLocaleString()} queries
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze all organic search terms, identify striking distance opportunities, and monitor rank shifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Queries CSV ({sortedQueries.length})
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              placeholder="Filter by keyword / search query..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={opportunityFilter}
              onChange={(e) => {
                setOpportunityFilter(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            >
              <option value="all">⚡ All Query Intent / Opportunities</option>
              <option value="striking">🎯 Striking Distance (Pos 4-15 & High Impr)</option>
              <option value="top3">⭐ Top 3 Prime Ranking Keywords</option>
              <option value="gainer">🚀 Organic Traffic Gainers</option>
              <option value="slipping">⚠️ Lost Rankings / Slipping Queries</option>
            </select>
          </div>

          <div>
            <select
              value={selectedHub}
              onChange={(e) => {
                setSelectedHub(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            >
              <option value="all">📍 All Hubs ({hubsList.length})</option>
              {hubsList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Queries Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center text-slate-400">#</th>
                <th
                  onClick={() => handleSort('query')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[220px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Search Query</span>
                    {sortField === 'query' &&
                      (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[140px]">
                  <span>Opportunity Tag</span>
                </th>
                <th
                  onClick={() => handleSort('hub')}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600 min-w-[100px]"
                >
                  <span>Hub / Topic</span>
                </th>

                {/* Clicks */}
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
                  className="py-3 px-3 text-right text-slate-400 min-w-[85px]"
                >
                  <span>Clicks (Prev)</span>
                </th>
                <th
                  onClick={() => handleSort('clicksDiff')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[95px]"
                >
                  <span>Clicks Diff</span>
                </th>

                {/* Impressions */}
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
                  className="py-3 px-3 text-right text-slate-400 min-w-[95px]"
                >
                  <span>Impr (Prev)</span>
                </th>
                <th
                  onClick={() => handleSort('impressionsDiff')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[95px]"
                >
                  <span>Impr Diff</span>
                </th>

                {/* CTR */}
                <th
                  onClick={() => handleSort('currentCtr')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 min-w-[80px]"
                >
                  <span>CTR (Cur)</span>
                </th>
                <th
                  onClick={() => handleSort('previousCtr')}
                  className="py-3 px-3 text-right text-slate-400 min-w-[80px]"
                >
                  <span>CTR (Prev)</span>
                </th>

                {/* Position */}
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
                  className="py-3 px-3 text-right text-slate-400 min-w-[85px]"
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
                  <td colSpan={15} className="py-12 text-center text-slate-400 text-xs">
                    No queries matched your search criteria.
                  </td>
                </tr>
              ) : (
                pagedRows.map((item, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const isClicksPositive = item.clicksDiff > 0;
                  const isClicksNegative = item.clicksDiff < 0;
                  const isRankImproved = item.positionDiff < -0.1;
                  const isRankSlipped = item.positionDiff > 0.1;

                  return (
                    <tr key={item.query} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px] font-mono">
                        {globalIdx}
                      </td>

                      {/* Query Name */}
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <span className="hover:text-indigo-600 cursor-pointer">{item.query}</span>
                      </td>

                      {/* Opportunity Badge */}
                      <td className="py-2.5 px-3">
                        {item.opportunityType === 'striking' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                            🎯 Striking Dist ({item.currentPosition.toFixed(1)})
                          </span>
                        )}
                        {item.opportunityType === 'top3' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                            ⭐ Top 3 (# {item.currentPosition.toFixed(1)})
                          </span>
                        )}
                        {item.opportunityType === 'gainer' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[10px] font-semibold">
                            🚀 +{item.clicksDiff} clicks
                          </span>
                        )}
                        {item.opportunityType === 'slipping' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-semibold">
                            ⚠️ Rank Slipped
                          </span>
                        )}
                        {item.opportunityType === 'standard' && (
                          <span className="text-slate-400 text-[11px] font-medium">—</span>
                        )}
                      </td>

                      {/* Hub */}
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                          {item.hub}
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
              of <strong className="text-slate-800">{totalRows.toLocaleString()}</strong> queries
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
