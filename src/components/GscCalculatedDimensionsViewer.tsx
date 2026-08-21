/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Layers,
  AlertCircle,
  HelpCircle,
  FileText,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  GSC_PAGE_GROUP_CASE_SQL,
  GSC_PAGE_LEVEL_CASE_SQL,
} from '../utils/gscTaxonomyEngine';

export const GscCalculatedDimensionsViewer: React.FC = () => {
  const [copiedGroup, setCopiedGroup] = useState(false);
  const [copiedLevel, setCopiedLevel] = useState(false);
  const [activeFormulaTab, setActiveFormulaTab] = useState<'both' | 'page-group' | 'page-level' | 'priority-hierarchy'>('both');

  const copyToClipboard = (text: string, type: 'group' | 'level') => {
    navigator.clipboard.writeText(text);
    if (type === 'group') {
      setCopiedGroup(true);
      setTimeout(() => setCopiedGroup(false), 2000);
    } else {
      setCopiedLevel(true);
      setTimeout(() => setCopiedLevel(false), 2000);
    }
  };

  const priorityOrderTable = [
    { priority: 1, condition: 'Path equals /', pageGroup: 'Homepage', pageLevel: 'Site Root' },
    { priority: 2, condition: 'Contains /tour-details/', pageGroup: 'Tour Details', pageLevel: 'Tour Detail Page' },
    { priority: 3, condition: 'Contains /attractions/ under /tour-guides/', pageGroup: 'Attractions', pageLevel: 'Attraction Guide Page' },
    { priority: 4, condition: 'Contains /attractions/ under /tours/', pageGroup: 'Attractions', pageLevel: 'Attraction Page' },
    { priority: 5, condition: 'Ends with /shore-ex-tours', pageGroup: 'Shore Excursions', pageLevel: 'Cruise Destination / Port Page' },
    { priority: 6, condition: 'Exact /tours/essentials-tours', pageGroup: 'Essential Tours', pageLevel: 'Global Landing Page' },
    { priority: 7, condition: 'Geographic path ending /essentials-tours', pageGroup: 'Essential Tours', pageLevel: 'City / Area Landing Page' },
    { priority: 8, condition: '/shore-excursions/cruise-line/{slug}', pageGroup: 'Shore Excursions', pageLevel: 'Cruise Ship / Sailing Page' },
    { priority: 9, condition: '/shore-excursions/{line}/{ship}', pageGroup: 'Shore Excursions', pageLevel: 'Cruise Ship / Sailing Page' },
    { priority: 10, condition: '/shore-excursions/{line}', pageGroup: 'Shore Excursions', pageLevel: 'Cruise Line Page' },
    { priority: 11, condition: 'Tour path ending -tours', pageGroup: 'Tours', pageLevel: 'Tour Category Page' },
    { priority: 12, condition: '/travel-blog/{slug}', pageGroup: 'Travel Blog', pageLevel: 'Blog Post' },
    { priority: 13, condition: '/things-to-do/{country}/{location}', pageGroup: 'Things to Do', pageLevel: 'City / Area / Region Page' },
    { priority: 14, condition: '/things-to-do/{country}', pageGroup: 'Things to Do', pageLevel: 'Country Page' },
    { priority: 15, condition: '/safaris/{country}/{location}', pageGroup: 'Safaris', pageLevel: 'City / Area / Region Page' },
    { priority: 16, condition: '/safaris/{country}', pageGroup: 'Safaris', pageLevel: 'Country Page' },
    { priority: 17, condition: '/tours/{country}/{location}', pageGroup: 'Tours', pageLevel: 'City / Area / Region Page' },
    { priority: 18, condition: '/tour-guides/{country}/{location}', pageGroup: 'Tour Guides', pageLevel: 'City / Area / Region Page' },
    { priority: 19, condition: 'Directory plus country', pageGroup: 'Relevant directory', pageLevel: 'Country Page' },
    { priority: 20, condition: 'Exact directory root', pageGroup: 'Relevant directory', pageLevel: 'Directory Root' },
    { priority: 21, condition: 'Confirmed guide-profile pattern', pageGroup: 'Guide Profiles', pageLevel: 'Guide Profile Page' },
    { priority: 22, condition: 'Other indexable informational paths', pageGroup: 'Corporate and Informational', pageLevel: 'Informational Page' },
    { priority: 23, condition: 'Anything unmatched', pageGroup: 'Other', pageLevel: 'Unclassified' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="gsc-calculated-dimensions-viewer">
      {/* Overview & Instructions Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <Code2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Required Calculated Dimensions (Google Search Console Data-Source Level)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect GSC data sources for these calculated fields before building report pages. Formulas utilize the canonical Landing Page dimension.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveFormulaTab('both')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFormulaTab === 'both'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Formulas
            </button>
            <button
              onClick={() => setActiveFormulaTab('page-group')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFormulaTab === 'page-group'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Page Group
            </button>
            <button
              onClick={() => setActiveFormulaTab('page-level')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFormulaTab === 'page-level'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Page Level
            </button>
            <button
              onClick={() => setActiveFormulaTab('priority-hierarchy')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFormulaTab === 'priority-hierarchy'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              23-Priority Order
            </button>
          </div>
        </div>

        {/* Essential Rules Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              Ordering &amp; Evaluation Precedence
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              <strong>Essential Tours</strong> must appear before Tours because its URL also begins with <code className="bg-blue-100 px-1 py-0.5 rounded">/tours/</code>. Specific templates (Tour Details, Attractions) must be evaluated before broad geographic patterns.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              City &amp; Area Limitation Rule
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Do not assume every 2nd geographic segment is a city (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded">/us-deep-south-region</code>). Classify strictly as <strong>City or Area Page</strong> (or City / Area / Region Page) without guessing.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Query-String Robustness
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Classification functions correctly whether a Landing Page has no query string, trailing slashes, UTM tracking, or cruise query parameters (<code className="bg-emerald-100 px-1 py-0.5 rounded">?cruise_id=...</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Formula Blocks */}
      {(activeFormulaTab === 'both' || activeFormulaTab === 'page-group') && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                1. Page Group — Looker Studio / BigQuery CASE Expression
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(GSC_PAGE_GROUP_CASE_SQL, 'group')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              {copiedGroup ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Formula!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-slate-800 leading-relaxed">
            {GSC_PAGE_GROUP_CASE_SQL}
          </pre>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Evaluates: Essential Tours &gt; Tour Guides &gt; Shore Excursions &gt; Safaris &gt; Travel Blog &gt; Things to Do &gt; Tours &gt; Other</span>
          </div>
        </div>
      )}

      {(activeFormulaTab === 'both' || activeFormulaTab === 'page-level') && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                2. Page Level — Looker Studio / BigQuery CASE Expression
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(GSC_PAGE_LEVEL_CASE_SQL, 'level')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              {copiedLevel ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Formula!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-blue-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
            {GSC_PAGE_LEVEL_CASE_SQL}
          </pre>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Evaluates specific templates (Special Landing Page, Tour Details, Attractions, Cruise Ports/Ships) before broad country and city or area patterns.</span>
          </div>
        </div>
      )}

      {/* 23-Priority Order Reference Table */}
      {(activeFormulaTab === 'both' || activeFormulaTab === 'priority-hierarchy') && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Comprehensive 23-Priority Taxonomy Hierarchy
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact precedence order resolving all edge cases, cruise sailings, category filters, and regional variations.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
              23 Strict Priority Rules
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[480px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center">Priority</th>
                  <th className="py-2.5 px-3">URL Condition / Pattern</th>
                  <th className="py-2.5 px-3">Page Group</th>
                  <th className="py-2.5 px-3">Page Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {priorityOrderTable.map((item) => (
                  <tr key={item.priority} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-500">
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-800 text-[11px]">
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-900">
                      {item.condition}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.pageGroup}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.pageLevel}
                      </span>
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
};
