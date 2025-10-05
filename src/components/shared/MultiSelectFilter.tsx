/**
 * Multi-Select Filter Component
 *
 * Reusable component for multi-select filtering with checkboxes.
 * Used for audits, business units, standards, risk types, etc.
 */

import { useState } from 'react';

interface MultiSelectFilterProps {
  title: string;
  options: Array<{ id: string; label: string; count?: number }>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function MultiSelectFilter({
  title,
  options,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  collapsible = true,
  defaultExpanded = false
}: MultiSelectFilterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const allSelected = options.length > 0 && selectedIds.size === options.length;

  return (
    <div className="border-b border-av-border last:border-b-0">
      {/* Header */}
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-av-panel-dark transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-300">{title}</span>
          {selectedIds.size > 0 && (
            <span className="text-xs bg-av-primary/20 text-av-primary px-2 py-0.5 rounded">
              {selectedIds.size}
            </span>
          )}
        </div>
        {collapsible && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="px-3 pb-3 space-y-2">
          {/* Select All / Clear All */}
          {options.length > 1 && (
            <div className="flex items-center space-x-2 pb-2 border-b border-av-border">
              <button
                onClick={onSelectAll}
                disabled={allSelected}
                className="text-xs text-av-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={onClearAll}
                disabled={selectedIds.size === 0}
                className="text-xs text-gray-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Options List */}
          {options.length === 0 ? (
            <div className="text-xs text-gray-600 italic py-2">
              No options available
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {options.map(option => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 p-1.5 rounded hover:bg-av-panel-dark cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(option.id)}
                    onChange={() => onToggle(option.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-av-primary focus:ring-av-primary focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white flex-1">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-600">
                      {option.count}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
