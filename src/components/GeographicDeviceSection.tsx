/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Video,
  Image as ImageIcon,
  Radio,
  Info,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import {
  CountryPerformance,
  DevicePerformance,
  SearchTypePerformance,
  PropertyTotals,
  DashboardFilterState,
} from '../types';
import { SharedScorecardStrip } from './SharedScorecardStrip';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface GeographicDeviceSectionProps {
  countries?: CountryPerformance[];
  devices?: DevicePerformance[];
  searchTypes?: SearchTypePerformance[];
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
}

export const GeographicDeviceSection: React.FC<GeographicDeviceSectionProps> = ({
  countries = [],
  devices = [],
  searchTypes = [],
  propertyTotals,
  filters,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider">
                Section 5 • Geographic & Device Distribution
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {countries.length} Country Segments • 3 Device Classes
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Geographic and Device Performance
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Searcher country origin, device category distribution, and search type footprint.
            </p>
          </div>
        </div>
      </div>

      {/* Shared KPI Strip */}
      <SharedScorecardStrip propertyTotals={propertyTotals} />

      {/* 23. Performance by Searcher Country */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>23. Performance by Searcher Country</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organic demand origin broken down by searcher geographic location.
            </p>
          </div>

          {/* Explicit Note Box as mandated */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">
              <strong>Crucial Context:</strong> Country represents the <em>searcher's physical location</em> at search time, not the tour destination or language.
            </span>
          </div>
        </div>

        {/* Country Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-4">Searcher Country</th>
                <th className="py-3 px-3">ISO Code</th>
                <th className="py-3 px-3 text-right">Current Clicks</th>
                <th className="py-3 px-3 text-right">Previous Clicks</th>
                <th className="py-3 px-3 text-right">Click Velocity</th>
                <th className="py-3 px-3 text-right">Share of Clicks</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Avg Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {countries.map((c) => {
                const isPos = c.clickChange >= 0;
                return (
                  <tr key={c.countryCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{c.country}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500 font-semibold">
                      {c.countryCode}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                      {c.prevClicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          isPos ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPos ? '+' : ''}{c.clickChange.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-blue-600 text-sm">
                      {(c.shareOfClicks * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {(c.impressions / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {(c.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {c.position.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 24. Device Performance */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span>24. Device Performance & Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-platform breakdown comparing desktop research behavior vs. mobile in-destination search.
          </p>
        </div>

        {/* Visual Device Composition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {devices.map((d) => {
            const Icon = d.device === 'DESKTOP' ? Monitor : d.device === 'MOBILE' ? Smartphone : Tablet;
            const colorClass =
              d.device === 'DESKTOP'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : d.device === 'MOBILE'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-purple-50 border-purple-200 text-purple-900';

            return (
              <div key={d.device} className={`p-6 rounded-2xl border ${colorClass} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{d.device}</span>
                    <Icon className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-3xl font-black font-mono mt-1">
                    {(d.clickShare * 100).toFixed(1)}% Share
                  </div>
                  <p className="text-xs opacity-90 mt-2 font-mono">
                    {d.clicks.toLocaleString()} Clicks • {(d.impressions / 1000000).toFixed(1)}M Impressions
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 text-xs font-medium flex items-center justify-between">
                  <span>CTR: <strong>{(d.ctr * 100).toFixed(2)}%</strong></span>
                  <span>Avg Pos: <strong>{d.position.toFixed(1)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Device Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-4">Device Category</th>
                <th className="py-3 px-3 text-right">Current Clicks</th>
                <th className="py-3 px-3 text-right">Previous Clicks</th>
                <th className="py-3 px-3 text-right">Click Velocity</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Avg Position</th>
                <th className="py-3 px-4 text-right">Share of Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d.device} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {d.device}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                    {d.clicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                    {d.prevClicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                    +{d.clickChange.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                    {(d.impressions / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                    {(d.ctr * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                    {d.position.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {(d.clickShare * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 25. Search Type Performance */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-600" />
            <span>25. Search Type Performance (Web, Image, Video)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown across Google standard web search, image search packs, and video carousel results.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-purple-50/50">
                <th className="py-3 px-4">Search Type Dimension</th>
                <th className="py-3 px-3 text-right">Current Clicks</th>
                <th className="py-3 px-3 text-right">Previous Clicks</th>
                <th className="py-3 px-3 text-right">Click Velocity</th>
                <th className="py-3 px-3 text-right">Impressions</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Avg Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchTypes.map((st) => (
                <tr key={st.searchType} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                    {st.searchType === 'Web' ? (
                      <Globe className="w-4 h-4 text-blue-600" />
                    ) : st.searchType === 'Image' ? (
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Video className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{st.searchType} Search</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                    {st.clicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                    {st.prevClicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                    +{st.clickChange.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                    {(st.impressions / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                    {(st.ctr * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                    {st.position.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways Footer */}
      <KeyTakeawaysFooter
        sectionTitle="Geographic and Device Performance"
        filters={filters}
        propertyTotals={propertyTotals}
      />
    </div>
  );
};
