import React, { useMemo, useState } from 'react';
import { Download, Search, UploadCloud } from 'lucide-react';
import { TblPageItem } from '../types';

interface DirectoryPerformanceSectionProps {
  pages: TblPageItem[];
}

export const DirectoryPerformanceSection: React.FC<DirectoryPerformanceSectionProps> = ({ pages }) => {
  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const groups = new Map<string, any>();
    pages.forEach((page) => {
      const key = `${page.pageGroup}|||${page.pageLevel}`;
      const row = groups.get(key) || {
        pageGroup: page.pageGroup,
        pageLevel: page.pageLevel,
        pageCount: 0,
        clicks: 0,
        impressions: 0,
        prevClicks: 0,
        prevImpressions: 0,
        weightedPosition: 0,
        topUrl: '',
        topUrlClicks: -1,
      };
      row.pageCount += 1;
      row.clicks += page.clicks;
      row.impressions += page.impressions;
      row.prevClicks += page.prevClicks;
      row.prevImpressions += page.prevImpressions;
      row.weightedPosition += page.position * page.impressions;
      if (page.clicks > row.topUrlClicks) {
        row.topUrlClicks = page.clicks;
        row.topUrl = page.page;
      }
      groups.set(key, row);
    });
    return Array.from(groups.values())
      .map((row) => ({
        ...row,
        ctr: row.clicks / Math.max(1, row.impressions),
        position: row.weightedPosition / Math.max(1, row.impressions),
        clickChange: row.clicks - row.prevClicks,
      }))
      .filter((row) => `${row.pageGroup} ${row.pageLevel} ${row.topUrl}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.impressions - a.impressions);
  }, [pages, search]);

  const exportCsv = () => {
    const header = ['Page Group','Page Level','Pages','Clicks','Previous Clicks','Impressions','CTR','Weighted Position','Top URL'];
    const body = rows.map((row) => [row.pageGroup,row.pageLevel,row.pageCount,row.clicks,row.prevClicks,row.impressions,(row.ctr * 100).toFixed(2),row.position.toFixed(2),row.topUrl]);
    const csv = [header, ...body].map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `gsc-directory-performance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Live uploaded dataset</div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Performance by Directory & Page Level</h1>
            <p className="text-xs text-slate-500 mt-1">Classified from the exact ToursByLocals URL hierarchy, with specific templates evaluated before parent directories.</p>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold">
            <Download className="w-4 h-4" /> Export classification
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          <UploadCloud className="w-4 h-4" /> {pages.length.toLocaleString()} landing pages are currently loaded into this report.
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter directory, level or URL..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wide">
              <tr>{['Directory','Page level','Pages','Clicks','Change','Impressions','CTR','Position','Top URL'].map((label) => <th key={label} className="text-left px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={`${row.pageGroup}-${row.pageLevel}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{row.pageGroup}</td>
                  <td className="px-4 py-3 text-slate-700">{row.pageLevel}</td>
                  <td className="px-4 py-3 font-mono">{row.pageCount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{row.clicks.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-mono ${row.clickChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{row.clickChange >= 0 ? '+' : ''}{row.clickChange.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{(row.ctr * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 font-mono">{row.position.toFixed(1)}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-blue-700" title={row.topUrl}>{row.topUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
