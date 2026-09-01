import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, Search, Target, TrendingDown } from 'lucide-react';
import { TblPageItem, TblQueryItem } from '../types';

type View = 'all' | 'ctr' | 'rank' | 'visibility' | 'declining' | 'quality';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface OpportunityRow {
  kind: 'Page' | 'Query';
  item: string;
  pageGroup: string;
  pageLevel: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clickChange: number;
  categories: Exclude<View, 'all'>[];
  priority: Priority;
  action: string;
  reason: string;
}

const priorityOrder: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function csvDownload(rows: OpportunityRow[], filename: string) {
  const data = rows.map((row) => ({
    type: row.kind,
    url_or_query: row.item,
    page_group: row.pageGroup,
    page_level: row.pageLevel,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr_percent: (row.ctr * 100).toFixed(2),
    average_position: row.position.toFixed(1),
    click_change: row.clickChange,
    opportunity_types: row.categories.join(' | '),
    priority: row.priority,
    recommended_action: row.action,
    reason: row.reason,
  }));
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map((row) => headers.map((key) => `"${String((row as any)[key]).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function classifyPage(page: TblPageItem): OpportunityRow {
  const categories: OpportunityRow['categories'] = [];
  const clickChange = page.clicks - page.prevClicks;
  const impressionChange = page.impressions - page.prevImpressions;
  const expectedCtr = page.position <= 3 ? 0.04 : page.position <= 10 ? 0.02 : 0.01;
  const taxonomyText = `${page.pageGroup} ${page.pageLevel}`.toLowerCase();
  const taxonomyIssue = /other|unknown|unclassified|utility/.test(taxonomyText);
  const lowVisibilityProxy = page.impressions < 100 && page.clicks < 3;

  if (page.impressions >= 500 && page.position <= 20 && page.ctr < expectedCtr) categories.push('ctr');
  if (page.position >= 4 && page.position <= 20) categories.push('rank');
  if (page.impressions >= 1000 && (page.clicks <= 10 || page.ctr < 0.005)) categories.push('visibility');
  if (clickChange < 0 || impressionChange < 0) categories.push('declining');
  if (taxonomyIssue || lowVisibilityProxy) categories.push('quality');

  let priority: Priority = 'Low';
  let action = 'Monitor performance and retain current optimisation.';
  let reason = 'No strong bulk opportunity signal detected.';
  if (taxonomyIssue) {
    priority = 'Critical';
    action = 'Review URL taxonomy and assign the correct page group and level.';
    reason = 'The URL is currently unclassified or mapped to a non-commercial catch-all group.';
  } else if (categories.includes('visibility')) {
    priority = 'High';
    action = 'Rewrite title and description, align intent, and strengthen internal links to this page.';
    reason = 'The page has substantial visibility but captures very few clicks.';
  } else if (categories.includes('declining') && Math.abs(clickChange) >= 20) {
    priority = 'High';
    action = 'Diagnose lost queries, ranking changes and SERP presentation; refresh the affected sections.';
    reason = `Clicks declined by ${Math.abs(clickChange).toLocaleString()} versus the comparison period.`;
  } else if (categories.includes('rank')) {
    priority = 'Medium';
    action = 'Improve intent coverage, internal linking and on-page relevance to move into the top three.';
    reason = 'The page ranks in positions 4–20 and is within optimisation reach.';
  } else if (categories.includes('ctr')) {
    priority = 'Medium';
    action = 'Test a clearer title and description that better match the visible search demand.';
    reason = 'CTR is weak relative to current visibility and ranking position.';
  } else if (lowVisibilityProxy) {
    priority = 'Low';
    action = 'Review content depth, uniqueness, indexation and internal links before expanding similar URLs.';
    reason = 'Low GSC visibility is used as a thin-page review proxy; content depth requires a crawl to confirm.';
  }

  return {
    kind: 'Page', item: page.page, pageGroup: page.pageGroup, pageLevel: page.pageLevel,
    clicks: page.clicks, impressions: page.impressions, ctr: page.ctr, position: page.position,
    clickChange, categories, priority, action, reason,
  };
}

export const BulkSeoOpportunitiesReport: React.FC<{ pages: TblPageItem[]; queries: TblQueryItem[] }> = ({ pages, queries }) => {
  const [view, setView] = useState<View>('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(100);

  const pageRows = useMemo(() => pages.map(classifyPage), [pages]);
  const decliningQueries = useMemo<OpportunityRow[]>(() => queries
    .filter((q) => q.clicks - q.prevClicks < 0 || q.impressions - q.prevImpressions < 0)
    .map((q) => ({
      kind: 'Query', item: q.query, pageGroup: q.pageGroup || '—', pageLevel: q.pageLevel || '—',
      clicks: q.clicks, impressions: q.impressions, ctr: q.ctr, position: q.position,
      clickChange: q.clicks - q.prevClicks, categories: ['declining'],
      priority: q.clicks - q.prevClicks <= -20 ? 'High' : 'Medium',
      action: 'Review the landing page, SERP changes and competing queries for this demand.',
      reason: `Query clicks changed by ${(q.clicks - q.prevClicks).toLocaleString()} versus the comparison period.`,
    })), [queries]);

  const allRows = useMemo(() => [...pageRows, ...decliningQueries]
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || b.impressions - a.impressions), [pageRows, decliningQueries]);

  const filtered = allRows.filter((row) =>
    (view === 'all' || row.categories.includes(view)) && row.item.toLowerCase().includes(search.toLowerCase())
  );
  const visible = filtered.slice(0, limit);

  const tabs: Array<{ id: View; label: string }> = [
    { id: 'all', label: 'Recommended Actions' },
    { id: 'ctr', label: 'CTR Improvements' },
    { id: 'rank', label: 'Positions 4–20' },
    { id: 'visibility', label: 'High Impressions / Few Clicks' },
    { id: 'declining', label: 'Declining Pages & Queries' },
    { id: 'quality', label: 'Thin / Misclassified Review' },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Bulk analysis</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Bulk SEO Opportunities</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">Prioritised URL and query actions calculated from the complete uploaded GSC dataset.</p>
          </div>
          <button onClick={() => csvDownload(filtered, 'bulk-seo-opportunities.csv')} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export {filtered.length.toLocaleString()} rows
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ['CTR opportunities', pageRows.filter(r => r.categories.includes('ctr')).length],
            ['Positions 4–20', pageRows.filter(r => r.categories.includes('rank')).length],
            ['Visibility gaps', pageRows.filter(r => r.categories.includes('visibility')).length],
            ['Declining items', allRows.filter(r => r.categories.includes('declining')).length],
            ['Quality reviews', pageRows.filter(r => r.categories.includes('quality')).length],
          ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-1 text-2xl font-black text-slate-900">{Number(value).toLocaleString()}</div></div>)}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-wrap gap-2">{tabs.map(tab => <button key={tab.id} onClick={() => { setView(tab.id); setLimit(100); }} className={`rounded-full px-3 py-1.5 text-xs font-bold ${view === tab.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab.label}</button>)}</div>
          <div className="relative mt-3 max-w-lg"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search any URL or query" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500"><tr>{['Priority','Type','URL / Query','Group & Level','Clicks','Change','Impressions','CTR','Position','Recommended Action'].map(h => <th key={h} className="whitespace-nowrap px-3 py-3 font-bold uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{visible.map((row, i) => <tr key={`${row.kind}-${row.item}-${i}`} className="align-top hover:bg-slate-50">
              <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 font-black ${row.priority === 'Critical' ? 'bg-red-100 text-red-700' : row.priority === 'High' ? 'bg-orange-100 text-orange-700' : row.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{row.priority}</span></td>
              <td className="px-3 py-3 font-bold text-slate-600">{row.kind}</td>
              <td className="max-w-sm break-all px-3 py-3 font-medium text-blue-700">{row.item}</td>
              <td className="whitespace-nowrap px-3 py-3 text-slate-500">{row.pageGroup}<br />{row.pageLevel}</td>
              <td className="px-3 py-3 font-mono">{row.clicks.toLocaleString()}</td><td className={`px-3 py-3 font-mono font-bold ${row.clickChange < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{row.clickChange > 0 ? '+' : ''}{row.clickChange.toLocaleString()}</td>
              <td className="px-3 py-3 font-mono">{row.impressions.toLocaleString()}</td><td className="px-3 py-3 font-mono">{(row.ctr * 100).toFixed(2)}%</td><td className="px-3 py-3 font-mono">{row.position.toFixed(1)}</td>
              <td className="min-w-72 px-3 py-3"><div className="font-semibold text-slate-800">{row.action}</div><div className="mt-1 text-[11px] text-slate-500">{row.reason}</div></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!visible.length && <div className="p-10 text-center text-sm text-slate-500"><Target className="mx-auto mb-2 h-6 w-6" />No matching opportunities in this uploaded dataset.</div>}
        {visible.length < filtered.length && <div className="border-t border-slate-200 p-4 text-center"><button onClick={() => setLimit(limit + 100)} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Show 100 more</button></div>}
      </section>
      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0" /><span>“Thin” is a GSC visibility proxy here, not a content-word-count diagnosis. Confirm content depth with a crawl before removing or consolidating a URL.</span></div>
    </div>
  );
};
