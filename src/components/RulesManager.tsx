/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { ClassificationRule, PagePerformance } from '../types';

interface RulesManagerProps {
  rules: ClassificationRule[];
  pages: PagePerformance[];
  onAddRule: (rule: Omit<ClassificationRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  onResetRules: () => void;
}

export default function RulesManager({
  rules,
  pages,
  onAddRule,
  onDeleteRule,
  onResetRules,
}: RulesManagerProps) {
  // Local state for the rule creation form
  const [field, setField] = useState<ClassificationRule['field']>('city');
  const [matchType, setMatchType] = useState<ClassificationRule['matchType']>('contains');
  const [pattern, setPattern] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedPattern = pattern.trim();
    const trimmedValue = targetValue.trim();

    if (!trimmedPattern) {
      setValidationError("Pattern cannot be empty.");
      return;
    }
    if (!trimmedValue) {
      setValidationError("Target assigned value cannot be empty.");
      return;
    }

    if (matchType === 'regex') {
      try {
        new RegExp(trimmedPattern);
      } catch (err) {
        setValidationError("Invalid regular expression syntax.");
        return;
      }
    }

    onAddRule({
      field,
      matchType,
      pattern: trimmedPattern,
      targetValue: trimmedValue,
    });

    // Reset inputs
    setPattern('');
    setTargetValue('');
  };

  // Helper function to count matches among the unique pages in GSC data
  const countMatches = (rule: ClassificationRule) => {
    const uniquePages = Array.from(new Set(pages.map(p => p.page)));
    let count = 0;

    uniquePages.forEach(url => {
      const p = rule.pattern.toLowerCase();
      const u = url.toLowerCase();
      let match = false;

      try {
        if (rule.matchType === 'contains' && u.includes(p)) match = true;
        else if (rule.matchType === 'starts_with' && u.startsWith(p)) match = true;
        else if (rule.matchType === 'ends_with' && u.endsWith(p)) match = true;
        else if (rule.matchType === 'regex') {
          const regex = new RegExp(rule.pattern, 'i');
          match = regex.test(url);
        }
      } catch {
        match = false;
      }

      if (match) count++;
    });

    return count;
  };

  return (
    <div className="space-y-6" id="rules-manager-view">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">URL Classification Rules Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize rules to categorize GSC landing pages into segment folders in real-time.
            </p>
          </div>
          <button
            onClick={onResetRules}
            className="text-xs font-semibold px-3 py-1.5 border border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
          >
            Reset Default Tour Rules
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rule editor form */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-150 p-5 rounded-xl self-start">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Add Classification Rule
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-600">
              <div className="space-y-1">
                <label className="text-slate-500">Target Segment Tag</label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  <option value="city">City (e.g. Paris)</option>
                  <option value="category">Category (e.g. Food Tours)</option>
                  <option value="page_type">Page Type (e.g. Tour Page)</option>
                  <option value="hub">Hub Identifier (e.g. Paris Hub)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Matching Mode</label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  <option value="contains">URL Contains substring</option>
                  <option value="starts_with">URL Header path starts with</option>
                  <option value="ends_with">URL Segment ends with</option>
                  <option value="regex">Regular expression (Regex)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Match Expression Pattern</label>
                <input
                  type="text"
                  placeholder={matchType === 'regex' ? '(?i)/paris/' : '/paris/'}
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Set Resulting Tag Value</label>
                <input
                  type="text"
                  placeholder="Paris"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {validationError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] rounded flex gap-1.5 items-start">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Apply Rule Segment
              </button>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              Active Rules ({rules.length})
              <span className="text-xs font-normal text-slate-400">Rules evaluate from top-down</span>
            </h3>

            {rules.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-slate-250 rounded-xl text-slate-400">
                <p className="text-xs">No url class rules defined yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Add your rules or click "Reset Default Tour Rules" to evaluate Gourmet Walks.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                {rules.map((rule, idx) => {
                  const matchCount = countMatches(rule);
                  return (
                    <div
                      key={rule.id}
                      className="p-3.5 bg-white border border-slate-150 rounded-xl hover:shadow-sm hover:border-slate-200 transition-all flex justify-between items-center text-xs"
                    >
                      <div className="flex gap-3.5 items-center">
                        <span className="text-[10px] bg-slate-100 text-slate-500 p-1 px-1.5 font-bold rounded-lg font-mono">
                          #{idx + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700 shrink-0">
                              IF URL{' '}
                              <span className="text-indigo-600 uppercase font-bold text-[10px]">
                                {rule.matchType.replace('_', ' ')}
                              </span>
                            </span>
                            <code className="px-1.5 py-0.5 bg-indigo-50/50 text-indigo-800 border border-indigo-100 rounded font-code text-[11px]">
                              "{rule.pattern}"
                            </code>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">THEN Set </span>
                            <span className="font-bold text-slate-600 bg-slate-50 px-1 py-0.5 rounded border border-slate-100 text-[10px]">
                              {rule.field.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400 font-medium"> as </span>
                            <span className="font-bold text-emerald-700">"{rule.targetValue}"</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-1 px-2.5 rounded-full border border-slate-100 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {matchCount} {matchCount === 1 ? 'URL match' : 'URL matches'}
                        </span>
                        <button
                          onClick={() => onDeleteRule(rule.id)}
                          className="p-1.5 border border-slate-100 hover:border-rose-100 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete this rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
