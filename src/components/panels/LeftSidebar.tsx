/**
 * Left Sidebar Component
 *
 * Contains:
 * - Risk View Mode toggle (Residual vs Inherent)
 * - Entity Layer toggles
 * - Risk Threshold slider
 * - Link Strength slider
 */

import { useGraphStore } from '@/store/graphStore';
import type { GraphData, NodeType } from '@/types';

interface LeftSidebarProps {
  rawData: GraphData;
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

const ENTITY_TYPE_COLORS: Record<NodeType, string> = {
  risk: 'bg-pink-500',
  control: 'bg-cyan-500',
  audit: 'bg-orange-500',
  issue: 'bg-yellow-500',
  incident: 'bg-pink-500',
  standard: 'bg-purple-500',
  businessUnit: 'bg-teal-500'
};

export function LeftSidebar({ rawData }: LeftSidebarProps) {
  const {
    riskViewMode,
    setRiskViewMode,
    activeEntityLayers,
    toggleEntityLayer,
    riskThreshold,
    setRiskThreshold,
    linkStrength,
    setLinkStrength
  } = useGraphStore();

  return (
    <div className="w-56 h-full bg-gray-900/95 border-r border-av-border/50 overflow-y-auto p-4 space-y-4">
      {/* Risk View Mode */}
      <div className="bg-gray-800/40 border border-av-primary/30 rounded p-3">
        <h3 className="text-av-primary text-xs font-bold uppercase tracking-wider mb-3">
          Risk View Mode
        </h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
              riskViewMode === 'residual' ? 'bg-av-primary' : 'bg-gray-600'
            }`}
            onClick={() => setRiskViewMode(riskViewMode === 'residual' ? 'inherent' : 'residual')}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                riskViewMode === 'residual' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-xs text-gray-300">
            {riskViewMode === 'residual' ? 'Residual Risk (with controls)' : 'Inherent Risk'}
          </span>
        </div>
      </div>

      {/* Entity Layers */}
      <div className="bg-gray-800/40 border border-av-primary/30 rounded p-3">
        <h3 className="text-av-primary text-xs font-bold uppercase tracking-wider mb-3">
          Entity Layers
        </h3>
        <div className="space-y-1.5">
          {(Object.keys(ENTITY_TYPE_LABELS) as NodeType[]).map(type => {
            const count = rawData.nodes.filter(n => n.type === type).length;
            const isActive = activeEntityLayers.has(type);

            return (
              <button
                key={type}
                onClick={() => toggleEntityLayer(type)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all ${
                  isActive
                    ? 'bg-gray-700/50 text-gray-200'
                    : 'bg-gray-900/30 text-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${ENTITY_TYPE_COLORS[type]}`} />
                  <span>{ENTITY_TYPE_LABELS[type]}</span>
                </div>
                <span className="text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/40 border border-av-primary/30 rounded p-3">
        <h3 className="text-av-primary text-xs font-bold uppercase tracking-wider mb-3">
          Filters
        </h3>

        {/* Risk Threshold */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Risk Threshold</span>
            <span className="text-xs text-av-primary font-bold">{riskThreshold}</span>
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
          <div className="flex justify-between text-[9px] text-gray-600 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Link Strength */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Link Strength</span>
            <span className="text-xs text-av-primary font-bold">{linkStrength.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={linkStrength}
            onChange={(e) => setLinkStrength(Number(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-1">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
