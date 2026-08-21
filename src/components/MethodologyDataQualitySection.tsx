/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  FileCode,
  Database,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  Compass,
} from 'lucide-react';
import { PropertyTotals, DashboardFilterState } from '../types';
import { APPROVED_BRAND_TERMS } from '../toursData';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface MethodologyDataQualitySectionProps {
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
}

export const MethodologyDataQualitySection: React.FC<MethodologyDataQualitySectionProps> = ({
  propertyTotals,
  filters,
}) => {
  const pageGroupsList = [
    'Tours',
    'Tour Guides',
    'Tour Detail Pages',
    'Travel Blog',
    'Things to Do',
    'Shore Excursions',
    'Cruise Lines',
    'Cruise Ships',
    'Cruise Destinations',
    'Attractions',
    'Areas',
    'Safaris',
    'Essential Tours',
    'Tour Category Pages',
    'Directory Roots',
    'Country Pages',
    'City or Area Pages',
    'Blog Posts',
    'Other or Unclassified',
  ];

  const pageLevelsList = [
    'Directory Root (e.g. /cruise-lines, /categories)',
    'Country Level (e.g. /Italy-Tours, /Japan-Tours)',
    'City / Area Level (e.g. /Rome-Tours, /Tokyo-Tours, /Paris-Tours)',
    'Detail / Product Level (e.g. /shore-excursions/Civitavecchia-Port)',
    'Editorial Post (e.g. /blog/things-to-do-in-tokyo-with-local-guide)',
    'Guide Profile (e.g. /Rome-Tour-Guides)',
    'Unclassified Page Level',
  ];

  const queryThemesList = [
    'City Tours & Sightseeing',
    'Private Guide Services',
    'Shore Excursions & Cruise Ports',
    'Food & Wine Tastings',
    'Day Trips & Excursions',
    'Walking & Historical Tours',
    'Custom & Family Itineraries',
    'Safaris & Nature',
    'Unclassified Query Theme',
  ];

  const unsupportedReportsList = [
    {
      reportName: 'On-Site Tour Booking Conversion Rate by Query',
      missingField: 'ga:transactions / ga:conversionRate (Google Analytics 4 / CRM data not present in GSC)',
      workaround: 'GSC Search Analytics only measures search engine clicks and impressions. Integrate GA4 BigQuery export for post-click attribution.',
    },
    {
      reportName: 'Organic Revenue & Average Order Value per Landing Page',
      missingField: 'purchaseRevenue / currencyCode (E-Commerce transaction logs)',
      workaround: 'Use GSC URL Clicks as top-of-funnel discovery indicator; join with internal booking database via URL path.',
    },
    {
      reportName: 'Googlebot Crawl Frequency & HTTP Status Code Log Analysis',
      missingField: 'Server log-level status codes and bytes downloaded (Crawl Stats API)',
      workaround: 'Inspect GSC Settings -> Crawl Stats report separately or configure CDN log analysis (Cloudflare/Fastly).',
    },
    {
      reportName: 'Real-Time Organic Visitors (Live Last 30 Minutes)',
      missingField: 'Real-time streaming timestamp (Standard GSC reporting pipeline has a 3-day data latency lag)',
      workaround: 'Use Google Analytics 4 Realtime API for live traffic; standard GSC data is finalized after 72 hours.',
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
                Section 6 • Governance & Data Quality
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Full Audit Trail
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Methodology and Data Quality
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Data audit verification, property bounds, calculation rules, classification taxonomy, and unsupported field limitations.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Initial Data Audit Verification */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Initial Data Audit Verification
            </h3>
            <p className="text-xs text-slate-500">
              Verified GSC environment facts and property configuration constraints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">1. Connected Property</span>
            <div className="font-mono font-bold text-slate-900 text-sm mt-1">{propertyTotals.propertyName}</div>
            <p className="text-[11px] text-slate-500 mt-1">Domain-level verified property covering all sub-domains.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">2. Earliest Available Date</span>
            <div className="font-mono font-bold text-slate-900 text-sm mt-1">{propertyTotals.earliestDate}</div>
            <p className="text-[11px] text-slate-500 mt-1">16 complete months of historical search data.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">3. Latest Complete Date</span>
            <div className="font-mono font-bold text-emerald-700 text-sm mt-1">{propertyTotals.latestCompleteDate}</div>
            <p className="text-[11px] text-slate-500 mt-1">Reflects standard {propertyTotals.reportingLagDays}-day GSC data finalization latency.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">4. Refresh Frequency</span>
            <div className="font-mono font-bold text-blue-700 text-sm mt-1">Daily (~06:00 UTC)</div>
            <p className="text-[11px] text-slate-500 mt-1">Last refreshed at {propertyTotals.lastRefreshed}.</p>
          </div>
        </div>
      </div>

      {/* 2. Mathematical Calculation Rules & Formulas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Metric Definitions & Calculation Rules
            </h3>
            <p className="text-xs text-slate-500">
              Strict mathematical formulas ensuring data integrity across all reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>URL Click-Through Rate (CTR)</span>
              <span className="font-mono text-emerald-700 font-black">CTR = (Clicks / Impressions) × 100</span>
            </div>
            <p className="text-slate-600">
              <strong>Mandate:</strong> Never sum CTR across rows. All CTR values must be recalculated as total clicks divided by total impressions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Average Position & Delta</span>
              <span className="font-mono text-blue-700 font-black">Lower Number = Higher Placement</span>
            </div>
            <p className="text-slate-600">
              <strong>Mandate:</strong> A decrease in Average Position indicates ranking improvement (green). An increase indicates ranking decline (red). Never sum Average Position.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Share of Property Clicks</span>
              <span className="font-mono text-purple-700 font-black">Share = (URL Clicks / Total Property Clicks)</span>
            </div>
            <p className="text-slate-600">
              <strong>Mandate:</strong> Denominator must always be the complete property-level total ({propertyTotals.currentClicks.toLocaleString()} Clicks), never the sum of a filtered top 10 subset.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Click Gain vs Click Loss</span>
              <span className="font-mono text-amber-700 font-black">Gain = (Current - Prev) | Loss = (Prev - Current)</span>
            </div>
            <p className="text-slate-600">
              <strong>Mandate:</strong> Click Gain applies when Current &gt; Prev. Click Loss applies when Prev &gt; Current and is displayed as a positive loss number.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Classification Taxonomies */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              URL Classification Reference Taxonomy
            </h3>
            <p className="text-xs text-slate-500">
              Standardized grouping dictionaries for page directories, query themes, and branded search terms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Page Groups */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Page Groups ({pageGroupsList.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">18 Standard Groups</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {pageGroupsList.map((pg) => (
                <span key={pg} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                  {pg}
                </span>
              ))}
            </div>
          </div>

          {/* Query Themes */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Query Themes ({queryThemesList.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Search Intent</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {queryThemesList.map((qt) => (
                <span key={qt} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                  {qt}
                </span>
              ))}
            </div>
          </div>

          {/* Approved Brand Terms */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Approved Brand Terms</span>
              <span className="text-[10px] text-slate-500 font-mono">Regex Match</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {APPROVED_BRAND_TERMS.map((bt) => (
                <span key={bt} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
                  {bt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. List of Unsupported Reports & Missing Fields */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              List of Unsupported Reports and Missing Fields
            </h3>
            <p className="text-xs text-slate-500">
              Transparent audit of requests that cannot be fulfilled using Google Search Console data alone.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-amber-50/50">
                <th className="py-3 px-4">Unsupported Report Name</th>
                <th className="py-3 px-3">Exact Missing Field in GSC</th>
                <th className="py-3 px-4">Technical Explanation & Workaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unsupportedReportsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.reportName}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-rose-700 font-semibold max-w-xs">
                    {item.missingField}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                    {item.workaround}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways Footer */}
      <KeyTakeawaysFooter
        sectionTitle="Methodology and Data Quality"
        filters={filters}
        propertyTotals={propertyTotals}
      />
    </div>
  );
};
