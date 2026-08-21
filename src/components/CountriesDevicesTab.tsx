/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Smartphone,
  Sparkles,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
} from 'lucide-react';
import {
  CountryPerformance,
  DevicePerformance,
  SearchAppearancePerformance,
  DatePerformance,
} from '../types';

interface CountriesDevicesTabProps {
  countries: CountryPerformance[];
  devices: DevicePerformance[];
  appearances: SearchAppearancePerformance[];
  dates: DatePerformance[];
}

type SubTab = 'countries' | 'devices' | 'appearance' | 'dates';

export default function CountriesDevicesTab({
  countries,
  devices,
  appearances,
  dates,
}: CountriesDevicesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('countries');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Countries Pairing
  const pairedCountries = useMemo(() => {
    const map: Record<string, { current?: CountryPerformance; previous?: CountryPerformance }> = {};
    countries.forEach((c) => {
      if (!map[c.country]) map[c.country] = {};
      if (c.period === 'current') map[c.country].current = c;
      else map[c.country].previous = c;
    });

    const totalCurrentClicks = Object.values(map).reduce((sum, item) => sum + (item.current?.clicks || 0), 0) || 1;

    return Object.entries(map).map(([country, data]) => {
      const cur = data.current;
      const prev = data.previous;
      const currentClicks = cur?.clicks || 0;
      const previousClicks = prev?.clicks || 0;
      const clicksDiff = currentClicks - previousClicks;
      const currentImpressions = cur?.impressions || 0;
      const previousImpressions = prev?.impressions || 0;
      const impressionsDiff = currentImpressions - previousImpressions;
      const currentCtr = cur?.ctr || (currentImpressions > 0 ? currentClicks / currentImpressions : 0);
      const previousCtr = prev?.ctr || (previousImpressions > 0 ? previousClicks / previousImpressions : 0);
      const currentPosition = cur?.position || 0;
      const previousPosition = prev?.position || 0;
      const positionDiff = currentPosition && previousPosition ? currentPosition - previousPosition : 0;
      const trafficShare = (currentClicks / totalCurrentClicks) * 100;

      return {
        country,
        currentClicks,
        previousClicks,
        clicksDiff,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        currentCtr,
        previousCtr,
        currentPosition,
        previousPosition,
        positionDiff,
        trafficShare,
      };
    }).sort((a, b) => b.currentClicks - a.currentClicks);
  }, [countries]);

  // 2. Devices Pairing
  const pairedDevices = useMemo(() => {
    const map: Record<string, { current?: DevicePerformance; previous?: DevicePerformance }> = {};
    devices.forEach((d) => {
      const devName = d.device.toUpperCase();
      if (!map[devName]) map[devName] = {};
      if (d.period === 'current') map[devName].current = d;
      else map[devName].previous = d;
    });

    const totalClicks = Object.values(map).reduce((sum, item) => sum + (item.current?.clicks || 0), 0) || 1;

    return Object.entries(map).map(([device, data]) => {
      const cur = data.current;
      const prev = data.previous;
      const currentClicks = cur?.clicks || 0;
      const previousClicks = prev?.clicks || 0;
      const clicksDiff = currentClicks - previousClicks;
      const currentImpressions = cur?.impressions || 0;
      const previousImpressions = prev?.impressions || 0;
      const impressionsDiff = currentImpressions - previousImpressions;
      const currentCtr = cur?.ctr || (currentImpressions > 0 ? currentClicks / currentImpressions : 0);
      const previousCtr = prev?.ctr || (previousImpressions > 0 ? previousClicks / previousImpressions : 0);
      const currentPosition = cur?.position || 0;
      const previousPosition = prev?.position || 0;
      const positionDiff = currentPosition && previousPosition ? currentPosition - previousPosition : 0;
      const trafficShare = (currentClicks / totalClicks) * 100;

      return {
        device,
        currentClicks,
        previousClicks,
        clicksDiff,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        currentCtr,
        previousCtr,
        currentPosition,
        previousPosition,
        positionDiff,
        trafficShare,
      };
    }).sort((a, b) => b.currentClicks - a.currentClicks);
  }, [devices]);

  // 3. Search Appearance Pairing
  const pairedAppearances = useMemo(() => {
    const map: Record<string, { current?: SearchAppearancePerformance; previous?: SearchAppearancePerformance }> = {};
    appearances.forEach((a) => {
      if (!map[a.appearance]) map[a.appearance] = {};
      if (a.period === 'current') map[a.appearance].current = a;
      else map[a.appearance].previous = a;
    });

    return Object.entries(map).map(([appearance, data]) => {
      const cur = data.current;
      const prev = data.previous;
      const currentClicks = cur?.clicks || 0;
      const previousClicks = prev?.clicks || 0;
      const clicksDiff = currentClicks - previousClicks;
      const currentImpressions = cur?.impressions || 0;
      const previousImpressions = prev?.impressions || 0;
      const impressionsDiff = currentImpressions - previousImpressions;
      const currentCtr = cur?.ctr || (currentImpressions > 0 ? currentClicks / currentImpressions : 0);
      const previousCtr = prev?.ctr || (previousImpressions > 0 ? previousClicks / previousImpressions : 0);
      const currentPosition = cur?.position || 0;
      const previousPosition = prev?.position || 0;
      const positionDiff = currentPosition && previousPosition ? currentPosition - previousPosition : 0;

      return {
        appearance,
        currentClicks,
        previousClicks,
        clicksDiff,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        currentCtr,
        previousCtr,
        currentPosition,
        previousPosition,
        positionDiff,
      };
    }).sort((a, b) => b.currentClicks - a.currentClicks);
  }, [appearances]);

  // 4. Dates
  const sortedDates = useMemo(() => {
    return [...dates].sort((a, b) => a.date.localeCompare(b.date));
  }, [dates]);

  return (
    <div className="space-y-6" id="countries-devices-tab-view">
      {/* Sub Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 select-none overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('countries')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'countries'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Countries ({pairedCountries.length})
            </button>

            <button
              onClick={() => setActiveSubTab('devices')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'devices'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Devices ({pairedDevices.length})
            </button>

            <button
              onClick={() => setActiveSubTab('appearance')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'appearance'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Search Appearance ({pairedAppearances.length})
            </button>

            <button
              onClick={() => setActiveSubTab('dates')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'dates'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Dates Trend ({sortedDates.length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table rows..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 1. Countries Table */}
      {activeSubTab === 'countries' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Country-Level Organic Traffic Breakdown
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none">
                <tr>
                  <th className="py-3 px-4 min-w-[180px]">Country</th>
                  <th className="py-3 px-4 min-w-[140px]">Share %</th>
                  <th className="py-3 px-4 text-right">Clicks (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Clicks (Prev)</th>
                  <th className="py-3 px-4 text-right">Clicks Diff</th>
                  <th className="py-3 px-4 text-right">Impr (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Impr (Prev)</th>
                  <th className="py-3 px-4 text-right">Impr Diff</th>
                  <th className="py-3 px-4 text-right">CTR (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">CTR (Prev)</th>
                  <th className="py-3 px-4 text-right">Pos (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Pos (Prev)</th>
                  <th className="py-3 px-4 text-right">Pos Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pairedCountries
                  .filter((c) => searchTerm === '' || c.country.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((item) => (
                    <tr key={item.country} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {item.country}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, item.trafficShare)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-600">
                            {item.trafficShare.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-850">
                        {item.currentClicks.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {item.previousClicks.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold">
                        <span
                          className={
                            item.clicksDiff > 0
                              ? 'text-emerald-600'
                              : item.clicksDiff < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }
                        >
                          {item.clicksDiff > 0 ? `+${item.clicksDiff}` : item.clicksDiff}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                        {item.currentImpressions.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {item.previousImpressions.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                        {item.impressionsDiff > 0 ? `+${item.impressionsDiff.toLocaleString()}` : item.impressionsDiff.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-700">
                        {(item.currentCtr * 100).toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {(item.previousCtr * 100).toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-700">
                        {item.currentPosition ? item.currentPosition.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {item.previousPosition ? item.previousPosition.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                        {item.positionDiff < 0 ? (
                          <span className="text-emerald-600 font-semibold">▲ {Math.abs(item.positionDiff).toFixed(1)}</span>
                        ) : item.positionDiff > 0 ? (
                          <span className="text-rose-600 font-semibold">▼ {item.positionDiff.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Devices Table */}
      {activeSubTab === 'devices' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Device-Level Performance Metrics (Desktop, Mobile, Tablet)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none">
                <tr>
                  <th className="py-3 px-4 min-w-[160px]">Device Type</th>
                  <th className="py-3 px-4 min-w-[140px]">Share %</th>
                  <th className="py-3 px-4 text-right">Clicks (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Clicks (Prev)</th>
                  <th className="py-3 px-4 text-right">Clicks Diff</th>
                  <th className="py-3 px-4 text-right">Impr (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Impr (Prev)</th>
                  <th className="py-3 px-4 text-right">CTR (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">CTR (Prev)</th>
                  <th className="py-3 px-4 text-right">Pos (Cur)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pairedDevices.map((item) => (
                  <tr key={item.device} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-500" />
                      {item.device}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, item.trafficShare)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-600">
                          {item.trafficShare.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-850">
                      {item.currentClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.previousClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span
                        className={
                          item.clicksDiff > 0
                            ? 'text-emerald-600'
                            : item.clicksDiff < 0
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }
                      >
                        {item.clicksDiff > 0 ? `+${item.clicksDiff}` : item.clicksDiff}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.currentImpressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.previousImpressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {(item.currentCtr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {(item.previousCtr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {item.currentPosition ? item.currentPosition.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Search Appearance Table */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Search Appearance & Rich Results Breakdown
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none">
                <tr>
                  <th className="py-3 px-4 min-w-[200px]">Search Appearance Type</th>
                  <th className="py-3 px-4 text-right">Clicks (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Clicks (Prev)</th>
                  <th className="py-3 px-4 text-right">Clicks Diff</th>
                  <th className="py-3 px-4 text-right">Impr (Cur)</th>
                  <th className="py-3 px-4 text-right text-slate-400">Impr (Prev)</th>
                  <th className="py-3 px-4 text-right">CTR (Cur)</th>
                  <th className="py-3 px-4 text-right">Pos (Cur)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pairedAppearances.map((item) => (
                  <tr key={item.appearance} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {item.appearance}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-850">
                      {item.currentClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.previousClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={item.clicksDiff > 0 ? 'text-emerald-600' : 'text-slate-600'}>
                        {item.clicksDiff > 0 ? `+${item.clicksDiff}` : item.clicksDiff}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.currentImpressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.previousImpressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {(item.currentCtr * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.currentPosition ? item.currentPosition.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Dates Table */}
      {activeSubTab === 'dates' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Daily Organic Performance Log
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold select-none">
                <tr>
                  <th className="py-3 px-4 min-w-[140px]">Date</th>
                  <th className="py-3 px-4 text-right">Clicks</th>
                  <th className="py-3 px-4 text-right">Impressions</th>
                  <th className="py-3 px-4 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Average Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDates.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-800 font-medium">
                      {d.date}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-850">
                      {d.clicks.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {d.impressions.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-700">
                      {(d.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {d.position.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
