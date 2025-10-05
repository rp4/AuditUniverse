/**
 * Filter Sidebar Component
 *
 * Contains all filtering controls:
 * - Entity layer toggles
 * - Audit filter
 * - Business unit filter
 * - Standard filter
 * - Risk type filter
 * - Risk threshold slider
 * - Search box
 * - Clear all filters button
 */

import { useMemo } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { MultiSelectFilter } from '@/components/shared/MultiSelectFilter';
import { PresetFilter } from './PresetFilter';
import type { GraphData, NodeType } from '@/types';

interface FilterSidebarProps {
  rawData: GraphData;
  filteredData: GraphData;
}

const ENTITY_TYPE_LABELS: Record<NodeType, string> = {
  risk: 'Risks',
  control: 'Controls',
  audit: 'Audits',
  issue: 'Issues',
  incident: 'Incidents',
  standard: 'Standards',
  businessUnit: 'Business Units'
};

export function FilterSidebar({ rawData, filteredData }: FilterSidebarProps) {
  const {
    activeEntityLayers,
    toggleEntityLayer,
    selectedAudits,
    addSelectedAudit,
    removeSelectedAudit,
    clearSelectedAudits,
    selectedUnits,
    addSelectedUnit,
    removeSelectedUnit,
    clearSelectedUnits,
    selectedStandards,
    addSelectedStandard,
    removeSelectedStandard,
    clearSelectedStandards,
    selectedRiskTypes,
    addSelectedRiskType,
    removeSelectedRiskType,
    clearSelectedRiskTypes,
    riskThreshold,
    setRiskThreshold,
    searchQuery,
    setSearchQuery,
    resetFilters
  } = useGraphStore();

  // Extract unique audits from raw data
  const auditOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'audit')
      .map(n => ({
        id: n.id,
        label: n.name,
        count: rawData.links.filter(l =>
          l.type === 'assessed_by' &&
          (typeof l.source === 'string' ? l.source : (l.source as any).id) === n.id
        ).length
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique business units
  const unitOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'businessUnit')
      .map(n => ({
        id: n.id,
        label: n.name,
        count: rawData.links.filter(l =>
          l.type === 'owned_by' &&
          (typeof l.source === 'string' ? l.source : (l.source as any).id) === n.id
        ).length
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique standards
  const standardOptions = useMemo(() => {
    return rawData.nodes
      .filter(n => n.type === 'standard')
      .map(n => ({
        id: n.id,
        label: n.name,
        count: rawData.links.filter(l =>
          l.type === 'requires' &&
          (typeof l.source === 'string' ? l.source : (l.source as any).id) === n.id
        ).length
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Extract unique risk types (categories)
  const riskTypeOptions = useMemo(() => {
    const categories = new Map<string, number>();
    rawData.nodes
      .filter(n => n.type === 'risk')
      .forEach(n => {
        const category = (n as any).category || 'unknown';
        categories.set(category, (categories.get(category) || 0) + 1);
      });

    return Array.from(categories.entries())
      .map(([category, count]) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rawData]);

  // Count active filters
  const activeFilterCount =
    selectedAudits.size +
    selectedUnits.size +
    selectedStandards.size +
    selectedRiskTypes.size +
    (riskThreshold > 0 ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (activeEntityLayers.size > 0 && activeEntityLayers.size < 7 ? 1 : 0);

  return (
    <div className="absolute top-20 left-4 w-80 glass-panel border border-av-border max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-av-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-av-primary">Filters</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Search Box */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-3 py-2 bg-av-panel-dark border border-av-border rounded text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-av-primary"
        />
      </div>

      {/* Preset Views */}
      <div className="p-3 border-b border-av-border">
        <div className="text-sm font-semibold text-gray-300 mb-2">Preset Views</div>
        <PresetFilter />
      </div>

      {/* Entity Layer Toggles */}
      <div className="border-b border-av-border p-3">
        <div className="text-sm font-semibold text-gray-300 mb-2">Show/Hide Types</div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ENTITY_TYPE_LABELS) as NodeType[]).map(type => {
            const count = rawData.nodes.filter(n => n.type === type).length;
            const isActive = activeEntityLayers.has(type);

            return (
              <button
                key={type}
                onClick={() => toggleEntityLayer(type)}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-av-primary/20 text-av-primary border border-av-primary'
                    : 'bg-av-panel-dark text-gray-500 border border-av-border'
                }`}
              >
                <div>{ENTITY_TYPE_LABELS[type]}</div>
                <div className="text-[10px] opacity-70">{count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Filter */}
      {auditOptions.length > 0 && (
        <MultiSelectFilter
          title="Audits"
          options={auditOptions}
          selectedIds={selectedAudits}
          onToggle={(id) => {
            if (selectedAudits.has(id)) {
              removeSelectedAudit(id);
            } else {
              addSelectedAudit(id);
            }
          }}
          onSelectAll={() => auditOptions.forEach(opt => addSelectedAudit(opt.id))}
          onClearAll={clearSelectedAudits}
        />
      )}

      {/* Business Unit Filter */}
      {unitOptions.length > 0 && (
        <MultiSelectFilter
          title="Business Units"
          options={unitOptions}
          selectedIds={selectedUnits}
          onToggle={(id) => {
            if (selectedUnits.has(id)) {
              removeSelectedUnit(id);
            } else {
              addSelectedUnit(id);
            }
          }}
          onSelectAll={() => unitOptions.forEach(opt => addSelectedUnit(opt.id))}
          onClearAll={clearSelectedUnits}
        />
      )}

      {/* Standard Filter */}
      {standardOptions.length > 0 && (
        <MultiSelectFilter
          title="Standards"
          options={standardOptions}
          selectedIds={selectedStandards}
          onToggle={(id) => {
            if (selectedStandards.has(id)) {
              removeSelectedStandard(id);
            } else {
              addSelectedStandard(id);
            }
          }}
          onSelectAll={() => standardOptions.forEach(opt => addSelectedStandard(opt.id))}
          onClearAll={clearSelectedStandards}
        />
      )}

      {/* Risk Type Filter */}
      {riskTypeOptions.length > 0 && (
        <MultiSelectFilter
          title="Risk Categories"
          options={riskTypeOptions}
          selectedIds={selectedRiskTypes}
          onToggle={(id) => {
            if (selectedRiskTypes.has(id)) {
              removeSelectedRiskType(id);
            } else {
              addSelectedRiskType(id);
            }
          }}
          onSelectAll={() => riskTypeOptions.forEach(opt => addSelectedRiskType(opt.id))}
          onClearAll={clearSelectedRiskTypes}
        />
      )}

      {/* Risk Threshold Slider */}
      <div className="p-3 border-b border-av-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">
            Min Risk Rating
          </span>
          <span className="text-xs text-av-primary">
            {riskThreshold > 0 ? riskThreshold : 'All'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={riskThreshold}
          onChange={(e) => setRiskThreshold(Number(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Results Count */}
      <div className="p-3 bg-av-panel-dark text-center">
        <div className="text-sm text-gray-400">
          Showing <span className="text-av-primary font-semibold">{filteredData.nodes.length}</span> of{' '}
          <span className="text-gray-300">{rawData.nodes.length}</span> nodes
        </div>
      </div>
    </div>
  );
}
