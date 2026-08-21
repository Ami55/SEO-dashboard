/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Smartphone,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Sliders,
  ChevronRight,
  Eye,
  MousePointerClick,
  FileText,
  Target,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { DashboardFilterState, PropertyTotals } from '../types';
import { TOURS_QUERIES, TOURS_PAGES } from '../toursData';

interface CustomInsightsSuiteProps {
  propertyTotals: PropertyTotals;
  filters: DashboardFilterState;
  onFilterChange?: (filters: DashboardFilterState) => void;
}

// Benchmark Expected CTR curve by position (Logarithmic industry baseline for travel & tourism SERPs)
const EXPECTED_CTR_BENCHMARK: Record<number, number> = {
  1: 28.5,
  2: 15.2,
  3: 9.8,
  4: 6.4,
  5: 4.5,
  6: 3.2,
  7: 2.4,
  8: 1.8,
  9: 1.4,
  10: 1.1,
};

export const CustomInsightsSuite: React.FC<CustomInsightsSuiteProps> = ({
  propertyTotals,
  filters,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'ctr-anomalies' | 'content-decay' | 'revenue-calculator' | 'serp-displacement' | 'mobile-parity' | 'intent-matrix'
  >('ctr-anomalies');

  // Revenue calculator interactive state
  const [convRate, setConvRate] = useState<number>(2.4); // 2.4%
  const [aov, setAov] = useState<number>(145); // $145 AOV for tour bookings
  const [targetRankLift, setTargetRankLift] = useState<number>(3); // Target position improvement

  // 1. CTR Anomalies Data Calculation
  const ctrAnomalies = useMemo(() => {
    return TOURS_QUERIES.map((q) => {
      const roundedPos = Math.min(10, Math.max(1, Math.round(q.position)));
      const expectedCtr = EXPECTED_CTR_BENCHMARK[roundedPos] || 1.0;
      const actualCtr = q.ctr;
      const ctrGap = expectedCtr - actualCtr;
      const potentialClicksAtBenchmark = Math.round((q.impressions * (expectedCtr / 100)));
      const missedClicks = Math.max(0, potentialClicksAtBenchmark - q.clicks);

      return {
        query: q.query,
        position: q.position,
        roundedPos,
        impressions: q.impressions,
        clicks: q.clicks,
        actualCtr,
        expectedCtr,
        ctrGap,
        missedClicks,
        landingPage: q.landingPage,
        pageGroup: q.pageGroup,
        theme: q.queryTheme,
        anomalyType:
          ctrGap > 5 && q.position <= 3
            ? 'Severe Snippet Decay'
            : ctrGap > 2
            ? 'Below SERP Benchmark'
            : actualCtr >= expectedCtr
            ? 'High-Performing Snippet'
            : 'Normal Variation',
      };
    })
      .filter((q) => q.position <= 10)
      .sort((a, b) => b.missedClicks - a.missedClicks);
  }, []);

  // 2. Content Decay & Velocity Loss Early-Warning Data
  const contentDecayData = useMemo(() => {
    return TOURS_PAGES.map((p) => {
      // Calculate growth rate vs previous period
      const clicksGrowthRate = p.prevClicks > 0
        ? ((p.clicks - p.prevClicks) / p.prevClicks) * 100
        : 0;
      const impressionsGrowthRate = p.prevImpressions > 0
        ? ((p.impressions - p.prevImpressions) / p.prevImpressions) * 100
        : 0;

      let status: 'Surging' | 'Healthy' | 'Early Decay Warning' | 'Severe Decay' = 'Healthy';
      let recommendedFix = 'Maintain freshness & internal links';

      if (clicksGrowthRate < -15) {
        status = 'Severe Decay';
        recommendedFix = 'Complete content refresh, update tour itineraries, review new competitor links';
      } else if (clicksGrowthRate < -3) {
        status = 'Early Decay Warning';
        recommendedFix = 'Update publication date, refresh FAQ schema, add recent customer reviews';
      } else if (clicksGrowthRate > 20) {
        status = 'Surging';
        recommendedFix = 'Capitalize momentum: add contextual internal links to related sub-tours';
      }

      return {
        page: p.page,
        pageGroup: p.pageGroup,
        clicks: p.clicks,
        impressions: p.impressions,
        position: p.position,
        clicksGrowthRate,
        impressionsGrowthRate,
        status,
        recommendedFix,
        estimatedRiskClicks: Math.round(p.clicks * (Math.abs(Math.min(0, clicksGrowthRate)) / 100)),
      };
    }).sort((a, b) => a.clicksGrowthRate - b.clicksGrowthRate);
  }, []);

  // 3. Mobile vs Desktop Parity Data
  const mobileParityData = useMemo(() => {
    const list = [
      {
        page: '/tours/rome/colosseum-underground-guided-tour',
        query: 'colosseum underground tour',
        desktopPos: 2.1,
        mobilePos: 5.8,
        desktopClicks: 4200,
        mobileClicks: 2100,
        gap: 3.7,
        rootCause: 'Mobile LCP issue (heavy uncompressed video background on mobile)',
        fix: 'Defer mobile hero video, implement AVIF image format, improve touch target spacing',
      },
      {
        page: '/tours/vatican/st-peters-basilica-dome-climb',
        query: 'st peters dome climb skip the line',
        desktopPos: 1.8,
        mobilePos: 4.9,
        desktopClicks: 3800,
        mobileClicks: 1650,
        gap: 3.1,
        rootCause: 'Mobile layout shift (CLS 0.28) caused by late-loading tour availability widget',
        fix: 'Reserve aspect-ratio container for booking calendar to eliminate layout shifts',
      },
      {
        page: '/tours/florence/uffizi-gallery-tickets-small-group',
        query: 'uffizi gallery guided tour florence',
        desktopPos: 3.2,
        mobilePos: 6.4,
        desktopClicks: 2900,
        mobileClicks: 1400,
        gap: 3.2,
        rootCause: 'Aggressive cookie banner obscuring mobile viewport and main content',
        fix: 'Reduce cookie dialog z-index impact and ensure first-screen tour title is immediately visible',
      },
      {
        page: '/tours/venice/doges-palace-secret-itineraries',
        query: 'doges palace secret itineraries tour',
        desktopPos: 2.4,
        mobilePos: 4.7,
        desktopClicks: 2100,
        mobileClicks: 1100,
        gap: 2.3,
        rootCause: 'Render-blocking third-party currency conversion script',
        fix: 'Load currency switcher asynchronously with WebWorker offload',
      },
      {
        page: '/tours/amalfi-coast/positano-boat-day-trip',
        query: 'positano private boat tour from sorrento',
        desktopPos: 3.5,
        mobilePos: 5.9,
        desktopClicks: 1950,
        mobileClicks: 950,
        gap: 2.4,
        rootCause: 'Missing mobile viewport meta optimization for high-DPI smartphone screens',
        fix: 'Optimize mobile viewport meta tag and enable responsive image srcset sizes',
      },
    ];
    return list;
  }, []);

  // 4. Intent Classification Matrix Data
  const intentData = useMemo(() => {
    return [
      {
        intent: 'Transactional / High-Booking Intent',
        queriesCount: 142,
        clicks: 84500,
        impressions: 620000,
        avgCtr: 13.6,
        avgPos: 3.2,
        conversionPropensity: 'Very High (4.5% - 7.0%)',
        examples: 'book colosseum private tour, skip the line vatican tickets, private gondola tour price',
        action: 'Optimize checkout CTA, display real-time availability badges, provide best price guarantee',
        color: '#10b981',
      },
      {
        intent: 'Commercial Investigation / Comparison',
        queriesCount: 210,
        clicks: 38200,
        impressions: 540000,
        avgCtr: 7.1,
        avgPos: 4.8,
        conversionPropensity: 'Moderate (2.0% - 3.5%)',
        examples: 'best underground colosseum tours review, morning vs night vatican tour, uffizi vs accademia',
        action: 'Add structured comparison tables, pros/cons breakdown, and clear cancellation policies',
        color: '#3b82f6',
      },
      {
        intent: 'Informational / Travel Planning Guides',
        queriesCount: 385,
        clicks: 21400,
        impressions: 780000,
        avgCtr: 2.7,
        avgPos: 7.4,
        conversionPropensity: 'Low (0.5% - 1.2%)',
        examples: 'what to wear in vatican city, best time of year to visit amalfi coast, is colosseum open sundays',
        action: 'Insert context-rich in-article tour booking cards and internal links to direct booking pages',
        color: '#f59e0b',
      },
      {
        intent: 'Navigational & Direct Brand',
        queriesCount: 28,
        clicks: 21300,
        impressions: 85000,
        avgCtr: 25.1,
        avgPos: 1.2,
        conversionPropensity: 'Extreme (8.0% - 12.0%)',
        examples: 'tours of italy login, authentic italy private tours reviews, customer support phone',
        action: 'Maintain sitelinks schema, review breadcrumbs, ensure zero brand keyword cannibalization',
        color: '#8b5cf6',
      },
    ];
  }, []);

  // 5. Total Sized Revenue Opportunity Calculation
  const revenueForecast = useMemo(() => {
    // Look at striking distance queries (Pos 4 to 12)
    const strikingDistanceQueries = TOURS_QUERIES.filter(
      (q) => q.position >= 4.0 && q.position <= 12.0
    );

    const totalStrikingImpressions = strikingDistanceQueries.reduce(
      (acc, q) => acc + q.impressions,
      0
    );
    const currentClicks = strikingDistanceQueries.reduce((acc, q) => acc + q.clicks, 0);

    // Calculate simulated CTR if moved up by targetRankLift
    const incrementalClicks = strikingDistanceQueries.reduce((acc, q) => {
      const newPos = Math.max(1, Math.round(q.position - targetRankLift));
      const targetCtr = EXPECTED_CTR_BENCHMARK[newPos] || 2.0;
      const expectedClicks = Math.round(q.impressions * (targetCtr / 100));
      return acc + Math.max(0, expectedClicks - q.clicks);
    }, 0);

    const incrementalBookings = Math.round(incrementalClicks * (convRate / 100));
    const incrementalRevenue = Math.round(incrementalBookings * aov);

    return {
      queryCount: strikingDistanceQueries.length,
      totalStrikingImpressions,
      currentClicks,
      incrementalClicks,
      incrementalBookings,
      incrementalRevenue,
    };
  }, [convRate, aov, targetRankLift]);

  return (
    <div className="space-y-6" id="gsc-custom-insights-suite">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Advanced SEO Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">GSC BigQuery & Machine Enriched</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Custom Insights & Search Console Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Extract high-impact algorithmic opportunities from raw GSC data: CTR baseline curve anomalies,
              automated content decay alerts, SERP feature & AI overview displacement, mobile ranking parity gaps, and dollar-valued revenue forecasting.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md shrink-0 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Identified SEO Revenue Pipeline</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                +${revenueForecast.incrementalRevenue.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">/ year</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-100 custom-scrollbar">
          {[
            { id: 'ctr-anomalies', label: '1. CTR Baseline & Title Decay', icon: Target, count: ctrAnomalies.length },
            { id: 'revenue-calculator', label: '2. Sized Revenue Opportunity Model', icon: DollarSign, count: `$${(revenueForecast.incrementalRevenue / 1000).toFixed(0)}k` },
            { id: 'content-decay', label: '3. Content Decay Early-Warning', icon: AlertTriangle, count: contentDecayData.filter(d => d.status.includes('Decay')).length },
            { id: 'serp-displacement', label: '4. AI Overview & SERP Displacement', icon: Zap, count: '6 Diagnosed' },
            { id: 'mobile-parity', label: '5. Mobile vs Desktop SERP Parity', icon: Smartphone, count: mobileParityData.length },
            { id: 'intent-matrix', label: '6. Search Intent & Commercial Matrix', icon: BarChart3, count: '4 Classes' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tab 1: CTR Baseline & Title Tag Decay */}
      {activeSubTab === 'ctr-anomalies' && (
        <div className="space-y-6">
          {/* Explanation Box */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">How CTR Baseline Anomaly Detection Works:</span>
              <p className="mt-0.5 text-emerald-900 leading-relaxed">
                We compare each ranking query's actual Google Search Console CTR against an empirical travel SERP CTR curve (e.g., Position 1 benchmark = 28.5%, Position 2 = 15.2%, Position 3 = 9.8%).
                Queries ranking in top positions with significant negative gaps indicate <strong>Title Tag Decay, weak meta descriptions, missing review star rich snippets, or displacement by AI Overviews</strong>.
                Optimizing these snippets unlocks thousands of incremental clicks without needing additional backlinks.
              </p>
            </div>
          </div>

          {/* CTR Curve Comparison Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Empirical SERP CTR Baseline vs. Actual Query CTR by Position</span>
                <span className="text-xs font-normal text-slate-500">Positions 1 to 10</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Red dots represent underperforming SERP snippets where CTR is significantly below expected benchmark.
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { pos: 'Pos 1', benchmark: 28.5, actualAvg: 19.8, topQuery: 'Colosseum underground tour (12.4%)' },
                      { pos: 'Pos 2', benchmark: 15.2, actualAvg: 11.2, topQuery: 'Vatican museum skip the line (8.1%)' },
                      { pos: 'Pos 3', benchmark: 9.8, actualAvg: 7.4, topQuery: 'Pompeii day trip from Rome (5.2%)' },
                      { pos: 'Pos 4', benchmark: 6.4, actualAvg: 4.8, topQuery: 'Florence private walking tour (3.9%)' },
                      { pos: 'Pos 5', benchmark: 4.5, actualAvg: 3.1, topQuery: 'Venice gondola ride at sunset (2.1%)' },
                      { pos: 'Pos 6', benchmark: 3.2, actualAvg: 2.5, topQuery: 'Capri boat tour from Sorrento (1.8%)' },
                      { pos: 'Pos 7', benchmark: 2.4, actualAvg: 1.9, topQuery: 'Borghese gallery tickets (1.2%)' },
                      { pos: 'Pos 8', benchmark: 1.8, actualAvg: 1.4, topQuery: 'Uffizi museum tour (1.0%)' },
                      { pos: 'Pos 9', benchmark: 1.4, actualAvg: 1.1, topQuery: 'Amalfi coast private driver (0.8%)' },
                      { pos: 'Pos 10', benchmark: 1.1, actualAvg: 0.9, topQuery: 'Rome catacombs night tour (0.6%)' },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="pos" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name="Travel SERP Benchmark CTR"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualAvg"
                      name="Your Site Actual Average CTR"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scorecard: Missed Clicks Impact */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Missed Clicks Aggregate</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Snippet Optimization Potential</h3>
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-800 font-semibold">Total Recoverable Organic Traffic</div>
                  <div className="text-2xl font-black text-amber-900 font-mono mt-1">
                    +{ctrAnomalies.reduce((a, b) => a + b.missedClicks, 0).toLocaleString()}
                    <span className="text-xs font-medium text-amber-700 ml-1">clicks / mo</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Achievable purely via title tag rewrites and rich snippet schema.
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Top 3 Queries with CTR Gap:</span>
                    <span className="font-bold text-slate-900">
                      {ctrAnomalies.filter((q) => q.position <= 3 && q.ctrGap > 3).length} queries
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Avg CTR Shortfall on Page 1:</span>
                    <span className="font-bold text-red-600">-3.8% below benchmark</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Estimated Annual Revenue Lift:</span>
                    <span className="font-bold text-emerald-600">+$184,200</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 mt-4">
                💡 <span className="font-semibold">Recommended Fix:</span> Include emotional power words ("Exclusive", "Skip the Line", "Official Guide", "2025") and structured Price metadata in Title tags.
              </div>
            </div>
          </div>

          {/* Underperforming Queries Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              High-Visibility Queries with Low-CTR Anomalies (Action Priority)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Search Query</th>
                    <th className="py-2.5 px-3 text-right">Avg Position</th>
                    <th className="py-2.5 px-3 text-right">Impressions</th>
                    <th className="py-2.5 px-3 text-right">Actual CTR</th>
                    <th className="py-2.5 px-3 text-right">Benchmark CTR</th>
                    <th className="py-2.5 px-3 text-right text-emerald-600">Missed Clicks</th>
                    <th className="py-2.5 px-3">Primary Diagnosis & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ctrAnomalies.slice(0, 8).map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{q.query}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{q.landingPage}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        #{q.position.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{q.impressions.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-red-600">{q.actualCtr.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{q.expectedCtr.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        +{q.missedClicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-semibold text-slate-800">
                          {q.anomalyType === 'Severe Snippet Decay'
                            ? '🚨 Title lacks CTA & year anchor'
                            : '⚠️ SERP feature competition'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Add: "Skip-the-Line Access + VIP Guide (2025)"
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Revenue Sizing Simulator */}
      {activeSubTab === 'revenue-calculator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Interactive SEO Revenue Sizing & ROI Forecaster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate the economic return of lifting striking-distance keywords (Positions 4 to 12) into Top 3 SERP rankings.
                </p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                Formula: Extra Clicks × Conv Rate × AOV = Annual Revenue Lift
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>E-commerce Conversion Rate:</span>
                  <span className="text-emerald-600 font-mono">{convRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={convRate}
                  onChange={(e) => setConvRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0.5% (Conservative)</span>
                  <span>2.4% (Avg)</span>
                  <span>5.0% (High)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Average Order Value (AOV):</span>
                  <span className="text-emerald-600 font-mono">${aov}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="5"
                  value={aov}
                  onChange={(e) => setAov(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$50 (Single Entry)</span>
                  <span>$145 (Private Tour)</span>
                  <span>$400 (Multi-Day)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Average Position Improvement:</span>
                  <span className="text-emerald-600 font-mono">+{targetRankLift} Positions</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={targetRankLift}
                  onChange={(e) => setTargetRankLift(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>+1 (Minor Tweak)</span>
                  <span>+3 (Standard Target)</span>
                  <span>+6 (Full Re-architecture)</span>
                </div>
              </div>
            </div>

            {/* Simulated Outcomes 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Targetable High-Impression Queries</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {revenueForecast.queryCount}
                  <span className="text-xs font-normal text-slate-400 ml-1">queries</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {revenueForecast.totalStrikingImpressions.toLocaleString()} monthly impressions
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xs text-blue-800 font-medium">Incremental Monthly Clicks</div>
                <div className="text-2xl font-black text-blue-900 font-mono mt-1">
                  +{revenueForecast.incrementalClicks.toLocaleString()}
                  <span className="text-xs font-normal text-blue-700 ml-1">clicks</span>
                </div>
                <div className="text-[11px] text-blue-700 mt-1">
                  +{( (revenueForecast.incrementalClicks / (revenueForecast.currentClicks || 1)) * 100 ).toFixed(0)}% organic traffic lift
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-xs text-purple-800 font-medium">Estimated New Tour Bookings</div>
                <div className="text-2xl font-black text-purple-900 font-mono mt-1">
                  +{revenueForecast.incrementalBookings.toLocaleString()}
                  <span className="text-xs font-normal text-purple-700 ml-1">orders</span>
                </div>
                <div className="text-[11px] text-purple-700 mt-1">
                  at {convRate.toFixed(1)}% conversion rate
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
                <div className="text-xs text-emerald-800 font-semibold">Forecasted Annual Revenue Lift</div>
                <div className="text-2xl font-black text-emerald-900 font-mono mt-1">
                  +${revenueForecast.incrementalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 font-bold">
                  at ${aov} Average Order Value
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Content Decay Early-Warning Radar */}
      {activeSubTab === 'content-decay' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Content Velocity Loss & Decay Detection (Rolling Moving Average vs Baseline)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identifies URLs experiencing negative impression and click trajectory before they completely fall off Page 1.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                {contentDecayData.filter((d) => d.status.includes('Decay')).length} URLs in Decay
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              {[
                { title: 'Surging Momentum (>20% YoY)', count: contentDecayData.filter(d => d.status === 'Surging').length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { title: 'Stable / Healthy (-3% to +20%)', count: contentDecayData.filter(d => d.status === 'Healthy').length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { title: 'Early Decay Warning (-3% to -15%)', count: contentDecayData.filter(d => d.status === 'Early Decay Warning').length, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                { title: 'Severe Traffic Decay (<-15%)', count: contentDecayData.filter(d => d.status === 'Severe Decay').length, color: 'text-red-700 bg-red-50 border-red-200' },
              ].map((card, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${card.color}`}>
                  <div className="text-[11px] font-semibold">{card.title}</div>
                  <div className="text-xl font-bold font-mono mt-1">{card.count} URLs</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Landing Page URL</th>
                    <th className="py-2.5 px-3">Page Group</th>
                    <th className="py-2.5 px-3 text-right">Monthly Clicks</th>
                    <th className="py-2.5 px-3 text-right">Click Velocity (YoY)</th>
                    <th className="py-2.5 px-3">Decay Status</th>
                    <th className="py-2.5 px-3">Prescribed SEO Remedy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {contentDecayData.slice(0, 7).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 truncate max-w-sm">
                        {p.page}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.pageGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">{p.clicks.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            p.clicksGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {p.clicksGrowthRate >= 0 ? '+' : ''}
                          {p.clicksGrowthRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Severe Decay'
                              ? 'bg-red-100 text-red-800'
                              : p.status === 'Early Decay Warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {p.recommendedFix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: AI Overview & SERP Feature Displacement */}
      {activeSubTab === 'serp-displacement' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              SERP Feature & Google AI Overview (AIO) Traffic Displacement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Detects high-volume search terms where zero-click AI summaries, Knowledge Graphs, or Local Packs push organic blue links down the viewport.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  query: 'colosseum opening hours and ticket rules',
                  serpFeature: 'Google AI Overview + Direct Answer Box',
                  organicImpact: 'Organic CTR collapsed from 18.2% to 2.4% despite maintaining Position #1',
                  remedy: 'Transform content format into bulleted direct-answer tables and claim citation source in AI summaries',
                },
                {
                  query: 'vatican museum dress code shoulders knees',
                  serpFeature: 'Featured Snippet (Table) + Image Carousel',
                  organicImpact: 'Competitor stole snippet; organic position #2 captures under 3.1% CTR',
                  remedy: 'Add dedicated 40-word definition block matching snippet schema with bold key takeaways',
                },
                {
                  query: 'best gelato near trevi fountain rome',
                  serpFeature: 'Google Maps Local 3-Pack',
                  organicImpact: '100% of above-the-fold mobile clicks captured by Google Maps pins',
                  remedy: 'Shift target keyword intent to curated experiential walking tour guides rather than pure directory lists',
                },
                {
                  query: 'how to travel from rome to florence train',
                  serpFeature: 'Google Trains Ticket Widget + FAQ Accordions',
                  organicImpact: 'High impression count (45k/mo) with near-zero transactional bookings',
                  remedy: 'Target high-intent variant queries: "private guided day trip from rome to florence with transport"',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">{item.query}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {item.serpFeature}
                    </span>
                  </div>
                  <div className="text-xs text-red-600 font-medium mb-2">📉 {item.organicImpact}</div>
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-700">Strategic Response:</span> {item.remedy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Mobile vs Desktop SERP Parity */}
      {activeSubTab === 'mobile-parity' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Mobile vs Desktop SERP Ranking Parity Discrepancies
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Identifies pages where mobile rankings are significantly penalized compared to desktop due to mobile Core Web Vitals, layout shifts, or intrusive popups.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Target Query & URL</th>
                    <th className="py-2.5 px-3 text-center">Desktop Rank</th>
                    <th className="py-2.5 px-3 text-center">Mobile Rank</th>
                    <th className="py-2.5 px-3 text-center text-red-600">Mobile Drag Gap</th>
                    <th className="py-2.5 px-3">Technical Root Cause</th>
                    <th className="py-2.5 px-3">Engineering Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mobileParityData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.query}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{item.page}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                        #{item.desktopPos.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">
                        #{item.mobilePos.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-red-600">
                        -{item.gap.toFixed(1)} Pos
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-700">
                        {item.rootCause}
                      </td>
                      <td className="py-3 px-3 text-xs text-emerald-700 font-medium">
                        {item.fix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: Search Intent & Commercial Matrix */}
      {activeSubTab === 'intent-matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Search Intent Classification & Commercial Propensity Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Segmenting organic queries by user intent to align content architecture with monetization pathways.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intentData.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.intent}
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {item.queriesCount} Queries
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Monthly Clicks</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{item.clicks.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Avg Position</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">#{item.avgPos.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="text-[10px] text-slate-500">Avg CTR</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{item.avgCtr}%</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 mb-2">
                    <span className="font-semibold text-slate-800">Conversion Propensity: </span>
                    <span className="font-bold text-emerald-600">{item.conversionPropensity}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 italic mb-3">
                    e.g. "{item.examples}"
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-950">
                    <span className="font-bold text-emerald-800">Action Plan:</span> {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
