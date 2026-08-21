/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Plus, Check, X, Tag, FolderPlus, HelpCircle } from 'lucide-react';
import { ClassificationRule, PagePerformance } from '../types';

interface CategoryWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PagePerformance[];
  existingRules: ClassificationRule[];
  onAddRule: (rule: Omit<ClassificationRule, 'id'>) => void;
}

export default function CategoryWizardModal({
  isOpen,
  onClose,
  pages,
  existingRules,
  onAddRule,
}: CategoryWizardModalProps) {
  const [field, setField] = useState<'category' | 'city' | 'page_type' | 'hub'>('category');
  const [pattern, setPattern] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'starts_with' | 'ends_with' | 'regex'>('contains');
  const [addedCount, setAddedCount] = useState(0);

  if (!isOpen) return null;

  // Extract common URL segments to suggest categories automatically
  const getSuggestions = () => {
    const segments: Record<string, number> = {};

    pages.forEach((p) => {
      try {
        const url = new URL(p.page.startsWith('http') ? p.page : `https://example.com${p.page}`);
        const parts = url.pathname.split('/').filter((x) => x.length > 2);

        parts.forEach((part) => {
          // clean numbers or queries
          const clean = part.replace(/\d+/g, '').replace(/[-_]/g, ' ').trim();
          if (clean.length > 2) {
            segments[part] = (segments[part] || 0) + 1;
          }
        });
      } catch (e) {
        // fallback simple split
        const parts = p.page.split('/').filter((x) => x.length > 2);
        parts.forEach((part) => {
          segments[part] = (segments[part] || 0) + 1;
        });
      }
    });

    // Return top 8 most frequent segments not already in rules
    return Object.entries(segments)
      .filter(([slug]) => !existingRules.some((r) => r.pattern.includes(slug)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const suggestions = getSuggestions();

  const handleApplySuggestion = (slug: string) => {
    const formatted = slug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    setPattern(slug);
    setTargetValue(formatted);
    setMatchType('contains');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() || !targetValue.trim()) return;

    onAddRule({
      field,
      matchType,
      pattern: pattern.trim(),
      targetValue: targetValue.trim(),
    });

    setPattern('');
    setTargetValue('');
    setAddedCount((c) => c + 1);
  };

  const presetCategories = [
    { name: 'Food Tours', pattern: 'food-tour', field: 'category' as const },
    { name: 'Wine & Tasting', pattern: 'wine', field: 'category' as const },
    { name: 'Cooking Classes', pattern: 'cooking', field: 'category' as const },
    { name: 'Bakery & Sweets', pattern: 'pastry', field: 'category' as const },
    { name: 'Street Food & Markets', pattern: 'market', field: 'category' as const },
    { name: 'History & Walking', pattern: 'history', field: 'category' as const },
    { name: 'Editorial Guides', pattern: '/guide/', field: 'page_type' as const },
    { name: 'Tour Bookings', pattern: '/tour/', field: 'page_type' as const },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Categorize Pages & URL Segments
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Create dynamic categorization rules to segment your URLs by Category, City, Page Type, or Hub.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Preset Suggestions */}
        <div className="mb-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/70">
          <span className="text-xs font-bold text-indigo-900 block mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            Quick Presets & Detected URL Slugs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetCategories.map((p, idx) => (
              <button
                key={`preset-${idx}`}
                type="button"
                onClick={() => {
                  setField(p.field);
                  setPattern(p.pattern);
                  setTargetValue(p.name);
                }}
                className="px-2.5 py-1 text-xs bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition-colors font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                + {p.name}
              </button>
            ))}

            {suggestions.map(([slug, count]) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleApplySuggestion(slug)}
                className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                title={`Appears in ${count} URLs`}
              >
                + /{slug}/ ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Categorization Rule Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Classification Dimension
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-100"
              >
                <option value="category">Category (e.g. Food Tours, Wine Tasting)</option>
                <option value="city">City (e.g. Paris, London, Tokyo)</option>
                <option value="page_type">Page Type (e.g. Editorial Guide, Tour Booking)</option>
                <option value="hub">Hub Group (e.g. Paris Hub, London Hub)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Match Condition
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-100"
              >
                <option value="contains">URL contains text</option>
                <option value="starts_with">URL starts with</option>
                <option value="ends_with">URL ends with</option>
                <option value="regex">Regular Expression (Regex)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Pattern / Substring
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. /cooking/ or food-tour"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Category / Label Name
              </label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. Cooking Classes"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
            <span className="text-xs text-emerald-600 font-semibold">
              {addedCount > 0 && `✓ ${addedCount} rule(s) added!`}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add & Apply Category Rule
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
