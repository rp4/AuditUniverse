/**
 * Header Component
 *
 * Top bar containing:
 * - Preset views dropdown
 * - 4 filters (Audits, Business Units, Standards, Risk Type)
 * - Stats (Total Audits, Total Risks, Coverage)
 */

import { useMemo, useState } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { PresetFilter } from '@/components/filters/PresetFilter';
import type { GraphData } from '@/types';

interface HeaderProps {
  rawData: GraphData;
  filteredData: GraphData;
}

interface FilterOption {
  id: string;
  label: string;
}

export function Header({ rawData, filteredData }: HeaderProps) {
  const {
    selectedAudits,
    addSelectedAudit,
    removeSelectedAudit,
    selectedUnits,
    addSelectedUnit,
    removeSelectedUnit,
    selectedStandards,
    addSelectedStandard,
    removeSelectedStandard,
    selectedRiskTypes,
    addSelectedRiskType,
    removeSelectedRiskType
  } = useGraphStore();

  // Extract unique audits
  const auditOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'audit')
      .map(n => ({ id: n.id, label: n.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique business units
  const unitOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'businessUnit')
      .map(n => ({ id: n.id, label: n.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique standards
  const standardOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'standard')
      .map(n => ({ id: n.id, label: n.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique risk types
  const riskTypeOptions = useMemo(() => {
    const categories = new Map<string, number>();
    rawData.nodes
      .filter(n => n.type === 'risk')
      .forEach(n => {
        const category = (n as any).category || 'unknown';
        categories.set(category, (categories.get(category) || 0) + 1);
      });

    return Array.from(categories.entries())
      .map(([category]) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Calculate stats
  const totalAudits = rawData.nodes.filter(n => n.type === 'audit').length;
  const totalRisks = rawData.nodes.filter(n => n.type === 'risk').length;

  const auditedRiskIds = new Set<string>();
  rawData.links.forEach(link => {
    if (link.type === 'assessed_by') {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      auditedRiskIds.add(targetId);
    }
  });

  const coverage = totalRisks > 0 ? ((auditedRiskIds.size / totalRisks) * 100).toFixed(0) : '0';

  return (
    <div className="bg-gray-900/95 border-b border-av-border/50 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Preset Views Dropdown */}
        <div className="w-56">
          <div className="text-[10px] uppercase tracking-wider text-av-primary font-bold mb-1">
            Preset Views:
          </div>
          <PresetFilter />
        </div>

        {/* Center: 4 Multi-Select Filters */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <MultiSelectDropdown
            title="AUDITS:"
            options={auditOptions}
            selectedIds={selectedAudits}
            onToggle={(id) => {
              if (selectedAudits.has(id)) {
                removeSelectedAudit(id);
              } else {
                addSelectedAudit(id);
              }
            }}
          />

          <MultiSelectDropdown
            title="BUSINESS UNITS:"
            options={unitOptions}
            selectedIds={selectedUnits}
            onToggle={(id) => {
              if (selectedUnits.has(id)) {
                removeSelectedUnit(id);
              } else {
                addSelectedUnit(id);
              }
            }}
          />

          <MultiSelectDropdown
            title="STANDARDS:"
            options={standardOptions}
            selectedIds={selectedStandards}
            onToggle={(id) => {
              if (selectedStandards.has(id)) {
                removeSelectedStandard(id);
              } else {
                addSelectedStandard(id);
              }
            }}
          />

          <MultiSelectDropdown
            title="RISK TYPE:"
            options={riskTypeOptions}
            selectedIds={selectedRiskTypes}
            onToggle={(id) => {
              if (selectedRiskTypes.has(id)) {
                removeSelectedRiskType(id);
              } else {
                addSelectedRiskType(id);
              }
            }}
          />
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          <StatBox label="TOTAL AUDITS" value={totalAudits} color="text-av-primary" />
          <StatBox label="TOTAL RISKS" value={totalRisks} color="text-av-primary" />
          <StatBox label="COVERAGE" value={`${coverage}%`} color="text-av-success" />
        </div>
      </div>
    </div>
  );
}

// Multi-select dropdown component
interface MultiSelectDropdownProps {
  title: string;
  options: FilterOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

function MultiSelectDropdown({ title, options, selectedIds, onToggle }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayText = selectedIds.size === 0
    ? 'All selected'
    : selectedIds.size === options.length
    ? 'All selected'
    : `${selectedIds.size} selected`;

  return (
    <div className="relative">
      <div className="text-[10px] uppercase tracking-wider text-av-primary font-bold mb-1">
        {title}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/40 border border-av-primary/30 rounded px-3 py-1.5 text-sm text-gray-300 hover:border-av-primary/60 transition-colors min-w-[140px] flex items-center justify-between"
      >
        <span>{displayText}</span>
        <svg
          className={`w-3 h-3 ml-2 text-av-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 glass-panel border border-av-primary/30 rounded max-h-64 overflow-y-auto z-50 min-w-[200px]">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500">No options</div>
            ) : (
              options.map(option => (
                <label
                  key={option.id}
                  className="flex items-center px-3 py-2 hover:bg-av-primary/10 cursor-pointer border-b border-av-border/20 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(option.id)}
                    onChange={() => onToggle(option.id)}
                    className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-av-primary focus:ring-av-primary focus:ring-offset-0 mr-2"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Stat box component
interface StatBoxProps {
  label: string;
  value: string | number;
  color: string;
}

function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <div className="bg-black/40 border border-av-border/30 rounded px-4 py-2 min-w-[100px] text-center">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </div>
      <div className={`text-xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}
