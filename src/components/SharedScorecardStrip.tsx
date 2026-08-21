/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, MousePointerClick, Eye, Percent, Compass, Info } from 'lucide-react';
import { PropertyTotals } from '../types';

interface SharedScorecardStripProps {
  propertyTotals: PropertyTotals;
}

export const SharedScorecardStrip: React.FC<SharedScorecardStripProps> = ({ propertyTotals }) => {
  const clickDiff = propertyTotals.currentClicks - propertyTotals.previousClicks;
  const clickPct = propertyTotals.previousClicks > 0 ? (clickDiff / propertyTotals.previousClicks) * 100 : 0;

  const impsDiff = propertyTotals.currentImpressions - propertyTotals.previousImpressions;
  const impsPct = propertyTotals.previousImpressions > 0 ? (impsDiff / propertyTotals.previousImpressions) * 100 : 0;

  const ctrDiff = propertyTotals.currentCtr - propertyTotals.previousCtr;
  const ctrPct = propertyTotals.previousCtr > 0 ? (ctrDiff / propertyTotals.previousCtr) * 100 : 0;

  // Position: lower is better! (Decrease = Improvement)
  const posDiff = propertyTotals.previousPosition - propertyTotals.currentPosition;
  const posDiffRaw = propertyTotals.currentPosition - propertyTotals.previousPosition;

  const cards = [
    {
      id: 'scorecard-clicks',
      label: 'Total URL Clicks',
      current: propertyTotals.currentClicks.toLocaleString(),
      previous: propertyTotals.previousClicks.toLocaleString(),
      diff: `${clickDiff >= 0 ? '+' : ''}${clickDiff.toLocaleString()}`,
      pct: `${clickPct >= 0 ? '+' : ''}${clickPct.toFixed(1)}%`,
      isPositive: clickDiff >= 0,
      icon: MousePointerClick,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      definition: 'Direct search engine user clicks recorded by GSC property-level aggregation.',
    },
    {
      id: 'scorecard-impressions',
      label: 'Total Impressions',
      current: `${(propertyTotals.currentImpressions / 1000000).toFixed(1)}M`,
      rawCurrent: propertyTotals.currentImpressions.toLocaleString(),
      previous: `${(propertyTotals.previousImpressions / 1000000).toFixed(1)}M`,
      rawPrevious: propertyTotals.previousImpressions.toLocaleString(),
      diff: `${impsDiff >= 0 ? '+' : ''}${(impsDiff / 1000000).toFixed(2)}M`,
      pct: `${impsPct >= 0 ? '+' : ''}${impsPct.toFixed(1)}%`,
      isPositive: impsDiff >= 0,
      icon: Eye,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      definition: 'Total search result appearances in organic SERP for property URLs.',
    },
    {
      id: 'scorecard-ctr',
      label: 'Average URL CTR',
      current: `${(propertyTotals.currentCtr * 100).toFixed(2)}%`,
      previous: `${(propertyTotals.previousCtr * 100).toFixed(2)}%`,
      diff: `${ctrDiff >= 0 ? '+' : ''}${(ctrDiff * 100).toFixed(2)}%`,
      pct: `${ctrPct >= 0 ? '+' : ''}${ctrPct.toFixed(1)}%`,
      isPositive: ctrDiff >= 0,
      icon: Percent,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      definition: 'Calculated as Total Clicks / Total Impressions (property-level exact formula).',
    },
    {
      id: 'scorecard-position',
      label: 'Average Position',
      current: propertyTotals.currentPosition.toFixed(1),
      previous: propertyTotals.previousPosition.toFixed(1),
      diff: `${posDiffRaw >= 0 ? '+' : ''}${posDiffRaw.toFixed(1)}`,
      pct: posDiff > 0 ? 'Improved' : 'Worsened',
      isPositive: posDiff >= 0, // Lower rank value is better
      icon: Compass,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      definition: 'Average top ranking position in Google Search (lower number indicates higher SERP placement).',
      isInverted: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            {/* Top Row: Icon & Label */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Headline Numbers */}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {card.current}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  prev: {card.previous}
                </span>
              </div>
            </div>

            {/* Bottom Row: Delta Indicator & Definitions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div
                  className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                    card.isPositive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {card.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{card.diff} ({card.pct})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  As of {propertyTotals.latestCompleteDate}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate" title={card.definition}>
                  {card.definition}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
