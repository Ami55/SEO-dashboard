/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Link as LinkIcon, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, FileText } from 'lucide-react';
import { ClassifiedPagePerformance } from '../types';

interface PagesTablesProps {
  classifiedPages: ClassifiedPagePerformance[];
}

type ModeFilter = 'gained_clicks' | 'lost_clicks' | 'gained_impressions' | 'lost_rankings';

export default function PagesTables({ classifiedPages }: PagesTablesProps) {
  const [activeMode, setActiveMode] = useState<ModeFilter>('gained_clicks');

  // To do comparative page level analysis, we need to locate pages that are present across BOTH periods
  // Let's pair current and previous records by URL
  const preparePairedPages = () => {
    const pageMap: Record<string, { current?: ClassifiedPagePerformance; previous?: ClassifiedPagePerformance }> = {};

    classifiedPages.forEach(p => {
      if (!pageMap[p.page]) {
        pageMap[p.page] = {};
      }
      if (p.period === 'current') {
        pageMap[p.page].current = p;
      } else {
        pageMap[p.page].previous = p;
      }
    });

    const list: Array<{
      page: string;
      city: string;
      category: string;
      pageType: string;
      
      currentClicks: number;
      previousClicks: number;
      clicksDiff: number;
      
      currentImpressions: number;
      previousImpressions: number;
      impressionsDiff: number;
      
      currentPosition: number;
      previousPosition: number;
      positionDiff: number; // current - previous
    }> = [];

    Object.entries(pageMap).forEach(([page, data]) => {
      // Must be present in both, or default to 0 for missing comparisons
      const cur = data.current;
      const prev = data.previous;

      if (!cur && !prev) return;

      const currentClicks = cur ? cur.clicks : 0;
      const previousClicks = prev ? prev.clicks : 0;
      const clicksDiff = currentClicks - previousClicks;

      const currentImpressions = cur ? cur.impressions : 0;
      const previousImpressions = prev ? prev.impressions : 0;
      const impressionsDiff = currentImpressions - previousImpressions;

      const currentPosition = cur ? cur.position : 10;
      const previousPosition = prev ? prev.position : 10;
      // Position gain/loss formatting:
      // Positive diff means numerical position increased (e.g. 5.5 to 8.2), which signifies RANK SLIPPAGE.
      const positionDiff = currentPosition - previousPosition;

      // Classifications
      const city = cur ? cur.city : prev ? prev.city : 'Unclassified';
      const category = cur ? cur.category : prev ? prev.category : 'Unclassified';
      const pageType = cur ? cur.pageType : prev ? prev.pageType : 'Unclassified';

      list.push({
        page,
        city,
        category,
        pageType,
        currentClicks,
        previousClicks,
        clicksDiff,
        currentImpressions,
        previousImpressions,
        impressionsDiff,
        currentPosition,
        previousPosition,
        positionDiff,
      });
    });

    return list;
  };

  const pairedList = preparePairedPages();

  // Filter paired rows according to sub-tab choice
  const getFilteredList = () => {
    switch (activeMode) {
      case 'gained_clicks':
        return pairedList
          .filter(p => p.clicksDiff > 0)
          .sort((a, b) => b.clicksDiff - a.clicksDiff);
      case 'lost_clicks':
        return pairedList
          .filter(p => p.clicksDiff < 0)
          .sort((a, b) => a.clicksDiff - b.clicksDiff); // biggest loss on top
      case 'gained_impressions':
        return pairedList
          .filter(p => p.impressionsDiff > 0)
          .sort((a, b) => b.impressionsDiff - a.impressionsDiff);
      case 'lost_rankings':
        // Lost rankings means position difference > 0.05 (i.e. rank number became larger, slipping downwards on google placements)
        return pairedList
          .filter(p => p.positionDiff > 0.05)
          .sort((a, b) => b.positionDiff - a.positionDiff);
      default:
        return pairedList;
    }
  };

  const activePagesOutput = getFilteredList().slice(0, 10); // show top 10 rows for clean aesthetics

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="pages-tables-view">
      {/* Tab controls */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Target Segment Page Auditing</h3>
          <p className="text-xs text-slate-550 mt-0.5">Audit specific pages that achieved organic progress or experienced slippage.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 select-none">
          <button
            onClick={() => setActiveMode('gained_clicks')}
            className={`px-3 py-1.5 font-semibold text-[10px] uppercase rounded-md transition-all cursor-pointer ${
              activeMode === 'gained_clicks' ? 'bg-white shadow-sm text-indigo-700 font-bold border border-slate-205' : 'text-slate-550 hover:text-slate-855'
            }`}
          >
            Gained Clicks
          </button>
          <button
            onClick={() => setActiveMode('lost_clicks')}
            className={`px-3 py-1.5 font-semibold text-[10px] uppercase rounded-md transition-all cursor-pointer ${
              activeMode === 'lost_clicks' ? 'bg-white shadow-sm text-rose-700 font-bold border border-slate-205' : 'text-slate-550 hover:text-rose-800'
            }`}
          >
            Lost Clicks
          </button>
          <button
            onClick={() => setActiveMode('gained_impressions')}
            className={`px-3 py-1.5 font-semibold text-[10px] uppercase rounded-md transition-all cursor-pointer ${
              activeMode === 'gained_impressions' ? 'bg-white shadow-sm text-indigo-700 font-bold border border-slate-205' : 'text-slate-550 hover:text-slate-855'
            }`}
          >
            Gained Imps
          </button>
          <button
            onClick={() => setActiveMode('lost_rankings')}
            className={`px-3 py-1.5 font-semibold text-[10px] uppercase rounded-md transition-all cursor-pointer ${
              activeMode === 'lost_rankings' ? 'bg-white shadow-sm text-amber-700 font-bold border border-slate-205' : 'text-slate-550 hover:text-amber-800'
            }`}
          >
            Lost Rankings
          </button>
        </div>
      </div>

      {activePagesOutput.length === 0 ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-slate-200" />
          <p className="text-xs">No matching pages with comparison records found.</p>
          <p className="text-[10px] text-slate-400">
            Please verify you have both Current AND Previous period Page reports loaded to run comparison audits.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">GSC Landing Page URL</th>
                <th className="px-5 py-3.5">Segment Tag folders</th>
                
                {/* Metric specific columns */}
                {activeMode === 'gained_clicks' && (
                  <>
                    <th className="px-5 py-3.5 text-right">Current Clicks</th>
                    <th className="px-5 py-3.5 text-right">Previous Clicks</th>
                    <th className="px-6 py-3.5 text-right text-indigo-700">Clicks Gained</th>
                  </>
                )}
                {activeMode === 'lost_clicks' && (
                  <>
                    <th className="px-5 py-3.5 text-right">Current Clicks</th>
                    <th className="px-5 py-3.5 text-right">Previous Clicks</th>
                    <th className="px-6 py-3.5 text-right text-rose-700">Clicks Slipped</th>
                  </>
                )}
                {activeMode === 'gained_impressions' && (
                  <>
                    <th className="px-5 py-3.5 text-right">Current Imps</th>
                    <th className="px-5 py-3.5 text-right">Previous Imps</th>
                    <th className="px-6 py-3.5 text-right text-indigo-700">Imps Gained</th>
                  </>
                )}
                {activeMode === 'lost_rankings' && (
                  <>
                    <th className="px-5 py-3.5 text-right">Current Google Rank</th>
                    <th className="px-5 py-3.5 text-right">Previous Google Rank</th>
                    <th className="px-6 py-3.5 text-right text-rose-750">Positions Slipped</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {activePagesOutput.map((p, idx) => {
                const cleanUrlDisplay = p.page.replace('https://', '').replace('www.', '');
                
                return (
                  <tr key={`${p.page}-${idx}`} className="hover:bg-slate-50/40 transition-colors">
                    {/* URL link */}
                    <td className="px-6 py-4.5 max-w-[320px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 text-slate-400 hover:text-indigo-600 cursor-pointer" title="Open GSC live page">
                          <LinkIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-slate-750 truncate" title={p.page}>
                          {cleanUrlDisplay}
                        </span>
                      </div>
                    </td>

                    {/* Classification Tags */}
                    <td className="px-5 py-4.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-[9px] text-slate-500 font-bold rounded-md">
                          {p.city}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-50/30 border border-indigo-150 text-[9px] text-indigo-700 font-bold rounded-md">
                          {p.category}
                        </span>
                      </div>
                    </td>

                    {/* Interactive Metrics mapping */}
                    {activeMode === 'gained_clicks' && (
                      <>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-700">{p.currentClicks.toLocaleString()}</td>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-400">{p.previousClicks.toLocaleString()}</td>
                        <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold">
                          +{p.clicksDiff.toLocaleString()}
                        </td>
                      </>
                    )}
                    {activeMode === 'lost_clicks' && (
                      <>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-700">{p.currentClicks.toLocaleString()}</td>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-400">{p.previousClicks.toLocaleString()}</td>
                        <td className="px-6 py-4.5 text-right font-mono text-rose-600 font-bold">
                          {p.clicksDiff.toLocaleString()}
                        </td>
                      </>
                    )}
                    {activeMode === 'gained_impressions' && (
                      <>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-700">{p.currentImpressions.toLocaleString()}</td>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-400">{p.previousImpressions.toLocaleString()}</td>
                        <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold">
                          +{p.impressionsDiff.toLocaleString()}
                        </td>
                      </>
                    )}
                    {activeMode === 'lost_rankings' && (
                      <>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-750 font-bold">{p.currentPosition.toFixed(1)}</td>
                        <td className="px-5 py-4.5 text-right font-mono text-slate-400">{p.previousPosition.toFixed(1)}</td>
                        <td className="px-6 py-4.5 text-right font-mono text-rose-600 font-bold flex justify-end items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          +{p.positionDiff.toFixed(1)} ranking spots
                        </td>
                      </>
                    )}
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
