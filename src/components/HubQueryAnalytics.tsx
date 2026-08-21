/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, BarChart2, Eye, MousePointer, HelpCircle, ArrowRight, Compass } from 'lucide-react';
import { QueryPerformance, PageQueryPerformance, ClassificationRule } from '../types';
import { classifyUrl } from '../utils/classifier';

interface HubQueryAnalyticsProps {
  queries: QueryPerformance[];
  combined: PageQueryPerformance[];
  rules: ClassificationRule[];
}

export default function HubQueryAnalytics({
  queries,
  combined,
  rules,
}: HubQueryAnalyticsProps) {
  // Extract all unique hub names currently declared in rules
  const hubNames = Array.from(
    new Set(
      rules
        .filter(r => r.field === 'hub')
        .map(r => r.targetValue)
    )
  );

  // Default to Paris Hub or the first hub, or "All Hubs"
  const [selectedHub, setSelectedHub] = useState<string>(hubNames[0] || 'Unclassified');

  // Filter queries based on selected Hub:
  // We can locate queries associated with pages matching the selected Hub (if we have combined data)
  // or keywords containing matching patterns
  const getQueriesForSelectedHub = (): QueryPerformance[] => {
    const hubLower = selectedHub.toLowerCase();
    
    // Attempt 1: Map from combined GSC pages + queries dataset
    const matchedCombinedQueries = combined
      .filter(c => {
        const urlClass = classifyUrl(c.page, rules);
        return urlClass.hub.toLowerCase() === hubLower;
      })
      .map(c => ({
        query: c.query,
        clicks: c.clicks,
        impressions: c.impressions,
        ctr: c.ctr,
        position: c.position,
        period: c.period,
      }));

    if (matchedCombinedQueries.length > 0) {
      // Aggregate duplicates if any
      const map: Record<string, typeof matchedCombinedQueries[0]> = {};
      matchedCombinedQueries.forEach(q => {
        const key = `${q.query}-${q.period}`;
        if (!map[key]) {
          map[key] = { ...q };
        } else {
          map[key].clicks += q.clicks;
          map[key].impressions += q.impressions;
          map[key].ctr = map[key].impressions > 0 ? map[key].clicks / map[key].impressions : 0;
        }
      });
      return Object.values(map).filter(q => q.period === 'current');
    }

    // Attempt 2: Fallback to text matching on GSC queries list
    // Look for matching country, city, or direct hub term inside queries
    const activeHubRule = rules.find(r => r.field === 'hub' && r.targetValue === selectedHub);
    const pattern = activeHubRule ? activeHubRule.pattern.replace(/[\/\-_]/g, '').toLowerCase().trim() : hubLower.replace('hub', '').trim();

    return queries
      .filter(q => {
        if (q.period !== 'current') return false;
        const qStr = q.query.toLowerCase();
        return qStr.includes(pattern) || pattern.includes(qStr) || qStr.includes(hubLower.replace('hub', '').trim());
      });
  };

  const hubQueries = getQueriesForSelectedHub().sort((a, b) => b.clicks - a.clicks);

  // Opportunity Keywords Extraction (High Impressions, Low CTR)
  // Standard SEO Formula: Keywords where Impressions > Median Search Volume, and CTR < 2% (or below standard GSC avg, e.g. 2%), and position under 15
  const getQueryOpportunities = (): Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    potentialClicks: number; // calculated opportunity score
  }> => {
    const currentQueries = queries.filter(q => q.period === 'current');
    if (currentQueries.length === 0) return [];

    // Calculate median impressions to define "high volume"
    const sortedImps = [...currentQueries].map(q => q.impressions).sort((a, b) => a - b);
    const medianImp = sortedImps.length > 0 ? sortedImps[Math.floor(sortedImps.length * 0.4)] : 1000; // 40th percentile is a good threshold for high volume

    return currentQueries
      .filter(q => {
        // Filter criteria: High volume, CTR under 2%, positioned in striking range of page 1 (position between 3.0 and 15)
        return q.impressions >= medianImp && q.ctr < 0.02 && q.position >= 3.0 && q.position <= 15.0;
      })
      .map(q => {
        // Calculate Potential Incremental Clicks if we optimize title/meta and hit a baseline 3% CTR!
        // baseline clicks = impressions * 0.03
        const potentialClicks = Math.round(q.impressions * (0.035 - q.ctr));
        return {
          query: q.query,
          clicks: q.clicks,
          impressions: q.impressions,
          ctr: q.ctr * 100, // format as percentage
          position: q.position,
          potentialClicks,
        };
      })
      .sort((a, b) => b.potentialClicks - a.potentialClicks) // sort by biggest opportunity
      .slice(0, 8); // top 8 opportunities
  };

  const opportunitiesList = getQueryOpportunities();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="hub-keywords-row">
      {/* Tab Panel 1: Top Queries by Hub */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" />
              Top Keywords by Active Hub
            </h3>
            <p className="text-xs text-slate-550 mt-0.5">Filter queries mapped dynamically to your regional hubs.</p>
          </div>

          {/* Hub selector dropdown */}
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="px-3 py-1.5 border border-slate-205 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white cursor-pointer select-none"
          >
            {hubNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            {hubNames.indexOf('Unclassified') === -1 && <option value="Unclassified">Unclassified</option>}
          </select>
        </div>

        {hubQueries.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <BarChart2 className="w-8 h-8 text-slate-200" />
            <p className="text-xs">No keywords mapped to "{selectedHub}" currently.</p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              Please upload combined Pages + Queries reports, or verify your Hub matching rules contain keywords present in GSC exports.
            </p>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 py-2">
                  <th className="px-3 py-2">Keyword Query</th>
                  <th className="px-3 py-2 text-right">Clicks</th>
                  <th className="px-3 py-2 text-right">Impressions</th>
                  <th className="px-3 py-2 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {hubQueries.map((q, idx) => (
                  <tr key={`${q.query}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-slate-800 font-bold truncate max-w-[200px]" title={q.query}>
                      {q.query}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">{q.clicks.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">{q.impressions.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-500">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tab Panel 2: Striking-Distance CTR Opportunities */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-hidden">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Striking Distance Query Opportunities
            </h3>
            <div className="relative group/help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-500 cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2.5 rounded-lg shadow-md opacity-0 group-hover/help:opacity-100 transition-opacity pointer-events-none w-56 z-25 leading-normal">
                <span className="font-bold block mb-1">How matches work:</span>
                Identifies queries ranking in positions <span className="font-bold">3.0 - 15.0</span> with high search volume but poor CTR (<span className="font-bold">&lt; 2%</span>). These represent massive low-hanging click opportunities.
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-550 mt-0.5">High volume, low click-rate keywords positioned on the striking edge of GSC first page.</p>
        </div>

        {opportunitiesList.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-200" />
            <p className="text-xs">No matching striking opportunities found currently.</p>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
              This triggers once you have Queries files loaded with high impressions and click rates below 2%, ranking in striking ranks of Google.
            </p>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50/50 text-[10px] uppercase font-bold text-amber-700 tracking-wider border-b border-amber-100/60">
                  <th className="px-3 py-2.5">Keyword</th>
                  <th className="px-3 py-2.5 text-right flex items-center justify-end gap-0.5">
                    <Eye className="w-3.5 h-3.5 inline text-slate-400" />
                    Imps
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <MousePointer className="w-3.5 h-3.5 inline text-slate-400 mr-0.5" />
                    CTR
                  </th>
                  <th className="px-3 py-2.5 text-right">Rank</th>
                  <th className="px-3 py-2.5 text-right text-emerald-800 font-bold">Clicks Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {opportunitiesList.map((q, idx) => (
                  <tr key={`${q.query}-${idx}`} className="hover:bg-amber-50/15 transition-colors">
                    <td className="px-3 py-3 text-slate-800 font-bold max-w-[150px] truncate" title={q.query}>
                      {q.query}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">{q.impressions.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-mono text-rose-500">{q.ctr.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-500">{q.position.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right font-mono text-emerald-700 font-bold flex items-center justify-end gap-1.5">
                      +{q.potentialClicks.toLocaleString()}
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
