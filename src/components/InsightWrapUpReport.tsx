/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Trophy,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Filter,
  DollarSign,
  Download,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Flame,
  ArrowRight,
  ListTodo,
  Calendar,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { DashboardFilterState, PropertyTotals, TblPageItem, TblQueryItem } from '../types';
import { TOURS_QUERIES as DEMO_QUERIES, TOURS_PAGES as DEMO_PAGES } from '../toursData';

interface ActionItem {
  id: string;
  title: string;
  category: 'Snippets & CTR' | 'Content & Authority' | 'Technical SEO' | 'Taxonomy & Cannibalization';
  priority: 'P0 - Urgent (1-2 Weeks)' | 'P1 - High (Month 1)' | 'P2 - Medium (Quarter 1)' | 'P3 - Ongoing';
  owner: 'Content Team' | 'Tech SEO' | 'Product / UX' | 'Growth Team';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Medium' | 'High' | 'Very High' | 'Critical';
  expectedLift: string;
  description: string;
  targetUrlsOrQueries: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    title: 'Rewrite Title Tags & Add Review Schema for Top 10 Low-CTR Queries',
    category: 'Snippets & CTR',
    priority: 'P0 - Urgent (1-2 Weeks)',
    owner: 'Content Team',
    effort: 'Low',
    impact: 'Critical',
    expectedLift: '+14,800 monthly clicks / +$214k annual booking revenue',
    description:
      'Queries like "colosseum underground tour" and "vatican museum skip the line" rank in Positions #1–3 but have CTRs 4–6% below benchmark. Add high-converting modifiers: "Skip-the-Line Access + VIP Guide (2025/2026)" and embed AggregateRating structured data.',
    targetUrlsOrQueries: [
      '/tours/rome/colosseum-underground-guided-tour',
      '/tours/vatican/st-peters-basilica-dome-climb',
      'colosseum underground tour',
      'vatican skip the line tickets',
    ],
    status: 'in-progress',
  },
  {
    id: 'act-2',
    title: 'Consolidate Cannibalized URL Targets for "Rome Tour Guides" & "Shore Excursions"',
    category: 'Taxonomy & Cannibalization',
    priority: 'P0 - Urgent (1-2 Weeks)',
    owner: 'Tech SEO',
    effort: 'Low',
    impact: 'High',
    expectedLift: '+6,200 monthly clicks by resolving split authority',
    description:
      'Two competing URLs are splitting Google impressions and rankings for high-intent queries. Implement 301 redirects and canonical links pointing to the primary pillar hub, updating internal breadcrumb hierarchy.',
    targetUrlsOrQueries: [
      '/tours/rome/guides vs /tours/rome/city-tours',
      '/shore-excursions/civitavecchia-rome vs /tours/rome/shore-day-trip',
    ],
    status: 'pending',
  },
  {
    id: 'act-3',
    title: 'Optimize Striking Distance Queries (Positions 4.0–10.0) into Top 3',
    category: 'Content & Authority',
    priority: 'P1 - High (Month 1)',
    owner: 'Content Team',
    effort: 'Medium',
    impact: 'Very High',
    expectedLift: '+22,500 monthly clicks / +$326k annual revenue pipeline',
    description:
      'Expand on-page FAQ accordions, add local travel tips, insert downloadable PDF itineraries, and bridge internal contextual links from related destination pages.',
    targetUrlsOrQueries: [
      'pompeii day trip from rome',
      'florence uffizi small group tour',
      'venice private gondola sunset ride',
      'amalfi coast boat excursion from sorrento',
    ],
    status: 'pending',
  },
  {
    id: 'act-4',
    title: 'Fix Mobile Core Web Vitals (LCP & CLS) Drag on Top 5 High-Revenue Tours',
    category: 'Technical SEO',
    priority: 'P1 - High (Month 1)',
    owner: 'Tech SEO',
    effort: 'Medium',
    impact: 'High',
    expectedLift: '+3.2 position recovery on mobile SERPs',
    description:
      'Mobile rankings are 3+ positions lower than desktop due to uncompressed hero video backgrounds and late-loading booking widgets causing layout shifts. Defer heavy scripts and reserve container dimensions.',
    targetUrlsOrQueries: [
      '/tours/rome/colosseum-underground-guided-tour',
      '/tours/vatican/st-peters-basilica-dome-climb',
      '/tours/florence/uffizi-gallery-tickets-small-group',
    ],
    status: 'in-progress',
  },
  {
    id: 'act-5',
    title: 'Build Dedicated Content Hubs for 8 High-Impression Page 2 Keywords',
    category: 'Content & Authority',
    priority: 'P2 - Medium (Quarter 1)',
    owner: 'Content Team',
    effort: 'High',
    impact: 'Very High',
    expectedLift: '+35,000 incremental monthly impressions into clicks',
    description:
      'Keywords like "rome to florence day trip by high speed train" and "is colosseum arena floor worth it" receive 180k+ impressions on Page 2. Launch in-depth informational hub guides with embedded booking cards.',
    targetUrlsOrQueries: [
      '/blog/rome-to-florence-day-trip-guide',
      '/blog/colosseum-arena-floor-vs-underground',
      '/tours/italy/best-multi-day-packages',
    ],
    status: 'pending',
  },
  {
    id: 'act-6',
    title: 'Defend AI Overview (AIO) & Direct Answer Citations via Structured Bullet Tables',
    category: 'Snippets & CTR',
    priority: 'P2 - Medium (Quarter 1)',
    owner: 'Product / UX',
    effort: 'Medium',
    impact: 'Medium',
    expectedLift: 'Re-capture 12% zero-click search intent',
    description:
      'Reformat key informational sections (opening times, dress code rules, ticket inclusions) into concise 40-word definition summaries and HTML comparison tables to be cited in Google AI Overviews.',
    targetUrlsOrQueries: [
      'colosseum opening hours and ticket rules',
      'vatican museum dress code shoulders knees',
    ],
    status: 'pending',
  },
];

interface InsightWrapUpReportProps {
  propertyTotals?: PropertyTotals;
  filters?: DashboardFilterState;
  onFilterChange?: (filters: DashboardFilterState) => void;
  pages?: TblPageItem[];
  queries?: TblQueryItem[];
}

export const InsightWrapUpReport: React.FC<InsightWrapUpReportProps> = ({
  propertyTotals,
  filters,
  pages = DEMO_PAGES,
  queries = DEMO_QUERIES,
}) => {
  const [activeSection, setActiveSection] = useState<'wrap-up' | 'wins' | 'opportunities' | 'actions'>('wrap-up');
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  // Normalized Safe Macro Metrics
  const currentClicks = propertyTotals?.currentClicks ?? 642850;
  const prevClicks = propertyTotals?.previousClicks ?? propertyTotals?.prevClicks ?? 518400;
  const clicksChangeRate = prevClicks > 0 ? ((currentClicks - prevClicks) / prevClicks) * 100 : 24.0;

  const currentImpressions = propertyTotals?.currentImpressions ?? 42850000;
  const prevImpressions = propertyTotals?.previousImpressions ?? propertyTotals?.prevImpressions ?? 35120000;
  const impressionsChangeRate = prevImpressions > 0 ? ((currentImpressions - prevImpressions) / prevImpressions) * 100 : 22.0;

  const currentPosition = propertyTotals?.currentPosition ?? 8.4;
  const prevPosition = propertyTotals?.previousPosition ?? propertyTotals?.prevPosition ?? 9.6;
  const currentCtr = propertyTotals?.currentCtr ?? 1.5;

  const datePreset = filters?.datePreset || (filters?.dateRange ? String(filters.dateRange) : 'Last 12 complete months');
  const comparisonPreset = filters?.comparisonPreset || (filters?.comparisonPeriod ? String(filters.comparisonPeriod) : 'Same period in the previous year');

  const handleCopySummary = () => {
    const summaryText = `
=== SEO EXECUTIVE INSIGHT WRAP-UP & ACTION BRIEFING ===
Period: ${datePreset} (vs ${comparisonPreset})

📊 MACRO PERFORMANCE METRICS:
- Total Organic Clicks: ${currentClicks.toLocaleString()} (+${clicksChangeRate.toFixed(1)}% YoY)
- Total SERP Impressions: ${(currentImpressions / 1000000).toFixed(2)}M (+${impressionsChangeRate.toFixed(1)}% YoY)
- Average SERP Ranking: #${currentPosition.toFixed(1)} (Prev #${prevPosition.toFixed(1)})
- Average CTR: ${currentCtr.toFixed(2)}%

🏆 TOP BIG WINS:
1. Shore Excursions & City Tours led growth (+38.4% YoY organic velocity)
2. 14 High-intent queries reached Top 3 Google positions
3. Mobile organic revenue up +28.2% across major Italian destination hubs

🎯 TOP SIZED OPPORTUNITIES:
1. Striking Distance (Pos 4-10): +22,500 monthly clicks recoverable
2. Snippet CTR Optimization: +14,800 monthly clicks via title tag rewrites
3. Keyword Cannibalization: 2 duplicate ranking clusters ready for consolidation

⚡ IMMEDIATE P0/P1 ACTION ROADMAP:
${actionItems
  .slice(0, 4)
  .map((a, i) => `${i + 1}. [${a.priority.split(' ')[0]}] ${a.title} (Owner: ${a.owner} | Expected Lift: ${a.expectedLift})`)
  .join('\n')}
======================================================
`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Big Wins Calculation
  const bigWinsData = useMemo(() => {
    // Top Gaining Pages
    const topGainingPages = [...pages]
      .filter((p) => p.prevClicks > 0)
      .map((p) => ({
        ...p,
        clickDelta: p.clicks - p.prevClicks,
        growthPct: ((p.clicks - p.prevClicks) / p.prevClicks) * 100,
      }))
      .sort((a, b) => b.clickDelta - a.clickDelta)
      .slice(0, 5);

    // CTR Benchmark Outperformers
    const ctrOutperformers = queries.filter((q) => q.position <= 5 && q.ctr > 15)
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 5);

    // Page 1 Conquests
    const pageOneConquests = queries.filter((q) => q.position <= 3)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      topGainingPages,
      ctrOutperformers,
      pageOneConquests,
    };
  }, [pages, queries]);

  // Filtered Action Items
  const filteredActions = useMemo(() => {
    return actionItems.filter((act) => {
      if (priorityFilter !== 'ALL' && !act.priority.startsWith(priorityFilter)) return false;
      if (ownerFilter !== 'ALL' && act.owner !== ownerFilter) return false;
      return true;
    });
  }, [actionItems, priorityFilter, ownerFilter]);

  const toggleActionStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextStatus =
            act.status === 'pending'
              ? 'in-progress'
              : act.status === 'in-progress'
              ? 'completed'
              : 'pending';
          return { ...act, status: nextStatus };
        }
        return act;
      })
    );
  };

  return (
    <div className="space-y-6" id="insight-wrap-up-report">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                Executive Synthesis
              </span>
              <span className="text-xs text-slate-500 font-medium">GSC Verified Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
              Insights Wrap-Up: Actions, Opportunities & Big Wins
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Consolidated strategic brief synthesizing total performance achievements, prioritized high-impact opportunities, and an actionable P0–P3 roadmap for growth.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Briefing Copied!' : 'Copy Executive Briefing'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-100 custom-scrollbar">
          {[
            { id: 'wrap-up', label: '1. Executive Wrap-Up & Macro Brief', icon: ShieldCheck },
            { id: 'wins', label: '2. Big Wins & Success Milestones', icon: Trophy, count: '3 Key Areas' },
            { id: 'opportunities', label: '3. Sized Opportunities ($ Value)', icon: Target, count: '4 Pipelines' },
            { id: 'actions', label: '4. Prioritized Action Plan (P0-P3)', icon: ListTodo, count: `${actionItems.length} Actions` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. EXECUTIVE WRAP-UP SECTION */}
      {activeSection === 'wrap-up' && (
        <div className="space-y-6">
          {/* 4 Scorecard KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Organic Clicks</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                  {currentClicks.toLocaleString()}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500">Period Lift</span>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{clicksChangeRate.toFixed(1)}% YoY
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Impressions</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                  {(currentImpressions / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500">Search Demand</span>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{impressionsChangeRate.toFixed(1)}% YoY
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average SERP Rank</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                  #{currentPosition.toFixed(1)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500">Rank Velocity</span>
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{(prevPosition - currentPosition).toFixed(1)} Positions
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identified Pipeline Value</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                  +$540,500
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
                <span>Recoverable Clicks</span>
                <span className="font-bold text-emerald-400">+37,300 / mo</span>
              </div>
            </div>
          </div>

          {/* Strategic Synthesis 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Growth Drivers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <h3>1. Core Growth Drivers</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Shore Excursions & City Tours:</strong> Outperformed previous periods with a <strong>+38.4% click surge</strong> ahead of the Mediterranean cruise peak.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Top 3 Keyword Penetration:</strong> 14 primary commercial queries achieved top 3 SERP status, driving high-converting organic booking volume.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>International Demand Capture:</strong> US, UK, and Australian searchers expanded by +29% in organic click volume.
                  </span>
                </li>
              </ul>
            </div>

            {/* Strategic Vulnerabilities & Risks */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <h3>2. Vulnerabilities & Friction</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>High Portfolio Concentration:</strong> The top 10 URLs generate <strong>52.1% of total site clicks</strong>, creating vulnerability to single-page volatility.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Title Tag & Snippet CTR Decay:</strong> Major ranking terms are underperforming CTR benchmarks by 3.8%, losing ~14.8k clicks/month.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mobile Ranking Drag:</strong> Mobile rankings trail desktop by 2.8 positions on key booking pages due to mobile Core Web Vitals.
                  </span>
                </li>
              </ul>
            </div>

            {/* Recommended 90-Day Execution Plan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <h3>3. 90-Day Roadmap Summary</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Weeks 1–2 (P0):</strong> Execute Title Tag rewrites with Review Schema and resolve 2 primary keyword cannibalization clusters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Weeks 3–4 (P1):</strong> Lift striking-distance queries (Pos 4–10) with enriched FAQs, itinerary highlights, and mobile speed fixes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Month 2+ (P2/P3):</strong> Launch dedicated content hubs for 8 high-impression Page 2 queries to expand long-tail market share.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIG WINS & SUCCESS MILESTONES */}
      {activeSection === 'wins' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Proven SEO Wins & Growth Leaders
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified top-performing URLs and queries achieving maximum organic traffic expansion and SERP dominance.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                +124,450 Total Incremental Clicks
              </span>
            </div>

            {/* Top Gaining Pages Table */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Fastest Growing Landing Pages (Absolute Click Expansion)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Landing Page URL</th>
                      <th className="py-2.5 px-3">Page Group</th>
                      <th className="py-2.5 px-3 text-right">Current Clicks</th>
                      <th className="py-2.5 px-3 text-right">Previous Clicks</th>
                      <th className="py-2.5 px-3 text-right text-emerald-600">Net Growth</th>
                      <th className="py-2.5 px-3 text-right">% Lift</th>
                      <th className="py-2.5 px-3 text-right">Avg Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {bigWinsData.topGainingPages.map((p, idx) => (
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
                        <td className="py-3 px-3 text-right font-mono text-slate-400">{p.prevClicks.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                          +{p.clickDelta.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                          +{p.growthPct.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                          #{p.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTR Benchmark Outperformers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  2. CTR Benchmark Outperformers (High-Converting Snippets)
                </h4>
                <div className="space-y-2.5">
                  {bigWinsData.ctrOutperformers.map((q, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{q.query}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">Rank #{q.position.toFixed(1)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-600 font-mono">{q.ctr.toFixed(1)}% CTR</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">2.1x Benchmark</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  3. Key Page #1 Ranking Conquests
                </h4>
                <div className="space-y-2.5">
                  {bigWinsData.pageOneConquests.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{q.query}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{q.landingPage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 font-mono">{q.clicks.toLocaleString()} clicks</div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                          Pos #{q.position.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIZED OPPORTUNITIES SUMMARY */}
      {activeSection === 'opportunities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunity 1: Striking Distance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    Opportunity #1
                  </span>
                  <span className="font-mono text-xs font-bold text-purple-700">Positions 4.0 - 10.0</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Striking-Distance Keyword Click Unlock
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  18 high-search-volume queries ranking just off the top 3 spots. Lifting these by 2–3 positions captures existing search demand immediately.
                </p>

                <div className="my-4 p-4 rounded-xl bg-purple-50 border border-purple-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-purple-800 font-medium">Estimated Monthly Lift</div>
                    <div className="text-xl font-black text-purple-900 font-mono mt-0.5">+22,500 clicks</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-purple-800 font-medium">Annual Revenue Value</div>
                    <div className="text-xl font-black text-purple-900 font-mono mt-0.5">+$326,250</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Prescribed Action:</strong> Enrich destination page FAQs, embed reviews, and update internal contextual anchor texts.
              </div>
            </div>

            {/* Opportunity 2: Low CTR Snippet Decay */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Opportunity #2
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-700">CTR Gap Optimization</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Title Tag & Meta Description Rewrites
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Top-ranking queries (Positions 1–3) suffering from below-benchmark CTRs due to outdated titles or missing price/review schema.
                </p>

                <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-amber-800 font-medium">Recoverable Clicks</div>
                    <div className="text-xl font-black text-amber-900 font-mono mt-0.5">+14,800 clicks</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-amber-800 font-medium">Annual Revenue Value</div>
                    <div className="text-xl font-black text-amber-900 font-mono mt-0.5">+$214,600</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Prescribed Action:</strong> Rewrite meta titles with "2025/2026", "Official Skip the Line", and structured Product review schema.
              </div>
            </div>

            {/* Opportunity 3: Keyword Cannibalization */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    Opportunity #3
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-700">Internal Authority Consolidation</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Keyword Cannibalization Resolution
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Duplicate internal URLs competing for the exact same SERP intent, diluting PageRank and confusing Google's primary canonical selection.
                </p>

                <div className="my-4 p-4 rounded-xl bg-blue-50 border border-blue-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-blue-800 font-medium">Recoverable Clicks</div>
                    <div className="text-xl font-black text-blue-900 font-mono mt-0.5">+6,200 clicks</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-800 font-medium">Annual Revenue Value</div>
                    <div className="text-xl font-black text-blue-900 font-mono mt-0.5">+$89,900</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Prescribed Action:</strong> Redirect secondary URL or set rel=canonical to the definitive parent destination hub.
              </div>
            </div>

            {/* Opportunity 4: Mobile Core Web Vitals Drag */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Opportunity #4
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">Mobile Speed & UX</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Mobile SERP Parity Recovery
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mobile rankings trail desktop by 2.8 positions on key commercial landing pages due to heavy media and script blocking.
                </p>

                <div className="my-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-emerald-800 font-medium">Recoverable Clicks</div>
                    <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">+8,900 clicks</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-800 font-medium">Annual Revenue Value</div>
                    <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">+$129,050</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Prescribed Action:</strong> Convert hero images to AVIF, defer booking widget execution, and eliminate layout shifts (CLS &lt; 0.1).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIORITIZED ACTION PLAN MATRIX (P0 - P3) */}
      {activeSection === 'actions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-emerald-600" />
                  Prioritized SEO Action Plan Roadmap (P0 - P3)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any action's checkbox to toggle status between <strong>Pending</strong>, <strong>In-Progress</strong>, and <strong>Completed</strong>.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium px-1.5 text-[11px]">Priority:</span>
                  {['ALL', 'P0', 'P1', 'P2'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        priorityFilter === p
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium px-1.5 text-[11px]">Owner:</span>
                  {['ALL', 'Content Team', 'Tech SEO', 'Product / UX'].map((o) => (
                    <button
                      key={o}
                      onClick={() => setOwnerFilter(o)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        ownerFilter === o
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Items List */}
            <div className="space-y-4 mt-6">
              {filteredActions.map((act) => {
                const isCompleted = act.status === 'completed';
                const isInProgress = act.status === 'in-progress';

                return (
                  <div
                    key={act.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50/70 border-slate-200 opacity-75'
                        : isInProgress
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Checkbox + Title + Description */}
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => toggleActionStatus(act.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isInProgress
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                              : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                          }`}
                        >
                          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                          {isInProgress && <Activity className="w-3.5 h-3.5 animate-pulse" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                                act.priority.startsWith('P0')
                                  ? 'bg-red-100 text-red-800'
                                  : act.priority.startsWith('P1')
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {act.priority}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                              {act.category}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              Owner: <strong>{act.owner}</strong>
                            </span>
                          </div>

                          <h4
                            className={`text-sm font-black mt-1.5 ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {act.title}
                          </h4>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-4xl">
                            {act.description}
                          </p>

                          {/* Target URLs / Queries Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <span className="text-[10px] text-slate-400 font-semibold">Targets:</span>
                            {act.targetUrlsOrQueries.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700 font-medium truncate max-w-xs"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Impact & Expected Lift Badge */}
                      <div className="sm:text-right shrink-0 p-3 bg-slate-50 rounded-xl border border-slate-200/80 sm:w-64">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Projected SEO Return
                        </div>
                        <div className="text-xs font-black text-emerald-700 mt-0.5 font-mono">
                          {act.expectedLift}
                        </div>
                        <div className="flex items-center sm:justify-end gap-2 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                          <span>Effort: <strong className="text-slate-800">{act.effort}</strong></span>
                          <span>•</span>
                          <span>Impact: <strong className="text-slate-800">{act.impact}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
