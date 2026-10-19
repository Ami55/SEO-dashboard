/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  FileCheck2,
  AlertTriangle,
  HelpCircle,
  Search,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe,
  Database,
  ExternalLink,
  Code2,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Terminal,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  DashboardFilterState,
  PageGroup,
  PageLevel,
  SitemapCategory,
  GeographicLevel,
  UrlClassificationMethod,
  SitemapStatus,
  PropertyTotals,
} from '../types';
import {
  SITEMAP_SOURCES,
  SITEMAP_AUDIT_DATA,
  CLASSIFICATION_VALIDATION_SAMPLES,
  GSC_PAGES_MISSING_FROM_SITEMAPS,
  SITEMAP_URLS_WITH_NO_GSC_VISIBILITY,
  MULTI_SITEMAP_URLS,
  UNCLASSIFIED_REVIEW_URLS,
  PILLAR_PAGES_REVIEW_DATA,
  classifyUrlTaxonomy,
  normalizeLandingPage,
  calculateGscPageGroup,
  calculateGscPageLevel,
  GSC_PAGE_GROUP_CASE_SQL,
  GSC_PAGE_LEVEL_CASE_SQL,
} from '../utils/sitemapClassifier';
import { GscCalculatedDimensionsViewer } from './GscCalculatedDimensionsViewer';
import { KeyTakeawaysFooter } from './KeyTakeawaysFooter';

interface TaxonomyClassificationSectionProps {
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
}

type ValidationTabId =
  | 'formulas'
  | 'tester'
  | 'validation-report'
  | 'missing-from-sitemaps'
  | 'no-visibility'
  | 'multi-sitemaps'
  | 'unclassified-review'
  | 'pillar-matrix'
  | 'sitemap-audit';

export const TaxonomyClassificationSection: React.FC<TaxonomyClassificationSectionProps> = ({
  propertyTotals,
  filters,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ValidationTabId>('formulas');

  // Interactive Live Tester state
  const [testUrlInput, setTestUrlInput] = useState<string>(
    '/tours/france/paris?utm_source=google&gclid=xyz123#reviews'
  );
  const [batchInput, setBatchInput] = useState<string>('');
  const [showBatchResults, setShowBatchResults] = useState<boolean>(false);

  // Filters for Validation Report
  const [reportGroupFilter, setReportGroupFilter] = useState<string>('ALL');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('ALL');
  const [reportMethodFilter, setReportMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Evaluate single test URL live
  const singleTestResult = useMemo(() => {
    return classifyUrlTaxonomy(testUrlInput.trim());
  }, [testUrlInput]);

  const singleNormResult = useMemo(() => {
    return normalizeLandingPage(testUrlInput.trim());
  }, [testUrlInput]);

  // Evaluate batch URLs live
  const batchTestResults = useMemo(() => {
    if (!batchInput.trim()) return [];
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines.map((url) => classifyUrlTaxonomy(url));
  }, [batchInput]);

  // Preset sample test URLs matching the comprehensive taxonomy specifications
  const samplePresets = [
    {
      label: '1. Tours Country (/tours/france)',
      url: '/tours/france',
    },
    {
      label: '2. Tours City/Area (/tours/france/paris)',
      url: '/tours/france/paris',
    },
    {
      label: '3. Tour Category (/tours/chad/classes-and-workshops-tours)',
      url: '/tours/chad/classes-and-workshops-tours',
    },
    {
      label: '4. Tour Details (/tour-details/78912/rome-vip-tour)',
      url: '/tour-details/78912/rome-colosseum-forum-private-vip-tour',
    },
    {
      label: '5. Attractions (/tours/Italy/Rome/attractions/Colosseum)',
      url: '/tours/Italy/Rome/attractions/Colosseum/?utm_source=google#tickets',
    },
    {
      label: '6. Attraction Guide (/tour-guides/France/Paris/attractions/Louvre)',
      url: '/tour-guides/France/Paris/attractions/Louvre-Museum',
    },
    {
      label: '7. Cruise Destination (/shore-ex-tours)',
      url: '/tours/Italy/Civitavecchia/shore-ex-tours?cruise_port=civitavecchia',
    },
    {
      label: '8. Global Essentials (/tours/essentials-tours)',
      url: '/tours/essentials-tours/',
    },
    {
      label: '9. Location Essentials (/tours/Japan/Tokyo/essentials-tours)',
      url: '/tours/Japan/Tokyo/essentials-tours',
    },
    {
      label: '10. Cruise Sailing (/shore-excursions/cruise-line/signup)',
      url: '/shore-excursions/cruise-line/signup',
    },
    {
      label: '11. Cruise Ship (/shore-excursions/royal-caribbean/wonder-of-the-seas)',
      url: '/shore-excursions/royal-caribbean/wonder-of-the-seas?cruise_id=88',
    },
    {
      label: '12. Cruise Line (/shore-excursions/viking-ocean-cruises)',
      url: '/shore-excursions/viking-ocean-cruises',
    },
    {
      label: '13. Travel Blog Post (/travel-blog/how-to-hire-guide)',
      url: '/travel-blog/how-to-hire-private-tour-guide-in-italy',
    },
    {
      label: '14. Things to Do Country (/things-to-do/united-states)',
      url: '/things-to-do/united-states',
    },
    {
      label: '15. Things to Do City/Area (/things-to-do/united-states/new-york)',
      url: '/things-to-do/united-states/new-york',
    },
    {
      label: '16. Safaris Country (/safaris/south-africa)',
      url: '/safaris/south-africa',
    },
    {
      label: '17. Safaris City/Area (/safaris/kenya/masai-mara)',
      url: '/safaris/kenya/masai-mara',
    },
    {
      label: '18. Guide Profile (/guide-profile/29182/marco)',
      url: '/guide-profile/29182/marco-rome-guide',
    },
    {
      label: '19. Tours Directory Root (/tours)',
      url: '/tours',
    },
    {
      label: '20. Informational Page (/about-us)',
      url: '/about-us',
    },
    {
      label: '21. Utility Portal (/login)',
      url: '/login?redirect=/my-bookings',
    },
    {
      label: '22. Unclassified Fallback (/special-promo-campaign)',
      url: '/special-campaign/spring-blossom-promo-2026',
    },
  ];

  // Filtered validation report data
  const filteredValidationSamples = useMemo(() => {
    return CLASSIFICATION_VALIDATION_SAMPLES.filter((item) => {
      if (reportGroupFilter !== 'ALL' && item.pageGroup !== reportGroupFilter) return false;
      if (reportCategoryFilter !== 'ALL' && item.sitemapCategory !== reportCategoryFilter) return false;
      if (reportMethodFilter !== 'ALL' && item.urlClassificationMethod !== reportMethodFilter) return false;
      if (
        searchQuery &&
        !item.landingPage.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.normalizedLandingPage.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [reportGroupFilter, reportCategoryFilter, reportMethodFilter, searchQuery]);

  // Export report to CSV
  const handleExportCsv = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => (typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val))
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="taxonomy-classification-section">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Strict 18-Priority Hierarchy Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Clock className="w-3.5 h-3.5" /> Latest Audit: 2026-08-18
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            URL Taxonomy & Sitemap Classification
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-4xl leading-relaxed">
            Deterministic URL normalization and multi-tier taxonomy classification system conforming strictly to
            the taxonomy specification. Eliminates regex-only guesswork by prioritizing exact sitemap
            memberships (13 audited XML sources), verified URL structures, and directory fallback boundaries.
          </p>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Audited XML Sitemaps</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">13 Sources</div>
            <div className="text-[11px] text-slate-400 mt-0.5">static-pages.xml deduplicated</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Page Groups Approved</div>
            <div className="text-xl font-bold text-white mt-1">14 Dimensions</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Homepage to Utility</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Page Levels Approved</div>
            <div className="text-xl font-bold text-white mt-1">22 Templates</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hierarchical precision</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Classification Tier</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">23-Priority Rules</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Exact Match &gt; Pattern &gt; Fallback</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-1 flex overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveSubTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'formulas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          1. GSC Calculated Dimensions (SQL CASE Formulas)
        </button>

        <button
          onClick={() => setActiveSubTab('tester')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'tester'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          2. Live URL Classifier &amp; Tester
        </button>

        <button
          onClick={() => setActiveSubTab('validation-report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'validation-report'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          3. Classification Validation (50+ Sample URLs)
        </button>

        <button
          onClick={() => setActiveSubTab('missing-from-sitemaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'missing-from-sitemaps'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          4. GSC Missing from Sitemaps
        </button>

        <button
          onClick={() => setActiveSubTab('no-visibility')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'no-visibility'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          5. Sitemap URLs No GSC Visibility
        </button>

        <button
          onClick={() => setActiveSubTab('multi-sitemaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'multi-sitemaps'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          6. Multi-Sitemap Conflict Audit
        </button>

        <button
          onClick={() => setActiveSubTab('unclassified-review')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'unclassified-review'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-rose-400" />
          7. Unclassified Requiring Review
        </button>

        <button
          onClick={() => setActiveSubTab('pillar-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'pillar-matrix'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          8. Pillar Pages Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('sitemap-audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'sitemap-audit'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          9. 13 Sitemaps Health Index
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 0: GSC CALCULATED DIMENSIONS FORMULAS & PRECEDENCE */}
      {/* ========================================================================= */}
      {activeSubTab === 'formulas' && <GscCalculatedDimensionsViewer />}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LIVE INTERACTIVE URL TAXONOMY TESTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'tester' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                Live Real-Time URL Taxonomy Classifier & Diagnostic Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste any raw Google Search Console landing page URL with query parameters, tracking tags,
                mixed casing, or trailing slashes to see the complete normalization pipeline, sitemap lookup, and
                exact 18-priority rule execution trail.
              </p>
            </div>

            {/* Input URL Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Test URL Input:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUrlInput}
                  onChange={(e) => setTestUrlInput(e.target.value)}
                  placeholder="e.g. /tours/Italy/Rome/attractions/Colosseum/?utm_source=google"
                  className="flex-1 px-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
                <button
                  onClick={() => setTestUrlInput('/')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Preset quick buttons */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Test Samples Across Categories:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestUrlInput(preset.url)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-md text-slate-700 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Classification Result Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
              {/* Dimensions Box */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Classification Result
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {singleTestResult.priorityRuleMatched}
                    </span>
                  </div>

                  {/* 5 Core Dimensions Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">1. Page Group</div>
                      <div className="text-sm font-bold text-white mt-0.5">{singleTestResult.pageGroup}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">2. Page Level</div>
                      <div className="text-sm font-bold text-white mt-0.5">{singleTestResult.pageLevel}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">3. Sitemap Category</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{singleTestResult.sitemapCategory}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">4. Geographic Level</div>
                      <div className="text-sm font-bold text-white mt-0.5">{singleTestResult.geographicLevel}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">5. Classification Method</div>
                      <div className="text-xs font-bold text-blue-300 mt-0.5">{singleTestResult.urlClassificationMethod}</div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="text-[11px] text-slate-400">6. Sitemap Status</div>
                      <div
                        className={`text-xs font-bold mt-0.5 ${
                          singleTestResult.sitemapStatus === 'Found in Sitemap'
                            ? 'text-emerald-400'
                            : singleTestResult.sitemapStatus === 'Requires Review'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {singleTestResult.sitemapStatus}
                      </div>
                    </div>
                  </div>

                  {/* Normalized Landing Page URL */}
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">Normalized Landing Page (Canonical):</div>
                    <div className="text-xs font-mono bg-slate-950 p-2.5 rounded-lg text-emerald-300 break-all border border-slate-800">
                      {singleTestResult.normalizedLandingPage}
                    </div>
                  </div>

                  {/* Source Sitemap Link */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Source Sitemap: <strong className="text-slate-200">{singleTestResult.sourceSitemap}</strong>
                    </span>
                    {singleTestResult.classificationReviewRequired && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                        Requires Human Review
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Normalization & Resolution Pipeline Trace */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-slate-700" />
                  Normalization &amp; Trace Pipeline
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Normalization Audit</div>
                    <div className="text-[11px] text-slate-700">
                      • Hostname: <span className="font-mono text-slate-900">{singleNormResult.hostname}</span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      • Trailing slash removed:{' '}
                      <span className="font-semibold">{singleNormResult.trailingSlashRemoved ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      • Query params stripped:{' '}
                      <span className="font-mono text-amber-700">
                        {singleNormResult.queryParamsRemoved.length > 0
                          ? singleNormResult.queryParamsRemoved.join(', ')
                          : 'None'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      • Fragment stripped:{' '}
                      <span className="font-mono text-amber-700">
                        {singleNormResult.fragmentRemoved || 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Rule Resolution Trail</div>
                    <div className="space-y-1 font-mono text-[10px] text-slate-600 max-h-40 overflow-y-auto">
                      {singleTestResult.resolutionTrace.map((step, sIdx) => (
                        <div key={sIdx} className="p-1 rounded bg-slate-50 border border-slate-100">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Batch URL Classifier Drawer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Batch URL Classification Tool
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste multiple URLs or path slugs (one per line) to batch-classify against the 18-priority taxonomy.
                </p>
              </div>
              <button
                onClick={() => {
                  setBatchInput(
                    `/tours/Italy/Rome\n/tours/Italy/Rome/attractions/Colosseum\n/shore-excursions/viking-ocean-cruises\n/travel-blog/how-to-hire-private-tour-guide-in-italy\n/things-to-do/Tokyo\n/tours/essentials-tours\n/about-us\n/login`
                  );
                  setShowBatchResults(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                Load Sample Batch
              </button>
            </div>

            <textarea
              rows={4}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Paste URLs here, one per line..."
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowBatchResults(true)}
                disabled={!batchInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Classify {batchTestResults.length} URLs
              </button>

              {batchTestResults.length > 0 && (
                <button
                  onClick={() =>
                    handleExportCsv(
                      batchTestResults.map((r) => ({
                        RawUrl: r.landingPage,
                        NormalizedUrl: r.normalizedLandingPage,
                        PageGroup: r.pageGroup,
                        PageLevel: r.pageLevel,
                        GeographicLevel: r.geographicLevel,
                        SitemapCategory: r.sitemapCategory,
                        SitemapStatus: r.sitemapStatus,
                        Method: r.urlClassificationMethod,
                        Rule: r.priorityRuleMatched,
                      })),
                      'gsc-batch-url-classification'
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Batch Results (CSV)
                </button>
              )}
            </div>

            {showBatchResults && batchTestResults.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Normalized Landing Page</th>
                      <th className="py-2.5 px-3">Page Group</th>
                      <th className="py-2.5 px-3">Page Level</th>
                      <th className="py-2.5 px-3">Geo Level</th>
                      <th className="py-2.5 px-3">Sitemap Category</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Rule Matched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {batchTestResults.map((res, bIdx) => (
                      <tr key={bIdx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-900 break-all">
                          {res.normalizedLandingPage}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{res.pageGroup}</td>
                        <td className="py-2 px-3 text-slate-600">{res.pageLevel}</td>
                        <td className="py-2 px-3 text-slate-600">{res.geographicLevel}</td>
                        <td className="py-2 px-3 text-emerald-700 font-medium">{res.sitemapCategory}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{res.urlClassificationMethod}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{res.priorityRuleMatched}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: URL CLASSIFICATION VALIDATION REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'validation-report' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Report 1: URL Classification Validation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Representative verified URLs across all approved Page Groups, Page Levels, and Sitemap Categories.
                Demonstrates exact sitemap mapping, path patterns, and directory rules.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(filteredValidationSamples, 'gsc-url-classification-validation')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>

          {/* Report Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search Landing Page:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter URL path..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Page Group Filter:</label>
              <select
                value={reportGroupFilter}
                onChange={(e) => setReportGroupFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Page Groups</option>
                <option value="Homepage">Homepage</option>
                <option value="Tours">Tours</option>
                <option value="Tour Guides">Tour Guides</option>
                <option value="Guide Profiles">Guide Profiles</option>
                <option value="Tour Details">Tour Details</option>
                <option value="Attractions">Attractions</option>
                <option value="Shore Excursions">Shore Excursions</option>
                <option value="Safaris">Safaris</option>
                <option value="Travel Blog">Travel Blog</option>
                <option value="Things to Do">Things to Do</option>
                <option value="Essential Tours">Essential Tours</option>
                <option value="Corporate and Informational">Corporate &amp; Informational</option>
                <option value="Utility">Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sitemap Category:</label>
              <select
                value={reportCategoryFilter}
                onChange={(e) => setReportCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Sitemaps</option>
                {SITEMAP_SOURCES.map((s) => (
                  <option key={s.id} value={s.category}>
                    {s.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Classification Method:</label>
              <select
                value={reportMethodFilter}
                onChange={(e) => setReportMethodFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Methods</option>
                <option value="Exact Sitemap Match">Exact Sitemap Match</option>
                <option value="Verified URL Pattern">Verified URL Pattern</option>
                <option value="Directory Fallback">Directory Fallback</option>
                <option value="Unclassified">Unclassified</option>
              </select>
            </div>
          </div>

          {/* Validation Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Landing Page &amp; Canonical</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3">Page Level</th>
                  <th className="py-3 px-3">Geo Level</th>
                  <th className="py-3 px-3">Sitemap Category</th>
                  <th className="py-3 px-3">Sitemap Status</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredValidationSamples.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-[11px] text-slate-900 font-medium break-all">
                        {item.normalizedLandingPage}
                      </div>
                      {item.landingPage !== item.normalizedLandingPage && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-through">
                          {item.landingPage}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.pageGroup}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.pageLevel}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.geographicLevel}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{item.sitemapCategory}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        {item.sitemapStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.urlClassificationMethod}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{item.impressions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: GSC PAGES MISSING FROM SITEMAPS REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'missing-from-sitemaps' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Report 2: GSC Landing Pages Missing From Sitemaps
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pages with Google Search Console impressions and clicks where Sitemap Status = Not Found in
                Sitemap. Evaluates legitimate exclusions (parameter variations, utility pages, 301 redirects) vs.
                missed indexable content.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(GSC_PAGES_MISSING_FROM_SITEMAPS, 'gsc-gsc-missing-from-sitemaps')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Sitemap Governance Principle:</strong> Do not automatically conclude
              that every URL missing from a sitemap should be added. Internal search facets, user authentication
              portals, query parameters, and 301 redirects are properly excluded from XML sitemaps to preserve crawl
              budget and prevent index bloat.
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Landing Page</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3">Page Level</th>
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">Avg Pos</th>
                  <th className="py-3 px-3">Audit Analysis &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {GSC_PAGES_MISSING_FROM_SITEMAPS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-900 break-all font-medium max-w-xs">
                      {item.landingPage}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.pageGroup}</td>
                    <td className="py-3 px-3 text-slate-600">{item.pageLevel}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">{item.clicks.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{item.impressions.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{item.ctr.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{item.position.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-sm">
                      <div className="text-slate-800">{item.auditCategoryNote}</div>
                      <div className="text-emerald-700 font-semibold mt-1">Action: {item.recommendedAction}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SITEMAP URLS WITH NO GSC VISIBILITY */}
      {/* ========================================================================= */}
      {activeSubTab === 'no-visibility' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                Report 3: Sitemap URLs With No GSC Visibility
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified URLs present in XML sitemaps that generated 0 impressions during the
                selected Google Search Console reporting period.
              </p>
            </div>
            <button
              onClick={() =>
                handleExportCsv(SITEMAP_URLS_WITH_NO_GSC_VISIBILITY, 'gsc-sitemap-urls-no-gsc-visibility')
              }
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Search Indexing Requirement:</strong> Zero GSC performance data does{' '}
              <strong>not</strong> prove that a page is not indexed by Google. Micro-destinations, seasonal itineraries,
              or newly published guide profiles may be fully indexed but received zero impressions due to low search query
              demand during the selected date window.
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Sitemap URL</th>
                  <th className="py-3 px-3">Sitemap Category</th>
                  <th className="py-3 px-3">Page Group</th>
                  <th className="py-3 px-3">Page Level</th>
                  <th className="py-3 px-3">Geo Level</th>
                  <th className="py-3 px-3">Indexing &amp; Visibility Audit Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {SITEMAP_URLS_WITH_NO_GSC_VISIBILITY.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-900 break-all font-medium max-w-sm">
                      {item.sitemapUrl}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{item.sitemapCategory}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.pageGroup}</td>
                    <td className="py-3 px-3 text-slate-600">{item.pageLevel}</td>
                    <td className="py-3 px-3 text-slate-600">{item.geographicLevel}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-md">{item.indexingStatusNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: URLS FOUND IN MULTIPLE SITEMAPS */}
      {/* ========================================================================= */}
      {activeSubTab === 'multi-sitemaps' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Report 4: URLs Found in Multiple Sitemaps (Conflict Audit)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Audit of landing pages appearing across multiple child sitemaps with documented specific override
                resolutions.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(MULTI_SITEMAP_URLS, 'gsc-multi-sitemap-conflict-audit')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Normalized URL</th>
                  <th className="py-3 px-3">All Source Sitemaps</th>
                  <th className="py-3 px-3">Assigned Page Group</th>
                  <th className="py-3 px-3">Assigned Page Level</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-3">Hierarchy Resolution Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {MULTI_SITEMAP_URLS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-900 break-all font-medium max-w-xs">
                      {item.normalizedUrl}
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {item.allSourceSitemaps.map((s, sIdx) => (
                          <div key={sIdx} className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {s}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.assignedPageGroup}</td>
                    <td className="py-3 px-3 text-slate-600">{item.assignedPageLevel}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.reviewStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-sm">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: UNCLASSIFIED URLS REQUIRING REVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'unclassified-review' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-rose-500" />
                Report 5: Unclassified URLs Requiring Review (Sorted by Impressions)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                URLs failing exact sitemap matching and standard directory patterns, prioritized by search impressions to
                maximize business impact.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(UNCLASSIFIED_REVIEW_URLS, 'gsc-unclassified-urls-review')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Landing Page</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">Avg Pos</th>
                  <th className="py-3 px-3">Sitemap Status</th>
                  <th className="py-3 px-3">Reason Classification Failed</th>
                  <th className="py-3 px-3">Suggested Taxonomy Mapping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {UNCLASSIFIED_REVIEW_URLS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-900 break-all font-medium max-w-xs">
                      {item.landingPage}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {item.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{item.ctr.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{item.position.toFixed(1)}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                        {item.sitemapStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">{item.reasonClassificationFailed}</td>
                    <td className="py-3 px-3 text-emerald-800 font-semibold text-[11px]">
                      {item.suggestedGroup} / {item.suggestedLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 7: PILLAR PAGES REVIEW MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'pillar-matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Report 6: Pillar Pages Review Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Audit of all high-authority topical pillar guides indexed in `pillar-pages.xml` and their assigned Page
                Groups based on audited thematic content purpose.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(PILLAR_PAGES_REVIEW_DATA, 'gsc-pillar-pages-matrix')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Matrix (CSV)
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Normalized Pillar URL</th>
                  <th className="py-3 px-3">Assigned Page Group</th>
                  <th className="py-3 px-3">Page Level</th>
                  <th className="py-3 px-3">Geo Level</th>
                  <th className="py-3 px-3">Content Authority Theme</th>
                  <th className="py-3 px-3">Strategic SEO &amp; Conversion Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {PILLAR_PAGES_REVIEW_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-900 break-all font-medium max-w-xs">
                      {item.normalizedUrl}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{item.assignedPageGroup}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{item.assignedPageLevel}</td>
                    <td className="py-3 px-3 text-slate-600">{item.geographicLevel}</td>
                    <td className="py-3 px-3 text-slate-800 font-semibold max-w-xs">{item.contentTheme}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-md">{item.strategicPurpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 8: 13 SITEMAPS HEALTH INDEX & AUDIT */}
      {/* ========================================================================= */}
      {activeSubTab === 'sitemap-audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Report 7: 13 Child Sitemaps Comprehensive Health Index
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete audit of all 13 official XML child sitemaps, URL inventories, modification dates, and
                deduplication log for `static-pages.xml`.
              </p>
            </div>
            <button
              onClick={() => handleExportCsv(SITEMAP_AUDIT_DATA, 'gsc-13-sitemaps-audit-index')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Sitemap Health Index (CSV)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SITEMAP_AUDIT_DATA.map((entry, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      {entry.category}
                    </span>
                    <div className="text-xs font-mono text-slate-800 font-semibold break-all mt-0.5">
                      {entry.sitemapUrl.replace('', '')}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.status === 'Audited & Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500">Unique URLs</div>
                    <div className="text-sm font-bold text-slate-900">{entry.urlCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Latest Lastmod</div>
                    <div className="text-[11px] font-mono text-slate-700">{entry.latestLastmod.substring(0, 10)}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">{entry.notes}</p>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sample URLs:</div>
                  <div className="space-y-0.5 font-mono text-[10px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    {entry.sampleUrls.map((sUrl, sIdx) => (
                      <div key={sIdx} className="truncate">
                        • {sUrl.replace('', '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Key Takeaways Footer */}
      <KeyTakeawaysFooter
        sectionTitle="Taxonomy and Sitemap Classification"
        filters={filters}
        propertyTotals={propertyTotals}
        takeaways={[
          {
            title: 'Exact Sitemap Membership Eliminates Guesswork',
            description:
              'Prioritizing exact matching across the 13 audited sitemaps ensures verified Page Level and Geographic accuracy without relying on fragile URL segment counting.',
            type: 'positive',
          },
          {
            title: 'Preserve Parameter Non-Indexability Standards',
            description:
              'URLs with search query parameters (?location=...) and user utility pages (/login, /cart) are properly omitted from XML sitemaps to prevent faceted index bloat.',
            type: 'neutral',
          },
          {
            title: 'Sitemap Absence vs Indexation Clarification',
            description:
              'Sitemap URLs with 0 GSC visibility are not unindexed; low seasonal query demand explains absence from Search Analytics. Continuous monitoring is maintained.',
            type: 'neutral',
          },
        ]}
      />
    </div>
  );
};
