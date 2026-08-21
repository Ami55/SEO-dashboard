/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Check, CheckSquare, Square, MinusSquare } from 'lucide-react';

export interface FilterOptionItem {
  id: string;
  label: string;
  metricValue: number;
  metricFormatted?: string;
  subLabel?: string;
}

interface FilterDropdownPanelProps {
  title: 'Page Group' | 'Page Level' | string;
  metricHeader: 'Url Clicks' | 'Impressions' | string;
  items: FilterOptionItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  searchBadge?: string;
  onClose?: () => void;
  className?: string;
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1);
    return (val.endsWith('.0') ? (num / 1_000_000).toFixed(0) : val) + 'M';
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(1);
    return (val.endsWith('.0') ? (num / 1_000).toFixed(0) : val) + 'K';
  }
  return num.toLocaleString();
}

export const FilterDropdownPanel: React.FC<FilterDropdownPanelProps> = ({
  title,
  metricHeader,
  items,
  selectedIds,
  onChange,
  searchBadge,
  onClose,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const allItemIds = useMemo(() => items.map((i) => i.id), [items]);
  const isAllSelected = selectedIds.length === 0 || selectedIds.length >= allItemIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allItemIds.length;

  const handleToggleAll = () => {
    if (isAllSelected && selectedIds.length > 0) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(allItemIds);
    }
  };

  const handleToggleItem = (id: string) => {
    if (selectedIds.length === 0) {
      // If currently all selected (empty array implies all), clicking one keeps all except that one
      const remaining = allItemIds.filter((item) => item !== id);
      onChange(remaining);
      return;
    }

    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((item) => item !== id);
      onChange(next);
    } else {
      const next = [...selectedIds, id];
      onChange(next);
    }
  };

  const handleSelectOnly = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange([id]);
  };

  const isChecked = (id: string) => {
    if (selectedIds.length === 0) return true; // Default all selected
    return selectedIds.includes(id);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-2xl border border-slate-200 w-72 sm:w-80 flex flex-col select-none text-slate-800 text-sm overflow-hidden z-50 animate-fadeIn ${className}`}
      id={`filter-panel-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={handleToggleAll}
          className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-blue-600 transition-colors focus:outline-none"
        >
          <div className="w-4 h-4 rounded flex items-center justify-center bg-blue-600 text-white shadow-xs">
            {isIndeterminate ? (
              <MinusSquare className="w-3.5 h-3.5 text-white" />
            ) : isAllSelected ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <span className="text-base tracking-tight">{title}</span>
        </button>

        <span className="text-sm font-bold text-slate-800 tracking-tight">
          {metricHeader}
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type to search"
          className="w-full pl-7 pr-3 py-1.5 bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {searchBadge && (
          <span className="absolute right-3 px-2 py-0.5 rounded bg-slate-600 text-white text-[11px] font-medium pointer-events-none">
            {searchBadge}
          </span>
        )}
      </div>

      {/* Scrollable Items List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            No matching items found
          </div>
        ) : (
          filteredItems.map((item) => {
            const checked = isChecked(item.id);
            const isHovered = hoveredItemId === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => handleToggleItem(item.id)}
                className={`flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 cursor-pointer transition-colors group ${
                  checked ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {/* Left: Checkbox + Label */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      checked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span className="text-xs sm:text-sm truncate font-medium">
                    {item.label}
                  </span>
                </div>

                {/* Right: ONLY button on hover OR Metric count */}
                <div className="flex items-center gap-2 shrink-0">
                  {isHovered ? (
                    <button
                      type="button"
                      onClick={(e) => handleSelectOnly(e, item.id)}
                      className="px-2.5 py-0.5 rounded bg-slate-200/90 hover:bg-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wide transition-colors"
                    >
                      ONLY
                    </button>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold font-mono text-slate-700">
                      {item.metricFormatted || formatCompactNumber(item.metricValue)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info / Selection Status */}
      <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {selectedIds.length === 0 || selectedIds.length === allItemIds.length
            ? `All ${items.length} selected`
            : `${selectedIds.length} of ${items.length} selected`}
        </span>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && selectedIds.length < allItemIds.length && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
