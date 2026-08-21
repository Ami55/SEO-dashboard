import React, { useState } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  ShieldAlert,
  Sparkles,
  Layers,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { GoogleAlgorithmUpdateEvent, PropertyTotals } from '../types';
import { calculatePrePostAlgoImpact } from '../services/algoSyncService';

interface AddAlgorithmUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUpdate: (newEvent: GoogleAlgorithmUpdateEvent) => void;
  existingUpdates: GoogleAlgorithmUpdateEvent[];
  propertyTotals?: PropertyTotals;
  editUpdate?: GoogleAlgorithmUpdateEvent | null;
}

export const AddAlgorithmUpdateModal: React.FC<AddAlgorithmUpdateModalProps> = ({
  isOpen,
  onClose,
  onSaveUpdate,
  existingUpdates,
  propertyTotals,
  editUpdate,
}) => {
  const [name, setName] = useState(editUpdate?.name || '');
  const [updateType, setUpdateType] = useState<GoogleAlgorithmUpdateEvent['updateType']>(
    editUpdate?.updateType || 'Core Update'
  );
  const [startDate, setStartDate] = useState(editUpdate?.startDate || '2024-12-12');
  const [startTime, setStartTime] = useState(editUpdate?.startTime || '15:00 UTC');
  const [endDate, setEndDate] = useState(editUpdate?.endDate || '2024-12-28');
  const [endTime, setEndTime] = useState(editUpdate?.endTime || '18:00 UTC');
  const [status, setStatus] = useState<GoogleAlgorithmUpdateEvent['status']>(
    editUpdate?.status || 'Completed'
  );
  const [description, setDescription] = useState(
    editUpdate?.description ||
      'Official Google algorithmic adjustment targeting search quality, authentic firsthand expertise, and penalizing scaled thin content.'
  );
  const [primaryFocus, setPrimaryFocus] = useState(
    editUpdate?.primaryFocus ||
      'Elevating verified entity authority, firsthand reviews, and genuine brand signals over unoriginal aggregator directories.'
  );
  const [impactVerdict, setImpactVerdict] = useState<GoogleAlgorithmUpdateEvent['impactVerdict']>(
    editUpdate?.impactVerdict || 'Positive Gain'
  );

  // Metrics
  const [preClicks, setPreClicks] = useState<number>(editUpdate?.preClicks || 550000);
  const [postClicks, setPostClicks] = useState<number>(editUpdate?.postClicks || 610000);
  const [preImpressions, setPreImpressions] = useState<number>(editUpdate?.preImpressions || 22000000);
  const [postImpressions, setPostImpressions] = useState<number>(editUpdate?.postImpressions || 24500000);
  const [preCtr, setPreCtr] = useState<number>(editUpdate?.preCtr || 0.025);
  const [postCtr, setPostCtr] = useState<number>(editUpdate?.postCtr || 0.026);
  const [prePosition, setPrePosition] = useState<number>(editUpdate?.prePosition || 5.8);
  const [postPosition, setPostPosition] = useState<number>(editUpdate?.postPosition || 5.0);

  // Tactical Actions
  const [action1, setAction1] = useState(
    editUpdate?.actionPlan?.[0] || 'Audit key commercial landing pages for comprehensive author credentials and licensing disclosures.'
  );
  const [action2, setAction2] = useState(
    editUpdate?.actionPlan?.[1] || 'Enforce original high-resolution photography and structured LocalBusiness entity schema.'
  );
  const [action3, setAction3] = useState(
    editUpdate?.actionPlan?.[2] || 'Monitor Google Search Console query bracket volatility for high-value transactional queries.'
  );

  if (!isOpen) return null;

  // Calculate duration in days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.abs(endD.getTime() - startD.getTime());
  const rolloutDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Auto-generate timeline points with release and finish annotations
  const generateTimeline = () => {
    const points: GoogleAlgorithmUpdateEvent['timelinePoints'] = [];
    const baseDate = new Date(startD);
    baseDate.setDate(baseDate.getDate() - 21); // 3 weeks before

    const totalSteps = 9;
    const stepDays = Math.max(4, Math.round((rolloutDays + 35) / totalSteps));

    for (let i = 0; i < totalSteps; i++) {
      const curDate = new Date(baseDate);
      curDate.setDate(baseDate.getDate() + i * stepDays);

      const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const curTime = curDate.getTime();
      const isRollout = curTime >= startD.getTime() && curTime <= endD.getTime() + 86400000;
      
      const isStartRelease = Math.abs(curTime - startD.getTime()) < 86400000 * 2;
      const isEndRelease = Math.abs(curTime - endD.getTime()) < 86400000 * 2;

      // Click progression
      const progress = i / (totalSteps - 1);
      const clickVal = Math.round(
        (preClicks / 28) + ((postClicks - preClicks) / 28) * progress * 0.9 + (Math.random() * 400 - 200)
      );
      const posVal = Number(
        (prePosition - (prePosition - postPosition) * progress + (Math.random() * 0.2 - 0.1)).toFixed(1)
      );

      let annotation: string | undefined = undefined;
      if (isStartRelease) {
        annotation = `🚀 Released: ${dateStr} (${startTime})`;
      } else if (isEndRelease) {
        annotation = `🏁 Completed: ${dateStr} (${endTime})`;
      }

      points.push({
        date: dateStr,
        clicks: Math.max(1000, clickVal),
        position: Math.max(1, posVal),
        isRollout,
        isStartRelease,
        isEndRelease,
        annotation,
      });
    }

    return points;
  };

  const handleFillFromGscTotals = () => {
    if (propertyTotals) {
      setPreClicks(propertyTotals.prevClicks || propertyTotals.previousClicks || 500000);
      setPostClicks(propertyTotals.currentClicks || 580000);
      setPreImpressions(propertyTotals.prevImpressions || propertyTotals.previousImpressions || 20000000);
      setPostImpressions(propertyTotals.currentImpressions || 23000000);
      setPreCtr(propertyTotals.prevCtr || 0.024);
      setPostCtr(propertyTotals.currentCtr || 0.025);
      setPrePosition(propertyTotals.prevPosition || 5.8);
      setPostPosition(propertyTotals.currentPosition || 5.1);
    }
  };

  const handleAutoCalculateFromDates = () => {
    const calc = calculatePrePostAlgoImpact({
      startDate,
      endDate,
      name: name || 'Google Algorithm Update',
      updateType,
      status,
      startTime,
      endTime,
      description,
      primaryFocus,
    });

    setPreClicks(calc.preClicks);
    setPostClicks(calc.postClicks);
    setPreImpressions(calc.preImpressions);
    setPostImpressions(calc.postImpressions);
    setPreCtr(calc.preCtr);
    setPostCtr(calc.postCtr);
    setPrePosition(calc.prePosition);
    setPostPosition(calc.postPosition);
    setImpactVerdict(calc.impactVerdict);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId =
      editUpdate?.id ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `algo-${Date.now()}`;

    const clickDiff = postClicks - preClicks;
    const overallScore = Number(((clickDiff / preClicks) * 100).toFixed(1));

    const preStart = new Date(startD);
    preStart.setDate(preStart.getDate() - 28);
    const preEnd = new Date(startD);
    preEnd.setDate(preEnd.getDate() - 1);

    const postStart = new Date(endD);
    postStart.setDate(postStart.getDate() + 1);
    const postEnd = new Date(endD);
    postEnd.setDate(postEnd.getDate() + 28);

    const formatRange = (d1: Date, d2: Date) =>
      `${d1.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} – ${d2.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;

    const newEvent: GoogleAlgorithmUpdateEvent = {
      id: cleanId,
      name,
      updateType,
      startDate,
      endDate,
      startTime,
      endTime,
      status,
      rolloutDurationDays: rolloutDays,
      isCustom: true,
      prePeriodLabel: `Pre-Update (${formatRange(preStart, preEnd)})`,
      postPeriodLabel: `Post-Update (${formatRange(postStart, postEnd)})`,
      description,
      primaryFocus,
      impactVerdict,
      overallScore,
      preClicks,
      postClicks,
      preImpressions,
      postImpressions,
      preCtr,
      postCtr,
      prePosition,
      postPosition,
      pageGroupImpacts: editUpdate?.pageGroupImpacts || [
        {
          group: 'City or Area Pages',
          preClicks: Math.round(preClicks * 0.38),
          postClicks: Math.round(postClicks * 0.40),
          pctChange: Number((((postClicks * 0.40 - preClicks * 0.38) / (preClicks * 0.38)) * 100).toFixed(1)),
          prePosition: Number((prePosition - 1.0).toFixed(1)),
          postPosition: Number((postPosition - 1.0).toFixed(1)),
          status: postClicks >= preClicks ? 'Gained' : 'Lost',
        },
        {
          group: 'Tour Detail Pages',
          preClicks: Math.round(preClicks * 0.26),
          postClicks: Math.round(postClicks * 0.27),
          pctChange: Number((((postClicks * 0.27 - preClicks * 0.26) / (preClicks * 0.26)) * 100).toFixed(1)),
          prePosition: Number((prePosition - 0.2).toFixed(1)),
          postPosition: Number((postPosition - 0.2).toFixed(1)),
          status: postClicks >= preClicks ? 'Gained' : 'Lost',
        },
        {
          group: 'Tour Guides / Profiles',
          preClicks: Math.round(preClicks * 0.06),
          postClicks: Math.round(postClicks * 0.075),
          pctChange: Number((((postClicks * 0.075 - preClicks * 0.06) / (preClicks * 0.06)) * 100).toFixed(1)),
          prePosition: Number((prePosition + 1.2).toFixed(1)),
          postPosition: Number((postPosition + 0.3).toFixed(1)),
          status: 'Gained',
        },
        {
          group: 'Blog & Editorial Articles',
          preClicks: Math.round(preClicks * 0.18),
          postClicks: Math.round(postClicks * 0.17),
          pctChange: Number((((postClicks * 0.17 - preClicks * 0.18) / (preClicks * 0.18)) * 100).toFixed(1)),
          prePosition: Number((prePosition + 1.5).toFixed(1)),
          postPosition: Number((postPosition + 1.6).toFixed(1)),
          status: 'Stable',
        },
      ],
      topUrlShifts: editUpdate?.topUrlShifts || [
        {
          page: '/Rome-Tours',
          group: 'City or Area Pages',
          preClicks: Math.round(preClicks * 0.12),
          postClicks: Math.round(postClicks * 0.13),
          clickDelta: Math.round(postClicks * 0.13 - preClicks * 0.12),
          pctDelta: 15.4,
          prePosition: 3.8,
          postPosition: 2.8,
          diagnosis: 'Strong local author licensing and verified review signals lifted ranking above aggregator domains.',
        },
        {
          page: '/Tokyo-Tours',
          group: 'City or Area Pages',
          preClicks: Math.round(preClicks * 0.09),
          postClicks: Math.round(postClicks * 0.10),
          clickDelta: Math.round(postClicks * 0.10 - preClicks * 0.09),
          pctDelta: 14.2,
          prePosition: 4.1,
          postPosition: 3.2,
          diagnosis: 'High engagement time and original itinerary guides favored under the new quality threshold.',
        },
      ],
      serpQueryShifts: editUpdate?.serpQueryShifts || [
        {
          query: 'private licensed city tours with guide',
          prePosition: 4.8,
          postPosition: 2.3,
          positionDelta: 2.5,
          preClicks: 9400,
          postClicks: 14800,
          landingPage: '/Rome-Tours',
          impact: 'Jumped to Top 3',
        },
      ],
      actionPlan: [action1, action2, action3].filter(Boolean),
      timelinePoints: generateTimeline(),
    };

    onSaveUpdate(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                {editUpdate ? 'Edit Algorithm Update Event' : 'Add Future / Custom Google Algorithm Update'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Timeline & Annotation Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Define the rollout schedule, exact release/completion timestamps, and baseline impact windows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Top Row: Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Algorithm Update Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google December 2024 Core Update"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Update Category / Classification
              </label>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="Core Update">Core Update</option>
                <option value="Spam Update">Spam Update</option>
                <option value="Helpful Content Update">Helpful Content Update (HCU)</option>
                <option value="Reviews Update">Reviews Update</option>
                <option value="AI Overviews Update">AI Overviews / SERP Layout Update</option>
                <option value="Unconfirmed Volatility">Unconfirmed SERP Volatility</option>
                <option value="Custom Update">Custom Brand / Domain Rollout</option>
              </select>
            </div>
          </div>

          {/* Timestamps & Rollout Dates Section */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Rollout Timeline & Exact Time Annotations</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Calculated Rollout: <strong>{rolloutDays} days</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Start Release Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Release Time (UTC)
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 15:00 UTC"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rollout Finish Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Finish Time (UTC)
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="e.g. 18:30 UTC"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rollout Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Completed">Completed (Full Rollout)</option>
                  <option value="In Progress">In Progress (Actively Rolling Out)</option>
                  <option value="Scheduled">Scheduled / Announced by Google</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Impact Verdict
                </label>
                <select
                  value={impactVerdict}
                  onChange={(e) => setImpactVerdict(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Positive Gain">Positive Gain (Authority & CTR Jump)</option>
                  <option value="Moderate Gain">Moderate Gain (Rankings Stable+)</option>
                  <option value="Neutral / Stable">Neutral / Stable (Minimal Volatility)</option>
                  <option value="Moderate Decline">Moderate Decline (Investigate SERPs)</option>
                  <option value="Severe Impact">Severe Impact (Immediate Action Required)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description and Focus */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Google Description / Summary
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of what Google Search Central announced regarding this update..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Algorithmic Focus & Target Signals
              </label>
              <input
                type="text"
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value)}
                placeholder="e.g. E-E-A-T, firsthand reviews, reducing scraper directory spam..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Performance Comparison Numbers */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Pre-Rollout vs. Post-Rollout Search Console Metrics</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAutoCalculateFromDates}
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md shadow-xs transition-colors cursor-pointer"
                  title="Automatically calculate pre and post baseline metrics based on the release and finish dates"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  Auto-Calculate from Dates
                </button>

                {propertyTotals && (
                  <button
                    type="button"
                    onClick={handleFillFromGscTotals}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Fill GSC totals
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pre Clicks</label>
                <input
                  type="number"
                  value={preClicks}
                  onChange={(e) => setPreClicks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Post Clicks</label>
                <input
                  type="number"
                  value={postClicks}
                  onChange={(e) => setPostClicks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pre Impressions</label>
                <input
                  type="number"
                  value={preImpressions}
                  onChange={(e) => setPreImpressions(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Post Impressions</label>
                <input
                  type="number"
                  value={postImpressions}
                  onChange={(e) => setPostImpressions(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pre CTR</label>
                <input
                  type="number"
                  step="0.0001"
                  value={preCtr}
                  onChange={(e) => setPreCtr(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Post CTR</label>
                <input
                  type="number"
                  step="0.0001"
                  value={postCtr}
                  onChange={(e) => setPostCtr(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pre Avg Position</label>
                <input
                  type="number"
                  step="0.1"
                  value={prePosition}
                  onChange={(e) => setPrePosition(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Post Avg Position</label>
                <input
                  type="number"
                  step="0.1"
                  value={postPosition}
                  onChange={(e) => setPostPosition(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Playbook */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tactical Remediation & Action Playbook
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={action1}
                onChange={(e) => setAction1(e.target.value)}
                placeholder="Action item 1..."
                className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={action2}
                onChange={(e) => setAction2(e.target.value)}
                placeholder="Action item 2..."
                className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={action3}
                onChange={(e) => setAction3(e.target.value)}
                placeholder="Action item 3..."
                className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editUpdate ? 'Save Changes' : 'Add Algorithm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
