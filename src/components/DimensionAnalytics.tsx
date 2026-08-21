/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, ArrowUpDown, Tag, Globe, Settings, MapPin } from 'lucide-react';
import { AggregatedGroup } from '../utils/classifier';

interface DimensionAnalyticsProps {
  cities: AggregatedGroup[];
  categories: AggregatedGroup[];
  pageTypes: AggregatedGroup[];
}

type ActiveTabType = 'cities' | 'categories' | 'pageTypes';
type SortField = 'name' | 'currentClicks' | 'clicksDiff' | 'currentImpressions' | 'currentCtr' | 'currentAvgPosition';
type SortOrder = 'asc' | 'desc';

export default function DimensionAnalytics({
  cities,
  categories,
  pageTypes,
}: DimensionAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('currentClicks');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Select active data
  const getActiveData = (): AggregatedGroup[] => {
    switch (activeTab) {
      case 'cities':
        return cities;
      case 'categories':
        return categories;
      case 'pageTypes':
        return pageTypes;
      default:
        return [];
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600 ml-1 inline-block" /> : 
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600 ml-1 inline-block" />;
  };

  const activeDataList = getActiveData();

  // Filter list with query match
  const filteredData = activeDataList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort list
  const sortedData = [...filteredData].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="segment-analytics-view">
      {/* Sub tabs and Search controls */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => { setActiveTab('cities'); setSearchQuery(''); setSortField('currentClicks'); }}
            className={`px-4 py-2 font-semibold text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cities'
                ? 'bg-white shadow-sm text-indigo-700 border border-slate-205'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Cities {cities.length > 0 && `(${cities.length})`}
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setSearchQuery(''); setSortField('currentClicks'); }}
            className={`px-4 py-2 font-semibold text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-white shadow-sm text-indigo-700 border border-slate-205'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Categories {categories.length > 0 && `(${categories.length})`}
          </button>
          <button
            onClick={() => { setActiveTab('pageTypes'); setSearchQuery(''); setSortField('currentClicks'); }}
            className={`px-4 py-2 font-semibold text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pageTypes'
                ? 'bg-white shadow-sm text-indigo-700 border border-slate-205'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Page Types {pageTypes.length > 0 && `(${pageTypes.length})`}
          </button>
        </div>

        {/* Input search query */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'cities' ? 'cities' : activeTab === 'categories' ? 'categories' : 'page formats'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Globe className="w-8 h-8 text-slate-200" />
          <p className="text-xs">No metrics match current classifications.</p>
          <p className="text-[10px] text-slate-400">
            Please define dynamic rules for this dimension to auto-categorize landing URLs.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-indigo-50/40 select-none">
                <th className="px-6 py-4.5 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('name')}>
                  Segment Name {renderSortIndicator('name')}
                </th>
                <th className="px-5 py-4.5 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort('currentClicks')}>
                  Current Clicks {renderSortIndicator('currentClicks')}
                </th>
                <th className="px-5 py-4.5 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort('clicksDiff')}>
                  Clicks Shift {renderSortIndicator('clicksDiff')}
                </th>
                <th className="px-5 py-4.5 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort('currentImpressions')}>
                  Current Impressions {renderSortIndicator('currentImpressions')}
                </th>
                <th className="px-5 py-4.5 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort('currentCtr')}>
                  Avg CTR {renderSortIndicator('currentCtr')}
                </th>
                <th className="px-6 py-4.5 text-right cursor-pointer hover:bg-slate-50 animate-pulse-once" onClick={() => handleSort('currentAvgPosition')}>
                  Avg Rank (Imp Weighted) {renderSortIndicator('currentAvgPosition')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium leading-normal text-slate-600">
              {sortedData.map((item) => {
                const isGain = item.clicksDiff >= 0;
                const isPositionGain = item.positionDiff < 0; // Rank numbering going down represents moving UPwards on GSC placement!

                return (
                  <tr key={item.name} className="hover:bg-slate-50/40 transition-all font-sans">
                    <td className="px-6 py-4 font-bold text-slate-800 text-[12px]">{item.name}</td>
                    <td className="px-5 py-4 text-right font-mono text-slate-700">
                      {item.currentClicks.toLocaleString()}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        Prev: {item.previousClicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isGain ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isGain ? '+' : ''}{item.clicksDiff.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        {isGain ? '+' : ''}{item.clicksPctChange.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-500">
                      {item.currentImpressions.toLocaleString()}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        Prev: {item.previousImpressions.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-500">
                      {item.currentCtr.toFixed(2)}%
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        Prev: {item.previousCtr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-700 font-bold">{item.currentAvgPosition.toFixed(1)}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-sans font-normal">
                            Prev: {item.previousAvgPosition.toFixed(1)}
                          </span>
                          {Math.abs(item.positionDiff) > 0.05 && (
                            <span className={`text-[10px] font-bold ${
                              isPositionGain ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              ({isPositionGain ? '▲' : '▼'} {Math.abs(item.positionDiff).toFixed(1)})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
