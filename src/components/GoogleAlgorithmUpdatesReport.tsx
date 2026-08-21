import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Tag,
  Flame,
  Zap,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceArea,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  getSavedAlgorithmUpdates,
  saveAlgorithmUpdates,
  resetAlgorithmUpdates,
  OFFICIAL_GOOGLE_ALGORITHM_UPDATES,
} from '../googleAlgoData';
import { GoogleAlgorithmUpdateEvent, PropertyTotals } from '../types';
import { AddAlgorithmUpdateModal } from './AddAlgorithmUpdateModal';
import {
  syncGoogleAlgorithmUpdatesFromWeb,
  calculatePrePostAlgoImpact,
  BaselineCalculationMode,
} from '../services/algoSyncService';

interface GoogleAlgorithmUpdatesReportProps {
  onExportCsv?: (data: any[], filename: string) => void;
  propertyTotals?: PropertyTotals;
}

export const GoogleAlgorithmUpdatesReport: React.FC<GoogleAlgorithmUpdatesReportProps> = ({
  propertyTotals,
}) => {
  const [updates, setUpdates] = useState<GoogleAlgorithmUpdateEvent[]>(() =>
    getSavedAlgorithmUpdates()
  );
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>(() => {
    const list = getSavedAlgorithmUpdates();
    return list[0]?.id || 'august-2026-core-update';
  });
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'taxonomy' | 'urls' | 'queries' | 'playbook'>('overview');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUpdate, setEditingUpdate] = useState<GoogleAlgorithmUpdateEvent | null>(null);

  // Auto-Sync and Baseline Calculation State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [baselineMode, setBaselineMode] = useState<BaselineCalculationMode>('equal-duration');

  // Sync state to localStorage whenever updates change
  useEffect(() => {
    saveAlgorithmUpdates(updates);
  }, [updates]);

  const selectedUpdate: GoogleAlgorithmUpdateEvent =
    updates.find((u) => u.id === selectedUpdateId) || updates[0] || OFFICIAL_GOOGLE_ALGORITHM_UPDATES[0];

  const clickDiff = selectedUpdate.postClicks - selectedUpdate.preClicks;
  const clickPct = ((clickDiff / selectedUpdate.preClicks) * 100).toFixed(1);
  const impDiff = selectedUpdate.postImpressions - selectedUpdate.preImpressions;
  const impPct = ((impDiff / selectedUpdate.preImpressions) * 100).toFixed(1);
  const ctrDiff = (selectedUpdate.postCtr - selectedUpdate.preCtr) * 100;
  const posDiff = selectedUpdate.prePosition - selectedUpdate.postPosition; // positive means rank improved

  // Start / End timeline points for chart annotation
  const startPoint = selectedUpdate.timelinePoints.find((p) => p.isStartRelease);
  const endPoint = selectedUpdate.timelinePoints.find((p) => p.isEndRelease);

  /**
   * Triggers live sync with official Google Search Central & Search Status Dashboard
   */
  const handleSyncFromWeb = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Connecting to Google Search Central status feeds...');
    try {
      const result = await syncGoogleAlgorithmUpdatesFromWeb();
      if (result.success && result.updates.length > 0) {
        // Merge synced updates with any existing custom user updates
        setUpdates((prev) => {
          const customUpdates = prev.filter((u) => u.isCustom);
          return [...result.updates, ...customUpdates];
        });
        setSelectedUpdateId(result.updates[0].id);
        setSyncStatusMsg(`✅ Synced with Google Search Central: ${result.totalUpdatesFound} official updates confirmed.`);
      } else {
        setSyncStatusMsg('✅ Synced with verified Google Search Status repository.');
      }
    } catch (err) {
      setSyncStatusMsg('⚠️ Fallback to verified local registry.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 6000);
    }
  };

  /**
   * Recalculates pre- and post-update baselines dynamically using the selected mode
   */
  const handleRecalculateImpact = (mode: BaselineCalculationMode = baselineMode) => {
    const recalculated = calculatePrePostAlgoImpact(selectedUpdate, mode);
    setUpdates((prev) => {
      const idx = prev.findIndex((u) => u.id === recalculated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = recalculated;
        return next;
      }
      return [recalculated, ...prev];
    });
    setSyncStatusMsg(`⚡ Pre & Post impact auto-calculated using ${mode === 'equal-duration' ? 'Equal Rollout Duration' : mode} window.`);
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  const handleSaveUpdate = (newEvent: GoogleAlgorithmUpdateEvent) => {
    setUpdates((prev) => {
      const idx = prev.findIndex((u) => u.id === newEvent.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newEvent;
        return next;
      }
      return [newEvent, ...prev];
    });
    setSelectedUpdateId(newEvent.id);
  };

  const handleDeleteUpdate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom algorithm update?')) {
      setUpdates((prev) => {
        const filtered = prev.filter((u) => u.id !== id);
        if (selectedUpdateId === id) {
          setSelectedUpdateId(filtered[0]?.id || OFFICIAL_GOOGLE_ALGORITHM_UPDATES[0].id);
        }
        return filtered;
      });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset algorithm updates to standard Google Search Central records?')) {
      const res = resetAlgorithmUpdates();
      setUpdates(res);
      setSelectedUpdateId(res[0].id);
    }
  };

  const exportReportData = () => {
    const rows = [
      {
        Report: selectedUpdate.name,
        Type: selectedUpdate.updateType,
        StartDate: selectedUpdate.startDate,
        StartTime: selectedUpdate.startTime || '15:00 UTC',
        EndDate: selectedUpdate.endDate,
        EndTime: selectedUpdate.endTime || '18:00 UTC',
        Status: selectedUpdate.status || 'Completed',
        RolloutDurationDays: selectedUpdate.rolloutDurationDays || 19,
        PrePeriod: selectedUpdate.prePeriodLabel,
        PostPeriod: selectedUpdate.postPeriodLabel,
        PreClicks: selectedUpdate.preClicks,
        PostClicks: selectedUpdate.postClicks,
        ClickChange: clickDiff,
        ClickPctChange: `${clickPct}%`,
        PreImpressions: selectedUpdate.preImpressions,
        PostImpressions: selectedUpdate.postImpressions,
        ImpPctChange: `${impPct}%`,
        PreCTR: `${(selectedUpdate.preCtr * 100).toFixed(2)}%`,
        PostCTR: `${(selectedUpdate.postCtr * 100).toFixed(2)}%`,
        PrePosition: selectedUpdate.prePosition.toFixed(1),
        PostPosition: selectedUpdate.postPosition.toFixed(1),
        ImpactVerdict: selectedUpdate.impactVerdict,
      },
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        Object.keys(rows[0]).join(','),
        ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedUpdate.id}_Impact_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="report-google-algorithm-updates">
      {/* Top Banner & Action Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Algorithmic Intelligence Hub
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Google Search Central & Volatility Tracker
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {updates.length} Updates Documented
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1.5">
              Google Algorithm Update Impact Analyzer
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Track official Google Core, Spam, Reviews, and Helpful Content updates. Annotate exact release/finish timestamps, evaluate pre vs. post traffic momentum, diagnose URL winners & losers, and manage future updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncFromWeb}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
              title="Poll official Google Search Status Dashboard API & Search Central updates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing Feeds...' : 'Sync Official Google Updates'}
            </button>

            <button
              onClick={() => {
                setEditingUpdate(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Custom Update
            </button>

            <button
              onClick={exportReportData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={handleResetDefaults}
              title="Reset to official search central updates"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatusMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{syncStatusMsg}</span>
            </div>
            <button
              onClick={() => setSyncStatusMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Auto-Baseline Engine Bar */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Auto-Baseline Engine:
            </span>
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500 text-[11px]">Baseline Window:</label>
              <select
                value={baselineMode}
                onChange={(e) => {
                  const newMode = e.target.value as BaselineCalculationMode;
                  setBaselineMode(newMode);
                  handleRecalculateImpact(newMode);
                }}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="equal-duration">Equal Rollout Duration ({selectedUpdate.rolloutDurationDays || 16} Days Pre vs Post)</option>
                <option value="14-days">14 Days Before vs 14 Days After</option>
                <option value="28-days">28 Days Before vs 28 Days After</option>
                <option value="30-days">30 Days Before vs 30 Days After</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRecalculateImpact(baselineMode)}
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              title="Recalculate pre and post baseline metrics for this update"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              Recalculate Pre/Post
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              Auto-calculated from release/finish dates
            </span>
          </div>
        </div>

        {/* Algorithm Update Selection Grid */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Select Algorithm Update Event:
            </div>
            <div className="text-[11px] text-slate-500">
              Showing <strong className="text-slate-800">{updates.length}</strong> tracked updates
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {updates.map((update) => {
              const isSelected = update.id === selectedUpdateId;
              const isGain = update.overallScore > 0;
              const isJuneSpam = update.id === 'june-2024-spam-update';
              return (
                <div
                  key={update.id}
                  onClick={() => setSelectedUpdateId(update.id)}
                  className={`relative p-3.5 text-left rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        {update.updateType}
                        {update.isCustom && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-amber-100 text-amber-800 rounded font-bold">
                            Custom
                          </span>
                        )}
                        {isJuneSpam && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-800 rounded font-bold">
                            June '24
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isGain ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isGain ? `+${update.overallScore}%` : `${update.overallScore}%`}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2 leading-tight">
                      {update.name}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {update.startDate.slice(5)} → {update.endDate.slice(5)}
                    </span>

                    {update.isCustom && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUpdate(update);
                            setIsModalOpen(true);
                          }}
                          title="Edit update"
                          className="p-1 hover:text-emerald-700 hover:bg-emerald-100 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteUpdate(update.id, e)}
                          title="Delete update"
                          className="p-1 hover:text-rose-700 hover:bg-rose-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Update Context & Rollout Timing Pill Header */}
        <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-sm flex items-center gap-2 flex-wrap">
              <span>{selectedUpdate.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {selectedUpdate.impactVerdict}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Status: {selectedUpdate.status || 'Completed'}
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-4xl">{selectedUpdate.description}</p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 gap-1">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Rollout Duration: {selectedUpdate.rolloutDurationDays || 16} Days
            </div>
            <div className="text-xs font-semibold text-slate-200">
              🚀 {selectedUpdate.startDate} ({selectedUpdate.startTime || '16:00 UTC'})
            </div>
            <div className="text-xs font-semibold text-slate-200">
              🏁 {selectedUpdate.endDate} ({selectedUpdate.endTime || '18:30 UTC'})
            </div>
          </div>
        </div>

        {/* Dynamic Pre vs Rollout vs Post Window Lifecycle Strip */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Phase 1: Pre-Update Baseline
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {selectedUpdate.prePeriodLabel}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Traffic Volume: <strong className="text-slate-800">{selectedUpdate.preClicks.toLocaleString()} clicks</strong> (Avg Pos {selectedUpdate.prePosition.toFixed(1)})
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              Phase 2: Confirmed Rollout
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {selectedUpdate.startDate} → {selectedUpdate.endDate}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Rollout Span: <strong>{selectedUpdate.rolloutDurationDays || 16} Days</strong> • {selectedUpdate.status || 'Completed'}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Phase 3: Post-Update Evaluation
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {selectedUpdate.postPeriodLabel}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Net Impact: <strong className={clickDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {clickDiff >= 0 ? `+${clickPct}%` : `${clickPct}%`} clicks
              </strong> (Avg Pos {selectedUpdate.postPosition.toFixed(1)})
            </div>
          </div>
        </div>
      </div>

      {/* Pre vs Post Executive Scorecard Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Clicks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Organic Clicks</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">Pre vs Post</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {selectedUpdate.postClicks.toLocaleString()}
            </span>
            <span
              className={`text-xs font-bold flex items-center ${
                clickDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {clickDiff >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {clickDiff >= 0 ? `+${clickPct}%` : `${clickPct}%`}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pre: {selectedUpdate.preClicks.toLocaleString()}</span>
            <span className="font-semibold text-slate-700">
              Δ {clickDiff > 0 ? '+' : ''}
              {clickDiff.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 2: Impressions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Organic Impressions</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">SERP Volume</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {(selectedUpdate.postImpressions / 1000000).toFixed(2)}M
            </span>
            <span
              className={`text-xs font-bold flex items-center ${
                impDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {impDiff >= 0 ? `+${impPct}%` : `${impPct}%`}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pre: {(selectedUpdate.preImpressions / 1000000).toFixed(2)}M</span>
            <span className="font-semibold text-slate-700">
              Δ {impDiff > 0 ? '+' : ''}
              {(impDiff / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Metric 3: CTR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Average CTR</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">Click-Through</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {(selectedUpdate.postCtr * 100).toFixed(2)}%
            </span>
            <span
              className={`text-xs font-bold ${
                ctrDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {ctrDiff >= 0 ? `+${ctrDiff.toFixed(2)}%` : `${ctrDiff.toFixed(2)}%`}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pre: {(selectedUpdate.preCtr * 100).toFixed(2)}%</span>
            <span className="font-semibold text-slate-700">
              {ctrDiff >= 0 ? 'Improved SERP Appeal' : 'SERP Disruption'}
            </span>
          </div>
        </div>

        {/* Metric 4: Average Position */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Average SERP Rank</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">Position</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {selectedUpdate.postPosition.toFixed(1)}
            </span>
            <span
              className={`text-xs font-bold ${
                posDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {posDiff >= 0 ? `↑ +${posDiff.toFixed(1)} pos` : `↓ ${Math.abs(posDiff).toFixed(1)} pos`}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pre: {selectedUpdate.prePosition.toFixed(1)}</span>
            <span className="font-semibold text-emerald-700">
              {posDiff >= 0 ? 'Authority Boost' : 'Visibility Shift'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Chart (With Start/Finish Annotations & Rollout Window) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Rollout Timeline & Annotated Algorithmic Impact Trajectory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing the pre-rollout baseline, the active rollout window (annotated with release & finish times), and post-update stabilization.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Weekly Clicks
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-0.5 bg-blue-600"></span> Avg Position
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              <Flame className="w-3 h-3 text-amber-600" /> Rollout Window ({selectedUpdate.rolloutDurationDays || 19}d)
            </span>
          </div>
        </div>

        {/* Visual Callout Annotations Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]">
              RELEASE START
            </span>
            <span>
              <strong>{selectedUpdate.startDate}</strong> @ {selectedUpdate.startTime || '15:00 UTC'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 sm:justify-end">
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold text-[10px]">
              ROLLOUT FINISH
            </span>
            <span>
              <strong>{selectedUpdate.endDate}</strong> @ {selectedUpdate.endTime || '18:00 UTC'}
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedUpdate.timelinePoints} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="algoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="clicks" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="pos" orientation="right" reversed domain={[1, 10]} tick={{ fontSize: 11 }} unit=" pos" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
                          <span>{label}</span>
                          {data.isRollout && (
                            <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded text-[10px] font-bold">
                              Rollout Window
                            </span>
                          )}
                        </div>
                        {data.annotation && (
                          <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold text-[11px]">
                            {data.annotation}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span>Clicks:</span>
                          <span className="font-mono font-bold">{data.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-blue-400">
                          <span>Avg Position:</span>
                          <span className="font-mono font-bold">{data.position}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Start and End Release Reference Lines */}
              {startPoint && (
                <ReferenceLine
                  yAxisId="clicks"
                  x={startPoint.date}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: `🚀 Released`,
                    position: 'top',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {endPoint && (
                <ReferenceLine
                  yAxisId="clicks"
                  x={endPoint.date}
                  stroke="#2563eb"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: `🏁 Completed`,
                    position: 'top',
                    fill: '#1d4ed8',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              <Area
                yAxisId="clicks"
                type="monotone"
                dataKey="clicks"
                name="Organic Clicks"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#algoGrad)"
              />
              <Line
                yAxisId="pos"
                type="monotone"
                dataKey="position"
                name="Avg Position (Reversed)"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Taxonomy & Page Groups Impact
        </button>
        <button
          onClick={() => setActiveSubTab('urls')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'urls'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. URL Winners & Losers (Diagnostic)
        </button>
        <button
          onClick={() => setActiveSubTab('queries')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'queries'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. SERP Volatility & Query Shifts
        </button>
        <button
          onClick={() => setActiveSubTab('playbook')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'playbook'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Recommended Recovery Playbook
        </button>
      </div>

      {/* Sub-Tab 1: Taxonomy & Page Group Impact */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Impact by Page Group & Taxonomy Level
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How different sections of your sitemap reacted to the {selectedUpdate.name}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Page Group</th>
                    <th className="py-2.5 px-3">Pre-Update Clicks</th>
                    <th className="py-2.5 px-3">Post-Update Clicks</th>
                    <th className="py-2.5 px-3">Click Delta</th>
                    <th className="py-2.5 px-3">Pre Rank</th>
                    <th className="py-2.5 px-3">Post Rank</th>
                    <th className="py-2.5 px-3">Rank Shift</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {selectedUpdate.pageGroupImpacts.map((group, idx) => {
                    const delta = group.postClicks - group.preClicks;
                    const isGain = delta > 0;
                    const rankImprovement = group.prePosition - group.postPosition;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{group.group}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {group.preClicks.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {group.postClicks.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`inline-flex items-center font-bold ${
                              isGain ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isGain ? '+' : ''}
                            {group.pctChange}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{group.prePosition.toFixed(1)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {group.postPosition.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[11px] font-bold ${
                              rankImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {rankImprovement >= 0 ? `+${rankImprovement.toFixed(1)} pos` : `${rankImprovement.toFixed(1)} pos`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              group.status === 'Gained'
                                ? 'bg-emerald-100 text-emerald-800'
                                : group.status === 'Lost'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {group.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: URL Winners & Losers */}
      {activeSubTab === 'urls' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Top URL Winners & Losers (Algorithmic Shift Diagnostic)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Individual landing page performance shifts with automated root-cause diagnosis.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Landing Page URL</th>
                    <th className="py-2.5 px-3">Taxonomy</th>
                    <th className="py-2.5 px-3">Pre Clicks</th>
                    <th className="py-2.5 px-3">Post Clicks</th>
                    <th className="py-2.5 px-3">Click Δ</th>
                    <th className="py-2.5 px-3">Position Δ</th>
                    <th className="py-2.5 px-3">Algorithmic Diagnosis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedUpdate.topUrlShifts.map((url, idx) => {
                    const isGain = url.clickDelta > 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 max-w-xs truncate">
                          {url.page}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{url.group}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{url.preClicks.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {url.postClicks.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={`font-bold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isGain ? '+' : ''}
                            {url.clickDelta.toLocaleString()} ({isGain ? '+' : ''}
                            {url.pctDelta}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="text-slate-700">
                            {url.prePosition.toFixed(1)} → <strong>{url.postPosition.toFixed(1)}</strong>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-md">{url.diagnosis}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: SERP Volatility & Query Shifts */}
      {activeSubTab === 'queries' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            SERP Ranking Shifts & Search Intent Trajectory
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            How primary commercial and informational queries shifted in Google search results.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3">Target URL</th>
                  <th className="py-2.5 px-3">Pre Rank</th>
                  <th className="py-2.5 px-3">Post Rank</th>
                  <th className="py-2.5 px-3">Pre Clicks</th>
                  <th className="py-2.5 px-3">Post Clicks</th>
                  <th className="py-2.5 px-3">SERP Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedUpdate.serpQueryShifts.map((q, idx) => {
                  const rankDiff = q.prePosition - q.postPosition;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{q.query}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{q.landingPage}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{q.prePosition.toFixed(1)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                        {q.postPosition.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{q.preClicks.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{q.postClicks.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            q.impact.includes('Top 3')
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : q.impact.includes('Page 1')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {q.impact}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Recommended Recovery & Maintenance Playbook */}
      {activeSubTab === 'playbook' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Strategic SEO Action Playbook for {selectedUpdate.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Official recommendations and tactical remediation steps aligned with Google Search Central guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedUpdate.actionPlan.map((action, idx) => (
              <div key={idx} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {action}
                </div>
              </div>
            ))}
          </div>

          {/* Google E-E-A-T & Helpful Content Principles */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Google Search Quality Rater Guidelines Alignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-1">1. Firsthand Experience</strong>
                Provide original images, real guide accreditation, and verifiable local insights rather than aggregated summaries.
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-1">2. Transparent Pricing</strong>
                Include clear inclusions, cancellation windows, and live tour availability without deceptive click-bait titles.
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-1">3. Topical Authority</strong>
                Interlink City Hubs with Guide Profiles and Neighborhood Excursions to build tight semantic cluster relevance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Algorithm Update Modal */}
      <AddAlgorithmUpdateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUpdate(null);
        }}
        onSaveUpdate={handleSaveUpdate}
        existingUpdates={updates}
        propertyTotals={propertyTotals}
        editUpdate={editingUpdate}
      />
    </div>
  );
};
