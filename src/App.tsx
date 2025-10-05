/**
 * AuditVerse Application Root
 *
 * Main application component that handles:
 * - Data loading (WelcomeScreen)
 * - Graph visualization (coming in Phase 5)
 */

import { useState, useEffect, useMemo } from 'react';
import { WelcomeScreen } from './components/upload/WelcomeScreen';
import { ForceGraph3DComponent } from './components/graph/ForceGraph3D';
import { GraphLegend } from './components/graph/GraphLegend';
import { NodeTooltip } from './components/graph/NodeTooltip';
import { DetailsPanel } from './components/panels/DetailsPanel';
import { FilterSidebar } from './components/filters/FilterSidebar';
import { StatsPanel } from './components/panels/StatsPanel';
import { TimelineControls } from './components/timeline/TimelineControls';
import { ExportModal } from './components/panels/ExportModal';
import { useFilters } from './hooks/useFilters';
import { useTemporalFilter } from './hooks/useTemporalFilter';
import { applyPresetView } from './lib/presetViews';
import { getDateRange } from './lib/temporalFilter';
import { useGraphStore } from './store/graphStore';
import type { Node, TemporalDataset } from './types';

function App() {
  const [rawGraphData, setRawGraphData] = useState<TemporalDataset | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);

  const activePreset = useGraphStore(state => state.activePreset);
  const setDateRange = useGraphStore(state => state.setDateRange);

  // Initialize timeline date range when data loads
  useEffect(() => {
    if (rawGraphData?.events && rawGraphData.events.length > 0) {
      const { min, max } = getDateRange(rawGraphData);
      setDateRange(min, max);
    }
  }, [rawGraphData, setDateRange]);

  // Apply temporal filtering first
  const temporalData = useTemporalFilter(rawGraphData);

  // Then apply preset view
  const presetData = useMemo(() => {
    if (!activePreset || activePreset === 'default') return temporalData;
    const result = applyPresetView(activePreset, temporalData);
    return result.data;
  }, [temporalData, activePreset]);

  // Finally apply user filters
  const graphData = useFilters(presetData);

  // Get preset message
  const presetMessage = useMemo(() => {
    if (!activePreset || activePreset === 'default') return null;
    return applyPresetView(activePreset, temporalData).message;
  }, [temporalData, activePreset]);

  const hasTemporalData = rawGraphData?.events && rawGraphData.events.length > 0;

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard support - ESC to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNode) {
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  if (!rawGraphData) {
    return <WelcomeScreen onDataLoaded={setRawGraphData} />;
  }

  // Main graph view with 3D visualization
  return (
    <div className="min-h-screen bg-av-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 glass-panel border-b border-av-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-av-primary">AuditVerse</h1>

            <StatsPanel
              rawData={rawGraphData || { nodes: [], links: [] }}
              filteredData={graphData}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-secondary px-4 py-2 rounded text-sm font-semibold"
            >
              Export
            </button>
            <button
              onClick={() => setRawGraphData(null)}
              className="btn-secondary px-4 py-2 rounded text-sm font-semibold"
            >
              Load Different Data
            </button>
          </div>
        </div>
      </div>

      {/* 3D Graph */}
      <div className="w-full h-screen">
        <ForceGraph3DComponent
          data={graphData}
          onNodeClick={setSelectedNode}
          onNodeHover={setHoveredNode}
          selectedNodeId={selectedNode?.id || null}
        />
      </div>

      {/* Hover tooltip */}
      <NodeTooltip
        node={hoveredNode}
        x={mousePosition.x}
        y={mousePosition.y}
      />

      {/* Preset Message (below header) */}
      {presetMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 mt-4">
          <div className="glass-panel px-4 py-2 border border-av-primary max-w-2xl">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-av-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-300">{presetMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Sidebar (top-left) */}
      <FilterSidebar rawData={rawGraphData} filteredData={graphData} />

      {/* Legend (top-right) */}
      <GraphLegend className="absolute top-20 right-4 border border-av-border" />

      {/* Details Panel (bottom-left) */}
      <DetailsPanel
        node={selectedNode}
        graphData={rawGraphData || { nodes: [], links: [] }}
        onClose={() => setSelectedNode(null)}
        onNodeNavigate={(nodeId) => {
          const node = rawGraphData?.nodes.find(n => n.id === nodeId);
          if (node) setSelectedNode(node);
        }}
      />

      {/* Timeline Controls (bottom-center, if temporal data) */}
      {hasTemporalData && <TimelineControls />}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          data={graphData}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
