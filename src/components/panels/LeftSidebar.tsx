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
  risk: 'bg-red-500',
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
    showRiskLabels,
    setShowRiskLabels,
    activeEntityLayers,
    toggleEntityLayer,
    likelihoodThreshold,
    setLikelihoodThreshold,
    severityThreshold,
    setSeverityThreshold,
    linkStrength,
    setLinkStrength
  } = useGraphStore();

  return (
    <div className="relative w-56 h-full metal-panel overflow-y-auto p-4 space-y-4" style={{
      borderRight: '5px solid #4a4a4f',
      borderRightStyle: 'groove',
      boxShadow: 'inset -3px 0 10px rgba(0,0,0,0.8), inset 3px 0 10px rgba(80,80,80,0.3), 5px 0 15px rgba(0,0,0,0.6)'
    }}>
      {/* Vertical label on left edge */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -rotate-90 origin-right text-[10px] uppercase tracking-widest font-bold pr-2" style={{
        fontFamily: 'Orbitron, monospace',
        color: '#00ffcc',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        letterSpacing: '1.5px'
      }}>
        Severity
      </div>
      {/* Risk View Mode */}
      <div className="relative panel-outset p-3">
        {/* Corner rivets (4px) */}
        <div className="absolute top-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute top-0.5 right-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 right-0.5 w-[4px] h-[4px] rivet" />

        <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-center" style={{
          fontFamily: 'Orbitron, monospace',
          color: '#8ab4f8',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: '1.5px'
        }}>
          Risk View Mode
        </h3>
        <div className="space-y-3">
          {/* Risk Type Toggle */}
          <div className="flex items-center space-x-2">
            {/* Industrial Toggle Track */}
            <div
              className="relative w-12 h-6 cursor-pointer transition-all"
              onClick={() => setRiskViewMode(riskViewMode === 'residual' ? 'inherent' : 'residual')}
              style={{
                background: '#1a1a1f',
                border: '2px solid #3a3a3f',
                borderStyle: 'inset',
                borderRadius: '3px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {/* Industrial Sliding Thumb */}
              <div
                className={`absolute top-0.5 w-5 h-4 transition-all duration-300`}
                style={{
                  background: '#5a5a5f',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, #7a7a7f, #3a3a3f)',
                  border: '2px solid #4a4a4f',
                  borderStyle: 'outset',
                  borderRadius: '2px',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 1px rgba(0,0,0,0.3)',
                  transform: riskViewMode === 'residual' ? 'translateX(24px)' : 'translateX(2px)'
                }}
              />
            </div>
            <span className="text-xs text-gray-300">
              {riskViewMode === 'residual' ? 'Residual Risk' : 'Inherent Risk'}
            </span>
          </div>

          {/* Show Labels Toggle */}
          <div className="flex items-center space-x-2">
            {/* Industrial Toggle Track */}
            <div
              className="relative w-12 h-6 cursor-pointer transition-all"
              onClick={() => setShowRiskLabels(!showRiskLabels)}
              style={{
                background: '#1a1a1f',
                border: '2px solid #3a3a3f',
                borderStyle: 'inset',
                borderRadius: '3px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {/* Industrial Sliding Thumb */}
              <div
                className={`absolute top-0.5 w-5 h-4 transition-all duration-300`}
                style={{
                  background: '#5a5a5f',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, #7a7a7f, #3a3a3f)',
                  border: '2px solid #4a4a4f',
                  borderStyle: 'outset',
                  borderRadius: '2px',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 1px rgba(0,0,0,0.3)',
                  transform: showRiskLabels ? 'translateX(24px)' : 'translateX(2px)'
                }}
              />
            </div>
            <span className="text-xs text-gray-300">
              {showRiskLabels ? 'Labels On' : 'Labels Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Entity Layers */}
      <div className="relative panel-outset p-3">
        {/* Corner rivets (4px) */}
        <div className="absolute top-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute top-0.5 right-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 right-0.5 w-[4px] h-[4px] rivet" />

        <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-center" style={{
          fontFamily: 'Orbitron, monospace',
          color: '#8ab4f8',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: '1.5px'
        }}>
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
      <div className="relative panel-outset p-3">
        {/* Corner rivets (4px) */}
        <div className="absolute top-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute top-0.5 right-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 left-0.5 w-[4px] h-[4px] rivet" />
        <div className="absolute bottom-0.5 right-0.5 w-[4px] h-[4px] rivet" />

        <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-center" style={{
          fontFamily: 'Orbitron, monospace',
          color: '#8ab4f8',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: '1.5px'
        }}>
          Filters
        </h3>

        {/* Likelihood Threshold */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Likelihood</span>
            <span className="text-xs font-bold" style={{
              fontFamily: 'Orbitron, monospace',
              color: '#00ffdd',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>{likelihoodThreshold}</span>
          </div>
          {/* Color gradient visual indicator */}
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => {
              // Using the same color scale as getNodeColor in nodeShapes.ts
              // Light red (low likelihood) to dark red (high likelihood)
              const normalizedLikelihood = (value - 1) / 9; // 0 to 1
              const r = Math.round(255 - (normalizedLikelihood * 102)); // 255 -> 153
              const g = Math.round(204 - (normalizedLikelihood * 204)); // 204 -> 0
              const b = Math.round(221 - (normalizedLikelihood * 221)); // 221 -> 0
              const color = `rgb(${r}, ${g}, ${b})`;

              return (
                <div
                  key={value}
                  className="flex-1 h-3 rounded-sm border border-gray-800/50"
                  style={{ backgroundColor: color }}
                  title={`Likelihood ${value}`}
                />
              );
            })}
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={likelihoodThreshold}
            onChange={(e) => setLikelihoodThreshold(Number(e.target.value))}
            className="slider-industrial w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderStyle: 'inset',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Severity Threshold */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Severity</span>
            <span className="text-xs font-bold" style={{
              fontFamily: 'Orbitron, monospace',
              color: '#00ffdd',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>{severityThreshold}</span>
          </div>
          {/* Node size visual indicator */}
          <div className="flex items-center justify-between mb-2 px-2">
            {[0, 2, 4, 6, 8, 10].map(value => {
              // Using the same size scale as getSeveritySize (exponential: 3 + severity^1.5)
              const baseSize = 3 + Math.pow(value, 1.5);
              // Scale down for display (actual sizes range from 3 to ~34)
              const displaySize = Math.max(4, Math.min(20, baseSize * 0.6));

              return (
                <div
                  key={value}
                  className="rounded-full bg-cyan-500 border border-cyan-300"
                  style={{
                    width: `${displaySize}px`,
                    height: `${displaySize}px`,
                    boxShadow: '0 0 4px rgba(0, 255, 204, 0.4)'
                  }}
                  title={`Severity ${value}`}
                />
              );
            })}
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={severityThreshold}
            onChange={(e) => setSeverityThreshold(Number(e.target.value))}
            className="slider-industrial w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderStyle: 'inset',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Link Strength */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Link Strength</span>
            <span className="text-xs font-bold" style={{
              fontFamily: 'Orbitron, monospace',
              color: '#00ffdd',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>{linkStrength.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={linkStrength}
            onChange={(e) => setLinkStrength(Number(e.target.value))}
            className="slider-industrial w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderStyle: 'inset',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
            }}
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
