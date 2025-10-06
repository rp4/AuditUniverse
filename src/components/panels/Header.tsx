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

export function Header({ rawData }: HeaderProps) {
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
    <div className="relative metal-panel px-6 py-3" style={{
      borderBottom: '8px solid #4a4a4f',
      borderBottomStyle: 'groove',
      boxShadow: 'inset 0 -3px 10px rgba(0,0,0,0.8), inset 0 3px 10px rgba(80,80,80,0.3), 0 5px 15px rgba(0,0,0,0.6)'
    }}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Preset Views Dropdown */}
        <div className="w-56">
          <div className="text-sm uppercase tracking-widest font-bold mb-1 text-center" style={{
            fontFamily: 'Orbitron, monospace',
            color: '#8ab4f8',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            letterSpacing: '1.5px'
          }}>
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
          <StatBox label="TOTAL AUDITS" value={totalAudits} />
          <StatBox label="TOTAL RISKS" value={totalRisks} />
          <StatBox label="COVERAGE" value={`${coverage}%`} pulse />
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
  const [searchQuery, setSearchQuery] = useState('');

  const displayText = selectedIds.size === 0
    ? 'All selected'
    : selectedIds.size === options.length
    ? 'All selected'
    : `${selectedIds.size} selected`;

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    filteredOptions.forEach(option => {
      if (!selectedIds.has(option.id)) {
        onToggle(option.id);
      }
    });
  };

  const handleDeselectAll = () => {
    filteredOptions.forEach(option => {
      if (selectedIds.has(option.id)) {
        onToggle(option.id);
      }
    });
  };

  return (
    <div className="relative">
      <div className="text-sm uppercase tracking-widest font-bold mb-1 text-center" style={{
        fontFamily: 'Orbitron, monospace',
        color: '#8ab4f8',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        letterSpacing: '1.5px'
      }}>
        {title}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="panel-outset px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors min-w-[140px] flex items-center justify-between"
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
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[250px]" style={{
            background: 'linear-gradient(135deg, #2a2a2f 0%, #1a1a1f 100%)',
            border: '2px solid #4a4a4f',
            borderStyle: 'inset',
            borderRadius: '3px',
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(60,60,60,0.3), 0 4px 12px rgba(0,0,0,0.8)'
          }}>
            {/* Search Bar */}
            <div className="p-2 border-b-2 border-gray-700/50">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm rounded text-gray-300 placeholder-gray-600 focus:outline-none"
                style={{
                  background: '#1a1a1f',
                  border: '2px solid #3a3a3f',
                  borderStyle: 'inset',
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between px-3 py-2 border-b-2 border-gray-700/50" style={{
              background: 'linear-gradient(135deg, #252528 0%, #1f1f22 100%)'
            }}>
              <button
                onClick={handleSelectAll}
                className="text-xs hover:text-av-primary/80 uppercase tracking-wide px-2 py-1 rounded transition-colors"
                style={{
                  color: '#00ffdd',
                  fontFamily: 'Orbitron, monospace'
                }}
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs hover:text-gray-300 uppercase tracking-wide px-2 py-1 rounded transition-colors"
                style={{
                  color: '#6a6a6f',
                  fontFamily: 'Orbitron, monospace'
                }}
              >
                Deselect All
              </button>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">No matches</div>
              ) : (
                filteredOptions.map(option => (
                  <label
                    key={option.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-700/30 cursor-pointer border-b border-gray-700/30 last:border-b-0 transition-colors"
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
  pulse?: boolean;
}

function StatBox({ label, value, pulse = false }: StatBoxProps) {
  return (
    <div className="relative panel-outset px-4 py-2 min-w-[100px] text-center">
      {/* Corner rivets (6px) */}
      <div className="absolute top-0.5 left-0.5 w-[6px] h-[6px] rivet" />
      <div className="absolute top-0.5 right-0.5 w-[6px] h-[6px] rivet" />
      <div className="absolute bottom-0.5 left-0.5 w-[6px] h-[6px] rivet" />
      <div className="absolute bottom-0.5 right-0.5 w-[6px] h-[6px] rivet" />

      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </div>
      <div className={`text-xl font-bold ${pulse ? 'pulse-text' : ''}`} style={{
        fontFamily: 'Orbitron, monospace',
        color: '#00ffdd',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        letterSpacing: '0.5px'
      }}>
        {value}
      </div>
    </div>
  );
}
